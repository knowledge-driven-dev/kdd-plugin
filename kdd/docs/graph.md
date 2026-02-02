# KDD Graph RAG - Tipos de Nodos

> **Propósito**: Documentación de los tipos de nodos para indexar especificaciones KDD en un Graph RAG.

---

## Visión General

El Graph RAG de KDD indexa las especificaciones en `/specs` como un grafo de conocimiento. Los nodos representan artefactos y sus elementos internos, mientras que las aristas representan las relaciones entre ellos.

```
┌─────────────────────────────────────────────────────────────┐
│                    GRAPH RAG KDD                            │
├─────────────────────────────────────────────────────────────┤
│  Nodos Principales    →  Artefactos (Entity, Command, UC)   │
│  Nodos Secundarios    →  Elementos internos (State, Attr)   │
│  Aristas              →  Relaciones tipadas (IMPLEMENTS)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Artefactos Principales (Top-Level Nodes)

Estos son los documentos `.md` que existen como archivos independientes en `/specs`.

### Capa 01-problem

| Tipo | ID | Patrón Archivo | Descripción |
|------|----|----------------|-------------|
| `PRD` | - | `PRD.md` | Product Requirements Document |
| `ADR` | ADR-NNNN | `ADR-NNNN-{Title}.md` | Architecture Decision Record |

### Capa 02-domain

| Tipo | ID | Patrón Archivo | Descripción |
|------|----|----------------|-------------|
| `Entity` | - | `PascalCase.md` | Entidad de dominio |
| `DomainEvent` | EVT-* | `EVT-{Entity}-{Action}.md` | Evento de dominio |
| `BusinessRule` | BR-*-NNN | `BR-{ENTITY}-NNN.md` | Regla de negocio |
| `BusinessPolicy` | BP-*-NNN | `BP-{TOPIC}-NNN.md` | Política de negocio |

### Capa 02-behavior

| Tipo | ID | Patrón Archivo | Descripción |
|------|----|----------------|-------------|
| `Command` | CMD-NNN | `CMD-NNN-{Name}.md` | Comando CQRS (escritura) |
| `Query` | QRY-NNN | `QRY-NNN-{Name}.md` | Query CQRS (lectura) |
| `Process` | PROC-NNN | `PROC-NNN-{Name}.md` | Proceso de negocio |

### Capa 04-interaction

| Tipo | ID | Patrón Archivo | Descripción |
|------|----|----------------|-------------|
| `UseCase` | UC-NNN | `UC-NNN-{Name}.md` | Caso de uso |
| `UIView` | UI-* | `UI-{Name}.md` | Vista/página de UI |
| `UIFlow` | Flow-* | `Flow-{Name}.md` | Flujo de navegación |
| `UIComponent` | - | `{Name}.md` | Componente reutilizable |

### Capa 05-verification

| Tipo | ID | Patrón Archivo | Descripción |
|------|----|----------------|-------------|
| `Requirement` | REQ-NNN | `REQ-NNN-{Name}.md` | Requisito funcional |
| `Contract` | - | `*.yaml` | Contrato de API |

---

## Nodos Secundarios (Elementos Internos)

Estos nodos se extraen del contenido de los artefactos principales.

### Ciclo de Vida

| Tipo | Contenedor | Descripción |
|------|------------|-------------|
| `State` | Entity, Process | Estado en máquina de estados |
| `StateTransition` | Entity, Process | Transición entre estados |
| `StateMachine` | Entity | Máquina de estados completa |

**Propiedades de State:**
```yaml
name: string           # Nombre del estado (ej: "Borrador")
description: string    # Descripción
is_initial: boolean    # Es estado inicial
is_final: boolean      # Es estado terminal
```

**Propiedades de StateTransition:**
```yaml
from_state: string     # Estado origen
to_state: string       # Estado destino
trigger: string        # Evento que dispara la transición
guard: string          # Condición de guarda (opcional)
action: string         # Acción a ejecutar (opcional)
produces_event: string # Evento producido (opcional)
```

### Estructura de Entidad

| Tipo | Contenedor | Descripción |
|------|------------|-------------|
| `EntityAttribute` | Entity | Atributo/propiedad |
| `EntityRelationship` | Entity | Relación con otra entidad |
| `Invariant` | Entity, BusinessRule | Regla de integridad |
| `Constraint` | Entity | Restricción de datos |

**Propiedades de EntityAttribute:**
```yaml
name: string           # Nombre del atributo
type: string           # Tipo de dato
required: boolean      # Es obligatorio
description: string    # Descripción
validation: string     # Regla de validación (opcional)
default: any           # Valor por defecto (opcional)
```

**Propiedades de EntityRelationship:**
```yaml
target_entity: string  # Entidad destino
cardinality: string    # 1:1, 1:N, N:1, N:M
relationship_type: string  # tiene, pertenece_a, asociado_con
description: string    # Descripción
```

### Entrada/Salida

| Tipo | Contenedor | Descripción |
|------|------------|-------------|
| `InputParameter` | Command, Query, Process | Parámetro de entrada |
| `OutputField` | Command, Query | Campo de salida |
| `EventPayload` | DomainEvent | Campo del payload del evento |

**Propiedades de InputParameter:**
```yaml
name: string           # Nombre del parámetro
type: string           # Tipo de dato
required: boolean      # Es obligatorio
validation: string     # Regla de validación
description: string    # Descripción
```

### Flujos

| Tipo | Contenedor | Descripción |
|------|------------|-------------|
| `UseCaseStep` | UseCase | Paso del flujo principal |
| `AlternativeFlow` | UseCase | Flujo alternativo/extensión |
| `ProcessStep` | Process | Paso de proceso |
| `DecisionPoint` | Process, UIFlow | Punto de decisión |
| `GuardCondition` | Command, StateTransition | Condición de guarda |

**Propiedades de UseCaseStep:**
```yaml
number: integer        # Número de paso
actor: string          # Actor que ejecuta (Usuario/Sistema)
action: string         # Acción realizada
validation: string     # Validación aplicada (opcional)
produces_event: string # Evento producido (opcional)
```

**Propiedades de AlternativeFlow:**
```yaml
id: string             # Identificador (ej: "3a", "5b")
condition: string      # Condición de disparo
steps: Step[]          # Pasos del flujo alternativo
returns_to: integer    # Paso al que retorna (opcional)
```

### UI

| Tipo | Contenedor | Descripción |
|------|------------|-------------|
| `UIInteraction` | UIView, UIComponent | Interacción de usuario |
| `ComponentState` | UIComponent | Estado visual del componente |
| `ComponentVariant` | UIComponent | Variante del componente |
| `FieldValidation` | UIView | Validación de campo de formulario |
| `UserAction` | UIView, UseCase | Acción del usuario |

**Propiedades de UIInteraction:**
```yaml
trigger: string        # Evento disparador (click, hover, submit)
precondition: string   # Precondición (opcional)
action: string         # Acción ejecutada
feedback: string       # Feedback al usuario
emits_event: string    # Evento emitido (opcional)
navigates_to: string   # Navegación destino (opcional)
```

**Propiedades de ComponentState:**
```yaml
name: string           # Nombre (default, hover, loading, error, disabled)
description: string    # Descripción
wireframe: string      # ASCII wireframe (opcional)
```

### Testing y Verificación

| Tipo | Contenedor | Descripción |
|------|------------|-------------|
| `TestScenario` | UseCase, Requirement | Escenario de prueba |
| `AcceptanceCriterion` | Requirement | Criterio de aceptación |
| `GherkinScenario` | Requirement | Escenario BDD |

**Propiedades de AcceptanceCriterion:**
```yaml
id: string             # Identificador
description: string    # Descripción
pattern: string        # Patrón EARS (opcional)
gherkin: GherkinScenario  # Escenario Gherkin (opcional)
```

**Propiedades de GherkinScenario:**
```yaml
name: string           # Nombre del escenario
given: string[]        # Precondiciones
when: string[]         # Acciones
then: string[]         # Resultados esperados
```

### Errores

| Tipo | Contenedor | Descripción |
|------|------------|-------------|
| `ErrorCode` | Command, Query | Código de error |
| `BusinessRuleException` | BusinessRule | Excepción a la regla |

**Propiedades de ErrorCode:**
```yaml
code: string           # Código (ej: "CHALLENGE-003")
condition: string      # Condición que lo dispara
message: string        # Mensaje de error
http_status: integer   # Código HTTP (opcional)
```

---

## Aristas (Relaciones)

Las aristas conectan nodos y representan relaciones semánticas.

### Relaciones Entre Artefactos

| Relación | Desde | Hacia | Descripción |
|----------|-------|-------|-------------|
| `IMPLEMENTS` | UseCase | Command, Query | UC invoca operación |
| `PRODUCES` | Command, Process | DomainEvent | Operación genera evento |
| `CONSUMES` | Process, Command | DomainEvent | Proceso reacciona a evento |
| `VALIDATES` | Command, Query | BusinessRule | Operación valida regla |
| `MODIFIES` | Command | Entity | Comando modifica entidad |
| `READS` | Query | Entity | Query lee entidad |
| `EXTENDS` | UseCase | UseCase | UC extiende otro UC |
| `INCLUDES` | UseCase | UseCase | UC incluye otro UC |
| `SUPERSEDES` | ADR | ADR | ADR reemplaza otro |
| `TRACES_TO` | Requirement | UseCase, BusinessRule | Trazabilidad de requisito |

### Relaciones Estructurales

| Relación | Desde | Hacia | Descripción |
|----------|-------|-------|-------------|
| `HAS_ATTRIBUTE` | Entity | EntityAttribute | Entidad tiene atributo |
| `HAS_STATE` | Entity | State | Entidad tiene estado |
| `HAS_RELATIONSHIP` | Entity | EntityRelationship | Entidad tiene relación |
| `HAS_STEP` | UseCase, Process | Step | Artefacto tiene paso |
| `HAS_PARAMETER` | Command, Query | InputParameter | Operación tiene parámetro |
| `HAS_ERROR` | Command, Query | ErrorCode | Operación tiene error |

### Relaciones de Dependencia

| Relación | Desde | Hacia | Descripción |
|----------|-------|-------|-------------|
| `REFERENCES` | Any | Any | Wiki-link genérico |
| `DEPENDS_ON` | Any | Any | Dependencia explícita |
| `RELATED_TO` | Entity | Entity | Relación de dominio |

### Relaciones de UI

| Relación | Desde | Hacia | Descripción |
|----------|-------|-------|-------------|
| `DISPLAYS` | UIView | Entity | Vista muestra entidad |
| `USES_COMPONENT` | UIView | UIComponent | Vista usa componente |
| `NAVIGATES_TO` | UIView, UIFlow | UIView | Navegación entre vistas |
| `TRIGGERS` | UIInteraction | Command | Interacción invoca comando |

### Relaciones de Ciclo de Vida

| Relación | Desde | Hacia | Descripción |
|----------|-------|-------|-------------|
| `TRANSITIONS_TO` | State | State | Transición de estado |
| `TRIGGERED_BY` | StateTransition | DomainEvent | Transición disparada por evento |

---

## Dependencias Entre Capas

Las referencias solo pueden ir hacia capas inferiores (nunca hacia arriba).

```
┌─────────────────────────────────────────┐
│  05-verification                        │
│      ↓ puede referenciar                │
├─────────────────────────────────────────┤
│  04-interaction                         │
│      ↓ puede referenciar                │
├─────────────────────────────────────────┤
│  02-behavior                        │
│      ↓ puede referenciar                │
├─────────────────────────────────────────┤
│  02-domain                              │
│      ↓ puede referenciar                │
├─────────────────────────────────────────┤
│  01-problem                             │
│      ✗ no referencia nada               │
└─────────────────────────────────────────┘
```

**Ejemplos válidos:**
- `UC-001` → `[[CMD-001]]` (04 → 03)
- `CMD-001` → `[[Reto]]` (03 → 02)
- `REQ-001` → `[[UC-001]]` (05 → 04)

**Ejemplos inválidos:**
- `Entity` → `[[UC-001]]` (02 → 04)
- `Command` → `[[UI-Home]]` (03 → 04)

---

## Extracción de Nodos

### Desde Front-Matter

```yaml
---
id: CMD-001
title: CreateChallenge
type: command
status: approved
tags: [command]
---
```

Genera nodo:
```json
{
  "id": "CMD-001",
  "type": "Command",
  "title": "CreateChallenge",
  "status": "approved",
  "file": "specs/02-behavior/commands/CMD-001-CreateChallenge.md"
}
```

### Desde Wiki-Links

```markdown
El [[Usuario]] crea un [[Reto]] validando [[BR-RETO-002]].
```

Genera aristas:
```json
[
  { "from": "CMD-001", "to": "Usuario", "type": "REFERENCES" },
  { "from": "CMD-001", "to": "Reto", "type": "MODIFIES" },
  { "from": "CMD-001", "to": "BR-RETO-002", "type": "VALIDATES" }
]
```

### Desde Secciones

```markdown
## Atributos

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| titulo | string | Título del reto |
| estado | enum | Estado actual |
```

Genera nodos secundarios:
```json
[
  { "id": "Reto.titulo", "type": "EntityAttribute", "parent": "Reto", "dataType": "string" },
  { "id": "Reto.estado", "type": "EntityAttribute", "parent": "Reto", "dataType": "enum" }
]
```

### Desde Diagramas Mermaid

```markdown
## Ciclo de Vida

