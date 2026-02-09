#!/usr/bin/env bun
/**
 * Detecta specs de UI modificadas en el staging area de git.
 *
 * Uso:
 *   bun scripts/detect-ui-spec-changes.ts           # Lista specs modificadas
 *   bun scripts/detect-ui-spec-changes.ts --json    # Output JSON
 *   bun scripts/detect-ui-spec-changes.ts --check   # Exit 1 si hay cambios sin sync
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { basename, join } from 'path'

interface ModifiedSpec {
  specPath: string
  specName: string
  storyPath: string
  storyExists: boolean
  changeType: 'added' | 'modified' | 'deleted'
}

import { readFileSync } from 'fs'

// Load components dir from kdd.config.ts if available
function loadComponentsDir(): string {
  try {
    // Simple sync config loading for this script
    const configPath = join(process.cwd(), 'kdd.config.ts')
    const content = readFileSync(configPath, 'utf-8')
    const match = content.match(/componentsDir:\s*['"]([^'"]+)['"]/)
    return match?.[1] ?? 'src/components/features'
  } catch {
    return 'src/components/features'
  }
}

// Configuracion
const CONFIG = {
  specsDir: 'specs/03-experience/views',
  componentsDir: loadComponentsDir(),
  specPattern: /^(?:UI|VIEW)-(.+)\.md$/,
}

/**
 * Obtiene las specs UI modificadas del staging area
 */
function getModifiedUISpecs(): ModifiedSpec[] {
  try {
    // Obtener archivos staged
    const staged = execSync('git diff --cached --name-status', { encoding: 'utf-8' })

    const results: ModifiedSpec[] = []

    for (const line of staged.split('\n')) {
      if (!line.trim()) continue

      const [status, filePath] = line.split('\t')

      // Filtrar solo specs UI
      if (!filePath?.includes(CONFIG.specsDir)) continue
      if (!filePath.endsWith('.md')) continue

      const fileName = basename(filePath)
      const match = fileName.match(CONFIG.specPattern)

      if (!match) continue

      const specName = match[1]
      const componentName = specName.toLowerCase().replace(/-/g, '-')

      // Determinar path del story
      // UI-OrderForm.md → order-form.stories.tsx
      const storyFileName = `${componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')}.stories.tsx`

      // Intentar determinar la feature desde el nombre
      // Infer feature from spec name or frontmatter
      const featureName = inferFeatureFromSpec(specName, filePath)
      const storyPath = join(CONFIG.componentsDir, featureName, storyFileName)

      results.push({
        specPath: filePath,
        specName,
        storyPath,
        storyExists: existsSync(storyPath),
        changeType: status === 'A' ? 'added' : status === 'D' ? 'deleted' : 'modified',
      })
    }

    return results
  } catch (error) {
    console.error('Error detecting modified specs:', error)
    return []
  }
}

/**
 * Infer the feature name from the spec name.
 * Tries to read the `feature` field from frontmatter; falls back to kebab-cased spec name.
 */
function inferFeatureFromSpec(specName: string, specPath?: string): string {
  // Try reading frontmatter feature field
  if (specPath) {
    try {
      const content = readFileSync(specPath, 'utf-8')
      const fmMatch = content.match(/^---\n[\s\S]*?feature:\s*(.+)\n[\s\S]*?---/)
      if (fmMatch) {
        return fmMatch[1].trim().toLowerCase().replace(/\s+/g, '-')
      }
    } catch {
      // Fall through to heuristic
    }
  }

  // Fallback: derive from spec name (kebab-case, strip prefix)
  return specName
    .replace(/^(Config|Configure|Create|Edit|List|View|Detail|Form|Modal|Dialog)/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/^-/, '') || 'common'
}

/**
 * Verifica si los stories están sincronizados con las specs
 */
function checkSync(specs: ModifiedSpec[]): boolean {
  // Por ahora, simplemente verificamos si existen los stories
  // En el futuro, podríamos comparar timestamps o hashes

  const needsSync = specs.filter(s =>
    s.changeType !== 'deleted' && !s.storyExists
  )

  return needsSync.length === 0
}

// Main
function main() {
  const args = process.argv.slice(2)
  const jsonOutput = args.includes('--json')
  const checkMode = args.includes('--check')

  const modifiedSpecs = getModifiedUISpecs()

  if (jsonOutput) {
    console.log(JSON.stringify(modifiedSpecs, null, 2))
    return
  }

  if (modifiedSpecs.length === 0) {
    console.log('✓ No hay specs UI modificadas en staging')
    process.exit(0)
  }

  console.log(`\n📋 Specs UI modificadas: ${modifiedSpecs.length}\n`)

  for (const spec of modifiedSpecs) {
    const icon = spec.changeType === 'added' ? '➕' : spec.changeType === 'deleted' ? '➖' : '📝'
    const syncIcon = spec.storyExists ? '✓' : '⚠️'

    console.log(`${icon} ${spec.specName}`)
    console.log(`   Spec: ${spec.specPath}`)
    console.log(`   Story: ${spec.storyPath} ${syncIcon}`)
    console.log()
  }

  if (checkMode) {
    const synced = checkSync(modifiedSpecs)
    if (!synced) {
      console.log('⚠️  Hay specs sin story sincronizado')
      console.log('   Ejecuta: claude "/sync-story auto" para sincronizar')
      process.exit(1)
    }
    console.log('✓ Todos los stories están sincronizados')
  }
}

main()
