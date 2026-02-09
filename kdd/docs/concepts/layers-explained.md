---
title: "Por Qué KDD Organiza el Conocimiento en Seis Capas"
audience: [tech-lead, pm, designer, dev, qa]
type: explanation
reading_time: "10 min"
status: draft
---

# Por Qué KDD Organiza el Conocimiento en Seis Capas

> Para: Curiosos y Tech Leads — Tiempo: 10 min — Tipo: Explanation

Esta guía explica por qué KDD estructura las especificaciones en seis capas. Responde tres preguntas: ¿por qué seis capas?, ¿por qué en ese orden?, y ¿qué pasa si saltas una?

Al terminar, entenderás el razonamiento detrás de la arquitectura de KDD. Conocerás el flujo cognitivo que guía el diseño de cualquier sistema.

---

## El Problema: Documentación sin Estructura

En proyectos tradicionales, la documentación se acumula sin un plan claro. El resultado es un conjunto de archivos que nadie puede navegar:

- El Product Requirements Document describe features, pero no conecta con el código.
- Los diagramas de arquitectura viven en una presentación que nadie actualiza.
- El código implementa reglas que no están escritas en ningún lado.
- Los tests validan comportamientos que no tienen especificación.

Cada artefacto vive aislado. Cuando alguien pregunta "¿por qué funciona así?", la respuesta es "porque siempre ha sido así" o "porque lo decidió el dev que ya no está aquí".

KDD resuelve esto con una estructura que **refleja cómo pensamos** al diseñar sistemas.

---

## El Flujo Cognitivo: De la Motivación a la Verificación

Cuando diseñas un sistema, tu mente sigue un recorrido natural. KDD captura ese recorrido en seis capas. Cada capa responde una pregunta diferente:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   00-Requirements    "¿Por qué existe este sistema?"             │
│         ↓                                                        │
│   01-Domain          "¿Qué conceptos existen en el problema?"    │
│         ↓                                                        │
│   02-Behavior        "¿Cómo se comporta el sistema?"             │
│         ↓                                                        │
│   03-Experience      "¿Cómo lo ven los usuarios?"                │
│         ↓                                                        │
│   04-Verification    "¿Cómo sabemos que funciona?"               │
│         ↓                                                        │
│   05-Architecture    "¿Cómo lo construimos técnicamente?"        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

Este flujo no es arbitrario. Es el orden en que tu mente modela el problema cuando diseñas bien.

---

## Capa 00: Requirements (El Por Qué)

### La Pregunta

¿Por qué existe este sistema?

### El Propósito

Captura el problema, los usuarios objetivo, los objetivos de negocio y las métricas de éxito. Sin esta capa, construyes soluciones buscando problemas.

### Lo Que Contiene

- **PRD**: El documento central que define la visión del producto.
- **Objectives (OBJ)**: Objetivos de los usuarios en formato User Story.
- **Value Units (UV)**: Unidades de entrega end-to-end.
- **Release Plans (REL)**: Agrupaciones de UVs en entregas.
- **ADRs**: Decisiones estratégicas de negocio.

### Ejemplo del Proyecto TaskFlow

El PRD de TaskFlow explica que los equipos enfrentan decisiones complejas donde las perspectivas individuales dominan y las emociones se mezclan con los hechos. El sistema existe para estructurar el pensamiento con Miembros.

```markdown
## El Problema

Los equipos toman decisiones sesgadas porque no hay estructura
para explorar alternativas. El Método TaskFlow ayuda, pero su
aplicación manual es difícil y limitada.
```

Este párrafo justifica cada decisión posterior. Si alguien propone una feature que no resuelve este problema, la respuesta es clara: no entra.

### Por Qué Es la Primera Capa

Porque **ancla** todo lo demás. Cuando las cosas se complican (y siempre se complican), vuelves aquí. "¿Deberíamos añadir esta feature?" → ¿Resuelve el problema definido?

---

## Capa 01: Domain (El Qué Existe)

### La Pregunta

¿Qué conceptos existen en nuestro universo de problema?

