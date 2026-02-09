---
title: "Referencia: Frontmatter por Tipo de Artefacto"
audience: [pm, designer, dev, qa, tech-lead]
type: reference
reading_time: "consulta"
status: draft
---

# Referencia: Frontmatter por Tipo de Artefacto

> Para: Escritores de specs — Tipo: Referencia — Uso: Consulta rápida

Este documento define el esquema YAML del frontmatter para cada tipo de artefacto KDD. Consulta la sección correspondiente al tipo que vas a crear. Cada esquema incluye campos requeridos, opcionales y valores válidos.

---

## Estructura general

Todo artefacto KDD empieza con un bloque YAML entre `---`. El orden de campos es fijo:

```yaml
---
id: {identificador}        # Siempre primero
kind: {tipo}               # Siempre segundo
status: draft              # Siempre presente
{campos específicos}       # Campos del tipo
tags: []                   # Siempre al final (opcional)
---
```

### Campos comunes

Estos campos existen en todos los artefactos:

| Campo | Tipo | Valores válidos | Obligatorio |
|---|---|---|---|
| `id` | string | Varía por tipo (ver tabla de cada artefacto) | Sí* |
| `kind` | string | Ver sección de cada tipo | Sí |
| `status` | enum | `draft` \| `review` \| `approved` \| `deprecated` | Sí |
| `tags` | array | Lista de strings para categorización | No |

> *El campo `id` es opcional solo en Entity, UI View y UI Component (toma el nombre del archivo por defecto).

### Estados del ciclo de vida

| Estado | Significado |
|---|---|
| `draft` | Work in progress, no es fuente de verdad |
| `review` | Pendiente de aprobación |
| `approved` | Fuente de verdad oficial |
| `deprecated` | Obsoleto, debe linkar al reemplazo |

---

## Entity

```yaml
---
id: "{EntityName}"       # Opcional, default: nombre del archivo
kind: entity             # Requerido
aliases: []              # Opcional: nombres alternativos
status: draft            # Requerido
---
```

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | string | No | Nombre de la entidad. Default: nombre del archivo sin `.md` |
| `kind` | literal | Sí | Siempre `entity` |
| `aliases` | array | No | Lista de nombres alternativos para wiki-links |
| `status` | enum | Sí | Estado del ciclo de vida |

**Ejemplo:**

```yaml
---
id: "Proyecto"
kind: entity
aliases: ["Proyecto", "Desafío"]
status: approved
---
```

---

## Event (EVT)

```yaml
---
id: EVT-{Entity}-{Action}  # Requerido, debe coincidir con nombre del archivo
kind: event                # Requerido
title: "{Entity} {Action}" # Requerido
status: draft              # Requerido
---
```

| Campo | Tipo | Obligatorio | Patrón/Valores | Descripción |
|---|---|---|---|---|
| `id` | string | Sí | `EVT-{Entity}-{Action}` | Identificador del evento |
| `kind` | literal | Sí | `event` | Tipo de artefacto |
| `title` | string | Sí | - | Nombre legible del evento |
| `status` | enum | Sí | `draft` \| `review` \| `approved` \| `deprecated` | Estado |

**Ejemplo:**

```yaml
---
id: EVT-Proyecto-Creado
kind: event
title: "Proyecto Creado"
status: approved
---
```

---

## Business Rule (BR)

```yaml
---
id: BR-{ENTITY}-NNN      # Requerido, e.g., BR-PROYECTO-005
kind: business-rule      # Requerido
title: RuleName          # Requerido
entity: EntityName       # Requerido: entidad principal afectada
category: validation     # Requerido
severity: medium         # Requerido
status: draft            # Requerido
---
```

