---
title: "Guía KDD para Desarrolladores"
audience: [dev]
type: how-to
reading_time: "10 min"
status: draft
---

# Guía KDD para Desarrolladores

> Para: Desarrolladores · Tiempo: 10 min · Tipo: How-to

Esta guía te enseña a usar las especificaciones KDD antes de implementar. Aprenderás dónde buscar información técnica, cómo crear artefactos y cómo mapear specs a código.

Al terminar, sabrás leer una spec completa y derivar tests desde ella.

---

## Por qué leer specs antes de codificar

Cada spec documenta decisiones que alguien tomó antes que tú. Las **Business Rules (BR)** dicen qué validaciones debe pasar tu código. Los **Commands (CMD)** especifican qué errores manejar. Los **Use Cases (UC)** muestran el flujo completo, incluyendo casos edge que no aparecen en la UI.

Si no lees las specs, terminas adivinando. Las adivinanzas crean bugs.

## Lectura básica: de UC a implementación

Sigue este orden cuando implementas una feature:

### 1. Encuentra el Use Case

Los **Use Cases (UC)** viven en `specs/02-behavior/use-cases/`. Busca el **Use Case (UC)** relacionado con tu tarea. El UC describe el flujo completo usuario-sistema.

**Ejemplo real: UC-001-Crear-Proyecto.md**

```markdown
## Flujo Principal
1. Usuario accede a "Nuevo Proyecto"
2. Sistema muestra formulario con campo título (obligatorio, máx. 100 caracteres)
3. Usuario ingresa título
4. Sistema valida en tiempo real (1-100 caracteres, no vacío)
5. Usuario hace clic en "Crear Proyecto"
6. Sistema crea el Proyecto con estado `borrador`
7. Sistema emite evento EVT-Proyecto-Creado
8. Sistema redirige a configuración de Miembros
```

**Qué extraer del UC:**
- Flujo principal → implementas el camino feliz
- Excepciones → implementas manejo de errores
- Reglas aplicadas → buscas las BR referenciadas
- Comandos ejecutados → lees los CMD específicos

### 2. Lee los Commands referenciados

Cada UC enlaza a uno o más **Commands (CMD)**. Los **Commands (CMD)** viven en `specs/02-behavior/commands/`. Abre el CMD y extrae:

**Ejemplo real del proyecto (en inglés por convención técnica):**

`CMD-003-DeleteProyecto.md`

```markdown
## Input
| Parameter | Type | Required | Validation |
| proyectoId | UUID | Yes | Must exist and belong to user |
| confirmation | boolean | Yes | Must be `true` to proceed |

## Preconditions
- User is authenticated
- Proyecto exists
- User is owner ([[BR-PROYECTO-008]])
- Proyecto has NO sessions ([[BR-PROYECTO-007]])

## Possible Errors
| Code | Condition | Message |
| PROYECTO-202 | Not owner | "You don't have permission..." |
| PROYECTO-203 | Has sessions | "Cannot delete with task history" |
```

**Qué extraer del CMD:**
- Input → creas el schema de validación (Zod)
- Preconditions → validaciones que ejecutas antes de la operación
- Possible Errors → códigos de error y mensajes exactos
- Postconditions → qué debe ser cierto después de ejecutar
- Events Generated → eventos que emites tras el éxito

### 3. Verifica las Business Rules

Las **Business Rules (BR)** viven en `specs/01-domain/rules/`. Cuando un CMD o UC referencia una BR, ábrela. La BR define restricciones inmutables del dominio.

**Ejemplo real: BR-PROYECTO-005.md (Transición a terminado)**

```markdown
## Declaración
Un Proyecto transiciona a estado `terminado` cuando alcanza el límite fijo
de 4 tareas completadas, o cuando el Usuario lo cierra manualmente.
Una vez terminado, no puede cambiar de estado.

## Qué pasa si se incumple
| Escenario | Comportamiento |
| Intento de reabrir Proyecto terminado | RECHAZA con error "Un proyecto terminado no puede cambiar de estado" |
```

**Qué extraer de la BR:**
- Declaración → lógica que implementas
- Qué pasa si se incumple → manejo del error
- Ejemplos de casos válidos/inválidos → tus casos de test

### 4. Consulta los Events si aplica

Los **Events (EVT)** viven en `specs/01-domain/events/`. Si tu CMD debe emitir un evento, abre el EVT para conocer el payload exacto.

**Ejemplo real: EVT-Contribucion-Generada.md**

```markdown
## Payload
| Campo | Tipo | Descripción |
| contribucion_id | uuid | ID de la contribución creada |
| persona_nombre | string | Nombre de la persona (para UI) |
| etiqueta | string | Color del etiqueta activo |
| generated_at | datetime | Momento de generación |
```