'''mermaid
stateDiagram-v2
    [*] --> Borrador
    Borrador --> Preparado: RETO_PREPARED
    Preparado --> EnAnalisis: SESSION_STARTED
'''
```

Genera nodos y aristas:
```json
{
  "nodes": [
    { "id": "Reto.State.Borrador", "type": "State", "parent": "Reto" },
    { "id": "Reto.State.Preparado", "type": "State", "parent": "Reto" },
    { "id": "Reto.State.EnAnalisis", "type": "State", "parent": "Reto" }
  ],
  "edges": [
    { "from": "Reto.State.Borrador", "to": "Reto.State.Preparado", "type": "TRANSITIONS_TO", "trigger": "RETO_PREPARED" }
  ]
}
```

---

## Esquema de Nodo Base

Todos los nodos comparten estas propiedades:

```typescript
interface KDDNode {
  id: string              // Identificador único
  type: NodeType          // Tipo de nodo
  title: string           // Título legible
  file?: string           // Archivo fuente (si aplica)
  parent?: string         // Nodo padre (para nodos secundarios)
  layer?: Layer           // Capa KDD (01-05)
  status?: Status         // Estado del artefacto
  metadata?: Record<string, unknown>  // Metadatos adicionales
}

type NodeType =
  // Principales
  | 'Entity' | 'DomainEvent' | 'BusinessRule' | 'BusinessPolicy'
  | 'Command' | 'Query' | 'Process'
  | 'UseCase' | 'UIView' | 'UIFlow' | 'UIComponent'
  | 'Requirement' | 'ADR' | 'PRD'
  // Secundarios
  | 'State' | 'StateTransition' | 'StateMachine'
  | 'EntityAttribute' | 'EntityRelationship' | 'Invariant' | 'Constraint'
  | 'InputParameter' | 'OutputField' | 'EventPayload'
  | 'UseCaseStep' | 'AlternativeFlow' | 'ProcessStep' | 'DecisionPoint' | 'GuardCondition'
  | 'UIInteraction' | 'ComponentState' | 'ComponentVariant' | 'FieldValidation'
  | 'TestScenario' | 'AcceptanceCriterion' | 'GherkinScenario'
  | 'ErrorCode' | 'BusinessRuleException'

