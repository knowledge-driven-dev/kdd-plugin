import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const DEFAULT_INPUT_FILE = '.cache/specs-criteria.json'
const DEFAULT_TEST_DIR = 'tests/req'

type Criterion = {
  reqId: string
  subReqId?: string
}

type Output = {
  criteria: Criterion[]
}

function parseArgs(argv: string[]) {
  const args = { inputFile: DEFAULT_INPUT_FILE, testDir: DEFAULT_TEST_DIR }
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--in' && argv[i + 1]) {
      args.inputFile = argv[i + 1]
      i += 1
      continue
    }
    if (arg === '--tests' && argv[i + 1]) {
      args.testDir = argv[i + 1]
      i += 1
    }
  }
  return args
}

async function listTestFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir)
  const files: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    const entryStat = await stat(fullPath)
    if (entryStat.isDirectory()) {
      const nested = await listTestFiles(fullPath)
      files.push(...nested)
    } else if (entry.endsWith('.test.ts')) {
      files.push(fullPath)
    }
  }
  return files
}

function extractReqIdFromFilename(filePath: string) {
  const base = path.basename(filePath)
  const match = base.match(/(REQ-\d{3}\.\d+|REQ-\d{3})/)
  return match?.[1]
}

async function main() {
  const { inputFile, testDir } = parseArgs(process.argv)
  const raw = await readFile(inputFile, 'utf8')
  const data = JSON.parse(raw) as Output
  const tests = await listTestFiles(testDir)

  const covered = new Set<string>()
  for (const testFile of tests) {
    const reqId = extractReqIdFromFilename(testFile)
    if (reqId) covered.add(reqId)
  }

  const missing = new Set<string>()
  for (const criterion of data.criteria) {
    const reqLabel = criterion.subReqId ?? criterion.reqId
    if (!covered.has(reqLabel)) {
      missing.add(reqLabel)
    }
  }

  const missingList = [...missing].sort()
  if (missingList.length) {
    console.log('Missing requirement tests:')
    for (const id of missingList) {
      console.log(`- ${id}`)
    }
    console.log(`Total missing: ${missingList.length}`)
    process.exit(1)
  }

  console.log('All requirement criteria have matching tests.')
}

main().catch((error) => {
  console.error('Coverage check failed:', error)
  process.exit(1)
})
