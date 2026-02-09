---
title: "Trazabilidad en KDD: Del Objetivo al Test"
audience: [tech-lead, qa]
type: explanation
reading_time: "10 min"
status: draft
---

# Trazabilidad en KDD: Del Objetivo al Test

> Para: Tech Leads y QA — Tiempo: 10 min — Tipo: Explanation

Este documento explica cómo KDD conecta cada pieza de conocimiento desde la necesidad de negocio hasta la verificación. Al terminar, entenderás el camino completo: desde que un PM identifica un objetivo hasta que un QA verifica que funciona. Usaremos el flujo de creación de Proyecto del proyecto TaskFlow como ejemplo real.

---

## El problema de la documentación desconectada

En proyectos tradicionales, cada artefacto vive aislado. El PM escribe user stories en Jira. El diseñador crea wireframes en Figma. El Dev implementa a partir de una conversación de Slack. QA escribe tests leyendo la UI desplegada. Cuando algo cambia, nadie sabe qué más debe cambiar.

KDD resuelve esto con trazabilidad bidireccional explícita: puedes navegar desde un requisito de negocio hasta el código que lo implementa, y también desde el código hasta el requisito que lo justifica. Cada artefacto enlaza a los artefactos de los que depende y a los artefactos que dependen de él. Esto crea un grafo de conocimiento navegable.

---

## El Grafo de Conocimiento

KDD organiza el conocimiento en seis capas. Cada capa responde una pregunta diferente sobre el sistema. Las capas superiores dependen de las capas inferiores. Las capas inferiores no conocen las capas superiores.

```
┌──────────────────────────────────────────────────────────┐
│  00-requirements   (¿Por qué construimos esto?)          │
│  INPUT: Alimenta al diseño                               │
│    OBJ, ADR, UV, REL                                     │
└──────────────────────────────────────────────────────────┘
                         ↓ alimenta
┌──────────────────────────────────────────────────────────┐
│  04-verification   (¿Cómo verificamos que funciona?)     │
│      REQ, Gherkin scenarios                              │
│         ↓ references                                     │
├──────────────────────────────────────────────────────────┤
│  03-experience     (¿Cómo lo ve el usuario?)             │
│      UI views, UI components                             │
│         ↓ references                                     │
├──────────────────────────────────────────────────────────┤
│  02-behavior       (¿Qué hace el sistema?)               │
│      UC, CMD, QRY, PROC, XP                              │
│         ↓ references                                     │
├──────────────────────────────────────────────────────────┤
│  01-domain         (¿Qué conceptos existen?)             │
│      Entities, Events, BR                ← BASE          │
└──────────────────────────────────────────────────────────┘
```

La trazabilidad fluye en dos direcciones:

- **Hacia abajo**: Cada artefacto enlaza a los conceptos de dominio que usa.
- **Hacia arriba**: Cada artefacto documenta qué otros artefactos dependen de él.

---

## Ejemplo real: Crear Proyecto en TaskFlow

Veamos cómo funciona la trazabilidad con un caso real: permitir que un usuario cree un nuevo Proyecto para analizar con el método de análisis.

### Paso 1: El PM identifica un Objective (OBJ)

El PM documenta la necesidad de negocio:

**Archivo**: `specs/00-requirements/objectives/OBJ-001-Gestionar-Proyectos.md`

```yaml
---
id: OBJ-001
kind: objective
actor: Usuario
status: approved
---
```

```markdown
## Objetivo

Como Usuario del sistema,
quiero crear y gestionar Proyectos para análisis,
para poder someter mis problemas al método de análisis.

## Criterios de éxito

- Puedo crear un Proyecto con título y descripción.
- El Proyecto queda guardado en mi lista personal.
- Puedo volver a editar el Proyecto antes de iniciar tareas.
```

El OBJ no define **cómo** se implementa. Define **qué** necesita el usuario y **por qué**.

### Paso 2: El PM refina el Objective en Use Cases (UC)

El OBJ es demasiado amplio para implementar. El PM lo descompone en casos de uso específicos:

**Archivo**: `specs/02-behavior/use-cases/UC-001-Crear-Proyecto.md`

