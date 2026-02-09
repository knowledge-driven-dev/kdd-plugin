---
title: "Guía KDD para Product Managers"
audience: [pm]
type: how-to
reading_time: "10 min"
status: draft
---

# Guía KDD para Product Managers

> Para: Product Managers · Tiempo: 10 min · Tipo: How-to

Esta guía te muestra cómo usar KDD en tu trabajo diario como PM. Aprenderás qué artefactos crear, cuándo crearlos y cómo organizar features desde la idea hasta producción.

## El problema que resuelves con KDD

Tu trabajo es definir qué construye el equipo y por qué. KDD te da un sistema donde tus decisiones tienen un lugar fijo. Cada requisito queda documentado. Cada cambio tiene trazabilidad. El equipo habla el mismo idioma.

Sin KDD, escribes un doc en Google Docs, lo compartes en Slack, y nadie recuerda dónde quedó. Tres versiones flotan en canales diferentes. Cuando alguien pregunta "¿Por qué decidimos esto?", la respuesta es "Pregúntale a Juan". Si Juan no está, la respuesta se pierde.

Con KDD, tus decisiones viven en `/specs`, junto al código. Se revisan en pull requests. Evolucionan con el producto. Cuando alguien pregunta "¿Por qué?", apuntas a un archivo que tiene la respuesta completa.

## Los artefactos que usarás

Como PM, crearás cinco tipos de artefactos. Aquí están ordenados por frecuencia de uso.

### Objective (OBJ): Lo que el usuario quiere lograr

Un **Objective (OBJ)** captura lo que un usuario necesita y por qué lo necesita. No es una tarea técnica. No dice "implementar el CRUD de proyectos". Dice "El usuario quiere crear un proyecto para analizarlo con miembros".

**Ubicación:** `specs/00-requirements/objectives/OBJ-NNN-NombreCorto.md`

**Cuándo crearlo:** Cuando identificas una necesidad de usuario que aún no está cubierta.

**Ejemplo real del proyecto:**

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

Un OBJ puede generar múltiples Use Cases. Por ejemplo, el objetivo "Compartir un Proyecto" genera tres UCs: generar enlace, revocar enlace, ver Proyecto sin cuenta.

