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

## [2.0.0] - 2026-02-09

### Added

- **Diataxis documentation structure** — Complete rewrite of `kdd/docs/`:
  - `start/` — What is KDD, why use it (2 files)
  - `guides/` — Role-specific guides for PM, Dev, Designer, QA, Tech Lead (5 files)
  - `tutorials/` — Step-by-step tutorials: first objective, use case, command, UI spec, spec-to-test (5 files)
  - `reference/` — Artifacts, cheatsheet, frontmatter, layers, naming, pipeline, status lifecycle, templates, tooling (9 files)
  - `concepts/` — Deep explanations: docs-as-code, knowledge graph, layers, traceability (4 files)
  - `workflows/` — Common recipes: adopt KDD, new feature, bug fix, change requirement, review specs (5 files)
  - `STYLE-GUIDE.md` — Writing conventions following Google Tech Writing + EARS
  - `faq.md` — Frequently asked questions
- **New rule**: `kdd-value-units.md` — Tracking implementation progress with Value Units
- **New template**: `value-unit.template.md` (updated with implementation tracking sections)
- **v1→v2 migration** in `upgrade.sh` — Automatically archives old flat docs when upgrading from 1.x
- **KDD automation scripts** — 4 toolsets copied from production:
  - `spec-validator/` — Validates spec frontmatter, structure, and semantics
  - `pipeline/` — 8-gate quality pipeline, scaffold generator, code mapping checker
  - `verification/` — Criteria extraction and test stub generation from specs
  - `sync-specs.ts` — LightRAG knowledge hub synchronization
  - `detect-ui-spec-changes.ts` — UI spec change detection in git staging
- **`kdd.config.ts`** — Project-specific configuration template for paths and naming conventions
- **`scripts/lib/config.ts`** — Shared config loader used by all scripts

### Changed

- `kdd.md` — Updated agent reference to match v2 structure and conventions
- All examples now use the generic "TaskFlow" domain (Proyecto, Tarea, Miembro, Sprint, Punto)
- Documentation is now framework-agnostic (no tech stack assumptions)
- Rule files updated with latest conventions from production usage
- `README.md` — Updated to reflect Diataxis structure
- `install.sh` — Now installs 12 rules, 22 templates, and automation scripts
- `upgrade.sh` — Now upgrades scripts (preserves `kdd.config.ts` user customizations)

### Removed

- Old flat documentation structure (archived to `kdd/docs/_archive/v1-plugin/`)

## [Unreleased]

### Planned
- npx installer for npm users
- VS Code extension integration
- GitHub Action for CI/CD checks
