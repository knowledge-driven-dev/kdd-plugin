/**
 * Template Loader
 * Carga y parsea las plantillas KDD para extraer schemas de validación
 */

import { readFile, readdir } from 'fs/promises'
import { join, basename } from 'path'
import matter from 'gray-matter'
import { z } from 'zod'
import type { DocType } from './parser'

// =============================================================================
// Tipos
// =============================================================================

export interface FieldSchema {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'date'
  required: boolean
  pattern?: RegExp
  enum?: string[]
  literal?: string
  default?: unknown
  contains?: string // Para arrays que deben contener un valor
  description?: string
}

export interface SectionSchema {
  name: string
  level: number
  required: boolean
  aliases: string[]
  pattern?: RegExp
  expects?: string // Tipo de contenido esperado (mermaid, json, gherkin, etc.)
}

export interface TemplateSchema {
  type: DocType
  description: string
  filePattern?: RegExp
  pathPattern?: RegExp
  frontmatter: FieldSchema[]
  sections: SectionSchema[]
  titlePattern?: RegExp
  titleIsName?: boolean
}

export interface TemplateIndex {
  byType: Map<DocType, TemplateSchema>
  all: TemplateSchema[]
}

// =============================================================================
// Loader principal
// =============================================================================

const TEMPLATES_DIR = join(import.meta.dir, '../../../kdd/templates')

let cachedIndex: TemplateIndex | null = null

/**
 * Carga todas las plantillas y construye el índice
 */
export async function loadTemplates(): Promise<TemplateIndex> {
  if (cachedIndex) return cachedIndex

  const index: TemplateIndex = {
    byType: new Map(),
    all: [],
  }

  try {
    const files = await readdir(TEMPLATES_DIR)
    const templateFiles = files.filter((f) => f.endsWith('.template.md'))

    for (const file of templateFiles) {
      const template = await parseTemplate(join(TEMPLATES_DIR, file))
      if (template) {
        index.all.push(template)
        index.byType.set(template.type, template)
      }
    }
  } catch (error) {
    console.warn('No se pudieron cargar las plantillas KDD:', error)
  }

  cachedIndex = index
  return index
}

/**
 * Obtiene el schema para un tipo de documento
 */
export async function getTemplateSchema(docType: DocType): Promise<TemplateSchema | null> {
  const index = await loadTemplates()
  return index.byType.get(docType) ?? null
}

/**
 * Invalida el caché (útil para hot-reload)
 */
export function invalidateTemplateCache(): void {
  cachedIndex = null
}

// =============================================================================
// Parser de plantillas
// =============================================================================

/**
 * Parsea una plantilla y extrae el schema
 */
async function parseTemplate(filePath: string): Promise<TemplateSchema | null> {
  try {
    const raw = await readFile(filePath, 'utf-8')
    const { data: frontmatter, content } = matter(raw)

    // Extraer metadatos de la plantilla desde comentarios en frontmatter
    const type = extractMetaValue(raw, '@type') as DocType
    if (!type) return null

    const description = extractMetaValue(raw, '@description') ?? ''
    const filePatternStr = extractMetaValue(raw, '@file-pattern')
    const pathPatternStr = extractMetaValue(raw, '@path-pattern')

    // Parsear campos del frontmatter
    const frontmatterSchema = parseFrontmatterSchema(raw, frontmatter)

    // Parsear secciones del contenido
    const sections = parseSectionsSchema(content)

    // Extraer patrón del título
    const titlePattern = extractTitlePattern(content)
    const titleIsName = content.includes('<!-- title-is-name')

    return {
      type,
      description,
      filePattern: filePatternStr ? new RegExp(filePatternStr) : undefined,
      pathPattern: pathPatternStr ? new RegExp(pathPatternStr) : undefined,
      frontmatter: frontmatterSchema,
      sections,
      titlePattern,
      titleIsName,
    }
  } catch (error) {
    console.warn(`Error parseando plantilla ${filePath}:`, error)
    return null
  }
}

/**
 * Extrae un valor de metadato (# @key: value)
 */
