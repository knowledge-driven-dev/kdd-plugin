---
title: "Índice de Templates KDD"
audience: [pm, designer, dev, qa, tech-lead]
type: reference
reading_time: "consulta"
status: draft
---

# Índice de Templates KDD

> Para: Todos — Tipo: Referencia — Uso: Consulta puntual

Este documento indexa todos los templates de artefactos disponibles en KDD. Cada template define el esqueleto de un tipo de especificación con sus campos requeridos, opcionales y secciones esperadas. Consulta el template correspondiente antes de crear un artefacto nuevo.

---

## Cómo usar este índice

Ubica el tipo de artefacto que necesitas crear. Copia el template desde la ubicación indicada. Completa los campos requeridos y las secciones marcadas como `<!-- required -->`. Consulta el template original para ver comentarios y ejemplos inline.

---

## Templates por capa

### Capa 0: Requirements

#### ADR (Architecture Decision Record)

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/adr.template.md` |
| **Patrón de ID** | `ADR-NNNN` (4 dígitos) |
| **Quién lo crea** | Tech Lead, Arquitecto |
| **Propósito** | Documenta una decisión arquitectónica con contexto, opciones consideradas y consecuencias |
| **Campos clave** | `id`, `kind: adr`, `status`, `supersedes`, `superseded_by`, `deciders` |
| **Secciones requeridas** | Context, Decision, Consequences |

#### Idea

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/idea.template.md` |
| **Patrón de ID** | Sin ID fijo |
| **Quién lo crea** | PM, cualquier stakeholder |
| **Propósito** | Captura una idea en estado inicial, antes de convertirse en OBJ o REQ |
| **Campos clave** | `kind: idea`, `status: draft` |
| **Secciones requeridas** | Description |

#### NFR (Non-Functional Requirement)

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/nfr.template.md` |
| **Patrón de ID** | `NFR-NNN` |
| **Quién lo crea** | PM, Tech Lead |
| **Propósito** | Define requisitos no funcionales como performance, seguridad, escalabilidad |
| **Campos clave** | `id`, `kind: nfr`, `category`, `severity`, `status` |
| **Secciones requeridas** | Description, Metric, Validation |

#### PRD (Product Requirements Document)

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/prd.template.md` |
| **Patrón de ID** | Sin ID fijo |
| **Quién lo crea** | PM |
| **Propósito** | Documento de alto nivel que agrupa múltiples objetivos y requisitos |
| **Campos clave** | `kind: prd`, `status`, `release` |
| **Secciones requeridas** | Executive Summary, Goals, Scope |

#### Release

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/release.template.md` |
| **Patrón de ID** | `REL-NNN` |
| **Quién lo crea** | PM, Tech Lead |
| **Propósito** | Define el alcance y roadmap de un release |
| **Campos clave** | `id`, `kind: release`, `status`, `target-date` |
| **Secciones requeridas** | Scope, Timeline |

#### Requirement

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/requirement.template.md` |
| **Patrón de ID** | `REQ-NNN` o `REQ-NNN.M` (subrequisitos) |
| **Quién lo crea** | PM, QA |
| **Propósito** | Especifica un requisito formal con sintaxis EARS |
| **Campos clave** | `id`, `kind: requirement`, `category`, `status` |
| **Secciones requeridas** | Statement, Rationale, Acceptance Criteria |

#### Story (User Story)

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/story.template.md` |
| **Patrón de ID** | Sin ID fijo (opcional) |
| **Quién lo crea** | PM |
| **Propósito** | Captura una user story en formato As a... I want... So that... |
| **Campos clave** | `kind: story`, `status`, `actor` |
| **Secciones requeridas** | Story, Acceptance Criteria |

#### Value Unit

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/value-unit.template.md` |
| **Patrón de ID** | `UV-NNN` |
| **Quién lo crea** | Tech Lead, PM |
| **Propósito** | Unidad de entrega end-to-end con tracking de implementación |
| **Campos clave** | `id`, `kind: value-unit`, `status`, `owner`, `release` |
| **Secciones requeridas** | Objective, Scope (Implemented/Pending/Out of scope), Inputs, Outputs, Exit Criteria |

---

### Capa 1: Domain

#### Entity

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/entity.template.md` |
| **Patrón de ID** | Sin ID numérico. El nombre del archivo es el nombre de la entidad (ej: `Proyecto.md`) |
| **Quién lo crea** | Dev, PM |
| **Propósito** | Define una entidad de dominio, rol o sistema externo |
| **Campos clave** | `kind: entity|role|system`, `aliases` |
| **Secciones requeridas** | Description, Attributes |

> **Nota**: Para sistemas externos, el nombre SIEMPRE va en MAYÚSCULAS (ej: `ORACLE.md`, `SAP.md`).

#### Business Rule

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/rule.template.md` |
| **Patrón de ID** | `BR-ENTIDAD-NNN` o `BP-ENTIDAD-NNN` (Business Policy) |
| **Quién lo crea** | PM, Dev |
| **Propósito** | Define una regla de negocio invariable o política configurable |
| **Campos clave** | `id`, `kind: business-rule|business-policy`, `entity`, `category`, `severity`, `status` |
| **Secciones requeridas** | Statement, Rationale, When Applies, Violation Behavior, Examples (Valid/Invalid) |

