/**
 * Validador de estructura
 * Nivel 2: Valida que el documento tenga las secciones requeridas según plantilla
 *
 * Ahora usa plantillas dinámicas desde /kdd_templates
 */

import type { SpecFile, ValidationResult } from '../lib/parser'
import { getTemplateSchema, type SectionSchema, type TemplateSchema } from '../lib/template-loader'
import { getStructureTemplate } from '../schemas/structure'

/**
 * Valida la estructura de un archivo de especificación
 */
export async function validateStructure(spec: SpecFile): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []

  // Si es tipo unknown, no validamos estructura
  if (spec.docType === 'unknown') {
    return results
  }

  // Intentar obtener template desde plantillas KDD
  const template = await getTemplateSchema(spec.docType)

  if (template && template.sections.length > 0) {
    // Usar template dinámico
    results.push(...validateWithDynamicTemplate(spec, template))
  } else {
    // Fallback a templates hardcodeados
    results.push(...validateWithLegacyTemplate(spec))
  }

  // Validaciones comunes
  results.push(...validateCommonRules(spec))

  return results
}

/**
 * Validación usando plantilla dinámica
 */
function validateWithDynamicTemplate(spec: SpecFile, template: TemplateSchema): ValidationResult[] {
  const results: ValidationResult[] = []
  const { headings } = spec

  // Validar H1 si hay patrón
  if (template.titlePattern) {
    const h1 = headings.find((h) => h.level === 1)
    if (!h1) {
      results.push({
        level: 'error',
        rule: 'structure/missing-h1',
        message: 'El documento debe tener un título H1',
        suggestion: 'Añade un título principal con # al inicio del documento',
      })
    } else if (!template.titlePattern.test(h1.text)) {
      results.push({
        level: 'warning',
        rule: 'structure/h1-format',
        message: `El título "${h1.text}" no sigue el formato esperado`,
        line: h1.line,
        suggestion: `Formato esperado: ${template.titlePattern.toString()}`,
      })
    }
  }

  // Validar secciones requeridas
  for (const section of template.sections) {
    if (section.required) {
      const found = findSectionDynamic(headings, section)

      if (!found) {
        results.push({
          level: 'error',
          rule: 'structure/missing-section',
          message: `Falta la sección requerida "${section.name}"`,
          suggestion: `Añade una sección ${'#'.repeat(section.level)} ${section.name}`,
        })
      }
    }
  }

  // Validar contenido esperado (expects)
  results.push(...validateExpectedContent(spec, template))

  return results
}

/**
 * Busca una sección usando el schema dinámico
 */
function findSectionDynamic(
  headings: { level: number; text: string; line: number }[],
  section: SectionSchema
): { level: number; text: string; line: number } | undefined {
  for (const h of headings) {
    if (h.level !== section.level) continue

    // Coincidencia exacta (normalizada)
    if (normalizeHeading(h.text) === normalizeHeading(section.name)) {
      return h
    }

    // Coincidencia por patrón
    if (section.pattern && section.pattern.test(h.text)) {
      return h
    }

    // Coincidencia por aliases
    for (const alias of section.aliases) {
      if (normalizeHeading(h.text).includes(normalizeHeading(alias))) {
        return h
      }
      // Alias como regex
      try {
        const aliasRegex = new RegExp(alias, 'i')
        if (aliasRegex.test(h.text)) {
          return h
        }
      } catch {
        // No es regex válido, ignorar
      }
    }
  }

  return undefined
}

/**
 * Valida que el contenido esperado esté presente
 */
function validateExpectedContent(spec: SpecFile, template: TemplateSchema): ValidationResult[] {
  const results: ValidationResult[] = []

  for (const section of template.sections) {
    if (!section.expects) continue

    // Buscar la sección
    const found = findSectionDynamic(spec.headings, section)
    if (!found) continue

    // Buscar el contenido esperado después de la sección
    const sectionIndex = spec.headings.indexOf(found)
    const nextSection = spec.headings[sectionIndex + 1]

    const startLine = found.line
    const endLine = nextSection?.line ?? spec.content.split('\n').length

    const sectionContent = spec.content
      .split('\n')
      .slice(startLine, endLine)
      .join('\n')

    // Verificar tipo de contenido esperado
    const [type, subtype] = section.expects.split(':')

    let hasExpected = false

    switch (type) {
      case 'mermaid':
        hasExpected = sectionContent.includes('```mermaid')
        if (subtype) {
          hasExpected = hasExpected && sectionContent.includes(subtype)
        }
        break
      case 'json':
        hasExpected = sectionContent.includes('```json')
        break
      case 'gherkin':
        hasExpected = sectionContent.includes('```gherkin')
        break
      case 'typescript':
        hasExpected = sectionContent.includes('```typescript') || sectionContent.includes('```ts')
        break
      case 'yaml':
        hasExpected = sectionContent.includes('```yaml')
        break
    }

    if (!hasExpected) {
      results.push({
        level: 'info',
        rule: 'structure/missing-expected-content',
        message: `La sección "${section.name}" debería incluir un bloque ${section.expects}`,
        line: found.line,
        suggestion: `Añade un bloque \`\`\`${type} con el contenido esperado`,
      })
    }
  }

  return results
}

