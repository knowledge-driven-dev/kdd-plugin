/**
 * Validador de readiness
 * Verifica Definition of Ready/Done cuando status es review/approved.
 */

import { basename } from 'path'
import type { SpecFile, ValidationResult } from '../lib/parser'

const READY_STATUSES = new Set(['review', 'approved', 'proposed'])

type ReadinessCategory =
  | 'objective'
  | 'value-unit'
  | 'release'
  | 'use-case'
  | 'requirement'
  | 'command'
  | 'query'
  | 'ui'

export function validateReadiness(spec: SpecFile): ValidationResult[] {
  const results: ValidationResult[] = []
  const status = (spec.frontmatter.status as string | undefined)?.toLowerCase() ?? 'draft'

  if (!READY_STATUSES.has(status)) {
    return results
  }

  const category = detectCategory(spec)
  if (!category) {
    return results
  }

  if (['objective', 'value-unit', 'release'].includes(category)) {
    const owner = spec.frontmatter.owner as string | undefined
    if (!owner || owner.trim().length === 0) {
      results.push({
        level: 'warning',
        rule: 'readiness/missing-owner',
        message: 'Falta el campo "owner" requerido para pasar a review/approved',
        line: 1,
        suggestion: 'Añade "owner: Nombre o rol" al frontmatter',
      })
    }
  }

  switch (category) {
    case 'objective':
      results.push(...checkObjective(spec))
      break
    case 'value-unit':
      results.push(...checkValueUnit(spec))
      break
    case 'release':
      results.push(...checkRelease(spec))
      break
    case 'use-case':
      results.push(...checkUseCase(spec))
      break
    case 'requirement':
      results.push(...checkRequirement(spec))
      break
    case 'command':
    case 'query':
      results.push(...checkCommandQuery(spec, category))
      break
    case 'ui':
      results.push(...checkUi(spec))
      break
  }

  return results
}

function detectCategory(spec: SpecFile): ReadinessCategory | null {
  const fileName = basename(spec.path)
  const kind = (spec.frontmatter.kind as string | undefined)?.toLowerCase()

  if (fileName.startsWith('OBJ-') || kind === 'objective') return 'objective'
  if (fileName.startsWith('UV-') || kind === 'value-unit') return 'value-unit'
  if (fileName.startsWith('REL-') || kind === 'release') return 'release'
  if (fileName.startsWith('UC-') || spec.docType === 'use-case') return 'use-case'
  if (fileName.startsWith('REQ-') || spec.docType === 'requirement') return 'requirement'
  if (fileName.startsWith('CMD-') || kind === 'command') return 'command'
  if (fileName.startsWith('QRY-') || kind === 'query') return 'query'
  if (fileName.startsWith('UI-') || (kind && kind.startsWith('ui-'))) return 'ui'

  return null
}

function checkObjective(spec: SpecFile): ValidationResult[] {
  const results: ValidationResult[] = []

  const objetivo = getSectionContent(spec, ['Objetivo'])
  if (!objetivo) {
    results.push({
      level: 'warning',
      rule: 'readiness/objective-missing-goal',
      message: 'Falta la seccion "Objetivo" requerida para OBJ en review/approved',
    })
  } else if (!/como\s+.+\bquiero\b.+\bpara\b/i.test(objetivo)) {
    results.push({
      level: 'warning',
      rule: 'readiness/objective-format',
      message: 'El objetivo debe seguir el formato "Como X, quiero Y, para Z"',
      suggestion: 'Reescribe el objetivo en formato historia de usuario',
    })
  }

  if (!hasLinkWithPrefix(spec, ['UC-', 'UV-'])) {
    results.push({
      level: 'warning',
      rule: 'readiness/objective-missing-links',
      message: 'OBJ en review/approved debe enlazar al menos un UC o UV',
      suggestion: 'Agrega links a [[UC-...]] o [[UV-...]] en "Casos de uso relacionados"',
    })
  }

  if (!hasSection(spec, ['Criterios de exito', 'Criterios de éxito'])) {
    results.push({
      level: 'warning',
      rule: 'readiness/objective-missing-success',
      message: 'OBJ en review/approved requiere "Criterios de exito"',
    })
  }

  return results
}

function checkValueUnit(spec: SpecFile): ValidationResult[] {
  const results: ValidationResult[] = []

  if (!hasSection(spec, ['Inputs', 'Entradas'])) {
    results.push({
      level: 'warning',
      rule: 'readiness/uv-missing-inputs',
      message: 'UV en review/approved requiere seccion "Inputs"',
    })
  }

  if (!hasSection(spec, ['Outputs', 'Salidas'])) {
    results.push({
      level: 'warning',
      rule: 'readiness/uv-missing-outputs',
      message: 'UV en review/approved requiere seccion "Outputs"',
    })
  }

  if (!hasSection(spec, ['Criterios de salida', 'Criterios de exito', 'Criterios de éxito'])) {
    results.push({
      level: 'warning',
      rule: 'readiness/uv-missing-exit-criteria',
      message: 'UV en review/approved requiere "Criterios de salida"',
    })
  }

  const hasUc = hasLinkWithPrefix(spec, ['UC-'])
  const hasReq = hasLinkWithPrefix(spec, ['REQ-'])
  const hasUi = hasLinkWithPrefix(spec, ['UI-'])
  const hasCommandQuery = hasLinkWithPrefix(spec, ['CMD-', 'QRY-'])

  if (!hasUc || !hasReq || !hasUi || !hasCommandQuery) {
    results.push({
      level: 'warning',
      rule: 'readiness/uv-missing-scope',
      message: 'UV en review/approved debe cubrir UC, CMD/QRY, REQ y UI',
      suggestion: 'Verifica los links en la seccion "Alcance (end-to-end)"',
    })
  }

  return results
}

