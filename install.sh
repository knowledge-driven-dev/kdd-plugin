#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/knowledge-driven-dev/kdd-plugin.git"
TEMP_DIR=$(mktemp -d)
KDD_VERSION_FILE=".kdd-version"

# Cleanup on exit
cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Print functions
print_header() {
    echo -e "\n${BLUE}============================================${NC}"
    echo -e "${BLUE}  KDD Plugin Installer${NC}"
    echo -e "${BLUE}============================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}→${NC} $1"
}

# Check if KDD is already installed
check_existing_installation() {
    if [ -f "$KDD_VERSION_FILE" ]; then
        local current_version=$(cat "$KDD_VERSION_FILE")
        print_warning "KDD is already installed (version $current_version)"
        echo ""
        read -p "Do you want to upgrade? (y/N) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Installation cancelled. Run upgrade.sh for upgrades."
            exit 0
        fi
        return 1
    fi
    return 0
}

# Clone the repository
clone_repo() {
    print_info "Downloading KDD plugin..."

    if command -v git &> /dev/null; then
        git clone --depth 1 "$REPO_URL" "$TEMP_DIR/kdd-plugin" 2>/dev/null || {
            print_error "Failed to clone repository"
            print_info "Trying alternative download method..."
            download_tarball
        }
    else
        download_tarball
    fi
}

# Alternative download method using curl
download_tarball() {
    local TARBALL_URL="https://github.com/knowledge-driven-dev/kdd-plugin/archive/refs/heads/main.tar.gz"

    if command -v curl &> /dev/null; then
        curl -sL "$TARBALL_URL" | tar xz -C "$TEMP_DIR"
        mv "$TEMP_DIR/kdd-plugin-main" "$TEMP_DIR/kdd-plugin"
    elif command -v wget &> /dev/null; then
        wget -qO- "$TARBALL_URL" | tar xz -C "$TEMP_DIR"
        mv "$TEMP_DIR/kdd-plugin-main" "$TEMP_DIR/kdd-plugin"
    else
        print_error "Neither git, curl, nor wget is available"
        exit 1
    fi
}

# Create directory if not exists
ensure_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        print_success "Created directory: $1"
    fi
}

# Copy files with backup
copy_with_backup() {
    local src="$1"
    local dest="$2"
    local backup="$3"

    if [ -f "$dest" ] && [ "$backup" = "true" ]; then
        cp "$dest" "${dest}.backup"
        print_warning "Backed up existing: $dest"
    fi

    cp "$src" "$dest"
}

# Install Claude rules
install_rules() {
    print_info "Installing Claude rules..."
    ensure_dir ".claude/rules"

    local count=0
    for file in "$TEMP_DIR/kdd-plugin/.claude/rules/kdd-"*.md; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")
            cp "$file" ".claude/rules/$filename"
            ((count++))
        fi
    done
    print_success "Installed $count rules"
}

# Install Claude agents
install_agents() {
    print_info "Installing Claude agents..."
    ensure_dir ".claude/agents"

    local count=0
    for file in "$TEMP_DIR/kdd-plugin/.claude/agents/kdd-"*.md; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")
            cp "$file" ".claude/agents/$filename"
            ((count++))
        fi
    done
    print_success "Installed $count agents"
}

# Install Claude skills
install_skills() {
    print_info "Installing Claude skills..."
    ensure_dir ".claude/skills"

    local count=0
    for dir in "$TEMP_DIR/kdd-plugin/.claude/skills/kdd-"*/; do
        if [ -d "$dir" ]; then
            local dirname=$(basename "$dir")
            local dest_dir=".claude/skills/$dirname"

            if [ -d "$dest_dir" ]; then
                print_warning "Skill exists, skipping: $dirname"
            else
                cp -r "$dir" "$dest_dir"
                ((count++))
            fi
        fi
    done
    print_success "Installed $count skills"
}

# Install KDD documentation and templates
install_kdd_docs() {
    print_info "Installing KDD documentation and templates..."
    ensure_dir "kdd"

    # Copy kdd.md
    if [ -f "$TEMP_DIR/kdd-plugin/kdd/kdd.md" ]; then
        cp "$TEMP_DIR/kdd-plugin/kdd/kdd.md" "kdd/kdd.md"
        print_success "Installed kdd/kdd.md"
    fi

    # Copy templates
    if [ -d "$TEMP_DIR/kdd-plugin/kdd/templates" ]; then
        ensure_dir "kdd/templates"
        cp -r "$TEMP_DIR/kdd-plugin/kdd/templates/"* "kdd/templates/"
        local count=$(ls -1 "kdd/templates/"*.md 2>/dev/null | wc -l)
        print_success "Installed $count templates"
    fi

    # Copy docs
    if [ -d "$TEMP_DIR/kdd-plugin/kdd/docs" ]; then
        ensure_dir "kdd/docs"
        cp -r "$TEMP_DIR/kdd-plugin/kdd/docs/"* "kdd/docs/"
        print_success "Installed KDD documentation"
    fi
}

# Create specs scaffold
create_specs_scaffold() {
    print_info "Creating specs scaffold..."

    if [ -d "specs" ]; then
        print_warning "specs/ directory already exists, preserving content"
        return
    fi

    # Create directory structure
    local dirs=(
        "specs/00-requirements/objectives"
        "specs/00-requirements/value-units"
        "specs/00-requirements/releases"
        "specs/00-requirements/decisions"
        "specs/01-domain/entities"
        "specs/01-domain/events"
        "specs/01-domain/rules"
        "specs/02-behavior/commands"
        "specs/02-behavior/queries"
        "specs/02-behavior/processes"
        "specs/02-behavior/policies"
        "specs/02-behavior/use-cases"
        "specs/03-experience/views"
        "specs/03-experience/components"
        "specs/03-experience/flows"
        "specs/04-verification/criteria"
        "specs/04-verification/examples"
        "specs/05-architecture"
    )

    for dir in "${dirs[@]}"; do
        mkdir -p "$dir"
        touch "$dir/.gitkeep"
    done

    print_success "Created specs scaffold with ${#dirs[@]} directories"
}

# Write version file
write_version() {
    local version=$(cat "$TEMP_DIR/kdd-plugin/VERSION" 2>/dev/null || echo "1.0.0")
    echo "$version" > "$KDD_VERSION_FILE"
    print_success "Installed KDD version $version"
}

# Print next steps
print_next_steps() {
    echo -e "\n${GREEN}============================================${NC}"
    echo -e "${GREEN}  Installation Complete!${NC}"
    echo -e "${GREEN}============================================${NC}\n"

    echo "Next steps:"
    echo ""
    echo "1. Start using KDD skills in Claude Code:"
    echo "   - /kdd-author - Create new specifications"
    echo "   - /kdd-review - Review existing specs"
    echo "   - /kdd-gaps   - Find missing documentation"
    echo ""
    echo "2. Read the methodology:"
    echo "   - kdd/kdd.md - Quick reference"
    echo "   - kdd/docs/  - Full documentation"
    echo ""
    echo "3. Start documenting:"
    echo "   - Your specs go in /specs"
    echo "   - Use templates from kdd/templates/"
    echo ""
    echo "For updates, run: curl -fsSL https://raw.githubusercontent.com/knowledge-driven-dev/kdd-plugin/main/upgrade.sh | bash"
}

# Main installation
main() {
    print_header

    # Check existing installation
    check_existing_installation || true

    # Download
    clone_repo

    # Install components
    install_rules
    install_agents
    install_skills
    install_kdd_docs
    create_specs_scaffold
    write_version

    # Done
    print_next_steps
}

# Run main
main "$@"
