/**
 * UV (Value Unit) file parser
 * Extracts artifacts with their status from UV spec files
 */

import { resolve } from 'path'
import { readFile } from 'fs/promises'
import { loadSpecFile } from '../../spec-validator/lib/parser'
import type { ArtifactRef, ArtifactStatus, UVData } from './types'

const WIKI_LINK_RE = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g

/** Section name patterns grouped by status */
const SECTION_PATTERNS: Record<ArtifactStatus, RegExp[]> = {
  implemented: [
    /^implementado$/i,
    /^implemented$/i,
    /^dominio\b/i,
    /^ya\s+validados?$/i,
    /^validados?\s*\(/i,
  ],
  pending: [
    /^por\s+implementar$/i,
    /^pending$/i,
  ],
  deferred: [
    /^fuera\s+de\s+alcance/i,
    /^out\s+of\s+scope/i,
    /^deferred$/i,
  ],
}

/**
 * Normalize text for accent-insensitive comparison
 */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

/**
 * Detect prefix from a wiki-link target
 */
function detectPrefix(target: string): string {
  // Handle fragment targets like "Entity#INV-ENTITY-006"
  const clean = target.includes('#') ? target.split('#')[0] : target
  const match = clean.match(/^([A-Z]+-?\d*)/i)
  if (!match) return ''

  // Extract just the alpha prefix part
  const alphaMatch = clean.match(/^([A-Z]+)/i)
  return alphaMatch ? alphaMatch[1].toUpperCase() : ''
}

/**
 * Classify a section heading into an artifact status
 */
function classifySection(heading: string): ArtifactStatus | null {
  const normalized = normalize(heading)

  for (const [status, patterns] of Object.entries(SECTION_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        return status as ArtifactStatus
      }
    }
  }
  return null
}

/**
 * Extract wiki-links from a block of text with line info
 */
function extractLinksFromText(
  text: string,
  baseLineOffset: number
): { target: string; line: number }[] {
  const links: { target: string; line: number }[] = []
  const lines = text.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let match: RegExpExecArray | null
    const re = new RegExp(WIKI_LINK_RE.source, 'g')
    while ((match = re.exec(line)) !== null) {
      links.push({
        target: match[1].trim(),
        line: baseLineOffset + i,
      })
    }
  }

  return links
}

/**
 * Detect if a line's context indicates it's a checkbox item
 */
function isChecked(line: string): boolean {
  return /\[x\]/i.test(line)
}

function isUnchecked(line: string): boolean {
  return /\[\s\]/.test(line)
}

function isStrikethrough(line: string): boolean {
  return /~~.+~~/.test(line)
}

/**
 * Detect artifact status from the line it appears on
 * This handles cases where the section doesn't clearly indicate status,
 * but the checkbox/strikethrough on the line does
 */
function detectLineStatus(line: string, sectionStatus: ArtifactStatus | null): ArtifactStatus {
  if (isStrikethrough(line)) return 'deferred'
  if (isChecked(line)) return 'implemented'
  if (isUnchecked(line)) return 'pending'
  return sectionStatus ?? 'pending'
}

/**
 * Get section content between headings from the raw markdown
 */
function getSections(content: string): { heading: string; level: number; body: string; startLine: number }[] {
  const lines = content.split('\n')
  const sections: { heading: string; level: number; body: string; startLine: number }[] = []
  let currentHeading = ''
  let currentLevel = 0
  let currentBody: string[] = []
  let currentStartLine = 0

  for (let i = 0; i < lines.length; i++) {
    const headingMatch = lines[i].match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      if (currentHeading) {
        sections.push({
          heading: currentHeading,
          level: currentLevel,
          body: currentBody.join('\n'),
          startLine: currentStartLine,
        })
      }
      currentHeading = headingMatch[2].trim()
      currentLevel = headingMatch[1].length
      currentBody = []
      currentStartLine = i + 1
    } else {
      currentBody.push(lines[i])
    }
  }

  // Push last section
  if (currentHeading) {
    sections.push({
      heading: currentHeading,
      level: currentLevel,
      body: currentBody.join('\n'),
      startLine: currentStartLine,
    })
  }

  return sections
}

/**
 * Parse a UV file and extract all artifact references with status
 */