type Layer = '01-problem' | '02-domain' | '02-behavior' | '04-interaction' | '05-verification'

type Status = 'draft' | 'review' | 'approved' | 'deprecated'
```

---

## Esquema de Arista Base

```typescript
interface KDDEdge {
  from: string            // ID del nodo origen
  to: string              // ID del nodo destino
  type: EdgeType          // Tipo de relación
  metadata?: {
    trigger?: string      // Evento disparador (para transiciones)
    guard?: string        // Condición de guarda
    description?: string  // Descripción de la relación
  }
}

type EdgeType =
  // Entre artefactos
  | 'IMPLEMENTS' | 'PRODUCES' | 'CONSUMES' | 'VALIDATES'
  | 'MODIFIES' | 'READS' | 'EXTENDS' | 'INCLUDES'
  | 'SUPERSEDES' | 'TRACES_TO'
  // Estructurales
  | 'HAS_ATTRIBUTE' | 'HAS_STATE' | 'HAS_RELATIONSHIP'
  | 'HAS_STEP' | 'HAS_PARAMETER' | 'HAS_ERROR'
  // Dependencia
  | 'REFERENCES' | 'DEPENDS_ON' | 'RELATED_TO'
  // UI
  | 'DISPLAYS' | 'USES_COMPONENT' | 'NAVIGATES_TO' | 'TRIGGERS'
  // Ciclo de vida
  | 'TRANSITIONS_TO' | 'TRIGGERED_BY'
```

---

## Referencias

- [Introducción a KDD](/kdd/docs/introducción.md)
- [Referencia KDD para Agentes](/kdd/kdd.md)
- [Convenciones de Escritura](/kdd/docs/convenciones-escritura.md)
