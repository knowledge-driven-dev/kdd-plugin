---
title: "Cheatsheet KDD"
audience: [all]
type: reference
reading_time: "1 min"
status: draft
---

# Cheatsheet KDD

> Para: Todos — Tipo: Referencia rápida — Uso: Imprimir o tener al lado

Referencia de una página con estructura de carpetas, tabla de artefactos, status lifecycle, identificadores y decisiones rápidas. Diseñado para máxima densidad: solo tablas y listas compactas.

---

## Estructura de carpetas

```
/specs
├── 00-requirements/
│   ├── objectives/       # OBJ-NNN-{Nombre}.md
│   ├── releases/         # REL-NNN-{Nombre}.md
│   ├── value-units/      # UV-NNN-{Nombre}.md
│   └── decisions/        # ADR-NNNN-{Título}.md
│
├── 01-domain/
│   ├── entities/         # PascalCase.md (ej: Proyecto.md)
│   ├── events/           # EVT-Entidad-Accion.md
│   └── rules/            # BR-ENTIDAD-NNN.md, BP-TEMA-NNN.md
│
├── 02-behavior/
│   ├── use-cases/        # UC-NNN-{Nombre}.md
│   ├── commands/         # CMD-NNN-{Nombre}.md
│   ├── queries/          # QRY-NNN-{Nombre}.md
│   └── policies/         # XP-TEMA-NNN.md
│
├── 03-experience/
│   └── views/            # UI-{Nombre}.md
│
└── 04-verification/
    └── criteria/         # REQ-NNN-{Nombre}.md
```

---

## Artefactos: Qué, Quién, Dónde

| Tipo | ID | Quién | Ubicación | Cuándo crearlo |
|---|---|---|---|---|
| **Objective** | `OBJ-NNN` | PM | `00-requirements/objectives/` | Usuario quiere lograr algo |
| **Value Unit** | `UV-NNN` | PM/Tech Lead | `00-requirements/value-units/` | Agrupar features para implementar |
| **Release** | `REL-NNN` | PM | `00-requirements/releases/` | Planificar entrega de versión |
| **ADR** | `ADR-NNNN` | Tech Lead | `00-requirements/decisions/` | Decisión arquitectónica importante |
| **Entity** | — | PM/Dev | `01-domain/entities/` | Concepto del negocio con identidad |
| **Event** | `EVT-{Entidad}-{Accion}` | Dev | `01-domain/events/` | Algo significativo ocurrió |
| **Business Rule** | `BR-{ENTIDAD}-NNN` | PM/Dev | `01-domain/rules/` | Restricción invariable del dominio |
| **Business Policy** | `BP-{TEMA}-NNN` | PM/Dev | `01-domain/rules/` | Regla configurable |
| **Use Case** | `UC-NNN` | PM/Designer | `02-behavior/use-cases/` | Flujo usuario-sistema |
| **Command** | `CMD-NNN` | Dev | `02-behavior/commands/` | Acción que modifica estado |
| **Query** | `QRY-NNN` | Dev | `02-behavior/queries/` | Consulta de solo lectura |
| **Cross-Policy** | `XP-{TEMA}-NNN` | Dev/Tech Lead | `02-behavior/policies/` | Política transversal a múltiples comandos |
| **UI View** | `UI-{Nombre}` | Designer | `03-experience/views/` | Pantalla completa |
| **UI Component** | `UI-{Nombre}` | Designer | `03-experience/views/` | Componente reutilizable |
| **Requirement** | `REQ-NNN` | QA/PM | `04-verification/criteria/` | Criterio verificable con EARS |

---

## Status Lifecycle

```
draft → review → approved → deprecated
  ↑        │         │
  └────────┘         │
  (cambios)          │
  ↑                  │
  └──────────────────┘
       (reabrir)
```

| Status | Significado | Puede modificar |
|---|---|---|
| `draft` | Work in progress. Enlaces rotos OK. | Autor |
| `review` | Pendiente aprobación. Contenido completo. | Tech Lead (para aprobar/rechazar) |
| `approved` | **Fuente de verdad oficial**. Implementa a partir de esto. | Tech Lead (para cambios mayores) |
| `deprecated` | Obsoleto. Debe linkar al reemplazo. | Nadie (terminal) |

---

## Identificadores rápidos

