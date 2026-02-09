# Capa 05: Architecture

> **Propósito**: convertir las especificaciones verificadas (capa 04) en un plan tecnológico concreto y trazable que puedan consumir agentes o desarrolladores para generar scaffolding consistente.

---

## 1. ¿Por qué existe esta capa?

KDD mantiene el conocimiento agnóstico a la implementación hasta la verificación. Sin embargo, para llevar ese conocimiento al código necesitamos un **contrato explícito** que defina stack, convenciones y cómo se proyectan los artefactos KDD en el repositorio. La Capa 05 introduce ese contrato mediante dos piezas:

1. **Implementation Charter**: documenta el stack oficial, reglas de arquitectura y convenciones operativas.
2. **ADRs tecnológicos**: decisiones tácticas (frameworks, patrones, topología) que soportan al charter.

Esto permite:

- Mantener la capa de conocimiento independiente del stack.
- Cambiar de tecnología generando un nuevo charter sin tocar las capas 00‑04.
- Automatizar scaffolding porque agentes como Codex/Cursor/Claude Code ahora conocen dónde y cómo materializar cada artefacto.

```
┌─────────────────────────────────────────────────────────────────┐
│    Capa 04: Verification →  Capa 05: Architecture  →  Código   │
│    Specs verificadas          Charter + ADRs          Scaffolds │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Artefactos de la Capa 05

| Tipo | Ubicación | Descripción |
|------|-----------|-------------|
| **Implementation Charter** | `specs/05-architecture/charter.md` (uno por stack) | Fuente única de stack, convenciones y mapeos spec→repo. |
| **ADRs tecnológicos** | `specs/05-architecture/decisions/ADR-XXXX-*.md` | Decisiones de infraestructura/patrones. |
| **Profiles opcionales** | `specs/05-architecture/profiles/*.md` | Variantes del charter (p.ej. "API Lite", "UI Experimental"). |

> **Nota**: `specs/00-requirements/decisions/` se conserva para ADRs de negocio o estrategia. Toda decisión puramente técnica se documenta desde ahora en `05-architecture`.

---

## 3. Implementation Charter

### 3.1 Frontmatter sugerido

> Usa la plantilla oficial: [`kdd/templates/implementation-charter.template.md`](../../templates/implementation-charter.template.md)

```yaml
---
id: ARCH-CHARTER-API
kind: implementation-charter
status: approved        # draft|review|approved|deprecated
stack_version: 2024-12  # Permite versionar el contrato
supersedes:
  - ARCH-CHARTER-2024-09
adr_refs:
  - ADR-0102-Elysia-Backend
  - ADR-0103-Drizzle-ORM
---
```

### 3.2 Secciones mínimas

1. **Stack oficial**
   - Runtime, backend, frontend, ORM, DB, autenticación, tooling (cita a ADRs).
   - Ejemplo: "Backend: Elysia 1.0+ (ver [[ADR-0102-Elysia-Backend]])".

2. **Topología del repositorio**
   - Árbol resumido (`apps/api`, `apps/web`, `packages/shared`) y reglas de dependencia (ej. Hexagonal Light de `CLAUDE.md`).
   - Diagramas ASCII compatibles con agentes.

3. **Mapeo Artefacto KDD → Código**

| Artefacto KDD | Output mínimo | Ubicación |
|---------------|---------------|-----------|
| `CMD-*` | `SubmitIdeaUseCase` + schema Zod | `apps/api/src/application/use-cases/` |
| `UC-*` | Use case handler + test BDD | `apps/api/src/application/use-cases/` |
| `REQ-*` | Test BDD + contrato API | `apps/api/tests/...` + `apps/api/src/routes/...` |
| `UI-*` | Storybook wireframe + componente | `apps/web/components/...` |

4. **Convenciones de Código**
   - Resumen de naming, estilo TypeScript, patrones Elysia/Drizzle, UI shadcn (referenciando secciones de `CLAUDE.md`).
   - Ejemplos cortos copy‑paste friendly.

5. **Tooling & Pipelines**
   - Comandos obligatorios (bun dev, bun test, bun lint, Drizzle CLI).
   - Hooks y políticas (coverage ≥85%, Prettier, etc.).

6. **Política de Gobernanza**
   - Quién aprueba cambios al charter.
   - Cómo se versiona y se enlaza con CI/CD (p.ej., pipeline `validate:charter` que asegure campos requeridos).

### 3.3 Compatibilidad con agentes tipo Codex/Cursor/Claude Code

- **Metadatos estructurados**: frontmatter expone `stack`, `paths`, `templates`.
- **Snippets etiquetados**: usar comentarios `<!-- example:start CMD -->` / `<!-- example:end -->` para que las herramientas extraigan fragmentos sin interpretar todo el documento.
- **Enlaces a plantillas**: cada sección debe señalar el template correspondiente en `/kdd/templates/` o `/scripts/spec-validator/`.

---

## 4. Flujo de trabajo propuesto

1. **Crear/actualizar charter** cuando se incorpora o cambia el stack.
2. **Registrar ADR tecnológico** para cada decisión mayor (framework, hosting, patrones de capas).
3. **Enlazar specs aprobadas** con el charter:
   - `REQ-###` referencia el charter en su sección "Implementación".
   - `CMD-###` incluye `implements: [ARCH-CHARTER-API]`.
4. **Generar scaffolding**:
   - Herramienta (Codex/Cursor) lee el charter para conocer nombres de carpetas, convenciones, comandos post‑scaffold.
   - Produce archivos en rutas indicadas respetando la arquitectura hexagonal.
5. **Validar**:
   - `bun run validate:specs` asegura que specs sigan consistentes.
   - Nuevo `bun run validate:charter` (pendiente) verifica que todo mapeo apunte a rutas reales.

---

## 5. Interacción con las demás capas

| Capa | ¿Qué aporta a 05? | ¿Qué recibe de 05? |
|------|-------------------|---------------------|
| 00 Requirements | Objetivos, KPIs | Lista de ADRs de negocio que pueden condicionar el stack. |
| 01 Domain | Entidades/Reglas | Naming y módulos donde se implementarán modelos (p.ej., `domain/entities`). |
| 02 Behavior | Comandos/Procesos/Use Cases | Plantillas para use cases, puertos y adapters. |
| 03 Experience | Vistas/UI | Convenciones Storybook/Next para wireframes y componentes. |
| 04 Verification | Requisitos/tests | Pautas para ubicar suites, fixtures y contratos API. |

Si el stack cambia, se actualiza el charter y se regeneran scaffolds, pero las capas 00‑04 permanecen intactas, preservando la independencia del conocimiento.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   00-Requirements                                                            │
│         │                                                                    │
│         ▼                                                                    │
│   01-Domain ──────────────────────────┐                                     │
│         │                             │                                      │
│         ▼                             │                                      │
│   02-Behavior ────────────────────────┼───────────────────┐                 │
│         │                             │                   │                  │
│         ▼                             │                   │                  │
│   03-Experience ──────────────────────┼───────────────────┼───────┐         │
│         │                             │                   │       │          │
│         ▼                             ▼                   ▼       ▼          │
│   04-Verification ─────────────────────────────────────────────────┐        │
│         │                                                          │         │
│         └──────────────────────────────────────────────────────────┤         │
│                                                                    ▼         │
│                                                           05-Architecture    │
│                                                           (Charter + ADRs)   │
│                                                                    │         │
│                                                                    ▼         │
│                                                                 CÓDIGO       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Estructura de Carpetas

```
/specs/05-architecture/
├── charter.md                    # Implementation Charter principal
├── decisions/
│   ├── ADR-0001-Bun-Runtime.md
│   ├── ADR-0002-Elysia-Backend.md
│   ├── ADR-0003-Drizzle-ORM.md
│   └── ...
└── profiles/                     # Variantes opcionales
    ├── api-lite.md
    └── ui-experimental.md
```

---

## 7. Próximos pasos

1. **Crear `specs/05-architecture/`** con el primer charter basado en `CLAUDE.md` y mover ADRs técnicos allí.
2. **Publicar template** `kdd/templates/implementation-charter.template.md` (estructura descrita arriba).
3. **Extender tooling**:
   - Script que valide campos del charter y la presencia de ADRs referenciados.
   - Comando que, dada una spec, lea el charter y genere scaffolding (futuro paso 7).
4. **Actualizar documentación KDD** para reflejar esta capa y la separación entre ADRs de negocio vs. tecnológicos.

> Con este Layer 05, KDD sigue siendo agnóstico por diseño, pero ahora existe un puente documentado y versionado entre las especificaciones y las herramientas que generan código.

---

## Artefactos Relacionados

- [[implementation-charter.template]] - Template para el Charter
- [[04-verification]] - Requisitos verificados que consume esta capa
- [[02-behavior]] - Comandos y Use Cases que se mapean a código
- [[01-domain]] - Entidades que se implementan como modelos
- [[00-requirements]] - Objetivos de negocio que condicionan el stack
- [[Introducción a KDD]] - Visión general de KDD

---

*Última actualización: 2025-01*
