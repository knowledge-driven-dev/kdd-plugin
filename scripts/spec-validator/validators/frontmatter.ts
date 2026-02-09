/**
 * Validador de frontmatter
 * Nivel 1: Valida que el frontmatter YAML cumpla con el schema de la plantilla
 *
 * Ahora usa plantillas dinámicas desde /kdd_templates
 */

import { z } from 'zod'
import type { SpecFile, ValidationResult } from '../lib/parser'
import { getTemplateSchema, buildZodSchema, type TemplateSchema } from '../lib/template-loader'
import { getFrontmatterSchema as getLegacySchema } from '../schemas/frontmatter'

/**
 * Valida el frontmatter de un archivo de especificación
 */
export async function validateFrontmatter(spec: SpecFile): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []

  // Si no hay frontmatter, es un warning (no error)
  if (!spec.frontmatter || Object.keys(spec.frontmatter).length === 0) {
    if (spec.docType !== 'unknown') {
      results.push({
        level: 'warning',
        rule: 'frontmatter/missing',
        message: `Archivo de tipo "${spec.docType}" sin frontmatter`,
        suggestion: 'Añade un bloque YAML al inicio del archivo con los campos requeridos',
      })
    }
    return results
  }

  // Intentar obtener schema desde plantilla
  const template = await getTemplateSchema(spec.docType)

  let schema: z.ZodSchema

  if (template && template.frontmatter.length > 0) {
    // Usar schema dinámico desde plantilla
    schema = buildZodSchema(template.frontmatter)
  } else {
    // Fallback a schema hardcodeado
    schema = getLegacySchema(spec.docType)
  }

  try {
    schema.parse(spec.frontmatter)
  } catch (error) {
    if (error instanceof z.ZodError) {
      for (const issue of error.issues) {
        results.push({
          level: issue.message.includes('requerido') || issue.code === 'invalid_type' ? 'error' : 'warning',
          rule: `frontmatter/${issue.path.join('.') || 'schema'}`,
          message: formatZodIssue(issue),
          line: 1,
          suggestion: getSuggestion(issue, template),
        })
      }
    }
  }

  // Validaciones adicionales específicas por tipo
  results.push(...(await validateTypeSpecificRules(spec, template)))

  return results
}

// Versión síncrona para compatibilidad (usa caché de plantillas)
export function validateFrontmatterSync(spec: SpecFile): ValidationResult[] {
  // Esta versión usa solo schemas legacy
  const results: ValidationResult[] = []

  if (!spec.frontmatter || Object.keys(spec.frontmatter).length === 0) {
    if (spec.docType !== 'unknown') {
      results.push({
        level: 'warning',
        rule: 'frontmatter/missing',
        message: `Archivo de tipo "${spec.docType}" sin frontmatter`,
        suggestion: 'Añade un bloque YAML al inicio del archivo con los campos requeridos',
      })
    }
    return results
  }

  const schema = getLegacySchema(spec.docType)

  try {
    schema.parse(spec.frontmatter)
  } catch (error) {
    if (error instanceof z.ZodError) {
      for (const issue of error.issues) {
        results.push({
          level: issue.message.includes('requerido') ? 'error' : 'warning',
          rule: `frontmatter/${issue.path.join('.')}`,
          message: formatZodIssue(issue),
          line: 1,
          suggestion: getSuggestion(issue, null),
        })
      }
    }
  }

  return results
}

/**
 * Formatea un issue de Zod en mensaje legible
 */
function formatZodIssue(issue: z.ZodIssue): string {
  const path = issue.path.length > 0 ? `"${issue.path.join('.')}"` : 'frontmatter'

  switch (issue.code) {
    case 'invalid_type':
      return `${path}: se esperaba ${issue.expected}, se recibió ${issue.received}`
    case 'invalid_string':
      if (issue.validation === 'regex') {
        return `${path}: formato inválido`
      }
      return `${path}: ${issue.message}`
    case 'too_small':
      return `${path}: debe tener al menos ${issue.minimum} caracteres`
    case 'too_big':
      return `${path}: no debe exceder ${issue.maximum} caracteres`
    case 'invalid_enum_value':
      return `${path}: valor inválido. Valores permitidos: ${issue.options.join(', ')}`
    case 'invalid_literal':
      return `${path}: valor inválido. Valor esperado: ${issue.expected}`
    default:
      return `${path}: ${issue.message}`
  }
}

