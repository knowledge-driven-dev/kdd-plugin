---
# @type: adr
# @description: Architecture Decision Record
# @file-pattern: ^ADR-\d{4}.*\.md$
# @path-pattern: architecture/decisions/

id: ADR-NNNN                  # @required @pattern: ^ADR-\d{4}$
kind: adr                     # @literal: adr
status: proposed              # @enum: draft|proposed|approved|deprecated|superseded @default: proposed
supersedes:                   # @type: array @optional @description: ADRs this one replaces
  - ADR-XXXX
superseded_by:                # @optional @description: ADR that replaces this one
date: YYYY-MM-DD              # @optional @type: date
deciders:                     # @type: array @optional
  - Name 1
  - Name 2
---

# ADR-NNNN: Decision Title <!-- required pattern: ^ADR-\d{4}: -->

## Status <!-- optional -->

Proposed | Accepted | Deprecated | Superseded by [[ADR-XXXX]]

## Context <!-- required -->

Description of the context and the problem that requires a decision:

- Current situation
- Forces at play (requirements, constraints, concerns)
- Why a decision needs to be made now

## Decision <!-- required -->

The decision made:

**We choose [chosen option] because [main reason].**

Decision details:
- What will be done
- How it will be implemented
- Who is responsible

## Options Considered <!-- optional alias: Alternatives -->

### Option 1: Name

- **Pros**: Advantages
- **Cons**: Disadvantages
- **Reason for rejection**: Why it was not chosen

### Option 2: Name

- **Pros**: Advantages
- **Cons**: Disadvantages
- **Reason for rejection**: Why it was not chosen

### Option 3: [Chosen]

- **Pros**: Advantages
- **Cons**: Accepted disadvantages
- **Reason for selection**: Why this was chosen

## Consequences <!-- required -->

### Positive

- Benefit 1
- Benefit 2
- Improvement in X

### Negative

- Accepted trade-off 1
- Additional complexity in Y
- Potential technical debt in Z

### Neutral

- Change that is neither positive nor negative

## Implementation Plan <!-- optional -->

1. Step 1
2. Step 2
3. Step 3

## References <!-- optional -->

- Link to relevant documentation
- Papers or articles consulted
- Related ADRs: [[ADR-XXXX]]
