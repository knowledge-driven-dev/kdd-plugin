---
title: "Referencia de Artefactos KDD"
audience: [all]
type: reference
reading_time: "consulta"
status: draft
---

# Referencia de Artefactos KDD

> Para: Todos — Tipo: Referencia — Uso: Consulta puntual

Este documento cataloga todos los tipos de artefactos KDD. Cada sección describe un tipo de artefacto con su propósito, creador, ubicación, frontmatter, secciones requeridas y ejemplos reales del proyecto TaskFlow. Consulta el tipo que necesites; no hace falta leer de corrido.

---

## Estructura de carpetas

```
/specs
├── 00-requirements/       # "¿Por qué existe esto?"
│   ├── objectives/        # OBJ - Lo que el usuario quiere lograr
│   ├── releases/          # REL - Qué va en cada versión
│   ├── value-units/       # UV - Unidades de valor
│   └── decisions/         # ADR - Decisiones arquitectónicas
│
├── 01-domain/             # "¿Qué conceptos existen?"
│   ├── entities/          # Entidades de dominio (Proyecto, Tarea...)
│   ├── events/            # EVT - Eventos del sistema
│   └── rules/             # BR/BP - Reglas de negocio
│
├── 02-behavior/           # "¿Cómo se comporta?"
│   ├── use-cases/         # UC - Flujos usuario-sistema
│   ├── commands/          # CMD - Acciones que modifican datos
│   ├── queries/           # QRY - Consultas de datos
│   └── policies/          # XP - Políticas transversales
│
├── 03-experience/         # "¿Cómo se ve?"
│   └── views/             # UI - Pantallas y componentes
│
└── 04-verification/       # "¿Cómo sabemos que funciona?"
    └── criteria/          # REQ - Criterios de aceptación
```

---

## `00-requirements` — Entrada de negocio

### Objective (OBJ)

Captura lo que un usuario quiere lograr y por qué.

| Aspecto | Detalle |
|---|---|
| **Quién lo crea** | PM |
| **Ubicación** | `specs/00-requirements/objectives/` |
| **Nombrado de archivo** | `OBJ-NNN-NombreCorto.md` |
| **Ejemplo real** | `OBJ-001-Crear-Proyecto.md` |

**Frontmatter:**

```yaml
---
id: OBJ-001
kind: objective
title: Crear un Proyecto para analizar
actor: Usuario
status: draft
---
```

**Secciones requeridas:**

| Sección | Requerida | Descripción |
|---|---|---|
| `## Actor` | Sí | Rol o tipo de usuario |
| `## Objetivo` | Sí | "Como X, quiero Y, para Z" |
| `## Criterios de éxito` | Sí | Cómo sabe el usuario que lo logró |
| `## Casos de uso relacionados` | No | Lista de UC que implementan este objetivo |

**Ejemplo mínimo real:**

```markdown
---
id: OBJ-001
kind: objective
title: Crear un Proyecto para analizar
actor: Usuario
status: draft
---

# OBJ-001: Crear un Proyecto para analizar

## Actor
Usuario

## Objetivo
Como Usuario, quiero crear un Proyecto con su contexto, para poder
analizarlo con Miembros.

## Criterios de éxito
- El Usuario crea un Proyecto en estado borrador.
- El Proyecto queda listo para configurar Miembros.

## Casos de uso relacionados
- [[UC-001-Crear-Proyecto]]
```

---

### Release (REL)

Planifica qué objetivos y features van en cada versión.

| Aspecto | Detalle |
|---|---|
| **Quién lo crea** | PM |
| **Ubicación** | `specs/00-requirements/releases/` |
| **Nombrado de archivo** | `REL-NNN-vX.Y.md` |

**Frontmatter:**

```yaml
---
id: REL-001
kind: release
title: v1.2 - Exportaciones
target_date: 2025-02-15
status: draft
---
```

**Secciones requeridas:**

| Sección | Requerida | Descripción |
|---|---|---|
| `## Objetivo` | Sí | Qué valor entrega esta versión |
| `## Lo que incluye` | Sí | Lista de OBJs y features |
| `## Lo que NO incluye` | No | Clarifica alcance |
| `## Criterios de salida` | Sí | Condiciones para liberar |

---

### Value Unit (UV)

