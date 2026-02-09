---
title: "Guía KDD para Tech Leads"
audience: [tech-lead]
type: how-to
reading_time: "10 min"
status: draft
---

# Guía KDD para Tech Leads

> Para: Tech Leads · Tiempo: 10 min · Tipo: How-to

Esta guía te enseña a gobernar especificaciones KDD en tu equipo. Aprenderás a revisar PRs de specs, medir cobertura de documentación, planificar implementación y resolver conflictos entre specs y código.

Si necesitas contexto sobre qué es KDD, lee primero [¿Qué es KDD?](../start/what-is-kdd.md) y [¿Por qué KDD?](../start/why-kdd.md).

---

## Tu rol en el ecosistema KDD

Como Tech Lead, eres el guardián de la calidad de las especificaciones. Tu responsabilidad es asegurar que las specs sean:

- **Completas**: cubren lo necesario sin omitir casos edge.
- **Consistentes**: usan terminología y formato uniforme.
- **Implementables**: un desarrollador puede leerlas y codificar sin ambigüedades.
- **Actualizadas**: evolucionan al ritmo del código.

No escribes todas las specs, pero revisas las que afectan la arquitectura del sistema.

---

## Revisar PRs de specs

Las especificaciones se revisan como código. Un PR que agrega un **Command (CMD)** sin documentar los errores posibles se devuelve, igual que un PR que agrega un endpoint sin manejo de errores.

### Checklist de revisión

Aplica esta checklist cada vez que revisas un PR con cambios en `/specs`.

#### Estructura

- [ ] **Frontmatter completo**: Todos los campos requeridos están presentes (`id`, `kind`, `status`, campos específicos del tipo).
- [ ] **Identificador correcto**: Sigue el patrón del tipo de artefacto (ej: `BR-ENTIDAD-NNN`, `CMD-NNN`, `UC-NNN`).
- [ ] **Status apropiado**: Nueva spec empieza como `draft`. Spec aprobada está en `approved`. Spec que se modifica pasa a `review`.
- [ ] **Nombre de archivo coincide con ID**: El archivo `BR-PROYECTO-005.md` contiene el spec con `id: BR-PROYECTO-005`.

#### Contenido

- [ ] **Opening claro**: El primer párrafo responde "¿qué hace y por qué importa?".
- [ ] **Secciones obligatorias presentes**: Cada tipo de artefacto tiene secciones requeridas (ver [Referencia de Artefactos](../reference/artifacts.md)).
- [ ] **Ejemplos concretos**: Usa datos reales del proyecto (Proyecto, Tarea, Miembro), no ejemplos genéricos.
- [ ] **Estados documentados**: Si la spec maneja estados, están documentados en una tabla clara.
- [ ] **Errores documentados**: Si es un CMD, todos los errores posibles tienen código, condición y mensaje.

#### Trazabilidad

- [ ] **Wiki-links válidos**: Los enlaces `[[Entidad]]` apuntan a specs existentes o están marcados como WIP.
- [ ] **Dependencias explícitas**: Si el artefacto depende de otro (ej: un CMD depende de una BR), el enlace está presente.
- [ ] **Sin dependencias circulares**: Un artefacto de capa superior no referencia uno de capa inferior (ej: una entidad no referencia un CMD).

#### Estilo

- [ ] **Voz activa**: Más del 90% de las oraciones usan voz activa.
- [ ] **Terminología consistente**: No alterna entre sinónimos (ej: "Use Case" vs "caso de uso").
- [ ] **Entidades capitalizadas**: Los conceptos de dominio van con mayúscula inicial (Proyecto, Tarea, Usuario).
- [ ] **Párrafos cortos**: 3-5 oraciones por párrafo.

### Qué comentar en el PR

Cuando encuentres un problema, referencia la sección correspondiente del [Style Guide](../STYLE-GUIDE.md) en tu comentario:

```markdown
> El campo `estado` acepta los valores `borrador`, `preparado`, `en_analisis` y `terminado`.
> El **Estado** del Proyecto define...

Inconsistencia: usa `estado` (código) en la primera mención y **Estado** (concepto)
en la segunda. Aplica la regla de capitalización:
- En prosa: "El Estado del Proyecto..."
- En código/campos: `estado`, `proyecto.estado`

Ref: STYLE-GUIDE.md#capitalización-de-entidades-de-dominio
```

### Casos especiales

#### Spec incompleta en draft

Si la spec está en `status: draft` y tiene huecos marcados explícitamente, es aceptable:

```markdown
## Excepciones

### E1: Título vacío
WHEN el Usuario envía un título vacío...
(A definir con PM)

### E2-E4
Por documentar en próxima iteración.
```

Esto permite trabajo incremental sin bloquear el flujo.

#### Spec que cambia comportamiento existente

Si la spec modifica una regla de negocio o un comando que ya está implementado, exige que el PR incluya:

1. El cambio en la spec (ej: `BR-PROYECTO-005.md`).
2. El cambio en el código correspondiente.
3. La actualización de tests afectados.

El reviewer debe verificar que los tres cambios están alineados.

---

## Gobernar el ciclo de vida

Cada spec pasa por un ciclo de estados. Tu trabajo es asegurar que las transiciones sean válidas y documentadas.

### Estados del ciclo de vida

| Estado | Significado | Quién lo asigna |
|---|---|---|
| `draft` | Spec en progreso, puede estar incompleta | Autor |
| `review` | Spec lista para revisión | Autor (cuando termina) |
| `approved` | Spec aprobada y lista para implementar | Tech Lead o PM Lead |
| `implemented` | Spec implementada en código | Dev (después del merge) |
| `deprecated` | Spec obsoleta, feature removida | Tech Lead |

### Transiciones válidas

```
draft → review → approved → implemented
   ↓                ↓            ↓
   └───────────→ deprecated ←────┘
```

Una spec `approved` que se modifica vuelve a `review` hasta que se aprueba de nuevo.

### Quién aprueba qué

No todo requiere aprobación del Tech Lead. Distribuye la responsabilidad según el tipo de artefacto:

| Artefacto | Aprueba | Por qué |
|---|---|---|
| **Objective (OBJ)** | PM Lead | Decisión de negocio |
| **Use Case (UC)** | PM + Tech Lead | Impacto en arquitectura y flujos |
| **Business Rule (BR)** | PM + Tech Lead | Decisión de negocio + validación técnica |
| **Command (CMD)** | Tech Lead | Impacto técnico directo |
| **Query (QRY)** | Tech Lead | Impacto técnico directo |
| **UI View (UI)** | Design Lead + PM | Decisión de experiencia |
| **ADR** | Tech Lead o CTO | Decisión arquitectónica |

En la práctica, esto se maneja con los approvals estándar de GitHub/GitLab: asignas como reviewer obligatorio según el tipo de artefacto.

---

## Medir cobertura de specs

La cobertura de documentación responde: "¿Qué porcentaje de features tiene specs completas?"

### Métricas básicas

Rastrea estas métricas de forma manual o con un script:

1. **Cobertura de entidades**: ¿Cuántas entidades de dominio (clases/tipos principales) tienen spec en `01-domain/entities/`?
2. **Cobertura de comandos**: ¿Cuántos endpoints o use cases tienen un CMD documentado?
3. **Cobertura de reglas**: ¿Cuántas validaciones del código tienen su BR correspondiente?
4. **Cobertura de UI**: ¿Cuántas pantallas tienen spec en `03-experience/views/`?

Ejemplo de reporte:

```
Cobertura de specs (Sprint 12)
- Entidades: 8/10 (80%)
  Faltantes: PagoRecurrente, ConfiguracionEquipo
- Comandos: 15/18 (83%)
  Faltantes: CMD-026, CMD-027, CMD-028
- UI: 12/20 (60%)
  Faltantes: 8 pantallas de configuración
```

### Cobertura por Value Unit

Usa **Value Units (UV)** para rastrear el progreso de features completas. Una UV agrupa todos los artefactos necesarios para entregar una funcionalidad end-to-end.

Cada UV tiene una sección de tracking con checkboxes:

```markdown
## Scope (end-to-end)

### Implemented
- [x] CMD-Miembro — API + use case + UI

### Pending — Iteration: Asistencia IA
- [ ] CMD-MiembroProfile — Nuevo
- [ ] UI-MiembroForm v2.0 — Actualizar

### Out of scope (deferred)
- ~~CMD-008-GenerateMiembrosWithAI~~ — Pospuesto
```

La cobertura se mide contando items marcados vs totales:

```
UV-002: Miembros
- Implemented: 1/2 specs (50%)
- Pending: 2 specs
```

Consulta la [Guía para PMs](pm.md) y la regla `.claude/rules/kdd-value-units.md` para el flujo completo.

---

## Manejar conflictos: spec vs implementación