/**
 * Genera sugerencia de corrección para un issue
 */
function getSuggestion(issue: z.ZodIssue, template: TemplateSchema | null): string | undefined {
  const field = issue.path[0] as string

  // Buscar descripción en el template
  if (template) {
    const fieldSchema = template.frontmatter.find((f) => f.name === field)
    if (fieldSchema?.description) {
      return fieldSchema.description
    }
  }

  // Sugerencias genéricas
  switch (field) {
    case 'id':
      return 'Usa el formato correcto según el tipo: UC-001, REQ-001, EVT-xxx, etc.'
    case 'status':
      return 'Valores válidos: draft, review, proposed, approved, deprecated'
    case 'tags':
      return 'tags debe ser un array de strings, ej: tags: [entity, core]'
    case 'actor':
      return 'Especifica el actor principal del caso de uso'
    case 'kind':
      return 'Usa el valor literal correspondiente al tipo de documento'
    default:
      return undefined
  }
}

/**
 * Validaciones específicas por tipo de documento
 */
async function validateTypeSpecificRules(
  spec: SpecFile,
  template: TemplateSchema | null
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []
  const { frontmatter, docType, path } = spec

  // Validar que el archivo coincida con el patrón de nombre esperado
  if (template?.filePattern) {
    const fileName = path.split('/').pop() ?? ''
    if (!template.filePattern.test(fileName)) {
      results.push({
        level: 'info',
        rule: 'frontmatter/file-pattern',
        message: `El nombre del archivo "${fileName}" no sigue el patrón esperado`,
        suggestion: `Patrón esperado: ${template.filePattern.toString()}`,
      })
    }
  }

  // Validar que el archivo esté en el path correcto
  if (template?.pathPattern) {
    if (!template.pathPattern.test(path)) {
      results.push({
        level: 'info',
        rule: 'frontmatter/path-pattern',
        message: `El archivo no está en la ubicación esperada`,
        suggestion: `Ubicación esperada: ${template.pathPattern.toString()}`,
      })
    }
  }

  // Use Case: verificar que el ID coincida con el nombre del archivo
  if (docType === 'use-case') {
    const fileName = path.split('/').pop()?.replace('.md', '') ?? ''
    const id = frontmatter.id as string | undefined

    if (id && !fileName.startsWith(id)) {
      results.push({
        level: 'warning',
        rule: 'frontmatter/id-mismatch',
        message: `El ID "${id}" no coincide con el nombre del archivo "${fileName}"`,
        suggestion: 'El nombre del archivo debería empezar con el ID del documento',
      })
    }
  }

  // Requirement: verificar source
  if (docType === 'requirement') {
    const source = frontmatter.source as string | undefined
    if (source && !source.match(/^UC-\d{3}/)) {
      results.push({
        level: 'warning',
        rule: 'frontmatter/invalid-source',
        message: `El source "${source}" no referencia un caso de uso válido`,
        suggestion: 'El source debe referenciar un UC-XXX existente',
      })
    }
  }

  // Entity: verificar tag
  if (docType === 'entity') {
    const tags = (frontmatter.tags as string[]) ?? []
    const kind = frontmatter.kind as string | undefined
    if (kind !== 'entity' && !tags.includes('entity')) {
      results.push({
        level: 'info',
        rule: 'frontmatter/missing-entity-kind',
        message: 'Las entidades deberían declarar kind: entity (o tag "entity")',
        suggestion: 'Añade "kind: entity" en el frontmatter',
      })
    }
  }

  // Event: verificar tag
  if (docType === 'event') {
    const tags = (frontmatter.tags as string[]) ?? []
    const kind = frontmatter.kind as string | undefined
    if (kind !== 'event' && !tags.includes('event')) {
      results.push({
        level: 'info',
        rule: 'frontmatter/missing-event-kind',
        message: 'Los eventos deberían declarar kind: event (o tag "event")',
        suggestion: 'Añade "kind: event" en el frontmatter',
      })
    }
  }

  return results
}
