/**
 * Validador semántico
 * Nivel 3: Identifica entidades sin enlazar y valida referencias
 */

import { writeFile } from 'fs/promises'
import type { SpecFile, ValidationResult } from '../lib/parser'
import type { EntityIndex, EntityEntry } from '../lib/entity-index'
import { findEntity } from '../lib/entity-index'

interface SemanticOptions {
  /** Auto-corregir enlaces */
  fix: boolean
}

/**
 * Valida aspectos semánticos del documento
 */
export async function validateSemantics(
  spec: SpecFile,
  entityIndex: EntityIndex,
  options: SemanticOptions
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []

  // 1. Validar que los wiki-links existentes apunten a entidades válidas
  results.push(...validateExistingLinks(spec, entityIndex))

  // 2. Detectar menciones de entidades sin enlazar
  const unlinkedMentions = detectUnlinkedEntities(spec, entityIndex)
  results.push(...unlinkedMentions.results)

  // 3. Si --fix está habilitado, corregir enlaces
  if (options.fix && unlinkedMentions.fixes.length > 0) {
    const fixed = await applyFixes(spec, unlinkedMentions.fixes)
    if (fixed) {
      results.push({
        level: 'info',
        rule: 'semantics/auto-fixed',
        message: `Se corrigieron ${unlinkedMentions.fixes.length} enlaces automáticamente`,
      })
    }
  }

  // 4. Validar consistencia de referencias cruzadas
  results.push(...validateCrossReferences(spec, entityIndex))

  // 5. Validar capitalización de entidades
  results.push(...validateEntityCapitalization(spec, entityIndex))

  return results
}

/**
 * Valida que los wiki-links apunten a entidades existentes
 */
function validateExistingLinks(spec: SpecFile, entityIndex: EntityIndex): ValidationResult[] {
  const results: ValidationResult[] = []

  for (const link of spec.wikiLinks) {
    // Normalizar el target (puede tener alias con |)
    const target = link.target.split('|')[0].trim()

    // Buscar en el índice
    const entity = findEntity(entityIndex, target)

    if (!entity) {
      // Buscar coincidencias parciales para sugerir
      const suggestions = findSimilarEntities(target, entityIndex)

      results.push({
        level: 'warning',
        rule: 'semantics/broken-link',
        message: `El enlace [[${target}]] no corresponde a ninguna entidad conocida`,
        line: link.line,
        suggestion:
          suggestions.length > 0
            ? `¿Quisiste decir: ${suggestions.map((s) => `[[${s.name}]]`).join(', ')}?`
            : 'Verifica que la entidad exista o crea el archivo correspondiente',
      })
    }
  }

  return results
}

/**
 * Detecta menciones de entidades conocidas que no están enlazadas
 */
function detectUnlinkedEntities(
  spec: SpecFile,
  entityIndex: EntityIndex
): {
  results: ValidationResult[]
  fixes: { line: number; original: string; replacement: string; start: number; end: number }[]
} {
  const results: ValidationResult[] = []
  const fixes: { line: number; original: string; replacement: string; start: number; end: number }[] =
    []

  const lines = spec.content.split('\n')

  // Conjunto de targets ya enlazados (para no reportar duplicados)
  const linkedTargets = new Set(spec.wikiLinks.map((l) => l.target.toLowerCase()))

  // Procesar cada línea
  lines.forEach((line, lineIndex) => {
    // Ignorar líneas de código
    if (line.trim().startsWith('```') || line.trim().startsWith('|')) return
    // Ignorar headings (ya están en contexto)
    if (line.trim().startsWith('#')) return

    // Buscar menciones de entidades conocidas
    for (const term of entityIndex.sortedTerms) {
      const entity = entityIndex.byTerm.get(term)
      if (!entity) continue

      // Crear regex para buscar el término (word boundary, case insensitive)
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi')

      let match
      while ((match = regex.exec(line)) !== null) {
        const foundText = match[1]
        const startPos = match.index

        // Verificar que no esté ya enlazado
        if (isInsideWikiLink(line, startPos)) continue

        // Verificar que no sea el mismo archivo
        if (spec.path.includes(entity.path)) continue

        // Verificar que no esté ya reportado
        const key = `${lineIndex}:${startPos}:${foundText.toLowerCase()}`
        if (linkedTargets.has(foundText.toLowerCase())) continue

        // Determinar el nombre correcto para el enlace
        const linkTarget = entity.name

        results.push({
          level: 'info',
          rule: 'semantics/unlinked-entity',
          message: `"${foundText}" debería ser un enlace a [[${linkTarget}]]`,
          line: lineIndex + 1,
          suggestion: `Reemplazar con [[${linkTarget}]]`,
        })

        fixes.push({
          line: lineIndex,
          original: foundText,
          replacement: `[[${linkTarget}]]`,
          start: startPos,
          end: startPos + foundText.length,
        })

        // Marcar como procesado para no reportar múltiples veces
        linkedTargets.add(foundText.toLowerCase())
      }
    }
  })

  // Limitar fixes para no modificar demasiado de golpe
  return {
    results: results.slice(0, 20), // Máximo 20 sugerencias por archivo
    fixes: fixes.slice(0, 10), // Máximo 10 auto-fixes por archivo
  }
}

