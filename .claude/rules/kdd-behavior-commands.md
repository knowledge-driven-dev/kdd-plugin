---
paths:
  - specs/02-behavior/commands/**
  - specs/domains/*/02-behavior/commands/**
---

# Comandos CQRS KDD

> Aplica cuando trabajas en `specs/02-behavior/commands/`

## Concepto

Un **Command** es una operación que **modifica estado** en el sistema (CQRS).
Contrasta con Query que solo lee datos.

## Nombrado de Archivo

Patrón: `CMD-NNN-NombreDelComando.md`

Ejemplos:
- `CMD-001-CrearProyecto.md`
- `CMD-Miembros.md`
- `CMD-003-IniciarTarea.md`

## Frontmatter Requerido

```yaml
---
id: CMD-NNN                   # Obligatorio
kind: command                 # Literal
title: Nombre del Comando     # Obligatorio
status: draft                 # draft|review|approved|deprecated
billable: false               # Si consume puntos
credit-cost: 0                # Puntos consumidos (si billable: true)
tags: [core]                  # Categorización
---
```

## Estructura del Documento

### Secciones Obligatorias

```markdown
# CMD-NNN: NombreComando

## Purpose
Descripción breve de qué hace y por qué existe.

## Input
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| userId | UUID | Yes | Usuario autenticado |
| titulo | string | Yes | 1-200 caracteres |

## Preconditions
- Usuario autenticado
- Entidades requeridas existen
- Reglas de negocio satisfechas

## Postconditions
- Cambios de estado tras ejecución exitosa
- Entidades creadas/modificadas/eliminadas
- Efectos secundarios (emails, notificaciones)

## Possible Errors
| Code | Condition | Message |
|------|-----------|---------|
| CMD-001-E01 | Título vacío | "El título es obligatorio" |
| CMD-001-E02 | Sin permisos | "No tienes permiso" |
```

### Secciones Opcionales

```markdown
## Rules Validated
- [[BR-PROYECTO-001]] - Descripción

## Events Generated
- [[EVT-Proyecto-Creado]] on success

## Use Cases That Invoke It
- [[UC-001-Crear-Proyecto]]

## State Transitions
Proyecto [null] → [borrador]

## Implementation Notes
## Performance Requirements
```

## Input: Validaciones Comunes

| Tipo | Validación típica |
|------|-------------------|
| `string` | min/max length, pattern |
| `UUID` | formato válido, entidad existe |
| `enum` | valor permitido |
| `number` | min/max, positivo |
| `array` | min/max items |

## Errores: Convención de Códigos

Patrón: `CMD-NNN-EXX`

- `CMD-001-E01` → Primer error del comando 001
- `CMD-001-E02` → Segundo error del comando 001

## Comandos Billable

Si el comando consume puntos:

```yaml
---
billable: true
credit-cost: 1
---
```

Agregar en Preconditions:
```markdown
## Preconditions
- Usuario tiene al menos {credit-cost} puntos disponibles
```

Y en Rules Validated:
```markdown
## Rules Validated
- [[BP-PUNTOS-001]] - Verificación de puntos
```

## Ejemplo Completo

```markdown
---
id: CMD-001
kind: command
title: Crear Proyecto
status: approved
billable: false
tags: [core, proyecto]
---

# CMD-001: CrearProyecto

## Purpose

Crea un nuevo [[Proyecto]] en estado `borrador` para el [[Usuario]] actual.

## Input

| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| userId | UUID | Yes | Usuario autenticado |
| titulo | string | Yes | 1-200 caracteres, no vacío |
| descripcion | string | No | Máximo 2000 caracteres |

## Preconditions

- Usuario está autenticado
- Usuario tiene rol activo

## Postconditions

- Existe nuevo [[Proyecto]] con:
  - `status`: `borrador`
  - `usuario_id`: userId del input
  - `titulo`: valor del input
- Evento [[EVT-Proyecto-Creado]] emitido

## Rules Validated

- [[BR-PROYECTO-002]] - Título no vacío

## Events Generated

- [[EVT-Proyecto-Creado]] on success:
  ```yaml
  proyecto_id: UUID
  usuario_id: UUID
  titulo: string
  timestamp: ISO-8601
  ```

## Possible Errors

| Code | Condition | Message |
|------|-----------|---------|
| CMD-001-E01 | Título vacío | "El título es obligatorio" |
| CMD-001-E02 | Título > 200 chars | "Máximo 200 caracteres" |
| CMD-001-E03 | No autenticado | "Debes iniciar sesión" |

## Use Cases That Invoke It

- [[UC-001-Crear-Proyecto]]

## State Transitions

Proyecto: [null] → [borrador]
```
