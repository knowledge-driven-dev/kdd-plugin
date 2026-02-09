/**
 * Domain manifest parsing and validation
 * Supports multi-domain KDD structure
 */

import { readFile, readdir, stat } from 'fs/promises'
import { join, relative, basename } from 'path'
import { parse as parseYaml } from 'yaml'
import { z } from 'zod'

// =============================================================================
// SCHEMAS
// =============================================================================

const DependencyTypeSchema = z.enum(['required', 'optional', 'event-only'])

const ImportSchema = z.object({
  entities: z.array(z.string()).optional(),
  events: z.array(z.string()).optional(),
  commands: z.array(z.string()).optional(),
  queries: z.array(z.string()).optional(),
  'value-objects': z.array(z.string()).optional(),
})

const DependencySchema = z.object({
  domain: z.string(),
  type: DependencyTypeSchema,
  reason: z.string().optional(),
  imports: ImportSchema.optional(),
})

const ExportsSchema = z.object({
  entities: z.array(z.string()).optional(),
  events: z.array(z.string()).optional(),
  commands: z.array(z.string()).optional(),
  queries: z.array(z.string()).optional(),
  'value-objects': z.array(z.string()).optional(),
})

const RelationshipPatternSchema = z.enum([
  'conformist',
  'anti-corruption-layer',
  'shared-kernel',
  'customer-supplier',
  'open-host-service',
  'published-language',
])

const RelationshipSchema = z.object({
  domain: z.string(),
  pattern: RelationshipPatternSchema,
})

const ContextMapSchema = z.object({
  upstream: z.array(z.string()).optional(),
  downstream: z.array(z.string()).optional(),
  relationships: z.array(RelationshipSchema).optional(),
})

const AntiCorruptionSchema = z.object({
  external: z.string(),
  internal: z.string(),
  adapter: z.string().optional(),
  notes: z.string().optional(),
})

const BoundariesSchema = z.object({
  'anti-corruption': z.array(AntiCorruptionSchema).optional(),
  'shared-interfaces': z
    .array(
      z.object({
        interface: z.string(),
        'shared-with': z.array(z.string()),
        file: z.string().optional(),
      })
    )
    .optional(),
})

const LocalPolicySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
})

const ExcludedPolicySchema = z.object({
  id: z.string(),
  reason: z.string(),
})

const PoliciesSchema = z.object({
  inherited: z.array(z.string()).optional(),
  local: z.array(LocalPolicySchema).optional(),
  excluded: z.array(ExcludedPolicySchema).optional(),
})

const TechnicalSchema = z.object({
  'module-path': z.string().optional(),
  database: z
    .object({
      schema: z.string().optional(),
      migrations: z.string().optional(),
    })
    .optional(),
  'feature-flags': z
    .array(
      z.object({
        name: z.string(),
        default: z.boolean().optional(),
      })
    )
    .optional(),
  observability: z
    .object({
      namespace: z.string().optional(),
      traces: z.boolean().optional(),
      metrics: z.boolean().optional(),
    })
    .optional(),
})

const DomainStatusSchema = z.enum(['active', 'deprecated', 'experimental', 'frozen'])

const DomainMetaSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/, 'Domain ID must be kebab-case'),
  name: z.string(),
  description: z.string(),
  status: DomainStatusSchema,
  team: z.string().optional(),
  version: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const DomainManifestSchema = z.object({
  domain: DomainMetaSchema,
  dependencies: z.array(DependencySchema).optional(),
  exports: ExportsSchema.optional(),
  'context-map': ContextMapSchema.optional(),
  boundaries: BoundariesSchema.optional(),
  policies: PoliciesSchema.optional(),
  technical: TechnicalSchema.optional(),
})

export type DomainManifest = z.infer<typeof DomainManifestSchema>
export type DomainDependency = z.infer<typeof DependencySchema>
export type DomainExports = z.infer<typeof ExportsSchema>

// =============================================================================
// DOMAIN DETECTION
// =============================================================================

export interface MultiDomainConfig {
  /** Whether multi-domain mode is enabled */
  enabled: boolean
  /** Path to the domains folder */
  domainsPath: string
  /** Path to the shared folder */
  sharedPath: string
  /** List of detected domains */
  domains: string[]
}

/**
 * Detects if the specs directory uses multi-domain structure
 */
