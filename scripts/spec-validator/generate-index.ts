#!/usr/bin/env bun
/**
 * Generador de índice de entidades KDD
 *
 * Genera dos archivos de caché:
 * - specs/_index.md   → Para lectura humana y contexto de Claude
 * - specs/_index.json → Para uso programático en scripts
 *
 * Uso: bun run specs:index
 */

import { writeFile } from 'fs/promises'
import { join } from 'path'
import { buildEntityIndex, type EntityEntry, type EntityIndex } from './lib/entity-index'

const SPECS_DIR = join(process.cwd(), 'specs')

interface IndexJson {
  generatedAt: string
  totalEntities: number
  byType: Record<string, number>
  entities: EntityEntry[]
}

/**
 * Genera el archivo JSON para uso programático
 */
function generateJsonIndex(index: EntityIndex): IndexJson {
  const byType: Record<string, number> = {}

  for (const entity of index.all) {
    const key = entity.subtype ?? entity.type
    byType[key] = (byType[key] ?? 0) + 1
  }

  return {
    generatedAt: new Date().toISOString(),
    totalEntities: index.all.length,
    byType,
    entities: index.all.map((e) => ({
      name: e.name,
      id: e.id,
      aliases: e.aliases,
      type: e.type,
      subtype: e.subtype,
      path: e.path,
      line: e.line,
      parentId: e.parentId,
      searchTerms: e.searchTerms,
    })),
  }
}

/**
 * Genera el archivo Markdown para lectura humana/Claude
 */
