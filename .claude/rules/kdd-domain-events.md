---
paths:
  - specs/01-domain/events/**
  - specs/domains/*/01-domain/events/**
---

# Eventos de Dominio KDD

> Aplica cuando trabajas en `specs/01-domain/events/`

## Nombrado de Archivo

Patron: `EVT-Entidad-Accion.md`

Ejemplos:
- `EVT-Proyecto-Creado.md`
- `EVT-Tarea-Completada.md`
- `EVT-Usuario-Registrado.md`

## Frontmatter Requerido

```yaml
---
kind: event
source: "[[Entidad]]"         # Entidad que emite el evento (opcional)
---
```

## Estructura del Documento

```markdown
# EVT-Entidad-Accion

## Description <!-- required -->
- Que representa el evento
- Cuando se emite
- Por que es importante

## Emitter <!-- optional -->
| Entity | Triggering action |
|--------|-------------------|
| [[Proyecto]] | Cuando se crea un nuevo Proyecto |

## Payload <!-- required -->
| Field | Type | Description |
|-------|------|-------------|
| `entity_id` | uuid | ID de la entidad afectada |
| `previous_state` | string | Estado anterior (si aplica) |
| `new_state` | string | Nuevo estado |
| `timestamp` | datetime | Momento del evento |

## Example <!-- required -->
## Subscribers <!-- optional -->
## Rules <!-- optional -->
## Related Events <!-- optional -->
```

## Payload: Campos Comunes

| Campo | Cuando incluir |
|-------|----------------|
| `entity_id` | Siempre |
| `timestamp` | Siempre |
| `previous_state` / `new_state` | Cambios de estado |
| `actor_id` | Acciones de usuario |
| `metadata` | Contexto adicional |

## Subscribers

Documentar quien reacciona al evento:

```markdown
## Subscribers

| System/Process | Reaction |
|----------------|----------|
| UI | Actualiza la interfaz |
| Notifications | Envia notificacion push |
| Analytics | Registra metrica |
| [[PRC-001]] | Inicia proceso derivado |
```

## Eventos Relacionados

```markdown
## Related Events

| Event | Relationship |
|-------|--------------|
| [[EVT-Proyecto-Configurado]] | Evento que precede |
| [[EVT-Tarea-Creada]] | Evento que puede seguir |
| [[EVT-Proyecto-Cancelado]] | Evento inverso/compensatorio |
```

## Ejemplo Completo

```markdown
---
kind: event
source: "[[Proyecto]]"
---

# EVT-Proyecto-Creado

## Description

Se emite cuando un [[Usuario]] crea un nuevo [[Proyecto]]. Marca el inicio
del flujo de configuracion del Proyecto.

## Emitter

| Entity | Triggering action |
|--------|-------------------|
| [[Proyecto]] | Usuario completa formulario de creacion |

## Payload

| Field | Type | Description |
|-------|------|-------------|
| `proyecto_id` | uuid | ID del Proyecto creado |
| `usuario_id` | uuid | ID del Usuario propietario |
| `titulo` | string | Titulo del Proyecto |
| `timestamp` | datetime | Momento de creacion |

## Example

```json
{
  "event": "EVT-Proyecto-Creado",
  "version": "1.0",
  "timestamp": "2024-12-06T16:30:00Z",
  "payload": {
    "proyecto_id": "550e8400-e29b-41d4-a716-446655440000",
    "usuario_id": "123e4567-e89b-12d3-a456-426614174000",
    "titulo": "Estrategia de lanzamiento Q1"
  }
}
```

## Subscribers

| System/Process | Reaction |
|----------------|----------|
| UI | Redirige a pantalla de configuracion |
| Analytics | Registra evento de creacion |

## Related Events

| Event | Relationship |
|-------|--------------|
| [[EVT-Proyecto-Configurado]] | Siguiente evento esperado |
| [[EVT-Proyecto-Eliminado]] | Evento compensatorio |
```