/**
 * Validación usando template legacy (hardcodeado)
 */
function validateWithLegacyTemplate(spec: SpecFile): ValidationResult[] {
  const results: ValidationResult[] = []
  const template = getStructureTemplate(spec.docType)
  const { headings } = spec

  // Validar H1
  if (template.requiresH1) {
    const h1 = headings.find((h) => h.level === 1)

    if (!h1) {
      results.push({
        level: 'error',
        rule: 'structure/missing-h1',
        message: 'El documento debe tener un título H1',
        suggestion: 'Añade un título principal con # al inicio del documento',
      })
    } else if (template.h1Pattern && !template.h1Pattern.test(h1.text)) {
      results.push({
        level: 'warning',
        rule: 'structure/h1-format',
        message: `El título "${h1.text}" no sigue el formato esperado`,
        line: h1.line,
        suggestion: `Formato esperado: ${template.h1Pattern.toString()}`,
      })
    }
  }

  // Validar secciones requeridas
  for (const section of template.sections) {
    if (section.required) {
      const found = findSectionLegacy(headings, section)

      if (!found) {
        results.push({
          level: 'error',
          rule: 'structure/missing-section',
          message: `Falta la sección requerida "${section.name}"`,
          suggestion: section.description || `Añade una sección ## ${section.name}`,
        })
      }
    }
  }

  return results
}

/**
 * Busca una sección usando definición legacy
 */
function findSectionLegacy(
  headings: { level: number; text: string; line: number }[],
  section: { name: string; level: number; alternatives?: RegExp[] }
): { level: number; text: string; line: number } | undefined {
  // Por nombre exacto
  const exactMatch = headings.find(
    (h) => h.level === section.level && normalizeHeading(h.text) === normalizeHeading(section.name)
  )
  if (exactMatch) return exactMatch

  // Por alternativas
  if (section.alternatives) {
    for (const alt of section.alternatives) {
      const altMatch = headings.find((h) => h.level === section.level && alt.test(h.text))
      if (altMatch) return altMatch
    }
  }

  // Por prefijo
  if (section.name.endsWith('-')) {
    const prefixMatch = headings.find(
      (h) => h.level === section.level && h.text.startsWith(section.name)
    )
    if (prefixMatch) return prefixMatch
  }

  return undefined
}

/**
 * Validaciones comunes a todos los documentos
 */
function validateCommonRules(spec: SpecFile): ValidationResult[] {
  const results: ValidationResult[] = []
  const { headings } = spec

  // Solo un H1
  const h1Count = headings.filter((h) => h.level === 1).length
  if (h1Count > 1) {
    results.push({
      level: 'warning',
      rule: 'structure/multiple-h1',
      message: `El documento tiene ${h1Count} títulos H1, debería tener solo uno`,
      suggestion: 'Usa ## para las secciones principales',
    })
  }

  // Detectar secciones vacías
  results.push(...validateEmptySections(spec))

  return results
}

/**
 * Detecta secciones vacías
 */
function validateEmptySections(spec: SpecFile): ValidationResult[] {
  const results: ValidationResult[] = []
  const lines = spec.content.split('\n')
  const { headings } = spec

  for (let i = 0; i < headings.length - 1; i++) {
    const current = headings[i]
    const next = headings[i + 1]

    // Solo verificar si el siguiente heading es del mismo nivel o mayor
    if (next.level <= current.level) {
      let contentLines = 0
      for (let lineNum = current.line; lineNum < next.line - 1; lineNum++) {
        const line = lines[lineNum]?.trim() ?? ''
        if (line && !line.startsWith('#') && !line.startsWith('<!--')) {
          contentLines++
        }
      }

      if (contentLines === 0) {
        results.push({
          level: 'warning',
          rule: 'structure/empty-section',
          message: `La sección "${current.text}" parece estar vacía`,
          line: current.line,
          suggestion: 'Añade contenido o elimina la sección si no es necesaria',
        })
      }
    }
  }

  return results
}

/**
 * Normaliza un heading para comparación
 */
function normalizeHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^\w\s]/g, '')
    .trim()
}
