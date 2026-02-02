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
| `system` | Sistema externo | `ORACLE.md` (MAYUSCULAS) |

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
Descripcion clara. Incluir:
- Proposito principal
- Relaciones con otras entidades (en prosa)
- Caracteristicas distintivas

### Examples <!-- optional -->
Ejemplos concretos.

## Attributes <!-- required -->
| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Identificador unico |
| `status` | enum | Estado (ver [[#States]]) |
| `created_at` | timestamp | Fecha creacion |

## States <!-- si tiene ciclo de vida -->
| State | ID | Description |
|-------|----|-------------|
| **Borrador** | `borrador` | Estado inicial |
| **Activo** | `activo` | En uso |

### Transitions
- **Borrador -> Activo**: Cuando se completa configuracion

## Lifecycle <!-- opcional, mermaid -->
## Invariants <!-- opcional -->
```

## Relaciones: En Prosa, No en Tablas

```markdown
# Correcto
Cada Proyecto pertenece a un [[Usuario]] y contiene multiples
[[Tarea|Tareas]].

# Incorrecto
## Relaciones
| Relacion | Cardinalidad | Entidad |
| pertenece a | N:1 | Usuario |
```

## Invariantes

```markdown
## Invariants

| ID | Constraint |
|----|------------|
| INV-PROYECTO-001 | Un Proyecto debe tener al menos un miembro |
| INV-PROYECTO-002 | El titulo no puede estar vacio |
```

## Ejemplo Completo

```markdown
---
kind: entity
aliases:
  - Project
---

# Proyecto

## Description

Un Proyecto representa una iniciativa que el [[Usuario]] quiere
gestionar. Cada Proyecto pertenece a un unico Usuario y puede
contener multiples [[Tarea|Tareas]].

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Identificador unico |
| `titulo` | string | Titulo descriptivo del proyecto |
| `descripcion` | text | Contexto y detalles |
| `status` | enum | Estado (ver [[#States]]) |
| `usuario_id` | uuid | [[Usuario]] propietario |

## States

| State | ID | Description |
|-------|----|-------------|
| **Borrador** | `borrador` | En configuracion |
| **Activo** | `activo` | En progreso |
| **Completado** | `completado` | Finalizado |
| **Archivado** | `archivado` | No activo |

## Invariants

| ID | Constraint |
|----|------------|
| INV-PROYECTO-001 | Debe tener titulo no vacio |
| INV-PROYECTO-002 | El titulo no puede exceder 200 caracteres |
```
