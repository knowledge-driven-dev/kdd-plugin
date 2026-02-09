#!/usr/bin/env bun
/**
 * Script de sincronización de documentos funcionales con Knowledge Hub (LightRAG)
 *
 * Detecta cambios locales en /specs y sincroniza con el knowledge graph.
 *
 * Uso:
 *   bun scripts/sync-specs.ts              # Modo dry-run (solo muestra cambios)
 *   bun scripts/sync-specs.ts --execute    # Ejecuta la sincronización
 *   bun scripts/sync-specs.ts --full       # Sincronización completa (re-indexa todo)
 *   bun scripts/sync-specs.ts --status     # Muestra estado actual
 */

import { createHash } from 'crypto'
import { readdir, readFile, writeFile, stat } from 'fs/promises'
import { join, relative, basename } from 'path'

// Tipos para MCP config
interface McpServerConfig {
  env?: Record<string, string>
}

interface McpConfig {
  mcpServers?: Record<string, McpServerConfig>
}

/**
 * Lee la configuración del servidor knowledge-base desde .mcp.json
 * Busca en orden: knowledge-base, kb
 */
async function loadMcpConfig(): Promise<{ url: string; apiKey: string }> {
  const mcpJsonPath = join(process.cwd(), '.mcp.json')

  try {
    const content = await readFile(mcpJsonPath, 'utf-8')
    const config: McpConfig = JSON.parse(content)

    // Buscar servidor en orden de preferencia
    const serverNames = ['knowledge-base', 'kb']
    for (const name of serverNames) {
      const server = config.mcpServers?.[name]
      if (server?.env) {
        const url = server.env.KB_BASE_URL || server.env.LIGHTRAG_API_URL
        const apiKey = server.env.KB_API_KEY || server.env.LIGHTRAG_API_KEY || ''
        if (url) {
          console.log(`📋 Configuración cargada desde .mcp.json (servidor: ${name})`)
          return { url, apiKey }
        }
      }
    }
  } catch {
    // .mcp.json no existe o no se puede leer
  }

  return { url: '', apiKey: '' }
}

// Configuración (se inicializa en main())
let CONFIG = {
  specsDir: join(process.cwd(), 'specs'),
  stateFile: join(process.cwd(), '.specs-sync-state.json'),
  lightragApiUrl: '',
  lightragApiKey: '',
  excludePatterns: ['.obsidian', 'node_modules', '.git'],
  includeExtensions: ['.md'],
}

// Tipos
interface DocState {
  hash: string
  docId: string
  lastSynced: string
  path: string
  frontmatter?: Record<string, unknown>
}

interface SyncState {
  version: number
  lastSync: string
  documents: Record<string, DocState>
}

interface SyncOperation {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  path: string
  docId: string
  reason: string
}

interface LightRAGDocument {
  id: string
  status: string
  created_at?: string
}

// Utilidades
function md5(content: string): string {
  return createHash('md5').update(content, 'utf8').digest('hex')
}

function generateDocId(filePath: string): string {
  // Genera un docId basado en la ruta relativa
  const relativePath = relative(CONFIG.specsDir, filePath)
  return `specs/${relativePath}`.replace(/\\/g, '/').replace(/\.md$/, '')
}

function parseFrontmatter(content: string): Record<string, unknown> | undefined {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return undefined

  const yaml = match[1]
  const result: Record<string, unknown> = {}

  for (const line of yaml.split('\n')) {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim()
      let value: unknown = line.slice(colonIndex + 1).trim()

      // Parsear valores básicos
      if (value === 'true') value = true
      else if (value === 'false') value = false
      else if (/^\d+$/.test(value as string)) value = parseInt(value as string)
      else if (/^\[.*\]$/.test(value as string)) {
        try {
          value = JSON.parse((value as string).replace(/'/g, '"'))
        } catch {
          // mantener como string
        }
      }

      result[key] = value
    }
  }

  return result
}

// Escaneo de archivos
async function* walkDirectory(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    // Excluir directorios no deseados
    if (CONFIG.excludePatterns.some(p => entry.name.includes(p))) {
      continue
    }

    if (entry.isDirectory()) {
      yield* walkDirectory(fullPath)
    } else if (entry.isFile()) {
      if (CONFIG.includeExtensions.some(ext => entry.name.endsWith(ext))) {
        yield fullPath
      }
    }
  }
}

