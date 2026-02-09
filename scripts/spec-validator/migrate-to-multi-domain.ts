#!/usr/bin/env bun
/**
 * KDD Multi-Domain Migration Script
 *
 * Migrates a monolithic KDD specs directory to multi-domain structure.
 *
 * Usage:
 *   bun run scripts/spec-validator/migrate-to-multi-domain.ts --analyze
 *   bun run scripts/spec-validator/migrate-to-multi-domain.ts --extract-domain billing --entities Invoice,Payment
 *   bun run scripts/spec-validator/migrate-to-multi-domain.ts --init-structure
 */

import { parseArgs } from 'util'
import { resolve, join, dirname, basename, relative } from 'path'
import { readdir, readFile, writeFile, mkdir, stat, copyFile, rename } from 'fs/promises'
import chalk from 'chalk'
import matter from 'gray-matter'
import { stringify as yamlStringify } from 'yaml'

const SPECS_DIR = resolve(import.meta.dir, '../../specs')

interface MigrationOptions {
  analyze: boolean
  initStructure: boolean
  extractDomain?: string
  entities?: string[]
  dryRun: boolean
  verbose: boolean
}

interface EntityInfo {
  name: string
  path: string
  type: string
  references: string[] // Other entities this one references
  referencedBy: string[] // Entities that reference this one
}

interface DomainSuggestion {
  name: string
  entities: string[]
  rationale: string
}

async function main() {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      analyze: { type: 'boolean', default: false },
      'init-structure': { type: 'boolean', default: false },
      'extract-domain': { type: 'string' },
      entities: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
      verbose: { type: 'boolean', short: 'v', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
    allowPositionals: true,
  })

  if (values.help) {
    printHelp()
    process.exit(0)
  }

  const options: MigrationOptions = {
    analyze: values.analyze ?? false,
    initStructure: values['init-structure'] ?? false,
    extractDomain: values['extract-domain'] as string | undefined,
    entities: values.entities ? (values.entities as string).split(',').map((e) => e.trim()) : undefined,
    dryRun: values['dry-run'] ?? false,
    verbose: values.verbose ?? false,
  }

  const targetDir = positionals[0] ? resolve(positionals[0]) : SPECS_DIR

  console.log(chalk.blue('\n🔄 KDD Multi-Domain Migration Tool\n'))
  console.log(chalk.gray(`  Target: ${relative(process.cwd(), targetDir)}`))
  console.log(chalk.gray(`  Mode:   ${options.dryRun ? 'Dry run (no changes)' : 'Live'}\n`))

  if (options.analyze) {
    await analyzeMonolith(targetDir, options)
  } else if (options.initStructure) {
    await initializeMultiDomainStructure(targetDir, options)
  } else if (options.extractDomain && options.entities) {
    await extractDomain(targetDir, options.extractDomain, options.entities, options)
  } else {
    console.log(chalk.yellow('No action specified. Use --help for usage.\n'))
    printHelp()
  }
}

/**
 * Analyzes the monolithic structure and suggests domain decomposition
 */
async function analyzeMonolith(specsDir: string, options: MigrationOptions): Promise<void> {
  console.log(chalk.bold('📊 Analyzing monolithic structure...\n'))

  // Collect all entities
  const entities = await collectEntities(specsDir)
  console.log(chalk.gray(`  Found ${entities.size} entities\n`))

  // Build reference graph
  await buildReferenceGraph(specsDir, entities)

  // Suggest domains based on clustering
  const suggestions = suggestDomains(entities)

  console.log(chalk.bold('\n🎯 Suggested Domain Decomposition:\n'))

  for (const suggestion of suggestions) {
    console.log(chalk.cyan(`  ${suggestion.name}:`))
    console.log(chalk.gray(`    Entities: ${suggestion.entities.join(', ')}`))
    console.log(chalk.gray(`    Rationale: ${suggestion.rationale}`))
    console.log()
  }

  // Show migration steps
  console.log(chalk.bold('\n📋 Migration Steps:\n'))
  console.log(chalk.gray('  1. Run: bun run migrate:specs --init-structure'))
  console.log(chalk.gray('  2. For each domain:'))
  for (const suggestion of suggestions) {
    console.log(
      chalk.gray(
        `     bun run migrate:specs --extract-domain ${suggestion.name} --entities ${suggestion.entities.join(',')}`
      )
    )
  }
  console.log(chalk.gray('  3. Update cross-domain references manually'))
  console.log(chalk.gray('  4. Run: bun run validate:specs --check-dependencies'))
}