```yaml
---
id: UC-001
kind: use-case
actor: Usuario
status: approved
links:
  commands:
    - "[[CMD-001-CreateProyecto]]"
---
```

```markdown
## Flujo Principal

1. El Usuario accede a la opción "Nuevo Proyecto"
2. El Sistema muestra formulario con campo Título
3. El Usuario ingresa el título del proyecto
4. El Sistema valida la longitud (1-100 caracteres)
5. El Usuario confirma
6. El Sistema crea el [[Proyecto]] con estado `borrador`
7. El Sistema emite evento [[EVT-Proyecto-Creado]]
8. El Sistema redirige a configuración de Miembros
```

El UC describe la interacción usuario-sistema. Enlaza a:
- La entidad **Proyecto** que crea el sistema (capa 01-domain).
- El comando **CMD-001** que ejecuta la acción (capa 02-behavior).
- El evento **EVT-Proyecto-Creado** que emite el sistema (capa 01-domain).

### Paso 3: El dominio define la entidad Proyecto

El concepto de Proyecto se documenta en la capa de dominio:

**Archivo**: `specs/01-domain/entities/Proyecto.md`

```yaml
---
id: ENT-Proyecto
kind: entity
status: approved
---
```

```markdown
## Descripción

Representa la pregunta o problema que se somete a análisis mediante
una [[Tarea]] del el método de análisis.

## Atributos

| Atributo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | Identificador único |
| `titulo` | string | Enunciado breve (máx. 100 caracteres) |
| `contenido_md` | string | Contenido estructurado del proyecto |
| `estado` | enum | Estado del ciclo de vida |
| `creador_id` | uuid | Usuario propietario |

## Estados

| Estado | ID | Descripción |
|---|---|---|
| **Borrador** | `borrador` | En configuración, no listo |
| **Preparado** | `preparado` | Listo para iniciar Tareas |
| **En Análisis** | `en_analisis` | Al menos una Tarea iniciada |
| **Terminado** | `terminado` | Cerrado, inmutable |
```

La entidad no sabe cómo se crea ni dónde se muestra. Solo define **qué es** un Proyecto.

### Paso 4: El Dev documenta el Command (CMD)

El comando es la operación atómica que ejecuta el sistema:

**Archivo**: `specs/02-behavior/commands/CMD-001-CreateProyecto.md`

```yaml
---
id: CMD-001
kind: command
status: approved
---
```

```markdown
## Purpose

Creates a new [[Proyecto]] in draft state.

## Input

| Parameter | Type | Required | Validation |
|---|---|---|---|
| titulo | string | Yes | 1-100 chars, not empty |
| userId | UUID | Yes | Must be authenticated user |

## Rules Validated

- [[Proyecto#INV-PROYECTO-001]] - Title required and max 100 chars
- [[BR-PROYECTO-002]] - Max 50 proyectos activos per user
- [[Proyecto#INV-PROYECTO-005]] - Initial state is always `borrador`

## Events Generated

- [[EVT-Proyecto-Creado]] on success

## Possible Errors

| Code | Condition | Message |
|---|---|---|
| PROYECTO-001 | Empty title | "El título es obligatorio" |
| PROYECTO-002 | Title too long | "El título no puede exceder 100 caracteres" |
| PROYECTO-003 | Limit exceeded | "Has alcanzado el límite de 50 proyectos activos" |
```

El comando enlaza a:
- La entidad **Proyecto** que crea.
- Las reglas de negocio **BR-PROYECTO-002** y **INV-PROYECTO-001** que valida.
- El evento **EVT-Proyecto-Creado** que emite.

### Paso 5: El dominio define las Business Rules (BR)

Las restricciones de negocio se documentan explícitamente:

**Archivo**: `specs/01-domain/rules/BR-PROYECTO-002.md`

```yaml
---
id: BR-PROYECTO-002
kind: business-rule
entity: Proyecto
status: approved
---
```

