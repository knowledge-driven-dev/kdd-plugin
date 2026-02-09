#!/usr/bin/env bun
/**
 * Standalone: Check BR -> CMD coverage
 * Scans all BR-* and CMD-* specs, reports BRs not referenced in any CMD
 *
 * Usage: bun run pipeline:coverage [--threshold 95] [--format console|json]
 */

import { readFile } from 'fs/promises'
import { basename } from 'path'
import { parseArgs } from 'util'
import { findAllBRSpecs, findAllCMDSpecs } from './lib/spec-resolver'
import type { OutputFormat } from './lib/types'

const WIKI_LINK_RE = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g

async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      threshold: { type: 'string', default: '95' },
      format: { type: 'string', default: 'console' },
    },
    allowPositionals: false,
  })

  const threshold = parseInt(values.threshold!, 10)
  const format = values.format as OutputFormat
  const specsDir = 'specs'

  // Find all BR specs
  const brFiles = await findAllBRSpecs(specsDir)
  const brIds = brFiles.map((f) => {
    const base = basename(f, '.md')
    return base.match(/^(BR-[\w-]+)/i)?.[1]?.toUpperCase() ?? base.toUpperCase()
  })

  // Find all CMD specs and extract BR references
  const cmdFiles = await findAllCMDSpecs(specsDir)
  const brRefsInCmds = new Map<string, string[]>() // BR-ID -> [CMD-IDs]

  for (const cmdFile of cmdFiles) {
    const content = await readFile(cmdFile, 'utf-8')
    const cmdId = basename(cmdFile, '.md').match(/^(CMD-\d+)/i)?.[1] ?? basename(cmdFile, '.md')

    let match: RegExpExecArray | null
    const re = new RegExp(WIKI_LINK_RE.source, 'g')
    while ((match = re.exec(content)) !== null) {
      const target = match[1].trim()
      const brId = target.match(/^(BR-[\w-]+)/i)?.[1]?.toUpperCase()
      if (brId) {
        if (!brRefsInCmds.has(brId)) brRefsInCmds.set(brId, [])
        brRefsInCmds.get(brId)!.push(cmdId)
      }
    }
  }

  // Calculate coverage
  const covered: string[] = []
  const uncovered: string[] = []

  for (const brId of brIds) {
    if (brRefsInCmds.has(brId)) {
      covered.push(brId)
    } else {
      uncovered.push(brId)
    }
  }

  const coveragePercent = brIds.length > 0
    ? Math.round((covered.length / brIds.length) * 100)
    : 100

  // Output
  if (format === 'json') {
    console.log(JSON.stringify({
      total: brIds.length,
      covered: covered.length,
      uncovered: uncovered.length,
      coveragePercent,
      threshold,
      pass: coveragePercent >= threshold,
      uncoveredBRs: uncovered,
      coverageMap: Object.fromEntries(brRefsInCmds),
    }, null, 2))
  } else {
    console.log(`\nBR -> CMD Coverage Report`)
    console.log(`${'─'.repeat(40)}`)
    console.log(`Total BRs: ${brIds.length}`)
    console.log(`Covered:   ${covered.length}`)
    console.log(`Uncovered: ${uncovered.length}`)
    console.log(`Coverage:  ${coveragePercent}% (threshold: ${threshold}%)`)
    console.log()

    if (uncovered.length > 0) {
      console.log('Uncovered BRs:')
      for (const br of uncovered) {
        console.log(`  - ${br}`)
      }
      console.log()
    }

    if (covered.length > 0) {
      console.log('Coverage map:')
      for (const br of covered) {
        const cmds = brRefsInCmds.get(br) ?? []
        console.log(`  ${br} -> ${cmds.join(', ')}`)
      }
      console.log()
    }

    console.log(coveragePercent >= threshold ? 'PASS' : 'FAIL')
  }

  process.exit(coveragePercent >= threshold ? 0 : 1)
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(2)
})
