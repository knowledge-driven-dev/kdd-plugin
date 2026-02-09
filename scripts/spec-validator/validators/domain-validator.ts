/**
 * Domain-level validator
 * Validates multi-domain KDD structure, manifests, and cross-domain references
 */

import type { SpecFile, ValidationResult } from '../lib/parser'
import type { EntityIndex } from '../lib/entity-index'
import {
  type MultiDomainConfig,
  type LoadedDomain,
  loadAllDomains,
  validateDependencies,
  validateExports,
  parseCrossDomainReference,
  getDomainFromPath,
} from '../lib/domain'

export interface DomainValidationContext {
  config: MultiDomainConfig
  domains: Map<string, LoadedDomain>
  specsDir: string
}

/**
 * Validates the multi-domain structure
 */
export async function validateDomainStructure(
  config: MultiDomainConfig,
  specsDir: string
): Promise<{ results: ValidationResult[]; context: DomainValidationContext }> {
  const results: ValidationResult[] = []

  // Load all domain manifests
  const domains = await loadAllDomains(config.domainsPath)

  const context: DomainValidationContext = {
    config,
    domains,
    specsDir,
  }

  // Validate each domain manifest
  for (const [id, domain] of domains) {
    if (domain.parseError) {
      results.push({
        level: 'error',
        rule: 'domain/manifest-error',
        message: `Domain '${id}': ${domain.parseError}`,
      })
    }
  }

  // Validate dependencies between domains
  const depValidation = validateDependencies(domains)
  for (const error of depValidation.errors) {
    results.push({
      level: 'error',
      rule: 'domain/dependency-error',
      message: error,
    })
  }
  for (const warning of depValidation.warnings) {
    results.push({
      level: 'warning',
      rule: 'domain/dependency-warning',
      message: warning,
    })
  }

  // Validate exports for each domain
  for (const [id, domain] of domains) {
    if (!domain.manifest) continue

    const exportValidation = await validateExports(domain, specsDir)
    for (const missing of exportValidation.missingExports) {
      results.push({
        level: 'error',
        rule: 'domain/missing-export',
        message: `Domain '${id}' exports ${missing.type} '${missing.artifact}' but it doesn't exist`,
        suggestion: `Create the file or remove from exports in _manifest.yaml`,
      })
    }
  }

  return { results, context }
}

/**
 * Validates cross-domain references in a spec file
 */
export function validateCrossDomainReferences(
  spec: SpecFile,
  context: DomainValidationContext,
  entityIndex: EntityIndex
): ValidationResult[] {
  const results: ValidationResult[] = []
  const { config, domains, specsDir } = context

  // Get the domain this file belongs to
  const fileDomain = getDomainFromPath(spec.path, specsDir)

  // If not in a domain, skip cross-domain validation
  if (!fileDomain) {
    return results
  }

  // Get the domain manifest
  const domainInfo = domains.get(fileDomain)
  const manifest = domainInfo?.manifest

  // Validate each wiki-link
  for (const link of spec.wikiLinks) {
    const ref = parseCrossDomainReference(link.target)

    // If it's an explicit cross-domain reference
    if (ref.explicit && ref.domain) {
      // Check if the target domain exists
      if (ref.domain !== '_shared' && !domains.has(ref.domain)) {
        results.push({
          level: 'error',
          rule: 'domain/invalid-reference',
          message: `Reference to non-existent domain '${ref.domain}' in [[${link.target}]]`,
          line: link.line,
          suggestion: `Available domains: ${Array.from(domains.keys()).join(', ')}`,
        })
        continue
      }

      // Check if the reference is declared in dependencies
      if (manifest && ref.domain !== fileDomain && ref.domain !== '_shared') {
        const hasDependency = manifest.dependencies?.some((dep) => dep.domain === ref.domain)
        if (!hasDependency) {
          results.push({
            level: 'warning',
            rule: 'domain/undeclared-dependency',
            message: `Reference to '${ref.domain}::${ref.target}' but domain '${ref.domain}' is not declared in dependencies`,
            line: link.line,
            suggestion: `Add '${ref.domain}' to dependencies in _manifest.yaml`,
          })
        }

        // Check if the specific artifact is in imports
        const dependency = manifest.dependencies?.find((dep) => dep.domain === ref.domain)
        if (dependency?.imports) {
          const imports = dependency.imports
          const allImports = [
            ...(imports.entities || []),
            ...(imports.events || []),
            ...(imports.commands || []),
            ...(imports.queries || []),
            ...(imports['value-objects'] || []),
          ]
          if (!allImports.includes(ref.target)) {
            results.push({
              level: 'info',
              rule: 'domain/undeclared-import',
              message: `Using '${ref.target}' from domain '${ref.domain}' but it's not in the imports list`,
              line: link.line,
              suggestion: `Consider adding '${ref.target}' to imports.${getImportCategory(ref.target)} in _manifest.yaml`,
            })
          }
        }

        // Check if the artifact is exported by the target domain
        const targetDomain = domains.get(ref.domain)
        if (targetDomain?.manifest?.exports) {
          const exports = targetDomain.manifest.exports
          const allExports = [
            ...(exports.entities || []),
            ...(exports.events || []),
            ...(exports.commands || []),
            ...(exports.queries || []),
            ...(exports['value-objects'] || []),
          ]
          if (!allExports.includes(ref.target) && allExports.length > 0) {
            results.push({
              level: 'warning',
              rule: 'domain/not-exported',
              message: `'${ref.target}' is not in the exports of domain '${ref.domain}'`,
              line: link.line,
              suggestion: `Either add '${ref.target}' to exports in ${ref.domain}/_manifest.yaml or use a different artifact`,
            })
          }
        }
      }
    }
  }

  return results
}