### El Propósito

Define las entidades, los value objects, las reglas de negocio y los eventos del dominio. Esta capa es la **base** del sistema: el conocimiento más estable y valioso.

### Lo Que Contiene

- **Entities**: Objetos con identidad única (Proyecto, Tarea, Usuario).
- **Value Objects**: Objetos sin identidad, definidos por sus atributos (Money, ColorEtiqueta).
- **Business Rules (BR)**: Restricciones invariables del dominio.
- **Events (EVT)**: Hechos significativos que han ocurrido.

### Ejemplo del Proyecto TaskFlow

La entidad **Proyecto** representa la pregunta o problema que se somete a análisis. Un Proyecto tiene un ciclo de vida con estados: borrador, preparado, en análisis, terminado. La regla **BR-PROYECTO-005** establece que un Proyecto transiciona a terminado cuando alcanza 4 tareas o cuando el Usuario lo cierra manualmente.

El dominio define **qué es** un Proyecto. Las capas superiores definen **qué se puede hacer** con él.

### Por Qué Es la Segunda Capa

Porque el dominio es **puro**: no depende de frameworks, bases de datos ni UIs. El código cambia. Los frameworks mueren. Las bases de datos se migran. Pero las reglas de negocio permanecen:

```
2015: "Un Proyecto debe tener entre 3 y 6 Miembros"
2020: "Un Proyecto debe tener entre 3 y 6 Miembros"
2025: "Un Proyecto debe tener entre 3 y 6 Miembros"
```

El framework cambió tres veces. La regla sigue siendo la misma.

---

## Capa 02: Behavior (El Cómo se Comporta)

### La Pregunta

¿Cómo se comporta el sistema?

### El Propósito

Define las operaciones posibles sobre el dominio: Commands (escritura), Queries (lectura), Use Cases (flujos actor-sistema), Processes (orquestación compleja), y Policies (comportamientos condicionados).

### Lo Que Contiene

- **Commands (CMD)**: Operaciones que modifican estado (CreateProyecto, InitiateSession).
- **Queries (QRY)**: Operaciones de solo lectura (ListProyectos, GetPuntoBalance).
- **Use Cases (UC)**: Flujos de interacción que describen cómo un actor logra un objetivo.
- **Processes (PROC)**: Orquestaciones de múltiples Commands que reaccionan a eventos.
- **Policies (BP/XP)**: Reglas de comportamiento configurables o transversales.

### Ejemplo del Proyecto TaskFlow

El **Use Case UC-001** (Crear Proyecto) describe el flujo completo: el Usuario accede al formulario, ingresa título y descripción, el Sistema valida las reglas **BR-PROYECTO-002** y **BR-PROYECTO-005**, crea el Proyecto, emite el evento **EVT-Proyecto-Creado**, y redirige a la configuración de Miembros.

El UC invoca el **Command CMD-001** (CreateProyecto) para ejecutar la operación. El Command valida el input, aplica las reglas, modifica el estado y emite el evento.

### Por Qué Es la Tercera Capa

Porque el comportamiento **orquesta** el dominio. Los Commands y Queries usan entidades, validan reglas y emiten eventos. Los Use Cases cuentan la historia completa de cómo se logra un objetivo.

Esta capa responde: "Si el dominio define **qué** es un Proyecto, ¿cómo lo **creo**? ¿Cómo lo **consulto**? ¿Cómo lo **modifico**?"

---

## Capa 03: Experience (El Cómo lo Ven)

### La Pregunta

¿Cómo se presenta el sistema al usuario?

### El Propósito

Especifica las interfaces visuales: páginas, componentes, modales. Esta capa define **cómo los usuarios ven y activan** el comportamiento del sistema.

### Lo Que Contiene

- **Views (UI)**: Especificaciones de pantallas completas con layout, estados, comportamiento y responsive.
- **Components (UI)**: Piezas reutilizables de UI.
- **Modals**: Overlays sobre vistas principales.

### Ejemplo del Proyecto TaskFlow