| Campo | Tipo | Obligatorio | Valores válidos | Descripción |
|---|---|---|---|---|
| `id` | string | Sí | `BR-{ENTITY}-NNN` | Identificador, `{ENTITY}` en MAYÚSCULAS |
| `kind` | literal | Sí | `business-rule` | Tipo de artefacto |
| `title` | string | Sí | - | Nombre descriptivo de la regla |
| `entity` | string | Sí | Nombre de entidad (PascalCase) | Entidad principal afectada |
| `category` | enum | Sí | `validation` \| `state` \| `limit` \| `security` | Tipo de regla |
| `severity` | enum | Sí | `low` \| `medium` \| `high` \| `critical` | Criticidad del incumplimiento |
| `status` | enum | Sí | `draft` \| `review` \| `approved` \| `deprecated` | Estado |

**Ejemplo:**

```yaml
---
id: BR-PROYECTO-005
kind: business-rule
title: Transición a terminado
entity: Proyecto
category: state
severity: high
status: approved
---
```

---

## Business Policy (BP)

```yaml
---
id: BP-{TOPIC}-NNN       # Requerido, e.g., BP-PUNTO-001
kind: business-policy    # Requerido
title: PolicyName        # Requerido
entity: EntityName       # Opcional: entidad principal afectada
category: business       # Requerido
severity: medium         # Requerido
status: draft            # Requerido
---
```

| Campo | Tipo | Obligatorio | Valores válidos | Descripción |
|---|---|---|---|---|
| `id` | string | Sí | `BP-{TOPIC}-NNN` | Identificador, `{TOPIC}` en MAYÚSCULAS |
| `kind` | literal | Sí | `business-policy` | Tipo de artefacto |
| `title` | string | Sí | - | Nombre descriptivo de la política |
| `entity` | string | No | Nombre de entidad (PascalCase) | Entidad principal afectada (si aplica) |
| `category` | enum | Sí | `business` \| `compliance` \| `limit` | Tipo de política |
| `severity` | enum | Sí | `low` \| `medium` \| `high` \| `critical` | Criticidad del incumplimiento |
| `status` | enum | Sí | `draft` \| `review` \| `approved` \| `deprecated` | Estado |

**Ejemplo:**

```yaml
---
id: BP-PUNTO-001
kind: business-policy
title: Descuento por puntos en bulk
entity: Usuario
category: business
severity: medium
status: approved
---
```

---

## Cross-Policy (XP)

```yaml
---
id: XP-{TOPIC}-NNN       # Requerido, e.g., XP-PUNTOS-001
kind: cross-policy       # Requerido
title: PolicyName        # Requerido
status: draft            # Requerido
---
```

| Campo | Tipo | Obligatorio | Valores válidos | Descripción |
|---|---|---|---|---|
| `id` | string | Sí | `XP-{TOPIC}-NNN` | Identificador, `{TOPIC}` en MAYÚSCULAS |
| `kind` | literal | Sí | `cross-policy` | Tipo de artefacto |
| `title` | string | Sí | - | Nombre descriptivo de la política transversal |
| `status` | enum | Sí | `draft` \| `review` \| `approved` \| `deprecated` | Estado |

**Ejemplo:**

```yaml
---
id: XP-PUNTOS-001
kind: cross-policy
title: Descuento de puntos en comandos
status: approved
---
```

---

## Command (CMD)

```yaml
---
id: CMD-NNN              # Requerido, pattern: ^CMD-\d{3}$
kind: command            # Requerido
title: CommandName       # Requerido
status: draft            # Requerido
billable: false          # Opcional: if true, aplica XP-PUNTOS-001
credit-cost: 0           # Opcional: puntos consumidos (requiere billable: true)
tags: []                 # Opcional: ej. [core, destructive]
---
```

| Campo | Tipo | Obligatorio | Patrón/Valores | Descripción |
|---|---|---|---|---|
| `id` | string | Sí | `^CMD-\d{3}$` | Identificador numérico de 3 dígitos |
| `kind` | literal | Sí | `command` | Tipo de artefacto |
| `title` | string | Sí | - | Nombre descriptivo del comando |
| `status` | enum | Sí | `draft` \| `review` \| `approved` \| `deprecated` | Estado |
| `billable` | boolean | No | `true` \| `false` | Si consume puntos del usuario |
| `credit-cost` | number | No | Entero ≥ 0 | Puntos consumidos. Requiere `billable: true` |
| `tags` | array | No | ej. `[core, destructive]` | Categorización adicional |