/**
 * Collects all entities from the specs directory
 */
async function collectEntities(specsDir: string): Promise<Map<string, EntityInfo>> {
  const entities = new Map<string, EntityInfo>()

  const dirsToScan = [
    { dir: '01-domain/entities', type: 'entity' },
    { dir: '01-domain/events', type: 'event' },
    { dir: '01-domain/rules', type: 'rule' },
    { dir: '02-behavior/use-cases', type: 'use-case' },
    { dir: '02-behavior/commands', type: 'command' },
    { dir: '02-behavior/queries', type: 'query' },
    { dir: '02-behavior/processes', type: 'process' },
  ]

  for (const { dir, type } of dirsToScan) {
    const fullDir = join(specsDir, dir)
    try {
      const files = await readdir(fullDir)
      for (const file of files) {
        if (!file.endsWith('.md') || file.startsWith('_')) continue

        const filePath = join(fullDir, file)
        const name = basename(file, '.md')

        entities.set(name, {
          name,
          path: relative(specsDir, filePath),
          type,
          references: [],
          referencedBy: [],
        })
      }
    } catch {
      // Directory doesn't exist
    }
  }

  return entities
}

/**
 * Builds a reference graph between entities
 */
async function buildReferenceGraph(specsDir: string, entities: Map<string, EntityInfo>): Promise<void> {
  const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g

  for (const [name, entity] of entities) {
    try {
      const content = await readFile(join(specsDir, entity.path), 'utf-8')

      let match
      while ((match = wikiLinkRegex.exec(content)) !== null) {
        const target = match[1].trim()

        // Check if target is a known entity
        if (entities.has(target)) {
          if (!entity.references.includes(target)) {
            entity.references.push(target)
          }

          // Add reverse reference
          const targetEntity = entities.get(target)!
          if (!targetEntity.referencedBy.includes(name)) {
            targetEntity.referencedBy.push(name)
          }
        }
      }
    } catch {
      // Error reading file
    }
  }
}

/**
 * Suggests domain decomposition based on entity clustering
 */
function suggestDomains(entities: Map<string, EntityInfo>): DomainSuggestion[] {
  const suggestions: DomainSuggestion[] = []

  // Group by type and naming patterns
  const entityList = Array.from(entities.values()).filter((e) => e.type === 'entity')

  // Look for common prefixes and related entities
  const groups = new Map<string, string[]>()

  for (const entity of entityList) {
    // Try to find a group based on references
    const mostReferenced = entity.references
      .filter((ref) => entities.get(ref)?.type === 'entity')
      .sort((a, b) => {
        const aEntity = entities.get(a)!
        const bEntity = entities.get(b)!
        return bEntity.referencedBy.length - aEntity.referencedBy.length
      })[0]

    // Group by most-referenced entity or self if highly referenced
    if (entity.referencedBy.length >= 3) {
      // This is a core entity
      if (!groups.has(entity.name)) {
        groups.set(entity.name, [])
      }
      groups.get(entity.name)!.push(entity.name)
    } else if (mostReferenced) {
      if (!groups.has(mostReferenced)) {
        groups.set(mostReferenced, [])
      }
      groups.get(mostReferenced)!.push(entity.name)
    } else {
      // Standalone or core entity
      if (!groups.has('core')) {
        groups.set('core', [])
      }
      groups.get('core')!.push(entity.name)
    }
  }

  // Convert groups to suggestions
  for (const [groupName, groupEntities] of groups) {
    if (groupEntities.length === 0) continue

    const domainName = groupName.toLowerCase().replace(/\s+/g, '-')
    suggestions.push({
      name: domainName === 'core' ? 'core' : domainName,
      entities: [...new Set(groupEntities)],
      rationale:
        groupName === 'core'
          ? 'Foundational entities used across the application'
          : `Centered around ${groupName} with ${groupEntities.length - 1} related entities`,
    })
  }

  // Sort: core first, then by entity count
  suggestions.sort((a, b) => {
    if (a.name === 'core') return -1
    if (b.name === 'core') return 1
    return b.entities.length - a.entities.length
  })

  return suggestions
}