| Patrón | Ejemplo | Dónde |
|---|---|---|
| `OBJ-NNN` | `OBJ-001` | Objectives |
| `UV-NNN` | `UV-002` | Value Units |
| `REL-NNN` | `REL-003` | Releases |
| `ADR-NNNN` | `ADR-0015` | ADRs (4 dígitos) |
| `{PascalCase}.md` | `Proyecto.md`, `Miembro.md` | Entities |
| `EVT-{Entidad}-{Accion}` | `EVT-Proyecto-Creado` | Events |
| `BR-{ENTIDAD}-NNN` | `BR-PROYECTO-005` | Business Rules |
| `BP-{TEMA}-NNN` | `BP-PUNTO-001` | Business Policies |
| `UC-NNN` | `UC-001` | Use Cases |
| `CMD-NNN` | `CMD-024` | Commands |
| `QRY-NNN` | `QRY-007` | Queries |
| `XP-{TEMA}-NNN` | `XP-PUNTOS-001` | Cross-Policies |
| `UI-{Nombre}` | `UI-Dashboard` | UI Views/Components |
| `REQ-NNN` | `REQ-012` | Requirements |
| `REQ-NNN.M` | `REQ-012.3` | Subrequisitos |

> `NNN` = 3 dígitos con padding (001, 012, 105)
> `NNNN` = 4 dígitos con padding (0001, 0015)
> `{ENTIDAD}`, `{TEMA}` = TODO MAYÚSCULAS
> `{Nombre}` = PascalCase

---

## ¿Qué creo? (Decisión rápida)

| Situación | Crear |
|---|---|
| "El usuario quiere poder..." | **OBJ** |
| "Este es el flujo de..." | **UC** |
| "Esta regla de negocio dice..." | **BR** (fija) o **BP** (configurable) |
| "Esta acción modifica..." | **CMD** |
| "Necesito consultar datos de..." | **QRY** |
| "Esta pantalla muestra..." | **UI View** |
| "Este componente reutilizable..." | **UI Component** |
| "¿Por qué decidimos X?" | **ADR** |
| "¿Qué va en la v1.2?" | **REL** |
| "Este evento ocurre cuando..." | **EVT** |
| "Esta política aplica a todos..." | **XP** |
| "Necesito agrupar features..." | **UV** |
| "Necesito criterio verificable..." | **REQ** |

---

## Frontmatter mínimo por tipo

### Objective
```yaml
---
id: OBJ-NNN
kind: objective
title: "Título descriptivo"
actor: Usuario
status: draft
---
```

### Use Case
```yaml
---
id: UC-NNN
kind: use-case
title: "Acción"
version: 1
actor: Usuario
status: draft
---
```

### Command
```yaml
---
id: CMD-NNN
kind: command
title: "Verbo + Entidad"
status: draft
billable: false         # opcional
credit-cost: 0          # opcional
---
```

### Query
```yaml
---
id: QRY-NNN
kind: query
title: "Get/List + Entidad"
status: draft
---
```

### Entity
```yaml
---
kind: entity           # o: role, system
aliases: []            # opcional
status: draft
---
```

### Business Rule
```yaml
---
id: BR-ENTIDAD-NNN
kind: business-rule
title: "Regla"
entity: Entidad
category: validation   # validation|state|limit|security
severity: medium       # low|medium|high|critical
status: draft
---
```

### Event
```yaml
---
id: EVT-Entidad-Accion
kind: event
title: "Entidad Accion"
status: draft
---
```

### UI View
```yaml
---
id: UI-Nombre          # opcional, default: nombre del archivo
kind: ui-view
title: "Nombre Vista"
status: draft
links:
  use-cases: []        # opcional
  components: []       # opcional
---
```

### Requirement
```yaml
---
id: REQ-NNN
kind: requirement
title: "Requisito"
priority: medium       # low|medium|high|critical
source: UC-NNN         # opcional
status: draft
---
```

### ADR
```yaml
---
id: ADR-NNNN
kind: adr
status: draft
date: YYYY-MM-DD       # opcional
deciders: []           # opcional
---
```

### Value Unit
```yaml
---
id: UV-NNN
kind: value-unit
title: "Feature agrupado"
owner: TeamName
status: draft
release: REL-NNN       # opcional
---
```

---

## Capitalización

| Contexto | Formato | Ejemplo |
|---|---|---|
| Entidades en prosa | Primera mayúscula | El **Usuario** crea un **Proyecto** |
| Sistemas externos | TODO MAYÚSCULAS | Los datos vienen de **ORACLE** |
| En código | camelCase/snake_case | `const miembro = ...` |
| Estados (prosa) | Primera mayúscula | **Borrador**, **Preparado** |
| Estados (código/YAML) | snake_case | `borrador`, `preparado`, `en_analisis` |
| IDs | MAYÚSCULAS | `BR-PROYECTO-005`, `CMD-003` |

---

## Wiki-Links