**Ejemplo:**

```yaml
---
id: CMD-024
kind: command
title: GeneratePersonaProfile
status: approved
billable: true
credit-cost: 1
tags: [ai, persona]
---
```

---

## Query (QRY)

```yaml
---
id: QRY-NNN              # Requerido, pattern: ^QRY-\d{3}$
kind: query              # Requerido
title: QueryName         # Requerido
status: draft            # Requerido
---
```

| Campo | Tipo | Obligatorio | Patrón/Valores | Descripción |
|---|---|---|---|---|
| `id` | string | Sí | `^QRY-\d{3}$` | Identificador numérico de 3 dígitos |
| `kind` | literal | Sí | `query` | Tipo de artefacto |
| `title` | string | Sí | - | Nombre descriptivo de la consulta |
| `status` | enum | Sí | `draft` \| `review` \| `approved` \| `deprecated` | Estado |

**Ejemplo:**

```yaml
---
id: QRY-007
kind: query
title: GetActiveProyectos
status: approved
---
```

---

## Use Case (UC)

```yaml
---
id: UC-NNN               # Requerido, pattern: ^UC-\d{3}$
kind: use-case           # Requerido
title: UseCaseName       # Requerido
version: 1               # Número, default: 1
status: draft            # Requerido
actor: ActorName         # Requerido
---
```

| Campo | Tipo | Obligatorio | Patrón/Valores | Descripción |
|---|---|---|---|---|
| `id` | string | Sí | `^UC-\d{3}$` | Identificador numérico de 3 dígitos |
| `kind` | literal | Sí | `use-case` | Tipo de artefacto |
| `title` | string | Sí | - | Nombre descriptivo del caso de uso |
| `version` | number | No | Entero ≥ 1 | Versión del UC (default: 1) |
| `status` | enum | Sí | `draft` \| `review` \| `approved` \| `deprecated` | Estado |
| `actor` | string | Sí | Nombre del actor principal | Quién realiza el caso de uso |

**Ejemplo:**

```yaml
---
id: UC-001
kind: use-case
title: Crear Proyecto
version: 2
status: approved
actor: Usuario
---
```

---

## UI View

```yaml
---
id: UI-{Name}            # Opcional, default: nombre del archivo
kind: ui-view            # Requerido
title: ViewName          # Requerido
status: draft            # Requerido
links:
  use-cases: []          # Opcional: UCs que esta vista dispara
  components: []         # Opcional: Componentes UI usados
---
```

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | string | No | Identificador. Default: nombre del archivo sin `.md` |
| `kind` | literal | Sí | Siempre `ui-view` |
| `title` | string | Sí | Nombre legible de la vista |
| `status` | enum | Sí | Estado del ciclo de vida |
| `links.use-cases` | array | No | Lista de IDs de Use Cases disparados desde esta vista |
| `links.components` | array | No | Lista de componentes UI reutilizables usados |

**Ejemplo:**

```yaml
---
id: UI-ProyectoForm
kind: ui-view
title: Formulario de Creación de Proyecto
status: approved
links:
  use-cases: [UC-001]
  components: [UI-MarkdownEditor, UI-PersonaSelector]
---
```

---

## UI Component

```yaml
---
id: UI-{Name}            # Opcional, default: nombre del archivo
kind: ui-component       # Requerido
title: ComponentName     # Requerido
status: draft            # Requerido
links:
  entities: []           # Opcional: Entidades de dominio usadas
  use-cases: []          # Opcional: UCs que este componente soporta
---
```

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | string | No | Identificador. Default: nombre del archivo sin `.md` |
| `kind` | literal | Sí | Siempre `ui-component` |
| `title` | string | Sí | Nombre legible del componente |
| `status` | enum | Sí | Estado del ciclo de vida |
| `links.entities` | array | No | Entidades de dominio que el componente representa o manipula |
| `links.use-cases` | array | No | Use Cases en los que participa este componente |

