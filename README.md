# KDD Plugin for Claude Code

**Knowledge-Driven Development** - A methodology for maintaining living documentation that drives implementation.

## What is KDD?

KDD (Knowledge-Driven Development) is a documentation-first approach where:

- **Specifications are the source of truth** - Code is derived and regenerable
- **Documentation is living** - It evolves with the project
- **AI agents can read and write specs** - Making documentation actionable
- **Wiki-style linking** - Creates a navigable knowledge graph

## Quick Install

```bash
curl -fsSL https://raw.githubusercontent.com/leored/kdd-plugin/main/install.sh | bash
```

## What Gets Installed

```
your-project/
├── .claude/
│   ├── rules/kdd-*.md      # 12 writing convention rules
│   ├── skills/kdd-*/       # 7 interactive skills
│   └── agents/             # Requirements analyst agent
├── kdd/
│   ├── kdd.md              # Methodology reference (agent context)
│   ├── templates/          # 22 specification templates
│   └── docs/               # Full documentation (Diataxis)
│       ├── start/          # Getting started
│       ├── guides/         # Role-based guides (PM, Dev, QA...)
│       ├── tutorials/      # Step-by-step tutorials
│       ├── reference/      # Artifact & naming reference
│       ├── concepts/       # Deep explanations
│       └── workflows/      # Common workflow recipes
└── specs/                  # Your specifications go here
    ├── 00-requirements/
    ├── 01-domain/
    ├── 02-behavior/
    ├── 03-experience/
    ├── 04-verification/
    └── 05-architecture/
```

## Available Skills

After installation, you can use these skills in Claude Code:

| Skill | Command | Purpose |
|-------|---------|---------|
| Author | `/kdd-author` | Create new specifications conversationally |
| Review | `/kdd-review` | Review specs for quality and completeness |
| Gaps | `/kdd-gaps` | Find missing documentation |
| Fix | `/kdd-fix` | Auto-fix technical issues in specs |
| Iterate | `/kdd-iterate` | Apply changes to existing specs |
| Trace | `/kdd-trace` | View traceability between artifacts |

## Specs Layer Structure

KDD organizes specifications in layers with clear dependencies:

```
00-requirements  →  HIGH-LEVEL INPUT (PRD, objectives, ADRs)
       ↓
01-domain        →  FOUNDATION (entities, rules, events)
       ↓
02-behavior      →  ORCHESTRATION (commands, queries, use-cases)
       ↓
03-experience    →  PRESENTATION (views, flows, components)
       ↓
04-verification  →  VALIDATION (acceptance criteria, tests)
       ↓
05-architecture  →  TECHNICAL (infrastructure decisions)
```

**Rule**: Higher layers CAN reference lower layers. Lower layers SHOULD NOT reference higher.

## Artifact Types

| Type | Prefix | Example | Location |
|------|--------|---------|----------|
| Entity | - | `Proyecto.md` | `01-domain/entities/` |
| Event | EVT | `EVT-Proyecto-Creado.md` | `01-domain/events/` |
| Business Rule | BR | `BR-PROYECTO-001.md` | `01-domain/rules/` |
| Command | CMD | `CMD-001-CrearProyecto.md` | `02-behavior/commands/` |
| Query | QRY | `QRY-001-ObtenerProyecto.md` | `02-behavior/queries/` |
| Use Case | UC | `UC-001-Crear-Proyecto.md` | `02-behavior/use-cases/` |
| UI View | VIEW | `VIEW-Dashboard.md` | `03-experience/views/` |
| UI Component | UI | `UI-ProjectCard.md` | `03-experience/components/` |
| UI Flow | FLOW | `FLOW-Onboarding.md` | `03-experience/flows/` |
| Requirement | REQ | `REQ-001-Login.md` | `04-verification/criteria/` |

## Wiki-Link Syntax

KDD uses Obsidian-compatible wiki-links:

```markdown
[[Proyecto]]                    # Link to entity
[[Proyecto|proyectos]]          # Link with display alias
[[BR-PROYECTO-001]]             # Link to business rule
[[UC-001-Crear-Proyecto]]       # Link to use case
```

## Upgrading

```bash
curl -fsSL https://raw.githubusercontent.com/leored/kdd-plugin/main/upgrade.sh | bash
```

The upgrade:
- Always overwrites: rules, templates, documentation
- Replaces with backup: skills
- Never touches: your `/specs` directory

## Documentation

Documentation follows the [Diataxis](https://diataxis.fr/) framework:

| Section | Path | Purpose |
|---------|------|---------|
| Start | `kdd/docs/start/` | What is KDD, why use it |
| Guides | `kdd/docs/guides/` | Role-specific how-to (PM, Dev, Designer, QA, Tech Lead) |
| Tutorials | `kdd/docs/tutorials/` | Step-by-step learning |
| Reference | `kdd/docs/reference/` | Artifacts, naming, frontmatter, layers |
| Concepts | `kdd/docs/concepts/` | Deep explanations (traceability, knowledge graph) |
| Workflows | `kdd/docs/workflows/` | Common task recipes (new feature, bug fix, etc.) |

- Quick reference (for agents): `kdd/kdd.md`
- Templates: `kdd/templates/`
- Style guide: `kdd/docs/STYLE-GUIDE.md`

## Requirements

- Claude Code CLI
- `curl` or `wget` for installation
- `git` (optional, for cloning)

## License

MIT License - see [LICENSE](LICENSE)

## Contributing

Contributions welcome! Please read the methodology documentation first.

1. Fork the repository
2. Create your feature branch
3. Make changes following KDD conventions
4. Submit a pull request

## Credits

KDD methodology developed by Leopoldo Estrada.
