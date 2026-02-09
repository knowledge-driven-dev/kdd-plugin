# KDD: Knowledge-Driven Development

## Prefacio: El Problema que Resolvemos

Existe una paradoja en el desarrollo de software: invertimos enormes esfuerzos en escribir código, pero el conocimiento que lo justifica—el *porqué*, el *qué* y el *cómo*—vive fragmentado en la cabeza de las personas, en tickets de Jira abandonados, en conversaciones de Slack perdidas, en wikis que nadie actualiza.

Cuando un desarrollador nuevo se incorpora al equipo, no le entregamos conocimiento: le entregamos código y le deseamos suerte. Cuando un analista de negocio necesita entender una regla, no consulta una fuente de verdad: pregunta al desarrollador que "estuvo ahí". Cuando queremos verificar que el sistema hace lo que debe, no tenemos especificaciones ejecutables: tenemos esperanzas y pruebas manuales.

**KDD propone invertir esta realidad**: el conocimiento documentado es el artefacto primario; el código es una consecuencia derivada, una caché que puede regenerarse.

---

## Parte I: Fundamentos

### 1.1 ¿Qué es KDD?

**Knowledge-Driven Development** es una metodología que trata la documentación como código: artefactos pequeños y atómicos (Markdown, YAML), versionados en Git, con linters, revisiones de código y pipelines de CI/CD.

Pero KDD es más que una práctica técnica. Es una declaración de intenciones:

> *"El conocimiento del dominio es más valioso y duradero que cualquier implementación concreta. Las tecnologías cambian, los frameworks mueren, las arquitecturas evolucionan. Pero las reglas de negocio, las entidades del dominio, los procesos fundamentales—esos perduran."*

### 1.2 El Manifiesto KDD

1. **Conocimiento explícito** sobre conocimiento tácito
2. **Documentación** sobre código (el código es derivado, regenerable)
3. **Documentos pequeños y conectados** sobre documentos monolíticos
4. **Ejemplos concretos** sobre descripciones abstractas
5. **Automatización** sobre procesos manuales

### 1.3 Los Tres Principios Fundamentales

KDD se sostiene sobre tres principios que, juntos, transforman la documentación de un artefacto secundario a la pieza central del desarrollo de software.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    LOS TRES PRINCIPIOS                          │
│                                                                 │
│   ┌─────────────────┐                                           │
│   │  DOCUMENTACIÓN  │                                           │
│   │  COMO VERDAD    │  ← El código deriva de aquí               │
│   └────────┬────────┘                                           │
│            │                                                    │
│            ▼                                                    │
│   ┌─────────────────┐                                           │
│   │  DOCUMENTACIÓN  │  ← Humanos y máquinas la consultan        │
│   │  COMO           │                                           │
│   │  CONOCIMIENTO   │                                           │
│   └────────┬────────┘                                           │
│            │                                                    │
│            ▼                                                    │
│   ┌─────────────────┐                                           │
│   │  DOCUMENTACIÓN  │  ← Se versiona, testea, despliega         │
│   │  COMO CÓDIGO    │                                           │
│   └─────────────────┘                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Mapeo con Terminología Agil

KDD no depende de terminos como "epica" o "historia de usuario", pero puede mapearse a esa terminologia sin perder rigor.

| Termino agil | Equivalente KDD | Notas |
|-------------|------------------|-------|
| Epica | Release Plan (REL) o Unidad de Valor (UV) | Agrupa varias capacidades end-to-end. |
| Historia de Usuario | Objective (OBJ) | Mantiene el formato "Como X, quiero Y, para Z". |
| Tarea tecnica | Command (CMD) / Query (QRY) / UI View | Depende de la capa donde impacta. |

Este mapeo es opcional y se usa solo si ayuda al equipo a alinear lenguaje con stakeholders.

#### Principio 1: Documentación como Fuente de Verdad

> *"El código es una caché de la especificación. La especificación es la verdad."*

En el desarrollo tradicional, el código es el artefacto primario y la documentación es un subproducto que intenta (y fracasa) mantenerse al día. KDD invierte esta relación:

