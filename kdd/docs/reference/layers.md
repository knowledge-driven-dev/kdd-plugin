---
title: "Referencia de Capas KDD"
audience: [pm, designer, dev, qa, tech-lead]
type: reference
reading_time: "consulta"
status: draft
---

# Referencia de Capas KDD

> Para: Todos — Tipo: Referencia — Uso: Consulta rápida

Este documento consolida las seis capas del modelo KDD. Cada capa responde una pregunta específica sobre el sistema. Las capas se organizan desde el fundamento (Requirements) hasta la implementación (Architecture).

---

## Tabla resumen de capas

| # | Capa | Pregunta | Artefactos | Carpeta | Regla de dependencia |
|---|---|---|---|---|---|
| **00** | Requirements | ¿Por qué existe? | PRD, OBJ, UV, REL, ADR (negocio) | `00-requirements/` | INPUT: Alimenta el diseño, fuera del flujo de capas |
| **01** | Domain | ¿Qué existe? | Entity, Value Object, BR, EVT | `01-domain/` | BASE: No referencia otras capas, todas lo referencian |
| **02** | Behavior | ¿Cómo se comporta? | CMD, QRY, UC, PROC, BP, XP | `02-behavior/` | Referencia 01, es referenciado por 03 y 04 |
| **03** | Experience | ¿Cómo lo ven? | UI Views, Components, Modals | `03-experience/` | Referencia 02, es referenciado por 04 |
| **04** | Verification | ¿Cómo se verifica? | REQ (EARS), Gherkin, Trazabilidad | `04-verification/` | Referencia todas las capas, no es referenciado |
| **05** | Architecture | ¿Cómo se implementa? | Charter, ADR (técnico), Profiles | `05-architecture/` | Referencia 04, convierte specs en código |

---

## Diagrama de dependencias

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   00-Requirements (INPUT - fuera del flujo de capas)                     │
│       │                                                                  │
│       │  alimenta                                                        │
│       ▼                                                                  │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  04-Verification   (tests, criteria)                           │   │
│   │      ↑ referencia todas                                         │   │
│   ├─────────────────────────────────────────────────────────────────┤   │
│   │  03-Experience     (views)                                      │   │
│   │      ↑ referencia                                               │   │
│   ├─────────────────────────────────────────────────────────────────┤   │
│   │  02-Behavior       (UC, CMD, QRY, PROC, BP, XP)                 │   │
│   │      ↑ referencia                                               │   │
│   ├─────────────────────────────────────────────────────────────────┤   │
│   │  01-Domain         (entities, rules, events)   ← BASE           │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│                          05-Architecture                                 │
│                          (convierte en código)                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Regla fundamental**: Las capas superiores pueden referenciar a las inferiores. Las capas inferiores no conocen a las superiores.

---

## Capa 00: Requirements

### Pregunta que responde

¿Por qué existe este sistema? ¿Qué problema resuelve?

### Propósito

Esta capa documenta el contexto de negocio, los objetivos de usuario y las decisiones estratégicas. Es el **INPUT** que alimenta el diseño del resto de capas. No forma parte del flujo de dependencias porque representa la motivación externa al sistema.

### Artefactos

| Tipo | Prefijo | ID Pattern | Ubicación |
|---|---|---|---|
| PRD | - | - | `PRD.md` |
| Objective | OBJ | `OBJ-NNN` | `objectives/OBJ-NNN-{Name}.md` |
| Value Unit | UV | `UV-NNN` | `value-units/UV-NNN-{Name}.md` |
| Release | REL | `REL-NNN` | `releases/REL-NNN-{Name}.md` |
| ADR (negocio) | ADR | `ADR-NNNN` | `decisions/ADR-NNNN-{Title}.md` |

### Quién lo usa

- **PM**: Define el PRD, crea Objectives, planifica Releases con Value Units.
- **Tech Lead**: Revisa decisiones estratégicas documentadas en ADRs de negocio.
- **Todos**: Consultan el "por qué" del producto cuando dudan del alcance.