/**
 * Initializes the multi-domain directory structure
 */
async function initializeMultiDomainStructure(specsDir: string, options: MigrationOptions): Promise<void> {
  console.log(chalk.bold('🏗️  Initializing multi-domain structure...\n'))

  const dirsToCreate = [
    'domains',
    'domains/core',
    'domains/core/00-requirements',
    'domains/core/01-domain/entities',
    'domains/core/01-domain/events',
    'domains/core/01-domain/rules',
    'domains/core/02-behavior/commands',
    'domains/core/02-behavior/queries',
    'domains/core/02-behavior/use-cases',
    'domains/core/02-behavior/processes',
    'domains/core/03-experience/views',
    'domains/core/04-verification/criteria',
    'domains/core/05-architecture',
    '_shared',
    '_shared/policies',
    '_shared/nfr',
  ]

  for (const dir of dirsToCreate) {
    const fullPath = join(specsDir, dir)
    if (options.dryRun) {
      console.log(chalk.gray(`  [DRY RUN] Would create: ${dir}`))
    } else {
      try {
        await mkdir(fullPath, { recursive: true })
        console.log(chalk.green(`  ✓ Created: ${dir}`))
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
          console.log(chalk.red(`  ✗ Failed to create: ${dir}`))
        }
      }
    }
  }

  // Create core domain manifest
  const coreManifest = {
    domain: {
      id: 'core',
      name: 'Core Domain',
      description: 'Foundational entities and concepts used across the application.',
      status: 'active',
    },
    exports: {
      entities: [],
      events: [],
    },
  }

  const manifestPath = join(specsDir, 'domains/core/_manifest.yaml')
  if (options.dryRun) {
    console.log(chalk.gray(`  [DRY RUN] Would create: domains/core/_manifest.yaml`))
  } else {
    await writeFile(manifestPath, yamlStringify(coreManifest), 'utf-8')
    console.log(chalk.green(`  ✓ Created: domains/core/_manifest.yaml`))
  }

  // Create _shared/domain-map.md
  const domainMapContent = `# Domain Map

## Diagrama de Dependencias

\`\`\`mermaid
graph TD
    CORE[core]

    style CORE fill:#e1f5fe
\`\`\`

## Matriz de Dependencias

| Dominio | Depende de | Exporta a |
|---------|------------|-----------|
| core | - | - |

---

> Este archivo se actualiza automáticamente cuando se agregan nuevos dominios.
`

  const domainMapPath = join(specsDir, '_shared/domain-map.md')
  if (options.dryRun) {
    console.log(chalk.gray(`  [DRY RUN] Would create: _shared/domain-map.md`))
  } else {
    await writeFile(domainMapPath, domainMapContent, 'utf-8')
    console.log(chalk.green(`  ✓ Created: _shared/domain-map.md`))
  }

  console.log(chalk.bold('\n✓ Multi-domain structure initialized!\n'))
  console.log(chalk.gray('  Next steps:'))
  console.log(chalk.gray('  1. Move XP-* policies to _shared/policies/'))
  console.log(chalk.gray('  2. Extract domains using --extract-domain'))
  console.log(chalk.gray('  3. Update _manifest.yaml for each domain'))
}

/**
 * Extracts entities to a new domain
 */
