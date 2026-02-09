/**
 * Spec Resolver
 * Maps artifact IDs to file paths and code files
 */

import { resolve, basename } from 'path'
import { readFile } from 'fs/promises'
import { PREFIX_DIR_MAP, ENTITY_NAME_MAP, ACTION_VERB_MAP } from './types'
import type { ArtifactRef } from './types'

/**
 * Resolve a spec artifact ID to its file path
 * Returns null if not found
 */
export async function resolveSpecPath(
  artifactId: string,
  specsDir: string
): Promise<string | null> {
  // Strip fragment (e.g. "Entity#INV-ENTITY-006" -> "Entity")
  const cleanId = artifactId.includes('#') ? artifactId.split('#')[0] : artifactId

  // Detect prefix
  const prefixMatch = cleanId.match(/^([A-Z]+)/i)
  if (!prefixMatch) return null
  const prefix = prefixMatch[1].toUpperCase()

  // Find the directory to search in
  const dirSuffix = PREFIX_DIR_MAP[prefix]
  if (!dirSuffix) {
    // Try entity name resolution for non-prefixed targets (e.g. "Order", "Customer")
    return resolveEntityPath(cleanId, specsDir)
  }

  const searchDir = resolve(specsDir, dirSuffix)

  // Glob for files matching the ID
  const glob = new Bun.Glob(`${cleanId}*.md`)
  for await (const file of glob.scan({ cwd: searchDir, absolute: true })) {
    return file
  }

  // Try broader search for UI specs which can be in subdirectories
  if (['UI', 'VIEW', 'LAYOUT', 'MODAL', 'FLOW'].includes(prefix)) {
    const broadGlob = new Bun.Glob(`**/${cleanId}*.md`)
    for await (const file of broadGlob.scan({ cwd: resolve(specsDir, '03-experience'), absolute: true })) {
      return file
    }
  }

  return null
}

/**
 * Resolve an entity name (non-prefixed) to its spec file
 */
async function resolveEntityPath(name: string, specsDir: string): Promise<string | null> {
  const entitiesDir = resolve(specsDir, '01-domain/entities')
  const glob = new Bun.Glob('*.md')

  for await (const file of glob.scan({ cwd: entitiesDir, absolute: true })) {
    const base = basename(file, '.md')
    const normalized = normalize(base)
    if (normalized.includes(normalize(name))) {
      return file
    }
  }

  return null
}

/**
 * Resolve multiple artifact IDs, returning a map of id -> path (or null)
 */
export async function resolveSpecPaths(
  artifactIds: string[],
  specsDir: string
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>()

  for (const id of artifactIds) {
    results.set(id, await resolveSpecPath(id, specsDir))
  }

  return results
}

/**
 * Map a CMD/QRY ID to its expected use-case file path
 */
export function cmdToUseCasePath(
  cmdId: string,
  actionName: string,
  projectRoot: string
): string {
  const fileName = actionNameToFileName(actionName)
  const { loadKddConfig } = await import('../../lib/config')
  const config = await loadKddConfig()
  return resolve(projectRoot, config.useCasesDir, fileName)
}

/**
 * Convert PascalCase action name to kebab-case use-case filename
 * e.g. "CreateOrder" -> "create-order.use-case.ts"
 */
export function actionNameToFileName(actionName: string): string {
  // Split PascalCase into parts
  const parts = actionName.replace(/([a-z])([A-Z])/g, '$1 $2').split(' ')

  if (parts.length < 2) {
    return `${parts[0].toLowerCase()}.use-case.ts`
  }

  const verb = parts[0]
  const entity = parts.slice(1).join('')

  // Map verb and entity names using project-specific mappings
  const mappedVerb = ACTION_VERB_MAP[verb] ?? verb.toLowerCase()
  const mappedEntity = ENTITY_NAME_MAP[entity] ?? entity.toLowerCase()

  return `${mappedVerb}-${mappedEntity}.use-case.ts`
}

/**
 * Build a map of CMD IDs to existing use-case file paths by scanning the codebase
 */
export async function buildCodeMapping(
  projectRoot: string
): Promise<Map<string, string>> {
  const { loadKddConfig } = await import('../../lib/config')
  const config = await loadKddConfig()
  const useCaseDir = resolve(projectRoot, config.useCasesDir)
  const mapping = new Map<string, string>()
  const glob = new Bun.Glob('*.use-case.ts')

  for await (const file of glob.scan({ cwd: useCaseDir, absolute: true })) {
    // Skip test files
    if (file.includes('.test.')) continue

    // Try to detect CMD/QRY ID from file content (comment or import)
    const content = await readFile(file, 'utf-8')
    const cmdMatch = content.match(/(CMD|QRY)-(\d{3})/i)
    if (cmdMatch) {
      mapping.set(`${cmdMatch[1].toUpperCase()}-${cmdMatch[2]}`, file)
      continue
    }

    // Heuristic: derive CMD from filename
    const base = basename(file, '.use-case.ts')
    const derivedCmd = await fileNameToCmdId(base)
    if (derivedCmd) {
      mapping.set(derivedCmd, file)
    }
  }

  return mapping
}

/**
 * Heuristic: derive CMD ID from a use-case filename
 * This is a best-effort mapping for files that don't have CMD comments
 */
async function fileNameToCmdId(fileName: string): Promise<string | null> {
  // Load project-specific mappings from kdd.config.ts
  const { loadKddConfig } = await import('../../lib/config')
  const config = await loadKddConfig()
  const KNOWN_MAP: Record<string, string> = config.codeMapping

  return KNOWN_MAP[fileName] ?? null
}

/**
 * Check if a test file exists for a given use-case file
 */
export async function hasTestFile(useCaseFilePath: string): Promise<boolean> {
  const testPath = useCaseFilePath.replace('.use-case.ts', '.use-case.test.ts')
  return Bun.file(testPath).exists()
}

/**
 * Find all BR (business rule) spec files
 */
export async function findAllBRSpecs(specsDir: string): Promise<string[]> {
  const rulesDir = resolve(specsDir, '01-domain/rules')
  const glob = new Bun.Glob('BR-*.md')
  const paths: string[] = []

  for await (const file of glob.scan({ cwd: rulesDir, absolute: true })) {
    paths.push(file)
  }

  return paths.sort()
}

/**
 * Find all CMD spec files
 */
export async function findAllCMDSpecs(specsDir: string): Promise<string[]> {
  const cmdsDir = resolve(specsDir, '02-behavior/commands')
  const glob = new Bun.Glob('CMD-*.md')
  const paths: string[] = []

  for await (const file of glob.scan({ cwd: cmdsDir, absolute: true })) {
    paths.push(file)
  }

  return paths.sort()
}

/**
 * Find all QRY spec files
 */
export async function findAllQRYSpecs(specsDir: string): Promise<string[]> {
  const queriesDir = resolve(specsDir, '02-behavior/queries')
  const glob = new Bun.Glob('QRY-*.md')
  const paths: string[] = []

  for await (const file of glob.scan({ cwd: queriesDir, absolute: true })) {
    paths.push(file)
  }

  return paths.sort()
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}
