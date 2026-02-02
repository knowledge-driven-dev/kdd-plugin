# @file-pattern: ^implementation-charter\.md$
---
id: ARCH-CHARTER-XXXX          # @required @pattern: ^ARCH-CHARTER-[A-Z0-9\-]+$
kind: implementation-charter   # @required
status: draft                  # @required @enum: [draft, review, approved, deprecated]
stack_version: YYYY-MM         # @required
supersedes: []                 # @optional
adr_refs:                      # @optional @description: Lista de ADR tecnológicos relacionados
  - ADR-XXXX
---

# Implementation Charter · {Scope}

> Describe el alcance (API, Web, Data, etc.) y propósito del charter.

## 1. Stack oficial

| Capa | Tecnología | Versión mínima | ADR |
|------|------------|----------------|-----|
| Runtime | ... | ... | [[ADR-XXXX]] |
| Backend | ... | ... | [[ADR-XXXX]] |

## 2. Topología del repositorio

```
{Estructura relevante}
```

Reglas de dependencia clave (enlaza ADRs o documentación).

## 3. Mapeo Artefacto KDD → Código

| Artefacto KDD | Output mínimo | Ruta destino |
|---------------|---------------|--------------|
| `CMD-*` | ... | ... |

## 4. Convenciones de código

- Resumen de estilo/naming.
- Enlaces a ejemplos en el repositorio (ej. `CLAUDE.md`).

## 5. Tooling & Pipelines

| Acción | Comando |
|--------|---------|
| ... | ... |

## 6. Gobernanza

- Responsables y proceso de actualización.
- Cómo versionar el charter y registrar supersedes.

## 7. Compatibilidad con agentes

Indica cómo deben leer este charter (metadatos, snippets, plantillas).

## 8. Próximos pasos

Lista de tareas o enlaces posteriores.

