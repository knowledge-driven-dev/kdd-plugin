/**
 * Índice de entidades conocidas en el repositorio de specs
 * Usado para validación semántica y auto-enlazado
 */

import { readdir, readFile } from 'fs/promises'
import { join, basename, relative } from 'path'
import matter from 'gray-matter'

export interface EntityEntry {
  /** Nombre canónico de la entidad */
  name: string
  /** ID único de la entidad (ej: RUL-RETO-001, REQ-001.1) */
  id?: string
  /** Aliases adicionales */
  aliases: string[]
  /** Tipo de entidad (entity, event, rule, use-case, etc.) */
  type: 'entity' | 'event' | 'rule' | 'use-case' | 'requirement' | 'process' | 'other'
  /** Subtipo para reglas/requisitos individuales */
  subtype?: 'individual-rule' | 'individual-requirement'
  /** Path relativo al archivo */
  path: string
  /** Línea donde se define (para sub-entidades) */
  line?: number
  /** Entidad padre (para sub-entidades) */
  parentId?: string
  /** Todas las formas de referirse a esta entidad (name + aliases, lowercase) */
  searchTerms: string[]
  /** Domain this entity belongs to (for multi-domain support) */
  domain?: string
}

export interface EntityIndex {
  /** Mapa de término normalizado -> entidad */
  byTerm: Map<string, EntityEntry>
  /** Lista de todas las entidades */
  all: EntityEntry[]
  /** Términos ordenados por longitud (para matching más largo primero) */
  sortedTerms: string[]
  /** Mapa de domain::term -> entidad (para multi-domain) */
  byDomainTerm: Map<string, EntityEntry>
  /** Whether this index was built in multi-domain mode */
  multiDomain: boolean
}

/**
 * Construye un índice de todas las entidades en el directorio de specs
 * Soporta tanto estructura monolítica como multi-dominio
 */
export async function buildEntityIndex(specsDir: string): Promise<EntityIndex> {
  const index: EntityIndex = {
    byTerm: new Map(),
    all: [],
    sortedTerms: [],
    byDomainTerm: new Map(),
    multiDomain: false,
  }

  // Check if multi-domain mode
  const domainsDir = join(specsDir, 'domains')
  let isMultiDomain = false
  try {
    const domainsStat = await import('fs/promises').then((fs) => fs.stat(domainsDir))
    isMultiDomain = domainsStat.isDirectory()
  } catch {
    // domains directory doesn't exist, use monolithic mode
  }

  index.multiDomain = isMultiDomain

  if (isMultiDomain) {
    // Multi-domain mode: scan each domain separately
    await buildMultiDomainIndex(specsDir, domainsDir, index)
    // Also scan _shared
    await buildSharedIndex(specsDir, join(specsDir, '_shared'), index)
  } else {
    // Monolithic mode: scan the traditional structure
    await buildMonolithicIndex(specsDir, index)
  }

  // Ordenar términos por longitud (más largos primero para matching correcto)
  index.sortedTerms = Array.from(index.byTerm.keys()).sort((a, b) => b.length - a.length)

  return index
}

/**
 * Build index for monolithic KDD structure
 */