```markdown
## Declaración

Un [[Usuario]] puede tener máximo 50 [[Proyecto|Proyectos]] activos simultáneamente.
Proyectos con estado `terminado` no cuentan para este límite.

## Por qué existe

Este límite previene saturación del sistema y garantiza que los usuarios
mantengan sus proyectos organizados. Forzar el cierre de proyectos antiguos
mejora la experiencia.

## Cuándo aplica

WHEN un Usuario intenta crear un nuevo Proyecto,
the system SHALL count proyectos activos (estados: borrador, preparado, en_analisis)
  AND SHALL reject creation IF count >= 50.

## Qué pasa si se incumple

El Sistema rechaza la operación con error PROYECTO-003.
```

La BR enlaza a la entidad **Proyecto** y al concepto de **Usuario**. Se referencia desde el comando **CMD-001** que la valida.

### Paso 6: QA deriva Requirements (REQ) y tests

QA convierte el UC en requisitos verificables:

**Archivo**: `specs/04-verification/criteria/REQ-001-Crear-Proyecto.md`

```yaml
---
id: REQ-001
kind: requirement
status: approved
source: UC-001
---
```

```markdown
## REQ-001.1: Creación de Proyecto

**Patrón**: Event-Driven

WHEN the user submits the proyecto creation form with a valid title,
the system SHALL create a new Proyecto entity
  AND SHALL assign the authenticated user as owner
  AND SHALL set the status to "borrador".

**Trazabilidad**: UC-001, pasos 7-11

**Criterio de Aceptación**:
Given a logged-in user on the proyecto creation form
When the user enters title "¿Deberíamos expandir al mercado europeo?"
  And clicks "Crear Proyecto"
Then a new Proyecto should be created with status "borrador"
  And a success message should be displayed
```

```markdown
## REQ-001.2: Validación de Longitud

**Patrón**: Unwanted Behavior (If)

IF the title exceeds 100 characters,
the system SHALL reject the form submission
  AND SHALL display error "El título no puede exceder 100 caracteres".

**Trazabilidad**: UC-001 (extensión 4a), BR-PROYECTO-001

**Criterio de Aceptación**:
Given a logged-in user on the proyecto creation form
When the user enters a title with 101 characters
Then an error message should be displayed
  And no API call should be made
```

El REQ enlaza a:
- El **UC-001** del que deriva.
- Las reglas **BR-PROYECTO-002** e **INV-PROYECTO-001** que verifica.
- El comando **CMD-001** que prueba indirectamente.

---

## El Camino Completo

Pongámoslo todo junto. Así fluye la trazabilidad de arrarriba hacia abajo:

```
OBJ-001: Gestionar Proyectos
    ↓ se refina en
UC-001: Crear Proyecto
    ↓ define flujo que ejecuta
CMD-001: CreateProyecto
    ↓ crea instancia de
Proyecto (entidad)
    ↓ valida restricciones de
BR-PROYECTO-002: Max 50 proyectos activos
INV-PROYECTO-001: Título obligatorio 1-100 chars
    ↓ emite
EVT-Proyecto-Creado
    ↓ se verifica con
REQ-001.1: Creación exitosa
REQ-001.2: Validación de longitud
REQ-001.4: Límite de proyectos
    ↓ se prueba con
Gherkin scenario: "Create proyecto with valid title"
```

Y de abajo hacia arriba, desde el código hasta el negocio:

```
Implementación: createProyecto() use case
    ↑ implementa
CMD-001: CreateProyecto
    ↑ referenciado en
UC-001: Crear Proyecto
    ↑ refina
OBJ-001: Gestionar Proyectos
    ↑ justifica la feature
```

---

## Cómo navegar el grafo

### Desde una entidad hacia arriba

Pregunta: "¿Quién usa la entidad Proyecto?"

1. Abre `specs/01-domain/entities/Proyecto.md`.
2. Busca referencias inversas (herramientas como grep o el indexador KDD).
3. Encuentras:
   - **UC-001**, **UC-002**, **UC-003** (use cases que involucran Proyectos).
   - **CMD-001**, **CMD-002**, **CMD-023** (comandos que operan sobre Proyectos).
   - **BR-PROYECTO-002**, **BR-PROYECTO-005** (reglas que restringen Proyectos).
   - **UI-ProyectoForm**, **UI-ProyectoCard** (vistas que muestran Proyectos).

