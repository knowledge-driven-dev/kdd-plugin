---
# @type: event
# @description: Domain event
# @file-pattern: ^EVT-.+\.md$
# @path-pattern: domain/events/

kind: event                   # @required @literal: event
---

# EVT-Event-Name <!-- title-is-name pattern: ^EVT-.+ -->

## Description <!-- required -->

Clear description of the event:
- What it represents
- When it is emitted
- Why it is important

## Emitter <!-- optional alias: Source|Producer -->

| Entity | Triggering action |
|--------|-------------------|
| [[Entity]] | Action that triggers the event |

## Payload <!-- required -->

| Field | Type | Description |
|-------|------|-------------|
| `entity_id` | uuid | ID of the affected entity |
| `field1` | string | Field description |
| `field2` | number | Field description |
| `previous_state` | string | Previous state (if applicable) |
| `new_state` | string | New state (if applicable) |
| `timestamp` | datetime | Event timestamp |

## Example <!-- required -->

<!-- expects: json -->
```json
{
  "event": "EVT-Event-Name",
  "version": "1.0",
  "timestamp": "2024-12-06T16:30:00Z",
  "payload": {
    "entity_id": "550e8400-e29b-41d4-a716-446655440000",
    "field1": "value",
    "field2": 42,
    "previous_state": "state1",
    "new_state": "state2"
  }
}
```

## Subscribers <!-- optional alias: Consumers -->

| System/Process | Reaction |
|----------------|----------|
| UI | Updates the interface |
| Notifications | Sends notification to user |
| Analytics | Records metric |
| Other Service | Resulting action |

## Rules <!-- optional -->

- Condition under which it is emitted
- Condition under which it is NOT emitted
- Delivery guarantees (at-least-once, exactly-once)

## Related Events <!-- optional -->

| Event | Relationship |
|-------|--------------|
| [[EVT-Previous-Event]] | Event that may precede this one |
| [[EVT-Next-Event]] | Event that may follow this one |
| [[EVT-Inverse-Event]] | Opposite/compensatory event |