async function buildMonolithicIndex(specsDir: string, index: EntityIndex): Promise<void> {
  // Escanear directorios relevantes (soporta estructura con prefijos numéricos)
  const dirsToScan = [
    // Estructura actual (00=requirements, 01=domain, 02=behavior, etc.)
    { dir: '01-domain/entities', type: 'entity' as const },
    { dir: '01-domain/events', type: 'event' as const },
    { dir: '01-domain/rules', type: 'rule' as const },
    { dir: '02-behavior/use-cases', type: 'use-case' as const },
    { dir: '02-behavior/processes', type: 'process' as const },
    { dir: '04-verification/criteria', type: 'requirement' as const },
    // Estructura legacy (sin prefijos)
    { dir: 'domain/entities', type: 'entity' as const },
    { dir: 'domain/events', type: 'event' as const },
    { dir: 'domain/rules', type: 'rule' as const },
    { dir: 'behavior/use-cases', type: 'use-case' as const },
    { dir: 'behavior/requirements', type: 'requirement' as const },
    { dir: 'behavior/processes', type: 'process' as const },
  ]

  for (const { dir, type } of dirsToScan) {
    const fullDir = join(specsDir, dir)
    try {
      const files = await readdir(fullDir)
      for (const file of files) {
        if (!file.endsWith('.md') || file.startsWith('_')) continue

        const filePath = join(fullDir, file)
        const entry = await parseEntityFile(filePath, type, specsDir)
        if (entry) {
          index.all.push(entry)

          // Indexar por todos los términos de búsqueda
          for (const term of entry.searchTerms) {
            if (!index.byTerm.has(term)) {
              index.byTerm.set(term, entry)
            }
          }

          // Extraer sub-entidades (reglas/requisitos individuales)
          const subEntities = await parseSubEntities(filePath, type, specsDir, entry)
          for (const subEntry of subEntities) {
            index.all.push(subEntry)
            for (const term of subEntry.searchTerms) {
              if (!index.byTerm.has(term)) {
                index.byTerm.set(term, subEntry)
              }
            }
          }
        }
      }
    } catch {
      // Directorio no existe, continuar
    }
  }
}

/**
 * Build index for multi-domain KDD structure
 */
async function buildMultiDomainIndex(
  specsDir: string,
  domainsDir: string,
  index: EntityIndex
): Promise<void> {
  // Get list of domains
  let domains: string[] = []
  try {
    const entries = await readdir(domainsDir)
    for (const entry of entries) {
      const entryPath = join(domainsDir, entry)
      try {
        const stat = await import('fs/promises').then((fs) => fs.stat(entryPath))
        if (stat.isDirectory() && !entry.startsWith('.') && !entry.startsWith('_')) {
          domains.push(entry)
        }
      } catch {
        // Skip if can't stat
      }
    }
  } catch {
    return
  }

  // Scan each domain
  for (const domain of domains) {
    const domainPath = join(domainsDir, domain)
    const dirsToScan = [
      { dir: '01-domain/entities', type: 'entity' as const },
      { dir: '01-domain/events', type: 'event' as const },
      { dir: '01-domain/rules', type: 'rule' as const },
      { dir: '02-behavior/use-cases', type: 'use-case' as const },
      { dir: '02-behavior/processes', type: 'process' as const },
      { dir: '02-behavior/commands', type: 'other' as const },
      { dir: '02-behavior/queries', type: 'other' as const },
      { dir: '04-verification/criteria', type: 'requirement' as const },
    ]

    for (const { dir, type } of dirsToScan) {
      const fullDir = join(domainPath, dir)
      try {
        const files = await readdir(fullDir)
        for (const file of files) {
          if (!file.endsWith('.md') || file.startsWith('_')) continue

          const filePath = join(fullDir, file)
          const entry = await parseEntityFile(filePath, type, specsDir, domain)
          if (entry) {
            index.all.push(entry)

            // Index by local term
            for (const term of entry.searchTerms) {
              if (!index.byTerm.has(term)) {
                index.byTerm.set(term, entry)
              }
              // Also index by domain::term
              const domainTerm = `${domain}::${term}`
              index.byDomainTerm.set(domainTerm, entry)
            }

            // Extract sub-entities
            const subEntities = await parseSubEntities(filePath, type, specsDir, entry)
            for (const subEntry of subEntities) {
              subEntry.domain = domain
              index.all.push(subEntry)
              for (const term of subEntry.searchTerms) {
                if (!index.byTerm.has(term)) {
                  index.byTerm.set(term, subEntry)
                }
                const domainTerm = `${domain}::${term}`
                index.byDomainTerm.set(domainTerm, subEntry)
              }
            }
          }
        }
      } catch {
        // Directory doesn't exist, continue
      }
    }
  }
}