/**
 * Verifica si una posición está dentro de un wiki-link existente
 */
function isInsideWikiLink(line: string, position: number): boolean {
  // Buscar [[ antes de la posición y ]] después
  const before = line.substring(0, position)
  const after = line.substring(position)

  const hasOpenBefore = before.lastIndexOf('[[') > before.lastIndexOf(']]')
  const hasCloseAfter = after.indexOf(']]') !== -1 && after.indexOf(']]') < after.indexOf('[[')

  return hasOpenBefore || (before.includes('[[') && after.includes(']]') && !after.startsWith('[['))
}

/**
 * Busca entidades similares para sugerir
 */
function findSimilarEntities(text: string, entityIndex: EntityIndex): EntityEntry[] {
  const normalized = text.toLowerCase()
  const results: EntityEntry[] = []

  for (const entity of entityIndex.all) {
    // Calcular similitud simple
    const similarity = calculateSimilarity(normalized, entity.name.toLowerCase())
    if (similarity > 0.5) {
      results.push(entity)
    }
  }

  return results.slice(0, 3) // Top 3 sugerencias
}

/**
 * Calcula similitud entre dos strings (Jaccard simple)
 */
function calculateSimilarity(a: string, b: string): number {
  const setA = new Set(a.split(''))
  const setB = new Set(b.split(''))

  const intersection = new Set([...setA].filter((x) => setB.has(x)))
  const union = new Set([...setA, ...setB])

  return intersection.size / union.size
}

/**
 * Valida referencias cruzadas (eventos mencionados, reglas aplicadas, etc.)
 */
function validateCrossReferences(spec: SpecFile, entityIndex: EntityIndex): ValidationResult[] {
  const results: ValidationResult[] = []

  // Para Use Cases: verificar que los eventos emitidos existan
  if (spec.docType === 'use-case') {
    const eventMentions = spec.content.match(/EVT-[A-Za-z-]+/g) ?? []
    for (const evt of eventMentions) {
      const entity = findEntity(entityIndex, evt)
      if (!entity) {
        results.push({
          level: 'warning',
          rule: 'semantics/undefined-event',
          message: `El evento "${evt}" no tiene definición en /domain/events/`,
          suggestion: `Crea el archivo EVT-${evt.replace('EVT-', '')}.md`,
        })
      }
    }
  }

  // Para Requirements: verificar que los UC referenciados existan
  if (spec.docType === 'requirement') {
    const ucMentions = spec.content.match(/UC-\d{3}/g) ?? []
    for (const uc of [...new Set(ucMentions)]) {
      const entity = findEntity(entityIndex, uc)
      if (!entity) {
        results.push({
          level: 'warning',
          rule: 'semantics/undefined-uc',
          message: `El caso de uso "${uc}" no tiene definición`,
          suggestion: `Verifica que exista ${uc}-*.md en /behavior/use-cases/`,
        })
      }
    }
  }

  // Para cualquier documento: verificar reglas mencionadas
  const ruleMentions = spec.content.match(/RUL-[A-Z]+-\d{3}/g) ?? []
  for (const rule of [...new Set(ruleMentions)]) {
    const entity = findEntity(entityIndex, rule)
    if (!entity) {
      // Extraer el prefijo para sugerir archivo padre
      const parentMatch = rule.match(/^(RUL-[A-Z]+)-\d{3}$/)
      const parentFile = parentMatch ? `${parentMatch[1]}.md` : null

      results.push({
        level: 'info',
        rule: 'semantics/undefined-rule',
        message: `La regla "${rule}" no está definida explícitamente`,
        suggestion: parentFile
          ? `Documéntala como sección "## ${rule}: Título" en /domain/rules/${parentFile}`
          : `Considera documentarla en /domain/rules/`,
      })
    }
  }

  // Para cualquier documento: verificar requisitos individuales mencionados
  const reqIndividualMentions = spec.content.match(/REQ-\d{3}\.\d+/g) ?? []
  for (const req of [...new Set(reqIndividualMentions)]) {
    const entity = findEntity(entityIndex, req)
    if (!entity) {
      // Extraer el ID padre para sugerir archivo
      const parentMatch = req.match(/^(REQ-\d{3})\.\d+$/)
      const parentId = parentMatch ? parentMatch[1] : null

      results.push({
        level: 'info',
        rule: 'semantics/undefined-requirement',
        message: `El requisito "${req}" no está definido`,
        suggestion: parentId
          ? `Documéntalo como sección "## ${req}: Título" en el archivo ${parentId}-*.md`
          : 'Verifica que el requisito exista',
      })
    }
  }

  return results
}