/**
 * Infers the import category for an artifact based on naming conventions
 */
function getImportCategory(artifact: string): string {
  if (artifact.startsWith('EVT-')) return 'events'
  if (artifact.startsWith('CMD-')) return 'commands'
  if (artifact.startsWith('QRY-')) return 'queries'
  return 'entities'
}

/**
 * Validates that required domain artifacts exist
 */
export function validateDomainCompleteness(
  domainId: string,
  context: DomainValidationContext
): ValidationResult[] {
  const results: ValidationResult[] = []
  const domain = context.domains.get(domainId)

  if (!domain) {
    results.push({
      level: 'error',
      rule: 'domain/not-found',
      message: `Domain '${domainId}' not found`,
    })
    return results
  }

  if (!domain.manifest) {
    results.push({
      level: 'error',
      rule: 'domain/no-manifest',
      message: `Domain '${domainId}' is missing _manifest.yaml`,
      suggestion: `Create ${domainId}/_manifest.yaml using the template in /kdd/templates/_manifest.template.yaml`,
    })
    return results
  }

  // Check required fields
  const manifest = domain.manifest
  if (!manifest.domain.description || manifest.domain.description.trim().length < 10) {
    results.push({
      level: 'warning',
      rule: 'domain/incomplete-description',
      message: `Domain '${domainId}' has a very short or missing description`,
      suggestion: 'Add a meaningful description to the domain manifest',
    })
  }

  // Check for deprecated status without deprecation info
  if (manifest.domain.status === 'deprecated') {
    // TODO: Check for deprecation info once schema supports it
    results.push({
      level: 'info',
      rule: 'domain/deprecated',
      message: `Domain '${domainId}' is marked as deprecated`,
      suggestion: 'Consider adding migration notes or a replacement domain reference',
    })
  }

  return results
}

/**
 * Generates a domain map summary
 */
export function generateDomainMapSummary(context: DomainValidationContext): string {
  const lines: string[] = ['# Domain Map Summary', '']

  const { domains } = context

  // List domains by status
  const byStatus = new Map<string, string[]>()
  for (const [id, domain] of domains) {
    const status = domain.manifest?.domain.status || 'unknown'
    if (!byStatus.has(status)) byStatus.set(status, [])
    byStatus.get(status)!.push(id)
  }

  lines.push('## Domains by Status')
  for (const [status, ids] of byStatus) {
    lines.push(`- **${status}**: ${ids.join(', ')}`)
  }
  lines.push('')

  // Dependency graph (text representation)
  lines.push('## Dependencies')
  for (const [id, domain] of domains) {
    if (!domain.manifest?.dependencies?.length) {
      lines.push(`- ${id}: (no dependencies)`)
    } else {
      const deps = domain.manifest.dependencies.map((d) => `${d.domain} (${d.type})`).join(', ')
      lines.push(`- ${id} → ${deps}`)
    }
  }

  return lines.join('\n')
}
