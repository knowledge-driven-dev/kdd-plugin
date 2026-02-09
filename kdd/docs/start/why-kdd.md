---
title: "¿Por qué KDD?"
audience: [tech-lead]
type: explanation
reading_time: "5 min"
status: draft
---

# ¿Por qué KDD?

> Para: Tech Leads y decisores técnicos -- Tiempo: 5 min -- Tipo: Explanation

Este documento argumenta por qué adoptar **Knowledge-Driven Development (KDD)** como metodología de documentación. No repite qué es KDD ni cómo funciona. Si necesitas ese contexto, lee primero *what-is-kdd.md*.

---

## El costo invisible de no documentar

Los equipos que no documentan con estructura pagan un precio que rara vez miden. El conocimiento vive en la cabeza de dos o tres personas. Cuando una de ellas se va de vacaciones, el equipo se bloquea. Cuando un nuevo desarrollador se incorpora, necesita tres semanas de preguntas antes de aportar valor.

Este costo tiene tres formas concretas:

- **Onboarding lento.** Cada persona nueva reconstruye el contexto desde cero preguntando a colegas.
- **Decisiones sin rastro.** Nadie recuerda por qué el Proyecto tiene un límite de 4 tareas ni quién lo decidió.
- **Bugs por ambigüedad.** Un desarrollador implementa una regla de negocio según lo que entendió en una conversación de Slack.

KDD no elimina estos problemas por completo. Los reduce a un nivel manejable porque convierte el conocimiento tácito en artefactos explícitos, versionados y enlazados.

---

## Tres principios, tres problemas resueltos

KDD se sostiene sobre tres principios. Cada uno ataca un problema estructural diferente.

### Docs como fuente de verdad

El principio más provocador: la especificación manda sobre el código. Si la spec dice que un Proyecto terminado es inmutable y el código permite reabrirlo, el bug está en el código.

Esto resuelve el problema de la **autoridad difusa**. En equipos sin KDD, la verdad vive en el código, en un documento de Confluence, en un mensaje de Slack y en la cabeza del PM. Cuatro fuentes que se contradicen. Con KDD, hay una sola fuente y está en el repositorio.

Ejemplo real del proyecto: la regla `BR-PROYECTO-005` define con precisión cuándo un Proyecto transiciona a `terminado`. Incluye los triggers (completar la 4a sesión o cierre manual), los errores que el sistema devuelve si alguien intenta violarlo, y un bloque de código de referencia. Si un desarrollador nuevo necesita entender esta regla, la lee en un archivo. No necesita interrumpir a nadie.

### Docs como conocimiento consultable

Cada spec usa wiki-links (`[[Proyecto]]`, `[[BR-PROYECTO-005]]`) que forman un grafo de conocimiento navegable. Esto convierte la documentación en algo vivo: no es una colección de archivos aislados, sino una red donde cada concepto está conectado con los que dependen de él.

Esto resuelve el problema de la **fragmentación**. En equipos sin KDD, la información del Proyecto está repartida entre un PRD, un ticket de Jira, un componente en Figma y un archivo TypeScript. Con KDD, un Tech Lead puede navegar desde la entidad `Proyecto.md` hasta la regla `BR-PROYECTO-005`, desde ahí hasta el comando `CMD-023-TerminarProyecto` que la implementa, y desde ahí hasta la UI que lo expone al usuario. Todo conectado.

### Docs como código versionado

Las specs viven en `/specs` dentro del repositorio. Se modifican en pull requests. Se revisan como código. Tienen historial en Git.

Esto resuelve el problema de la **obsolescencia**. Los documentos en Confluence o Notion se desactualizan porque viven fuera del flujo de trabajo. Las specs en KDD se actualizan en el mismo PR que cambia el código, porque el reviewer lo exige.

---

## Antes y después

La siguiente tabla compara un equipo sin estructura de documentación frente a uno que adopta KDD. Los escenarios son reales, tomados de situaciones cotidianas.