/**
 * Build index for _shared folder
 */
async function buildSharedIndex(
  specsDir: string,
  sharedDir: string,
  index: EntityIndex
): Promise<void> {
  const dirsToScan = [
    { dir: 'policies', type: 'other' as const },
    { dir: 'nfr', type: 'requirement' as const },
  ]

  for (const { dir, type } of dirsToScan) {
    const fullDir = join(sharedDir, dir)
    try {
      const files = await readdir(fullDir)
      for (const file of files) {
        if (!file.endsWith('.md') || file.startsWith('_')) continue

        const filePath = join(fullDir, file)
        const entry = await parseEntityFile(filePath, type, specsDir, '_shared')
        if (entry) {
          index.all.push(entry)

          for (const term of entry.searchTerms) {
            if (!index.byTerm.has(term)) {
              index.byTerm.set(term, entry)
            }
            const domainTerm = `_shared::${term}`
            index.byDomainTerm.set(domainTerm, entry)
          }
        }
      }
    } catch {
      // Directory doesn't exist
    }
  }
}

/**
 * Extrae sub-entidades de un archivo (reglas o requisitos individuales)
 *
 * Patrones detectados:
 * - Reglas: ## RUL-XXX-NNN: Título (dentro de RUL-XXX.md)
 * - Requisitos: ## REQ-NNN.M: Título (dentro de REQ-NNN-*.md)
 */
async function parseSubEntities(
  filePath: string,
  parentType: EntityEntry['type'],
  specsDir: string,
  parent: EntityEntry
): Promise<EntityEntry[]> {
  const subEntities: EntityEntry[] = []

  // Solo procesar archivos de reglas y requisitos
  if (parentType !== 'rule' && parentType !== 'requirement') {
    return subEntities
  }

  try {
    const content = await readFile(filePath, 'utf-8')
    const lines = content.split('\n')

    // Patrones para detectar sub-entidades
    const rulePattern = /^##\s+(RUL-[A-Z]+-\d{3}):\s*(.+)$/
    const requirementPattern = /^##\s+(REQ-\d{3}\.\d+):\s*(.+)$/

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNumber = i + 1

      // Intentar match de regla individual
      const ruleMatch = line.match(rulePattern)
      if (ruleMatch && parentType === 'rule') {
        const [, ruleId, title] = ruleMatch
        const searchTerms = new Set<string>()
        searchTerms.add(normalize(ruleId))
        searchTerms.add(normalize(title))

        subEntities.push({
          name: title.trim(),
          id: ruleId,
          aliases: [ruleId],
          type: 'rule',
          subtype: 'individual-rule',
          path: relative(specsDir, filePath),
          line: lineNumber,
          parentId: parent.name,
          searchTerms: Array.from(searchTerms).filter((t) => t.length > 2),
        })
        continue
      }

      // Intentar match de requisito individual
      const reqMatch = line.match(requirementPattern)
      if (reqMatch && parentType === 'requirement') {
        const [, reqId, title] = reqMatch
        const searchTerms = new Set<string>()
        searchTerms.add(normalize(reqId))
        searchTerms.add(normalize(title))

        subEntities.push({
          name: title.trim(),
          id: reqId,
          aliases: [reqId],
          type: 'requirement',
          subtype: 'individual-requirement',
          path: relative(specsDir, filePath),
          line: lineNumber,
          parentId: parent.name,
          searchTerms: Array.from(searchTerms).filter((t) => t.length > 2),
        })
      }
    }
  } catch {
    // Error al leer, retornar vacío
  }

  return subEntities
}

/**
 * Parsea un archivo para extraer información de entidad
 */
