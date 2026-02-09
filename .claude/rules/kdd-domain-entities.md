---
paths:
  - specs/01-domain/entities/**
  - specs/domains/*/01-domain/entities/**
---

# Entidades de Dominio KDD

> Aplica cuando trabajas en `specs/01-domain/entities/`

## Tipos de Entidad (kind)

| Kind | Uso | Nombrado archivo |
|------|-----|------------------|
| `entity` | Entidad de dominio (Proyecto, Tarea, Plan) | `NombreEntidad.md` |
| `role` | Rol de usuario (Propietario, Moderador) | `NombreRol.md` |
| `actor` | Actor externo (Usuario, Administrador) | `NombreActor.md` |
| `system` | Sistema externo | `ORACLE.md` (MAYÚSCULAS) |

## Frontmatter Requerido

```yaml
---
kind: entity                  # entity|role|actor|system
aliases:                      # Nombres alternativos (opcional)
  - NombreAlternativo
---
```

## Estructura del Documento

```markdown
# Nombre Entidad

## Description <!-- required -->
Descripción clara. Incluir:
- Propósito principal
- Relaciones con otras entidades (en prosa)
- Características distintivas

### Examples <!-- optional -->
Ejemplos concretos.

## Attributes <!-- required -->
| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Identificador único |
| `status` | enum | Estado (ver [[#States]]) |
| `created_at` | timestamp | Fecha creación |

## States <!-- si tiene ciclo de vida -->
| State | ID | Description |
|-------|----|-------------|
| **Borrador** | `borrador` | Estado inicial |
| **Activo** | `activo` | En uso |

### Transitions
- **Borrador → Activo**: Cuando se completa configuración

## Lifecycle <!-- opcional, mermaid -->
## Invariants <!-- opcional -->
```

## Relaciones: En Prosa, No en Tablas

```markdown
# Correcto
Cada Proyecto pertenece a un [[Usuario]] y contiene entre 3 y 6
[[Miembro|Miembros]].

# Incorrecto
## Relaciones
| Relación | Cardinalidad | Entidad |
| pertenece a | N:1 | Usuario |
```

## Invariantes

```markdown
## Invariants

| ID | Constraint |
|----|------------|
| INV-PROYECTO-001 | Un Proyecto debe tener entre 3 y 6 Miembros |
| INV-PROYECTO-002 | El título no puede estar vacío |
```

## Ejemplo Completo

```markdown
---
kind: entity
aliases:
  - Proyecto
---

# Proyecto

## Description

Un Proyecto representa un problema o situación que el [[Usuario]] quiere
analizar usando el el método de análisis. Cada Proyecto pertenece a
un único Usuario y contiene entre 3 y 6 [[Miembro|Miembros]].

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Identificador único |
| `titulo` | string | Título descriptivo del proyecto |
| `descripcion` | text | Contexto y detalles |
| `status` | enum | Estado (ver [[#States]]) |
| `usuario_id` | uuid | [[Usuario]] propietario |

## States

| State | ID | Description |
|-------|----|-------------|
| **Borrador** | `borrador` | En configuración |
| **Preparado** | `preparado` | Listo con 3-6 Personas |
| **En Análisis** | `en_analisis` | Tarea iniciada |
| **Terminado** | `terminado` | Límite alcanzado |

## Invariants

| ID | Constraint |
|----|------------|
| INV-PROYECTO-001 | Debe tener entre 3 y 6 Miembros |
| INV-PROYECTO-002 | El título no puede exceder 200 caracteres |
```
