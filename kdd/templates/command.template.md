---
# @type: command
# @description: System command (CQRS - state-modifying operation)
# @file-pattern: ^CMD-\d{3}-.+\.md$
# @path-pattern: behavior/commands/

id: CMD-NNN                   # @required @pattern: ^CMD-\d{3}$
kind: command                 # @required @literal: command
title: Command Name           # @required
status: draft                 # @enum: draft|review|approved|deprecated @default: draft
owner: "@team"                # @optional
created: "2024-01-01"         # @optional
billable: false               # @optional - If true, applies XP-CREDITS-001
credit-cost: 0                # @optional - Credits consumed (requires billable: true)
tags:                         # @type: array @optional - Categorization tags
  - core
---

# CMD-NNN: CommandName <!-- required pattern: ^CMD-\d{3}: -->

## Purpose <!-- required -->

Brief description of what this command does and why it exists.

## Input <!-- required -->

| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| paramName | type | Yes/No | Validation rules |
| userId | UUID | Yes | Must be authenticated user |

## Preconditions <!-- required -->

- User is authenticated
- Required entities exist
- Business rules that must be satisfied before execution

## Postconditions <!-- required -->

- State changes that occur after successful execution
- Entities created/modified/deleted
- Side effects (emails, notifications, etc.)

## Rules Validated <!-- optional -->

- [[BR-XXX-001]] - Rule description
- [[BR-YYY-002]] - Another rule

## Events Generated <!-- optional alias: Events Emitted -->

- `EventName` on success:
  ```yaml
  entityId: UUID
  action: string
  timestamp: ISO-8601
  ```

## Possible Errors <!-- required -->

| Code | Condition | Message |
|------|-----------|---------|
| ERR-001 | Error condition | "User-facing error message" |
| ERR-002 | Another condition | "Another error message" |

## Use Cases That Invoke It <!-- optional -->

- [[UC-NNN-UseCaseName]]

## Implementation Notes <!-- optional -->

```typescript
// File path suggestion
// apps/api/src/application/use-cases/command-name.use-case.ts

export const commandNameSchema = z.object({
  param: z.string(),
})

async function execute(input: CommandInput): Promise<CommandResult> {
  // Validation
  // Business logic
  // Persistence
  // Events
}
```

## State Transitions <!-- optional -->

```
Entity [state_a] → [state_b]
```

## UI Flow <!-- optional -->

```
User action →
  System response →
  Next step
```

## Performance Requirements <!-- optional -->

| Metric | Target |
|--------|--------|
| Latency | < X seconds |
| Timeout | Y seconds |
