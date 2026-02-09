---
paths:
  - specs/02-behavior/queries/**
  - specs/domains/*/02-behavior/queries/**
---

# Queries CQRS KDD

> Aplica cuando trabajas en `specs/02-behavior/queries/`

## Concepto

Una **Query** es una operación de **solo lectura** (CQRS).
No modifica estado, solo recupera datos.

## Nombrado de Archivo

Patrón: `QRY-NNN-NombreDeLaQuery.md`

Ejemplos:
- `QRY-001-ObtenerProyecto.md`
- `QRY-002-ListarProyectosUsuario.md`
- `QRY-003-BuscarSesiones.md`

## Frontmatter Requerido

```yaml
---
id: QRY-NNN                   # Obligatorio
kind: query                   # Literal
title: Nombre de la Query     # Obligatorio
status: draft                 # draft|review|approved|deprecated
---
```

## Estructura del Documento

### Secciones Obligatorias

```markdown
# QRY-NNN: NombreQuery

## Purpose
Descripción de qué datos recupera y casos de uso principales.

## Input
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| userId | UUID | Yes | Usuario autenticado |
| proyectoId | UUID | Yes | Proyecto existente |

## Output
```typescript
interface QueryResult {
  id: string
  titulo: string
  status: ProyectoStatus
}
```

## Authorization
- Usuario debe estar autenticado
- Usuario solo ve sus propios recursos (excepto admin)

## Possible Errors
| Code | Condition | Message |
|------|-----------|---------|
| QRY-001-E01 | No encontrado | "Recurso no encontrado" |
| QRY-001-E02 | Sin acceso | "Acceso denegado" |
```

### Secciones Opcionales

```markdown
## Filters
| Filter | Type | Description |
|--------|------|-------------|
| status | enum | Filtrar por estado |
| dateFrom | date | Fecha inicio |

## Sorting
| Field | Default | Description |
|-------|---------|-------------|
| createdAt | desc | Por fecha creación |

## Pagination
| Parameter | Type | Default | Max |
|-----------|------|---------|-----|
| page | number | 1 | - |
| limit | number | 20 | 100 |

## Performance
| Metric | Target |
|--------|--------|
| Response time | < 200ms |

## Caching
| Strategy | TTL | Invalidation |
|----------|-----|--------------|
| Per-user | 5 min | On related command |

## Example Response
## Use Cases That Invoke It
## Implementation Notes
```

## Tipos de Query

| Tipo | Patrón nombre | Retorna |
|------|---------------|---------|
| Get single | `ObtenerX` | Un objeto o error |
| List | `ListarX` | Array paginado |
| Search | `BuscarX` | Array filtrado |
| Count | `ContarX` | Número |
| Exists | `ExisteX` | Boolean |

## Output: Patrones Comunes

### Single Entity
```typescript
interface GetProyectoResult {
  id: string
  titulo: string
  descripcion: string
  status: ProyectoStatus
  createdAt: string
}
```

### Paginated List
```typescript
interface ListProyectosResult {
  data: ProyectoSummary[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

## Errores: Convención de Códigos

Patrón: `QRY-NNN-EXX`

Errores comunes:
- `QRY-XXX-E01` → No encontrado
- `QRY-XXX-E02` → Sin autorización
- `QRY-XXX-E03` → Parámetros inválidos

## Ejemplo Completo

```markdown
---
id: QRY-002
kind: query
title: Listar Proyectos del Usuario
status: approved
---

# QRY-002: ListarProyectosUsuario

## Purpose

Recupera la lista paginada de [[Proyecto|Proyectos]] del [[Usuario]] actual,
con filtros opcionales por estado.

## Input

| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| userId | UUID | Yes | Usuario autenticado |

## Output

```typescript
interface ListProyectosResult {
  data: {
    id: string
    titulo: string
    status: ProyectoStatus
    personasCount: number
    sesionesCount: number
    createdAt: string
  }[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

## Filters

| Filter | Type | Description |
|--------|------|-------------|
| status | enum | `borrador`, `preparado`, `en_analisis`, `terminado` |

## Sorting

| Field | Default | Description |
|-------|---------|-------------|
| createdAt | desc | Más recientes primero |
| titulo | - | Alfabético |

## Pagination

| Parameter | Type | Default | Max |
|-----------|------|---------|-----|
| page | number | 1 | - |
| limit | number | 20 | 50 |

## Authorization

- Usuario debe estar autenticado
- Solo retorna Proyectos donde `usuario_id` = userId

## Possible Errors

| Code | Condition | Message |
|------|-----------|---------|
| QRY-002-E01 | No autenticado | "Debes iniciar sesión" |
| QRY-002-E02 | Filtro inválido | "Estado no válido" |

## Performance

| Metric | Target |
|--------|--------|
| Response time | < 100ms |
| Max results | 50 per page |

## Caching

| Strategy | TTL | Invalidation |
|----------|-----|--------------|
| Per-user | 2 min | CMD-001, CMD-005 |

## Use Cases That Invoke It

- [[UC-005-Ver-Mis-Proyectos]]
- Dashboard principal
```
