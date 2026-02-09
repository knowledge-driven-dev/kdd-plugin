/**
 * Shared types for the KDD pipeline
 */

/** Status of an artifact reference within a UV */
export type ArtifactStatus = 'pending' | 'implemented' | 'deferred'

/** A reference to a spec artifact extracted from a UV file */
export interface ArtifactRef {
  /** Raw wiki-link target, e.g. "CMD-023-TerminateChallenge" */
  id: string
  /** Detected prefix, e.g. "CMD" */
  prefix: string
  /** Full target including fragment, e.g. "Entity#INV-ENTITY-006" */
  fullTarget: string
  /** Resolved status from UV section */
  status: ArtifactStatus
  /** Line number in UV file */
  line?: number
}

/** Parsed data from a Value Unit file */
export interface UVData {
  /** UV identifier, e.g. "UV-004" */
  id: string
  /** Title from frontmatter or H1 */
  title: string
  /** Absolute file path */
  filePath: string
  /** Frontmatter data */
  frontmatter: Record<string, unknown>
  /** Artifacts grouped by status */
  artifacts: {
    pending: ArtifactRef[]
    implemented: ArtifactRef[]
    deferred: ArtifactRef[]
  }
  /** All unique artifact refs (union of all statuses) */
  allArtifacts: ArtifactRef[]
}

/** Status of a single gate check item */
export type GateItemStatus = 'pass' | 'fail' | 'skip' | 'warn'

/** A single item checked within a gate */
export interface GateItem {
  /** Description of what was checked */
  description: string
  /** Result */
  status: GateItemStatus
  /** Optional detail message */
  detail?: string
  /** Related artifact ID */
  artifactId?: string
  /** File path if relevant */
  filePath?: string
}

/** Result of running a single gate */
export interface GateResult {
  /** Gate number (1-8) */
  gate: number
  /** Gate name */
  name: string
  /** Overall status */
  status: GateItemStatus
  /** Individual items checked */
  items: GateItem[]
  /** Summary message */
  summary: string
  /** Duration in ms */
  durationMs?: number
}

/** Result of running the full pipeline for a UV */
export interface PipelineResult {
  /** UV being checked */
  uv: UVData
  /** Results per gate */
  gates: GateResult[]
  /** Overall pipeline status */
  status: GateItemStatus
  /** Total duration in ms */
  durationMs: number
}

/** Parsed CMD spec data for scaffold generation */
export interface CMDSpecData {
  /** CMD identifier, e.g. "CMD-023" */
  id: string
  /** Title from frontmatter */
  title: string
  /** Action name in PascalCase, e.g. "TerminateChallenge" */
  actionName: string
  /** Entity name derived from action, e.g. "Order" */
  entityName: string
  /** Input parameters from the Input table */
  inputs: CMDInput[]
  /** Possible errors from the Errors table */
  errors: CMDError[]
  /** BR IDs referenced in Rules Validated */
  rulesReferenced: string[]
  /** Event names from Events Generated */
  eventsGenerated: string[]
  /** Preconditions as bullet strings */
  preconditions: string[]
  /** File path of the CMD spec */
  filePath: string
}

export interface CMDInput {
  name: string
  type: string
  required: boolean
  validation: string
}

export interface CMDError {
  code: string
  condition: string
  message: string
}

/** Output format for the reporter */
export type OutputFormat = 'console' | 'json' | 'github'

/** Options passed to gate checks */
export interface GateOptions {
  /** Specs directory root */
  specsDir: string
  /** Project root */
  projectRoot: string
  /** Skip expensive checks (typecheck, test execution) */
  quick?: boolean
  /** Skip typecheck specifically */
  skipTypecheck?: boolean
  /** Verbose output */
  verbose?: boolean
}

/** Prefix-to-directory mapping */
export const PREFIX_DIR_MAP: Record<string, string> = {
  'CMD': '02-behavior/commands',
  'QRY': '02-behavior/queries',
  'UC': '02-behavior/use-cases',
  'BR': '01-domain/rules',
  'RUL': '01-domain/rules',
  'EVT': '01-domain/events',
  'ENT': '01-domain/entities',
  'REQ': '04-verification/criteria',
  'PRC': '02-behavior/processes',
  'PROC': '02-behavior/processes',
  'UI': '03-experience',
  'VIEW': '03-experience',
  'LAYOUT': '03-experience/shared',
  'MODAL': '03-experience',
  'FLOW': '03-experience',
  'OBJ': '00-requirements/objectives',
  'UV': '00-requirements/value-units',
  'REL': '00-requirements/releases',
}

/**
 * Entity name dictionary for CMD -> code file mapping.
 * Map PascalCase entity names from CMD specs to your codebase names.
 * Configure via kdd.config.ts entityNameMap.
 * Example: { 'Order': 'order', 'Customer': 'customer' }
 */
export const ENTITY_NAME_MAP: Record<string, string> = {
  // Populated from kdd.config.ts at runtime — see scripts/lib/config.ts
}

/**
 * Action verb dictionary for CMD -> code file mapping.
 * Map PascalCase action verbs from CMD specs to your codebase convention.
 * Configure via kdd.config.ts actionVerbMap.
 */
export const ACTION_VERB_MAP: Record<string, string> = {
  'Create': 'create',
  'Update': 'update',
  'Delete': 'delete',
  'Get': 'get',
  'List': 'list',
  'Duplicate': 'duplicate',
  'Terminate': 'terminate',
  'Cancel': 'cancel',
  'Complete': 'complete',
  // Add project-specific verb mappings via kdd.config.ts
}