/**
 * Aplica las correcciones de enlaces al archivo
 */
async function applyFixes(
  spec: SpecFile,
  fixes: { line: number; original: string; replacement: string; start: number; end: number }[]
): Promise<boolean> {
  if (fixes.length === 0) return false

  try {
    const lines = spec.content.split('\n')

    // Ordenar fixes de atrás hacia adelante para no afectar posiciones
    const sortedFixes = [...fixes].sort((a, b) => {
      if (a.line !== b.line) return b.line - a.line
      return b.start - a.start
    })

    for (const fix of sortedFixes) {
      const line = lines[fix.line]
      if (!line) continue

      lines[fix.line] = line.substring(0, fix.start) + fix.replacement + line.substring(fix.end)
    }

    // Reconstruir el archivo con frontmatter
    const yaml = await import('gray-matter')
    const originalFile = await Bun.file(spec.path).text()
    const { data: frontmatter } = yaml.default(originalFile)

    const newContent = yaml.default.stringify(lines.join('\n'), frontmatter)

    await writeFile(spec.path, newContent, 'utf-8')
    return true
  } catch (error) {
    console.error(`Error aplicando fixes a ${spec.path}:`, error)
    return false
  }
}

/**
 * Valida que las entidades de dominio estén capitalizadas correctamente
 * Las entidades deben escribirse con mayúscula inicial (ej: "Order", no "order")
 */
function validateEntityCapitalization(spec: SpecFile, entityIndex: EntityIndex): ValidationResult[] {
  const results: ValidationResult[] = []
  const lines = spec.content.split('\n')
  const reportedIssues = new Set<string>()

  // Solo validar entidades de tipo 'entity' (no eventos, reglas, etc.)
  const domainEntities = entityIndex.all.filter(
    (e) => e.type === 'entity' && e.name.length > 2
  )

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]
    const lineNumber = lineIndex + 1

    // Ignorar líneas de código, frontmatter, headings
    if (line.trim().startsWith('```')) continue
    if (line.trim().startsWith('#')) continue
    if (line.trim().startsWith('|')) continue // Tablas
    if (line.trim().startsWith('---')) continue

    for (const entity of domainEntities) {
      const entityName = entity.name
      const lowercaseName = entityName.toLowerCase()

      // Buscar menciones en minúscula (word boundary)
      const lowercaseRegex = new RegExp(`\\b${escapeRegex(lowercaseName)}\\b`, 'g')

      let match
      while ((match = lowercaseRegex.exec(line)) !== null) {
        const foundText = match[0]
        const startPos = match.index

        // Verificar que realmente está en minúscula (no es el nombre correcto)
        if (foundText === entityName) continue

        // Verificar que no está dentro de un wiki-link
        if (isInsideWikiLink(line, startPos)) continue

        // Verificar que no está en un bloque de código inline
        if (isInsideInlineCode(line, startPos)) continue

        // Verificar que la primera letra es minúscula
        if (foundText[0] === foundText[0].toUpperCase()) continue

        // Evitar reportar la misma entidad múltiples veces por archivo
        const issueKey = `${entityName}:${lineNumber}`
        if (reportedIssues.has(issueKey)) continue
        reportedIssues.add(issueKey)

        results.push({
          level: 'info',
          rule: 'semantics/entity-capitalization',
          message: `"${foundText}" debería capitalizarse como "${entityName}"`,
          line: lineNumber,
          suggestion: `Las entidades de dominio van con mayúscula inicial: "${entityName}"`,
        })
      }
    }
  }

  // Limitar resultados para no saturar
  return results.slice(0, 10)
}

/**
 * Verifica si una posición está dentro de código inline (`code`)
 */
function isInsideInlineCode(line: string, position: number): boolean {
  let insideCode = false
  for (let i = 0; i < position; i++) {
    if (line[i] === '`' && line[i - 1] !== '\\') {
      insideCode = !insideCode
    }
  }
  return insideCode
}

/**
 * Escapa caracteres especiales para usar en regex
 */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
