---
title: "Herramientas de Automatización KDD"
audience: [all]
type: reference
reading_time: "consulta"
status: draft
---

# Herramientas de Automatización KDD

> Para: Todos — Tipo: Referencia — Uso: Consulta puntual

KDD incluye herramientas que automatizan la creación, revisión, verificación y trazabilidad de especificaciones. Todas se invocan desde Claude Code o desde la terminal con Bun.

Este catálogo agrupa las herramientas por función. Cada entrada describe qué hace, quién la usa y cómo se invoca.

---

## Resumen rápido

| Herramienta | Qué hace | Quién la usa | Invocación |
|---|---|---|---|
| `/kdd-author` | Crea artefactos KDD desde una idea | PM, Designer | Slash command |
| `/kdd-iterate` | Aplica cambios a artefactos existentes | Todos | Slash command |
| `/kdd-review` | Revisa calidad semántica de specs | Tech Lead, QA | Slash command |
| `/kdd-gaps` | Detecta artefactos faltantes | PM, Tech Lead, QA | Slash command |
| `/kdd-fix` | Corrige problemas técnicos | Dev, Tech Lead | Slash command |
| `/kdd-trace` | Construye matriz de trazabilidad | Tech Lead, QA | Slash command |
| `/kdd-verify` | Verifica que el código cumple specs | Dev, QA | Slash command |
| `/generate-e2e` | Genera tests E2E Playwright | Dev, QA | Slash command |
| `/generate-story` | Genera componente React + Storybook | Designer, Dev | Slash command |
| `/sync-story` | Sincroniza componente con UI spec | Designer, Dev | Slash command |
| `/ui` | Genera spec de UI conectada al dominio | Designer | Slash command |
| `/analyze-entities` | Detecta wiki-links faltantes | Dev, Tech Lead | Slash command |
| `/list-entities` | Lista entidades del dominio | Todos | Slash command |
| `/ideation` | Explora y refina ideas de features | PM | Slash command |
| `pipeline:check` | Valida specs + código + tests | Dev, Tech Lead, QA | CLI (`bun run`) |
| `pipeline:scaffold` | Genera stubs de use-case desde CMD | Dev | CLI (`bun run`) |
| `pipeline:status` | Dashboard de progreso por UV | Tech Lead | CLI (`bun run`) |
| `pipeline:coverage` | Cobertura BR → CMD | Tech Lead, QA | CLI (`bun run`) |
| `pipeline:mapping` | Mapeo CMD → código → tests | Dev, Tech Lead | CLI (`bun run`) |

---

## Skills de autoría

Los skills de autoría asisten en la creación y evolución de artefactos KDD.

| Skill | Qué hace | Audiencia |
|---|---|---|
| `/kdd-author` | Guía conversacional para transformar una idea vaga en artefactos KDD estructurados. Reduce fricción para PMs y no técnicos. | PM, Designer |
| `/kdd-iterate` | Aplica feedback, cambios o mejoras a artefactos KDD existentes. Propaga cambios entre capas cuando un requisito evoluciona. | Todos |

**Ejemplo de uso:**

```
> /kdd-author
Quiero documentar una feature para exportar análisis a PDF
```

El skill pregunta por actor, objetivo, restricciones y genera los artefactos correspondientes (OBJ, UC, CMD, BR) paso a paso.

---

## Skills de calidad

Los skills de calidad detectan problemas en las especificaciones antes de que lleguen a implementación.

| Skill | Qué hace | Audiencia |
|---|---|---|
| `/kdd-review` | Revisa calidad semántica, completitud y coherencia de un artefacto. Detecta secciones faltantes, inconsistencias de terminología y problemas de trazabilidad. | Tech Lead, QA |
| `/kdd-gaps` | Analiza un feature completo y detecta artefactos faltantes: reglas no documentadas, eventos sin spec, UCs sin CMD. | PM, Tech Lead, QA |
| `/kdd-fix` | Corrige problemas técnicos automáticamente: frontmatter incompleto, enlaces rotos, formato incorrecto. | Dev, Tech Lead |

**Ejemplo de uso:**

```
> /kdd-gaps
Analiza la feature de Miembros
```

