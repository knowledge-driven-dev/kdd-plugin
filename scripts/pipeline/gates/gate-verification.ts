/**
 * Gate 5: Verification
 * Verifies that REQ specs exist and contain Gherkin acceptance criteria
 */

import { readFile } from 'fs/promises'
import type { UVData, GateResult, GateItem, GateOptions } from '../lib/types'
import { resolveSpecPath } from '../lib/spec-resolver'

export async function check(uv: UVData, options?: GateOptions): Promise<GateResult> {
  const specsDir = options?.specsDir ?? 'specs'
  const items: GateItem[] = []

  const reqArtifacts = uv.allArtifacts.filter((a) => a.prefix === 'REQ')

  if (reqArtifacts.length === 0) {
    return {
      gate: 5,
      name: 'Verification',
      status: 'warn',
      items: [{
        description: 'No REQ artifacts referenced',
        status: 'warn',
        detail: 'UV has no REQ references — verification criteria not tracked',
      }],
      summary: 'No REQ artifacts to verify',
    }
  }

  for (const artifact of reqArtifacts) {
    const path = await resolveSpecPath(artifact.id, specsDir)

    if (!path) {
      items.push({
        description: `${artifact.id} spec exists`,
        status: artifact.status === 'deferred' ? 'skip' : 'fail',
        detail: artifact.status === 'deferred' ? 'Deferred' : `Spec not found for "${artifact.id}"`,
        artifactId: artifact.id,
      })
      continue
    }

    items.push({
      description: `${artifact.id} spec exists`,
      status: 'pass',
      artifactId: artifact.id,
      filePath: path,
    })

    // Check for Gherkin blocks
    const content = await readFile(path, 'utf-8')
    const gherkinBlocks = extractGherkinBlocks(content)

    items.push({
      description: `${artifact.id} has Gherkin criteria`,
      status: gherkinBlocks.length > 0 ? 'pass' : 'fail',
      detail: gherkinBlocks.length > 0
        ? `${gherkinBlocks.length} Gherkin block(s) found`
        : 'No ```gherkin blocks found',
      artifactId: artifact.id,
      filePath: path,
    })
  }

  const failCount = items.filter((i) => i.status === 'fail').length
  const status = failCount === 0 ? 'pass' : 'fail'

  return {
    gate: 5,
    name: 'Verification',
    status,
    items,
    summary: failCount === 0
      ? `All ${reqArtifacts.length} REQ specs have Gherkin criteria`
      : `${failCount} REQ checks failed`,
  }
}

/**
 * Extract ```gherkin fenced code blocks from content
 */
function extractGherkinBlocks(content: string): string[] {
  const blocks: string[] = []
  const regex = /```gherkin\s*\n([\s\S]*?)```/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    blocks.push(match[1].trim())
  }

  return blocks
}