**Ejemplo:**

```yaml
---
id: UI-MarkdownEditor
kind: ui-component
title: Editor de Markdown con Preview
status: approved
links:
  entities: [Proyecto]
  use-cases: [UC-001, UC-004]
---
```

---

## Requirement (REQ)

```yaml
---
id: REQ-NNN              # Requerido, pattern: ^REQ-\d{3}$
kind: requirement        # Requerido
title: RequirementName   # Requerido
status: draft            # Requerido
priority: medium         # Requerido
source: PRD              # Opcional: de dónde viene este requisito
---
```

| Campo | Tipo | Obligatorio | Patrón/Valores | Descripción |
|---|---|---|---|---|
| `id` | string | Sí | `^REQ-\d{3}$` o `^REQ-\d{3}\.\d+$` | Identificador numérico. Subrequisitos: `REQ-001.2` |
| `kind` | literal | Sí | `requirement` | Tipo de artefacto |
| `title` | string | Sí | - | Nombre descriptivo del requisito |
| `status` | enum | Sí | `draft` \| `review` \| `approved` \| `deprecated` | Estado |
| `priority` | enum | Sí | `low` \| `medium` \| `high` \| `critical` | Prioridad de implementación |
| `source` | string | No | ej. `PRD`, `Stakeholder` | Origen del requisito |

**Ejemplo:**

```yaml
---
id: REQ-012
kind: requirement
title: Validar título de Proyecto
status: approved
priority: high
source: PRD
---
```

---

## Objective (OBJ)

```yaml
---
id: OBJ-NNN              # Requerido, pattern: ^OBJ-\d{3}$
kind: objective          # Requerido
title: ObjectiveName     # Requerido
actor: ActorName         # Requerido
status: draft            # Requerido
---
```

| Campo | Tipo | Obligatorio | Patrón/Valores | Descripción |
|---|---|---|---|---|
| `id` | string | Sí | `^OBJ-\d{3}$` | Identificador numérico de 3 dígitos |
| `kind` | literal | Sí | `objective` | Tipo de artefacto |
| `title` | string | Sí | - | Nombre descriptivo del objetivo |
| `actor` | string | Sí | Nombre del actor | Quién tiene este objetivo (ej. Usuario, Admin) |
| `status` | enum | Sí | `draft` \| `review` \| `approved` \| `deprecated` | Estado |

**Ejemplo:**

```yaml
---
id: OBJ-003
kind: objective
title: Analizar problema con perspectivas múltiples
actor: Usuario
status: approved
---
```

---

## Process (PROC)

```yaml
---
id: PROC-NNN             # Requerido, pattern: ^PROC-\d{3}$
kind: process            # Requerido
title: ProcessName       # Requerido
status: draft            # Requerido
---
```

| Campo | Tipo | Obligatorio | Patrón/Valores | Descripción |
|---|---|---|---|---|
| `id` | string | Sí | `^PROC-\d{3}$` | Identificador numérico de 3 dígitos |
| `kind` | literal | Sí | `process` | Tipo de artefacto |
| `title` | string | Sí | - | Nombre descriptivo del proceso |
| `status` | enum | Sí | `draft` \| `review` \| `approved` \| `deprecated` | Estado |

**Ejemplo:**

```yaml
---
id: PROC-001
kind: process
title: Ciclo de Análisis con gestión de proyectos
status: approved
---
```

---

## Release (REL)

```yaml
---
id: REL-NNN              # Requerido, pattern: ^REL-\d{3}$
kind: release            # Requerido
title: ReleaseName       # Requerido
status: draft            # Requerido
owner: OwnerName         # Requerido
target_date: YYYY-MM-DD  # Opcional
tags: []                 # Opcional
---
```