#### Event

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/event.template.md` |
| **Patrón de ID** | `EVT-Entidad-Accion` (ej: `EVT-Proyecto-Creado`) |
| **Quién lo crea** | Dev |
| **Propósito** | Define un evento de dominio que se emite cuando ocurre algo significativo |
| **Campos clave** | `kind: event` |
| **Secciones requeridas** | Description, Payload, Example |

---

### Capa 2: Application

#### Use Case

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/use-case.template.md` |
| **Patrón de ID** | `UC-NNN` |
| **Quién lo crea** | PM, Diseñador |
| **Propósito** | Describe una interacción usuario-sistema en formato Cockburn-lite |
| **Campos clave** | `id`, `kind: use-case`, `actor`, `status`, `version` |
| **Secciones requeridas** | Description, Actors, Preconditions, Main Flow, Postconditions (Success/Failure) |

#### Command

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/command.template.md` |
| **Patrón de ID** | `CMD-NNN` |
| **Quién lo crea** | Dev |
| **Propósito** | Define una operación que modifica el estado del sistema (CQRS write) |
| **Campos clave** | `id`, `kind: command`, `title`, `status`, `billable`, `credit-cost` |
| **Secciones requeridas** | Purpose, Input, Preconditions, Postconditions, Possible Errors |

#### Query

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/query.template.md` |
| **Patrón de ID** | `QRY-NNN` |
| **Quién lo crea** | Dev |
| **Propósito** | Define una operación de solo lectura (CQRS read) |
| **Campos clave** | `id`, `kind: query`, `title`, `status` |
| **Secciones requeridas** | Purpose, Input, Output, Authorization, Possible Errors |

#### Process

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/process.template.md` |
| **Patrón de ID** | `PRC-NNN` |
| **Quién lo crea** | PM, Dev |
| **Propósito** | Define un proceso de negocio que orquesta múltiples comandos/eventos |
| **Campos clave** | `id`, `kind: process`, `status` |
| **Secciones requeridas** | Description, Steps, Participants |

#### Cross-Policy

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/cross-policy.template.md` |
| **Patrón de ID** | `XP-CONCEPTO-NNN` (ej: `XP-CREDITS-001`) |
| **Quién lo crea** | Dev, Tech Lead |
| **Propósito** | Define una política transversal que aplica a múltiples comandos/entidades |
| **Campos clave** | `id`, `kind: cross-policy`, `status`, `applies-to` |
| **Secciones requeridas** | Description, Scope, Rules, Affected Operations |

---

### Capa 3: Experience

#### UI View

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/ui-view.template.md` |
| **Patrón de ID** | Sin ID fijo. Nombre del archivo es el nombre de la vista |
| **Quién lo crea** | Diseñador |
| **Propósito** | Especifica una pantalla completa con layout, estados y navegación |
| **Campos clave** | `kind: ui-view`, `status`, `links: {entities, use-cases, components}` |
| **Secciones requeridas** | Propósito, Navegación, Layout, Componentes, Datos, Estados (Cargando/Vacío/Error), Comportamiento, Conexiones |

#### UI Component

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/ui-component.template.md` |
| **Patrón de ID** | Sin ID fijo. Nombre del archivo es el nombre del componente |
| **Quién lo crea** | Diseñador |
| **Propósito** | Especifica un componente reutilizable con props, estados y variantes |
| **Campos clave** | `kind: ui-component`, `status`, `category` |
| **Secciones requeridas** | Propósito, Variantes, Props/Inputs, Estados, Comportamiento |

#### UI Flow

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/ui-flow.template.md` |
| **Patrón de ID** | Sin ID fijo |
| **Quién lo crea** | Diseñador |
| **Propósito** | Especifica una secuencia de pantallas con transiciones y decisiones |
| **Campos clave** | `kind: ui-flow`, `status`, `trigger`, `outcome` |
| **Secciones requeridas** | Propósito, Punto de Entrada, Secuencia, Conexiones |

---

## Templates de soporte

### Manifest

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/_manifest.template.yaml` |
| **Propósito** | Archivo YAML que indexa todos los artefactos de una capa o feature |
| **Cuándo usarlo** | Al crear una nueva capa o feature para facilitar navegación y validación |
| **Campos clave** | `feature`, `artifacts`, `dependencies` |

