#!/usr/bin/env bun
/**
 * Scaffold Generator
 * Reads CMD specs and generates compilable use-case stubs with TODOs
 *
 * Usage:
 *   bun run pipeline:scaffold UV-004          # Scaffold pending items
 *   bun run pipeline:scaffold CMD-023         # Scaffold a specific command
 *   bun run pipeline:scaffold --dry-run       # Show without creating files
 *   bun run pipeline:scaffold --force         # Overwrite existing
 */

import { resolve, dirname } from 'path'
import { parseArgs } from 'util'
import { parseUVFile, findAllUVFiles } from './lib/uv-parser'
import { parseCMDSpec } from './lib/cmd-parser'
import { resolveSpecPath, actionNameToFileName, buildCodeMapping } from './lib/spec-resolver'
import { ENTITY_NAME_MAP, ACTION_VERB_MAP } from './lib/types'
import type { CMDSpecData } from './lib/types'

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1)
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * Generate use-case file content from CMD spec data
 */
function generateUseCase(cmd: CMDSpecData): string {
  const className = `${cmd.actionName}UseCase`
  const inputName = `${cmd.actionName}Input`
  const entityLower = (ENTITY_NAME_MAP[cmd.entityName] ?? cmd.entityName).toLowerCase()

  const inputFields = cmd.inputs.map((i) => {
    const tsType = mapToTsType(i.type)
    return `  ${i.name}: ${tsType}`
  }).join('\n')

  const ruleComments = cmd.rulesReferenced.map((r) =>
    `  // TODO: Validate ${r}`
  ).join('\n')

  const errorComments = cmd.errors.map((e) =>
    `  // TODO: Handle ${e.code} — ${e.condition}`
  ).join('\n')

  const eventComments = cmd.eventsGenerated.map((e) =>
    `  // TODO: Publish ${e}`
  ).join('\n')

  return `/**
 * ${cmd.id}: ${cmd.title || cmd.actionName}
 * @see specs/02-behavior/commands/${cmd.id}-${cmd.actionName}.md
 */

export interface ${inputName} {
${inputFields}
}

export class ${className} {
  constructor(
    private readonly ${entityLower}Repository: any, // TODO: Import proper port type
  ) {}

  async execute(input: ${inputName}): Promise<void> {
    // 1. Validate input
${ruleComments || '    // TODO: Add validation logic'}

    // 2. Load entity
    // TODO: Load ${entityLower} from repository

    // 3. Execute domain logic
${errorComments || '    // TODO: Add business logic'}

    // 4. Persist changes
    // TODO: Save to repository

    // 5. Publish events
${eventComments || '    // TODO: Publish domain events'}
  }
}
`
}

/**
 * Generate test stub file content from CMD spec data
 */
function generateTestStub(cmd: CMDSpecData): string {
  const className = `${cmd.actionName}UseCase`
  const entityLower = (ENTITY_NAME_MAP[cmd.entityName] ?? cmd.entityName).toLowerCase()
  const fileName = actionNameToFileName(cmd.actionName).replace('.ts', '')

  const errorTests = cmd.errors.map((e) =>
    `  it.todo('returns ${e.code} when ${e.condition}')`
  ).join('\n\n')

  const ruleTests = cmd.rulesReferenced.map((r) =>
    `  it.todo('validates ${r}')`
  ).join('\n\n')

  return `/**
 * Tests for ${cmd.id}: ${cmd.title || cmd.actionName}
 * @see specs/02-behavior/commands/${cmd.id}-${cmd.actionName}.md
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test'
import { ${className} } from './${fileName}'

describe('${className}', () => {
  // TODO: Set up mocks for repository ports
  // const mock${capitalize(entityLower)}Repository = { ... }

  let useCase: ${className}

  beforeEach(() => {
    // TODO: Initialize use case with mocked dependencies
    // useCase = new ${className}(mock${capitalize(entityLower)}Repository)
  })

  it.todo('happy path — ${cmd.actionName.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()}')

${errorTests}

${ruleTests}
})
`
}