export async function detectMultiDomain(specsDir: string): Promise<MultiDomainConfig> {
  const domainsPath = join(specsDir, 'domains')
  const sharedPath = join(specsDir, '_shared')

  try {
    const domainsStat = await stat(domainsPath)
    if (!domainsStat.isDirectory()) {
      return { enabled: false, domainsPath, sharedPath, domains: [] }
    }

    // List all domains
    const entries = await readdir(domainsPath)
    const domains: string[] = []

    for (const entry of entries) {
      const entryPath = join(domainsPath, entry)
      const entryStat = await stat(entryPath)
      if (entryStat.isDirectory() && !entry.startsWith('.') && !entry.startsWith('_')) {
        domains.push(entry)
      }
    }

    return {
      enabled: domains.length > 0,
      domainsPath,
      sharedPath,
      domains,
    }
  } catch {
    return { enabled: false, domainsPath, sharedPath, domains: [] }
  }
}

// =============================================================================
// MANIFEST LOADING
// =============================================================================

export interface LoadedDomain {
  id: string
  path: string
  manifest: DomainManifest | null
  parseError?: string
}

/**
 * Loads a domain manifest from a domain directory
 */
export async function loadDomainManifest(domainPath: string): Promise<LoadedDomain> {
  const domainId = basename(domainPath)
  const manifestPath = join(domainPath, '_manifest.yaml')

  try {
    const content = await readFile(manifestPath, 'utf-8')
    const parsed = parseYaml(content)
    const validated = DomainManifestSchema.parse(parsed)

    // Verify domain ID matches folder name
    if (validated.domain.id !== domainId) {
      return {
        id: domainId,
        path: domainPath,
        manifest: validated,
        parseError: `Domain ID '${validated.domain.id}' does not match folder name '${domainId}'`,
      }
    }

    return {
      id: domainId,
      path: domainPath,
      manifest: validated,
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {
        id: domainId,
        path: domainPath,
        manifest: null,
        parseError: `Missing _manifest.yaml in domain '${domainId}'`,
      }
    }

    const message = error instanceof z.ZodError
      ? `Invalid manifest schema: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      : `Failed to parse manifest: ${(error as Error).message}`

    return {
      id: domainId,
      path: domainPath,
      manifest: null,
      parseError: message,
    }
  }
}

/**
 * Loads all domain manifests from the domains directory
 */
export async function loadAllDomains(domainsPath: string): Promise<Map<string, LoadedDomain>> {
  const domains = new Map<string, LoadedDomain>()

  try {
    const entries = await readdir(domainsPath)

    for (const entry of entries) {
      const entryPath = join(domainsPath, entry)
      const entryStat = await stat(entryPath)

      if (entryStat.isDirectory() && !entry.startsWith('.') && !entry.startsWith('_')) {
        const domain = await loadDomainManifest(entryPath)
        domains.set(entry, domain)
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return domains
}

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

export interface DependencyValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  cycles: string[][]
}

/**
 * Validates dependencies between domains
 */
export function validateDependencies(domains: Map<string, LoadedDomain>): DependencyValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const cycles: string[][] = []

  // Build dependency graph
  const graph = new Map<string, Set<string>>()
  for (const [id, domain] of domains) {
    graph.set(id, new Set())
    if (domain.manifest?.dependencies) {
      for (const dep of domain.manifest.dependencies) {
        graph.get(id)!.add(dep.domain)
      }
    }
  }

  // Check for missing dependencies
  for (const [id, domain] of domains) {
    if (!domain.manifest?.dependencies) continue

    for (const dep of domain.manifest.dependencies) {
      if (!domains.has(dep.domain) && dep.domain !== '_shared') {
        if (dep.type === 'required') {
          errors.push(`Domain '${id}' requires non-existent domain '${dep.domain}'`)
        } else {
          warnings.push(`Domain '${id}' depends on non-existent domain '${dep.domain}'`)
        }
      }
    }
  }

  // Check for cycles using DFS
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function detectCycle(node: string, path: string[]): boolean {
    visited.add(node)
    recursionStack.add(node)

    const neighbors = graph.get(node) || new Set()
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (detectCycle(neighbor, [...path, neighbor])) {
          return true
        }
      } else if (recursionStack.has(neighbor)) {
        // Found a cycle
        const cycleStart = path.indexOf(neighbor)
        cycles.push(path.slice(cycleStart))
        return true
      }
    }

    recursionStack.delete(node)
    return false
  }

  for (const id of domains.keys()) {
    if (!visited.has(id)) {
      detectCycle(id, [id])
    }
  }

  // Check if core has dependencies (it shouldn't)
  const coreDomain = domains.get('core')
  if (coreDomain?.manifest?.dependencies && coreDomain.manifest.dependencies.length > 0) {
    errors.push("Domain 'core' should not have any dependencies (it's foundational)")
  }

  // Add cycle errors
  for (const cycle of cycles) {
    errors.push(`Circular dependency detected: ${cycle.join(' → ')} → ${cycle[0]}`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    cycles,
  }
}

// =============================================================================
// CROSS-DOMAIN REFERENCE PARSING
// =============================================================================

export interface CrossDomainReference {
  /** The domain being referenced (or null for local/implicit) */
  domain: string | null
  /** The entity/artifact being referenced */
  target: string
  /** Whether this is an explicit cross-domain reference */
  explicit: boolean
  /** Original raw reference string */
  raw: string
}

/**
 * Parses a wiki-link target into domain and entity parts
 * Supports:
 * - [[Entity]] -> domain: null, target: Entity
 * - [[domain::Entity]] -> domain: domain, target: Entity
 * - [[_shared::XP-001]] -> domain: _shared, target: XP-001
 */
export function parseCrossDomainReference(wikiLinkTarget: string): CrossDomainReference {
  const match = wikiLinkTarget.match(/^([a-z_][a-z0-9_-]*)::(.+)$/i)

  if (match) {
    return {
      domain: match[1],
      target: match[2],
      explicit: true,
      raw: wikiLinkTarget,
    }
  }

  return {
    domain: null,
    target: wikiLinkTarget,
    explicit: false,
    raw: wikiLinkTarget,
  }
}

/**
 * Determines which domain a file belongs to based on its path
 */
export function getDomainFromPath(filePath: string, specsDir: string): string | null {
  const relPath = relative(specsDir, filePath)

  // Check if in domains/ structure
  const domainsMatch = relPath.match(/^domains\/([^/]+)\//)
  if (domainsMatch) {
    return domainsMatch[1]
  }

  // Check if in _shared/
  if (relPath.startsWith('_shared/')) {
    return '_shared'
  }

  // Legacy monolithic structure - no domain
  return null
}

// =============================================================================
// EXPORTS VALIDATION
// =============================================================================

export interface ExportsValidationResult {
  valid: boolean
  missingExports: { domain: string; artifact: string; type: string }[]
  unusedExports: { domain: string; artifact: string; type: string }[]
}

/**
 * Validates that exported artifacts actually exist in the domain
 */
export async function validateExports(
  domain: LoadedDomain,
  specsDir: string
): Promise<ExportsValidationResult> {
  const missingExports: { domain: string; artifact: string; type: string }[] = []
  const unusedExports: { domain: string; artifact: string; type: string }[] = []

  if (!domain.manifest?.exports) {
    return { valid: true, missingExports, unusedExports }
  }

  const domainPath = domain.path
  const exports = domain.manifest.exports

  // Check entities
  if (exports.entities) {
    for (const entity of exports.entities) {
      const entityPath = join(domainPath, '01-domain', 'entities', `${entity}.md`)
      try {
        await stat(entityPath)
      } catch {
        missingExports.push({ domain: domain.id, artifact: entity, type: 'entity' })
      }
    }
  }

  // Check events
  if (exports.events) {
    for (const event of exports.events) {
      const eventPath = join(domainPath, '01-domain', 'events', `${event}.md`)
      try {
        await stat(eventPath)
      } catch {
        missingExports.push({ domain: domain.id, artifact: event, type: 'event' })
      }
    }
  }

  // Check commands
  if (exports.commands) {
    for (const cmd of exports.commands) {
      // Commands have pattern CMD-NNN-Name.md, need to search
      const commandsDir = join(domainPath, '02-behavior', 'commands')
      try {
        const files = await readdir(commandsDir)
        const found = files.some((f) => f.includes(cmd) || f.startsWith(cmd))
        if (!found) {
          missingExports.push({ domain: domain.id, artifact: cmd, type: 'command' })
        }
      } catch {
        missingExports.push({ domain: domain.id, artifact: cmd, type: 'command' })
      }
    }
  }

  // Check queries
  if (exports.queries) {
    for (const qry of exports.queries) {
      const queriesDir = join(domainPath, '02-behavior', 'queries')
      try {
        const files = await readdir(queriesDir)
        const found = files.some((f) => f.includes(qry) || f.startsWith(qry))
        if (!found) {
          missingExports.push({ domain: domain.id, artifact: qry, type: 'query' })
        }
      } catch {
        missingExports.push({ domain: domain.id, artifact: qry, type: 'query' })
      }
    }
  }

  return {
    valid: missingExports.length === 0,
    missingExports,
    unusedExports,
  }
}