**Qué extraer del EVT:**
- Payload → estructura exacta del objeto que emites
- Suscriptores → qué sistemas reaccionan al evento (útil para debugging)

---

## Cómo crear artefactos técnicos

Como Dev, creas cuatro tipos de specs:

### Crear un Command (CMD)

**Cuándo:** Implementas una operación que cambia datos (write en CQRS).

**Pasos:**
1. Copia el template: `kdd/templates/command.template.md`
2. Renombra: `CMD-NNN-{OperationName}.md` (usa el siguiente número disponible)
3. Ubica en: `specs/02-behavior/commands/`
4. Completa las secciones requeridas:
   - Purpose: qué hace el comando
   - Input: tabla con parámetros, tipos, required, validación
   - Preconditions: condiciones previas (enlaza BR si aplica)
   - Postconditions: estado después de ejecutar
   - Possible Errors: tabla con Code, Condition, Message
5. Marca status como `draft` hasta revisión

**Ejemplo mínimo:**

```markdown
---
id: CMD-025
kind: command
title: Archive Proyecto
status: draft
---

# CMD-025: ArchiveProyecto

## Purpose
Moves a completed Proyecto to archived state for future reference.

## Input
| Parameter | Type | Required | Validation |
| proyectoId | UUID | Yes | Must exist and be terminado |

## Preconditions
- Proyecto estado is `terminado`
- User is owner

## Postconditions
- Proyecto is moved to archived list
- Proyecto still visible in history

## Possible Errors
| Code | Condition | Message |
| PROYECTO-301 | Not terminado | "Only completed proyectos can be archived" |
```

### Crear un Query (QRY)

Un **Query (QRY)** es una operación de lectura de datos en CQRS.

**Cuándo:** Implementas una operación que lee datos (read en CQRS).

**Pasos:**
1. Copia el template: `kdd/templates/query.template.md`
2. Renombra: `QRY-NNN-{QueryName}.md`
3. Ubica en: `specs/02-behavior/queries/`
4. Completa: Purpose, Input, Output, Possible Errors

**Diferencia con CMD:** Los Query no cambian estado del sistema, no emiten eventos, solo devuelven datos.

### Crear un Event (EVT)

**Cuándo:** Implementas un comando que debe notificar a otros subsistemas.

**Pasos:**
1. Copia el template: `kdd/templates/event.template.md`
2. Renombra: `EVT-{Entidad}-{Accion}.md` (ejemplo: `EVT-Proyecto-Archivado.md`)
3. Ubica en: `specs/01-domain/events/`
4. Completa:
   - Descripción: cuándo se emite
   - Emisor: qué entidad/CMD lo dispara
   - Payload: tabla con campos, tipos, descripción
   - Suscriptores: qué sistemas reaccionan

### Crear una Business Rule (BR)

**Cuándo:** Descubres una regla de negocio no documentada durante implementación.

**Pasos:**
1. Copia el template: `kdd/templates/rule.template.md`
2. Renombra: `BR-{ENTIDAD}-NNN.md` (ejemplo: `BR-SESION-009.md`)
3. Ubica en: `specs/01-domain/rules/`
4. Completa las 5 secciones requeridas:
   - Declaración: qué dice la regla (en español, con wiki-links)
   - Por qué existe: justificación de negocio
   - Cuándo aplica: triggers o condiciones
   - Qué pasa si se incumple: consecuencias
   - Ejemplos: casos válidos e inválidos

**Importante:** Si descubres una BR durante desarrollo, créala en estado `draft` y notifica al PM. No esperes a que alguien más lo documente.

---

## Mapeo de spec a código

Esta tabla te muestra dónde vive cada artefacto en el código de TaskFlow:

| Spec | Archivo en código | Ubicación |
|------|-------------------|-----------|
| **CMD-NNN** | `{operation-name}.use-case.ts` | `apps/api/src/application/use-cases/` |
| **CMD Input** | Schema Zod | Dentro del use-case o en `packages/shared/validators/` |
| **CMD Errors** | Custom error classes | `apps/api/src/application/errors/` (ej: `BusinessRuleError`) |
| **QRY-NNN** | `{query-name}.query.ts` | `apps/api/src/application/queries/` |
| **BR-XXX-NNN** | Lógica en entity o use-case | Validación en el método del use-case |
| **EVT-XXX-YYY** | Event emitter call | Dentro del use-case que lo genera |
| **Entity** | `{entity}.entity.ts` | `apps/api/src/domain/entities/` |
| **Entity atributos** | Class properties | Dentro de la clase de la entidad |

**Ejemplo concreto: CMD-003-DeleteProyecto**