Cuando encuentras un desajuste entre la spec y el código, hay tres escenarios:

### 1. La spec está correcta, el código está mal

Esto es un bug. Abre un issue con referencia a la spec:

```markdown
**Bug**: El comando CMD-003-DeleteProyecto permite eliminar Proyectos
con tareas activas.

**Spec**: `CMD-003-DeleteProyecto.md` declara:

> Precondiciones: El Proyecto no debe tener ninguna Tarea en estado `activa`.

**Código actual**: No valida esta precondición.

**Fix**: Añadir validación en `DeleteProyectoUseCase.execute()`.
```

### 2. El código está correcto, la spec está desactualizada

La spec se actualizó pero el código no. Esto ocurre cuando alguien hace un cambio sin actualizar la spec.

Acción: Rechaza el PR original (si aún está abierto) o abre un PR de corrección que actualice la spec:

```markdown
docs(specs): update CMD-003 to reflect actual implementation

The command now allows deletion if all sessions are `completed`,
not just when no sessions exist.

Updated:
- Preconditions section in CMD-003-DeleteProyecto.md
- Example error scenarios

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### 3. Ambos están correctos, pero divergieron con el tiempo

El comportamiento cambió pero nadie documentó la decisión. Esto es deuda técnica.

Acción: Crea un **Architecture Decision Record (ADR)** que explique el cambio y actualiza la spec:

```markdown
ADR-0012: Permitir eliminación de Proyectos con tareas completadas

## Contexto
Originalmente, un Proyecto con cualquier Tarea (activa o completada)
no podía eliminarse. Los usuarios reportaron frustración al no poder
limpiar Proyectos de prueba.

## Decisión
Permitir eliminación si todas las Tareas están en estado `completed`.

## Consecuencias
- Positivas: UX mejorada, menos fricción.
- Negativas: Riesgo de pérdida de datos si el usuario borra por error.
- Mitigación: Confirmación modal con advertencia.

## Impacto en specs
- CMD-003-DeleteProyecto: actualizado precondiciones
- BR-PROYECTO-002: añadida excepción para tareas completadas
```

---

## Planificar implementación con Value Units

Las **Value Units (UV)** son el mecanismo para coordinar specs con implementación. Agrupa los artefactos necesarios para entregar una feature de punta a punta.

### Anatomía de una Value Unit

Una UV contiene:

- **Purpose**: Qué entrega y por qué importa.
- **Scope**: Lista de artefactos involucrados (OBJ, UC, CMD, BR, UI), con estado (implemented/pending/deferred).
- **Exit Criteria**: Criterios de aceptación para considerar la UV completa.
- **Dependencies**: Qué debe existir antes de empezar.

Ejemplo real:

```markdown
---
id: UV-002
kind: value-unit
title: "Miembros con Asistencia IA"
status: in-progress
---

## Purpose
Permitir al Usuario generar perfiles de Miembros con ayuda
de IA, reduciendo tiempo de configuración de 10 minutos a 2 minutos.

## Scope (end-to-end)

### Implemented
- [x] [[CMD-Miembro]] — CRUD básico

### Pending — Iteration: Asistencia IA
- [ ] [[CMD-MiembroProfile]] — Nuevo
- [ ] [[UI-MiembroForm]] v2.0 — Actualizar con botón IA

### Out of scope (deferred)
- ~~[[CMD-008-GenerateMiembrosWithAI]]~~ — Generación batch pospuesta

## Exit Criteria

### Already validated
- [x] CRUD de Personas con validaciones