El skill recorre las capas KDD y reporta huecos: "BR-MIEMBRO-008 referenciada en CMD-024 pero no existe como archivo".

---

## Skills de trazabilidad y verificación

Estos skills conectan las especificaciones con el código y los tests.

| Skill | Qué hace | Audiencia |
|---|---|---|
| `/kdd-trace` | Construye la matriz de trazabilidad entre capas: OBJ → UC → CMD → código → test. Visualiza qué requisitos tienen cobertura completa. | Tech Lead, QA |
| `/kdd-verify` | Verifica que la implementación actual cumple con una spec. Compara el código contra las precondiciones, errores y postcondiciones del CMD. | Dev, QA |

**Ejemplo de uso:**

```
> /kdd-verify
Verifica CMD-MiembroProfile contra el código
```

El skill lee la spec, localiza el use-case correspondiente y reporta discrepancias.

---

## Comandos de generación

Los comandos de generación crean código o specs a partir de artefactos existentes.

| Comando | Qué hace | Audiencia |
|---|---|---|
| `/generate-e2e` | Genera un test E2E Playwright a partir de una spec REQ. Lee los criterios de aceptación Gherkin y produce el archivo `.spec.ts`. | Dev, QA |
| `/generate-story` | Genera un componente React reutilizable y su archivo Storybook a partir de una spec UI. | Designer, Dev |
| `/sync-story` | Sincroniza un componente React y su Storybook con una spec UI actualizada. Aplica los cambios sin reescribir todo. | Designer, Dev |
| `/ui` | Genera una spec de UI (component, view o flow) conectada al dominio existente. Lee entidades y comandos para pre-llenar enlaces. | Designer |

**Ejemplo de uso:**

```
> /generate-e2e
Genera test E2E desde REQ-006
```

El comando lee `specs/04-verification/criteria/REQ-006-*.md`, extrae los escenarios Gherkin y genera el archivo Playwright.

---

## Comandos de análisis

Los comandos de análisis inspeccionan el estado actual de las specs y el dominio.

| Comando | Qué hace | Audiencia |
|---|---|---|
| `/analyze-entities` | Analiza archivos de specs para detectar wiki-links faltantes y entidades no enlazadas. | Dev, Tech Lead |
| `/list-entities` | Lista todas las entidades del dominio con sus atributos y relaciones principales. | Todos |
| `/ideation` | Explora y refina una idea de feature antes de documentarla formalmente. Genera opciones, trade-offs y un borrador de OBJ. | PM |

**Ejemplo de uso:**

```
> /list-entities
```

Muestra: Proyecto (titulo, descripcion, estado), Tarea (etiqueta, estado), Miembro (nombre, perfil)...

---

## Agentes especializados

Claude Code incluye agentes que el sistema invoca automáticamente según el contexto de la tarea.

| Agente | Qué hace | Cuándo se activa |
|---|---|---|
| `kdd-requirement-analyst` | Transforma ideas vagas en specs KDD completas mediante descubrimiento sistemático de requisitos. | Cuando el usuario describe una feature sin estructura |
| `tech-lead` | Analiza specs y crea planes de implementación detallados. Identifica dependencias y prioriza tareas. | Cuando el usuario pide implementar desde specs |
| `tech-writer` | Crea o reescribe documentación siguiendo el style guide (Google Tech Writing + Diataxis). | Cuando el usuario necesita documentación profesional |
| `qa-criteria-validator` | Define criterios de aceptación y los valida con tests Playwright automatizados. | Cuando el usuario necesita validar una feature |

Estos agentes no se invocan con slash commands. Claude Code los selecciona automáticamente cuando la tarea lo requiere, o puedes solicitarlos explícitamente describiendo la tarea.

---

## Pipeline de validación

El pipeline ejecuta 8 gates de calidad sobre Value Units. Verifica specs, código y tests de forma integrada.

