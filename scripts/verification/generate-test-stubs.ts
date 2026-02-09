import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'

const DEFAULT_INPUT_FILE = '.cache/specs-criteria.json'
const DEFAULT_OUTPUT_DIR = 'tests/req'

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
  criteria: Criterion[]
}

function parseArgs(argv: string[]) {
  const args = { inputFile: DEFAULT_INPUT_FILE, outDir: DEFAULT_OUTPUT_DIR, force: false }
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--in' && argv[i + 1]) {
      args.inputFile = argv[i + 1]
      i += 1
      continue
    }
    if (arg === '--out' && argv[i + 1]) {
      args.outDir = argv[i + 1]
      i += 1
      continue
    }
    if (arg === '--force') {
      args.force = true
    }
  }
  return args
}

async function fileExists(filePath: string) {
  try {
    const info = await stat(filePath)
    return info.isFile()
  } catch {
    return false
  }
}

function buildTestTemplate(criterion: Criterion) {
  const reqLabel = criterion.subReqId ?? criterion.reqId
  const trace = criterion.traceability?.ids?.length ? criterion.traceability.ids.join(', ') : 'N/A'
  return `import { describe, it } from 'bun:test'\n\n/**\n * Spec: ${criterion.file}\n * Source: ${criterion.sourceUC ?? 'N/A'}\n * Traceability: ${trace}\n */\n\ndescribe('${reqLabel}', () => {\n  it.todo('meets acceptance criteria')\n})\n`
}

async function main() {
  const { inputFile, outDir, force } = parseArgs(process.argv)
  const raw = await readFile(inputFile, 'utf8')
  const data = JSON.parse(raw) as Output

  await mkdir(outDir, { recursive: true })

  let created = 0
  let skipped = 0

  for (const criterion of data.criteria) {
    const reqLabel = criterion.subReqId ?? criterion.reqId
    const fileName = `${reqLabel}.test.ts`
    const outPath = path.join(outDir, fileName)

    if (!force && (await fileExists(outPath))) {
      skipped += 1
      continue
    }

    const content = buildTestTemplate(criterion)
    await writeFile(outPath, content, 'utf8')
    created += 1
  }

  console.log(`Generated ${created} test stubs in ${outDir}. Skipped ${skipped} existing files.`)
}

main().catch((error) => {
  console.error('Failed to generate test stubs:', error)
  process.exit(1)
})
