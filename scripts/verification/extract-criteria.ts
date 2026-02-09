import { readFile, readdir, stat, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

const DEFAULT_INPUT_DIR = 'specs/04-verification/criteria'
const DEFAULT_OUTPUT_FILE = '.cache/specs-criteria.json'

type Criterion = {
  reqId: string
  subReqId?: string
  criterionId: string
  file: string
  sourceUC?: string
  tags: string[]
  traceability?: {
    raw?: string
    ids: string[]
  }
  gherkin: string
}

type Output = {
  generatedAt: string
  sourceDir: string
  criteriaCount: number
  criteria: Criterion[]
}

function parseArgs(argv: string[]) {
  const args = { inputDir: DEFAULT_INPUT_DIR, outFile: DEFAULT_OUTPUT_FILE }
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--dir' && argv[i + 1]) {
      args.inputDir = argv[i + 1]
      i += 1
      continue
    }
    if (arg === '--out' && argv[i + 1]) {
      args.outFile = argv[i + 1]
      i += 1
    }
  }
  return args
}

async function listMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir)
  const files: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    const entryStat = await stat(fullPath)
    if (entryStat.isDirectory()) {
      const nested = await listMarkdownFiles(fullPath)
      files.push(...nested)
    } else if (entry.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  return files
}

function splitSections(content: string): Array<{ heading: string; body: string }> {
  const matches = [...content.matchAll(/^##\s+(.+)$/gm)]
  const sections: Array<{ heading: string; body: string }> = []
  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i]
    const heading = match[1].trim()
    const start = (match.index ?? 0) + match[0].length
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? content.length) : content.length
    const body = content.slice(start, end)
    sections.push({ heading, body })
  }
  return sections
}

function extractGherkinBlocks(text: string): string[] {
  const blocks: string[] = []
  const fenceRegex = /```gherkin\n([\s\S]*?)```/g
  let match: RegExpExecArray | null
  while ((match = fenceRegex.exec(text)) !== null) {
    blocks.push(match[1].trim())
  }
  return blocks
}

function extractTraceability(sectionBody: string) {
  const traceMatch = sectionBody.match(/\*\*Trazabilidad\*\*:\s*([^\n]+)/) ??
    sectionBody.match(/Trazabilidad:\s*([^\n]+)/)
  if (!traceMatch) return undefined
  const raw = traceMatch[1].trim()
  const ids = raw.match(/(UC-\d{3}|BR-[A-Z0-9-]+-\d{3}|INV-[A-Z0-9-]+-\d{3}|BP-[A-Z0-9-]+-\d{3}|CMD-\d{3}|QRY-\d{3}|EVT-[A-Za-z0-9-]+)/g) ?? []
  return { raw, ids }
}

async function parseFile(filePath: string): Promise<Criterion[]> {
  const raw = await readFile(filePath, 'utf8')
  const parsed = matter(raw)
  const data = parsed.data as { id?: string; source?: string; tags?: string[] }
  const reqId = data.id ?? path.basename(filePath, '.md')
  const sourceUC = data.source
  const tags = Array.isArray(data.tags) ? data.tags.map(String) : []

  const sections = splitSections(parsed.content)
  const criteria: Criterion[] = []

  for (const section of sections) {
    const subReqMatch = section.heading.match(/^(REQ-\d{3}\.\d+)/)
    if (!subReqMatch) continue
    const subReqId = subReqMatch[1]
    const gherkinBlocks = extractGherkinBlocks(section.body)
    if (gherkinBlocks.length === 0) continue

    const traceability = extractTraceability(section.body)
    for (let i = 0; i < gherkinBlocks.length; i += 1) {
      const index = i + 1
      const criterionId = gherkinBlocks.length > 1 ? `${subReqId}#${index}` : subReqId
      criteria.push({
        reqId,
        subReqId,
        criterionId,
        file: filePath,
        sourceUC,
        tags,
        traceability,
        gherkin: gherkinBlocks[i],
      })
    }
  }

  return criteria
}

async function main() {
  const { inputDir, outFile } = parseArgs(process.argv)
  const files = await listMarkdownFiles(inputDir)
  const criteria: Criterion[] = []

  for (const file of files) {
    if (file.endsWith('_TRACEABILITY.md')) continue
    const parsed = await parseFile(file)
    criteria.push(...parsed)
  }

  const output: Output = {
    generatedAt: new Date().toISOString(),
    sourceDir: inputDir,
    criteriaCount: criteria.length,
    criteria,
  }

  await mkdir(path.dirname(outFile), { recursive: true })
  await writeFile(outFile, JSON.stringify(output, null, 2), 'utf8')

  console.log(`Extracted ${criteria.length} criteria from ${files.length} files.`)
  console.log(`Output: ${outFile}`)
}

main().catch((error) => {
  console.error('Failed to extract criteria:', error)
  process.exit(1)
})
