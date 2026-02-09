/**
 * Gate 6: Physical
 * Verifies that code files exist for CMD/QRY artifacts:
 * - .use-case.ts files exist in the application layer
 */

import { resolve } from 'path'
import type { UVData, GateResult, GateItem, GateOptions } from '../lib/types'
import { buildCodeMapping, cmdToUseCasePath, actionNameToFileName } from '../lib/spec-resolver'
import { parseCMDSpec } from '../lib/cmd-parser'

const CODE_PREFIXES = ['CMD', 'QRY']

export async function check(uv: UVData, options?: GateOptions): Promise<GateResult> {
  const projectRoot = options?.projectRoot ?? process.cwd()
  const specsDir = options?.specsDir ?? 'specs'
  const items: GateItem[] = []

  const codeArtifacts = uv.allArtifacts.filter((a) =>
    CODE_PREFIXES.includes(a.prefix)
  )

  if (codeArtifacts.length === 0) {
    return {
      gate: 6,
      name: 'Physical',
      status: 'warn',
      items: [{
        description: 'No CMD/QRY artifacts referenced',
        status: 'warn',
      }],
      summary: 'No code artifacts to verify',
    }
  }

  // Build mapping from existing codebase
  const codeMapping = await buildCodeMapping(projectRoot)

  for (const artifact of codeArtifacts) {
    // Skip deferred artifacts
    if (artifact.status === 'deferred') {
      items.push({
        description: `${artifact.id} code file`,
        status: 'skip',
        detail: 'Deferred',
        artifactId: artifact.id,
      })
      continue
    }

    // Check if we have a known mapping
    let codePath = codeMapping.get(artifact.id)

    // If not in mapping, try to derive from CMD spec
    if (!codePath) {
      const { resolveSpecPath } = await import('../lib/spec-resolver')
      const specPath = await resolveSpecPath(artifact.id, specsDir)
      if (specPath) {
        const cmdData = await parseCMDSpec(specPath)
        if (cmdData) {
          const expectedFile = actionNameToFileName(cmdData.actionName)
          const { loadKddConfig } = await import('../../lib/config')
          const config = await loadKddConfig()
          codePath = resolve(projectRoot, config.useCasesDir, expectedFile)
        }
      }
    }

    if (!codePath) {
      items.push({
        description: `${artifact.id} code file`,
        status: 'fail',
        detail: 'Cannot determine expected file path',
        artifactId: artifact.id,
      })
      continue
    }

    const exists = await Bun.file(codePath).exists()
    items.push({
      description: `${artifact.id} code file exists`,
      status: exists ? 'pass' : 'fail',
      detail: exists
        ? codePath.replace(process.cwd() + '/', '')
        : `Expected: ${codePath.replace(process.cwd() + '/', '')}`,
      artifactId: artifact.id,
      filePath: codePath,
    })
  }

  const failCount = items.filter((i) => i.status === 'fail').length
  const status = failCount === 0 ? 'pass' : 'fail'

  return {
    gate: 6,
    name: 'Physical',
    status,
    items,
    summary: failCount === 0
      ? `All code files exist`
      : `${failCount} code files missing`,
  }
}
