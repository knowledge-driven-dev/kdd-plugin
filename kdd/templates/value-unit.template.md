---
# @type: value-unit
# @description: Value Unit (end-to-end delivery with implementation tracking)
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

### Implemented
<!-- Items already coded and working. Mark with [x] -->
- [x] [[CMD-XXX-Example]] — Breve nota de qué incluye (API + UI + tests)

### Pending — Iteration: {nombre de la iteración}
<!-- Items to implement next. Mark with [ ]. Each references a spec file -->
- [ ] [[CMD-YYY-NewFeature]] — **New**. Descripción breve
- [ ] [[UI-Component]] vN.N — **Update**. Qué cambia

### Out of scope (deferred)
<!-- Items explicitly postponed. Use ~~strikethrough~~ -->
- ~~[[CMD-ZZZ-Deferred]]~~ — Razón del aplazamiento

### Cross-references
<!-- Use cases, requirements and other transversal specs -->
- [[UC-NNN-UseCaseName]]
- [[REQ-NNN-RequirementName]]

## Inputs <!-- required -->
<!-- expects: list -->

## Outputs <!-- required -->
<!-- expects: list -->

## Exit Criteria <!-- required -->

### Already validated
- [x] Criterio ya cumplido

### Pending (iteration: {nombre})
- [ ] Criterio pendiente de validar

## Risks / Dependencies <!-- optional -->

## Traceability <!-- required -->
- Objectives:
- Use Cases:
- Commands/Queries:
- Requirements:
- Views:
