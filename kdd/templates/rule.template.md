---
# @type: rule
# @description: Business Rule (BR-*) or Business Policy (BP-*)
# @file-pattern: ^(BR|BP)-[A-Z]+-\d{3}\.md$
# @path-pattern: domain/rules/

id: BR-ENTITY-NNN             # @required @pattern: ^(BR|BP)-[A-Z]+-\d{3}$
kind: business-rule           # @required @enum: business-rule|business-policy
title: Rule Title             # @required
entity: EntityName            # @required - Main affected entity
category: validation          # @enum: validation|limit|state|security|business|policy|data
severity: critical            # @enum: critical|high|medium|low
status: draft                 # @enum: draft|review|approved|deprecated @default: draft
owner: "@team"                # @optional
created: "2024-01-01"         # @optional
---

# BR-ENTITY-NNN: RuleTitle <!-- required pattern: ^(BR|BP)-[A-Z]+-\d{3}: -->

## Statement <!-- required -->

Clear statement of the rule in natural language, understandable by non-technical stakeholders. Affected domain entities should be mentioned with wiki-links: [[Entity1]], [[Entity2]].

## Rationale <!-- required -->

Brief business reason. Explains the risk it prevents or the benefit it protects.

## When Applies <!-- required -->

Indicates at which points in the entity lifecycle the rule is evaluated (create, modify, state change).

## Violation Behavior <!-- required -->

Expected outcome when the rule fails. Example: user-visible error, blocked operation, disallowed state.

## Parameters (BP only) <!-- optional -->

If this is a Business Policy, list configurable parameters and their default values.

## Formalization (optional) <!-- optional -->

```
IF/WHEN/WHILE [condition],
the system SHALL [action]
  AND SHALL [additional action]
  AND SHALL NOT [prohibited action].
```

## Examples <!-- required -->

### Valid Cases
- ✓ Example of valid scenario
- ✓ Another valid scenario

### Invalid Cases
- ✗ Example of invalid scenario → expected behavior
- ✗ Another invalid scenario → expected behavior

## Implementation (optional) <!-- optional -->

```typescript
// Suggested implementation approach
function validateRule(input: Input): void {
  if (!condition) {
    throw new BusinessRuleError('BR-ENTITY-NNN', 'Error message')
  }
}
```

## Notes <!-- optional -->

Additional context, edge cases, or implementation considerations.