function checkRelease(spec: SpecFile): ValidationResult[] {
  const results: ValidationResult[] = []

  if (!hasSection(spec, ['Unidades de Valor', 'Unidades de valor'])) {
    results.push({
      level: 'warning',
      rule: 'readiness/release-missing-uv-section',
      message: 'REL en review/approved requiere seccion "Unidades de Valor"',
    })
  }

  if (!hasLinkWithPrefix(spec, ['UV-'])) {
    results.push({
      level: 'warning',
      rule: 'readiness/release-missing-uv-links',
      message: 'REL en review/approved debe enlazar al menos una UV',
    })
  }

  if (!hasSection(spec, ['Criterios de salida', 'Criterios de exito', 'Criterios de éxito'])) {
    results.push({
      level: 'warning',
      rule: 'readiness/release-missing-exit-criteria',
      message: 'REL en review/approved requiere "Criterios de salida"',
    })
  }

  return results
}

function checkUseCase(spec: SpecFile): ValidationResult[] {
  const results: ValidationResult[] = []

  if (!hasLinkWithPrefix(spec, ['REQ-'])) {
    results.push({
      level: 'warning',
      rule: 'readiness/uc-missing-req',
      message: 'UC en review/approved debe referenciar al menos un REQ',
    })
  }

  return results
}

function checkRequirement(spec: SpecFile): ValidationResult[] {
  const results: ValidationResult[] = []

  const hasGherkin = spec.content.includes('```gherkin')
  if (!hasGherkin) {
    results.push({
      level: 'warning',
      rule: 'readiness/req-missing-gherkin',
      message: 'REQ en review/approved requiere al menos un ejemplo Gherkin',
    })
  }

  const source = spec.frontmatter.source as string | undefined
  const hasUcLink = !!source?.match(/^UC-\d{3}/) || hasLinkWithPrefix(spec, ['UC-'])
  if (!hasUcLink) {
    results.push({
      level: 'warning',
      rule: 'readiness/req-missing-uc',
      message: 'REQ en review/approved debe referenciar su UC de origen',
    })
  }

  return results
}

function checkCommandQuery(spec: SpecFile, category: 'command' | 'query'): ValidationResult[] {
  const results: ValidationResult[] = []

  if (!hasSection(spec, ['Input', 'Inputs', 'Entrada', 'Entradas'])) {
    results.push({
      level: 'warning',
      rule: `readiness/${category}-missing-input`,
      message: `${category.toUpperCase()} en review/approved requiere seccion "Input"`,
    })
  }

  if (!hasSection(spec, ['Output', 'Outputs', 'Salida', 'Salidas'])) {
    results.push({
      level: 'warning',
      rule: `readiness/${category}-missing-output`,
      message: `${category.toUpperCase()} en review/approved requiere seccion "Output"`,
    })
  }

  return results
}

function checkUi(spec: SpecFile): ValidationResult[] {
  const results: ValidationResult[] = []

  const hasCommands = hasLinkWithPrefix(spec, ['CMD-'])
  const hasQueries = hasLinkWithPrefix(spec, ['QRY-'])

  if (!hasCommands && !hasQueries) {
    results.push({
      level: 'warning',
      rule: 'readiness/ui-missing-operations',
      message: 'UI en review/approved debe referenciar Commands o Queries',
    })
  }

  const requiredStates = [
    ['loading', 'carga'],
    ['empty', 'vacio', 'sin datos'],
    ['error'],
    ['success', 'exito', 'default', 'normal'],
  ]
  const stateHeadings = spec.headings.map((h) => normalize(h.text))
  const missingStates = requiredStates.filter(
    (aliases) => !stateHeadings.some((h) => aliases.some((alias) => h.includes(alias)))
  )

  if (missingStates.length > 0) {
    results.push({
      level: 'warning',
      rule: 'readiness/ui-missing-states',
      message: 'UI en review/approved debe documentar estados (loading/empty/error/success)',
      suggestion: 'Agrega secciones para estados de la vista',
    })
  }

  return results
}

function hasSection(spec: SpecFile, names: string[]): boolean {
  const normalized = names.map(normalize)
  return spec.headings.some((heading) => normalized.includes(normalize(heading.text)))
}

function getSectionContent(spec: SpecFile, names: string[]): string {
  const normalized = names.map(normalize)
  const headingIndex = spec.headings.findIndex((h) => normalized.includes(normalize(h.text)))
  if (headingIndex === -1) return ''

  const heading = spec.headings[headingIndex]
  const nextHeading = spec.headings[headingIndex + 1]
  const startLine = heading.line
  const endLine = nextHeading?.line ?? spec.content.split('\n').length

  return spec.content
    .split('\n')
    .slice(startLine, endLine)
    .join('\n')
}

function hasLinkWithPrefix(spec: SpecFile, prefixes: string[]): boolean {
  return spec.wikiLinks.some((link) =>
    prefixes.some((prefix) => link.target.toUpperCase().startsWith(prefix))
  )
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}
