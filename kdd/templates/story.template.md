---
# @type: story
# @description: User story
# @file-pattern: ^(US|STORY)-\d+.*\.md$
# @path-pattern: behavior/stories/

id: STORY-NNN                 # @optional @pattern: ^(US|STORY)-\d+
kind: story                   # @literal: story
status: proposed              # @enum: draft|proposed|approved|deprecated @default: proposed
related:                      # @type: array @optional @description: Related use cases
  - UC-NNN
---

# User Story <!-- title-is-name -->

**As** [type of user]
**I want** [action/functionality]
**so that** [benefit/value].

## Context <!-- optional -->

Additional information that helps understand the story:
- Current user situation
- Why it is important
- Known constraints

## Acceptance Criteria <!-- required -->

<!-- expects: gherkin -->
```gherkin
Scenario: Main scenario description
  Given [initial context]
  When [user action]
  Then [expected result]
    And [additional result]

Scenario: Alternative scenario
  Given [other context]
  When [other action]
  Then [other result]

Scenario: Error case
  Given [context]
  When [action that causes error]
  Then [error handling]
```

## Related Use Cases <!-- optional -->

- [[UC-NNN-Name]] - This use case details the complete flow

## Notes <!-- optional -->

- Technical considerations
- Dependencies
- Pending questions

## Design <!-- optional -->

Link to mockups or wireframes if they exist.
