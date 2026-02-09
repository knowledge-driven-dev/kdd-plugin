#!/usr/bin/env bun
/**
 * KDD Pipeline Orchestrator
 * Runs all gates for one or more Value Units
 *
 * Usage:
 *   bun run pipeline:check UV-004              # All gates for UV-004
 *   bun run pipeline:check UV-004 --gate 3     # Only gate 3
 *   bun run pipeline:check --all               # All UVs
 *   bun run pipeline:check --all --quick       # Skip typecheck and test execution
 *   bun run pipeline:check --format github     # For CI
 */

import { resolve } from 'path'
import { parseArgs } from 'util'
import { parseUVFile, findAllUVFiles } from './lib/uv-parser'
import { reportAndExit } from './lib/reporter'
import type { GateOptions, GateResult, OutputFormat, PipelineResult, UVData } from './lib/types'

// Gate imports
import * as gateCapture from './gates/gate-capture'
import * as gateDomain from './gates/gate-domain'
import * as gateBehavior from './gates/gate-behavior'
import * as gateExperience from './gates/gate-experience'
import * as gateVerification from './gates/gate-verification'
import * as gatePhysical from './gates/gate-physical'
import * as gateCode from './gates/gate-code'
import * as gateEvidence from './gates/gate-evidence'

const ALL_GATES = [
  gateCapture,
  gateDomain,
  gateBehavior,
  gateExperience,
  gateVerification,
  gatePhysical,
  gateCode,
  gateEvidence,
]

async function runPipeline(
  uv: UVData,
  gateOptions: GateOptions,
  specificGate?: number
): Promise<PipelineResult> {
  const start = Date.now()
  const gates: GateResult[] = []

  const gatesToRun = specificGate
    ? ALL_GATES.filter((_, i) => i + 1 === specificGate)
    : ALL_GATES

  for (const gate of gatesToRun) {
    const gateStart = Date.now()
    const result = await gate.check(uv, gateOptions)
    result.durationMs = Date.now() - gateStart
    gates.push(result)
  }

  const hasFail = gates.some((g) => g.status === 'fail')
  const hasWarn = gates.some((g) => g.status === 'warn')
  const status = hasFail ? 'fail' : hasWarn ? 'warn' : 'pass'

  return {
    uv,
    gates,
    status,
    durationMs: Date.now() - start,
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      all: { type: 'boolean', default: false },
      gate: { type: 'string' },
      quick: { type: 'boolean', default: false },
      'skip-typecheck': { type: 'boolean', default: false },
      format: { type: 'string', default: 'console' },
      verbose: { type: 'boolean', default: false },
    },
    allowPositionals: true,
  })

  const format = values.format as OutputFormat
  const specsDir = resolve(process.cwd(), 'specs')
  const projectRoot = process.cwd()

  const gateOptions: GateOptions = {
    specsDir,
    projectRoot,
    quick: values.quick,
    skipTypecheck: values['skip-typecheck'],
    verbose: values.verbose,
  }

  const specificGate = values.gate ? parseInt(values.gate, 10) : undefined
  if (specificGate !== undefined && (specificGate < 1 || specificGate > 8)) {
    console.error('Gate must be between 1 and 8')
    process.exit(2)
  }

  // Determine which UVs to check
  let uvFiles: string[]

  if (values.all) {
    uvFiles = await findAllUVFiles(specsDir)
  } else if (positionals.length > 0) {
    const uvId = positionals[0]
    const allFiles = await findAllUVFiles(specsDir)
    uvFiles = allFiles.filter((f) => f.includes(uvId))

    if (uvFiles.length === 0) {
      console.error(`UV not found: ${uvId}`)
      process.exit(2)
    }
  } else {
    console.error('Usage: bun run pipeline:check <UV-ID> | --all')
    console.error('')
    console.error('Options:')
    console.error('  --all              Check all UVs')
    console.error('  --gate N           Run only gate N (1-8)')
    console.error('  --quick            Skip typecheck and test execution')
    console.error('  --skip-typecheck   Skip only typecheck')
    console.error('  --format FORMAT    Output format: console, json, github')
    console.error('  --verbose          Verbose output')
    process.exit(2)
  }

  // Run pipeline for each UV
  const results: PipelineResult[] = []

  for (const uvFile of uvFiles) {
    const uv = await parseUVFile(uvFile)
    if (!uv) {
      console.error(`Failed to parse UV file: ${uvFile}`)
      continue
    }

    const result = await runPipeline(uv, gateOptions, specificGate)
    results.push(result)
  }

  if (results.length === 0) {
    console.error('No UV files processed')
    process.exit(2)
  }

  const exitCode = reportAndExit(results, format)
  process.exit(exitCode)
}

main().catch((err) => {
  console.error('Pipeline error:', err)
  process.exit(2)
})
