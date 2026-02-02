---
# @type: query
# @description: System query (CQRS - read-only operation)
# @file-pattern: ^QRY-\d{3}-.+\.md$
# @path-pattern: behavior/queries/

id: QRY-NNN                   # @required @pattern: ^QRY-\d{3}$
kind: query                   # @required @literal: query
title: Query Name             # @required
status: draft                 # @enum: draft|review|approved|deprecated @default: draft
owner: "@team"                # @optional
created: "2024-01-01"         # @optional
---

# QRY-NNN: QueryName <!-- required pattern: ^QRY-\d{3}: -->

## Purpose <!-- required -->

Brief description of what data this query retrieves and its primary use cases.

## Input <!-- required -->

| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| paramName | type | Yes/No | Validation rules |
| userId | UUID | Yes | Must be authenticated user |

## Output <!-- required -->

```typescript
interface QueryResult {
  field: type
  nested: {
    subfield: type
  }
}
```

## Filters <!-- optional -->

| Filter | Type | Description |
|--------|------|-------------|
| status | enum | Filter by status |
| dateFrom | date | Start date |
| dateTo | date | End date |

## Sorting <!-- optional -->

| Field | Default | Description |
|-------|---------|-------------|
| createdAt | desc | Sort by creation date |
| name | - | Alphabetical sort |

## Pagination <!-- optional -->

| Parameter | Type | Default | Max |
|-----------|------|---------|-----|
| page | number | 1 | - |
| limit | number | 20 | 100 |

## Authorization <!-- required -->

- User must be authenticated
- User can only see own resources (unless admin)
- Specific permission requirements

## Performance <!-- optional -->

| Metric | Target |
|--------|--------|
| Response time | < 200ms |
| Max results | 1000 |

## Possible Errors <!-- required -->

| Code | Condition | Message |
|------|-----------|---------|
| QRY-001 | Not found | "Resource not found" |
| QRY-002 | Not authorized | "Access denied" |

## Use Cases That Invoke It <!-- optional -->

- [[UC-NNN-UseCaseName]]
- UI views that consume this data

## Implementation Notes <!-- optional -->

```typescript
// File path suggestion
// apps/api/src/application/queries/query-name.query.ts

export const querySchema = z.object({
  filters: z.object({...}).optional(),
  pagination: paginationSchema.optional(),
  sort: sortSchema.optional(),
})

async function execute(input: QueryInput): Promise<QueryResult> {
  // Build query
  // Apply filters
  // Apply pagination
  // Return results
}
```

## Caching <!-- optional -->

| Strategy | TTL | Invalidation |
|----------|-----|--------------|
| Per-user | 5 min | On related command |
| Global | 1 hour | Manual |

## Example Response <!-- optional -->

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```
