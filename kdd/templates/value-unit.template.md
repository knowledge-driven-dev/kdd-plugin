---
# @type: value-unit
# @description: Value Unit (end-to-end delivery)
id: UV-NNN            # @required @pattern: ^UV-\d{3}$
kind: value-unit      # @required @literal: value-unit
title: Nombre de la unidad   # @required
status: draft         # @enum: draft|review|approved|deprecated
owner: Nombre o rol   # @required
release: REL-NNN      # @optional
tags:                # @type: array
  - value-unit
---

# UV-NNN: Nombre de la unidad

## Objective <!-- required -->

## Scope (end-to-end) <!-- required -->
<!-- expects: list -->

## Inputs <!-- required -->
<!-- expects: list -->

## Outputs <!-- required -->
<!-- expects: list -->

## Exit Criteria <!-- required -->

## Risks / Dependencies <!-- optional -->

## Traceability <!-- required -->
- Objectives:
- Use Cases:
- Commands/Queries:
- Requirements:
- Views:
