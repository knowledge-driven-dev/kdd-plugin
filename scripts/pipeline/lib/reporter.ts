/**
 * Reporter - formats pipeline results for different output targets
 */

import type { GateResult, GateItemStatus, PipelineResult, OutputFormat } from './types'

const ICONS: Record<GateItemStatus, string> = {
  pass: '\u2705',
  fail: '\u274C',
  warn: '\u26A0\uFE0F',
  skip: '\u23ED\uFE0F',
}

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

function colorize(text: string, color: keyof typeof COLORS): string {
  return `${COLORS[color]}${text}${COLORS.reset}`
}

function statusColor(status: GateItemStatus): keyof typeof COLORS {
  switch (status) {
    case 'pass': return 'green'
    case 'fail': return 'red'
    case 'warn': return 'yellow'
    case 'skip': return 'gray'
  }
}

/**
 * Format a single gate result for console output
 */
function formatGateConsole(gate: GateResult): string {
  const icon = ICONS[gate.status]
  const color = statusColor(gate.status)
  const header = `${icon} Gate ${gate.gate}: ${gate.name} — ${colorize(gate.status.toUpperCase(), color)}`
  const lines = [header]

  if (gate.items.length > 0) {
    for (const item of gate.items) {
      const itemIcon = ICONS[item.status]
      let line = `   ${itemIcon} ${item.description}`
      if (item.detail) {
        line += colorize(` (${item.detail})`, 'dim')
      }
      lines.push(line)
    }
  }

  if (gate.summary) {
    lines.push(colorize(`   ${gate.summary}`, 'dim'))
  }

  return lines.join('\n')
}

/**
 * Format full pipeline result for console
 */
function formatConsole(result: PipelineResult): string {
  const lines: string[] = []

  lines.push('')
  lines.push(colorize(`Pipeline Check: ${result.uv.id} — ${result.uv.title}`, 'bold'))
  lines.push(colorize(`File: ${result.uv.filePath}`, 'dim'))
  lines.push('')

  // Artifact summary
  const { pending, implemented, deferred } = result.uv.artifacts
  lines.push(`Artifacts: ${colorize(`${implemented.length} implemented`, 'green')}, ${colorize(`${pending.length} pending`, 'yellow')}, ${colorize(`${deferred.length} deferred`, 'gray')}`)
  lines.push('')

  // Gate results
  for (const gate of result.gates) {
    lines.push(formatGateConsole(gate))
    lines.push('')
  }

  // Overall
  const overallIcon = ICONS[result.status]
  const overallColor = statusColor(result.status)
  lines.push(colorize('─'.repeat(50), 'dim'))
  lines.push(`${overallIcon} Overall: ${colorize(result.status.toUpperCase(), overallColor)} (${result.durationMs}ms)`)
  lines.push('')

  return lines.join('\n')
}

/**
 * Format pipeline result as GitHub Actions annotations
 */
function formatGitHub(result: PipelineResult): string {
  const lines: string[] = []

  for (const gate of result.gates) {
    for (const item of gate.items) {
      if (item.status === 'fail') {
        const file = item.filePath ?? result.uv.filePath
        lines.push(`::error file=${file}::Gate ${gate.gate} (${gate.name}): ${item.description}${item.detail ? ` - ${item.detail}` : ''}`)
      } else if (item.status === 'warn') {
        const file = item.filePath ?? result.uv.filePath
        lines.push(`::warning file=${file}::Gate ${gate.gate} (${gate.name}): ${item.description}${item.detail ? ` - ${item.detail}` : ''}`)
      }
    }
  }

  // Step summary in markdown
  lines.push('')
  lines.push('## Pipeline Check Results')
  lines.push('')
  lines.push(`**${result.uv.id}: ${result.uv.title}** — ${result.status.toUpperCase()}`)
  lines.push('')
  lines.push('| Gate | Name | Status | Details |')
  lines.push('|------|------|--------|---------|')

  for (const gate of result.gates) {
    const icon = gate.status === 'pass' ? ':white_check_mark:' :
                 gate.status === 'fail' ? ':x:' :
                 gate.status === 'warn' ? ':warning:' : ':fast_forward:'
    lines.push(`| ${gate.gate} | ${gate.name} | ${icon} ${gate.status} | ${gate.summary} |`)
  }

  lines.push('')

  return lines.join('\n')
}

/**
 * Format pipeline results for the specified output format
 */
export function formatResults(results: PipelineResult[], format: OutputFormat): string {
  switch (format) {
    case 'json':
      return JSON.stringify(results, null, 2)

    case 'github': {
      return results.map(formatGitHub).join('\n')
    }

    case 'console':
    default:
      return results.map(formatConsole).join('\n')
  }
}

/**
 * Write step summary for GitHub Actions
 */
export function writeGitHubSummary(results: PipelineResult[]): string {
  const lines: string[] = []
  lines.push('# KDD Pipeline Check')
  lines.push('')

  const overallPass = results.every((r) => r.status === 'pass' || r.status === 'warn')
  lines.push(`**Overall: ${overallPass ? 'PASS :white_check_mark:' : 'FAIL :x:'}**`)
  lines.push('')

  for (const result of results) {
    lines.push(`### ${result.uv.id}: ${result.uv.title}`)
    lines.push('')
    lines.push('| Gate | Name | Status |')
    lines.push('|------|------|--------|')

    for (const gate of result.gates) {
      const icon = gate.status === 'pass' ? ':white_check_mark:' :
                   gate.status === 'fail' ? ':x:' :
                   gate.status === 'warn' ? ':warning:' : ':fast_forward:'
      lines.push(`| ${gate.gate} | ${gate.name} | ${icon} |`)
    }

    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Print results to stdout and return exit code
 */
export function reportAndExit(results: PipelineResult[], format: OutputFormat): number {
  const output = formatResults(results, format)
  console.log(output)

  if (format === 'github') {
    const summaryPath = process.env.GITHUB_STEP_SUMMARY
    if (summaryPath) {
      Bun.write(summaryPath, writeGitHubSummary(results))
    }
  }

  const hasFail = results.some((r) => r.status === 'fail')
  return hasFail ? 1 : 0
}