| Enfoque Tradicional | Enfoque KDD |
|---------------------|-------------|
| El código define qué hace el sistema | La documentación define qué debe hacer el sistema |
| La documentación describe el código | El código implementa la documentación |
| Si divergen, el código tiene razón | Si divergen, hay un bug (en código o en docs) |
| Cambiar comportamiento = cambiar código | Cambiar comportamiento = cambiar spec → regenerar código |

**Implicaciones prácticas:**

1. **Single Source of Truth (SSoT)**: Cada concepto, cada regla, cada decisión tiene un único lugar donde vive. No hay duplicación.

```
/specs/01-domain/rules/BR-RETO-001.md  ← Definición canónica
    ↑
    └── El código, los tests, la UI... todo deriva de aquí
```

2. **El código es derivable**: En el límite, si tienes la especificación completa, podrías regenerar el código. Hoy esto es parcialmente posible (generación de schemas, contratos, scaffolding). Mañana, con IA generativa, será cada vez más real.

3. **La documentación se revisa primero**: Antes de un code review, revisamos si la especificación es correcta. El código es "solo" una implementación de esa especificación.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   FLUJO DE CAMBIO EN KDD                                 │
│                                                          │
│   Requisito nuevo                                        │
│        │                                                 │
│        ▼                                                 │
│   ┌─────────────┐    PR #1                               │
│   │ Actualizar  │ ──────────► Review de especificación   │
│   │ docs KDD    │             (¿Es correcto el cambio?)  │
│   └─────────────┘                                        │
│        │                                                 │
│        ▼                                                 │
│   ┌─────────────┐    PR #2                               │
│   │ Implementar │ ──────────► Review de código           │
│   │ en código   │             (¿Implementa la spec?)     │
│   └─────────────┘                                        │
│        │                                                 │
│        ▼                                                 │
│   Tests verifican que código = especificación            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**¿Por qué es importante?**

Porque el código miente. El código te dice *cómo* funciona algo, pero no te dice:
- *Por qué* funciona así
- *Qué problema* resuelve
- *Qué alternativas* se descartaron
- *Qué restricciones* de negocio aplican

La documentación KDD captura todo esto. Es la memoria institucional que sobrevive a la rotación de personal, a los refactors, a los cambios de tecnología.

---

#### Principio 2: Documentación como Conocimiento

> *"La documentación no es texto muerto. Es conocimiento vivo, consultable por humanos y máquinas."*

La documentación tradicional tiene un problema: se escribe para humanos, pero los humanos no la leen. Se pudre en wikis abandonadas, en Confluence olvidado, en README.md que nadie actualiza.

KDD resuelve esto diseñando la documentación para ser **consumida activamente**, no solo almacenada:

**Para humanos:**
- **Navegable**: enlaces bidireccionales forman un grafo explorable
- **Descubrible**: búsqueda, índices, visualización de conexiones
- **Contextual**: cada documento enlaza a sus dependencias y dependientes

```markdown
# BR-RETO-001: Título Obligatorio

## Declaración
Cuando un [[Usuario]] crea un [[Reto]],
el título es obligatorio y debe tener entre 1 y 100 caracteres.

## Por qué existe
Garantiza que cada Reto tenga una identificación clara.

## Cuándo aplica
- Al crear un Reto
- Al editar el título de un Reto

## Qué pasa si se incumple
La operación se rechaza con error de validación.

## Formalización (opcional)
```
titulo.length >= 1 && titulo.length <= 100
```

## Ejemplos
| Escenario | Entrada | Resultado |
|-----------|---------|-----------|
| Título válido | "Mi Reto" | Aceptado |
| Título vacío | "" | Rechazado |
| Título > 100 chars | "A"*101 | Rechazado |

## Verificación
- [[REQ-001-CrearReto.feature#Escenario: Validación título]]
```

**Para máquinas (agentes, asistentes, herramientas):**