| Escenario | Sin KDD | Con KDD |
|---|---|---|
| Un dev nuevo necesita entender el ciclo de vida del Proyecto | Pregunta a un compañero que le explica de memoria. La explicación omite un estado. El dev implementa mal una transición. | Lee `Proyecto.md`. Encuentra los 4 estados, las transiciones válidas y un diagrama Mermaid. Implementa en base a la spec. |
| El PM quiere saber por qué el límite de tareas es 4 | Nadie recuerda. Se toma como "así se hizo" y no se cuestiona. | Lee `BR-PROYECTO-005`, sección "Por qué existe". Encuentra la justificación original y puede evaluarla con datos nuevos. |
| QA necesita derivar tests para el comando de eliminar Proyecto | Lee el código fuente para entender las validaciones. Descubre edge cases por prueba y error. | Lee `CMD-003-DeleteProyecto`. Encuentra precondiciones, errores posibles con códigos, y postcondiciones. Cada línea se convierte en un test case. |
| El diseñador pregunta qué estados tiene la tarjeta de Proyecto | El dev responde de memoria: "Borrador, Preparado y Terminado". Olvida "En Análisis". | Consulta `Proyecto.md`, sección Estados. Encuentra los 4 estados con descripciones, y diseña la tarjeta cubriendo todos. |
| Se actualiza una regla de negocio | Alguien actualiza el código. La documentación (si existe) queda desactualizada. Los tests no reflejan la regla nueva. | Se actualiza la spec `BR-PROYECTO-005` en el mismo PR que cambia el código. El reviewer verifica que spec y código estén alineados. |

---

## Beneficios medibles

KDD no es una inversión de fe. Sus beneficios se manifiestan en métricas que un Tech Lead puede observar.

### Onboarding

Un nuevo miembro del equipo lee *what-is-kdd.md* (5 min), la guía de su rol (10 min) y un tutorial (5 min). En 20 minutos tiene contexto suficiente para hacer su primera contribución guiada. Sin KDD, ese mismo proceso toma entre 1 y 3 semanas de preguntas informales.

### Trazabilidad

Cada feature tiene un camino documentado: desde el Objective (OBJ) que la justifica, pasando por el Use Case (UC) que define su flujo, los Commands (CMD) que ejecutan operaciones, las Business Rules (BR) que restringen el comportamiento, hasta la UI View que el usuario ve. Cuando algo falla, el camino inverso te lleva a la causa.

### Consistencia

Los artefactos siguen templates con secciones obligatorias. Un Command siempre tiene Purpose, Input, Preconditions, Postconditions y Possible Errors. Una Business Rule siempre tiene Declaración, Por qué existe, Cuándo aplica y Qué pasa si se incumple. Esta estructura elimina la ambigüedad por omisión.

### Revisión de specs en PRs

Las specs se revisan con el mismo rigor que el código. Un PR que agrega un nuevo Command sin documentar los errores posibles se devuelve, igual que un PR que agrega un endpoint sin manejo de errores. El resultado: documentación que evoluciona al ritmo del código, no un trimestre después.

---

## Objeciones frecuentes

### "Documentar así toma demasiado tiempo"

Documentar una Business Rule toma entre 15 y 30 minutos. Depurar un bug causado por una regla ambigua toma entre 2 horas y 2 días. La inversión se recupera con el primer bug evitado.

### "Las specs se van a desactualizar igual"

No si forman parte del flujo. En KDD, el PR que cambia una regla de negocio incluye el cambio en la spec. El reviewer rechaza PRs que modifican comportamiento sin actualizar la spec correspondiente. La disciplina está en el proceso, no en la buena voluntad.

### "Mi equipo es pequeño, no necesita tanta estructura"

Los equipos pequeños son los que más se benefician. El conocimiento está concentrado en pocas cabezas. Si una persona se ausenta, el impacto es proporcional al tamaño del equipo. KDD protege contra ese riesgo desde el primer día.

### "Ya tenemos Confluence/Notion"

La herramienta no es el problema. El problema es que la documentación vive fuera del flujo de desarrollo. KDD funciona porque las specs están en el mismo repositorio que el código: se versionan juntas, se revisan juntas, se despliegan juntas.

---

## Siguiente paso

Si este argumento te resulta convincente, lee la [Guía para Tech Leads](../guides/tech-lead.md). Explica cómo gobernar specs, revisar PRs de documentación y medir cobertura.

Si necesitas entender la estructura completa de KDD antes de tomar una decisión, lee [Capas explicadas](../concepts/layers-explained.md).