### Cuándo se actualiza

La capa de Requirements cambia poco una vez establecida. Se actualiza solo cuando:
- Pivots de producto (cambio fundamental del problema o usuarios).
- Nuevos OKRs de la organización.
- Decisiones estratégicas documentadas en ADRs.
- Post-mortems que cambian la visión.

### Ejemplos del proyecto

- `specs/00-requirements/PRD.md` - Define TaskFlow como producto.
- `specs/00-requirements/objectives/OBJ-001-Analisis-Estructurado.md` - Usuario quiere analizar decisiones con el método TaskFlow.
- `specs/00-requirements/value-units/UV-002-Persona-Profile-IA.md` - Unidad de valor para generación de perfiles con IA.

---

## Capa 01: Domain

### Pregunta que responde

¿Qué conceptos existen en nuestro universo de problema?

### Propósito

Esta capa modela el dominio de forma pura, sin contaminación de UI, bases de datos o tecnología específica. Es la **BASE** del sistema: no referencia otras capas, pero todas las demás la referencian. Las entidades del dominio cambian menos que cualquier otra cosa.

### Artefactos

| Tipo | Prefijo | ID Pattern | Ubicación |
|---|---|---|---|
| Entity | - | `{PascalCase}` | `entities/{Name}.md` |
| Value Object | - | `{PascalCase}` | `entities/{Name}.md` |
| Event | EVT | `EVT-{Entity}-{Action}` | `events/EVT-{Entity}-{Action}.md` |
| Business Rule | BR | `BR-{ENTITY}-NNN` | `rules/BR-{ENTITY}-NNN.md` |

### Quién lo usa

- **Todos los roles**: Las entidades son el vocabulario compartido del equipo.
- **Dev**: Implementa entidades, value objects y reglas en el código de dominio.
- **PM/Designer**: Define entidades al entender el problema antes de diseñar flujos.

### Cuándo se actualiza

El dominio es estable, pero se actualiza cuando:
- Nuevas entidades emergen del análisis del problema.
- Atributos de entidades existentes cambian por requisitos nuevos.
- Reglas de negocio nuevas o modificadas.
- Eventos de dominio descubiertos al modelar procesos.

### Ejemplos del proyecto

- `specs/01-domain/entities/Proyecto.md` - El desafío que se analiza con TaskFlow.
- `specs/01-domain/entities/Miembro.md` - Participante virtual del análisis.
- `specs/01-domain/events/EVT-Proyecto-Creado.md` - Evento de creación de proyecto.
- `specs/01-domain/rules/BR-PROYECTO-002.md` - Título debe tener 1-100 caracteres.

### Principios clave

- **Lenguaje ubicuo**: Los términos del dominio se escriben siempre igual y con mayúscula inicial en prosa.
- **Pureza**: El dominio nunca importa frameworks, UI ni infraestructura.
- **Invariantes documentadas**: Cada entidad documenta sus restricciones.
- **Eventos inmutables**: Representan hechos pasados, no comandos.

---

## Capa 02: Behavior

### Pregunta que responde

¿Cómo se comporta el sistema? ¿Qué operaciones se pueden ejecutar?

### Propósito

Esta capa define las operaciones posibles sobre el dominio y los flujos de interacción con el usuario. Orquesta comandos (escritura), consultas (lectura), casos de uso, procesos y políticas transversales. Aplica el patrón **CQRS Light** para separar escritura de lectura.

### Artefactos

