---
title: "Tutorial: Crea tu primer Command"
audience: [dev]
type: tutorial
reading_time: "5 min"
status: draft
---

# Tutorial: Crea tu primer Command

> Para: Desarrolladores · Tiempo: 5 min · Tipo: Tutorial

En este tutorial crearás un **Command (CMD)** y un **Event (EVT)** desde un Use Case existente. Al terminar, habrás documentado una operación técnica completa con sus validaciones, errores y eventos.

---

## Lo que necesitas

- Conocer el proyecto TaskFlow (ver [Guía KDD para Desarrolladores](../guides/dev.md))
- Editor de texto
- Acceso a la carpeta `/specs` del proyecto

---

## Paso 1: Lee el Use Case existente

Abre el archivo `specs/02-behavior/use-cases/UC-002-Configurar-Miembros.md` y localiza el flujo principal.

Busca el paso donde el Usuario crea un Miembro. Verás algo como:

```markdown
3. El Usuario hace clic en "Crear Miembro"
4. El Sistema valida los datos
5. El Sistema crea el Miembro
6. El Sistema emite evento EVT-Miembro-Creado
```

**Resultado verificable**: Identificaste la operación "crear Miembro" en el UC.

---

## Paso 2: Crea el archivo del Command

Crea un nuevo archivo en `specs/02-behavior/commands/` con el nombre `CMD-005-CreateMiembro.md`.

Copia el contenido del template `kdd/templates/command.template.md` al archivo.

**Resultado verificable**: El archivo `CMD-005-CreateMiembro.md` existe y contiene el template.

---

## Paso 3: Completa el frontmatter

Reemplaza el frontmatter del template con:

```yaml
---
id: CMD-005
kind: command
status: draft
created: 2024-12-13
tags:
  - miembro
  - core
---
```

**Resultado verificable**: El frontmatter tiene el `id: CMD-005` y `kind: command`.

---

## Paso 4: Define el propósito del comando

Reemplaza la sección `## Purpose` con:

```markdown
## Purpose

Creates a new [[Miembro]] and associates it with an existing [[Proyecto]].
This command is invoked during the configuration phase after a Proyecto is created.
```

**Resultado verificable**: La sección Purpose describe qué hace el comando y cuándo se usa.

---

## Paso 5: Especifica el input

Reemplaza la sección `## Input` con esta tabla:

```markdown
## Input

| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| proyectoId | UUID | Yes | Must exist and be in estado `borrador` or `preparado` |
| nombre | string | Yes | 3-50 chars, not empty |
| perfil | string | Yes | 20-500 chars, describes perspective/expertise |
| userId | UUID | Yes | Must be authenticated user and owner of Proyecto |
```

**Resultado verificable**: La tabla tiene 4 parámetros con tipo, required y validación.

---

## Paso 6: Define las precondiciones

Reemplaza la sección `## Preconditions` con:

```markdown
## Preconditions

- User is authenticated
- Proyecto exists and User is the owner
- Proyecto estado is `borrador` or `preparado`
- Proyecto does not have 6 Miembros (max limit per [[BR-MIEMBRO-001]])
```

**Resultado verificable**: Las precondiciones enlazan la Business Rule `BR-MIEMBRO-001`.

---

## Paso 7: Especifica las postcondiciones

Reemplaza la sección `## Postconditions` con:

```markdown
## Postconditions

- New [[Miembro]] exists with:
  - Generated UUID
  - Associated with the specified Proyecto
  - `nombre` and `perfil` as provided
  - `generadaPorIa: false` (manually created)
- Proyecto's miembro count incremented
- If Proyecto now has 3+ miembros, Proyecto transitions to `preparado` (see [[BR-PROYECTO-003]])
```

**Resultado verificable**: Las postcondiciones describen qué cambia tras ejecutar el comando.

---

## Paso 8: Lista los errores posibles

Reemplaza la sección `## Possible Errors` con:

```markdown
## Possible Errors

| Code | Condition | Message |
|------|-----------|---------|
| PERSONA-001 | Proyecto not found | "Proyecto no encontrado" |
| PERSONA-002 | User not owner | "No tienes permiso para modificar este Proyecto" |
| MIEMBRO-003 | Proyecto not editable | "Solo puedes añadir miembros a un Proyecto en estado borrador o preparado" |
| PERSONA-004 | Limit exceeded | "Has alcanzado el límite de 6 miembros por Proyecto" |
| PERSONA-005 | Empty nombre | "El nombre es obligatorio" |
| PERSONA-006 | Nombre too long | "El nombre no puede exceder 50 caracteres" |
| PERSONA-007 | Perfil too short | "El perfil debe tener al menos 20 caracteres" |
```

**Resultado verificable**: La tabla tiene 7 códigos de error con condición y mensaje.

---

## Paso 9: Especifica los eventos generados

