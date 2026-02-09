/**
 * Shared KDD Config Loader
 *
 * Loads project-specific configuration from kdd.config.ts at project root.
 * Falls back to sensible defaults if the config file doesn't exist.
 */

export interface KddConfig {
  useCasesDir: string
  componentsDir: string
  entityNameMap: Record<string, string>
  actionVerbMap: Record<string, string>
  codeMapping: Record<string, string>
}

const DEFAULTS: KddConfig = {
  useCasesDir: 'src/application/use-cases',
  componentsDir: 'src/components/features',
  entityNameMap: {},
  actionVerbMap: {},
  codeMapping: {},
}

let _cachedConfig: KddConfig | null = null

/**
 * Load the KDD config from the project root.
 * Results are cached for the duration of the process.
 */
export async function loadKddConfig(): Promise<KddConfig> {
  if (_cachedConfig) return _cachedConfig

  try {
    const configPath = `${process.cwd()}/kdd.config.ts`
    const mod = await import(configPath)
    const userConfig = mod.default ?? mod

    _cachedConfig = {
      useCasesDir: userConfig.useCasesDir ?? DEFAULTS.useCasesDir,
      componentsDir: userConfig.componentsDir ?? DEFAULTS.componentsDir,
      entityNameMap: { ...DEFAULTS.entityNameMap, ...userConfig.entityNameMap },
      actionVerbMap: { ...DEFAULTS.actionVerbMap, ...userConfig.actionVerbMap },
      codeMapping: { ...DEFAULTS.codeMapping, ...userConfig.codeMapping },
    }

    // Merge entity and verb maps into the shared types module
    try {
      const types = await import('../pipeline/lib/types')
      Object.assign(types.ENTITY_NAME_MAP, _cachedConfig.entityNameMap)
      Object.assign(types.ACTION_VERB_MAP, _cachedConfig.actionVerbMap)
    } catch {
      // Pipeline types not available (e.g. running standalone script)
    }
  } catch {
    _cachedConfig = { ...DEFAULTS }
  }

  return _cachedConfig
}
