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
BACKUP_DIR=".kdd-backup-$(date +%Y%m%d-%H%M%S)"

# Cleanup on exit
cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Print functions
print_header() {
    echo -e "\n${BLUE}============================================${NC}"
    echo -e "${BLUE}  KDD Plugin Upgrader${NC}"
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

# Check if KDD is installed
check_installation() {
    if [ ! -f "$KDD_VERSION_FILE" ]; then
        print_error "KDD is not installed in this project"
        echo ""
        echo "Run the installer first:"
        echo "curl -fsSL https://raw.githubusercontent.com/knowledge-driven-dev/kdd-plugin/main/install.sh | bash"
        exit 1
    fi

    local current_version=$(cat "$KDD_VERSION_FILE")
    print_info "Current version: $current_version"
}

# Clone the repository
clone_repo() {
    print_info "Downloading latest KDD plugin..."

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

# Compare versions
check_version() {
    local current_version=$(cat "$KDD_VERSION_FILE")
    local new_version=$(cat "$TEMP_DIR/kdd-plugin/VERSION" 2>/dev/null || echo "1.0.0")

    print_info "New version: $new_version"

    if [ "$current_version" = "$new_version" ]; then
        print_warning "Already on the latest version ($current_version)"
        read -p "Force upgrade anyway? (y/N) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Upgrade cancelled."
            exit 0
        fi
    fi

    # Show changelog if available
    if [ -f "$TEMP_DIR/kdd-plugin/CHANGELOG.md" ]; then
        echo ""
        print_info "Recent changes:"
        echo "----------------------------------------"
        head -50 "$TEMP_DIR/kdd-plugin/CHANGELOG.md" | tail -45
        echo "----------------------------------------"
        echo ""
    fi

    read -p "Proceed with upgrade? (Y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        echo "Upgrade cancelled."
        exit 0
    fi
}

# Create backup
create_backup() {
    print_info "Creating backup in $BACKUP_DIR..."
    mkdir -p "$BACKUP_DIR"

    # Backup rules
    if [ -d ".claude/rules" ]; then
        mkdir -p "$BACKUP_DIR/.claude/rules"
        cp .claude/rules/kdd-*.md "$BACKUP_DIR/.claude/rules/" 2>/dev/null || true
    fi

    # Backup skills
    if [ -d ".claude/skills" ]; then
        mkdir -p "$BACKUP_DIR/.claude/skills"
        for dir in .claude/skills/kdd-*/; do
            if [ -d "$dir" ]; then
                cp -r "$dir" "$BACKUP_DIR/.claude/skills/"
            fi
        done
    fi

    # Backup agents
    if [ -d ".claude/agents" ]; then
        mkdir -p "$BACKUP_DIR/.claude/agents"
        cp .claude/agents/kdd-*.md "$BACKUP_DIR/.claude/agents/" 2>/dev/null || true
    fi

    # Backup kdd docs (not templates - those should be overwritten)
    if [ -d "kdd" ]; then
        mkdir -p "$BACKUP_DIR/kdd"
        cp -r kdd/* "$BACKUP_DIR/kdd/" 2>/dev/null || true
    fi

    print_success "Backup created in $BACKUP_DIR"
}

# Upgrade rules (always overwrite)
upgrade_rules() {
    print_info "Upgrading rules..."

    local count=0
    for file in "$TEMP_DIR/kdd-plugin/.claude/rules/kdd-"*.md; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")
            cp "$file" ".claude/rules/$filename"
            ((count++))
        fi
    done
    print_success "Updated $count rules"
}

# Upgrade agents (always overwrite)
upgrade_agents() {
    print_info "Upgrading agents..."

    local count=0
    for file in "$TEMP_DIR/kdd-plugin/.claude/agents/kdd-"*.md; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")
            cp "$file" ".claude/agents/$filename"
            ((count++))
        fi
    done
    print_success "Updated $count agents"
}

# Upgrade skills (replace + backup)
upgrade_skills() {
    print_info "Upgrading skills..."

    local count=0
    for dir in "$TEMP_DIR/kdd-plugin/.claude/skills/kdd-"*/; do
        if [ -d "$dir" ]; then
            local dirname=$(basename "$dir")
            local dest_dir=".claude/skills/$dirname"

            # Remove old skill and replace
            rm -rf "$dest_dir"
            cp -r "$dir" "$dest_dir"
            ((count++))
        fi
    done
    print_success "Updated $count skills"
}

# Upgrade templates (always overwrite)
upgrade_templates() {
    print_info "Upgrading templates..."

    if [ -d "$TEMP_DIR/kdd-plugin/kdd/templates" ]; then
        cp -r "$TEMP_DIR/kdd-plugin/kdd/templates/"* "kdd/templates/"
        local count=$(ls -1 "kdd/templates/"*.md 2>/dev/null | wc -l)
        print_success "Updated $count templates"
    fi
}

# Migrate v1 docs to v2 Diataxis structure
migrate_v1_to_v2() {
    local current_version=$(cat "$KDD_VERSION_FILE")

    # Only run migration if upgrading from 1.x
    if [[ "$current_version" == 1.* ]]; then
        print_info "Migrating docs from v1 flat structure to v2 Diataxis..."

        # Archive old flat docs if they exist
        local old_docs=("kdd/docs/Introducción a KDD.md" "kdd/docs/convenciones-escritura.md"
                        "kdd/docs/feature-discovery.md" "kdd/docs/graph.md"
                        "kdd/docs/indice-entidades.md" "kdd/docs/multi-domain.md"
                        "kdd/docs/validacion-especificaciones.md")

        local has_old_docs=false
        for f in "${old_docs[@]}"; do
            if [ -f "$f" ]; then
                has_old_docs=true
                break
            fi
        done

        if [ "$has_old_docs" = true ]; then
            ensure_dir "kdd/docs/_archive/v1"
            for f in "${old_docs[@]}"; do
                if [ -f "$f" ]; then
                    mv "$f" "kdd/docs/_archive/v1/"
                fi
            done
            # Move old subdirs
            [ -d "kdd/docs/layers" ] && mv "kdd/docs/layers" "kdd/docs/_archive/v1/"
            [ -d "kdd/docs/v2" ] && mv "kdd/docs/v2" "kdd/docs/_archive/v1/"
            print_success "Archived v1 docs to kdd/docs/_archive/v1/"
        fi
    fi
}

# Upgrade docs (always overwrite)
upgrade_docs() {
    print_info "Upgrading documentation..."

    # Run v1→v2 migration if needed
    migrate_v1_to_v2

    # Update kdd.md
    if [ -f "$TEMP_DIR/kdd-plugin/kdd/kdd.md" ]; then
        cp "$TEMP_DIR/kdd-plugin/kdd/kdd.md" "kdd/kdd.md"
        print_success "Updated kdd/kdd.md"
    fi

    # Update docs (preserves _archive)
    if [ -d "$TEMP_DIR/kdd-plugin/kdd/docs" ]; then
        cp -r "$TEMP_DIR/kdd-plugin/kdd/docs/"* "kdd/docs/"
        print_success "Updated kdd/docs/ (Diataxis structure)"
    fi
}

# Update version
update_version() {
    local version=$(cat "$TEMP_DIR/kdd-plugin/VERSION" 2>/dev/null || echo "1.0.0")
    echo "$version" > "$KDD_VERSION_FILE"
    print_success "Version updated to $version"
}

# Print summary
print_summary() {
    echo -e "\n${GREEN}============================================${NC}"
    echo -e "${GREEN}  Upgrade Complete!${NC}"
    echo -e "${GREEN}============================================${NC}\n"

    echo "What was upgraded:"
    echo "  - Claude rules (overwritten)"
    echo "  - Claude agents (overwritten)"
    echo "  - Claude skills (replaced)"
    echo "  - KDD templates (overwritten)"
    echo "  - KDD documentation (overwritten)"
    echo ""
    echo "What was NOT touched:"
    echo "  - /specs directory (your specifications)"
    echo ""
    echo "Backup location: $BACKUP_DIR"
    echo ""
    echo "To restore from backup:"
    echo "  cp -r $BACKUP_DIR/.claude/* .claude/"
    echo "  cp -r $BACKUP_DIR/kdd/* kdd/"
}

# Main upgrade
main() {
    print_header

    # Check existing installation
    check_installation

    # Download latest
    clone_repo

    # Compare versions
    check_version

    # Create backup
    create_backup

    # Perform upgrades
    upgrade_rules
    upgrade_agents
    upgrade_skills
    upgrade_templates
    upgrade_docs
    update_version

    # Done
    print_summary
}

# Run main
main "$@"
