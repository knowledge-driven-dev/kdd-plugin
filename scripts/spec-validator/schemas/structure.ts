/**
 * Expected structure definition (sections) per document type
 */

import type { DocType } from '../lib/parser'

export interface SectionDefinition {
  /** Section name (heading) */
  name: string
  /** Heading level (1, 2, 3...) */
  level: number
  /** Whether it's required */
  required: boolean
  /** Alternative accepted patterns (regex) */
  alternatives?: RegExp[]
  /** Description for error messages */
  description?: string
}

export interface StructureTemplate {
  /** Expected sections */
  sections: SectionDefinition[]
  /** Whether it requires a unique H1 */
  requiresH1: boolean
  /** Regex to validate H1 format */
  h1Pattern?: RegExp
}

// =============================================================================
// Template: Use Case (UC-xxx)
// =============================================================================
const useCaseTemplate: StructureTemplate = {
  requiresH1: true,
  h1Pattern: /^UC-\d{3}:\s*.+/,
  sections: [
    { name: 'Description', level: 2, required: true, alternatives: [/^Descripción/i] },
    { name: 'Actors', level: 2, required: true, alternatives: [/^(Actor(es)?|Actores)/i] },
    { name: 'Triggers', level: 2, required: false, alternatives: [/^(Trigger(s)?|Disparadores)/i] },
    { name: 'Preconditions', level: 2, required: true, alternatives: [/^Precondicion(es)?/i] },
    {
      name: 'Main Flow',
      level: 2,
      required: true,
      alternatives: [/^(Flujo Principal|Happy Path)/i],
    },
    {
      name: 'Extensions',
      level: 2,
      required: false,
      alternatives: [/^(Extensiones|Flujos Alternativos|Alternative)/i],
    },
    {
      name: 'Minimal Guarantees',
      level: 2,
      required: false,
      alternatives: [/^Garantías Mínimas/i],
    },
    { name: 'Postconditions', level: 2, required: true, alternatives: [/^Postcondicion(es)?/i] },
    {
      name: 'Business Rules',
      level: 2,
      required: false,
      alternatives: [/^Reglas de Negocio/i],
    },
    {
      name: 'Test Scenarios',
      level: 2,
      required: false,
      alternatives: [/^(Escenarios|Test Cases|Escenarios de Prueba)/i],
    },
  ],
}

// =============================================================================
// Template: Requirement (REQ-xxx)
// =============================================================================
const requirementTemplate: StructureTemplate = {
  requiresH1: true,
  h1Pattern: /^(Requirements|Requisitos)/i,
  sections: [
    {
      name: 'Requirements Summary',
      level: 2,
      required: false,
      alternatives: [/^(Resumen|Summary|Resumen de Requisitos)/i],
    },
    {
      name: 'REQ-',
      level: 2,
      required: true,
      alternatives: [/^REQ-\d{3}\.\d+/],
      description: 'At least one individual requirement (REQ-XXX.X)',
    },
    {
      name: 'Traceability Matrix',
      level: 2,
      required: false,
      alternatives: [/^(Matriz|Traceability|Matriz de Trazabilidad)/i],
    },
  ],
}

// =============================================================================
// Template: Entity
// =============================================================================
const entityTemplate: StructureTemplate = {
  requiresH1: false, // H1 is the entity name
  sections: [
    { name: 'Description', level: 2, required: true, alternatives: [/^Descripción/i] },
    { name: 'Attributes', level: 2, required: true, alternatives: [/^Atributos/i] },
    { name: 'Relations', level: 2, required: false, alternatives: [/^Relaciones/i] },
    {
      name: 'Lifecycle',
      level: 2,
      required: false,
      alternatives: [/^(Ciclo de Vida|State|Estados)/i],
    },
    {
      name: 'Invariants',
      level: 2,
      required: false,
      alternatives: [/^(Invariantes|Constraints)/i],
    },
  ],
}

// =============================================================================
// Template: Event (EVT-xxx)
// =============================================================================
const eventTemplate: StructureTemplate = {
  requiresH1: false,
  sections: [
    { name: 'Description', level: 2, required: true, alternatives: [/^Descripción/i] },
    { name: 'Emitter', level: 2, required: false, alternatives: [/^(Emisor|Source)/i] },
    { name: 'Payload', level: 2, required: true },
    { name: 'Example', level: 2, required: false, alternatives: [/^Ejemplo/i] },
    {
      name: 'Subscribers',
      level: 2,
      required: false,
      alternatives: [/^(Suscriptores|Consumers)/i],
    },
  ],
}

