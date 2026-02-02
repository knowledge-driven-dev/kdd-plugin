---
paths:
  - specs/_shared/**
  - specs/domains/*/_manifest.yaml
---

# Elementos Compartidos y Multi-Dominio KDD

> Aplica a `specs/_shared/` y manifests de dominio

## Estructura Multi-Dominio

```
specs/
├── _shared/                    # Elementos transversales
│   ├── policies/               # XP-* Politicas cross-domain
│   ├── glossary.md             # Terminos globales
│   ├── domain-map.md           # Mapa de dominios
│   └── nfr/                    # NFRs globales
│
└── domains/                    # Bounded contexts
    ├── core/                   # Dominio fundacional
    │   ├── _manifest.yaml      # Metadatos del dominio
    │   ├── 01-domain/
    │   ├── 02-behavior/
    │   └── 03-experience/
    │
    ├── auth/
    ├── billing/
    └── projects/
```

## Manifest de Dominio (`_manifest.yaml`)

### Ubicacion

`specs/domains/{domain-name}/_manifest.yaml`

### Estructura Minima

```yaml
domain:
  id: projects                  # Debe coincidir con carpeta
  name: "Gestion de Proyectos"
  description: "Gestion de proyectos y tareas"
  status: active                # active|deprecated|experimental|frozen
```

### Estructura Completa

```yaml
domain:
  id: projects
  name: "Gestion de Proyectos"
  description: |
    Dominio principal. Gestiona el ciclo completo de proyectos
    y tareas del equipo.
  status: active
  team: "@team-core"
  version: "1.0.0"
  tags: [core-business, project-management]

dependencies:
  - domain: core
    type: required              # required|optional|event-only
    reason: "Usuarios son fundacionales"
    imports:
      entities: [Usuario]
      events: [EVT-Usuario-Creado]

  - domain: billing
    type: optional
    reason: "Funciona sin facturacion en modo free"
    imports:
      events: [EVT-Pago-Completado]

exports:
  entities: [Proyecto, Tarea, Equipo]
  events: [EVT-Proyecto-Creado, EVT-Proyecto-Completado]
  commands: [CMD-CrearProyecto]
  queries: [QRY-ObtenerProyecto]

context-map:
  upstream: [core, billing]
  downstream: [analytics]

boundaries:
  anti-corruption:
    - external: "billing::Factura"
      internal: FacturaPendiente
      notes: "Solo nos interesa el estado de pago"
```

### Campos del Manifest

| Seccion | Campo | Requerido | Descripcion |
|---------|-------|-----------|-------------|
| `domain` | `id` | Si | Identificador (kebab-case) |
| `domain` | `name` | Si | Nombre legible |
| `domain` | `description` | Si | Proposito y alcance |
| `domain` | `status` | Si | Estado del dominio |
| `dependencies` | `domain` | - | ID del dominio dependencia |
| `dependencies` | `type` | - | `required`, `optional`, `event-only` |
| `exports` | - | - | Artefactos publicos |

## Wiki-Links Cross-Domain

```markdown
# Mismo dominio (busca local -> core)
[[Proyecto]]

# Dominio explicito
[[core::Usuario]]
[[billing::Factura]]

# Elemento compartido
[[_shared::XP-AUDIT-001]]
```

## Politicas Compartidas (`_shared/policies/`)

### Nombrado

Patron: `XP-NOMBRE-NNN.md` (Cross-Policy)

Ejemplos:
- `XP-LOGGING-001.md`
- `XP-AUDIT-001.md`
- `XP-SECURITY-001.md`

### Estructura

```markdown
---
id: XP-LOGGING-001
kind: cross-policy
title: Politica de Logging
scope: all-domains
status: approved
---

# XP-LOGGING-001: Politica de Logging

## Scope

Aplica a TODOS los dominios.

## Statement

Todo comando y query debe loguear entrada y salida con correlation ID.

## Requirements

1. Log level INFO para operaciones exitosas
2. Log level ERROR para fallos
3. Incluir `correlationId` en todos los logs
4. No loguear datos sensibles (passwords, tokens)

## Compliance

Verificado por: hook pre-commit, auditoria mensual
```

## Domain Map (`_shared/domain-map.md`)

```markdown
# Mapa de Dominios

## Diagrama

```mermaid
graph TD
    subgraph Foundation
        CORE[core]
    end

    subgraph Business
        AUTH[auth]
        BILLING[billing]
        PROJECTS[projects]
    end

    AUTH --> CORE
    BILLING --> CORE
    PROJECTS --> CORE
    PROJECTS -.-> BILLING
```

## Matriz de Dependencias

| Dominio | Depende de | Exporta a |
|---------|------------|-----------|
| core | - | auth, billing, projects |
| auth | core | projects |
| projects | core, billing | analytics |
```

## Reglas de Dependencia

| Regla | Descripcion |
|-------|-------------|
| Core fundacional | `core` no puede depender de ningun otro dominio |
| Explicitas | Toda dependencia en `_manifest.yaml` |
| Sin ciclos | A -> B -> A prohibido |
| Anti-corruption | Traducciones para conceptos externos |

## Niveles de Dominio

```
+---------------------------------------------+
|  LEAF (sin dependientes)                    |
|  projects, analytics                        |
+---------------------------------------------+
|  MIDDLE (bidireccional)                     |
|  auth, billing                              |
+---------------------------------------------+
|  CORE (fundacional)                         |
|  core                                       |
+---------------------------------------------+
```