function extractMetaValue(content: string, key: string): string | null {
  const regex = new RegExp(`#\\s*${key}:\\s*(.+)$`, 'm')
  const match = content.match(regex)
  return match ? match[1].trim() : null
}

/**
 * Parsea el schema de frontmatter desde los comentarios
 */
function parseFrontmatterSchema(
  raw: string,
  frontmatter: Record<string, unknown>
): FieldSchema[] {
  const fields: FieldSchema[] = []
  const lines = raw.split('\n')

  // Buscar líneas dentro del frontmatter con anotaciones
  let inFrontmatter = false

  for (const line of lines) {
    if (line.trim() === '---') {
      inFrontmatter = !inFrontmatter
      continue
    }

    if (!inFrontmatter) continue

    // Ignorar comentarios puros de metadatos (@type, @description, etc.)
    if (line.trim().startsWith('# @type:') || line.trim().startsWith('# @description:')) {
      continue
    }

    // Parsear línea de campo: "nombre: valor  # @anotaciones"
    const fieldMatch = line.match(/^(\w+):\s*(.+?)\s*(#\s*@.+)?$/)
    if (!fieldMatch) continue

    const [, name, defaultValue, annotations] = fieldMatch

    // Ignorar campos que son solo comentarios de metadatos
    if (name.startsWith('#')) continue

    const field: FieldSchema = {
      name,
      type: 'string',
      required: false,
    }

    // Parsear anotaciones
    if (annotations) {
      const annotationStr = annotations.replace(/^#\s*/, '')

      // @required
      if (annotationStr.includes('@required')) {
        field.required = true
      }

      // @optional (explícito, por defecto es opcional)
      // No hace nada, solo documenta

      // @type: string|number|boolean|array|date
      const typeMatch = annotationStr.match(/@type:\s*(\w+)/)
      if (typeMatch) {
        field.type = typeMatch[1] as FieldSchema['type']
      }

      // @pattern: regex
      const patternMatch = annotationStr.match(/@pattern:\s*(.+?)(?:\s+@|$)/)
      if (patternMatch) {
        try {
          field.pattern = new RegExp(patternMatch[1].trim())
        } catch {
          // Regex inválido, ignorar
        }
      }

      // @enum: value1|value2|value3
      const enumMatch = annotationStr.match(/@enum:\s*([^@]+)/)
      if (enumMatch) {
        field.enum = enumMatch[1].trim().split('|').map((v) => v.trim())
      }

      // @literal: value (valor exacto esperado)
      const literalMatch = annotationStr.match(/@literal:\s*(\w+)/)
      if (literalMatch) {
        field.literal = literalMatch[1]
      }

      // @default: value
      const defaultMatch = annotationStr.match(/@default:\s*(\w+)/)
      if (defaultMatch) {
        field.default = defaultMatch[1]
      }

      // @contains: value (para arrays)
      const containsMatch = annotationStr.match(/@contains:\s*(\w+)/)
      if (containsMatch) {
        field.contains = containsMatch[1]
        field.type = 'array'
      }

      // @description: texto
      const descMatch = annotationStr.match(/@description:\s*(.+?)(?:\s+@|$)/)
      if (descMatch) {
        field.description = descMatch[1].trim()
      }
    }

    // Inferir tipo del valor por defecto si no está anotado
    if (field.type === 'string') {
      if (Array.isArray(frontmatter[name])) {
        field.type = 'array'
      } else if (typeof frontmatter[name] === 'number') {
        field.type = 'number'
      } else if (typeof frontmatter[name] === 'boolean') {
        field.type = 'boolean'
      }
    }

    fields.push(field)
  }

  return fields
}

/**
 * Parsea el schema de secciones desde el contenido markdown
 */
function parseSectionsSchema(content: string): SectionSchema[] {
  const sections: SectionSchema[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Buscar headings: ## Nombre <!-- anotaciones -->
    const headingMatch = line.match(/^(#{1,6})\s+(.+?)(?:\s*<!--\s*(.+?)\s*-->)?$/)
    if (!headingMatch) continue

    const [, hashes, nameWithPattern, annotations] = headingMatch
    const level = hashes.length

    // Extraer nombre limpio y posible patrón
    let name = nameWithPattern.trim()
    let pattern: RegExp | undefined

    // Si el nombre tiene un patrón inline (ej: "REQ-NNN.1: Nombre")
    const patternInName = annotations?.match(/pattern:\s*(.+?)(?:\s|$)/)
    if (patternInName) {
      try {
        pattern = new RegExp(patternInName[1])
      } catch {
        // Ignorar
      }
    }

    const section: SectionSchema = {
      name,
      level,
      required: false,
      aliases: [],
    }

    // Parsear anotaciones
    if (annotations) {
      // required / optional
      if (annotations.includes('required')) {
        section.required = true
      }

      // required-pattern: (sección requerida identificada por patrón)
      const reqPatternMatch = annotations.match(/required-pattern:\s*(.+?)(?:\s|$)/)
      if (reqPatternMatch) {
        section.required = true
        try {
          section.pattern = new RegExp(reqPatternMatch[1])
        } catch {
          // Ignorar
        }
      }

      // pattern: (sin required)
      if (!section.pattern && pattern) {
        section.pattern = pattern
      }

      // alias: "Alias1|Alias2"
      const aliasMatch = annotations.match(/alias:\s*"?([^"]+)"?/)
      if (aliasMatch) {
        section.aliases = aliasMatch[1].split('|').map((a) => a.trim())
      }

      // expects: tipo (mermaid, json, gherkin, typescript, yaml)
      const expectsMatch = annotations.match(/expects:\s*(\S+)/)
      if (expectsMatch) {
        section.expects = expectsMatch[1]
      }
    }

    // Buscar expects en la siguiente línea (comentario separado)
    if (i + 1 < lines.length) {
      const nextLine = lines[i + 1]
      const expectsInNext = nextLine.match(/<!--\s*expects:\s*(\S+)\s*-->/)
      if (expectsInNext) {
        section.expects = expectsInNext[1]
      }
    }

    sections.push(section)
  }

  return sections
}

/**
 * Extrae el patrón del título (H1)
 */
function extractTitlePattern(content: string): RegExp | undefined {
  const h1Match = content.match(/^#\s+.+?<!--.*?pattern:\s*(.+?)(?:\s|-->)/m)
  if (h1Match) {
    try {
      return new RegExp(h1Match[1])
    } catch {
      return undefined
    }
  }
  return undefined
}

// =============================================================================
// Generador de Zod Schema
// =============================================================================

/**
 * Genera un schema Zod dinámico desde el FieldSchema
 */
export function buildZodSchema(fields: FieldSchema[]): z.ZodSchema {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny

    // Tipo base
    switch (field.type) {
      case 'number':
        fieldSchema = z.number()
        break
      case 'boolean':
        fieldSchema = z.boolean()
        break
      case 'array':
        fieldSchema = z.array(z.string())
        break
      case 'date':
        fieldSchema = z.string() // Las fechas vienen como string en YAML
        break
      default:
        fieldSchema = z.string()
    }

    // Literal (valor exacto)
    if (field.literal) {
      fieldSchema = z.literal(field.literal)
    }

    // Enum
    if (field.enum && field.enum.length > 0) {
      fieldSchema = z.enum(field.enum as [string, ...string[]])
    }

    // Pattern (regex)
    if (field.pattern && field.type === 'string') {
      fieldSchema = z.string().regex(field.pattern, `Formato inválido para ${field.name}`)
    }

    // Contains (para arrays)
    if (field.contains && field.type === 'array') {
      fieldSchema = z.array(z.string()).refine(
        (arr) => arr.includes(field.contains!),
        { message: `El array debe contener "${field.contains}"` }
      )
    }

    // Default
    if (field.default !== undefined) {
      fieldSchema = fieldSchema.default(field.default)
    }

    // Optional/Required
    if (!field.required) {
      fieldSchema = fieldSchema.optional()
    }

    shape[field.name] = fieldSchema
  }

  return z.object(shape).passthrough() // passthrough permite campos adicionales
}