La vista **UI-CrearProyecto** muestra un formulario con dos campos: título (obligatorio, 1-100 caracteres) y descripción (obligatoria). Al hacer clic en "Crear Proyecto", la vista invoca el **Command CMD-001**. Si el comando falla, muestra mensajes de error. Si tiene éxito, redirige a la configuración de Miembros.

La especificación UI documenta cinco estados: idle, loading, success, error y validation-error. Cada estado tiene un diseño visual específico.

### Por Qué Es la Cuarta Capa

Porque la experiencia **consume** el comportamiento. Las vistas no definen lo que el sistema hace. Las vistas invocan Commands y muestran resultados de Queries.

Esta separación es crucial: el mismo Command puede invocarse desde una web, una CLI, una API o un test automatizado. La lógica de negocio no depende de la UI.

---

## Capa 04: Verification (El Cómo Sabemos que Funciona)

### La Pregunta

¿Cómo verificamos que el sistema hace lo que debe hacer?

### El Propósito

Define requisitos formales (EARS), criterios de aceptación (Gherkin) y esquemas de tests. Esta capa cierra el ciclo: transforma especificaciones abstractas en criterios verificables.

### Lo Que Contiene

- **Requirements (REQ)**: Requisitos formales con sintaxis EARS (WHEN/IF/WHILE/SHALL).
- **Feature Files**: Escenarios Gherkin con Given/When/Then.
- **Test Mappings**: Conexión explícita entre specs y tests.

### Ejemplo del Proyecto TaskFlow

El requisito **REQ-001** formaliza el caso de uso **UC-001**:

```markdown
WHEN el Usuario submits el formulario de crear Proyecto con título y descripción válidos,
the Sistema SHALL crear un nuevo Proyecto en estado "borrador"
  AND SHALL asignar el Usuario actual como creador
  AND SHALL emitir evento EVT-Proyecto-Creado
  AND SHALL redirigir a la configuración de Miembros.
```

El test `crear-proyecto.feature` verifica este requisito:

```gherkin
Scenario: Usuario crea un Proyecto válido
  Given el Usuario está autenticado
  When el Usuario crea un Proyecto con:
    | titulo      | Mi primer proyecto |
    | descripcion | Análisis de decisión |
  Then el Sistema crea un Proyecto en estado "borrador"
  And emite el evento "EVT-Proyecto-Creado"
```

### Por Qué Es la Quinta Capa

Porque la verificación **valida** todas las capas anteriores. Los tests no son un anexo. Son la culminación del trabajo de diseño. En KDD, cuando implementas un Command, el test ya existe como especificación ejecutable.

---

## Capa 05: Architecture (El Cómo lo Construimos)

### La Pregunta

¿Cómo construimos esto técnicamente?

### El Propósito

Documenta decisiones técnicas: stack, patrones arquitectónicos, integraciones, deployment, seguridad. Esta capa está **separada** de las capas de dominio porque cambia más frecuentemente.

### Lo Que Contiene

- **ADRs técnicos**: Decisiones de arquitectura (por qué el framework backend, por qué el ORM, por qué el runtime).
- **Infrastructure specs**: Deployment, CI/CD, monitoreo.
- **Integration specs**: Conexión con servicios externos (OpenAI, Stripe, Auth providers).

### Ejemplo del Proyecto TaskFlow

El **ADR-0002** documenta la elección de tu framework backend como backend framework:

```markdown
## Decisión

Usamos nuestro framework backend con nuestro runtime.

## Justificación

- Rendimiento superior a Express/Fastify.
- Integración nativa con tu runtime (sin transpilación).
- Tipo-seguridad end-to-end con Eden.
- Ecosistema moderno con plugins bien diseñados.
```

### Por Qué Es la Sexta Capa

Porque la arquitectura es lo más **volátil**. Los frameworks evolucionan. Los servicios externos cambian de API. Los requisitos de infraestructura se ajustan según la escala.

Separar las decisiones técnicas de las capas de dominio permite cambiar stack sin reescribir la lógica de negocio.