En la era de la IA, la documentación tiene nuevos consumidores. Un sistema bien documentado en KDD puede ser indexado y consultado por asistentes que responden preguntas sobre el dominio:

```
Desarrollador: "¿Cuáles son las restricciones del título de un Reto?"

Asistente: [Consulta base de conocimiento KDD]
           [Recupera BR-RETO-001.md]
           [Recupera ejemplos de verificación]

           "Según la regla de negocio BR-RETO-001, el título de un Reto
            debe tener entre 1 y 100 caracteres. Aquí tienes los ejemplos..."
```

**Implicaciones prácticas:**

1. **Estructura semántica**: Los documentos tienen front-matter YAML con metadatos queryables
2. **Enlaces tipados**: No solo `[[Entidad]]`, sino relaciones con significado
3. **Granularidad atómica**: Un concepto = un archivo = una unidad consultable
4. **Formato procesable**: Markdown + YAML, no PDFs ni Word

```yaml
---
id: BR-RETO-001
kind: business-rule
status: approved
affects:
  - entity: Reto
  - command: CMD-001-CreateChallenge
verified_by:
  - REQ-001-CrearReto.feature#titulo-obligatorio
---
```

**¿Por qué es importante?**

Porque el conocimiento atrapado en la cabeza de las personas no escala. Cada vez que alguien pregunta "¿cómo funciona X?", alguien tiene que dejar lo que está haciendo para explicarlo. Con KDD:

- El onboarding es autoservicio: "Lee el dominio de Retos"
- Las respuestas son consistentes: todos consultan la misma fuente
- Los asistentes multiplican el acceso: preguntas 24/7 sin interrumpir humanos

---

#### Principio 3: Documentación como Código

> *"Si la documentación es la fuente de verdad, debe tratarse con el mismo rigor que el código."*

Este principio cierra el círculo: si la documentación es tan importante, debe tener el mismo ciclo de vida que el código. No es un documento de Word en SharePoint. Es un artefacto versionado, testeado, y desplegado.

**El pipeline de documentación:**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   PIPELINE KDD (Documentación como Código)                      │
│                                                                 │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐        │
│   │         │   │         │   │         │   │         │        │
│   │  EDIT   │──►│  LINT   │──►│  TEST   │──►│ DEPLOY  │        │
│   │         │   │         │   │         │   │         │        │
│   └─────────┘   └─────────┘   └─────────┘   └─────────┘        │
│       │             │             │             │               │
│       ▼             ▼             ▼             ▼               │
│   - Git         - Front-matter  - Enlaces     - Publicar       │
│   - Branch        válido         válidos       índice          │
│   - PR          - Formato       - Ejemplos    - Actualizar     │
│   - Review        correcto       ejecutables   KB              │
│                 - Plantilla     - Cobertura   - Notificar      │
│                   completa       de reglas     cambios         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Parte II: La Estructura Conceptual

### 2.1 El Flujo Cognitivo Top-Down

KDD organiza la documentación siguiendo el proceso mental natural de diseño de software. No es una taxonomía arbitraria: es el camino que recorre la mente al entender y construir un sistema.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   REQUIREMENTS → DOMAIN → BEHAVIOR → EXPERIENCE → VERIFICATION              │
│                                                                              │
│   "¿Por qué?"   "¿Qué      "¿Cómo se     "¿Cómo se     "¿Cómo lo            │
│                  existe?"   comporta?"    presenta?"    probamos?"           │
│                                                                              │
│                                               ↓                              │
│                                                                              │
│                                        ARCHITECTURE                          │
│                                        "¿Cómo se implementa?"                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

Cada nivel **añade compromiso** con la implementación:

| Nivel | Compromiso | Pregunta | Artefactos |
|-------|-----------|----------|------------|
| 00-Requirements | Nulo | ¿Por qué construimos esto? | Objetivos (OBJ), Contexto, ADRs de negocio |
| 01-Domain | Conceptual | ¿Qué conceptos existen? | Entidades, Eventos, Business Rules |
| 02-Behavior | Funcional | ¿Cómo se comporta el sistema? | Comandos, Queries, Use Cases, Procesos, Cross-Policies |
| 03-Experience | Experiencial | ¿Cómo se presenta? | Views (UI Components, Pages, Flows) |
| 04-Verification | Concreto | ¿Cómo sabemos que funciona? | Requisitos EARS, Criterios Gherkin, Contratos |
| 05-Architecture | Técnico | ¿Cómo se implementa? | Charter, ADRs tecnológicos |

