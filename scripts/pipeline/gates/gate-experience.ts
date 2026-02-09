/**
 * Gate 4: Experience
 * Verifies that UI specs exist and have the 4 required states documented:
 * - loading, empty, error, success/default
 */

import type { UVData, GateResult, GateItem, GateOptions } from '../lib/types'
import { resolveSpecPath } from '../lib/spec-resolver'
import { loadSpecFile } from '../../spec-validator/lib/parser'

const UI_PREFIXES = ['UI', 'VIEW', 'LAYOUT', 'MODAL', 'FLOW']

const REQUIRED_STATES = [
  ['loading', 'cargando'],
  ['empty', 'vacio', 'vacío', 'sin datos'],
  ['error'],
  ['success', 'default', 'exito', 'éxito', 'por defecto', 'datos'],
]

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export async function check(uv: UVData, options?: GateOptions): Promise<GateResult> {
  const specsDir = options?.specsDir ?? 'specs'
  const items: GateItem[] = []

  const uiArtifacts = uv.allArtifacts.filter((a) =>
    UI_PREFIXES.includes(a.prefix)
  )

  if (uiArtifacts.length === 0) {
    return {
      gate: 4,
      name: 'Experience',
      status: 'warn',
      items: [{
        description: 'No UI artifacts referenced',
        status: 'warn',
        detail: 'UV has no UI/VIEW/LAYOUT/MODAL references',
      }],
      summary: 'No UI artifacts to verify',
    }
  }

  for (const artifact of uiArtifacts) {
    const path = await resolveSpecPath(artifact.id, specsDir)

    if (!path) {
      items.push({
        description: `${artifact.id} spec exists`,
        status: artifact.status === 'deferred' ? 'skip' : 'fail',
        detail: artifact.status === 'deferred' ? 'Deferred' : `Spec not found for "${artifact.id}"`,
        artifactId: artifact.id,
      })
      continue
    }

    items.push({
      description: `${artifact.id} spec exists`,
      status: 'pass',
      artifactId: artifact.id,
      filePath: path,
    })

    // Check for 4 required states in the spec
    const spec = await loadSpecFile(path)
    if (!spec) continue

    const headings = spec.headings.map((h) => normalize(h.text))
    const content = normalize(spec.content)

    for (const stateNames of REQUIRED_STATES) {
      const found = stateNames.some((name) => {
        const norm = normalize(name)
        return headings.some((h) => h.includes(norm)) || content.includes(norm)
      })

      items.push({
        description: `${artifact.id}: state "${stateNames[0]}" documented`,
        status: found ? 'pass' : 'warn',
        detail: found ? undefined : `State "${stateNames[0]}" not found in spec`,
        artifactId: artifact.id,
        filePath: path,
      })
    }
  }

  const failCount = items.filter((i) => i.status === 'fail').length
  const warnCount = items.filter((i) => i.status === 'warn').length
  const status = failCount > 0 ? 'fail' : warnCount > 0 ? 'warn' : 'pass'

  return {
    gate: 4,
    name: 'Experience',
    status,
    items,
    summary: failCount === 0
      ? `UI specs checked${warnCount > 0 ? ` (${warnCount} warnings)` : ''}`
      : `${failCount} UI checks failed`,
  }
}
