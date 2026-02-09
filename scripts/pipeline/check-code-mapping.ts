#!/usr/bin/env bun
/**
 * Standalone: Check CMD -> code mapping
 * Verifies that each CMD/QRY has a corresponding use-case file
 *
 * Usage: bun run pipeline:mapping [--stubs-only] [--format console|json]
 */

import { basename, resolve } from 'path'
import { parseArgs } from 'util'
import { findAllCMDSpecs, buildCodeMapping, actionNameToFileName } from './lib/spec-resolver'
import { parseCMDSpec } from './lib/cmd-parser'
import type { OutputFormat } from './lib/types'

async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      'stubs-only': { type: 'boolean', default: false },
      format: { type: 'string', default: 'console' },
    },
    allowPositionals: false,
  })

  const stubsOnly = values['stubs-only']
  const format = values.format as OutputFormat
  const specsDir = 'specs'
  const projectRoot = process.cwd()

  const cmdFiles = await findAllCMDSpecs(specsDir)
  const codeMapping = await buildCodeMapping(projectRoot)

  const results: {
    cmdId: string
    specFile: string
    codeFile: string | null
    testFile: string | null
    hasCode: boolean
    hasTest: boolean
  }[] = []

  for (const cmdFile of cmdFiles) {
    const cmdData = await parseCMDSpec(cmdFile)
    if (!cmdData) continue

    const cmdId = cmdData.id

    // Check for code file
    let codePath = codeMapping.get(cmdId)
    if (!codePath) {
      const expectedFile = actionNameToFileName(cmdData.actionName)
      const { loadKddConfig } = await import('../lib/config')
      const kddConfig = await loadKddConfig()
      codePath = resolve(projectRoot, kddConfig.useCasesDir, expectedFile)
    }

    const hasCode = await Bun.file(codePath).exists()
    const testPath = codePath.replace('.use-case.ts', '.use-case.test.ts')
    const hasTest = await Bun.file(testPath).exists()

    results.push({
      cmdId,
      specFile: cmdFile.replace(projectRoot + '/', ''),
      codeFile: codePath.replace(projectRoot + '/', ''),
      testFile: testPath.replace(projectRoot + '/', ''),
      hasCode,
      hasTest,
    })
  }

  // Filter if --stubs-only
  const filtered = stubsOnly
    ? results.filter((r) => !r.hasCode)
    : results

  if (format === 'json') {
    console.log(JSON.stringify({
      total: results.length,
      withCode: results.filter((r) => r.hasCode).length,
      withoutCode: results.filter((r) => !r.hasCode).length,
      withTests: results.filter((r) => r.hasTest).length,
      results: filtered,
    }, null, 2))
  } else {
    console.log(`\nCMD -> Code Mapping Report`)
    console.log(`${'─'.repeat(50)}`)
    console.log(`Total CMDs: ${results.length}`)
    console.log(`With code:  ${results.filter((r) => r.hasCode).length}`)
    console.log(`Missing:    ${results.filter((r) => !r.hasCode).length}`)
    console.log(`With tests: ${results.filter((r) => r.hasTest).length}`)
    console.log()

    for (const r of filtered) {
      const codeIcon = r.hasCode ? '\u2705' : '\u274C'
      const testIcon = r.hasTest ? '\u2705' : '\u274C'
      console.log(`${r.cmdId}:`)
      console.log(`  Spec: ${r.specFile}`)
      console.log(`  Code: ${codeIcon} ${r.codeFile}`)
      console.log(`  Test: ${testIcon} ${r.testFile}`)
      console.log()
    }

    const allMapped = results.every((r) => r.hasCode)
    console.log(allMapped ? 'PASS' : 'FAIL')
  }

  const hasMissing = results.some((r) => !r.hasCode)
  process.exit(hasMissing ? 1 : 0)
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(2)
})