| Campo | Tipo | Obligatorio | Patrón/Valores | Descripción |
|---|---|---|---|---|
| `id` | string | Sí | `^REL-\d{3}$` | Identificador numérico de 3 dígitos |
| `kind` | literal | Sí | `release` | Tipo de artefacto |
| `title` | string | Sí | - | Nombre descriptivo del release |
| `status` | enum | Sí | `draft` \| `review` \| `approved` \| `deprecated` | Estado |
| `owner` | string | Sí | Nombre o rol | Responsable del release |
| `target_date` | date | No | `YYYY-MM-DD` | Fecha objetivo de entrega |
| `tags` | array | No | ej. `[release, q1-2025]` | Categorización adicional |

**Ejemplo:**

```yaml
---
id: REL-003
kind: release
title: Personalization & AI Features
status: approved
owner: Product Team
target_date: 2025-03-31
tags: [release, ai]
---
```

---

## Value Unit (UV)

```yaml
---
id: UV-NNN               # Requerido, pattern: ^UV-\d{3}$
kind: value-unit         # Requerido
title: UnitName          # Requerido
status: draft            # Requerido
owner: OwnerName         # Requerido
release: REL-NNN         # Opcional: release al que pertenece
tags: []                 # Opcional
---
```

| Campo | Tipo | Obligatorio | Patrón/Valores | Descripción |
|---|---|---|---|---|
| `id` | string | Sí | `^UV-\d{3}$` | Identificador numérico de 3 dígitos |
| `kind` | literal | Sí | `value-unit` | Tipo de artefacto |
| `title` | string | Sí | - | Nombre descriptivo de la unidad |
| `status` | enum | Sí | `draft` \| `review` \| `approved` \| `deprecated` | Estado |
| `owner` | string | Sí | Nombre o rol | Responsable de la entrega |
| `release` | string | No | `REL-NNN` | Release al que pertenece (si aplica) |
| `tags` | array | No | ej. `[value-unit, mvp]` | Categorización adicional |

**Ejemplo:**

```yaml
---
id: UV-002
kind: value-unit
title: AI-Generated Persona Profiles
status: approved
owner: Dev Team
release: REL-003
tags: [value-unit, ai]
---
```

---

## Architecture Decision Record (ADR)

```yaml
---
id: ADR-NNNN             # Requerido, pattern: ^ADR-\d{4}$
kind: adr                # Requerido
status: proposed         # Requerido
supersedes: []           # Opcional: ADRs reemplazados por este
superseded_by: ADR-XXXX  # Opcional: ADR que reemplaza a este
date: YYYY-MM-DD         # Opcional
deciders: []             # Opcional: lista de tomadores de decisión
---
```

| Campo | Tipo | Obligatorio | Patrón/Valores | Descripción |
|---|---|---|---|---|
| `id` | string | Sí | `^ADR-\d{4}$` | Identificador numérico de 4 dígitos |
| `kind` | literal | Sí | `adr` | Tipo de artefacto |
| `status` | enum | Sí | `draft` \| `proposed` \| `approved` \| `deprecated` \| `superseded` | Estado |
| `supersedes` | array | No | Lista de `ADR-XXXX` | ADRs que este reemplaza |
| `superseded_by` | string | No | `ADR-XXXX` | ADR que reemplaza a este (solo si `status: superseded`) |
| `date` | date | No | `YYYY-MM-DD` | Fecha de la decisión |
| `deciders` | array | No | Lista de nombres | Quiénes tomaron la decisión |

**Ejemplo:**

```yaml
---
id: ADR-0015
kind: adr
status: approved
supersedes: [ADR-0008]
date: 2025-01-15
deciders: [Tech Lead, Arquitecto]
---
```

---

## Product Requirements Document (PRD)

