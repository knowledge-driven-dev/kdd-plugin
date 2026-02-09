/**
 * Configuración del validador de especificaciones
 *
 * Este archivo permite personalizar las reglas de validación.
 * Para usar una configuración custom, crea un archivo .spec-validator.config.ts
 * en la raíz del proyecto.
 */

import type { DocType } from './lib/parser'

export interface ValidatorConfig {
  /**
   * Reglas a ignorar (por ID)
   * Ejemplo: ['frontmatter/missing', 'structure/empty-section']
   */
  ignoreRules: string[]

  /**
   * Archivos/paths a ignorar (glob patterns)
   */
  ignorePaths: string[]

  /**
   * Tipos de documento a ignorar
   */
  ignoreDocTypes: DocType[]

  /**
   * Nivel mínimo para reportar (error, warning, info)
   */
  minLevel: 'error' | 'warning' | 'info'

  /**
   * Tratar warnings como errores (para CI estricto)
   */
  warningsAsErrors: boolean

  /**
   * Entidades custom a reconocer (además de las auto-detectadas)
   */
  customEntities: {
    name: string
    aliases?: string[]
    type: 'entity' | 'concept' | 'external'
  }[]

  /**
   * Términos a ignorar en la detección semántica
   */
  ignoreTerms: string[]
}

/**
 * Configuración por defecto
 */
export const defaultConfig: ValidatorConfig = {
  ignoreRules: [],

  ignorePaths: [
    '**/node_modules/**',
    '**/.obsidian/**',
    '**/TEMPLATE*.md',
    '**/_*.md', // Archivos que empiezan con _
  ],

  ignoreDocTypes: [],

  minLevel: 'warning',

  warningsAsErrors: false,

  customEntities: [
    // Conceptos del dominio que no tienen archivo propio
    { name: 'Sistema', type: 'concept' },
    { name: 'API', type: 'concept' },
    { name: 'Frontend', type: 'concept' },
    { name: 'Backend', type: 'concept' },
  ],

  ignoreTerms: [
    // Términos comunes que no deberían ser enlaces
    'usuario',
    'sistema',
    'error',
    'éxito',
    'estado',
    'datos',
    'información',
  ],
}

/**
 * Carga la configuración del proyecto
 */
export async function loadConfig(): Promise<ValidatorConfig> {
  try {
    // Intentar cargar config del proyecto
    const configPath = `${process.cwd()}/.spec-validator.config.ts`
    const projectConfig = await import(configPath)
    return { ...defaultConfig, ...projectConfig.default }
  } catch {
    // Usar config por defecto
    return defaultConfig
  }
}