function generateMarkdownIndex(index: EntityIndex): string {
  const lines: string[] = []

  lines.push('# Índice de Entidades KDD')
  lines.push('')
  lines.push('> Archivo generado automáticamente. No editar manualmente.')
  lines.push(`> Última actualización: ${new Date().toLocaleString('es-ES')}`)
  lines.push('')
  lines.push('## Resumen')
  lines.push('')
  lines.push(`- **Total de entidades**: ${index.all.length}`)

  // Contar por tipo
  const counts = {
    entity: 0,
    event: 0,
    rule: 0,
    'individual-rule': 0,
    'use-case': 0,
    requirement: 0,
    'individual-requirement': 0,
    process: 0,
  }

  for (const e of index.all) {
    const key = (e.subtype ?? e.type) as keyof typeof counts
    if (key in counts) counts[key]++
  }

  lines.push(`- Entidades de dominio: ${counts.entity}`)
  lines.push(`- Eventos: ${counts.event}`)
  lines.push(`- Reglas: ${counts.rule} grupos, ${counts['individual-rule']} individuales`)
  lines.push(`- Casos de uso: ${counts['use-case']}`)
  lines.push(`- Requisitos: ${counts.requirement} grupos, ${counts['individual-requirement']} individuales`)
  lines.push(`- Procesos: ${counts.process}`)
  lines.push('')

  // Sección: Entidades de Dominio
  const entities = index.all.filter((e) => e.type === 'entity')
  if (entities.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Entidades de Dominio')
    lines.push('')
    lines.push('| Entidad | Aliases | Archivo |')
    lines.push('|---------|---------|---------|')
    for (const e of entities.sort((a, b) => a.name.localeCompare(b.name))) {
      const aliases = e.aliases.length > 0 ? e.aliases.join(', ') : '-'
      lines.push(`| **${e.name}** | ${aliases} | \`${e.path}\` |`)
    }
    lines.push('')
  }

  // Sección: Eventos
  const events = index.all.filter((e) => e.type === 'event')
  if (events.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Eventos')
    lines.push('')
    lines.push('| ID | Nombre | Archivo |')
    lines.push('|----|--------|---------|')
    for (const e of events.sort((a, b) => (a.id ?? a.name).localeCompare(b.id ?? b.name))) {
      const id = e.aliases.find((a) => a.startsWith('EVT-')) ?? '-'
      lines.push(`| \`${id}\` | ${e.name} | \`${e.path}\` |`)
    }
    lines.push('')
  }

  // Sección: Reglas de Negocio
  const ruleGroups = index.all.filter((e) => e.type === 'rule' && !e.subtype)
  const individualRules = index.all.filter((e) => e.subtype === 'individual-rule')
  if (ruleGroups.length > 0 || individualRules.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Reglas de Negocio')
    lines.push('')

    if (ruleGroups.length > 0) {
      lines.push('### Grupos de Reglas')
      lines.push('')
      lines.push('| ID | Nombre | Archivo |')
      lines.push('|----|--------|---------|')
      for (const e of ruleGroups.sort((a, b) => a.name.localeCompare(b.name))) {
        const id = e.aliases.find((a) => a.startsWith('RUL-')) ?? '-'
        lines.push(`| \`${id}\` | ${e.name} | \`${e.path}\` |`)
      }
      lines.push('')
    }

    if (individualRules.length > 0) {
      lines.push('### Reglas Individuales')
      lines.push('')
      lines.push('| ID | Nombre | Archivo:Línea |')
      lines.push('|----|--------|---------------|')
      for (const e of individualRules.sort((a, b) => (a.id ?? '').localeCompare(b.id ?? ''))) {
        const location = e.line ? `\`${e.path}:${e.line}\`` : `\`${e.path}\``
        lines.push(`| \`${e.id}\` | ${e.name} | ${location} |`)
      }
      lines.push('')
    }
  }

  // Sección: Casos de Uso
  const useCases = index.all.filter((e) => e.type === 'use-case')
  if (useCases.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Casos de Uso')
    lines.push('')
    lines.push('| ID | Nombre | Archivo |')
    lines.push('|----|--------|---------|')
    for (const e of useCases.sort((a, b) => (a.aliases[0] ?? a.name).localeCompare(b.aliases[0] ?? b.name))) {
      const id = e.aliases.find((a) => a.startsWith('UC-')) ?? '-'
      lines.push(`| \`${id}\` | ${e.name} | \`${e.path}\` |`)
    }
    lines.push('')
  }

  // Sección: Requisitos
  const reqGroups = index.all.filter((e) => e.type === 'requirement' && !e.subtype)
  const individualReqs = index.all.filter((e) => e.subtype === 'individual-requirement')
  if (reqGroups.length > 0 || individualReqs.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Requisitos')
    lines.push('')

    if (reqGroups.length > 0) {
      lines.push('### Grupos de Requisitos')
      lines.push('')
      lines.push('| ID | Nombre | Archivo |')
      lines.push('|----|--------|---------|')
      for (const e of reqGroups.sort((a, b) => a.name.localeCompare(b.name))) {
        lines.push(`| - | ${e.name} | \`${e.path}\` |`)
      }
      lines.push('')
    }

    if (individualReqs.length > 0) {
      lines.push('### Requisitos Individuales')
      lines.push('')
      lines.push('| ID | Nombre | Archivo:Línea |')
      lines.push('|----|--------|---------------|')
      for (const e of individualReqs.sort((a, b) => (a.id ?? '').localeCompare(b.id ?? ''))) {
        const location = e.line ? `\`${e.path}:${e.line}\`` : `\`${e.path}\``
        lines.push(`| \`${e.id}\` | ${e.name} | ${location} |`)
      }
      lines.push('')
    }
  }

  // Sección: Procesos
  const processes = index.all.filter((e) => e.type === 'process')
  if (processes.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Procesos')
    lines.push('')
    lines.push('| ID | Nombre | Archivo |')
    lines.push('|----|--------|---------|')
    for (const e of processes.sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(`| - | ${e.name} | \`${e.path}\` |`)
    }
    lines.push('')
  }

  // Sección: Términos de búsqueda
  lines.push('---')
  lines.push('')
  lines.push('## Términos de Búsqueda')
  lines.push('')
  lines.push('Lista de todos los términos reconocidos para auto-enlazado:')
  lines.push('')
  lines.push('```')
  const allTerms = new Set<string>()
  for (const e of index.all) {
    for (const term of e.searchTerms) {
      allTerms.add(term)
    }
  }
  const sortedTerms = Array.from(allTerms).sort()
  // Mostrar en columnas
  const COLS = 4
  const termRows: string[] = []
  for (let i = 0; i < sortedTerms.length; i += COLS) {
    const row = sortedTerms.slice(i, i + COLS).map((t) => t.padEnd(25)).join('')
    termRows.push(row)
  }
  lines.push(...termRows)
  lines.push('```')
  lines.push('')

  return lines.join('\n')
}

async function main() {
  console.log('🔍 Escaneando entidades en specs/...')

  const index = await buildEntityIndex(SPECS_DIR)

  console.log(`   Encontradas ${index.all.length} entidades`)

  // Generar JSON
  const jsonContent = generateJsonIndex(index)
  const jsonPath = join(SPECS_DIR, '_index.json')
  await writeFile(jsonPath, JSON.stringify(jsonContent, null, 2), 'utf-8')
  console.log(`✅ Generado: specs/_index.json`)

  // Generar Markdown
  const mdContent = generateMarkdownIndex(index)
  const mdPath = join(SPECS_DIR, '_index.md')
  await writeFile(mdPath, mdContent, 'utf-8')
  console.log(`✅ Generado: specs/_index.md`)

  // Estadísticas
  console.log('')
  console.log('📊 Resumen:')
  const byType: Record<string, number> = {}
  for (const e of index.all) {
    const key = e.subtype ?? e.type
    byType[key] = (byType[key] ?? 0) + 1
  }
  for (const [type, count] of Object.entries(byType).sort()) {
    console.log(`   ${type}: ${count}`)
  }
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