| Comando | Qué hace | Ejemplo |
|---|---|---|
| `bun run pipeline:check UV-NNN` | Ejecuta los 8 gates para una Value Unit | `bun run pipeline:check UV-004` |
| `bun run pipeline:check --all` | Ejecuta los 8 gates para todas las UVs | `bun run pipeline:check --all --quick` |
| `bun run pipeline:scaffold UV-NNN` | Genera stubs de use-case desde specs CMD | `bun run pipeline:scaffold UV-004` |
| `bun run pipeline:status UV-NNN` | Dashboard de completitud por UV | `bun run pipeline:status UV-004` |
| `bun run pipeline:coverage` | Cobertura de BR → CMD | `bun run pipeline:coverage --threshold 95` |
| `bun run pipeline:mapping` | Mapeo CMD → código → tests | `bun run pipeline:mapping` |

> **Ver**: [Pipeline de Validación KDD](pipeline.md) para la referencia completa de gates, criterios y CI.

---

## Infraestructura

### Claude Rules KDD

Las Claude Rules son instrucciones automáticas que se activan cuando trabajas en archivos específicos de `/specs`. Aseguran que los artefactos generados cumplan las convenciones KDD sin intervención manual.

**Rules por capa de dominio:**

| Rule | Capa | Qué asegura |
|---|---|---|
| `kdd-domain-entities` | Domain | Formato de entidades, atributos, invariantes |
| `kdd-domain-events` | Domain | Estructura de eventos, payload |
| `kdd-domain-rules` | Domain | Las 5 secciones obligatorias de BR |
| `kdd-behavior-commands` | Behavior | Estructura de CMD: Input, Preconditions, Errors |
| `kdd-behavior-queries` | Behavior | Estructura de QRY: Input, Output, Errors |
| `kdd-behavior-usecases` | Behavior | Flujo principal, extensiones, postcondiciones |
| `kdd-experience-views` | Experience | Layout, estados, responsive, accesibilidad |
| `kdd-experience-components` | Experience | Props, variantes, estados funcionales |
| `kdd-experience-flows` | Experience | Pasos de flujo, navegación |

**Rules transversales:**

| Rule | Qué asegura |
|---|---|
| `kdd-shared-policies` | Estructura de Cross-Policies (XP) |
| `kdd-value-units` | Tracking de implementación en Value Units |
| `kdd-writing` | Convenciones de escritura: voz activa, wiki-links, EARS |

### MCP sixhat-kb

El MCP `sixhat-kb` proporciona búsqueda semántica sobre las specs del proyecto. Claude Code lo usa para descubrir artefactos relevantes antes de implementar.

| Herramienta MCP | Qué hace |
|---|---|
| `search_specs` | Busca specs por contenido semántico: "reglas de negocio del Proyecto" |
| `get_entity_detail` | Obtiene información detallada de una entidad del grafo de conocimiento |
| `list_entity_types` | Lista todos los tipos de entidades en el knowledge graph |
| `check_health` | Verifica la conexión al servicio de knowledge base |

---

## Herramientas por rol

Cada rol tiene un conjunto de herramientas primarias (uso frecuente) y secundarias (uso ocasional).

| Rol | Herramientas primarias | Herramientas secundarias |
|---|---|---|
| **PM** | `/kdd-author`, `/ideation`, `/kdd-gaps` | `/kdd-iterate`, `/kdd-review`, `/list-entities` |
| **Designer** | `/ui`, `/generate-story`, `/sync-story` | `/kdd-author`, `/list-entities` |
| **Dev** | `/kdd-verify`, `/generate-e2e`, `pipeline:scaffold`, `pipeline:check` | `/kdd-review`, `/kdd-fix`, `pipeline:mapping` |
| **QA** | `/generate-e2e`, `/kdd-trace`, `/kdd-gaps` | `pipeline:coverage`, `/kdd-verify` |
| **Tech Lead** | `/kdd-review`, `/kdd-trace`, `/kdd-gaps`, `pipeline:check --all` | `pipeline:status`, `pipeline:coverage`, `/kdd-fix` |

---

## Lectura relacionada

- [Pipeline de Validación KDD](pipeline.md): referencia completa de los 8 gates.
- [Cheatsheet KDD](cheatsheet.md): referencia compacta de artefactos y convenciones.
- [Documentación como Código](../concepts/docs-as-code.md): por qué las specs viven en Git.