### 2.2 Las Seis Capas en Detalle

#### Capa 00: Requirements

Esta capa responde a la pregunta fundamental: **¿Por qué existe este sistema?**

Aquí no hablamos de software. Hablamos de problemas humanos, de contexto de negocio, de objetivos medibles. Un sistema que no tiene claro su "por qué" es un sistema condenado a la deriva.

**Artefactos típicos:**

- **Objetivos (OBJ)**: métricas de éxito y outcomes esperados
- **Contexto de Negocio**: restricciones, stakeholders, sistemas relacionados
- **ADRs de negocio**: decisiones estratégicas no técnicas

> **Nota sobre Lenguaje Ubicuo**: Las definiciones de términos del dominio viven en `/specs/01-domain/entities/`. No se mantiene un glosario separado para evitar duplicación (principio SSoT).

**Ejemplo de Objetivo:**

```markdown
---
id: OBJ-001
kind: objective
status: approved
---

# OBJ-001: Reducir tiempo de toma de decisiones

## Métrica de éxito
Reducir el tiempo promedio de decisión grupal de 2 horas a 30 minutos.

## Cómo lo medimos
- Tiempo desde inicio de sesión hasta generación de análisis final
- Encuesta NPS post-sesión

## Plazo
Q1 2025
```

#### Capa 01: Domain

Esta capa responde: **¿Qué conceptos existen en nuestro universo de problema?**

Aquí aplicamos Domain-Driven Design (DDD) para modelar el dominio de forma pura, sin contaminación de UI ni de tecnología. Es el nivel más estable: las entidades del dominio cambian menos que cualquier otra cosa.

**Artefactos típicos:**
- **Entidades**: objetos con identidad propia (Reto, Sesión, Usuario)
- **Value Objects**: objetos definidos por sus atributos (Dinero, DirecciónEmail)
- **Agregados**: clusters de entidades con una raíz (Reto como aggregate root)
- **Eventos de Dominio**: hechos significativos que han ocurrido (EVT-Reto-Creado)
- **Business Rules (BR)**: invariantes y restricciones que siempre deben cumplirse

**Ejemplo de Business Rule:**

```markdown
---
id: BR-RETO-002
kind: business-rule
status: approved
entity: Reto
---

# BR-RETO-002: Límite de Retos Activos

## Declaración
Un [[Usuario]] no puede tener más de 50 [[Reto]]s en estado activo
(borrador o en_progreso) simultáneamente.

## Por qué existe
Previene abuso del sistema y garantiza recursos disponibles para todos.

## Cuándo aplica
- Al crear un nuevo Reto

## Qué pasa si se incumple
La creación se bloquea con mensaje "Has alcanzado el límite de retos activos".

## Verificación
- [[REQ-001-CrearReto.feature#limite-retos]]
```

**Ejemplo de Evento de Dominio:**

```markdown
---
id: EVT-Reto-Creado
kind: domain-event
status: approved
entity: Reto
---

# EVT-Reto-Creado

## Descripción
Se ha creado un nuevo Reto en el sistema.

## Productor
[[Reto]].crear()

## Payload
```yaml
retoId: UUID
creadorId: UUID
titulo: String
fechaCreacion: DateTime
```

## Consumidores

| Consumidor | Reacción |
|------------|----------|
| [[PROC-Notificaciones]] | Envía confirmación al creador |


#### Capa 02: Behavior

Esta capa responde: **¿Cómo se comporta el sistema?**

Aquí definimos las operaciones posibles sobre el dominio. Esta capa incluye tanto las operaciones atómicas (Comandos, Queries) como la orquestación de alto nivel (Use Cases, Procesos).

**Artefactos típicos:**
- **Comandos (CMD)**: acciones que modifican el estado
- **Queries (QRY)**: peticiones de información
- **Use Cases (UC)**: escenarios completos usuario-sistema
- **Procesos (PROC)**: flujos que orquestan múltiples operaciones
- **Cross-Policies (XP)**: reglas que aplican a múltiples entidades

**Ejemplo de Comando:**

```markdown
---
id: CMD-001-CreateChallenge
kind: command
status: approved
---

