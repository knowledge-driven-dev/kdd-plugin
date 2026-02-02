---
paths:
  - specs/02-behavior/commands/**
  - specs/domains/*/02-behavior/commands/**
---

# Comandos CQRS KDD

> Aplica cuando trabajas en `specs/02-behavior/commands/`

## Concepto

Un **Command** es una operacion que **modifica estado** en el sistema (CQRS).
Contrasta con Query que solo lee datos.

## Nombrado de Archivo

Patron: `CMD-NNN-NombreDelComando.md`

Ejemplos:
- `CMD-001-CrearProyecto.md`
- `CMD-002-AsignarTarea.md`
- `CMD-003-CompletarItem.md`

## Frontmatter Requerido

```yaml
---
id: CMD-NNN                   # Obligatorio
kind: command                 # Literal
title: Nombre del Comando     # Obligatorio
status: draft                 # draft|review|approved|deprecated
billable: false               # Si consume creditos
credit-cost: 0                # Creditos consumidos (si billable: true)
tags: [core]                  # Categorizacion
---
```

## Estructura del Documento

### Secciones Obligatorias

```markdown
# CMD-NNN: NombreComando

## Purpose
Descripcion breve de que hace y por que existe.

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
- Cambios de estado tras ejecucion exitosa
- Entidades creadas/modificadas/eliminadas
- Efectos secundarios (emails, notificaciones)

## Possible Errors
| Code | Condition | Message |
|------|-----------|---------|
| CMD-001-E01 | Titulo vacio | "El titulo es obligatorio" |
| CMD-001-E02 | Sin permisos | "No tienes permiso" |
```

### Secciones Opcionales

```markdown
## Rules Validated
- [[BR-PROYECTO-001]] - Descripcion

## Events Generated
- [[EVT-Proyecto-Creado]] on success

## Use Cases That Invoke It
- [[UC-001-Crear-Proyecto]]

## State Transitions
Proyecto [null] -> [borrador]

## Implementation Notes
## Performance Requirements
```

## Input: Validaciones Comunes

| Tipo | Validacion tipica |
|------|-------------------|
| `string` | min/max length, pattern |
| `UUID` | formato valido, entidad existe |
| `enum` | valor permitido |
| `number` | min/max, positivo |
| `array` | min/max items |

## Errores: Convencion de Codigos

Patron: `CMD-NNN-EXX`

- `CMD-001-E01` -> Primer error del comando 001
- `CMD-001-E02` -> Segundo error del comando 001

## Comandos Billable

Si el comando consume creditos:

```yaml
---
billable: true
credit-cost: 1
---
```

Agregar en Preconditions:
```markdown
## Preconditions
- Usuario tiene al menos {credit-cost} creditos disponibles
```

Y en Rules Validated:
```markdown
## Rules Validated
- [[BP-CREDITOS-001]] - Verificacion de creditos
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
| titulo | string | Yes | 1-200 caracteres, no vacio |
| descripcion | string | No | Maximo 2000 caracteres |

## Preconditions

- Usuario esta autenticado
- Usuario tiene rol activo

## Postconditions

- Existe nuevo [[Proyecto]] con:
  - `status`: `borrador`
  - `usuario_id`: userId del input
  - `titulo`: valor del input
- Evento [[EVT-Proyecto-Creado]] emitido

## Rules Validated

- [[BR-PROYECTO-002]] - Titulo no vacio

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
| CMD-001-E01 | Titulo vacio | "El titulo es obligatorio" |
| CMD-001-E02 | Titulo > 200 chars | "Maximo 200 caracteres" |
| CMD-001-E03 | No autenticado | "Debes iniciar sesion" |

## Use Cases That Invoke It

- [[UC-001-Crear-Proyecto]]

## State Transitions

Proyecto: [null] -> [borrador]
```