| Tipo | Prefijo | ID Pattern | Ubicación |
|---|---|---|---|
| Command | CMD | `CMD-NNN` | `commands/CMD-NNN-{Name}.md` |
| Query | QRY | `QRY-NNN` | `queries/QRY-NNN-{Name}.md` |
| Use Case | UC | `UC-NNN` | `use-cases/UC-NNN-{Name}.md` |
| Process | PROC | `PROC-NNN` | `processes/PROC-NNN-{Name}.md` |
| Business Policy | BP | `BP-{TOPIC}-NNN` | `policies/BP-{TOPIC}-NNN.md` |
| Cross-Policy | XP | `XP-{TOPIC}-NNN` | `policies/XP-{TOPIC}-NNN.md` |

### Quién lo usa

- **Dev**: Implementa Commands, Queries, Use Cases y Policies en el código de aplicación.
- **PM**: Define Use Cases que traducen objetivos de usuario en flujos.
- **QA**: Deriva tests de los Use Cases y valida Commands.
- **Designer**: Consulta Use Cases antes de diseñar pantallas.

### Cuándo se actualiza

Esta capa se actualiza frecuentemente con:
- Nuevos Use Cases por features.
- Commands nuevos para operaciones de escritura.
- Queries nuevos para necesidades de lectura.
- Policies cuando se descubren comportamientos transversales.
- Processes para orquestar flujos complejos.

### Ejemplos del proyecto

- `specs/02-behavior/commands/CMD-001-CreateProyecto.md` - Crear un proyecto nuevo.
- `specs/02-behavior/use-cases/UC-001-CrearProyecto.md` - Flujo completo de creación de proyecto.
- `specs/02-behavior/queries/QRY-002-ListProyectos.md` - Listar proyectos del usuario.
- `specs/02-behavior/policies/XP-PUNTOS-001.md` - Política de verificación de puntos.

### Principios clave

- **CQRS Light**: Commands modifican estado, Queries solo leen.
- **Use Cases orquestan**: Los UC invocan Commands y Queries, no al revés.
- **Agnóstico de UI**: Esta capa no sabe cómo se presenta la información.
- **Policies transversales**: XP aplica a múltiples Commands, BP a entidades específicas.

---

## Capa 03: Experience

### Pregunta que responde

¿Cómo se presenta el sistema al usuario? ¿Cómo lo ven?

### Propósito

Esta capa especifica las interfaces visuales que implementan los Use Cases definidos en la capa anterior. Las Views son "clientes" de las capacidades del sistema: consumen Commands y Queries, pero no definen lo que el sistema hace.

### Artefactos

| Tipo | Prefijo | ID Pattern | Ubicación |
|---|---|---|---|
| View (página) | UI | `UI-{Name}` | `views/UI-{Name}.md` |
| Component | UI | `UI-{Name}` | `views/UI-{Name}.md` |
| Modal | UI | `UI-{Name}Modal` | `views/UI-{Name}Modal.md` |

### Quién lo usa

- **Designer**: Especifica vistas con layouts, estados e interacciones.
- **Dev (Frontend)**: Implementa vistas consumiendo los Commands/Queries especificados.
- **QA**: Verifica que las vistas implementen correctamente los Use Cases.

### Cuándo se actualiza

Esta capa se actualiza cuando:
- Nuevos Use Cases requieren nuevas pantallas.
- Rediseño de vistas existentes.
- Nuevos estados descubiertos (loading, error, empty).
- Cambios en las interacciones usuario-sistema.

### Ejemplos del proyecto

- `specs/03-experience/views/UI-ProyectoEditor.md` - Editor de proyecto con markdown.
- `specs/03-experience/views/UI-MiembroCard.md` - Componente de tarjeta de persona.
- `specs/03-experience/views/UI-PersonaModal.md` - Modal de creación de persona.

### Principios clave

- **Dependencia unidireccional**: La View conoce al Command, el Command no conoce a la View.
- **Sin lógica de negocio**: Las validaciones complejas pertenecen a Commands o Domain.
- **Tres responsabilidades**: Presentar datos (Query), capturar intenciones (Command), dar feedback.
- **Estados obligatorios**: Toda vista documenta loading, empty, error y success.

---

## Capa 04: Verification