> **Ver**: La referencia completa de Objectives en [reference/artifacts.md](../reference/artifacts.md#objective-obj).

### Use Case (UC): Cómo funciona el flujo

Un **Use Case (UC)** describe el flujo completo de interacción usuario-sistema. Documenta el camino feliz y las excepciones. No habla de tecnología. Habla de lo que el usuario hace y lo que el sistema responde.

**Ubicación:** `specs/02-behavior/use-cases/UC-NNN-NombreUseCase.md`

**Cuándo crearlo:** Cuando refinas un Objective y necesitas documentar el flujo paso a paso.

**Quién colabora:** Tú defines el flujo. El diseñador aporta los casos de error. El dev identifica las validaciones técnicas.

**Estructura clave:**

```markdown
## Flujo Principal
1. El Usuario accede a la opción "Nuevo Proyecto"
2. El Sistema muestra el formulario con el campo título
3. El Usuario ingresa el título del proyecto
4. El Sistema valida en tiempo real (longitud 1-100 caracteres)
5. El Usuario hace clic en "Crear Proyecto"
6. El Sistema crea el Proyecto con estado `borrador`
7. El Sistema emite evento EVT-Proyecto-Creado
8. El Sistema redirige a configuración de Miembros

## Extensiones / Flujos Alternativos

### 3a. Usuario solicita asistencia de IA
1. El Usuario hace clic en "Ayúdame a redactar"
2. El Sistema muestra campo para descripción informal
3. El Usuario describe su problema
4. El Sistema genera sugerencia de título
5. El Usuario acepta, modifica o rechaza
6. Continúa en paso 4 del flujo principal

### 4a. Título demasiado largo
1. El Sistema muestra error: "El título no puede exceder 100 caracteres"
2. El Usuario corrige el título
3. Continúa en paso 5
```

Los flujos alternativos documentan qué pasa cuando las cosas no van por el camino feliz. Cada excepción se convierte en un caso de test.

> **Ver**: La referencia completa de Use Cases en [reference/artifacts.md](../reference/artifacts.md#use-case-uc).

### Business Rule (BR): Por qué funciona así

Una **Business Rule (BR)** define una restricción invariable del dominio. No es configurable. Es una regla que el sistema debe cumplir siempre. Si alguien pregunta "¿Por qué el sistema rechaza esto?", la respuesta debe estar en una BR.

**Ubicación:** `specs/01-domain/rules/BR-ENTIDAD-NNN.md`

**Cuándo crearla:** Cuando descubres una restricción de negocio que no está documentada, o cuando defines una nueva restricción que debe ser permanente.

**Diferencia con Business Policy:** Una BR no cambia sin reconstruir el sistema. Una BP (Business Policy) es configurable. Por ejemplo:

- "El título debe tener máximo 100 caracteres" → BR (restricción fija)
- "El máximo de Miembros por Proyecto es 10" → BP (podría cambiar sin tocar código)

**Secciones obligatorias:**

| Sección | Qué incluir |
|---|---|
| **Declaración** | Qué dice la regla en lenguaje claro |
| **Por qué existe** | Justificación de negocio |
| **Cuándo aplica** | En qué situaciones se valida |
| **Qué pasa si se incumple** | Consecuencias, mensaje de error |
| **Ejemplos** | Casos válidos e inválidos |

> **Ver**: La referencia completa de Business Rules en [reference/artifacts.md](../reference/artifacts.md#business-rule-br).

### Release (REL): Qué va en cada versión

Un **Release (REL)** planifica qué objectives y features van en una versión específica del producto. Funciona como un contrato: "Esto entra, esto no entra, estas son las condiciones para liberar".

**Ubicación:** `specs/00-requirements/releases/REL-NNN-vX.Y.md`

**Cuándo crearlo:** Cuando planificas un sprint o un release.

**Estructura clave:**

```markdown
---
id: REL-003
kind: release
title: v1.2 - Exportaciones
status: draft
target_date: 2025-02-15
---

# REL-003: v1.2 - Exportaciones

## Objetivo
Permitir que los usuarios compartan sus Proyectos fuera de la app.

## Lo que incluye
- [[OBJ-012-Exportar-PDF]]
- [[OBJ-013-Compartir-Link]]

## Lo que NO incluye (pospuesto)
- Exportar a PowerPoint
- Integración con Notion

## Dependencias
- Diseño de PDF aprobado por marketing
- [[ADR-0015-Libreria-PDF]] decidido

## Criterios de salida
- Todos los OBJ en status "approved"
- Tests de aceptación pasando
- QA sign-off
```

La sección "Lo que NO incluye" clarifica el alcance. Evita las sorpresas de último minuto. Cuando alguien pregunta "¿Por qué no está X?", apuntas a esta sección.

> **Ver**: La referencia completa de Releases en [reference/artifacts.md](../reference/releases-rel).

### Architecture Decision Record (ADR): Por qué decidimos esto

Un **Architecture Decision Record (ADR)** documenta decisiones importantes que alguien podría cuestionar en el futuro. No es para decisiones menores. Es para las decisiones que cambian el rumbo del producto.

**Ubicación:** `specs/00-requirements/decisions/ADR-NNNN-TituloDecision.md`

**Cuándo crearlo:**

- Elección de modelo de negocio
- Decisión de NO hacer algo
- Cambio de estrategia importante
- Trade-off entre opciones complejas

**Estructura clave:**

```markdown
---
id: ADR-0005
kind: adr
title: Modelo de puntos en vez de suscripción
status: accepted
date: 2025-01-15
---

# ADR-0005: Modelo de puntos en vez de suscripción

## Contexto
Necesitamos monetizar la aplicación. Evaluamos dos opciones:
suscripción mensual o pago por uso con puntos.

## Opciones consideradas
1. Suscripción mensual ($9.99/mes, proyectos ilimitados)
2. Puntos (pago por uso, 1 Punto = 1 Proyecto completo)

## Decisión
Usaremos puntos (pago por uso).

## Por qué
- Menor fricción para usuarios ocasionales que no usan la app cada semana.
- Más justo: pagas solo por lo que usas.
- Permite promociones y trials sin comprometer MRR.
- Los usuarios corporativos pueden comprar paquetes grandes.

## Consecuencias
**Positivas:**
- Mayor conversión en trial (sin pedir tarjeta).
- Flexibilidad de precios por segmento.

**Negativas:**
- Más complejo de implementar (sistema de puntos, transacciones).
- Hay que comunicar bien el valor de un punto.
- Más difícil predecir ingresos mes a mes.
```

Documenta todas las opciones consideradas. Si solo documentas la que elegiste, nadie entenderá por qué las otras se descartaron.

> **Ver**: La referencia completa de ADRs en [reference/artifacts.md](../reference/architecture-decision-record-adr).

### Value Unit (UV): Cómo organizar implementación

Una **Value Unit (UV)** agrupa artefactos relacionados para implementar en iteraciones. Funciona como un contenedor de features con tracking de estado. Organiza el trabajo del equipo de dev sin mezclar specs con tareas de Jira.

**Ubicación:** `specs/00-requirements/value-units/UV-NNN-NombreCorto.md`

**Cuándo crearla:** Cuando una feature necesita múltiples artefactos (CMD, QRY, UI, BR) y quieres rastrear qué está hecho y qué falta.

**Estructura clave:**

```markdown
---
id: UV-002
kind: value-unit
title: Generación IA de Miembros
status: in-progress
---

# UV-002: Generación IA de Miembros

## Alcance
Implementar generación asistida de Miembros vía IA.

## Implemented
- [x] CMD-024: GenerateMiembroProfile
- [x] UI-MiembroFormDialog con botón "Completar con IA"

## Pending — Iteration: MVP
- [ ] QRY-015: GetMiembroGenerationHistory
- [ ] BR-MIEMBRO-008: Límite de generaciones por usuario

## Out of scope (deferred)
- ~~Generación de múltiples Miembros en batch~~
- ~~Regeneración con feedback del usuario~~
```

La Value Unit NO reemplaza tus tasks de Jira/Linear. Enlaza las tasks en la sección de tracking:

```markdown
## Tracking
- Epic: [PROJ-123](https://linear.app/...)
- Issues: PROJ-124, PROJ-125, PROJ-126
```

> **Ver**: La referencia en [artifacts.md](../reference/artifacts.md) y las reglas en `.claude/rules/kdd-value-units.md`.

## Flujo de trabajo recomendado

Cada feature pasa por cinco fases. Aquí está tu checklist de artefactos por fase.

### Fase 1: Idea

Identificas una necesidad de usuario.

**Qué crear:**
- **OBJ** con status `draft`

**Qué contiene:**
- Actor, objetivo ("Como X, quiero Y, para Z"), criterios de éxito

**Output de esta fase:** Un Objective aprobado por el equipo (status `approved`).

### Fase 2: Refinamiento

Defines el flujo completo y las restricciones de negocio.

**Qué crear:**
- **UC** con flujo principal y excepciones
- **BR** para cada restricción de negocio descubierta

**Quién colabora:**
- Tú defines el flujo principal.
- El diseñador identifica estados de error.
- El dev aporta las validaciones técnicas.

**Output de esta fase:** UC y BRs en status `review`, listas para aprobación.

### Fase 3: Diseño

El diseñador crea las specs de UI basándose en el UC.

**Qué crear (el diseñador):**
- **UI** specs (pantallas y componentes)

**Tu rol en esta fase:** Revisar que la UI cubra todos los flujos del UC.

**Output de esta fase:** UI specs aprobadas, con Figma y estados documentados.

### Fase 4: Planificación

Decides qué va en el próximo release.

**Qué crear:**
- **REL** con objetivos incluidos y criterios de salida
- **UV** (opcional) si la feature necesita múltiples artefactos coordinados

**Output de esta fase:** Un release plan claro con alcance definido.

### Fase 5: Implementación y Verificación

El dev implementa. QA verifica contra los criterios del UC.

**Tu rol en esta fase:**
- Revisar que los artefactos técnicos (CMD, QRY) cubran las BRs.
- Validar que el comportamiento implementado coincide con el UC.

**Output de esta fase:** Feature en producción, todos los artefactos en status `approved`.

## Cuánta documentación según el riesgo

No toda feature necesita la documentación completa. El nivel de detalle depende del riesgo.

| Tipo de feature | Documentación requerida | Ejemplo |
|---|---|---|
| **Crítica** (pagos, seguridad, legal) | OBJ + UC completo + BR + UI + REQ formales | Implementar sistema de puntos |
| **Normal** (funcionalidad estándar) | OBJ + UC + UI básica | Crear un Proyecto |
| **Pequeña** (mejora menor) | OBJ breve, o directo al UC | Añadir tooltip en un botón |
| **Bug fix** | Ninguna (solo actualizar BR si descubres regla no documentada) | Corregir formato de fecha |

Si una feature crítica falla, el impacto es alto. Documenta cada detalle. Si una feature pequeña falla, el impacto es mínimo. Documenta lo esencial.

## Preguntas frecuentes

### ¿Puedo cambiar un artefacto que ya está `approved`?

Sí. Edita el archivo, cambia el status a `review`, y crea un PR para que el equipo revise el cambio. Una vez aprobado, vuelve a `approved`.

Para cambios mayores, crea un ADR explicando por qué cambias la decisión original.

### ¿Cómo conecto KDD con Jira o Linear?

Dos opciones:

**Opción A:** Referencia el OBJ en la descripción de tu Epic de Jira/Linear:

```
Spec: /specs/00-requirements/objectives/OBJ-015.md
```

**Opción B:** Añade una sección de tracking en el OBJ:

```markdown
## Tracking
- Epic: [PROJ-123](https://linear.app/...)
- Issues: PROJ-124, PROJ-125, PROJ-126
```

Usa la opción que funcione mejor para tu equipo. KDD no reemplaza tu herramienta de gestión. La complementa.

### ¿Qué hago cuando descubro conocimiento no documentado?

Si durante una reunión alguien dice "El sistema hace X porque...", y esa razón no está documentada:

1. Pausa la reunión.
2. Pregunta: "¿Dónde está documentado eso?"
3. Si no está documentado, crea un issue para documentarlo.
4. Escribe la BR o el ADR correspondiente.

El conocimiento que vive solo en cabezas de personas se pierde cuando esa persona se va.

### ¿Dónde documento los requisitos no funcionales?

Los NFRs (performance, seguridad, accesibilidad) van en `specs/00-requirements/` con `kind: nfr`:

```markdown
---
id: NFR-001
kind: nfr
title: Tiempo de respuesta
status: approved
---

# NFR-001: Tiempo de respuesta

## Requisito
El 95% de las requests deben responder en menos de 500ms.

## Cómo lo medimos
- APM en producción
- Tests de carga en staging

## Prioridad
Alta - afecta UX directamente
```

### ¿Cómo hago una demo al equipo desde las specs?

Abre el Objective de la feature. Enlaza al Use Case. Muestra el flujo principal en el UC. Enlaza a la UI spec. Muestra cómo se ve. Enlaza a las BRs aplicadas. Explica qué valida el sistema.

Todo está conectado con wiki-links. Navegas como si fuera Wikipedia.

## Herramientas de automatización

Estas herramientas aceleran tu trabajo con specs desde Claude Code:

| Herramienta | Qué hace | Cómo invocar |
|---|---|---|
| `/kdd-author` | Crea artefactos KDD desde una idea conversacional | Escribe `/kdd-author` en Claude Code |
| `/kdd-gaps` | Detecta artefactos faltantes en tu feature | Escribe `/kdd-gaps` |
| `/kdd-iterate` | Aplica cambios a artefactos existentes | Escribe `/kdd-iterate` |
| `/ideation` | Explora y refina una idea de feature | Escribe `/ideation` |
| `/list-entities` | Lista entidades del dominio con atributos | Escribe `/list-entities` |

**Ejemplo**: Escribe `/kdd-author` y describe "Quiero que los usuarios puedan exportar análisis a PDF". El skill te guía paso a paso hasta generar OBJ, UC y BRs.

> **Ver**: [Catálogo completo de herramientas](../reference/tooling.md)

---

## Siguiente paso

Ahora que sabes qué artefactos crear y cuándo, practica con tu primera feature:

1. **Elige** una feature pendiente que conozcas bien.
2. **Crea** el OBJ siguiendo el template en `/kdd/templates/objective.template.md`.
3. **Revisa** el OBJ con un compañero.
4. **Avanza** al UC cuando el OBJ esté aprobado.

> **Tutorial recomendado**: [tutorials/first-objective.md](../tutorials/first-objective.md) te guía paso a paso para crear tu primer Objective con datos reales del proyecto.

> **Referencia rápida**: [reference/cheatsheet.md](../reference/cheatsheet.md) tiene una página con todo lo esencial para consultar mientras trabajas.