Reemplaza la sección `## Events Generated` con:

```markdown
## Events Generated

- [[EVT-Miembro-Creado]] on success with payload:
  ```yaml
  miembro_id: UUID
  proyecto_id: UUID
  nombre: string
  created_at: ISO-8601
  ```
```

**Resultado verificable**: El comando enlaza el evento `EVT-Miembro-Creado`.

---

## Paso 10: Crea el archivo del Event

Crea un nuevo archivo en `specs/01-domain/events/` con el nombre `EVT-Miembro-Creado.md`.

Copia el contenido del template `kdd/templates/event.template.md` al archivo.

**Resultado verificable**: El archivo `EVT-Miembro-Creado.md` existe.

---

## Paso 11: Completa el frontmatter del evento

Reemplaza el frontmatter del evento con:

```yaml
---
kind: event
source: "[[Miembro]]"
---
```

**Resultado verificable**: El frontmatter tiene `kind: event`.

---

## Paso 12: Define la descripción del evento

Reemplaza la sección `## Description` con:

```markdown
## Description

Evento emitido cuando una [[Miembro]] se crea exitosamente vía [[CMD-005-CreateMiembro]].
Permite notificar al frontend para actualizar la lista de Miembros del Proyecto.
```

**Resultado verificable**: La descripción enlaza el comando que emite el evento.

---

## Paso 13: Especifica el emisor

Reemplaza la sección `## Emitter` con:

```markdown
## Emitter

| Entity | Triggering action |
|--------|-------------------|
| [[Miembro]] | Creación exitosa vía CMD-005 |
```

**Resultado verificable**: La tabla indica qué entidad emite el evento.

---

## Paso 14: Define el payload del evento

Reemplaza la sección `## Payload` con:

```markdown
## Payload

| Field | Type | Description |
|-------|------|-------------|
| `miembro_id` | uuid | ID del Miembro creado |
| `proyecto_id` | uuid | ID del Proyecto al que pertenece |
| `nombre` | string | Nombre del Miembro |
| `perfil` | string | Perfil/expertise del Miembro |
| `generada_por_ia` | boolean | Si fue generada por IA o manualmente |
| `created_at` | datetime | Marca temporal de creación |
```

**Resultado verificable**: La tabla del payload tiene 6 campos con tipo y descripción.

---

## Paso 15: Añade un ejemplo del evento

Reemplaza la sección `## Example` con:

```markdown
## Example

```json
{
  "event": "EVT-Miembro-Creado",
  "version": "1.0",
  "timestamp": "2024-12-13T14:30:00Z",
  "payload": {
    "miembro_id": "550e8400-e29b-41d4-a716-446655440002",
    "proyecto_id": "550e8400-e29b-41d4-a716-446655440001",
    "nombre": "Directora Financiera",
    "perfil": "Especialista en análisis de riesgos financieros y ROI",
    "generada_por_ia": false,
    "created_at": "2024-12-13T14:30:00Z"
  }
}
```
```

**Resultado verificable**: El ejemplo muestra un payload JSON completo con datos reales del proyecto.

---

## Paso 16: Define los suscriptores

Reemplaza la sección `## Subscribers` con:

```markdown
## Subscribers

| System/Process | Reaction |
|----------------|----------|
| UI | Actualiza la lista de Miembros del Proyecto |
| Analytics | Registra métrica de creación de Miembro |
```

**Resultado verificable**: La tabla indica qué sistemas reaccionan al evento.

---

## Paso 17: Verifica los enlaces wiki-link

Abre ambos archivos creados (`CMD-005-CreateMiembro.md` y `EVT-Miembro-Creado.md`) y verifica que todos los wiki-links estén correctos:

- `[[Miembro]]`
- `[[Proyecto]]`
- `[[BR-MIEMBRO-001]]`
- `[[BR-PROYECTO-003]]`
- `[[CMD-005-CreateMiembro]]`
- `[[EVT-Miembro-Creado]]`

**Resultado verificable**: Todos los enlaces tienen el formato correcto `[[Nombre]]`.

---

## Lo que construiste

Creaste dos artefactos técnicos completos:

**CMD-005-CreateMiembro**:
- Input con 4 parámetros y validaciones
- 4 precondiciones enlazadas a Business Rules
- Postcondiciones que describen el estado final
- 7 códigos de error con mensajes exactos
- 1 evento emitido tras éxito

**EVT-Miembro-Creado**:
- Descripción del evento
- Emisor (CMD-005)
- Payload con 6 campos
- Ejemplo JSON con datos reales
- 2 suscriptores

Estos artefactos documentan la operación "crear Miembro" de forma completa. Cualquier desarrollador puede implementar el código a partir de estas specs.

---

## Siguiente paso

Lee el [Tutorial: De spec a test](spec-to-test.md) para aprender a derivar tests desde el Command que acabas de crear.
