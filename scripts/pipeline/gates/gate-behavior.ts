/**
 * Gate 3: Behavior
 * Verifies that behavioral specs exist and have BR coverage:
 * - CMD/QRY/UC specs referenced by the UV exist
 * - BR coverage: BRs referenced by UV are also referenced in CMD specs
 */

import { readFile } from 'fs/promises'
import type { UVData, GateResult, GateItem, GateOptions } from '../lib/types'
import { resolveSpecPath, findAllCMDSpecs } from '../lib/spec-resolver'

const BEHAVIOR_PREFIXES = ['CMD', 'QRY', 'UC']
const WIKI_LINK_RE = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g

export async function check(uv: UVData, options?: GateOptions): Promise<GateResult> {
  const specsDir = options?.specsDir ?? 'specs'
  const items: GateItem[] = []

  // 1. Check that CMD/QRY/UC specs exist
  const behaviorArtifacts = uv.allArtifacts.filter((a) =>
    BEHAVIOR_PREFIXES.includes(a.prefix)
  )

  if (behaviorArtifacts.length === 0) {
    return {
      gate: 3,
      name: 'Behavior',
      status: 'warn',
      items: [{
        description: 'No behavior artifacts referenced',
        status: 'warn',
        detail: 'UV has no CMD/QRY/UC references',
      }],
      summary: 'No behavior artifacts to verify',
    }
  }

  for (const artifact of behaviorArtifacts) {
    const path = await resolveSpecPath(artifact.id, specsDir)
    items.push({
      description: `${artifact.id} spec exists`,
      status: path ? 'pass' : 'fail',
      detail: path ? path.replace(process.cwd() + '/', '') : `Spec not found for "${artifact.id}"`,
      artifactId: artifact.id,
      filePath: path ?? undefined,
    })
  }

  // 2. Check BR coverage: for each BR referenced in the UV,
  //    verify it's also referenced in at least one CMD/QRY spec
  const brArtifacts = uv.allArtifacts.filter((a) =>
    a.prefix === 'BR' || a.prefix === 'RUL'
  )

  if (brArtifacts.length > 0) {
    // Scan all CMD specs for BR references
    const cmdFiles = await findAllCMDSpecs(specsDir)
    const brRefsInCmds = new Set<string>()

    for (const cmdFile of cmdFiles) {
      const content = await readFile(cmdFile, 'utf-8')
      let match: RegExpExecArray | null
      const re = new RegExp(WIKI_LINK_RE.source, 'g')
      while ((match = re.exec(content)) !== null) {
        const target = match[1].trim()
        if (/^BR-/i.test(target) || /^RUL-/i.test(target)) {
          // Normalize: extract just the BR-XXX-NNN part
          const brId = target.match(/^(BR-[\w-]+)/i)?.[1]
          if (brId) brRefsInCmds.add(brId.toUpperCase())
        }
      }
    }

    let coveredCount = 0
    for (const br of brArtifacts) {
      const brId = br.id.match(/^(BR-[\w-]+)/i)?.[1]?.toUpperCase() ?? br.id.toUpperCase()
      const covered = brRefsInCmds.has(brId)
      if (covered) coveredCount++

      items.push({
        description: `BR coverage: ${br.id} referenced in CMD specs`,
        status: covered ? 'pass' : 'warn',
        detail: covered ? 'Referenced in at least one CMD' : 'Not referenced in any CMD spec',
        artifactId: br.id,
      })
    }

    const coveragePercent = brArtifacts.length > 0
      ? Math.round((coveredCount / brArtifacts.length) * 100)
      : 100

    items.push({
      description: `BR coverage: ${coveragePercent}%`,
      status: coveragePercent >= 95 ? 'pass' : coveragePercent >= 80 ? 'warn' : 'fail',
      detail: `${coveredCount}/${brArtifacts.length} BRs referenced in CMD specs`,
    })
  }

  const failCount = items.filter((i) => i.status === 'fail').length
  const warnCount = items.filter((i) => i.status === 'warn').length
  const status = failCount > 0 ? 'fail' : warnCount > 0 ? 'warn' : 'pass'

  return {
    gate: 3,
    name: 'Behavior',
    status,
    items,
    summary: failCount === 0
      ? `All behavior specs exist${warnCount > 0 ? ` (${warnCount} warnings)` : ''}`
      : `${failCount} checks failed`,
  }
}