Organiza el alcance de implementación con tracking de estado.

| Aspecto | Detalle |
|---|---|
| **Quién lo crea** | PM, Tech Lead |
| **Ubicación** | `specs/00-requirements/value-units/` |
| **Nombrado de archivo** | `UV-NNN-NombreCorto.md` |

**Frontmatter:**

```yaml
---
id: UV-001
kind: value-unit
title: CRUD básico de Proyectos
status: draft
---
```

**Secciones requeridas:**

| Sección | Requerida | Descripción |
|---|---|---|
| `## Alcance` | Sí | Qué incluye esta unidad |
| `## Implemented` | Sí | Lista con `[x]` de artefactos ya implementados |
| `## Pending — Iteration: {nombre}` | Sí | Lista con `[ ]` de artefactos por implementar |
| `## Out of scope (deferred)` | No | Lista con `~~strikethrough~~` de artefactos pospuestos |

> **Ver**: [Guía para PMs](../guides/pm.md) y `.claude/rules/kdd-value-units.md` para reglas de uso.

---

### Architecture Decision Record (ADR)

Documenta decisiones arquitectónicas importantes con su contexto y consecuencias.

| Aspecto | Detalle |
|---|---|
| **Quién lo crea** | Tech Lead, PM |
| **Ubicación** | `specs/00-requirements/decisions/` |
| **Nombrado de archivo** | `ADR-NNNN-TituloDecision.md` |

**Frontmatter:**

```yaml
---
id: ADR-0001
kind: adr
title: Modelo de puntos por uso
status: accepted
date: 2025-01-15
---
```

**Secciones requeridas:**

| Sección | Requerida | Descripción |
|---|---|---|
| `## Contexto` | Sí | Situación que requiere decisión |
| `## Opciones consideradas` | Sí | Alternativas evaluadas |
| `## Decisión` | Sí | Qué se decidió y por qué |
| `## Consecuencias` | Sí | Impacto positivo y negativo |

---

## `01-domain` — Base del conocimiento

### Entity

Este artefacto representa un concepto del negocio con identidad y ciclo de vida.

| Aspecto | Detalle |
|---|---|
| **Quién lo crea** | PM, Dev |
| **Ubicación** | `specs/01-domain/entities/` |
| **Nombrado de archivo** | `PascalCase.md` (ej: `Proyecto.md`, `Miembro.md`) |
| **Variantes de `kind`** | `entity`, `role`, `system` |

**Frontmatter:**

```yaml
---
id: ENT-Proyecto                 # Opcional, por defecto el nombre del archivo
kind: entity                  # o: role, system
aliases:
  - Proyectos
  - Proyecto
status: draft
---
```

**Variantes de entidades:**

| kind | Uso | Nombrado | Ejemplo |
|------|-----|----------|---------|
| `entity` | Concepto de dominio con ciclo de vida | PascalCase | `Proyecto.md`, `Tarea.md` |
| `role` | Rol/actor que interactúa con el sistema | PascalCase | `Usuario.md`, `Propietario.md` |
| `system` | Sistema externo o integración | **MAYÚSCULAS** | `ORACLE.md`, `STRIPE.md` |

> **Importante**: Los sistemas externos se nombran en MAYÚSCULAS tanto en el archivo como en wiki-links: `[[ORACLE]]`

**Secciones requeridas:**

| Sección | Requerida | Descripción |
|---|---|---|
| `## Descripción` | Sí | Qué es y para qué sirve |
| `## Atributos` | Sí | Tabla con campos (nombre, tipo, descripción) |
| `## Estados` | No* | Tabla separada si la entidad tiene ciclo de vida |
| `## Ciclo de Vida` | No | Diagrama Mermaid stateDiagram |
| `## Relaciones` | No | Relaciones con otras entidades |
| `## Invariantes` | No | Restricciones que siempre deben cumplirse |

> *Si la entidad tiene estados, documentarlos en sección separada es obligatorio.

**Ejemplo mínimo real (Proyecto):**