// =============================================================================
// Template: Rule (RUL-xxx)
// =============================================================================
const ruleTemplate: StructureTemplate = {
  requiresH1: true,
  h1Pattern: /^(Rules|Reglas)/i,
  sections: [
    {
      name: 'RUL-',
      level: 2,
      required: true,
      alternatives: [/^RUL-[A-Z]+-\d{3}/],
      description: 'At least one individual rule (RUL-XXX-NNN)',
    },
  ],
}

// =============================================================================
// Template: Process (PRC-xxx)
// =============================================================================
const processTemplate: StructureTemplate = {
  requiresH1: true,
  h1Pattern: /^PRC-\d{3}/,
  sections: [
    { name: 'Description', level: 2, required: false, alternatives: [/^Descripción/i] },
    {
      name: 'Diagram',
      level: 2,
      required: false,
      alternatives: [/^Diagrama/i],
      description: 'A mermaid block is expected in the content',
    },
    { name: 'Steps', level: 2, required: false, alternatives: [/^Pasos/i] },
  ],
}

// =============================================================================
// Template: PRD
// =============================================================================
const prdTemplate: StructureTemplate = {
  requiresH1: true,
  sections: [
    { name: 'Problem', level: 2, required: true, alternatives: [/^Problema/i] },
    { name: 'Users', level: 2, required: false, alternatives: [/^(Usuarios|Jobs)/i] },
    { name: 'Scope', level: 2, required: true, alternatives: [/^Alcance/i] },
    {
      name: 'Requirements',
      level: 2,
      required: false,
      alternatives: [/^(Requisitos|Requisitos funcionales)/i],
    },
    { name: 'NFRs', level: 2, required: false, alternatives: [/^Non.?Functional/i] },
    { name: 'Metrics', level: 2, required: false, alternatives: [/^(Métricas|Success)/i] },
  ],
}

// =============================================================================
// Template: Story (US-xxx)
// =============================================================================
const storyTemplate: StructureTemplate = {
  requiresH1: false,
  sections: [
    {
      name: 'Acceptance Criteria',
      level: 2,
      required: false,
      alternatives: [/^(Criterios|Criterios de aceptación)/i],
    },
  ],
}

// =============================================================================
// Template: NFR
// =============================================================================
const nfrTemplate: StructureTemplate = {
  requiresH1: true,
  sections: [
    { name: 'Goal', level: 2, required: false, alternatives: [/^(Objetivo|Target)/i] },
    { name: 'SLI', level: 2, required: false },
    { name: 'SLO', level: 2, required: false },
    {
      name: 'Strategies',
      level: 2,
      required: false,
      alternatives: [/^Estrategias/i],
    },
  ],
}

// =============================================================================
// Template: ADR
// =============================================================================
const adrTemplate: StructureTemplate = {
  requiresH1: true,
  sections: [
    { name: 'Context', level: 2, required: true, alternatives: [/^Contexto/i] },
    { name: 'Decision', level: 2, required: true, alternatives: [/^Decisión/i] },
    {
      name: 'Consequences',
      level: 2,
      required: true,
      alternatives: [/^Consecuencias/i],
    },
  ],
}

// =============================================================================
// Template: Unknown (no structure validation)
// =============================================================================
const unknownTemplate: StructureTemplate = {
  requiresH1: false,
  sections: [],
}

// =============================================================================
// Template map by type
// =============================================================================
export const structureTemplates: Record<DocType, StructureTemplate> = {
  'use-case': useCaseTemplate,
  requirement: requirementTemplate,
  entity: entityTemplate,
  event: eventTemplate,
  rule: ruleTemplate,
  process: processTemplate,
  prd: prdTemplate,
  story: storyTemplate,
  nfr: nfrTemplate,
  adr: adrTemplate,
  objective: unknownTemplate,
  'value-unit': unknownTemplate,
  release: unknownTemplate,
  command: unknownTemplate,
  query: unknownTemplate,
  'ui-view': unknownTemplate,
  'ui-component': unknownTemplate,
  'ui-flow': unknownTemplate,
  unknown: unknownTemplate,
}

/**
 * Gets the structure template for a document type
 */
export function getStructureTemplate(docType: DocType): StructureTemplate {
  return structureTemplates[docType] ?? unknownTemplate
}