### Schema

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/_schema.md` |
| **Propósito** | Documentación del esquema de metadatos para templates |
| **Cuándo usarlo** | Consulta de referencia sobre anotaciones `@type`, `@required`, `@pattern` |

### Implementation Charter

| Campo | Valor |
|---|---|
| **Ubicación** | `/mnt/c/workspaces/taskflow/kdd/templates/implementation-charter.template.md` |
| **Propósito** | Plan de implementación para un feature o release |
| **Quién lo crea** | Tech Lead |
| **Campos clave** | `kind: implementation-charter`, `release`, `status` |
| **Secciones requeridas** | Scope, Phases, Team, Timeline |

---

## Convenciones de los templates

Todos los templates siguen estas convenciones:

### Comentarios inline

Los templates incluyen comentarios HTML que indican:

```markdown
## Section Name <!-- required -->
<!-- @description: Explanation of what goes here -->
```

- `<!-- required -->`: Sección obligatoria. El artefacto está incompleto si falta esta sección.
- `<!-- optional -->`: Sección opcional. Incluir solo si aporta valor.
- `<!-- expects: TYPE -->`: Indica el formato esperado (list, table, json, yaml, mermaid, gherkin).
- `<!-- alias: NAME -->`: Nombres alternativos aceptados para la sección.

### Frontmatter

Cada template define su frontmatter con anotaciones de validación:

```yaml
id: BR-ENTITY-NNN      # @required @pattern: ^BR-[A-Z]+-\d{3}$
kind: business-rule    # @required @literal: business-rule
status: draft          # @enum: draft|review|approved @default: draft
```

- `@required`: Campo obligatorio.
- `@optional`: Campo opcional.
- `@pattern`: Expresión regular que debe cumplir el valor.
- `@enum`: Lista de valores válidos separados por `|`.
- `@literal`: Valor fijo que no debe cambiar.
- `@default`: Valor por defecto si se omite.
- `@type`: Tipo del campo (string, number, date, array).

### Secciones con ejemplos

Los templates incluyen ejemplos inline con datos reales del proyecto TaskFlow (Proyecto, Tarea, Miembro). Reemplaza los ejemplos con tu contenido específico, pero mantén el mismo formato.

### Wiki-links

Los templates usan wiki-links para referenciar otras especificaciones:

```markdown
[[Entidad]]
[[UC-001-Crear-Proyecto]]
[[BR-PROYECTO-005]]
```

Completa estos links con las entidades y artefactos reales de tu spec.

---

## Flujo de trabajo con templates

### Paso 1: Selecciona el template

Consulta la tabla de arriba para encontrar el template que necesitas. Verifica quién lo crea y qué capa le corresponde.

### Paso 2: Copia el template

Copia el archivo template desde `kdd/templates/` a la ubicación correcta en `specs/`:

| Tipo | Ubicación destino |
|---|---|
| ADR | `specs/00-requirements/architecture/decisions/` |
| Entity | `specs/01-domain/entities/` |
| Business Rule | `specs/01-domain/rules/` |
| Event | `specs/01-domain/events/` |
| Use Case | `specs/02-application/behavior/use-cases/` |
| Command | `specs/02-application/behavior/commands/` |
| Query | `specs/02-application/behavior/queries/` |
| Process | `specs/02-application/behavior/processes/` |
| UI View | `specs/03-experience/views/` |
| UI Component | `specs/03-experience/components/` |
| Value Unit | `specs/00-requirements/value-units/` |

### Paso 3: Renombra el archivo

Usa el patrón de nombre indicado en el template:

```markdown
# Template dice:
# @file-pattern: ^BR-[A-Z]+-\d{3}\.md$

# Tu archivo debe ser:
BR-PROYECTO-005.md
```

### Paso 4: Completa el frontmatter

Llena todos los campos marcados como `@required`. Usa los valores válidos de los campos `@enum`. Respeta los patrones `@pattern`.

### Paso 5: Completa las secciones requeridas

Busca en el template las secciones marcadas `<!-- required -->`. Completa cada una con tu contenido específico. Elimina las secciones opcionales que no aportan valor.

### Paso 6: Valida el artefacto

Antes de hacer commit, verifica:

- [ ] Todos los campos `@required` en frontmatter están completos
- [ ] Todas las secciones `<!-- required -->` tienen contenido
- [ ] Los IDs siguen el patrón correcto (ej: `BR-PROYECTO-005`, no `br-proyecto-5`)
- [ ] Los wiki-links apuntan a artefactos existentes o planificados
- [ ] El archivo está en la carpeta correcta de `specs/`

---

## Creación de templates nuevos

Si necesitas un tipo de artefacto que no existe, consulta con el Tech Lead antes de crear un template nuevo. Los templates nuevos deben:

1. Seguir las convenciones de frontmatter y comentarios inline.
2. Incluir anotaciones de validación (`@required`, `@pattern`, `@enum`).
3. Especificar el patrón de nombre de archivo con `@file-pattern`.
4. Especificar la ruta de destino con `@path-pattern`.
5. Incluir ejemplos con datos reales del proyecto.
6. Documentarse en este índice tras su aprobación.

---

## Referencias

- Guía de Estilo: `/kdd/docs/STYLE-GUIDE.md`
- Referencia de Artefactos: `/kdd/docs/reference/artifacts.md`
- Referencia de Frontmatter: `/kdd/docs/reference/frontmatter.md`
- Convenciones de Nombrado: `/kdd/docs/reference/naming.md`