```markdown
---
id: ENT-Proyecto
aliases:
  - Proyectos
  - Proyecto
kind: entity
status: draft
---

# Proyecto

## Descripción

Representa la pregunta, problema o desafío que se somete a análisis
mediante una [[Tarea]] del el método de análisis. El Proyecto es
el punto de partida de toda dinámica.

## Atributos

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | Identificador único del proyecto |
| `titulo` | string | Enunciado breve (máx. 100 caracteres) |
| `contenido_md` | string | Contenido Markdown estructurado |
| `estado` | enum | Estado del ciclo de vida (ver [[#Estados]]) |
| `creador_id` | uuid | [[Usuario]] propietario del Proyecto |
| `created_at` | timestamp | Fecha de creación |

## Estados

| Estado | ID | Descripción |
|---|---|---|
| **Borrador** | `borrador` | Proyecto en configuración, aún no listo |
| **Preparado** | `preparado` | Proyecto completo, listo para iniciar Tareas |
| **En Análisis** | `en_analisis` | Al menos una Tarea ha sido iniciada |
| **Terminado** | `terminado` | Proyecto cerrado, inmutable |

## Invariantes

| ID | Restricción |
|---|---|
| INV-PROYECTO-001 | El título es obligatorio (1-100 caracteres) |
| INV-PROYECTO-002 | El contenido es obligatorio (min 100 caracteres) |
| INV-PROYECTO-003 | Todo Proyecto pertenece a un Usuario (creador_id) |
| INV-PROYECTO-005 | Un Proyecto se crea siempre en estado Borrador |
```

---

### Business Rule (BR)

Regla fija del dominio que el sistema debe cumplir siempre.

| Aspecto | Detalle |
|---|---|
| **Quién lo crea** | PM, Dev |
| **Ubicación** | `specs/01-domain/rules/` |
| **Nombrado de archivo** | `BR-ENTIDAD-NNN.md` |

**Frontmatter:**

```yaml
---
id: BR-PROYECTO-001
kind: business-rule
title: Título obligatorio
entity: Proyecto
category: validation          # validation|state|limit|security
severity: medium              # low|medium|high|critical
status: draft
---
```

**Secciones requeridas:**

| Sección | Requerida | Descripción |
|---|---|---|
| `## Declaración` | Sí | Descripción clara con wiki-links |
| `## Por qué existe` | Sí | Justificación de negocio |
| `## Cuándo aplica` | Sí | Condiciones de activación |
| `## Qué pasa si se incumple` | Sí | Consecuencias |
| `## Formalización` | No | Patrón EARS (opcional) |
| `## Ejemplos` | Sí | Casos válidos e inválidos |

---

### Business Policy (BP)

Regla de negocio configurable (valores pueden cambiar sin modificar código).

| Aspecto | Detalle |
|---|---|
| **Quién lo crea** | PM, Dev |
| **Ubicación** | `specs/01-domain/rules/` |
| **Nombrado de archivo** | `BP-TEMA-NNN.md` |

**Frontmatter:**

```yaml
---
id: BP-SUSCRIPCION-001
kind: business-policy
title: Límite de proyectos por plan
entity: Usuario
category: business            # business|compliance|limit
severity: medium
status: draft
---
```

**Secciones requeridas:**

Igual que BR, más:

| Sección | Requerida | Descripción |
|---|---|---|
| `## Parámetros` | Sí (solo BP) | Valores configurables con tipo y rango |

---

### Event (EVT)

Evento de dominio que ocurre en el sistema.

| Aspecto | Detalle |
|---|---|
| **Quién lo crea** | Dev |
| **Ubicación** | `specs/01-domain/events/` |
| **Nombrado de archivo** | `EVT-Entidad-Accion.md` |
| **Ejemplo real** | `EVT-Proyecto-Creado.md` |

**Frontmatter:**

```yaml
---
kind: event
source: "[[Proyecto]]"
---
```

> **Nota**: Los eventos no usan campo `id` en el frontmatter. El nombre del archivo ES el identificador.

**Secciones requeridas:**

| Sección | Requerida | Descripción |
|---|---|---|
| `## Descripción` | Sí | Qué representa este evento |
| `## Emisor` | Sí | Qué entidad o comando lo produce |
| `## Payload` | Sí | Tabla con campos del evento |
| `## Ejemplo` | Sí | JSON/YAML del payload |
| `## Suscriptores` | No | Qué sistemas reaccionan al evento |

**Ejemplo mínimo real (EVT-Proyecto-Creado):**