export async function parseUVFile(filePath: string): Promise<UVData | null> {
  const spec = await loadSpecFile(filePath)
  if (!spec) return null

  const id = (spec.frontmatter.id as string) ?? ''
  const title = (spec.frontmatter.title as string) ?? ''

  const artifacts: UVData['artifacts'] = {
    pending: [],
    implemented: [],
    deferred: [],
  }

  // Parse sections to determine context for each wiki-link
  const sections = getSections(spec.content)

  // Determine if this UV uses tracking sections (has Implemented/Pending/Deferred subsections)
  const hasTrackingSections = sections.some(
    (s) => s.level >= 3 && classifySection(s.heading) !== null
  )

  if (hasTrackingSections) {
    // UV-002/UV-004 style: sections define status
    // Only process sections under "Alcance" (level 2) and its subsections (level 3+)
    let insideAlcance = false
    let currentStatus: ArtifactStatus | null = null

    for (const section of sections) {
      // Track when we enter/leave the Alcance section
      if (section.level === 2) {
        insideAlcance = normalize(section.heading).includes('alcance')
        currentStatus = null
      }

      if (!insideAlcance) continue

      const sectionClass = classifySection(section.heading)
      if (sectionClass !== null && section.level >= 3) {
        currentStatus = sectionClass
      }

      // Extract wiki-links from section body
      const links = extractLinksFromText(section.body, section.startLine)
      const bodyLines = section.body.split('\n')

      for (const link of links) {
        const localLineIdx = link.line - section.startLine
        const lineText = bodyLines[localLineIdx] ?? ''
        const status = detectLineStatus(lineText, currentStatus)
        const prefix = detectPrefix(link.target)

        artifacts[status].push({
          id: link.target,
          prefix,
          fullTarget: link.target,
          status,
          line: link.line,
        })
      }
    }
  } else {
    // UV-001 style: flat list in "Alcance" section, no explicit status tracking
    // Treat all as implemented if no checkboxes, or use line-level detection
    const alcanceSection = sections.find((s) =>
      normalize(s.heading).includes('alcance')
    )

    if (alcanceSection) {
      const links = extractLinksFromText(alcanceSection.body, alcanceSection.startLine)
      const bodyLines = alcanceSection.body.split('\n')

      for (const link of links) {
        const localLineIdx = link.line - alcanceSection.startLine
        const lineText = bodyLines[localLineIdx] ?? ''
        // For flat UVs, assume implemented unless line says otherwise
        const status = detectLineStatus(lineText, 'implemented')
        const prefix = detectPrefix(link.target)

        artifacts[status].push({
          id: link.target,
          prefix,
          fullTarget: link.target,
          status,
          line: link.line,
        })
      }
    }

    // Also check Trazabilidad section for additional refs (UV-001 style)
    const trazSection = sections.find((s) =>
      normalize(s.heading).includes('trazabilidad')
    )
    if (trazSection) {
      const links = extractLinksFromText(trazSection.body, trazSection.startLine)
      const existingIds = new Set([
        ...artifacts.pending.map((a) => a.id),
        ...artifacts.implemented.map((a) => a.id),
        ...artifacts.deferred.map((a) => a.id),
      ])

      for (const link of links) {
        if (existingIds.has(link.target)) continue
        const prefix = detectPrefix(link.target)
        artifacts.implemented.push({
          id: link.target,
          prefix,
          fullTarget: link.target,
          status: 'implemented',
          line: link.line,
        })
      }
    }
  }

  const allArtifacts = [
    ...artifacts.pending,
    ...artifacts.implemented,
    ...artifacts.deferred,
  ]

  return {
    id,
    title,
    filePath,
    frontmatter: spec.frontmatter,
    artifacts,
    allArtifacts,
  }
}

/**
 * Find all UV files in the specs directory
 */
export async function findAllUVFiles(specsDir: string): Promise<string[]> {
  const uvDir = resolve(specsDir, '00-requirements/value-units')
  const glob = new Bun.Glob('UV-*.md')
  const paths: string[] = []

  for await (const file of glob.scan({ cwd: uvDir, absolute: true })) {
    paths.push(file)
  }

  return paths.sort()
}

/**
 * Parse all UV files in the specs directory
 */
export async function parseAllUVFiles(specsDir: string): Promise<UVData[]> {
  const files = await findAllUVFiles(specsDir)
  const results: UVData[] = []

  for (const file of files) {
    const data = await parseUVFile(file)
    if (data) results.push(data)
  }

  return results
}
