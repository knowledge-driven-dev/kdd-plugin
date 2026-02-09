/**
 * Schemas Zod para validación de frontmatter por tipo de documento
 */

import { z } from 'zod'
import type { DocType } from '../lib/parser'

// Valores comunes
const statusSchema = z.enum(['draft', 'review', 'proposed', 'approved', 'deprecated']).optional()
const tagsSchema = z.array(z.string()).optional()
const domainSchema = z.string().optional()

// =============================================================================
// Schema: Use Case (UC-xxx)
// =============================================================================
export const useCaseFrontmatterSchema = z.object({
  id: z
    .string()
    .regex(/^UC-\d{3}/, 'El ID debe seguir el formato UC-XXX')
    .describe('Identificador único del caso de uso'),
  version: z.number().int().positive().optional(),
  status: statusSchema,
  actor: z.string().min(1, 'El actor principal es requerido'),
  domain: domainSchema,
  tags: tagsSchema,
})

// =============================================================================
// Schema: Requirement (REQ-xxx)
// =============================================================================
export const requirementFrontmatterSchema = z.object({
  id: z
    .string()
    .regex(/^REQ-\d{3}/, 'El ID debe seguir el formato REQ-XXX')
    .describe('Identificador único del requisito'),
  kind: z.enum(['requirement', 'requirements']).optional(),
  status: statusSchema,
  source: z
    .string()
    .regex(/^UC-\d{3}/, 'El source debe referenciar un caso de uso UC-XXX')
    .optional(),
  domain: domainSchema,
  tags: tagsSchema,
})

// =============================================================================
// Schema: Entity
// =============================================================================
export const entityFrontmatterSchema = z.object({
  kind: z.literal('entity').optional(),
  aliases: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})

// =============================================================================
// Schema: Event (EVT-xxx)
// =============================================================================
export const eventFrontmatterSchema = z.object({
  kind: z.literal('event').optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional().describe('Entidad que emite el evento'),
})

// =============================================================================
// Schema: Rule (RUL-xxx)
// =============================================================================
export const ruleFrontmatterSchema = z.object({
  kind: z.enum(['rule', 'rules']).optional(),
  entity: z.string().optional().describe('Entidad principal afectada'),
  domain: domainSchema,
  tags: tagsSchema,
})

// =============================================================================
// Schema: Process (PRC-xxx)
// =============================================================================
export const processFrontmatterSchema = z.object({
  id: z
    .string()
    .regex(/^PRC-\d{3}/, 'El ID debe seguir el formato PRC-XXX')
    .optional(),
  kind: z.literal('process').optional(),
  status: statusSchema,
  domain: domainSchema,
  tags: tagsSchema,
})

// =============================================================================
// Schema: PRD
// =============================================================================
export const prdFrontmatterSchema = z.object({
  id: z.string().regex(/^PRD-/, 'El ID debe comenzar con PRD-').optional(),
  kind: z.literal('prd').optional(),
  status: statusSchema,
  owner: z.string().optional(),
  stakeholders: z.array(z.string()).optional(),
  related: z.array(z.string()).optional(),
  success_metrics: z.array(z.string()).optional(),
  release_criteria: z.array(z.string()).optional(),
})

// =============================================================================
// Schema: Story (US-xxx, STORY-xxx)
// =============================================================================
export const storyFrontmatterSchema = z.object({
  id: z
    .string()
    .regex(/^(US-|STORY-)/, 'El ID debe comenzar con US- o STORY-')
    .optional(),
  kind: z.literal('story').optional(),
  status: statusSchema,
  related: z.array(z.string()).optional(),
})

// =============================================================================
// Schema: NFR
// =============================================================================
export const nfrFrontmatterSchema = z.object({
  id: z.string().regex(/^NFR-/, 'El ID debe comenzar con NFR-').optional(),
  kind: z.literal('nfr').optional(),
  status: statusSchema,
})

// =============================================================================
// Schema: ADR
// =============================================================================
export const adrFrontmatterSchema = z.object({
  id: z.string().regex(/^ADR-\d{4}/, 'El ID debe seguir el formato ADR-XXXX').optional(),
  kind: z.literal('adr').optional(),
  status: statusSchema,
})

// =============================================================================
// Schema: Unknown (mínimo requerido)
// =============================================================================
export const unknownFrontmatterSchema = z.object({}).passthrough()

// =============================================================================
// Mapa de schemas por tipo
// =============================================================================
export const frontmatterSchemas: Record<DocType, z.ZodSchema> = {
  'use-case': useCaseFrontmatterSchema,
  requirement: requirementFrontmatterSchema,
  entity: entityFrontmatterSchema,
  event: eventFrontmatterSchema,
  rule: ruleFrontmatterSchema,
  process: processFrontmatterSchema,
  prd: prdFrontmatterSchema,
  story: storyFrontmatterSchema,
  nfr: nfrFrontmatterSchema,
  adr: adrFrontmatterSchema,
  objective: unknownFrontmatterSchema,
  'value-unit': unknownFrontmatterSchema,
  release: unknownFrontmatterSchema,
  command: unknownFrontmatterSchema,
  query: unknownFrontmatterSchema,
  'ui-view': unknownFrontmatterSchema,
  'ui-component': unknownFrontmatterSchema,
  'ui-layout': unknownFrontmatterSchema,
  'ui-modal': unknownFrontmatterSchema,
  'ui-flow': unknownFrontmatterSchema,
  unknown: unknownFrontmatterSchema,
}

/**
 * Obtiene el schema de frontmatter para un tipo de documento
 */
export function getFrontmatterSchema(docType: DocType): z.ZodSchema {
  return frontmatterSchemas[docType] ?? unknownFrontmatterSchema
}