# CMD-001-CreateChallenge

## Propósito
Crear un nuevo Reto en estado borrador.

## Entrada
| Parámetro | Tipo | Requerido |
|-----------|------|-----------|
| titulo | String(1-100) | Sí |
| descripcion | String(0-2000) | No |
| creadorId | UUID | Sí |

## Precondiciones
- Usuario autenticado
- [[BR-RETO-002]]: menos de 50 retos activos

## Postcondiciones
- Reto creado en estado `borrador`
- Evento [[EVT-Reto-Creado]] emitido

## Errores posibles
| Código | Condición |
|--------|-----------|
| RETO-001 | Título inválido |
| RETO-002 | Límite de retos alcanzado |
```

**Ejemplo de Use Case:**

```markdown
---
id: UC-001-CrearReto
kind: use-case
status: approved
actor: Usuario
---

# UC-001: Crear Reto

## Contexto
| Elemento | Descripción |
|----------|-------------|
| Actor | Usuario autenticado |
| Objetivo | Crear un nuevo reto de pensamiento estructurado |
| Precondición | Usuario tiene menos de 50 retos activos |
| Postcondición | Existe un nuevo Reto en estado borrador |

## Flujo Principal
1. El Usuario accede a "Nuevo Reto"
2. El sistema muestra el formulario de creación
3. El Usuario ingresa título (obligatorio) y descripción (opcional)
4. El Usuario confirma la creación
5. El sistema valida los datos contra [[BR-RETO-001]] y [[BR-RETO-002]]
6. El sistema crea el Reto mediante [[CMD-001-CreateChallenge]]
7. El sistema redirige a configuración de Personas Sintéticas

## Comandos invocados
- [[CMD-001-CreateChallenge]]

## Reglas que valida
- [[BR-RETO-001]]: Título obligatorio
- [[BR-RETO-002]]: Límite de retos activos
```

#### Capa 03: Experience

Esta capa responde: **¿Cómo se presenta el sistema al usuario?**

Aquí definimos la capa de presentación: cómo se visualizan los datos y cómo se navega. Esta capa consume los Use Cases de 02-Behavior pero se enfoca en la representación visual.

**Artefactos típicos:**
- **UI Components**: componentes reutilizables
- **UI Views (Pages)**: pantallas completas
- **UI Flows**: secuencias de navegación

**Ejemplo de UI View:**

```markdown
---
id: UI-Dashboard
kind: ui-view
status: draft
---

# UI-Dashboard: Panel Principal

## Propósito
Mostrar al Usuario sus Retos activos y acceso rápido a acciones principales.

## Consume
- [[QRY-001-ListarRetosUsuario]]
- [[QRY-002-EstadisticasUsuario]]

## Secciones
1. **Header**: Bienvenida + botón "Nuevo Reto"
2. **Estadísticas**: Retos totales, sesiones completadas
3. **Lista de Retos**: Cards con título, estado, última actividad

## Acciones disponibles
| Acción | Destino |
|--------|---------|
| Click en Reto | [[UI-DetalleReto]] |
| Click "Nuevo Reto" | [[UC-001-CrearReto]] |
```

#### Capa 04: Verification

Esta capa responde: **¿Cómo sabemos que funciona?**

Aquí cerramos el círculo: convertimos todo el conocimiento anterior en **evidencia ejecutable**. Los requisitos formales (EARS), los criterios de aceptación (Gherkin), los contratos de API.

**Artefactos típicos:**
- **Requisitos EARS**: especificaciones formales no ambiguas
- **Criterios Gherkin**: escenarios Given/When/Then ejecutables
- **Contratos API**: especificaciones OpenAPI, schemas

**Ejemplo de Requisito EARS:**

```markdown
---
id: REQ-001
kind: requirements
source: UC-001-CrearReto
---