### Pregunta que responde

¿Cómo sabemos que el sistema hace lo que debe hacer?

### Propósito

Esta capa cierra el ciclo de especificación transformando las capas anteriores en criterios verificables. Usa sintaxis **EARS** (Easy Approach to Requirements Syntax) para requisitos formales y **Gherkin** para criterios de aceptación ejecutables. Establece trazabilidad completa desde código hasta objetivos de negocio.

### Artefactos

| Tipo | Prefijo | ID Pattern | Ubicación |
|---|---|---|---|
| Requirement | REQ | `REQ-NNN` | `criteria/REQ-NNN-{Name}.md` |
| Feature (Gherkin) | - | `{name}.feature` | `examples/{name}.feature` |
| Traceability Matrix | - | - | `_TRACEABILITY.md` |

### Quién lo usa

- **QA**: Deriva tests de aceptación de los REQ con Gherkin.
- **Dev**: Consulta requisitos EARS antes de implementar para entender qué validar.
- **Tech Lead**: Revisa trazabilidad completa en PRs (UC → REQ → BR → Test).
- **PM**: Valida que los criterios reflejen los objetivos de negocio.

### Cuándo se actualiza

Esta capa se actualiza cuando:
- Nuevos Use Cases requieren requisitos formales.
- Cambios en Business Rules modifican requisitos existentes.
- Bugs encontrados que requieren nuevos criterios de aceptación.
- Auditorías que requieren completar trazabilidad faltante.

### Ejemplos del proyecto

- `specs/04-verification/criteria/REQ-001-Crear-Proyecto.md` - Requisitos EARS derivados de UC-001.
- `specs/04-verification/examples/crear-proyecto.feature` - Criterios Gherkin para creación de proyecto.

### Principios clave

- **EARS para requisitos**: Sintaxis estructurada no ambigua (WHEN/IF/WHILE/WHERE/SHALL).
- **Gherkin para criterios**: Given/When/Then ejecutables como tests automatizados.
- **Trazabilidad completa**: Código → Test → REQ → UC → BR → OBJ.
- **Especificaciones ejecutables**: Los criterios se convierten directamente en tests.

---

## Capa 05: Architecture

### Pregunta que responde

¿Cómo se implementa? ¿Qué stack usamos y cómo se proyectan las specs en código?

### Propósito

Esta capa convierte las especificaciones verificadas en un plan tecnológico concreto. Define el stack oficial, convenciones de código y el mapeo de artefactos KDD a ubicaciones en el repositorio. Mantiene el conocimiento agnóstico a la implementación hasta este punto, pero provee el contrato necesario para generar código.

### Artefactos

| Tipo | Prefijo | ID Pattern | Ubicación |
|---|---|---|---|
| Implementation Charter | ARCH | `ARCH-CHARTER-{Name}` | `charter.md` |
| ADR (técnico) | ADR | `ADR-NNNN` | `decisions/ADR-NNNN-{Title}.md` |
| Profile | - | - | `profiles/{name}.md` |

### Quién lo usa

- **Tech Lead**: Define el charter oficial, mantiene ADRs tecnológicos.
- **Dev**: Consulta el charter para saber dónde ubicar código generado de specs.
- **Herramientas (Codex/Cursor/Claude)**: Leen el charter para automatizar scaffolding.

### Cuándo se actualiza

Esta capa se actualiza cuando:
- Cambios mayores de stack (nuevo framework, migración de DB).
- Nuevas convenciones de código acordadas por el equipo.
- Decisiones de arquitectura documentadas en ADRs.
- Actualización de versiones de stack que afectan convenciones.

### Ejemplos del proyecto

- `specs/05-architecture/charter.md` - Stack: runtime + framework backend + ORM + framework frontend.
- `specs/05-architecture/decisions/ADR-0002-Backend-Framework.md` - Decisión de framework backend.

### Principios clave

