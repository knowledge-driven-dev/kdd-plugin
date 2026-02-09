import { readFile } from 'node:fs/promises'

const DEFAULT_INPUT_FILE = '.cache/specs-criteria.json'

type Criterion = {
  reqId: string
  subReqId?: string
  criterionId: string
  sourceUC?: string
}

type Output = {
  criteria: Criterion[]
}

function parseArgs(argv: string[]) {
  const args: { inputFile: string; req?: string; uc?: string } = { inputFile: DEFAULT_INPUT_FILE }
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--in' && argv[i + 1]) {
      args.inputFile = argv[i + 1]
      i += 1
      continue
    }
    if (arg === '--req' && argv[i + 1]) {
      args.req = argv[i + 1]
      i += 1
      continue
    }
    if (arg === '--uc' && argv[i + 1]) {
      args.uc = argv[i + 1]
      i += 1
    }
  }
  return args
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function main() {
  const { inputFile, req, uc } = parseArgs(process.argv)
  if (!req && !uc) {
    console.error('Usage: bun scripts/verification/run-from-specs.ts --req REQ-001.1 | --uc UC-001')
    process.exit(1)
  }

  const raw = await readFile(inputFile, 'utf8')
  const data = JSON.parse(raw) as Output

  const matches = data.criteria.filter((criterion) => {
    if (req) {
      return criterion.subReqId === req || criterion.reqId === req || criterion.criterionId === req
    }
    if (uc) {
      return criterion.sourceUC === uc
    }
    return false
  })

  if (matches.length === 0) {
    console.error('No matching criteria found.')
    process.exit(1)
  }

  const ids = [...new Set(matches.map((criterion) => criterion.subReqId ?? criterion.reqId))]
  const pattern = ids.map(escapeRegex).join('|')
  const regex = `(${pattern})`

  const proc = Bun.spawn({
    cmd: ['bun', 'test', '--grep', regex],
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
  })

  const exitCode = await proc.exited
  process.exit(exitCode)
}

main().catch((error) => {
  console.error('Failed to run tests from specs:', error)
  process.exit(1)
})
