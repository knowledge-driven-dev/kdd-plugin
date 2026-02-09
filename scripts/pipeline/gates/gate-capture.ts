/**
 * Gate 1: Capture
 * Verifies that the UV file has proper structure:
 * - Has frontmatter with required fields
 * - Has required sections (Objetivo, Alcance, Inputs, Outputs, Criterios)
 * - Has at least 1 artifact reference
 */

import type { UVData, GateResult, GateItem, GateOptions } from '../lib/types'
import { loadSpecFile } from '../../spec-validator/lib/parser'

const REQUIRED_FRONTMATTER = ['id', 'kind', 'title', 'status', 'owner']

const REQUIRED_SECTIONS = [
  ['objetivo', 'objective'],
  ['alcance', 'scope'],
  ['inputs', 'entradas'],
  ['outputs', 'salidas'],
  ['criterios de salida', 'criterios de exito', 'definition of done', 'exit criteria'],
]

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export async function check(uv: UVData, options?: GateOptions): Promise<GateResult> {
  const items: GateItem[] = []
  const spec = await loadSpecFile(uv.filePath)

  if (!spec) {
    return {
      gate: 1,
      name: 'Capture',
      status: 'fail',
      items: [{ description: 'Could not load UV file', status: 'fail', filePath: uv.filePath }],
      summary: 'UV file could not be parsed',
    }
  }

  // Check frontmatter fields
  for (const field of REQUIRED_FRONTMATTER) {
    const has = field in spec.frontmatter && spec.frontmatter[field] !== undefined
    items.push({
      description: `Frontmatter field: ${field}`,
      status: has ? 'pass' : 'fail',
      detail: has ? undefined : `Missing "${field}" in frontmatter`,
      filePath: uv.filePath,
    })
  }

  // Check required sections
  const headingTexts = spec.headings.map((h) => normalize(h.text))

  for (const sectionNames of REQUIRED_SECTIONS) {
    const found = sectionNames.some((name) =>
      headingTexts.some((h) => h.includes(normalize(name)))
    )
    items.push({
      description: `Section: ${sectionNames[0]}`,
      status: found ? 'pass' : 'fail',
      detail: found ? undefined : `Missing section matching: ${sectionNames.join(' / ')}`,
      filePath: uv.filePath,
    })
  }

  // Check at least 1 artifact reference
  const hasArtifacts = uv.allArtifacts.length > 0
  items.push({
    description: 'Has artifact references',
    status: hasArtifacts ? 'pass' : 'fail',
    detail: hasArtifacts
      ? `${uv.allArtifacts.length} artifacts found`
      : 'No wiki-link references to specs found',
    filePath: uv.filePath,
  })

  const failCount = items.filter((i) => i.status === 'fail').length
  const status = failCount === 0 ? 'pass' : 'fail'

  return {
    gate: 1,
    name: 'Capture',
    status,
    items,
    summary: failCount === 0
      ? `All ${items.length} checks passed`
      : `${failCount}/${items.length} checks failed`,
  }
}