| Qué dice la spec | Dónde está en código |
|------------------|----------------------|
| Input: `proyectoId`, `confirmation` | Schema Zod en `delete-proyecto.use-case.ts` |
| Precondition: User is owner | `if (proyecto.creadorId !== input.userId)` |
| Precondition: No sessions | `countByProyecto(proyectoId)` check |
| Error: PROYECTO-202 | `throw new ForbiddenError('PROYECTO-202')` |
| Error: PROYECTO-203 | `throw new BusinessRuleError('PROYECTO-203', '...')` |
| Event: ProyectoDeleted | `eventEmitter.emit('ProyectoDeleted', {...})` |

---

## Cómo derivar tests de specs

Cada artefacto KDD genera tests específicos. Usa esta guía rápida:

### Desde un UC

Cada flujo del UC se convierte en un test case:

| Sección del UC | Tipo de test | Ejemplo |
|----------------|--------------|---------|
| Flujo Principal | Happy path test | `should create proyecto when all inputs valid` |
| Flujo Alternativo | Alternative flow test | `should allow user to skip personas configuration` |
| Excepción | Error case test | `should reject when title exceeds 100 chars` |

**Patrón del test:**
```typescript
// Desde UC-001 Flujo Principal paso 1-8
it('should create proyecto with estado borrador when valid input', async () => {
  const input = { titulo: 'Mi proyecto de prueba' }
  const result = await createProyecto(input)

  expect(result.estado).toBe('borrador')
  expect(result.titulo).toBe('Mi proyecto de prueba')
})

// Desde UC-001 Excepción 4a (título demasiado largo)
it('should reject when title exceeds 100 characters', async () => {
  const input = { titulo: 'a'.repeat(101) }

  await expect(createProyecto(input)).rejects.toThrow('El título no puede exceder 100 caracteres')
})
```

### Desde un CMD

Cada sección del CMD genera tests específicos:

| Sección del CMD | Test que creas |
|-----------------|----------------|
| Input validation | Validación de schema Zod |
| Preconditions | Test que verifique cada precondición |
| Postconditions | Assertion de estado final |
| Possible Errors | Test por cada código de error |

**Patrón del test:**
```typescript
// Desde CMD-003 Precondition: User is owner
it('should throw PROYECTO-202 when user is not owner', async () => {
  const cmd = { proyectoId: existingId, userId: differentUserId }

  await expect(deleteProyecto(cmd)).rejects.toThrow('PROYECTO-202')
})

// Desde CMD-003 Precondition: No sessions
it('should throw PROYECTO-203 when proyecto has sessions', async () => {
  // Arrange: crear proyecto con tareas
  const retoWithSessions = await createProyectoWithSessions()

  // Act & Assert
  await expect(deleteProyecto({ proyectoId: retoWithSessions.id }))
    .rejects.toThrow('Cannot delete a proyecto with session history')
})
```

### Desde una BR

Cada regla genera tests de validación y casos edge:

| Parte de la BR | Test que creas |
|----------------|----------------|
| Declaración | Test del comportamiento correcto |
| Casos Válidos | Happy path tests |
| Casos Inválidos | Error tests |

**Patrón del test:**
```typescript
// Desde BR-PROYECTO-005: Transición a terminado
describe('BR-PROYECTO-005: Transición a terminado', () => {
  it('should transition to terminado after 4th completed tarea', async () => {
    // Arrange: proyecto con 3 tareas completadas
    const proyecto = await createProyectoWithCompletedSessions(3)

    // Act: completar cuarta sesión
    await completeTarea(proyecto.id)

    // Assert
    const updated = await getProyecto(proyecto.id)
    expect(updated.estado).toBe('terminado')
  })

  it('should reject state change when proyecto is terminado', async () => {
    // Arrange: proyecto terminado
    const proyecto = await createTerminatedProyecto()

    // Act & Assert
    await expect(transitionProyecto(proyecto.id, 'preparado'))
      .rejects.toThrow('Un proyecto terminado no puede cambiar de estado')
  })
})
```

---

## Qué hacer con conocimiento no documentado

Durante la implementación descubrirás cosas no documentadas. Actúa así:

### Descubres una regla de negocio nueva

**Síntoma:** Encuentras un `if` en el código que valida algo crítico, pero no hay BR que lo documente.

**Acción:**
1. Crea la BR en `specs/01-domain/rules/BR-{ENTIDAD}-NNN.md`
2. Marca status como `draft`
3. Completa las 5 secciones (Declaración, Por qué, Cuándo, Qué pasa si, Ejemplos)
4. Notifica al PM en Slack/Linear: "Documenté BR-XXX-NNN que encontré en el código"
5. Incluye la BR en el PR junto con tu código