### Pending (iteration: Asistencia IA)
- [ ] Botón "Completar con IA" funcional
- [ ] Profile generado incluye nombre + descripción coherente
- [ ] Error handling visible en UI
```

### Cómo usarlas para planificar

1. **Al inicio del sprint**: Revisa las UVs en estado `draft` o `in-progress`. Prioriza según impacto.
2. **Durante el sprint**: Los devs consultan la UV para saber qué implementar. Marcan items como `[x]` al completarlos.
3. **Al final del sprint**: Revisa qué UVs llegaron a todos los exit criteria. Las que sí, pasan a `completed`.

### Handoff entre agentes o devs

El prompt de implementación es simple:

```
Implementa las tareas pendientes de specs/00-requirements/value-units/UV-002.md
```

El dev (humano o agente) lee la UV, identifica los `[ ]` pendientes, abre cada spec referenciado y tiene contexto completo.

---

## Responsabilidades por rol

No haces todo solo. Distribuye las responsabilidades de creación y revisión según el tipo de artefacto:

| Artefacto | Crea | Revisa (aprueba) | Implementa |
|---|---|---|---|
| **Objective (OBJ)** | PM | PM Lead | N/A |
| **Use Case (UC)** | PM + Diseñador | PM + Tech Lead | Dev |
| **Business Rule (BR)** | PM o Dev | PM + Tech Lead | Dev |
| **Command (CMD)** | Dev | Tech Lead | Dev |
| **Query (QRY)** | Dev | Tech Lead | Dev |
| **UI View (UI)** | Diseñador | Design Lead + PM | Dev |
| **Event (EVT)** | Dev | Tech Lead | Dev |
| **ADR** | Tech Lead o Arquitecto | Tech Lead o CTO | N/A |
| **Value Unit (UV)** | PM + Tech Lead | Tech Lead | Dev (múltiples) |

### Ejemplo de flujo colaborativo

1. **PM crea OBJ-015**: "Compartir análisis con externos".
2. **PM + Diseñador crean UC-018**: "Generar link de compartir".
3. **Dev deriva CMD-027** y **CMD-028** del UC.
4. **Tech Lead revisa** los CMDs, aprueba.
5. **Dev implementa**, marca UV-005 como `[x]` en los items correspondientes.
6. **QA deriva tests** de UC-018 y CMD-027.
7. **Tech Lead verifica** que la UV-005 cumple todos los exit criteria, la marca como `completed`.

---

## Problemas comunes y cómo resolverlos

### "Las specs se desactualizan después del merge"

**Causa**: Las specs no están en el flujo de revisión de PRs.

**Solución**: Configura reglas de branch protection que requieran aprobación de Tech Lead en PRs que modifiquen `/specs`. Rechaza PRs que cambien comportamiento sin actualizar la spec correspondiente.

### "No sé si una feature tiene spec completa"

**Causa**: No hay forma de rastrear cobertura de forma sistemática.

**Solución**: Usa Value Units. Cada feature mayor tiene su UV. La UV lista todos los artefactos involucrados con checkboxes. Un vistazo a la UV te dice qué falta.

### "Los devs no consultan las specs antes de codificar"

**Causa**: Las specs están en un lugar separado del flujo de trabajo (ej: Confluence).

**Solución**: Las specs viven en `/specs` dentro del repo. En la descripción del PR de implementación, enlaza la spec correspondiente:

```markdown
Implements: specs/02-behavior/commands/CMD-MiembroProfile.md
Related UV: specs/00-requirements/value-units/UV-002.md
```

### "La spec tiene conflictos internos"

**Causa**: Múltiples personas editaron la spec sin coordinación.

**Solución**: Trata las specs como código. Usa feature branches. Resuelve conflictos en el PR. Si el conflicto es conceptual (dos interpretaciones válidas), crea un ADR para decidir.

---

## Herramientas de automatización

Estas herramientas aceleran la gobernanza de specs desde Claude Code y la terminal:

| Herramienta | Qué hace | Cómo invocar |
|---|---|---|
| `/kdd-review` | Revisa calidad semántica de specs | Escribe `/kdd-review` en Claude Code |
| `/kdd-trace` | Construye matriz de trazabilidad | `/kdd-trace` |
| `/kdd-gaps` | Detecta artefactos faltantes | `/kdd-gaps` |
| `/kdd-fix` | Corrige problemas técnicos en specs | `/kdd-fix` |
| `pipeline:check --all` | Valida todas las UVs | `bun run pipeline:check --all` |
| `pipeline:status` | Dashboard de progreso por UV | `bun run pipeline:status` |
| `pipeline:coverage` | Cobertura BR → CMD | `bun run pipeline:coverage` |
| `pipeline:mapping` | Mapeo CMD → código → tests | `bun run pipeline:mapping` |

**Ejemplo**: Ejecuta `bun run pipeline:check --all --quick` antes de cada sprint review para verificar que todas las UVs cumplen los gates de calidad.

> **Ver**: [Pipeline completo](../reference/pipeline.md) · [Catálogo de herramientas](../reference/tooling.md)

---

## Siguiente paso

Has aprendido a gobernar specs en tu equipo. Para profundizar en cómo KDD estructura el conocimiento, lee [Capas explicadas](../concepts/layers-explained.md).

Si necesitas revisar un PR de specs ahora mismo, consulta el [Checklist de revisión](#checklist-de-revisión) de esta guía.