# Requisitos EARS: Crear Reto

## REQ-001.1: Creación exitosa (Event-Driven)

**Patrón**: Event-Driven

WHEN the user submits the challenge creation form with a valid title,
the system SHALL create a new Challenge entity
  AND SHALL assign the authenticated user as owner
  AND SHALL set the status to "borrador"
  AND SHALL redirect to persona configuration.

**Trazabilidad**: UC-001-CrearReto, pasos 4-7

**Criterio de Aceptación**:
```gherkin
Given a logged-in user with less than 50 active challenges
When the user submits title "Mi nuevo reto"
Then a new Challenge should be created with status "borrador"
  And the user should be redirected to /retos/{id}/personas
```
```

#### Capa 05: Architecture

Esta capa responde: **¿Cómo se implementa técnicamente?**

Es el puente entre las especificaciones verificadas y el código. Define el stack tecnológico, las convenciones, y cómo se mapean los artefactos KDD a código.

**Artefactos típicos:**
- **Implementation Charter**: stack oficial y convenciones
- **ADRs tecnológicos**: decisiones de frameworks, patrones, infraestructura

**Ejemplo de mapeo en el Charter:**

| Artefacto KDD | Output | Ubicación |
|---------------|--------|-----------|
| `CMD-*` | Use Case + Zod schema | `apps/api/src/application/use-cases/` |
| `UC-*` | Handler + test BDD | `apps/api/src/application/use-cases/` |
| `UI-*` | Component + Storybook | `apps/web/components/` |
| `BR-*` | Domain service | `apps/api/src/domain/services/` |

---

## Parte III: Estructura de Carpetas

### 3.1 La Estructura Recomendada

```
/specs
│
├── /00-requirements
│   ├── objectives/
│   │   └── OBJ-001-ReducirTiempoDecision.md
│   ├── context.md
│   └── /decisions
│       └── ADR-001-ModeloNegocio.md
│
├── /01-domain
│   ├── /entities
│   │   ├── Reto.md              # kind: entity
│   │   ├── Sesion.md            # kind: entity
│   │   ├── Usuario.md           # kind: entity
│   │   └── Email.md             # kind: value-object
│   ├── /events
│   │   ├── EVT-Reto-Creado.md
│   │   └── EVT-Sesion-Iniciada.md
│   └── /rules
│       ├── BR-RETO-001.md
│       ├── BR-RETO-002.md
│       └── _rules-index.md
│
├── /02-behavior
│   ├── /commands
│   │   ├── CMD-001-CreateChallenge.md
│   │   └── CMD-002-ConfigurePersonas.md
│   ├── /queries
│   │   └── QRY-001-ListarRetosUsuario.md
│   ├── /use-cases
│   │   ├── UC-001-CrearReto.md
│   │   └── UC-002-ConfigurarPersonas.md
│   ├── /processes
│   │   └── PROC-001-SesionCompleta.md
│   └── /policies
│       └── XP-AUDIT-001.md
│
├── /03-experience
│   ├── /views
│   │   ├── UI-Dashboard.md
│   │   └── UI-DetalleReto.md
│   ├── /components
│   │   └── UI-RetoCard.md
│   └── /flows
│       └── Flow-CrearReto.md
│
├── /04-verification
│   ├── /criteria
│   │   ├── REQ-001-CrearReto.md
│   │   └── REQ-002-ConfigurarPersonas.md
│   ├── /contracts
│   │   └── api-retos.yaml
│   └── _TRACEABILITY.md
│
└── /05-architecture
    ├── charter.md
    └── /decisions
        ├── ADR-0001-Bun-Runtime.md
        └── ADR-0002-Elysia-Backend.md