---

## El Principio de Dependencia Unidireccional

Las seis capas no son solo una lista. Tienen un orden de **dependencia**:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   00-Requirements (INPUT - fuera del flujo de capas)             │
│       │                                                          │
│       │  alimenta el diseño                                      │
│       ▼                                                          │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  05-Architecture   (decisiones técnicas)                 │  │
│   │      ↓ referencia opcional                               │  │
│   ├──────────────────────────────────────────────────────────┤  │
│   │  04-Verification   (tests, requisitos formales)          │  │
│   │      ↓ referencia                                        │  │
│   ├──────────────────────────────────────────────────────────┤  │
│   │  03-Experience     (vistas, componentes UI)              │  │
│   │      ↓ referencia                                        │  │
│   ├──────────────────────────────────────────────────────────┤  │
│   │  02-Behavior       (commands, queries, use cases)        │  │
│   │      ↓ referencia                                        │  │
│   ├──────────────────────────────────────────────────────────┤  │
│   │  01-Domain         (entidades, reglas, eventos) ← BASE   │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### La Regla

Las capas superiores **pueden referenciar** las capas inferiores. Las capas inferiores **no conocen** las capas superiores.

### Ejemplos Concretos

**✅ Válido: Un Command referencia una Entidad**

```markdown
# CMD-001-CreateProyecto.md

## Postcondiciones
- Existe un nuevo [[Proyecto]] con estado "borrador".
```

El Command (capa 02) conoce la entidad Proyecto (capa 01). Esto es correcto.

**✅ Válido: Una Vista invoca un Command**

```markdown
# UI-CrearProyecto.md

## Comportamiento
Al hacer clic en "Crear", la vista invoca [[CMD-001-CreateProyecto]].
```

La vista (capa 03) conoce el Command (capa 02). Esto es correcto.

**❌ Inválido: Una Entidad conoce un Command**

```markdown
# Proyecto.md

## Creación
El Proyecto se crea mediante [[CMD-001-CreateProyecto]].
```

La entidad (capa 01) no debe conocer Commands (capa 02). La entidad es pura.

**❌ Inválido: Un Command conoce una Vista**

```markdown
# CMD-001-CreateProyecto.md

## Usado por
- [[UI-CrearProyecto]]
```

El Command (capa 02) no debe conocer vistas (capa 03). El Command es agnóstico de UI.

### Por Qué Importa

Esta regla hace que las capas inferiores sean **estables**. Puedes cambiar la UI sin tocar los Commands. Puedes cambiar los Commands sin tocar el dominio. El conocimiento más valioso (el dominio) está protegido de cambios superficiales.

---

## ¿Qué Pasa si Saltas una Capa?

### Saltar 00-Requirements

Sin el "por qué", construyes features sin dirección. El equipo discute prioridades sin criterio. Cada desarrollador interpreta el objetivo a su manera. El resultado es un sistema que nadie pidió.

### Saltar 01-Domain

Sin el dominio formalizado, el conocimiento vive solo en el código. Cada dev tiene su propia interpretación de "qué es un Proyecto". Las reglas están implícitas. Cambiar algo requiere leer todo el código para entender las dependencias.

### Saltar 02-Behavior

Sin Commands y Use Cases formales, la lógica se dispersa por toda la aplicación. Un endpoint de API hace validaciones. Un componente de React hace otras validaciones. Nadie sabe dónde está la verdad.

### Saltar 03-Experience

Sin especificaciones de UI, cada implementador decide cómo mostrar los datos. El diseño es inconsistente. Los estados de error no están cubiertos. La accesibilidad queda al azar.

### Saltar 04-Verification

Sin requisitos formales, los tests validan lo que el programador asumió, no lo que el sistema debe hacer. No hay trazabilidad entre especificaciones y tests. Cuando algo falla, nadie sabe si el test está mal o el código está mal.

### Saltar 05-Architecture

Sin decisiones técnicas documentadas, cada dev elige su stack preferido. Las integraciones se hacen sin justificación. Cuando algo falla en producción, nadie recuerda por qué se eligió esa arquitectura.