async function parseEntityFile(
  filePath: string,
  type: EntityEntry['type'],
  specsDir: string,
  domain?: string
): Promise<EntityEntry | null> {
  try {
    const content = await readFile(filePath, 'utf-8')
    const { data: frontmatter, content: body } = matter(content)

    // Obtener nombre del archivo (sin extensión)
    const fileName = basename(filePath, '.md')

    // Obtener nombre canónico (del H1 o del nombre de archivo)
    let canonicalName = fileName
    const h1Match = body.match(/^#\s+(.+)$/m)
    if (h1Match) {
      // Limpiar el H1 de prefijos como "UC-001:"
      canonicalName = h1Match[1].replace(/^(UC|REQ|EVT|RUL|PRC)-\d{3}:\s*/, '').trim()
    }

    // Obtener aliases del frontmatter
    const aliases: string[] = []
    if (Array.isArray(frontmatter.aliases)) {
      aliases.push(...frontmatter.aliases)
    }

    // Para eventos y reglas, extraer el ID como alias
    if (type === 'event' && fileName.startsWith('EVT-')) {
      aliases.push(fileName)
    }
    if (type === 'rule' && fileName.startsWith('RUL-')) {
      aliases.push(fileName)
    }
    if (type === 'use-case' && fileName.startsWith('UC-')) {
      // Extraer UC-XXX del nombre
      const ucMatch = fileName.match(/^(UC-\d{3})/)
      if (ucMatch) aliases.push(ucMatch[1])
    }

    // Construir términos de búsqueda
    const searchTerms = new Set<string>()

    // Añadir nombre canónico y variantes
    searchTerms.add(normalize(canonicalName))
    searchTerms.add(normalize(fileName))

    // Añadir aliases
    for (const alias of aliases) {
      searchTerms.add(normalize(alias))
    }

    // Para entidades plurales, añadir singular/plural
    if (type === 'entity') {
      const singular = canonicalName.replace(/s$/, '')
      const plural = canonicalName.endsWith('s') ? canonicalName : canonicalName + 's'
      searchTerms.add(normalize(singular))
      searchTerms.add(normalize(plural))
    }

    return {
      name: canonicalName,
      aliases,
      type,
      path: relative(specsDir, filePath),
      searchTerms: Array.from(searchTerms).filter((t) => t.length > 2), // Ignorar términos muy cortos
      domain,
    }
  } catch {
    return null
  }
}

/**
 * Normaliza un string para búsqueda
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .trim()
}

/**
 * Busca una entidad por texto
 */
export function findEntity(index: EntityIndex, text: string): EntityEntry | undefined {
  const normalized = normalize(text)
  return index.byTerm.get(normalized)
}

/**
 * Busca una entidad por término calificado con dominio (domain::term)
 */
export function findEntityByDomain(
  index: EntityIndex,
  domain: string,
  term: string
): EntityEntry | undefined {
  const normalized = normalize(term)
  const domainTerm = `${domain}::${normalized}`
  return index.byDomainTerm.get(domainTerm)
}

/**
 * Busca una entidad, primero en el dominio especificado, luego en core
 */
export function findEntityWithFallback(
  index: EntityIndex,
  term: string,
  currentDomain?: string
): EntityEntry | undefined {
  const normalized = normalize(term)

  // First try current domain if specified
  if (currentDomain) {
    const entry = findEntityByDomain(index, currentDomain, term)
    if (entry) return entry
  }

  // Then try core domain
  const coreEntry = findEntityByDomain(index, 'core', term)
  if (coreEntry) return coreEntry

  // Finally try global lookup
  return index.byTerm.get(normalized)
}

/**
 * Gets all entities in a specific domain
 */
export function getEntitiesByDomain(index: EntityIndex, domain: string): EntityEntry[] {
  return index.all.filter((e) => e.domain === domain)
}

/**
 * Busca entidades que coincidan parcialmente
 */
export function searchEntities(index: EntityIndex, text: string): EntityEntry[] {
  const normalized = normalize(text)
  const results: EntityEntry[] = []

  for (const entry of index.all) {
    for (const term of entry.searchTerms) {
      if (term.includes(normalized) || normalized.includes(term)) {
        results.push(entry)
        break
      }
    }
  }

  return results
}
