# Changelog

All notable changes to the KDD Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-02-02

### Added

- Initial release of KDD Plugin for Claude Code
- **Rules** (11 files):
  - `kdd-writing.md` - General writing conventions
  - `kdd-domain-entities.md` - Entity documentation guidelines
  - `kdd-domain-events.md` - Event documentation guidelines
  - `kdd-domain-rules.md` - Business rule documentation
  - `kdd-behavior-usecases.md` - Use case documentation
  - `kdd-behavior-commands.md` - CQRS command documentation
  - `kdd-behavior-queries.md` - CQRS query documentation
  - `kdd-experience-views.md` - UI view documentation
  - `kdd-experience-components.md` - UI component documentation
  - `kdd-experience-flows.md` - UI flow documentation
  - `kdd-shared-policies.md` - Cross-cutting policies

- **Skills** (7 directories):
  - `kdd-init` - Initialize KDD in a project
  - `kdd-author` - Conversational spec authoring
  - `kdd-review` - Quality review of specs
  - `kdd-gaps` - Gap analysis and missing artifacts
  - `kdd-fix` - Auto-fix technical issues
  - `kdd-iterate` - Apply changes to existing specs
  - `kdd-trace` - Traceability matrix generation

- **Agent**:
  - `kdd-requirement-analyst` - Requirements discovery + KDD documentation

- **Templates** (21 files):
  - Domain: entity, event, rule
  - Behavior: command, query, use-case, process
  - Experience: ui-view, ui-component, ui-flow
  - Requirements: prd, objective, value-unit, release, adr
  - Verification: requirement
  - Architecture: implementation-charter

- **Documentation**:
  - `kdd.md` - Quick reference for agents
  - `docs/` - Full methodology documentation

- **Installation**:
  - `install.sh` - One-line installation script
  - `upgrade.sh` - Upgrade to latest version

### Notes

- This is the first public release extracted from a production project
- All examples have been generalized to remove project-specific references
- Templates and rules are designed to be language/framework agnostic

## [Unreleased]

### Planned
- npx installer for npm users
- Validation script for specs
- VS Code extension integration
- GitHub Action for CI/CD checks