```yaml
---
id: PRD-Name             # Opcional, pattern: ^PRD-.+
kind: prd                # Requerido
status: proposed         # Requerido
owner: TeamName          # Opcional
stakeholders: []         # Opcional
related: []              # Opcional: UC-*, REQ-*, etc.
success_metrics: []      # Opcional
release_criteria: []     # Opcional
---
```

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | string | No | Identificador libre. Pattern sugerido: `PRD-{EpicName}` |
| `kind` | literal | Sí | `prd` |
| `status` | enum | Sí | `draft` \| `proposed` \| `approved` \| `deprecated` |
| `owner` | string | No | Equipo o persona responsable |
| `stakeholders` | array | No | Lista de stakeholders |
| `related` | array | No | Artefactos relacionados (UC-*, REQ-*, etc.) |
| `success_metrics` | array | No | Métricas de éxito |
| `release_criteria` | array | No | Criterios para lanzar |

**Ejemplo:**

```yaml
---
id: PRD-AnalyticsDashboard
kind: prd
status: approved
owner: Product Team
stakeholders: [CEO, Head of Engineering]
related: [UC-015, UC-016, REQ-050]
success_metrics: ["Adoption > 70%", "Load time < 2s"]
release_criteria: ["All UCs passing", "Security audit complete"]
---
```

---

## User Story (STORY)

```yaml
---
id: STORY-NNN            # Opcional, pattern: ^(US|STORY)-\d+
kind: story              # Requerido
status: proposed         # Requerido
related: []              # Opcional: UCs relacionados
---
```

| Campo | Tipo | Obligatorio | Patrón/Valores | Descripción |
|---|---|---|---|---|
| `id` | string | No | `^(US\|STORY)-\d+` | Identificador opcional |
| `kind` | literal | Sí | `story` | Tipo de artefacto |
| `status` | enum | Sí | `draft` \| `proposed` \| `approved` \| `deprecated` | Estado |
| `related` | array | No | Lista de `UC-NNN` | Use Cases relacionados |

**Ejemplo:**

```yaml
---
id: STORY-042
kind: story
status: approved
related: [UC-001, UC-004]
---
```

---

## Validación

Ejecuta la validación para verificar el frontmatter de todos los artefactos:

```bash
bun run validate:specs
```

El validador verifica:

- Esquema YAML correcto por tipo.
- Campos requeridos presentes.
- Valores dentro del enum válido.
- Patrones de ID correctos.
- Links rotos (solo en `status: approved`).

---

## Referencia rápida: Patrones de ID

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Entity | Libre (PascalCase) | `Proyecto`, `Miembro` |
| Event | `EVT-{Entity}-{Action}` | `EVT-Proyecto-Creado` |
| Business Rule | `BR-{ENTITY}-NNN` | `BR-PROYECTO-005` |
| Business Policy | `BP-{TOPIC}-NNN` | `BP-PUNTO-001` |
| Cross-Policy | `XP-{TOPIC}-NNN` | `XP-PUNTOS-001` |
| Command | `CMD-NNN` | `CMD-024` |
| Query | `QRY-NNN` | `QRY-007` |
| Use Case | `UC-NNN` | `UC-001` |
| UI View | `UI-{Name}` | `UI-ProyectoForm` |
| UI Component | `UI-{Name}` | `UI-MarkdownEditor` |
| Requirement | `REQ-NNN` o `REQ-NNN.M` | `REQ-012`, `REQ-012.3` |
| Objective | `OBJ-NNN` | `OBJ-003` |
| Process | `PROC-NNN` | `PROC-001` |
| Release | `REL-NNN` | `REL-003` |
| Value Unit | `UV-NNN` | `UV-002` |
| ADR | `ADR-NNNN` | `ADR-0015` |
| PRD | `PRD-{Name}` | `PRD-AnalyticsDashboard` |
| Story | `STORY-NNN` o `US-NNN` | `STORY-042` |

> `NNN` = número de 3 dígitos con padding (001, 012, 105)
> `NNNN` = número de 4 dígitos con padding (0001, 0015)
> `{ENTITY}`, `{TOPIC}` = TODO EN MAYÚSCULAS
> `{Name}` = PascalCase
