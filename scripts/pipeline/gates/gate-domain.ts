/**
 * Gate 2: Domain
 * Verifies that all domain-layer specs referenced by the UV exist:
 * - Entities, Events, Rules (ENT-, EVT-, BR-, RUL-)
 */

import type { UVData, GateResult, GateItem, GateOptions } from '../lib/types'
import { resolveSpecPath } from '../lib/spec-resolver'

const DOMAIN_PREFIXES = ['ENT', 'EVT', 'BR', 'RUL']

export async function check(uv: UVData, options?: GateOptions): Promise<GateResult> {
  const specsDir = options?.specsDir ?? 'specs'
  const items: GateItem[] = []

  // Filter artifacts that are domain-layer
  const domainArtifacts = uv.allArtifacts.filter((a) =>
    DOMAIN_PREFIXES.includes(a.prefix)
  )

  if (domainArtifacts.length === 0) {
    return {
      gate: 2,
      name: 'Domain',
      status: 'warn',
      items: [{
        description: 'No domain artifacts referenced',
        status: 'warn',
        detail: 'UV has no ENT/EVT/BR/RUL references',
      }],
      summary: 'No domain artifacts to verify',
    }
  }

  for (const artifact of domainArtifacts) {
    // For fragment references like "Entity#INV-ENTITY-006", resolve the base entity
    const targetId = artifact.fullTarget.includes('#')
      ? artifact.fullTarget.split('#')[0]
      : artifact.id

    const path = await resolveSpecPath(targetId, specsDir)
    items.push({
      description: `${artifact.id} spec exists`,
      status: path ? 'pass' : 'fail',
      detail: path ? path.replace(process.cwd() + '/', '') : `Spec file not found for "${targetId}"`,
      artifactId: artifact.id,
      filePath: path ?? undefined,
    })
  }

  const failCount = items.filter((i) => i.status === 'fail').length
  const status = failCount === 0 ? 'pass' : 'fail'

  return {
    gate: 2,
    name: 'Domain',
    status,
    items,
    summary: failCount === 0
      ? `All ${domainArtifacts.length} domain specs exist`
      : `${failCount}/${domainArtifacts.length} domain specs missing`,
  }
}
