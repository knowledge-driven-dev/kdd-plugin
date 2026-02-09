/**
 * Gate 8: Evidence
 * Verifies that tests exist and pass:
 * - Quick mode: only check test files exist
 * - Full mode: run tests and verify they pass
 */

import { resolve } from 'path'
import type { UVData, GateResult, GateItem, GateOptions } from '../lib/types'
import { buildCodeMapping, actionNameToFileName } from '../lib/spec-resolver'
import { parseCMDSpec } from '../lib/cmd-parser'
import { resolveSpecPath } from '../lib/spec-resolver'

const CODE_PREFIXES = ['CMD', 'QRY']

export async function check(uv: UVData, options?: GateOptions): Promise<GateResult> {
  const projectRoot = options?.projectRoot ?? process.cwd()
  const specsDir = options?.specsDir ?? 'specs'
  const items: GateItem[] = []

  const codeArtifacts = uv.allArtifacts.filter((a) =>
    CODE_PREFIXES.includes(a.prefix) && a.status !== 'deferred'
  )

  if (codeArtifacts.length === 0) {
    return {
      gate: 8,
      name: 'Evidence',
      status: 'warn',
      items: [{
        description: 'No testable artifacts',
        status: 'warn',
      }],
      summary: 'No testable artifacts to verify',
    }
  }

  const codeMapping = await buildCodeMapping(projectRoot)

  // Check test files exist
  for (const artifact of codeArtifacts) {
    let codePath = codeMapping.get(artifact.id)

    if (!codePath) {
      const specPath = await resolveSpecPath(artifact.id, specsDir)
      if (specPath) {
        const cmdData = await parseCMDSpec(specPath)
        if (cmdData) {
          const expectedFile = actionNameToFileName(cmdData.actionName)
          const { loadKddConfig } = await import('../../lib/config')
          const evConfig = await loadKddConfig()
          codePath = resolve(projectRoot, evConfig.useCasesDir, expectedFile)
        }
      }
    }

    if (!codePath) {
      items.push({
        description: `${artifact.id} test file`,
        status: 'fail',
        detail: 'Cannot determine code file path',
        artifactId: artifact.id,
      })
      continue
    }

    const testPath = codePath.replace('.use-case.ts', '.use-case.test.ts')
    const exists = await Bun.file(testPath).exists()

    items.push({
      description: `${artifact.id} test file exists`,
      status: exists ? 'pass' : 'fail',
      detail: exists
        ? testPath.replace(process.cwd() + '/', '')
        : `Expected: ${testPath.replace(process.cwd() + '/', '')}`,
      artifactId: artifact.id,
      filePath: testPath,
    })
  }

  // Also check req-level tests in tests/req/
  const reqArtifacts = uv.allArtifacts.filter((a) => a.prefix === 'REQ')
  for (const artifact of reqArtifacts) {
    const reqId = artifact.id.match(/^(REQ-\d+)/i)?.[1]
    if (!reqId) continue

    const testsDir = resolve(projectRoot, 'tests/req')
    const glob = new Bun.Glob(`${reqId}*.test.ts`)
    let found = false
    for await (const file of glob.scan({ cwd: testsDir, absolute: true })) {
      found = true
      items.push({
        description: `${artifact.id} req test exists`,
        status: 'pass',
        detail: file.replace(process.cwd() + '/', ''),
        artifactId: artifact.id,
        filePath: file,
      })
      break
    }

    if (!found) {
      items.push({
        description: `${artifact.id} req test exists`,
        status: 'warn',
        detail: `No test file matching ${reqId}*.test.ts in tests/req/`,
        artifactId: artifact.id,
      })
    }
  }

  // Full mode: run tests
  if (!options?.quick && items.some((i) => i.status === 'pass' && i.filePath?.endsWith('.test.ts'))) {
    const testFiles = items
      .filter((i) => i.status === 'pass' && i.filePath?.endsWith('.test.ts'))
      .map((i) => i.filePath!)

    try {
      const proc = Bun.spawn(['bun', 'test', ...testFiles], {
        cwd: projectRoot,
        stdout: 'pipe',
        stderr: 'pipe',
      })

      const exitCode = await proc.exited
      const output = await new Response(proc.stdout).text()

      items.push({
        description: 'Test execution',
        status: exitCode === 0 ? 'pass' : 'fail',
        detail: exitCode === 0 ? 'All tests passed' : `Tests failed (exit code ${exitCode})`,
      })
    } catch (error) {
      items.push({
        description: 'Test execution',
        status: 'fail',
        detail: `Error running tests: ${error}`,
      })
    }
  }

  const failCount = items.filter((i) => i.status === 'fail').length
  const warnCount = items.filter((i) => i.status === 'warn').length
  const status = failCount > 0 ? 'fail' : warnCount > 0 ? 'warn' : 'pass'

  return {
    gate: 8,
    name: 'Evidence',
    status,
    items,
    summary: failCount === 0
      ? `Tests checked${warnCount > 0 ? ` (${warnCount} warnings)` : ''}`
      : `${failCount} test checks failed`,
  }
}