```markdown
---
kind: event
source: "[[Proyecto]]"
---

# EVT-Proyecto-Creado

## Descripción

Evento emitido cuando un [[Proyecto]] se crea exitosamente
vía [[CMD-001-CreateProyecto]].

## Emisor

| Entidad | Acción desencadenante |
|---|---|
| [[Proyecto]] | Creación en estado `borrador` |

## Payload

| Campo | Tipo | Descripción |
|---|---|---|
| `proyecto_id` | uuid | ID del proyecto recién creado |
| `usuario_id` | uuid | ID del [[Usuario]] creador |
| `titulo` | string | Título del proyecto |
| `estado` | string | Siempre `borrador` |
| `created_at` | datetime | Marca temporal de creación |

## Ejemplo

```json
{
  "event": "EVT-Proyecto-Creado",
  "payload": {
    "proyecto_id": "550e8400-e29b-41d4-a716-446655440001",
    "usuario_id": "550e8400-e29b-41d4-a716-446655440000",
    "titulo": "¿Expandir al mercado europeo?",
    "estado": "borrador",
    "created_at": "2024-12-13T10:00:00Z"
  }
}
```

## Suscriptores

| Sistema | Reacción |
|---|---|
| Analytics | Incrementa métricas de proyectos creados |
| UI | Actualiza dashboard del usuario |
```

---

## `02-behavior` — Orquestación

### Use Case (UC)

Flujo completo de interacción usuario-sistema.

| Aspecto | Detalle |
|---|---|
| **Quién lo crea** | PM, Diseñador |
| **Ubicación** | `specs/02-behavior/use-cases/` |
| **Nombrado de archivo** | `UC-NNN-NombreUseCase.md` |
| **Ejemplo real** | `UC-001-Crear-Proyecto.md` |

**Frontmatter:**

```yaml
---
id: UC-001
kind: use-case
title: Crear Proyecto
version: 1
status: draft
actor: Usuario
---
```

**Secciones requeridas:**

| Sección | Requerida | Descripción |
|---|---|---|
| `## Descripción` | Sí | Resumen del caso de uso |
| `## Actores` | Sí | Quiénes participan |
| `## Precondiciones` | Sí | Estado inicial requerido |
| `## Flujo Principal` | Sí | Pasos del camino feliz (numerados) |
| `## Flujos Alternativos` | No | Variaciones válidas (excepciones con subnúmeros) |
| `## Postcondiciones` | Sí | Estado final del sistema |
| `## Reglas Aplicadas` | No | BR-*, BP-*, XP-* que se validan |
| `## Comandos Ejecutados` | No | CMD-* que se invocan |

**Estructura del flujo principal:**

```markdown
## Flujo Principal

1. El Usuario accede a la opción "Nuevo Proyecto"
2. El Sistema muestra el formulario de creación
3. El Usuario ingresa el título del proyecto
4. El Sistema valida en tiempo real
5. El Usuario hace clic en "Crear Proyecto"
6. El Sistema crea el [[Proyecto]] con estado `borrador`
7. El Sistema emite evento [[EVT-Proyecto-Creado]]
8. El Sistema redirige al Usuario a configuración de Personas

## Flujos Alternativos

### 4a. Título demasiado largo

1. El Sistema muestra error: "El título no puede exceder 100 caracteres"
2. El Usuario corrige el título
3. Continúa en paso 5 del flujo principal

### 5a. Usuario cancela la creación

1. El Usuario hace clic en "Cancelar"
2. El Sistema muestra confirmación: "¿Descartar cambios?"
3. Si confirma: regresa al dashboard
4. Si cancela: continúa en paso 5
```

---

### Command (CMD)

Acción que modifica el estado del sistema.

| Aspecto | Detalle |
|---|---|
| **Quién lo crea** | Dev, PM |
| **Ubicación** | `specs/02-behavior/commands/` |
| **Nombrado de archivo** | `CMD-NNN-NombreCommand.md` |
| **Patrón de ID** | `^CMD-\d{3}$` |
| **Ejemplo real** | `CMD-001-CreateProyecto.md` |

**Frontmatter:**

