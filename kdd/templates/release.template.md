---
# @type: release
# @description: Release Plan (groups Value Units)
id: REL-NNN            # @required @pattern: ^REL-\d{3}$
kind: release          # @required @literal: release
title: Nombre del release   # @required
status: draft          # @enum: draft|review|approved|deprecated
owner: Nombre o rol    # @required
target_date: 2025-03-31 # @optional
tags:                 # @type: array
  - release
---

# REL-NNN: Nombre del release

## Objective <!-- required -->

## Value Units <!-- required -->
<!-- expects: list -->

## Scope <!-- optional -->

## Dependencies <!-- optional -->

## Risks <!-- optional -->

## Exit Criteria <!-- required -->

## Success Metrics <!-- optional -->