```

### 3.2 Estructura Multi-Dominio (Opcional)

Para aplicaciones grandes con múltiples bounded contexts, KDD soporta una estructura multi-dominio:

```
/specs
├── _shared/                  # Políticas y glosario transversal
│   ├── policies/             # XP-* políticas cross-domain
│   └── domain-map.md         # Visualización de dependencias
├── domains/
│   ├── core/                 # Dominio fundacional
│   │   ├── _manifest.yaml    # Metadatos y dependencias
│   │   ├── 01-domain/
│   │   └── ...
│   ├── auth/                 # Dominio de autenticación
│   └── sessions/             # Dominio de sesiones
└── _index.json               # Índice global
```

**Características principales:**
- Cada dominio tiene su propio `_manifest.yaml` que declara dependencias
- Referencias cross-domain usan sintaxis `[[domain::Entity]]` (ej: `[[core::Usuario]]`)
- El validador detecta y valida automáticamente ciclos de dependencias

**Cuándo usar multi-dominio:**
| Usar Multi-Dominio | Usar Monolítico |
|--------------------|-----------------|
| Múltiples bounded contexts | Un solo bounded context |
| Equipos trabajando en paralelo | Equipo pequeño |
| 50+ artefactos de especificación | Menos de 50 artefactos |

Ver documentación completa: `/kdd/docs/multi-domain.md`

### 3.3 Convenciones de Nombrado

| Tipo | Formato ID | Ejemplo |
|------|------------|---------|
| Objective | OBJ-NNN | OBJ-001 |
| Business Rule | BR-{ENTITY}-NNN | BR-RETO-001 |
| Domain Event | EVT-{Entity}-{Action} | EVT-Reto-Creado |
| Command | CMD-NNN-{Name} | CMD-001-CreateChallenge |
| Query | QRY-NNN-{Name} | QRY-001-ListarRetos |
| Use Case | UC-NNN-{Name} | UC-001-CrearReto |
| Process | PROC-NNN-{Name} | PROC-001-SesionCompleta |
| Cross-Policy | XP-{SCOPE}-NNN | XP-AUDIT-001 |
| UI View | UI-{Name} | UI-Dashboard |
| Requirement | REQ-NNN | REQ-001 |

### 3.4 Front-Matter Estándar

Cada archivo debe incluir metadatos en YAML usando el atributo `kind`:

```yaml
---
id: BR-RETO-001
kind: business-rule  # entity | value-object | aggregate | domain-event |
                     # business-rule | command | query | use-case | process |
                     # cross-policy | ui-view | ui-component | ui-flow |
                     # requirements | objective | adr
status: approved     # draft | review | approved | deprecated
owner: "@ana.garcia"
created: 2025-01-10
last_modified: 2025-01-15
version: 1.2
---
```

---

## Parte IV: El Grafo de Conocimiento

### 4.1 La Red de Enlaces

El poder de KDD en Obsidian está en los **enlaces bidireccionales**. No son decoración: son la estructura del conocimiento.

```
                    ┌─────────────────┐
                    │   OBJ           │
                    │   (Requirements)│
                    └────────┬────────┘
                             │ define objetivos para
                             ▼
                    ┌─────────────────┐    ┌──────────────┐
                    │   Entidades     │───►│   Eventos    │
                    │   (Domain)      │    │              │
                    └────────┬────────┘    └──────┬───────┘
                             │ restringidas por   │
                             ▼                    │
                    ┌─────────────────┐           │
                    │   Business      │◄──────────┘
                    │   Rules         │    disparan
                    └────────┬────────┘
                             │ implementadas en
                             ▼
                    ┌─────────────────┐
                    │   Comandos /    │
                    │   Use Cases     │
                    │   (Behavior)    │
                    └────────┬────────┘
                             │ presentados en
                             ▼
                    ┌─────────────────┐
                    │   Views         │
                    │   (Experience)  │
                    └────────┬────────┘
                             │ verificados por
                             ▼
                    ┌─────────────────┐
                    │   Requisitos    │
                    │   (Verification)│
                    └────────┬────────┘
                             │ guiados por
                             ▼
                    ┌─────────────────┐
                    │   Charter       │
                    │   (Architecture)│
                    └─────────────────┘
