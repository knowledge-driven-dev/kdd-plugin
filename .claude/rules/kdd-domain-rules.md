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
| Business Policy | `BP-` | Politica configurable con parametros |

## Nombrado de Archivo

Patron: `BR-ENTIDAD-NNN.md` o `BP-ENTIDAD-NNN.md`

Ejemplos:
- `BR-PROYECTO-001.md`
- `BR-TAREA-003.md`
- `BP-CREDITOS-001.md`

## Frontmatter Requerido

```yaml
---
id: BR-ENTIDAD-NNN            # Obligatorio
kind: business-rule           # business-rule | business-policy
title: Titulo de la Regla     # Obligatorio
entity: NombreEntidad         # Entidad principal afectada
category: validation          # validation|limit|state|security|business|policy|data
severity: critical            # critical|high|medium|low
status: draft                 # draft|review|approved|deprecated
---
```

## Estructura del Documento

### Secciones Obligatorias

```markdown
# BR-ENTIDAD-NNN: TituloDeLaRegla

## Statement
Descripcion clara en lenguaje natural, comprensible por stakeholders
no tecnicos. Mencionar entidades con wiki-links: [[Entidad]].

## Rationale
Razon de negocio. Explica el riesgo que previene o beneficio que protege.

## When Applies
Puntos del ciclo de vida donde se evalua (crear, modificar, cambio de estado).

## Violation Behavior
Resultado esperado cuando falla: error visible, operacion bloqueada, etc.

## Examples

### Valid Cases
- Check Ejemplo de escenario valido
- Check Otro escenario valido

### Invalid Cases
- X Escenario invalido -> comportamiento esperado
- X Otro escenario invalido -> comportamiento esperado
```

### Secciones Opcionales

```markdown
## Parameters (solo BP)
Parametros configurables y valores por defecto.

## Formalization
WHEN/IF [condicion],
the system SHALL [accion]
  AND SHALL NOT [prohibicion].

## Implementation
## Notes
```

## Categorias

| Categoria | Descripcion | Ejemplo |
|-----------|-------------|---------|
| `validation` | Validacion de datos | Titulo requerido |
| `limit` | Limites numericos | Maximo 10 items |
| `state` | Transiciones de estado | Solo borrador puede editarse |
| `security` | Seguridad/permisos | Solo propietario puede eliminar |
| `business` | Logica de negocio | Creditos insuficientes |
| `policy` | Politica configurable | Dias de retencion |
| `data` | Integridad de datos | Referencias validas |

## Severidad

| Nivel | Cuando usar |
|-------|-------------|
| `critical` | Violacion causa corrupcion de datos o seguridad |
| `high` | Violacion bloquea funcionalidad core |
| `medium` | Violacion afecta experiencia pero hay workaround |
| `low` | Violacion es cosmetica o menor |

## Ejemplo Completo

```markdown
---
id: BR-PROYECTO-001
kind: business-rule
title: Limite de Miembros por Proyecto
entity: Proyecto
category: limit
severity: high
status: approved
---

# BR-PROYECTO-001: Limite de Miembros por Proyecto

## Statement

Un [[Proyecto]] debe tener entre 1 y 20 [[Usuario|miembros]]
para poder estar activo.

## Rationale

Proyectos sin miembros no tienen sentido operativo. Mas de 20
miembros hace la coordinacion inmanejable y afecta el rendimiento.

## When Applies

- Al intentar cambiar estado de `borrador` a `activo`
- Al intentar agregar un nuevo miembro

## Violation Behavior

El Sistema muestra error: "El Proyecto debe tener entre 1 y 20 miembros"
y bloquea la operacion.

## Formalization

WHEN the Usuario attempts to activate a Proyecto,
IF the Proyecto has fewer than 1 or more than 20 members,
the system SHALL reject the operation
  AND SHALL display error message.

## Examples

### Valid Cases
- Check Proyecto con 1 miembro -> puede activarse
- Check Proyecto con 20 miembros -> puede activarse

### Invalid Cases
- X Proyecto con 0 miembros -> error "minimo 1 miembro"
- X Proyecto con 21 miembros -> error "maximo 20 miembros"
```
