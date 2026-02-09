/**
 * CMD Spec Parser
 * Extracts structured data from CMD specification files for scaffold generation
 */

import { loadSpecFile } from '../../spec-validator/lib/parser'
import type { CMDSpecData, CMDInput, CMDError } from './types'

const WIKI_LINK_RE = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g

/**
 * Normalize text for accent-insensitive matching
 */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

/**
 * Find a section's content by matching heading names
 */
function getSectionContent(
  content: string,
  headings: { level: number; text: string; line: number }[],
  names: string[]
): string | null {
  const normalizedNames = names.map(normalize)
  const lines = content.split('\n')

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i]
    if (!normalizedNames.some((n) => normalize(heading.text).includes(n))) continue

    // Find content between this heading and the next same-or-higher level heading
    const startLine = heading.line // 1-indexed from AST
    const nextHeading = headings.find(
      (h, j) => j > i && h.level <= heading.level
    )
    const endLine = nextHeading ? nextHeading.line - 1 : lines.length

    return lines.slice(startLine, endLine).join('\n').trim()
  }

  return null
}

/**
 * Parse a markdown table into rows of string arrays
 */
function parseTable(text: string): string[][] {
  const lines = text.split('\n').filter((l) => l.trim().startsWith('|'))
  if (lines.length < 2) return []

  // Skip header separator (row with dashes)
  const dataLines = lines.filter((l) => !/^\|\s*[-:]+/.test(l))

  return dataLines.map((line) =>
    line
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0)
  )
}

/**
 * Extract wiki-link targets from text
 */
function extractWikiLinks(text: string): string[] {
  const links: string[] = []
  let match: RegExpExecArray | null
  const re = new RegExp(WIKI_LINK_RE.source, 'g')
  while ((match = re.exec(text)) !== null) {
    links.push(match[1].trim())
  }
  return links
}

/**
 * Extract bullet list items from a section
 */
function extractBullets(text: string): string[] {
  return text
    .split('\n')
    .filter((l) => /^\s*[-*]\s+/.test(l))
    .map((l) => l.replace(/^\s*[-*]\s+/, '').trim())
}

/**
 * Derive actionName and entityName from the H1 heading
 * e.g. "CMD-023: TerminateChallenge" -> { actionName: "TerminateChallenge", ... }
 */
function deriveNames(h1Text: string): { actionName: string; entityName: string } {
  // Extract the PascalCase part after the colon
  const match = h1Text.match(/:\s*([A-Z]\w+)/)
  const actionName = match ? match[1] : h1Text.replace(/^CMD-\d+[:\s]*/, '').trim()

  // Split PascalCase to extract entity
  const parts = actionName.replace(/([a-z])([A-Z])/g, '$1 $2').split(' ')
  const entityName = parts.length > 1 ? parts.slice(1).join('') : parts[0]

  return { actionName, entityName }
}

/**
 * Parse a CMD spec file and extract structured data
 */
export async function parseCMDSpec(filePath: string): Promise<CMDSpecData | null> {
  const spec = await loadSpecFile(filePath)
  if (!spec) return null
  if (spec.docType !== 'command' && spec.docType !== 'query') return null

  const id = (spec.frontmatter.id as string) ?? ''
  const title = (spec.frontmatter.title as string) ?? ''
  const { headings, content } = spec

  // Derive action/entity names from H1
  const h1 = headings.find((h) => h.level === 1)
  const { actionName, entityName } = h1
    ? deriveNames(h1.text)
    : { actionName: id, entityName: '' }

  // Parse Input table
  const inputSection = getSectionContent(content, headings, ['input', 'inputs', 'entrada', 'entradas'])
  const inputs: CMDInput[] = []
  if (inputSection) {
    const rows = parseTable(inputSection)
    // Skip header row (first row after filtering)
    for (const row of rows.slice(1)) {
      if (row.length >= 3) {
        inputs.push({
          name: row[0].replace(/`/g, ''),
          type: row[1].replace(/`/g, ''),
          required: /yes|si|true|required/i.test(row[2]),
          validation: row[3] ?? '',
        })
      }
    }
  }

  // Parse Possible Errors table
  const errorsSection = getSectionContent(content, headings, ['possible errors', 'errores', 'errors'])
  const errors: CMDError[] = []
  if (errorsSection) {
    const rows = parseTable(errorsSection)
    for (const row of rows.slice(1)) {
      if (row.length >= 3) {
        errors.push({
          code: row[0].replace(/`/g, ''),
          condition: row[1],
          message: row[2].replace(/"/g, ''),
        })
      }
    }
  }

  // Parse Rules Validated
  const rulesSection = getSectionContent(content, headings, ['rules validated', 'reglas', 'rules'])
  const rulesReferenced: string[] = []
  if (rulesSection) {
    const links = extractWikiLinks(rulesSection)
    for (const link of links) {
      if (/^BR-/i.test(link) || /^RUL-/i.test(link)) {
        rulesReferenced.push(link)
      }
    }
  }

  // Parse Events Generated
  const eventsSection = getSectionContent(content, headings, ['events generated', 'eventos', 'events'])
  const eventsGenerated: string[] = []
  if (eventsSection) {
    const links = extractWikiLinks(eventsSection)
    for (const link of links) {
      if (/^EVT-/i.test(link)) {
        eventsGenerated.push(link)
      }
    }
    // Also extract event names from backtick-quoted identifiers
    const backtickEvents = eventsSection.match(/`(EVT-[^`]+)`/g)
    if (backtickEvents) {
      for (const evt of backtickEvents) {
        const name = evt.replace(/`/g, '')
        if (!eventsGenerated.includes(name)) {
          eventsGenerated.push(name)
        }
      }
    }
    // Also extract from plain text "EVT-..." patterns
    const plainEvents = eventsSection.match(/EVT-[\w-]+/g)
    if (plainEvents) {
      for (const evt of plainEvents) {
        if (!eventsGenerated.includes(evt)) {
          eventsGenerated.push(evt)
        }
      }
    }
  }

  // Parse Preconditions
  const preSection = getSectionContent(content, headings, ['preconditions', 'precondiciones', 'pre'])
  const preconditions = preSection ? extractBullets(preSection) : []

  return {
    id,
    title,
    actionName,
    entityName,
    inputs,
    errors,
    rulesReferenced,
    eventsGenerated,
    preconditions,
    filePath,
  }
}