async function scanSpecsDirectory(): Promise<Map<string, { hash: string; content: string; frontmatter?: Record<string, unknown> }>> {
  const files = new Map<string, { hash: string; content: string; frontmatter?: Record<string, unknown> }>()

  for await (const filePath of walkDirectory(CONFIG.specsDir)) {
    const content = await readFile(filePath, 'utf-8')
    const hash = md5(content)
    const frontmatter = parseFrontmatter(content)
    files.set(filePath, { hash, content, frontmatter })
  }

  return files
}

// Estado de sincronización
async function loadSyncState(): Promise<SyncState> {
  try {
    const content = await readFile(CONFIG.stateFile, 'utf-8')
    return JSON.parse(content)
  } catch {
    return {
      version: 1,
      lastSync: '',
      documents: {},
    }
  }
}

async function saveSyncState(state: SyncState): Promise<void> {
  await writeFile(CONFIG.stateFile, JSON.stringify(state, null, 2))
}

// API LightRAG
class LightRAGClient {
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.apiKey = apiKey
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    return response
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.request('/health')
      return response.ok
    } catch {
      return false
    }
  }

  async getDocuments(): Promise<Record<string, LightRAGDocument>> {
    const response = await this.request('/documents')
    if (!response.ok) {
      throw new Error(`Failed to get documents: ${response.statusText}`)
    }
    const data = await response.json()
    return data.statuses || {}
  }

  async insertFile(filePath: string): Promise<{ docId: string }> {
    const content = await readFile(filePath, 'utf-8')
    // Usar ruta relativa normalizada (siempre con forward slashes)
    const relativePath = relative(CONFIG.specsDir, filePath).replace(/\\/g, '/')

    // Usar endpoint /documents/text con file_source para preservar la ruta correctamente
    const response = await this.request('/documents/text', {
      method: 'POST',
      body: JSON.stringify({
        text: content,
        file_source: relativePath,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to insert file: ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    return { docId: result.doc_id || relativePath }
  }

  async insertText(text: string, description?: string): Promise<{ docId: string }> {
    const response = await this.request('/documents/text', {
      method: 'POST',
      body: JSON.stringify({
        text,
        description: description || 'Specs document',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to insert text: ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    return { docId: result.doc_id || md5(text).slice(0, 8) }
  }

  async deleteByDocId(docId: string): Promise<void> {
    const response = await this.request('/documents', {
      method: 'DELETE',
      body: JSON.stringify({ doc_ids: [docId] }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to delete document: ${response.statusText} - ${errorText}`)
    }
  }

  async deleteByDocIds(docIds: string[]): Promise<void> {
    if (docIds.length === 0) return

    const response = await this.request('/documents', {
      method: 'DELETE',
      body: JSON.stringify({ doc_ids: docIds }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to delete documents: ${response.statusText} - ${errorText}`)
    }
  }
}

// Motor de sincronización
function calculateSyncOperations(
  currentFiles: Map<string, { hash: string; content: string; frontmatter?: Record<string, unknown> }>,
  savedState: SyncState
): SyncOperation[] {
  const operations: SyncOperation[] = []
  const processedPaths = new Set<string>()

  // Detectar archivos nuevos y modificados
  for (const [filePath, { hash }] of currentFiles) {
    processedPaths.add(filePath)
    const docId = generateDocId(filePath)
    const savedDoc = savedState.documents[filePath]

    if (!savedDoc) {
      operations.push({
        type: 'INSERT',
        path: filePath,
        docId,
        reason: 'Archivo nuevo',
      })
    } else if (savedDoc.hash !== hash) {
      operations.push({
        type: 'UPDATE',
        path: filePath,
        docId: savedDoc.docId,
        reason: `Hash cambió: ${savedDoc.hash.slice(0, 8)}... → ${hash.slice(0, 8)}...`,
      })
    }
  }

  // Detectar archivos eliminados
  for (const [filePath, docState] of Object.entries(savedState.documents)) {
    if (!processedPaths.has(filePath)) {
      operations.push({
        type: 'DELETE',
        path: filePath,
        docId: docState.docId,
        reason: 'Archivo eliminado del disco',
      })
    }
  }

  return operations
}

// Ejecución
async function executeSyncOperations(
  client: LightRAGClient,
  operations: SyncOperation[],
  currentFiles: Map<string, { hash: string; content: string; frontmatter?: Record<string, unknown> }>,
  state: SyncState
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = { success: 0, failed: 0, errors: [] as string[] }

  for (const op of operations) {
    try {
      console.log(`  ${op.type}: ${relative(CONFIG.specsDir, op.path)}`)

      switch (op.type) {
        case 'INSERT': {
          const fileData = currentFiles.get(op.path)!
          const result = await client.insertFile(op.path)

          state.documents[op.path] = {
            hash: fileData.hash,
            docId: result.docId,
            lastSynced: new Date().toISOString(),
            path: op.path,
            frontmatter: fileData.frontmatter,
          }
          results.success++
          break
        }

        case 'UPDATE': {
          // LightRAG no tiene update directo, hacemos delete + insert
          await client.deleteByDocId(op.docId)
          const fileData = currentFiles.get(op.path)!
          const result = await client.insertFile(op.path)

          state.documents[op.path] = {
            hash: fileData.hash,
            docId: result.docId,
            lastSynced: new Date().toISOString(),
            path: op.path,
            frontmatter: fileData.frontmatter,
          }
          results.success++
          break
        }

        case 'DELETE': {
          await client.deleteByDocId(op.docId)
          delete state.documents[op.path]
          results.success++
          break
        }
      }
    } catch (error) {
      results.failed++
      const errorMsg = error instanceof Error ? error.message : String(error)
      results.errors.push(`${op.type} ${op.path}: ${errorMsg}`)
      console.error(`  ✗ Error: ${errorMsg}`)
    }
  }

  return results
}

// Comandos principales
async function showStatus(): Promise<void> {
  console.log('\n📊 Estado de sincronización\n')

  const client = new LightRAGClient(CONFIG.lightragApiUrl, CONFIG.lightragApiKey)

  // Verificar conexión
  const healthy = await client.checkHealth()
  console.log(`LightRAG API: ${healthy ? '✓ Conectado' : '✗ No disponible'} (${CONFIG.lightragApiUrl})`)

  // Cargar estado local
  const state = await loadSyncState()
  const docCount = Object.keys(state.documents).length
  console.log(`Estado local: ${docCount} documentos sincronizados`)
  if (state.lastSync) {
    console.log(`Última sincronización: ${state.lastSync}`)
  }

  // Escanear archivos actuales
  const currentFiles = await scanSpecsDirectory()
  console.log(`Archivos en /specs: ${currentFiles.size}`)

  // Obtener documentos en LightRAG
  if (healthy) {
    try {
      const remoteDocs = await client.getDocuments()
      console.log(`Documentos en LightRAG: ${Object.keys(remoteDocs).length}`)
    } catch {
      console.log('Documentos en LightRAG: (error al obtener)')
    }
  }

  // Calcular operaciones pendientes
  const operations = calculateSyncOperations(currentFiles, state)
  if (operations.length > 0) {
    console.log(`\n⚠️  ${operations.length} cambios pendientes:`)
    const byType = {
      INSERT: operations.filter(o => o.type === 'INSERT'),
      UPDATE: operations.filter(o => o.type === 'UPDATE'),
      DELETE: operations.filter(o => o.type === 'DELETE'),
    }
    if (byType.INSERT.length) console.log(`   + ${byType.INSERT.length} nuevos`)
    if (byType.UPDATE.length) console.log(`   ~ ${byType.UPDATE.length} modificados`)
    if (byType.DELETE.length) console.log(`   - ${byType.DELETE.length} eliminados`)
  } else {
    console.log('\n✓ Todo sincronizado')
  }
}

async function dryRun(): Promise<void> {
  console.log('\n🔍 Analizando cambios (dry-run)\n')

  const state = await loadSyncState()
  const currentFiles = await scanSpecsDirectory()
  const operations = calculateSyncOperations(currentFiles, state)

  if (operations.length === 0) {
    console.log('✓ No hay cambios pendientes')
    return
  }

  console.log(`📝 ${operations.length} operaciones a realizar:\n`)

  // Agrupar por tipo
  const inserts = operations.filter(o => o.type === 'INSERT')
  const updates = operations.filter(o => o.type === 'UPDATE')
  const deletes = operations.filter(o => o.type === 'DELETE')

  if (inserts.length > 0) {
    console.log(`\n➕ INSERTAR (${inserts.length}):`)
    for (const op of inserts) {
      console.log(`   ${relative(CONFIG.specsDir, op.path)}`)
    }
  }

  if (updates.length > 0) {
    console.log(`\n🔄 ACTUALIZAR (${updates.length}):`)
    for (const op of updates) {
      console.log(`   ${relative(CONFIG.specsDir, op.path)}`)
      console.log(`      Razón: ${op.reason}`)
    }
  }

  if (deletes.length > 0) {
    console.log(`\n➖ ELIMINAR (${deletes.length}):`)
    for (const op of deletes) {
      console.log(`   ${relative(CONFIG.specsDir, op.path)}`)
    }
  }

  console.log('\n💡 Ejecuta con --execute para aplicar estos cambios')
}

async function executeSync(fullSync: boolean = false): Promise<void> {
  console.log(`\n🚀 Ejecutando sincronización${fullSync ? ' completa' : ''}\n`)

  const client = new LightRAGClient(CONFIG.lightragApiUrl, CONFIG.lightragApiKey)

  // Verificar conexión
  const healthy = await client.checkHealth()
  if (!healthy) {
    console.error('✗ No se puede conectar a LightRAG API')
    console.error(`  URL: ${CONFIG.lightragApiUrl}`)
    console.error('  Asegúrate de que el servidor esté corriendo')
    process.exit(1)
  }

  let state = await loadSyncState()
  const currentFiles = await scanSpecsDirectory()

  // Si es sincronización completa, limpiar estado
  if (fullSync) {
    console.log('⚠️  Sincronización completa: re-indexando todos los documentos\n')

    // Eliminar documentos existentes
    const existingDocIds = Object.values(state.documents).map(d => d.docId)
    if (existingDocIds.length > 0) {
      console.log(`Eliminando ${existingDocIds.length} documentos existentes...`)
      try {
        await client.deleteByDocIds(existingDocIds)
      } catch (error) {
        console.warn('  (algunos documentos ya no existían)')
      }
    }

    // Resetear estado
    state = {
      version: 1,
      lastSync: '',
      documents: {},
    }
  }

  const operations = calculateSyncOperations(currentFiles, state)

  if (operations.length === 0) {
    console.log('✓ No hay cambios que sincronizar')
    return
  }

  console.log(`📝 Procesando ${operations.length} operaciones:\n`)

  const results = await executeSyncOperations(client, operations, currentFiles, state)

  // Actualizar estado
  state.lastSync = new Date().toISOString()
  await saveSyncState(state)

  // Resumen
  console.log('\n' + '─'.repeat(50))
  console.log(`✓ Completado: ${results.success} operaciones exitosas`)
  if (results.failed > 0) {
    console.log(`✗ Fallidas: ${results.failed}`)
    for (const error of results.errors) {
      console.log(`  - ${error}`)
    }
  }
}

// Main
async function main(): Promise<void> {
  const args = process.argv.slice(2)

  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║     Sincronización de Specs con Knowledge Hub          ║')
  console.log('╚════════════════════════════════════════════════════════╝')

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Uso: bun scripts/sync-specs.ts [opciones]

Opciones:
  --status    Muestra el estado actual de sincronización
  --execute   Ejecuta la sincronización de cambios pendientes
  --full      Ejecuta sincronización completa (re-indexa todo)
  --help      Muestra esta ayuda

Configuración:
  El script busca automáticamente la configuración en .mcp.json
  (servidores: knowledge-base, kb)

  También acepta variables de entorno (tienen prioridad):
    LIGHTRAG_API_URL   URL del API de LightRAG
    LIGHTRAG_API_KEY   API key de LightRAG

Ejemplos:
  bun scripts/sync-specs.ts              # Dry-run (solo muestra cambios)
  bun scripts/sync-specs.ts --execute    # Aplica los cambios
  bun scripts/sync-specs.ts --full       # Re-indexa todo
`)
    return
  }

  // Cargar configuración: env vars > .mcp.json > defaults
  const mcpConfig = await loadMcpConfig()
  CONFIG.lightragApiUrl = process.env.LIGHTRAG_API_URL || mcpConfig.url || 'http://localhost:9621'
  CONFIG.lightragApiKey = process.env.LIGHTRAG_API_KEY || mcpConfig.apiKey || ''

  if (!mcpConfig.url && !process.env.LIGHTRAG_API_URL) {
    console.log('⚠️  No se encontró configuración en .mcp.json ni en variables de entorno')
    console.log('   Usando default: http://localhost:9621\n')
  }

  try {
    if (args.includes('--status')) {
      await showStatus()
    } else if (args.includes('--execute')) {
      await executeSync(false)
    } else if (args.includes('--full')) {
      await executeSync(true)
    } else {
      await dryRun()
    }
  } catch (error) {
    console.error('\n✗ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
