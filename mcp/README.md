# MCP Integration (Optional)

The KDD Plugin can optionally integrate with a knowledge base service for semantic search across your specifications.

## What is KB MCP?

KB MCP (Knowledge Base Model Context Protocol) provides:

- **Semantic search** across all your KDD specifications
- **Entity relationships** - understand connections between artifacts
- **Gap detection** - find missing documentation
- **RAG support** - enhance AI agent context with relevant specs

## Setup

1. Copy the example configuration:
   ```bash
   cp mcp/kb-mcp.example.json .claude/mcp.json
   ```

2. Update the configuration with your KB service URL and API key

3. Restart Claude Code

## Available MCP Tools

When configured, these tools become available:

| Tool | Purpose |
|------|---------|
| `search_specs` | Semantic search across all specs |
| `get_entity_detail` | Get detailed info about an entity |
| `list_entity_types` | List all entity types in the knowledge graph |
| `check_health` | Verify connection to knowledge base |

## Usage Pattern

The recommended pattern is **Hybrid RAG + Local**:

1. **Discover** with RAG: Use `search_specs` to find relevant specs
2. **Read** locally: Fetch complete content from local files
3. **Implement**: Code based on local specs (source of truth)

```markdown
# Example workflow

1. DISCOVER: mcp__kb__search_specs("user authentication rules")
   → Returns: references to BR-AUTH-001.md, UC-001-Login.md...

2. READ: Glob to find exact paths, then Read each file

3. IMPLEMENT: Code based on local specs
```

## Without KB MCP

KDD works perfectly without KB MCP. You just won't have:
- Semantic search (use Glob + Grep instead)
- Auto-generated knowledge graphs
- AI-powered gap detection

The skills, rules, and templates work the same either way.

## Self-Hosting KB Service

If you want to run your own KB service:

1. See [@leored/kb-mcp](https://github.com/leored/kb-mcp) for the MCP server
2. Deploy the indexing service
3. Configure the connection

This is completely optional - KDD is designed to work standalone.