```

---

## Parte V: Integración con el Desarrollo

### 5.1 KDD en el Flujo de Trabajo

```
┌─────────────────────────────────────────────────────────────────┐
│                        CICLO KDD                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. DESCUBRIMIENTO                                              │
│     ├── Event Storming / Domain Storytelling                    │
│     ├── Identificar entidades, eventos, reglas                  │
│     └── Documentar en /01-domain                                │
│                                                                 │
│  2. ESPECIFICACIÓN                                              │
│     ├── Definir comandos y use cases (/02-behavior)             │
│     ├── Diseñar vistas (/03-experience)                         │
│     └── Crear requisitos EARS (/04-verification)                │
│                                                                 │
│  3. IMPLEMENTACIÓN                                              │
│     ├── Consultar charter (/05-architecture)                    │
│     ├── El código implementa los comandos                       │
│     └── Los tests verifican los requisitos                      │
│                                                                 │
│  4. VALIDACIÓN                                                  │
│     ├── CI ejecuta los tests BDD                                │
│     ├── Si falla: ¿bug en código o spec desactualizada?         │
│     └── Actualizar lo que corresponda                           │
│                                                                 │
│  5. EVOLUCIÓN                                                   │
│     ├── Nuevos requisitos → volver a paso 1                     │
│     ├── Documentación viaja con el cambio                       │
│     └── El grafo de conocimiento crece                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Parte VI: Preguntas Frecuentes

### ¿KDD reemplaza a Scrum/Kanban?

No. KDD es ortogonal a la metodología de gestión. Puedes usar KDD con Scrum, Kanban, o waterfall. KDD define *qué documentar y cómo*; tu metodología define *cuándo y quién*.

### ¿No es demasiada documentación?

La documentación excesiva es la que nadie lee ni mantiene. KDD produce documentación *útil* porque:
- Es granular (cambias solo lo que cambia)
- Es verificable (los tests fallan si miente)
- Es navegable (encuentras lo que buscas)
- Es consumible por humanos Y máquinas

### ¿Cómo empiezo si ya tengo un sistema existente?

1. Empieza por las entidades del dominio
2. Documenta las reglas de negocio más críticas
3. Añade requisitos EARS para esas reglas
4. Expande incrementalmente

No intentes documentar todo de golpe. Documenta lo que tocas.

### ¿Obsidian es obligatorio?

No. Puedes usar cualquier sistema que soporte:
- Archivos Markdown con front-matter YAML
- Enlaces entre archivos
- Versionado en Git

Alternativas: VS Code + extensiones, Foam, Logseq.

---

## Conclusión: El Conocimiento como Activo

El código envejece. Los frameworks mueren. Las arquitecturas se reescriben.

Pero el conocimiento del dominio—las reglas de negocio, las entidades, los procesos—ese conocimiento es el verdadero activo de tu organización. Es lo que distingue a tu sistema de un CRUD genérico.

KDD es una apuesta: **si invertimos en documentar bien ese conocimiento, el desarrollo se vuelve más predecible, el onboarding más rápido, la comunicación más clara, y la automatización posible**.

El grafo de conocimiento crece un nodo a la vez.

---

## Artefactos Relacionados

- [[00-requirements]] - Capa de Requisitos y Objetivos
- [[01-domain]] - Capa de Dominio
- [[02-behavior]] - Capa de Comportamiento
- [[03-experience]] - Capa de Experiencia
- [[04-verification]] - Capa de Verificación
- [[05-architecture]] - Capa de Arquitectura

## Documentación Avanzada

- [[multi-domain]] - Soporte para múltiples bounded contexts
- [[convenciones-escritura]] - Convenciones de escritura detalladas
- [[validacion-especificaciones]] - Sistema de validación de specs

---

*KDD: Knowledge-Driven Development*
*Versión 2.0 - 2025-01*
*Licencia: CC BY-SA 4.0*