```yaml
---
id: CMD-001
kind: command
title: Create Proyecto
status: draft
billable: false               # Opcional: si consume puntos
credit-cost: 0                # Opcional: cantidad de puntos
tags: [core, proyecto]       # Opcional: categorización
---
```

**Secciones requeridas:**

| Sección | Requerida | Descripción |
|---|---|---|
| `## Purpose` | Sí | Qué hace el comando |
| `## Input` | Sí | Tabla con: Parameter, Type, Required, Validation |
| `## Preconditions` | Sí | Lista de condiciones previas |
| `## Postconditions` | Sí | Estado después de ejecutar |
| `## Rules Validated` | No | BR-* que se verifican |
| `## Events Generated` | No | EVT-* que se emiten |
| `## Possible Errors` | Sí | Tabla con: Code, Condition, Message |

**Columnas obligatorias para Input:**

```markdown
| Parameter | Type | Required | Validation |
|---|---|---|---|
```

**Columnas obligatorias para Errors:**

```markdown
| Code | Condition | Message |
|---|---|---|
```

**Ejemplo mínimo real (CMD-001):**

```markdown
---
id: CMD-001
kind: command
status: draft
tags: [proyecto, core]
---

# CMD-001: CreateProyecto

## Purpose
Creates a new [[Proyecto]] in draft state.

## Input
| Parameter | Type | Required | Validation |
|---|---|---|---|
| titulo | string | Yes | 1-100 chars, not empty/whitespace only |
| contenido_md | string | No | Markdown content (optional) |
| userId | UUID | Yes | Must be authenticated user |

## Preconditions
- User is authenticated
- User has not exceeded proyectos activos limit ([[BR-PROYECTO-002]])

## Postconditions
- New [[Proyecto]] exists with state = `borrador`
- No [[Miembro]] associated yet

## Rules Validated
- [[Proyecto#INV-PROYECTO-001]] - Title required (1-100 chars)
- [[BR-PROYECTO-002]] - Max 50 proyectos activos per user

## Events Generated
- [[EVT-Proyecto-Creado]] on success

## Possible Errors
| Code | Condition | Message |
|---|---|---|
| PROYECTO-001 | Empty title | "El título es obligatorio" |
| PROYECTO-002 | Title too long | "El título no puede exceder 100 caracteres" |
| PROYECTO-003 | Limit exceeded | "Has alcanzado el límite de 50 proyectos activos" |
```

---

### Query (QRY)

Consulta que lee datos sin modificar el estado del sistema.

| Aspecto | Detalle |
|---|---|
| **Quién lo crea** | Dev |
| **Ubicación** | `specs/02-behavior/queries/` |
| **Nombrado de archivo** | `QRY-NNN-NombreQuery.md` |
| **Patrón de ID** | `^QRY-\d{3}$` |
| **Ejemplo real** | `QRY-001-GetProyecto.md` |

**Frontmatter:**

```yaml
---
id: QRY-001
kind: query
title: Get Proyecto
status: draft
---
```

**Secciones requeridas:**

| Sección | Requerida | Descripción |
|---|---|---|
| `## Purpose` | Sí | Qué datos devuelve |
| `## Input` | Sí | Tabla con parámetros |
| `## Output` | Sí | Estructura de respuesta (TypeScript/JSON) |
| `## Authorization` | No | Reglas de acceso |
| `## Possible Errors` | Sí | Tabla de errores |

**Ejemplo mínimo real (QRY-001-GetProyecto):**

```markdown
---
id: QRY-001
kind: query
title: Get Proyecto
status: draft
---

# QRY-001: GetProyecto

## Purpose

Devuelve la información completa de un [[Proyecto]] incluyendo
sus [[Miembro|Miembros]] asociadas.

## Input

| Parameter | Type | Required | Description |
|---|---|---|---|
| proyectoId | UUID | Yes | Identificador del proyecto |
| userId | UUID | Yes | Usuario autenticado (owner) |

## Output

```typescript
interface GetProyectoResult {
  id: string
  titulo: string
  descripcion: string
  estado: 'borrador' | 'preparado' | 'en_analisis' | 'terminado'
  creadorId: string
  createdAt: string