---

## El Flujo Cognitivo en Acción: Ejemplo Completo

Veamos cómo fluye el diseño de una feature a través de las seis capas:

### 00-Requirements: El Por Qué

```markdown
# OBJ-001: Analizar decisiones estructuradamente

Como Usuario, quiero analizar mis decisiones usando el método TaskFlow,
para obtener perspectivas diversas sin depender de otras personas.
```

### 01-Domain: El Qué

```markdown
# Proyecto.md

Un Proyecto representa la pregunta o problema que se somete a análisis
mediante una Tarea del método de análisis.

Estados: borrador → preparado → en_analisis → terminado
```

### 02-Behavior: El Cómo se Comporta

```markdown
# CMD-001-CreateProyecto

Crea un nuevo Proyecto en estado "borrador".
Valida BR-PROYECTO-002 (título 1-100 caracteres).
Emite EVT-Proyecto-Creado.
```

### 03-Experience: El Cómo lo Ven

```markdown
# UI-CrearProyecto

Formulario con título y descripción.
Al submit, invoca CMD-001.
Estados: idle, loading, success, error.
```

### 04-Verification: El Cómo Sabemos que Funciona

```markdown
# REQ-001

WHEN el Usuario crea un Proyecto válido,
the Sistema SHALL crear un Proyecto en estado "borrador".
```

### 05-Architecture: El Cómo lo Construimos

```markdown
# ADR-0002: Backend Framework

Usamos este framework por rendimiento, tipo-seguridad y ecosistema moderno.
```

---

## Analogía: Las Capas como un Edificio

Piensa en las seis capas como la construcción de un edificio:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   05-Architecture    Los planos técnicos y materiales           │
│                      (¿ladrillo o concreto?)                     │
│                                                                  │
│   04-Verification    Las inspecciones y certificaciones         │
│                      (¿cumple con códigos de construcción?)      │
│                                                                  │
│   03-Experience      La decoración y layout interior            │
│                      (¿cómo se ve para quienes viven aquí?)      │
│                                                                  │
│   02-Behavior        La instalación eléctrica y tuberías        │
│                      (¿qué funcionalidades tiene?)               │
│                                                                  │
│   01-Domain          Los cimientos y estructura                 │
│                      (¿qué sostiene todo?)                       │
│                                                                  │
│   00-Requirements    El motivo para construir                   │
│                      (¿por qué alguien querría vivir aquí?)      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

Si omites los cimientos (01-Domain), el edificio colapsa. Si omites el motivo (00-Requirements), construyes algo que nadie quiere. Si omites las inspecciones (04-Verification), no sabes si es seguro habitarlo.

---

## Resumen: Por Qué Seis Capas

KDD organiza el conocimiento en seis capas porque **así piensas** cuando diseñas sistemas bien:

1. **00-Requirements**: Por qué existe (motivación).
2. **01-Domain**: Qué conceptos existen (base estable).
3. **02-Behavior**: Cómo se comporta (orquestación).
4. **03-Experience**: Cómo lo ven (presentación).
5. **04-Verification**: Cómo sabemos que funciona (validación).
6. **05-Architecture**: Cómo lo construimos (implementación técnica).

Cada capa responde una pregunta diferente. Cada capa tiene un nivel de estabilidad diferente: el dominio cambia poco, la UI cambia mucho. El orden de dependencia refleja esta estabilidad: las capas inferiores son más estables y no dependen de las superiores.

Saltar capas introduce caos. Respetar el flujo produce sistemas trazables, testeables y mantenibles.

> **"Las seis capas no son burocracia. Son el reflejo de cómo tu mente modela el problema cuando diseñas bien."**

---

## Próximos Pasos

- Lee `reference/layers.md` para la referencia técnica completa de cada capa.
- Lee `concepts/traceability.md` para entender cómo se conectan las capas mediante wiki-links.
- Lee `workflows/new-feature.md` para ver el flujo de implementación de una feature atravesando todas las capas.
