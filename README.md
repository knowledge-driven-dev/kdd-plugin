# KDD Plugin for Claude Code

**Knowledge-Driven Development** - A methodology for maintaining living documentation that drives implementation.

## What is KDD?

KDD (Knowledge-Driven Development) is a documentation-first approach where:

- **Specifications are the source of truth** - Code is derived and regenerable
- **Documentation is living** - It evolves with the project
- **AI agents can read and write specs** - Making documentation actionable
- **Wiki-style linking** - Creates a navigable knowledge graph

## Installation

### Prerequisites

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and working
- `curl` or `git` available in your terminal

### Option A: One-line install (recommended)

Open a terminal, `cd` into **your project's root directory**, and run:

```bash
curl -fsSL https://raw.githubusercontent.com/knowledge-driven-dev/kdd-plugin/main/install.sh | bash
```

The installer will:
1. Download the latest KDD plugin
2. Copy rules, skills, agents, templates, and docs into your project
3. Create the `specs/` scaffold directory structure
4. Write a `.kdd-version` file to track the installed version

### Option B: Manual install (git clone)

```bash
# 1. Clone the plugin repo into a temporary location
git clone --depth 1 https://github.com/knowledge-driven-dev/kdd-plugin.git /tmp/kdd-plugin

# 2. cd into YOUR project
cd /path/to/your-project

# 3. Copy the components you need
cp -r /tmp/kdd-plugin/.claude/rules/kdd-*.md .claude/rules/
cp -r /tmp/kdd-plugin/.claude/skills/kdd-* .claude/skills/
cp -r /tmp/kdd-plugin/.claude/agents/kdd-*.md .claude/agents/
cp -r /tmp/kdd-plugin/kdd/ kdd/
cp -r /tmp/kdd-plugin/specs/ specs/  # only if you don't have a specs/ dir yet

# 4. Track the version
cp /tmp/kdd-plugin/VERSION .kdd-version

# 5. Clean up
rm -rf /tmp/kdd-plugin
```

### Verify installation

After installing, confirm these paths exist in your project:

```bash
ls .claude/rules/kdd-writing.md    # Rules loaded
ls kdd/kdd.md                      # Agent reference
ls kdd/templates/entity.template.md # Templates available
ls specs/01-domain/                 # Specs scaffold created
```

Then open Claude Code in your project. The KDD rules and skills will be active automatically.

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
├── specs/                  # Your specifications go here
│   ├── 00-requirements/
│   ├── 01-domain/
│   ├── 02-behavior/
│   ├── 03-experience/
│   ├── 04-verification/
│   └── 05-architecture/
└── .kdd-version            # Installed version tracker
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

## Upgrading

From your project root:

```bash
curl -fsSL https://raw.githubusercontent.com/knowledge-driven-dev/kdd-plugin/main/upgrade.sh | bash
```

The upgrade:
- Creates a timestamped backup of your current KDD files
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
