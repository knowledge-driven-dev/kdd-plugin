---
name: kdd-init
description: |
  Initialize KDD methodology in the current project.
  Installs rules, skills, templates, and creates the specs scaffold.
category: setup
triggers:
  - initialize kdd
  - setup kdd
  - install kdd
  - kdd init
---

# KDD Initialization

This skill initializes the KDD (Knowledge-Driven Development) methodology in your project.

## What Gets Installed

| Component | Location | Description |
|-----------|----------|-------------|
| Rules | `.claude/rules/kdd-*.md` | Writing conventions and guidelines |
| Skills | `.claude/skills/kdd-*/` | Interactive authoring tools |
| Agent | `.claude/agents/` | Requirements analyst agent |
| Templates | `kdd/templates/` | Specification templates |
| Documentation | `kdd/docs/` | Methodology documentation |
| Specs Scaffold | `specs/` | Directory structure for specifications |

## Quick Installation

Run this command in your terminal:

```bash
curl -fsSL https://raw.githubusercontent.com/leored/kdd-plugin/main/install.sh | bash
```

## Manual Installation

If you prefer to review before running:

```bash
# Download the installer
curl -O https://raw.githubusercontent.com/leored/kdd-plugin/main/install.sh

# Review it
cat install.sh

# Run it
bash install.sh
```

## After Installation

Verify the installation:

- [ ] `.claude/rules/kdd-*.md` files exist (11 rules)
- [ ] `.claude/skills/kdd-*/` directories exist (6 skills)
- [ ] `.claude/agents/kdd-requirement-analyst.md` exists
- [ ] `kdd/templates/` contains template files
- [ ] `kdd/kdd.md` exists (methodology reference)
- [ ] `specs/` directory structure is created
- [ ] `.kdd-version` file exists with version number

## Available KDD Skills After Install

| Skill | Purpose |
|-------|---------|
| `/kdd-author` | Create new specifications conversationally |
| `/kdd-review` | Review specs for quality and completeness |
| `/kdd-gaps` | Find missing documentation |
| `/kdd-fix` | Auto-fix technical issues in specs |
| `/kdd-iterate` | Apply changes to existing specs |
| `/kdd-trace` | View traceability between artifacts |

## Upgrading

To upgrade to the latest version:

```bash
curl -fsSL https://raw.githubusercontent.com/leored/kdd-plugin/main/upgrade.sh | bash
```

## Uninstalling

To remove KDD from your project:

```bash
# Remove Claude components
rm -rf .claude/rules/kdd-*.md
rm -rf .claude/skills/kdd-*/
rm -rf .claude/agents/kdd-*.md

# Remove KDD documentation (keep if you want templates)
rm -rf kdd/

# Remove version file
rm -f .kdd-version

# Keep specs/ - those are YOUR specifications!
```

## Troubleshooting

### Installation fails
- Ensure you have `curl` or `wget` installed
- Check your internet connection
- Try the manual installation method

### Skills not appearing
- Restart Claude Code
- Check that files are in `.claude/skills/kdd-*/SKILL.md`

### Permission denied
```bash
chmod +x install.sh && ./install.sh
```

## Learn More

- Methodology: `kdd/kdd.md`
- Full documentation: `kdd/docs/`
- Templates: `kdd/templates/`
