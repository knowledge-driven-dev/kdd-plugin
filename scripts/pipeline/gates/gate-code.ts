/**
 * Gate 7: Code
 * Verifies that TypeScript compiles without errors
 * Can be skipped with --skip-typecheck or --quick flags
 */

import type { UVData, GateResult, GateOptions } from '../lib/types'

export async function check(uv: UVData, options?: GateOptions): Promise<GateResult> {
  if (options?.quick || options?.skipTypecheck) {
    return {
      gate: 7,
      name: 'Code',
      status: 'skip',
      items: [{
        description: 'TypeScript compilation',
        status: 'skip',
        detail: 'Skipped (--quick or --skip-typecheck)',
      }],
      summary: 'Skipped',
    }
  }

  const projectRoot = options?.projectRoot ?? process.cwd()

  try {
    const proc = Bun.spawn(['bun', 'run', 'typecheck'], {
      cwd: projectRoot,
      stdout: 'pipe',
      stderr: 'pipe',
    })

    const exitCode = await proc.exited
    const stdout = await new Response(proc.stdout).text()
    const stderr = await new Response(proc.stderr).text()

    if (exitCode === 0) {
      return {
        gate: 7,
        name: 'Code',
        status: 'pass',
        items: [{
          description: 'TypeScript compilation',
          status: 'pass',
          detail: 'tsc --noEmit passed',
        }],
        summary: 'TypeScript compiles successfully',
      }
    }

    // Parse error count from tsc output
    const errorLines = (stdout + stderr)
      .split('\n')
      .filter((l) => l.includes('error TS'))
    const errorCount = errorLines.length

    return {
      gate: 7,
      name: 'Code',
      status: 'fail',
      items: [
        {
          description: 'TypeScript compilation',
          status: 'fail',
          detail: `${errorCount} TypeScript error(s)`,
        },
        ...errorLines.slice(0, 10).map((line) => ({
          description: line.trim(),
          status: 'fail' as const,
        })),
      ],
      summary: `${errorCount} TypeScript errors found`,
    }
  } catch (error) {
    return {
      gate: 7,
      name: 'Code',
      status: 'fail',
      items: [{
        description: 'TypeScript compilation',
        status: 'fail',
        detail: `Error running typecheck: ${error}`,
      }],
      summary: 'Failed to run typecheck',
    }
  }
}