- **Conocimiento agnóstico hasta aquí**: Las capas 00-04 no dependen del stack.
- **Contrato explícito**: El charter especifica cómo convertir specs en código.
- **ADRs tecnológicos separados**: Las decisiones técnicas no se mezclan con las de negocio.
- **Habilita automatización**: Agentes leen el charter para generar scaffolding consistente.

---

## Flujo de trabajo por capas

### Fase 1: Definir el problema

**Capas**: 00-Requirements

1. El PM escribe el PRD con el problema, usuarios, objetivos y métricas.
2. El PM deriva Objectives (OBJ) del análisis del problema.
3. El PM agrupa features en Value Units (UV) para planificación.
4. El equipo documenta decisiones estratégicas en ADRs de negocio.

### Fase 2: Modelar el dominio

**Capas**: 01-Domain

1. El equipo identifica entidades clave del problema.
2. Se documentan atributos, ciclo de vida e invariantes de cada entidad.
3. Se extraen Business Rules (BR) que aparecen en el análisis.
4. Se definen eventos de dominio (EVT) que representan hechos significativos.

### Fase 3: Diseñar el comportamiento

**Capas**: 02-Behavior

1. El PM escribe Use Cases (UC) que traducen Objectives a flujos.
2. El Dev extrae Commands (CMD) de los pasos de los UC que modifican estado.
3. El Dev extrae Queries (QRY) de los pasos de los UC que leen estado.
4. El Tech Lead identifica Policies transversales (XP) que aplican a múltiples Commands.
5. Se documentan Processes (PROC) para flujos que orquestan múltiples comandos.

### Fase 4: Especificar la experiencia

**Capas**: 03-Experience

1. El Designer crea Views (UI-*) que implementan los Use Cases.
2. Cada View documenta los Commands/Queries que invoca.
3. Se especifican todos los estados (loading, empty, error, success).
4. Se documentan interacciones con feedback claro para cada acción.

### Fase 5: Verificar

**Capas**: 04-Verification

1. El QA deriva Requirements (REQ) de cada Use Case usando sintaxis EARS.
2. Cada REQ referencia las Business Rules que valida.
3. El QA escribe criterios de aceptación en Gherkin para cada requisito.
4. Se construye la matriz de trazabilidad (UC → REQ → BR → Test).

### Fase 6: Implementar

**Capas**: 05-Architecture

1. El Tech Lead define el Implementation Charter con el stack oficial.
2. El Dev consulta el charter para saber dónde ubicar código de cada artefacto.
3. El Dev implementa siguiendo las convenciones del charter.
4. Las herramientas de scaffolding leen el charter para generar código consistente.

---

## Reglas de referencia entre capas

| Desde | Hacia | Permitido | Ejemplo |
|---|---|---|---|
| 00-Requirements | 01-Domain | ✅ Puede mencionar conceptos para dar contexto | PRD menciona "Proyectos" y "Tareas" |
| 01-Domain | Ninguna | ✅ No referencia otras capas (es la BASE) | Entity no conoce Commands ni Views |
| 02-Behavior | 01-Domain | ✅ Referencia entidades, reglas, eventos | CMD valida BR, emite EVT |
| 02-Behavior | 03-Experience | ❌ No debe conocer Views | UC no sabe qué pantalla lo usa |
| 03-Experience | 02-Behavior | ✅ Referencia Commands, Queries, Use Cases | View invoca CMD al hacer submit |
| 03-Experience | 01-Domain | ⚠️ Solo menciona, no depende | View muestra "Proyecto" pero no valida BR |
| 04-Verification | Todas | ✅ Referencia todo para crear trazabilidad | REQ referencia UC, BR, CMD |
| 05-Architecture | 04-Verification | ✅ Consume specs verificadas para generar código | Charter mapea REQ a ubicación de test |

---

## Cuándo usar cada capa