  personas?: {
    id: string
    nombre: string
    perfil: string
  }[]
}
```

## Authorization

- El Usuario MUST ser el propietario del Proyecto (`userId === proyecto.creadorId`)

## Possible Errors

| Code | Condition | Message |
|---|---|---|
| PROYECTO-404 | Proyecto not found | "El proyecto no existe" |
| PROYECTO-403 | User not owner | "No tienes permisos para ver este proyecto" |
```

---

### Cross-Policy (XP)

Política transversal que aplica a múltiples comandos.

| Aspecto | Detalle |
|---|---|
| **Quién lo crea** | Dev, Tech Lead |
| **Ubicación** | `specs/02-behavior/policies/` |
| **Nombrado de archivo** | `XP-TEMA-NNN.md` |
| **Ejemplo** | `XP-PUNTOS-001.md` |

**Frontmatter:**

```yaml
---
id: XP-PUNTOS-001
kind: cross-policy
title: Descuento de puntos en comandos billables
status: approved
---
```

**Secciones requeridas:**

| Sección | Requerida | Descripción |
|---|---|---|
| `## Propósito` | Sí | Por qué es transversal |
| `## Declaración` | Sí | Qué hace la política |
| `## Formalización EARS` | Sí | Patrón BEFORE/AFTER/Reject |
| `## Aplica a` | Sí | Lista de comandos afectados |
| `## Ejemplos` | Sí | Verificación exitosa y fallida |
| `## Comportamiento Estándar` | Sí | BEFORE, AFTER, Rechazo, Rollback |

---

## `03-experience` — Presentación

### UI View

Especificación de una pantalla o página completa.

| Aspecto | Detalle |
|---|---|
| **Quién lo crea** | Diseñador |
| **Ubicación** | `specs/03-experience/views/` |
| **Nombrado de archivo** | `UI-NombreVista.md` |
| **Ejemplo** | `UI-Dashboard.md`, `UI-ProyectoEditor.md` |

**Frontmatter:**

```yaml
---
id: UI-Dashboard
kind: ui-view
title: Dashboard
route: /dashboard            # Ruta de la vista
status: draft
links:
  use-cases:
    - "[[UC-001-Crear-Proyecto]]"
  components:
    - "[[UI-ProyectoCard]]"
---
```

**Secciones requeridas:**

| Sección | Requerida | Descripción |
|---|---|---|
| `## Descripción` | Sí | Propósito de la vista |
| `## Layout` | Sí | Wireframe ASCII o enlace a Figma |
| `## Componentes Utilizados` | Sí | Lista de componentes |
| `## Estados` | Sí* | loading, empty, error, success (solo aplicables) |
| `## Comportamiento` | Sí | Interacciones y navegación |
| `## Queries Consumidas` | No | QRY-* que alimentan la vista |
| `## Commands Invocados` | No | CMD-* que se ejecutan desde la vista |

> *Estados: Incluir solo los **aplicables** a la vista. Una vista sin datos puede omitir `empty`. Una vista estática puede omitir `loading`.

---

### UI Component

Componente reutilizable de interfaz.

| Aspecto | Detalle |
|---|---|
| **Quién lo crea** | Diseñador |
| **Ubicación** | `specs/03-experience/views/` |
| **Nombrado de archivo** | `UI-NombreComponente.md` |
| **Ejemplo** | `UI-ProyectoCard.md`, `UI-MiembroAvatar.md` |

**Frontmatter:**

```yaml
---
id: UI-ProyectoCard
kind: ui-component
title: Proyecto Card
status: draft
links:
  entities:
    - "[[Proyecto]]"
---
```

**Secciones requeridas:**

Igual que UI View, excepto que no tiene `route` ni `## Queries Consumidas`.

---

## `04-verification` — Validación

### Requirement (REQ)

Criterios de aceptación verificables derivados de casos de uso.

| Aspecto | Detalle |
|---|---|
| **Quién lo crea** | QA, PM |
| **Ubicación** | `specs/04-verification/criteria/` |
| **Nombrado de archivo** | `REQ-NNN-NombreRequisito.md` |
| **Patrón de ID** | `^REQ-\d{3}$` o `^REQ-\d{3}\.\d+$` |

**Frontmatter:**

```yaml
---
id: REQ-001
kind: requirement
title: Crear Proyecto
status: draft
priority: high              # low|medium|high|critical
source: UC-001              # Dónde se origina este requisito
---
```