### Desde un comando hacia abajo

Pregunta: "¿Qué conceptos de dominio usa CMD-001?"

1. Abre `specs/02-behavior/commands/CMD-001-CreateProyecto.md`.
2. Lee la sección **Rules Validated**.
3. Encuentras:
   - **Proyecto** (entidad que crea).
   - **BR-PROYECTO-002** (regla que valida).
   - **EVT-Proyecto-Creado** (evento que emite).
4. Haz clic en cada wiki-link para navegar.

### Desde un test hacia el origen

Pregunta: "¿Por qué existe este test?"

1. Abre `specs/04-verification/criteria/REQ-001-Crear-Proyecto.md`.
2. Lee el campo **source** del frontmatter: `UC-001`.
3. Sigue el enlace a `UC-001-Crear-Proyecto.md`.
4. Desde UC-001, sigue el enlace a **OBJ-001**.
5. Ahora sabes: este test existe porque el usuario necesita gestionar proyectos (OBJ-001).

---

## Beneficios de la trazabilidad

### 1. Análisis de impacto

Pregunta: "Si cambiamos la entidad Proyecto, ¿qué más debemos cambiar?"

Respuesta: Busca todas las referencias a `[[Proyecto]]` en las specs. Obtienes:
- **5 Use Cases** que deben revisarse.
- **8 Commands** que operan sobre Proyectos.
- **3 UI Views** que muestran Proyectos.
- **12 Tests** que verifican comportamiento de Proyectos.

Ahora sabes el alcance exacto del cambio antes de escribir una línea de código.

### 2. Validación de cobertura

Pregunta: "¿Todos los requisitos tienen tests?"

Proceso:
1. Lista todos los archivos en `specs/04-verification/criteria/`.
2. Extrae los IDs de requisitos (REQ-001.1, REQ-001.2, etc.).
3. Busca cada ID en los archivos `.feature` de Gherkin.
4. Los requisitos sin tests se identifican automáticamente.

### 3. Onboarding rápido

Pregunta: "Nuevo Dev: ¿cómo funciona la creación de Proyectos?"

Respuesta: Lee en este orden:
1. `OBJ-001-Gestionar-Proyectos.md` — Entiendes **por qué** existe.
2. `UC-001-Crear-Proyecto.md` — Entiendes **qué** hace el sistema.
3. `Proyecto.md` — Entiendes **qué** es un Proyecto.
4. `CMD-001-CreateProyecto.md` — Entiendes **cómo** se ejecuta.
5. `REQ-001-Crear-Proyecto.md` — Entiendes **cómo** se verifica.

Total: 20 minutos.

Sin reuniones. Sin Slack. Sin adivinar.

### 4. Auditoría y compliance

Pregunta: "¿Cómo sabemos que implementamos el requisito REQ-001.4 (límite de 50 proyectos)?"

Trazabilidad:
1. `REQ-001.4` deriva de `BR-PROYECTO-002`.
2. `BR-PROYECTO-002` se valida en `CMD-001`.
3. `CMD-001` se prueba con Gherkin scenario "Create proyecto when limit exceeded".
4. El test pasa en CI.

Conclusión: El requisito está implementado y verificado. Puedes demostrarlo en una auditoría.

---

## Herramientas que aprovechan el grafo

KDD no requiere herramientas especiales, pero el grafo de conocimiento habilita automatizaciones poderosas:

### Validador de specs

```bash
bun run validate:specs
```

Verifica:
- Todos los wiki-links apuntan a archivos existentes.
- Todas las referencias a BR, CMD, UC son válidas.
- Ningún artefacto está huérfano (sin referencias entrantes).

### Generador de diagramas

```bash
bun run graph:entity Proyecto
```

Genera un diagrama Mermaid mostrando:
- Todos los artefactos que usan la entidad Proyecto.
- Todas las relaciones entre esos artefactos.

### Matriz de trazabilidad

```bash
bun run matrix:feature crear-proyecto
```

Genera tabla Markdown:

| Requisito | Use Case | Command | Business Rule | Test Coverage |
|---|---|---|---|---|
| REQ-001.1 | UC-001 | CMD-001 | - | ✓ |
| REQ-001.2 | UC-001 | CMD-001 | INV-PROYECTO-001 | ✓ |
| REQ-001.4 | UC-001 | CMD-001 | BR-PROYECTO-002 | ✓ |

---

## Reglas de trazabilidad

Para que el grafo funcione, cada artefacto debe seguir estas reglas:

### 1. Enlaces explícitos

Usa wiki-links `[[Nombre]]` para referenciar otros artefactos. No uses texto plano como "el comando de crear proyecto". Escribe `[[CMD-001-CreateProyecto]]`.

### 2. Primera mención por sección

Enlaza la primera vez que mencionas una entidad en cada sección. Las menciones posteriores no requieren enlace.

```markdown
# Bien
## Precondiciones
El [[Usuario]] debe estar autenticado.
El Usuario debe tener menos de 50 proyectos activos.

# Innecesario
## Precondiciones
El [[Usuario]] debe estar autenticado.
El [[Usuario]] debe tener menos de 50 [[Proyecto|proyectos]] activos.
```

### 3. Frontmatter de trazabilidad

Los artefactos técnicos declaran sus dependencias en el frontmatter:

```yaml
---
id: UC-001
kind: use-case
links:
  commands:
    - "[[CMD-001-CreateProyecto]]"
  entities:
    - "[[Proyecto]]"
  rules:
    - "[[BR-PROYECTO-002]]"
---
```

### 4. Sección "Trazabilidad" en requisitos

Los requisitos siempre documentan su origen:

```markdown
## REQ-001.2: Validación de longitud

**Trazabilidad**: UC-001 (extensión 4a), INV-PROYECTO-001
```

---

## Antipatrones

### ❌ Referencias vagas

```markdown
# Mal
El sistema valida las reglas de negocio del proyecto.

# Bien
El sistema valida [[BR-PROYECTO-002]] y [[Proyecto#INV-PROYECTO-001]].
```

### ❌ Duplicación de conocimiento

```markdown
# Mal (en CMD-001)
## Validación de Título
El título debe tener entre 1 y 100 caracteres.
No puede estar vacío ni contener solo espacios.

# Bien (en CMD-001)
## Rules Validated
- [[Proyecto#INV-PROYECTO-001]] - Title required and max 100 chars
```

La regla se define **una vez** en `Proyecto.md`. El comando solo la **referencia**.

### ❌ Tests sin origen

```gherkin
# Mal
Scenario: Title validation
  Given a user on proyecto form
  When the user enters 101 characters
  Then an error is shown

# Bien
# REQ-001.2: Validación de Longitud
Scenario: Reject title exceeding 100 characters
  Given a logged-in user on the proyecto creation form
  When the user enters a title with 101 characters
  Then the error "El título no puede exceder 100 caracteres" should be displayed
```

El escenario documenta **qué requisito** verifica.

---

## Conclusión

La trazabilidad no es documentación por documentar. Es la herramienta que convierte especificaciones en conocimiento navegable.

Con trazabilidad explícita:
- Un cambio en una entidad revela automáticamente su impacto.
- Un requisito nuevo muestra inmediatamente qué artefactos debe crear el equipo.
- Un test fallido señala exactamente qué regla de negocio se violó.
- Un nuevo miembro del equipo navega de negocio a código sin ayuda.

KDD construye este grafo de conocimiento desde el primer commit. No como un lujo. Como una práctica básica de ingeniería.

---

## Lecturas relacionadas

- **Conceptos**: Lee `concepts/layers-explained.md` para entender por qué existen seis capas.
- **Conceptos**: Lee `concepts/knowledge-graph.md` para entender la estructura del grafo.
- **Referencia**: Consulta `reference/artifacts.md` para ver qué secciones debe tener cada artefacto.
- **Guía QA**: Lee `guides/qa.md` para aprender a derivar tests desde specs.
- **Tutorial**: Completa `tutorials/spec-to-test.md` para practicar trazabilidad con un caso real.