| Necesitas... | Consulta capa | Busca artefacto |
|---|---|---|
| Entender por qué existe una feature | 00-Requirements | OBJ, PRD |
| Saber qué significa un término del negocio | 01-Domain | Entity |
| Entender una restricción del sistema | 01-Domain | BR |
| Saber qué operaciones se pueden hacer | 02-Behavior | CMD, QRY |
| Entender un flujo de usuario | 02-Behavior | UC |
| Saber cómo se presenta algo al usuario | 03-Experience | UI View |
| Derivar tests de una feature | 04-Verification | REQ con Gherkin |
| Saber dónde ubicar código nuevo | 05-Architecture | Implementation Charter |

---

## Métricas de calidad por capa

### Capa 00: Requirements

- [ ] Cada feature del roadmap tiene un OBJ asociado.
- [ ] Cada OBJ tiene criterios de éxito medibles.
- [ ] Las decisiones estratégicas tienen ADR.

### Capa 01: Domain

- [ ] Todas las entidades tienen atributos documentados.
- [ ] Todas las reglas de negocio tienen ejemplos válidos e inválidos.
- [ ] Los eventos tienen payload definido y consumidores identificados.

### Capa 02: Behavior

- [ ] Todos los Use Cases tienen Commands o Queries asociados.
- [ ] Todos los Commands tienen precondiciones, postcondiciones y errores definidos.
- [ ] Todas las Queries tienen output estructurado.

### Capa 03: Experience

- [ ] Todas las Views tienen los 4 estados documentados (loading, empty, error, success).
- [ ] Todas las interacciones tienen feedback definido.
- [ ] Todas las Views referencian los Use Cases que implementan.

### Capa 04: Verification

- [ ] Todos los Use Cases tienen REQ derivados (cobertura 100%).
- [ ] Todos los REQ tienen criterios Gherkin.
- [ ] Todas las Business Rules están referenciadas por al menos un REQ.
- [ ] La matriz de trazabilidad está completa (UC → REQ → BR → Test).

### Capa 05: Architecture

- [ ] El Implementation Charter está aprobado y actualizado.
- [ ] Todos los ADRs técnicos están enlazados desde el charter.
- [ ] El mapeo de artefactos KDD a código es completo.

---

## Resumen

Las seis capas de KDD organizan el conocimiento del sistema desde el fundamento (por qué existe) hasta la implementación (cómo se convierte en código). Cada capa responde una pregunta específica y mantiene dependencias unidireccionales claras.

Las capas 00-04 son agnósticas a la tecnología. La capa 05 introduce el contrato de implementación que permite generar código a partir de las especificaciones.

Consulta cada capa cuando necesites entender un aspecto específico del sistema. Usa la tabla resumen y el diagrama de dependencias como mapa de navegación.

---

## Referencias

- [00-requirements.md](/mnt/c/workspaces/taskflow/kdd/docs/layers/00-requirements.md) - Documentación completa de la capa Requirements
- [01-domain.md](/mnt/c/workspaces/taskflow/kdd/docs/layers/01-domain.md) - Documentación completa de la capa Domain
- [02-behavior.md](/mnt/c/workspaces/taskflow/kdd/docs/layers/02-behavior.md) - Documentación completa de la capa Behavior
- [03-experience.md](/mnt/c/workspaces/taskflow/kdd/docs/layers/03-experience.md) - Documentación completa de la capa Experience
- [04-verification.md](/mnt/c/workspaces/taskflow/kdd/docs/layers/04-verification.md) - Documentación completa de la capa Verification
- [05-architecture.md](/mnt/c/workspaces/taskflow/kdd/docs/layers/05-architecture.md) - Documentación completa de la capa Architecture
- [kdd.md](/mnt/c/workspaces/taskflow/kdd/kdd.md) - Referencia completa del modelo KDD
- [STYLE-GUIDE.md](/kdd/docs/STYLE-GUIDE.md) - Guía de estilo para documentación KDD