### Descubres un caso edge no cubierto en UC

**Síntoma:** Implementas un flujo y te das cuenta de un caso no documentado en el UC.

**Acción:**
1. Abre el UC existente
2. Añade una nueva excepción (E5, E6, etc.)
3. Documenta el caso edge con el formato: "Qué pasa → Qué hace el sistema"
4. Marca el UC como `review` en el frontmatter
5. Notifica al PM para validación

**Ejemplo:**
```markdown
### E7: Usuario intenta crear proyecto mientras está offline

1. El Sistema detecta falta de conexión
2. El Sistema guarda el proyecto localmente (IndexedDB)
3. El Sistema muestra: "Proyecto guardado. Se sincronizará al recuperar conexión"
4. Cuando recupera conexión, el Sistema sincroniza automáticamente
```

### Descubres que un CMD no emite un evento esperado

**Síntoma:** El frontend espera un evento que el backend no emite.

**Acción:**
1. Verifica si el evento existe en `specs/01-domain/events/`
2. Si no existe, créalo con el template
3. Actualiza el CMD para enlazar el evento en la sección "Events Generated"
4. Implementa la emisión en el código
5. Documenta ambos cambios en tu PR

---

## Checklist antes de implementar

Antes de escribir código, verifica:

- [ ] Leí el UC completo (flujo principal + excepciones)
- [ ] Leí todos los CMD referenciados por el UC
- [ ] Revisé las BR enlazadas desde CMD y UC
- [ ] Conozco todos los errores que debo manejar (tabla Possible Errors)
- [ ] Sé qué eventos debo emitir (si aplica)
- [ ] Identifiqué qué validaciones vienen del frontend vs backend
- [ ] Entiendo las precondiciones y postcondiciones del comando

---

## Checklist antes de hacer PR

Antes de crear tu pull request, verifica:

**Código**
- [ ] Implementé todos los casos del flujo principal
- [ ] Implementé todas las excepciones del UC
- [ ] Validé todas las preconditions del CMD
- [ ] Emití todos los eventos especificados
- [ ] Usé los códigos de error exactos de la spec
- [ ] Usé los mensajes de error exactos de la spec

**Tests**
- [ ] Test del happy path (flujo principal)
- [ ] Test por cada excepción del UC
- [ ] Test por cada Possible Error del CMD
- [ ] Test de cada precondición del CMD
- [ ] Test de las BR validadas

**Specs**
- [ ] Si creé nueva BR, está documentada en estado `draft`
- [ ] Si descubrí caso edge, actualicé el UC
- [ ] Si cambié input/output, actualicé el CMD
- [ ] Todos los enlaces wiki-link funcionan

---

## Herramientas de automatización

Estas herramientas aceleran tu flujo de implementación desde Claude Code y la terminal:

| Herramienta | Qué hace | Cómo invocar |
|---|---|---|
| `/kdd-verify` | Verifica que tu código cumple la spec | Escribe `/kdd-verify` en Claude Code |
| `/generate-e2e` | Genera test E2E Playwright desde spec REQ | `/generate-e2e` |
| `pipeline:scaffold` | Genera stubs de use-case desde CMD | `bun run pipeline:scaffold UV-004` |
| `pipeline:check` | Valida spec + código + tests completos | `bun run pipeline:check UV-004` |
| `/kdd-review` | Revisa calidad de una spec | `/kdd-review` |
| `/kdd-fix` | Corrige problemas técnicos en specs | `/kdd-fix` |
| `pipeline:mapping` | Muestra mapeo CMD → código → tests | `bun run pipeline:mapping` |

**Ejemplo**: Ejecuta `bun run pipeline:scaffold UV-004` y el sistema genera archivos `.use-case.ts` con TODOs para cada CMD pendiente de la UV.

> **Ver**: [Pipeline de validación](../reference/pipeline.md) · [Catálogo completo](../reference/tooling.md)

---

## Recursos

**Templates:**
- `kdd/templates/command.template.md`
- `kdd/templates/query.template.md`
- `kdd/templates/event.template.md`
- `kdd/templates/rule.template.md`

**Referencia rápida:**
- [Referencia de artefactos](../reference/artifacts.md) - Catálogo completo
- [Cheatsheet](../reference/cheatsheet.md) - Una página con todo
- [FAQ para Devs](../faq.md#para-devs) - Preguntas comunes

**Tutoriales prácticos:**
- [Tutorial: Crea tu primer Command](../tutorials/first-command.md)
- [Tutorial: De spec a test](../tutorials/spec-to-test.md)

**Siguiente paso:** Practica con el [Tutorial: Crea tu primer Command](../tutorials/first-command.md).