```markdown
[[Nombre]]                         # Link simple
[[Nombre|alias]]                   # Con alias
[[Tarea|tareas]]                # Plural
[[Miembro|participante]] # Sinónimo
[[BR-PROYECTO-005]]                    # Artefacto por ID
[[UC-001-Crear-Proyecto]]              # Artefacto con nombre completo
```

| Cuándo | Acción |
|---|---|
| Primera mención en sección | Enlazar |
| Menciones posteriores | Opcional |
| En headers | NO enlazar |
| En bloques de código | NO enlazar |
| En tablas | Enlazar |

---

## Keywords EARS (Requisitos formales)

```markdown
WHEN {evento}
  the system SHALL {acción obligatoria}
  AND SHALL emit {evento}

IF {condición no deseada}
  the system SHALL reject
  AND SHALL return error {código}

WHILE {estado continuo}
  the system SHALL NOT {prohibición}

WHERE {feature opcional}
  the system SHALL {comportamiento opcional}
```

| Keyword | Propósito |
|---|---|
| `WHEN` | Evento disparador |
| `IF` | Condición no deseada |
| `WHILE` | Estado continuo |
| `WHERE` | Característica opcional |
| `SHALL` | Obligación |
| `SHALL NOT` | Prohibición |

---

## Secciones requeridas por tipo

### Entity
- `## Descripción` ✓
- `## Atributos` ✓
- `## Estados` (si tiene ciclo de vida)
- `## Invariantes` (opcional)

### Business Rule
- `## Declaración` ✓
- `## Por qué existe` ✓
- `## Cuándo aplica` ✓
- `## Qué pasa si se incumple` ✓
- `## Ejemplos` ✓

### Command
- `## Purpose` ✓
- `## Input` ✓ (tabla con Parameter, Type, Required, Validation)
- `## Preconditions` ✓
- `## Postconditions` ✓
- `## Possible Errors` ✓ (tabla con Code, Condition, Message)

### Query
- `## Purpose` ✓
- `## Input` ✓
- `## Output` ✓
- `## Possible Errors` ✓

### Use Case
- `## Descripción` ✓
- `## Actores` ✓
- `## Precondiciones` ✓
- `## Flujo Principal` ✓ (pasos numerados)
- `## Postcondiciones` ✓

### UI View
- `## Descripción` ✓
- `## Layout` ✓
- `## Componentes Utilizados` ✓
- `## Estados` ✓ (loading, empty, error, success — solo aplicables)
- `## Comportamiento` ✓

### Requirement
- `## Descripción` ✓
- `## Criterios de Aceptación` ✓ (EARS)
- `## Trazabilidad` ✓

---

## Validación

```bash
bun run validate:specs
```

Verifica:
- Esquema YAML correcto
- Campos requeridos presentes
- Valores enum válidos
- Patrones de ID correctos
- Links rotos (solo en `status: approved`)

---

## Herramientas CLI

| Comando | Qué hace |
|---|---|
| `bun run validate:specs` | Valida frontmatter, secciones y enlaces de specs |
| `bun run pipeline:check UV-NNN` | 8 gates de calidad para una Value Unit |
| `bun run pipeline:check --all` | 8 gates para todas las UVs |
| `bun run pipeline:scaffold UV-NNN` | Genera stubs de código desde specs CMD |
| `bun run pipeline:status` | Dashboard de progreso por UV |
| `bun run pipeline:coverage` | Cobertura BR → CMD |
| `bun run pipeline:mapping` | Mapeo CMD → código → tests |

### Skills de Claude Code (más usados)

| Skill | Qué hace |
|---|---|
| `/kdd-author` | Crea artefactos KDD desde una idea |
| `/kdd-review` | Revisa calidad de specs |
| `/kdd-gaps` | Detecta artefactos faltantes |
| `/kdd-verify` | Verifica código contra specs |
| `/generate-e2e` | Genera test E2E desde spec REQ |
| `/ui` | Genera spec de UI conectada al dominio |

> **Ver**: [Herramientas de Automatización](tooling.md) · [Pipeline de Validación](pipeline.md)

---

## Referencias completas

- `/kdd/docs/STYLE-GUIDE.md` — Guía de estilo completa
- `/kdd/docs/reference/artifacts.md` — Catálogo de artefactos
- `/kdd/docs/reference/frontmatter.md` — Schemas YAML
- `/kdd/docs/reference/layers.md` — Las 6 capas
- `/kdd/docs/reference/naming.md` — Convenciones de nombrado
- `/kdd/docs/reference/templates.md` — Índice de templates
- `/kdd/docs/reference/status-lifecycle.md` — Ciclo de vida