async function extractDomain(
  specsDir: string,
  domainName: string,
  entities: string[],
  options: MigrationOptions
): Promise<void> {
  console.log(chalk.bold(`📦 Extracting domain: ${domainName}\n`))
  console.log(chalk.gray(`  Entities: ${entities.join(', ')}\n`))

  const domainPath = join(specsDir, 'domains', domainName)

  // Create domain structure
  const dirsToCreate = [
    '',
    '00-requirements',
    '01-domain/entities',
    '01-domain/events',
    '01-domain/rules',
    '02-behavior/commands',
    '02-behavior/queries',
    '02-behavior/use-cases',
    '02-behavior/processes',
    '03-experience/views',
    '04-verification/criteria',
    '05-architecture',
  ]

  for (const dir of dirsToCreate) {
    const fullPath = join(domainPath, dir)
    if (!options.dryRun) {
      await mkdir(fullPath, { recursive: true })
    }
  }

  // Find and move entity files
  const movedFiles: string[] = []

  for (const entityName of entities) {
    // Try to find the entity file
    const possiblePaths = [
      `01-domain/entities/${entityName}.md`,
      `01-domain/events/EVT-${entityName}.md`,
      `01-domain/events/${entityName}.md`,
    ]

    for (const possiblePath of possiblePaths) {
      const sourcePath = join(specsDir, possiblePath)
      try {
        await stat(sourcePath)
        const destPath = join(domainPath, possiblePath)

        if (options.dryRun) {
          console.log(chalk.gray(`  [DRY RUN] Would move: ${possiblePath}`))
        } else {
          await mkdir(dirname(destPath), { recursive: true })
          await copyFile(sourcePath, destPath)
          console.log(chalk.green(`  ✓ Copied: ${possiblePath}`))
          movedFiles.push(possiblePath)
        }
      } catch {
        // File doesn't exist at this path
      }
    }

    // Also look for related events
    const eventsDir = join(specsDir, '01-domain/events')
    try {
      const eventFiles = await readdir(eventsDir)
      for (const file of eventFiles) {
        if (file.includes(entityName) && file.endsWith('.md')) {
          const sourcePath = join(eventsDir, file)
          const destPath = join(domainPath, '01-domain/events', file)

          if (!movedFiles.includes(`01-domain/events/${file}`)) {
            if (options.dryRun) {
              console.log(chalk.gray(`  [DRY RUN] Would move event: ${file}`))
            } else {
              await copyFile(sourcePath, destPath)
              console.log(chalk.green(`  ✓ Copied event: ${file}`))
              movedFiles.push(`01-domain/events/${file}`)
            }
          }
        }
      }
    } catch {
      // Events directory doesn't exist
    }
  }

  // Create domain manifest
  const manifest = {
    domain: {
      id: domainName,
      name: domainName.charAt(0).toUpperCase() + domainName.slice(1),
      description: `Domain for ${entities.join(', ')} and related concepts.`,
      status: 'active',
    },
    dependencies: [
      {
        domain: 'core',
        type: 'required',
        reason: 'Uses foundational entities',
        imports: {
          entities: [],
        },
      },
    ],
    exports: {
      entities: entities,
      events: movedFiles.filter((f) => f.includes('/events/')).map((f) => basename(f, '.md')),
    },
  }

  const manifestPath = join(domainPath, '_manifest.yaml')
  if (options.dryRun) {
    console.log(chalk.gray(`  [DRY RUN] Would create: _manifest.yaml`))
  } else {
    await writeFile(manifestPath, yamlStringify(manifest), 'utf-8')
    console.log(chalk.green(`  ✓ Created: _manifest.yaml`))
  }

  console.log(chalk.bold(`\n✓ Domain ${domainName} extracted!\n`))
  console.log(chalk.gray('  Next steps:'))
  console.log(chalk.gray(`  1. Review and update domains/${domainName}/_manifest.yaml`))
  console.log(chalk.gray('  2. Update wiki-links to use cross-domain syntax: [[core::Entity]]'))
  console.log(chalk.gray('  3. Move related commands, queries, and use-cases'))
  console.log(chalk.gray('  4. Run: bun run validate:specs --domain ' + domainName))
}

function printHelp() {
  console.log(`
KDD Multi-Domain Migration Tool

USAGE:
  bun run migrate:specs [options]

OPTIONS:
  --analyze             Analyze monolithic structure and suggest domains
  --init-structure      Initialize multi-domain directory structure
  --extract-domain <n>  Extract entities to a new domain
  --entities <list>     Comma-separated list of entities to extract
  --dry-run             Show what would be done without making changes
  -v, --verbose         Show detailed output
  -h, --help            Show this help

EXAMPLES:
  # Analyze current structure
  bun run migrate:specs --analyze

  # Initialize multi-domain structure
  bun run migrate:specs --init-structure

  # Extract a domain (dry run first)
  bun run migrate:specs --extract-domain billing --entities Invoice,Payment,Refund --dry-run

  # Extract a domain
  bun run migrate:specs --extract-domain billing --entities Invoice,Payment,Refund
`)
}

main().catch((err) => {
  console.error(chalk.red('Error:'), err)
  process.exit(1)
})
