---
# @type: use-case
# @description: Use case following Cockburn-lite format
# @file-pattern: ^UC-\d{3}-.+\.md$
# @path-pattern: behavior/use-cases/

id: UC-NNN                    # @required @pattern: ^UC-\d{3}$
kind: use-case                # @required @literal: use-case
version: 1                    # @type: number @default: 1
status: draft                 # @enum: draft|proposed|approved|deprecated @default: draft
actor: Primary Actor          # @required @description: Primary actor of the use case
domain: six-hats              # @optional
---

# UC-NNN: Use Case Title <!-- required pattern: ^UC-\d{3}:\s+.+ -->

## Description <!-- required -->

Clear description of the use case. Explain the main objective and the value it provides.

## Actors <!-- required -->

- **Primary Actor**: [[Actor]] - Role and motivation
- **Secondary Actor**: System/Other actor (optional)

## Triggers <!-- optional -->

- Action or event that initiates the use case
- There may be multiple triggers

## Preconditions <!-- required -->

1. Condition that must be met before starting
2. Initial state of the system

## Main Flow (Happy Path) <!-- required -->

1. The Actor performs the first action
2. The System responds
3. The Actor continues...
4. The System **validates** the data
5. The System **persists** the changes
6. The System **emits** event [[EVT-Something-Happened]]
7. The System shows confirmation to the Actor

## Extensions / Alternative Flows <!-- optional -->

### Na. Extension description

1. Condition that triggers the extension
2. Alternative steps
3. Return to main flow or end

### Nb. Another extension

1. ...

## Minimal Guarantees <!-- optional -->

- Guarantee that holds even if the use case fails
- The system does not remain in an inconsistent state

## Postconditions <!-- required -->

### On Success (Success Guarantees)

- Final state of the system after success
- Entities created/modified
- Events emitted

**Affected entities detail:**

- There exists an [[Entity]] with:
  - `attribute`: expected value
  - `status`: new status

### On Failure

- State if the use case fails
- Rollback applied
- Logging performed

## Business Rules <!-- optional -->

| Rule | Description |
|------|-------------|
| [[BR-XXX-001]] | Brief description |
| [[BR-XXX-002]] | Brief description |

## Non-Functional Requirements <!-- optional -->

- **Performance**: Maximum response time
- **Availability**: Offline behavior if applicable
- **Accessibility**: Accessibility requirements

## Test Scenarios <!-- optional -->

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| TC-NNN.1 | Scenario description | Expected result |
| TC-NNN.2 | Another scenario | Expected result |

## Events Emitted <!-- optional -->

| Event | Description |
|-------|-------------|
| [[EVT-Something-Happened]] | When it is emitted |

## Related Requirements <!-- optional -->

- [[REQ-NNN.1]] - Description
- [[REQ-NNN.2]] - Description

## Implementation Notes <!-- optional -->

- Technical considerations
- Dependencies
- Implementation suggestions
