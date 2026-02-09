---
paths:
  - specs/01-domain/rules/**
  - specs/domains/*/01-domain/rules/**
---

# Reglas de Negocio KDD

> Aplica cuando trabajas en `specs/01-domain/rules/`

## Tipos de Regla

| Tipo | Prefijo | Uso |
|------|---------|-----|
| Business Rule | `BR-` | Regla invariante, no configurable |
| Business Policy | `BP-` | Política configurable con parámetros |

## Nombrado de Archivo

Patrón: `BR-ENTIDAD-NNN.md` o `BP-ENTIDAD-NNN.md`

Ejemplos:
- `BR-PROYECTO-001.md`
- `BR-SESION-003.md`
- `BP-PUNTOS-001.md`

## Frontmatter Requerido

```yaml
---
id: BR-ENTIDAD-NNN            # Obligatorio
kind: business-rule           # business-rule | business-policy
title: Título de la Regla     # Obligatorio
entity: NombreEntidad         # Entidad principal afectada
category: validation          # validation|limit|state|security|business|policy|data
severity: critical            # critical|high|medium|low
status: draft                 # draft|review|approved|deprecated
---
```

## Estructura del Documento

### Secciones Obligatorias

```markdown
# BR-ENTIDAD-NNN: TítuloDeLaRegla

## Statement
Descripción clara en lenguaje natural, comprensible por stakeholders
no técnicos. Mencionar entidades con wiki-links: [[Entidad]].

## Rationale
Razón de negocio. Explica el riesgo que previene o beneficio que protege.

## When Applies
Puntos del ciclo de vida donde se evalúa (crear, modificar, cambio de estado).

## Violation Behavior
Resultado esperado cuando falla: error visible, operación bloqueada, etc.

## Examples

### Valid Cases
- ✓ Ejemplo de escenario válido
- ✓ Otro escenario válido

### Invalid Cases
- ✗ Escenario inválido → comportamiento esperado
- ✗ Otro escenario inválido → comportamiento esperado
```

### Secciones Opcionales

```markdown
## Parameters (solo BP)
Parámetros configurables y valores por defecto.

## Formalization
WHEN/IF [condición],
the system SHALL [acción]
  AND SHALL NOT [prohibición].

## Implementation
## Notes
```

## Categorías

| Categoría | Descripción | Ejemplo |
|-----------|-------------|---------|
| `validation` | Validación de datos | Título requerido |
| `limit` | Límites numéricos | Máximo 6 personas |
| `state` | Transiciones de estado | Solo borrador puede editarse |
| `security` | Seguridad/permisos | Solo propietario puede eliminar |
| `business` | Lógica de negocio | Puntos insuficientes |
| `policy` | Política configurable | Días de retención |
| `data` | Integridad de datos | Referencias válidas |

## Severidad

| Nivel | Cuándo usar |
|-------|-------------|
| `critical` | Violación causa corrupción de datos o seguridad |
| `high` | Violación bloquea funcionalidad core |
| `medium` | Violación afecta experiencia pero hay workaround |
| `low` | Violación es cosmética o menor |

## Ejemplo Completo

```markdown
---
id: BR-PROYECTO-001
kind: business-rule
title: Límite de Miembros
entity: Proyecto
category: limit
severity: high
status: approved
---

# BR-PROYECTO-001: Límite de Miembros

## Statement

Un [[Proyecto]] debe tener entre 3 y 6 [[Miembro|Miembros]]
para poder iniciar una [[Tarea]].

## Rationale

El el método de análisis requiere diversidad de perspectivas para ser
efectivo. Menos de 3 miembros no genera suficiente diversidad; más de 6
hace las tareas inmanejables.

## When Applies

- Al intentar cambiar estado de `borrador` a `preparado`
- Al intentar iniciar una Tarea

## Violation Behavior

El Sistema muestra error: "El Proyecto debe tener entre 3 y 6 Miembros"
y bloquea la operación.

## Formalization

WHEN the Usuario attempts to prepare a Proyecto,
IF the Proyecto has fewer than 3 or more than 6 Miembros,
the system SHALL reject the operation
  AND SHALL display error message.

## Examples

### Valid Cases
- ✓ Proyecto con 3 Personas → puede prepararse
- ✓ Proyecto con 6 Personas → puede prepararse

### Invalid Cases
- ✗ Proyecto con 2 Personas → error "mínimo 3 miembros"
- ✗ Proyecto con 7 Personas → error "máximo 6 personas"
```
