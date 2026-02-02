---
# @type: requirement
# @description: Functional requirements in EARS format
# @file-pattern: ^REQ-\d{3}-.+\.md$
# @path-pattern: verification/criteria/

id: REQ-NNN                   # @required @pattern: ^REQ-\d{3}$
kind: requirement             # @required @literal: requirement
status: draft                 # @enum: draft|proposed|approved|deprecated @default: draft
source: UC-NNN                # @optional @pattern: ^UC-\d{3}$ @description: Source use case
domain: six-hats              # @optional
---

# EARS Requirements: Title <!-- required pattern: ^(EARS Requirements|Requisitos EARS): -->

Requirements derived from use case [[UC-NNN-Name]].

## Requirements Summary <!-- optional -->

| ID | EARS Pattern | Summary |
|----|--------------|---------|
| REQ-NNN.1 | Event-Driven | Brief description |
| REQ-NNN.2 | Unwanted (If) | Brief description |
| REQ-NNN.3 | State-Driven | Brief description |

---

## REQ-NNN.1: Requirement Name (Pattern) <!-- required-pattern: ^REQ-\d{3}\.\d+: -->

**Pattern**: Event-Driven | Unwanted (If/While) | State-Driven (While) | Optional (Where) | Ubiquitous

```
WHEN <trigger event>,
the system SHALL <required action>
  AND SHALL <additional action>
  AND SHALL NOT <prohibited action>.
```

**Traceability**: UC-NNN, step X

**Acceptance Criteria**:
<!-- expects: gherkin -->
```gherkin
Given <precondition>
When <action>
Then <expected result>
  And <additional expectation>
```

---

## REQ-NNN.2: Another Requirement <!-- pattern: ^REQ-\d{3}\.\d+: -->

**Pattern**: Unwanted Behavior (If)

```
IF <unwanted condition>,
the system SHALL <defensive action>
  AND SHALL NOT <prohibited action>.
```

**Traceability**: UC-NNN, extension Xa

**Acceptance Criteria**:
```gherkin
Given <context>
When <unwanted condition occurs>
Then <system response>
```

---

## Traceability Matrix <!-- optional -->

| Requirement | UC Step | Business Rule | Test Case |
|-------------|---------|---------------|-----------|
| REQ-NNN.1 | 1-5 | - | TC-NNN.1 |
| REQ-NNN.2 | Ext Xa | BR-XXX-001 | TC-NNN.2 |

## Zod Schema (Implementation) <!-- optional -->

<!-- expects: typescript -->
```typescript
// packages/shared/validators/xxx.ts
import { z } from 'zod'

export const xxxSchema = z.object({
  field: z.string().min(1).max(100),
})

export type XxxInput = z.infer<typeof xxxSchema>
```
