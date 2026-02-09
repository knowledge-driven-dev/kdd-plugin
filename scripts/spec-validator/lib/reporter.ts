/**
 * Reporter - Formatea y muestra los resultados de validación
 */

import chalk from 'chalk'
import type { ValidationResult } from './parser'
import type { EntityIndex } from './entity-index'

type OutputFormat = 'console' | 'json' | 'github'

/**
 * Formatea los resultados según el formato de salida
 */
export function formatResults(
  results: Map<string, ValidationResult[]>,
  format: OutputFormat,
  verbose: boolean
): void {
  switch (format) {
    case 'json':
      formatJson(results)
      break
    case 'github':
      formatGitHub(results)
      break
    case 'console':
    default:
      formatConsole(results, verbose)
      break
  }
}

/**
 * Formato consola con colores
 */
function formatConsole(results: Map<string, ValidationResult[]>, verbose: boolean): void {
  if (results.size === 0) {
    console.log(chalk.green('✓ Todos los archivos pasaron la validación\n'))
    return
  }

  for (const [file, fileResults] of results) {
    // Filtrar por nivel si no es verbose
    const filtered = verbose ? fileResults : fileResults.filter((r) => r.level !== 'info')

    if (filtered.length === 0 && !verbose) continue

    console.log(chalk.underline(file))

    for (const result of filtered) {
      const icon = getIcon(result.level)
      const color = getColor(result.level)
      const location = result.line ? chalk.gray(`:${result.line}`) : ''

      console.log(`  ${icon} ${color(result.message)}${location}`)

      if (result.suggestion && verbose) {
        console.log(chalk.gray(`     💡 ${result.suggestion}`))
      }
    }

    console.log()
  }
}

/**
 * Formato JSON (para integración con otras herramientas)
 */
function formatJson(results: Map<string, ValidationResult[]>): void {
  const output: Record<string, ValidationResult[]> = {}

  for (const [file, fileResults] of results) {
    output[file] = fileResults
  }

  console.log(JSON.stringify(output, null, 2))
}

/**
 * Formato GitHub Actions (annotations)
 */
function formatGitHub(results: Map<string, ValidationResult[]>): void {
  for (const [file, fileResults] of results) {
    for (const result of fileResults) {
      const level = result.level === 'error' ? 'error' : result.level === 'warning' ? 'warning' : 'notice'
      const line = result.line ? `,line=${result.line}` : ''

      // Formato: ::error file=path,line=1::Message
      console.log(`::${level} file=${file}${line}::${result.message}`)
    }
  }
}

/**
 * Escribe el resumen final
 */
export function writeSummary(totalFiles: number, errors: number, warnings: number): void {
  console.log(chalk.bold('─'.repeat(50)))
  console.log(
    chalk.bold('Resumen:'),
    `${totalFiles} archivos,`,
    errors > 0 ? chalk.red(`${errors} errores`) : chalk.green('0 errores'),
    ',',
    warnings > 0 ? chalk.yellow(`${warnings} warnings`) : chalk.green('0 warnings')
  )

  if (errors > 0) {
    console.log(chalk.red('\n✗ Validación fallida\n'))
  } else if (warnings > 0) {
    console.log(chalk.yellow('\n⚠ Validación completada con warnings\n'))
  } else {
    console.log(chalk.green('\n✓ Validación exitosa\n'))
  }
}

function getIcon(level: ValidationResult['level']): string {
  switch (level) {
    case 'error':
      return '✗'
    case 'warning':
      return '⚠'
    case 'info':
      return 'ℹ'
  }
}

function getColor(level: ValidationResult['level']): (text: string) => string {
  switch (level) {
    case 'error':
      return chalk.red
    case 'warning':
      return chalk.yellow
    case 'info':
      return chalk.blue
  }
}

/**
 * Muestra estadísticas del índice de entidades
 */
export function showEntityIndexStats(index: EntityIndex): void {
  // Contar por tipo
  const byType: Record<string, number> = {}
  const subEntities = {
    rules: 0,
    requirements: 0,
  }

  for (const entity of index.all) {
    byType[entity.type] = (byType[entity.type] ?? 0) + 1

    if (entity.subtype === 'individual-rule') subEntities.rules++
    if (entity.subtype === 'individual-requirement') subEntities.requirements++
  }

  console.log(chalk.bold('\n📊 Índice de Entidades:'))
  console.log(chalk.gray(`   Total: ${index.all.length} entidades indexadas`))

  const typeLabels: Record<string, string> = {
    entity: 'Entidades',
    event: 'Eventos',
    rule: 'Reglas',
    'use-case': 'Casos de Uso',
    requirement: 'Requisitos',
    process: 'Procesos',
  }

  for (const [type, count] of Object.entries(byType)) {
    const label = typeLabels[type] ?? type
    console.log(chalk.gray(`   ${label}: ${count}`))
  }

  if (subEntities.rules > 0 || subEntities.requirements > 0) {
    console.log(chalk.gray(`   └─ Reglas individuales: ${subEntities.rules}`))
    console.log(chalk.gray(`   └─ Requisitos individuales: ${subEntities.requirements}`))
  }

  console.log()
}