function mapToTsType(specType: string): string {
  const lower = specType.toLowerCase().trim()
  if (lower === 'uuid' || lower === 'string') return 'string'
  if (lower === 'number' || lower === 'integer' || lower === 'int') return 'number'
  if (lower === 'boolean' || lower === 'bool') return 'boolean'
  if (lower === 'date' || lower === 'datetime') return 'Date'
  if (lower.includes('[]')) return `${mapToTsType(lower.replace('[]', ''))}[]`
  return 'string'
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

interface ScaffoldFile {
  path: string
  content: string
  type: 'use-case' | 'test'
}

async function scaffoldCMD(
  cmd: CMDSpecData,
  projectRoot: string,
  options: { force: boolean; dryRun: boolean }
): Promise<ScaffoldFile[]> {
  const useCaseFileName = actionNameToFileName(cmd.actionName)
  const { loadKddConfig } = await import('../lib/config')
  const kddConfig = await loadKddConfig()
  const useCasePath = resolve(projectRoot, kddConfig.useCasesDir, useCaseFileName)
  const testPath = useCasePath.replace('.use-case.ts', '.use-case.test.ts')

  const files: ScaffoldFile[] = []
  const reminders: string[] = []

  // Generate use-case
  const useCaseExists = await Bun.file(useCasePath).exists()
  if (!useCaseExists || options.force) {
    const content = generateUseCase(cmd)
    files.push({ path: useCasePath, content, type: 'use-case' })
  } else {
    console.log(`  Skip: ${useCasePath.replace(projectRoot + '/', '')} (exists, use --force to overwrite)`)
  }

  // Generate test
  const testExists = await Bun.file(testPath).exists()
  if (!testExists || options.force) {
    const content = generateTestStub(cmd)
    files.push({ path: testPath, content, type: 'test' })
  } else {
    console.log(`  Skip: ${testPath.replace(projectRoot + '/', '')} (exists, use --force to overwrite)`)
  }

  // Write or preview
  for (const file of files) {
    if (options.dryRun) {
      console.log(`\n--- ${file.path.replace(projectRoot + '/', '')} (${file.type}) ---`)
      console.log(file.content)
    } else {
      await Bun.write(file.path, file.content)
      console.log(`  Created: ${file.path.replace(projectRoot + '/', '')}`)
    }
  }

  // Reminder for ports/routes
  const entityLower = (ENTITY_NAME_MAP[cmd.entityName] ?? cmd.entityName).toLowerCase()
  if (files.some((f) => f.type === 'use-case')) {
    console.log(`  Reminder: Add method to ${entityLower}.repository.port.ts if needed`)
    console.log(`  Reminder: Add route handler in ${entityLower}.routes.ts if needed`)
  }

  return files
}

async function main() {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      'dry-run': { type: 'boolean', default: false },
      force: { type: 'boolean', default: false },
    },
    allowPositionals: true,
  })

  if (positionals.length === 0) {
    console.error('Usage: bun run pipeline:scaffold <UV-ID|CMD-ID> [--dry-run] [--force]')
    process.exit(2)
  }

  const target = positionals[0]
  const specsDir = resolve(process.cwd(), 'specs')
  const projectRoot = process.cwd()
  const options = {
    force: values.force!,
    dryRun: values['dry-run']!,
  }

  if (target.startsWith('CMD-') || target.startsWith('QRY-')) {
    // Scaffold a single command
    const specPath = await resolveSpecPath(target, specsDir)
    if (!specPath) {
      console.error(`Spec not found: ${target}`)
      process.exit(2)
    }

    const cmd = await parseCMDSpec(specPath)
    if (!cmd) {
      console.error(`Failed to parse CMD spec: ${specPath}`)
      process.exit(2)
    }

    console.log(`Scaffolding ${cmd.id}: ${cmd.actionName}`)
    await scaffoldCMD(cmd, projectRoot, options)
  } else if (target.startsWith('UV-')) {
    // Scaffold all pending CMDs in a UV
    const allUVFiles = await findAllUVFiles(specsDir)
    const uvFile = allUVFiles.find((f) => f.includes(target))

    if (!uvFile) {
      console.error(`UV not found: ${target}`)
      process.exit(2)
    }

    const uv = await parseUVFile(uvFile)
    if (!uv) {
      console.error(`Failed to parse UV: ${uvFile}`)
      process.exit(2)
    }

    console.log(`Scaffolding ${uv.id}: ${uv.title}`)
    console.log(`Pending CMD/QRY artifacts: ${uv.artifacts.pending.filter((a) => a.prefix === 'CMD' || a.prefix === 'QRY').length}`)
    console.log()

    const cmdArtifacts = uv.artifacts.pending.filter((a) =>
      a.prefix === 'CMD' || a.prefix === 'QRY'
    )

    for (const artifact of cmdArtifacts) {
      const specPath = await resolveSpecPath(artifact.id, specsDir)
      if (!specPath) {
        console.log(`  Warning: Spec not found for ${artifact.id}, skipping`)
        continue
      }

      const cmd = await parseCMDSpec(specPath)
      if (!cmd) {
        console.log(`  Warning: Failed to parse ${artifact.id}, skipping`)
        continue
      }

      console.log(`\n${cmd.id}: ${cmd.actionName}`)
      await scaffoldCMD(cmd, projectRoot, options)
    }
  } else {
    console.error(`Target must start with UV- or CMD-/QRY-: ${target}`)
    process.exit(2)
  }

  if (options.dryRun) {
    console.log('\n(Dry run — no files were written)')
  }
}

main().catch((err) => {
  console.error('Scaffold error:', err)
  process.exit(2)
})