**Secciones requeridas:**

| Sección | Requerida | Descripción |
|---|---|---|
| `## Descripción` | Sí | Qué debe cumplirse |
| `## Criterios de Aceptación` | Sí | Lista de condiciones verificables |
| `## Trazabilidad` | Sí | Links a UC-*, BR-*, CMD-* que implementan |

**Estructura de criterios:**

```markdown
## Criterios de Aceptación

WHEN el Usuario ejecuta CMD-001-CreateProyecto con título válido,
the system SHALL create a new Proyecto
  AND SHALL set estado to "borrador"
  AND SHALL emit EVT-Proyecto-Creado.

IF the título exceeds 100 characters,
the system SHALL reject with error PROYECTO-002.

IF the Usuario has 50 proyectos activos,
the system SHALL reject with error PROYECTO-003.
```

---

## Status Lifecycle (todos los artefactos)

Todos los artefactos siguen el mismo ciclo de vida:

```
draft → review → approved → deprecated
```

| Status | Significado | Cuándo usar |
|---|---|---|
| `draft` | Trabajo en progreso | Documento en creación o edición |
| `review` | Pendiente de aprobación | Listo para revisión de equipo |
| `approved` | Fuente de verdad oficial | Documento aprobado y activo |
| `deprecated` | Obsoleto | Reemplazado por otra versión (debe linkar al reemplazo) |

> **Importante**: No usar `proposed`. Usar `review` para documentos pendientes de aprobación.

---

## Cheatsheet: ¿Qué artefacto creo?

| Situación | Artefacto |
|---|---|
| "El usuario quiere poder..." | **OBJ** (Objective) |
| "Este es el flujo de..." | **UC** (Use Case) |
| "Esta regla de negocio dice..." | **BR** (Business Rule) |
| "El precio/límite es configurable..." | **BP** (Business Policy) |
| "Esta acción modifica..." | **CMD** (Command) |
| "Necesito consultar datos de..." | **QRY** (Query) |
| "Esta pantalla muestra..." | **UI** (View o Component) |
| "¿Por qué decidimos X?" | **ADR** (Decision Record) |
| "¿Qué va en la v1.2?" | **REL** (Release) |
| "Este evento ocurre cuando..." | **EVT** (Event) |
| "Esta política aplica a todos los comandos..." | **XP** (Cross-Policy) |
| "Necesito agrupar features para implementar..." | **UV** (Value Unit) |

---

## Tabla resumen

| Tipo | Prefijo | Quién | Ubicación | Ejemplo |
|---|---|---|---|---|
| Objective | OBJ | PM | `00-requirements/objectives/` | OBJ-001 |
| Release | REL | PM | `00-requirements/releases/` | REL-001 |
| Value Unit | UV | PM/Tech Lead | `00-requirements/value-units/` | UV-001 |
| ADR | ADR | Tech Lead | `00-requirements/decisions/` | ADR-0001 |
| Entity | - | PM/Dev | `01-domain/entities/` | Proyecto.md |
| Event | EVT | Dev | `01-domain/events/` | EVT-Proyecto-Creado |
| Business Rule | BR | PM/Dev | `01-domain/rules/` | BR-PROYECTO-001 |
| Business Policy | BP | PM/Dev | `01-domain/rules/` | BP-SUSCRIPCION-001 |
| Use Case | UC | PM/Designer | `02-behavior/use-cases/` | UC-001 |
| Command | CMD | Dev | `02-behavior/commands/` | CMD-001 |
| Query | QRY | Dev | `02-behavior/queries/` | QRY-001 |
| Cross-Policy | XP | Dev/Tech Lead | `02-behavior/policies/` | XP-PUNTOS-001 |
| UI View | UI | Designer | `03-experience/views/` | UI-Dashboard |
| UI Component | UI | Designer | `03-experience/views/` | UI-ProyectoCard |
| Requirement | REQ | QA/PM | `04-verification/criteria/` | REQ-001 |

---

## Siguiente paso

Consulta `/kdd/docs/reference/frontmatter.md` para el detalle completo de cada campo YAML por tipo de artefacto.

Para convenciones de escritura, consulta `/kdd/docs/STYLE-GUIDE.md`.

Para templates, consulta `/kdd/templates/`.
