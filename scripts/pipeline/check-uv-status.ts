#!/usr/bin/env bun
/**
 * Standalone: Check UV completeness status
 * Reports % completion of a UV: specs existing, code existing, tests existing
 *
 * Usage: bun run pipeline:status UV-004 [--format console|json]
 */

import { resolve } from 'path'
import { parseArgs } from 'util'
import { parseUVFile, findAllUVFiles } from './lib/uv-parser'
import { resolveSpecPath, buildCodeMapping, actionNameToFileName } from './lib/spec-resolver'
import { parseCMDSpec } from './lib/cmd-parser'
import type { OutputFormat, UVData } from './lib/types'

async function checkUVStatus(uv: UVData, specsDir: string, projectRoot: string) {
  const codeMapping = await buildCodeMapping(projectRoot)

  const stats = {
    totalArtifacts: uv.allArtifacts.length,
    implemented: uv.artifacts.implemented.length,
    pending: uv.artifacts.pending.length,
    deferred: uv.artifacts.deferred.length,
    specsExist: 0,
    specsMissing: 0,
    codeExists: 0,
    codeMissing: 0,
    testsExist: 0,
    testsMissing: 0,
    details: [] as { id: string; status: string; specExists: boolean; codeExists: boolean; testExists: boolean }[],
  }

  for (const artifact of uv.allArtifacts) {
    const specPath = await resolveSpecPath(artifact.id, specsDir)
    const specExists = !!specPath
    if (specExists) stats.specsExist++
    else stats.specsMissing++

    let codeExists = false
    let testExists = false

    if (artifact.prefix === 'CMD' || artifact.prefix === 'QRY') {
      let codePath = codeMapping.get(artifact.id)
      if (!codePath && specPath) {
        const cmdData = await parseCMDSpec(specPath)
        if (cmdData) {
          const expectedFile = actionNameToFileName(cmdData.actionName)
          const { loadKddConfig: loadCfg } = await import('../lib/config')
          const cfg = await loadCfg()
          codePath = resolve(projectRoot, cfg.useCasesDir, expectedFile)
        }
      }

      if (codePath) {
        codeExists = await Bun.file(codePath).exists()
        if (codeExists) stats.codeExists++
        else stats.codeMissing++

        const testPath = codePath.replace('.use-case.ts', '.use-case.test.ts')
        testExists = await Bun.file(testPath).exists()
        if (testExists) stats.testsExist++
        else stats.testsMissing++
      } else {
        stats.codeMissing++
        stats.testsMissing++
      }
    }

    stats.details.push({
      id: artifact.id,
      status: artifact.status,
      specExists,
      codeExists,
      testExists,
    })
  }

  return stats
}

async function main() {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      format: { type: 'string', default: 'console' },
    },
    allowPositionals: true,
  })

  const format = values.format as OutputFormat
  const specsDir = 'specs'
  const projectRoot = process.cwd()

  let uvFiles: string[]

  if (positionals.length > 0) {
    // Specific UV
    const uvId = positionals[0]
    const allUVFiles = await findAllUVFiles(specsDir)
    uvFiles = allUVFiles.filter((f) => f.includes(uvId))

    if (uvFiles.length === 0) {
      console.error(`UV not found: ${uvId}`)
      process.exit(2)
    }
  } else {
    uvFiles = await findAllUVFiles(specsDir)
  }

  const allResults: { uv: UVData; stats: Awaited<ReturnType<typeof checkUVStatus>> }[] = []

  for (const uvFile of uvFiles) {
    const uv = await parseUVFile(uvFile)
    if (!uv) continue
    const stats = await checkUVStatus(uv, specsDir, projectRoot)
    allResults.push({ uv, stats })
  }

  if (format === 'json') {
    console.log(JSON.stringify(allResults.map(({ uv, stats }) => ({
      id: uv.id,
      title: uv.title,
      ...stats,
    })), null, 2))
  } else {
    for (const { uv, stats } of allResults) {
      const artPercent = stats.totalArtifacts > 0
        ? Math.round((stats.implemented / stats.totalArtifacts) * 100)
        : 0
      const specPercent = stats.totalArtifacts > 0
        ? Math.round((stats.specsExist / stats.totalArtifacts) * 100)
        : 0

      console.log(`\n${uv.id}: ${uv.title}`)
      console.log(`${'─'.repeat(40)}`)
      console.log(`Artifacts: ${stats.implemented} implemented, ${stats.pending} pending, ${stats.deferred} deferred (${artPercent}% done)`)
      console.log(`Specs:     ${stats.specsExist}/${stats.totalArtifacts} exist (${specPercent}%)`)

      const cmdCount = stats.codeExists + stats.codeMissing
      if (cmdCount > 0) {
        const codePercent = Math.round((stats.codeExists / cmdCount) * 100)
        const testPercent = Math.round((stats.testsExist / cmdCount) * 100)
        console.log(`Code:      ${stats.codeExists}/${cmdCount} exist (${codePercent}%)`)
        console.log(`Tests:     ${stats.testsExist}/${cmdCount} exist (${testPercent}%)`)
      }

      console.log()
      console.log('Details:')
      for (const d of stats.details) {
        const specIcon = d.specExists ? '\u2705' : '\u274C'
        const codeIcon = d.codeExists ? '\u2705' : d.status === 'deferred' ? '\u23ED\uFE0F' : '\u274C'
        const testIcon = d.testExists ? '\u2705' : d.status === 'deferred' ? '\u23ED\uFE0F' : '\u274C'
        console.log(`  ${d.id} [${d.status}] spec:${specIcon} code:${codeIcon} test:${testIcon}`)
      }
    }
  }
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(2)
})
