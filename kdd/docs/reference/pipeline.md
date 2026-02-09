---
title: "Pipeline de Validación KDD"
audience: [dev, tech-lead, qa]
type: reference
reading_time: "consulta"
status: draft
---

# Pipeline de Validación KDD

> Para: Devs, Tech Leads, QA — Tipo: Referencia — Uso: Consulta puntual

El pipeline de validación KDD ejecuta 8 gates que verifican la calidad de specs, código y tests para cada Value Unit. Cada gate valida un aspecto específico y reporta pass, warn o fail.

---

## Flujo general

```
  UV-NNN.md
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  Gate 1: Capture     — Estructura de la UV          │
│  Gate 2: Domain      — Specs de dominio existen     │
│  Gate 3: Behavior    — Specs de comportamiento + BR │
│  Gate 4: Experience  — UI specs con 4 estados       │
│  Gate 5: Verification — REQ con Gherkin             │
│  Gate 6: Physical    — Archivos de código existen   │
│  Gate 7: Code        — TypeScript compila           │
│  Gate 8: Evidence    — Tests existen y pasan        │
└─────────────────────────────────────────────────────┘
      │
      ▼
   pass / warn / fail
```

El pipeline lee la Value Unit, extrae sus artefactos referenciados y valida cada capa en orden ascendente: specs primero, código después, tests al final.

---

## Comandos CLI

| Comando | Qué hace | Ejemplo |
|---|---|---|
| `bun run pipeline:check <UV-ID>` | Ejecuta los 8 gates para una UV | `bun run pipeline:check UV-004` |
| `bun run pipeline:check --all` | Ejecuta los 8 gates para todas las UVs | `bun run pipeline:check --all` |
| `bun run pipeline:scaffold <UV-ID>` | Genera stubs de código desde specs CMD | `bun run pipeline:scaffold UV-004` |
| `bun run pipeline:status <UV-ID>` | Dashboard de completitud de una UV | `bun run pipeline:status UV-004` |
| `bun run pipeline:coverage` | Verifica cobertura BR → CMD | `bun run pipeline:coverage` |
| `bun run pipeline:mapping` | Muestra mapeo CMD → código → tests | `bun run pipeline:mapping` |

### Flags comunes de `pipeline:check`

| Flag | Efecto |
|---|---|
| `--gate N` | Ejecuta solo el gate N (1-8) |
| `--quick` | Omite typecheck y ejecución de tests |
| `--skip-typecheck` | Omite solo el typecheck |
| `--format console` | Output legible en terminal (default) |
| `--format json` | Output JSON para integraciones |
| `--format github` | Genera GitHub annotations para CI |
| `--verbose` | Muestra detalles de cada verificación |

---

## Los 8 gates

### Gate 1: Capture

**Qué valida:** La estructura de la Value Unit.

**Criterios:**

| Resultado | Condición |
|---|---|
| pass | Frontmatter tiene `id`, `kind`, `title`, `status`, `owner`. Secciones Objetivo, Alcance, Inputs, Outputs y Criterios de Salida presentes. Al menos 1 artefacto referenciado. |
| warn | Falta alguna sección opcional. |
| fail | Falta frontmatter obligatorio o no tiene artefactos referenciados. |

**Ejemplo de output:**

```
Gate 1: Capture ✓ pass
  ✓ Frontmatter: id, kind, title, status, owner
  ✓ Secciones requeridas: 5/5
  ✓ Artefactos referenciados: 4
```

### Gate 2: Domain

**Qué valida:** Que los artefactos de dominio referenciados por la UV existan como archivos.

**Artefactos verificados:** Entities (ENT), Events (EVT), Business Rules (BR).

| Resultado | Condición |
|---|---|
| pass | Todos los artefactos de dominio referenciados existen en `specs/01-domain/`. |
| warn | La UV no referencia ningún artefacto de dominio. |
| fail | Uno o más artefactos referenciados no existen. |

### Gate 3: Behavior

**Qué valida:** Que las specs de comportamiento existan y tengan cobertura de Business Rules.

**Artefactos verificados:** Commands (CMD), Queries (QRY), Use Cases (UC).

| Resultado | Condición |
|---|---|
| pass | Todos los CMD/QRY/UC existen. Las BRs referenciadas por la UV aparecen mencionadas en al menos un CMD. |
| warn | La UV no referencia artefactos de comportamiento. |
| fail | Specs faltantes o BRs sin cobertura en ningún CMD. |

### Gate 4: Experience

**Qué valida:** Que las UI specs existan y documenten los 4 estados requeridos.

**Estados requeridos:** Loading, Empty, Error, Success/Default.

| Resultado | Condición |
|---|---|
| pass | Todas las UI specs existen y documentan los 4 estados. |
| warn | La UV no referencia artefactos de UI. |
| fail | UI specs faltantes o estados no documentados. |

### Gate 5: Verification

**Qué valida:** Que existan specs REQ con criterios de aceptación Gherkin.

**Artefactos verificados:** Requirements (REQ).

| Resultado | Condición |
|---|---|
| pass | Todos los REQ existen y contienen bloques Gherkin (`Given`/`When`/`Then`). |
| warn | La UV no referencia artefactos REQ. |
| fail | REQ faltantes o sin criterios Gherkin. |

### Gate 6: Physical

**Qué valida:** Que existan archivos de código para cada CMD/QRY.

El gate busca archivos `.use-case.ts` en `apps/api/src/application/use-cases/` correspondientes a cada CMD/QRY de la UV.

| Resultado | Condición |
|---|---|
| pass | Cada CMD/QRY tiene su archivo `.use-case.ts`. |
| warn | La UV no referencia CMD/QRY. |
| fail | Uno o más CMD/QRY no tienen archivo de código. |

### Gate 7: Code

**Qué valida:** Que el proyecto TypeScript compile sin errores.

| Resultado | Condición |
|---|---|
| pass | `tsc --noEmit` termina sin errores. |
| skip | Se ejecutó con `--quick` o `--skip-typecheck`. |
| fail | El compilador reporta errores. |

### Gate 8: Evidence

**Qué valida:** Que existan archivos de test y que pasen.

| Resultado | Condición |
|---|---|
| pass | Cada CMD/QRY tiene test asociado. En modo completo, los tests pasan. |
| warn | La UV no referencia CMD/QRY. |
| fail | Tests faltantes o tests que fallan (en modo completo). |

En modo `--quick`, el gate solo verifica que los archivos de test existan sin ejecutarlos.

---

## Scaffold

El scaffold genera archivos de código a partir de specs CMD. Lee la spec, extrae input, errores, reglas y eventos, y produce un archivo `.use-case.ts` con la estructura y TODOs marcados.

### Uso

```bash
bun run pipeline:scaffold UV-004          # Genera stubs para CMD pendientes de UV-004
bun run pipeline:scaffold CMD-023         # Genera stub para un CMD específico
bun run pipeline:scaffold UV-004 --dry-run  # Muestra qué generaría sin crear archivos
bun run pipeline:scaffold UV-004 --force    # Sobrescribe archivos existentes
```

### Qué genera

Para un CMD como `CMD-MiembroProfile`, el scaffold genera:

```
apps/api/src/application/use-cases/complete-persona-profile.use-case.ts
```

El archivo incluye:
- Interface de input con los campos de la spec
- Clase del use-case con método `execute`
- Comentarios TODO para cada regla de negocio referenciada
- Comentarios TODO para cada error posible
- Comentarios TODO para cada evento a emitir

---

## Scripts de check independientes

Tres scripts ejecutan verificaciones específicas sin requerir una Value Unit.

### `pipeline:mapping` — Mapeo CMD → código → tests

Verifica que cada CMD/QRY documentado tenga un archivo de código correspondiente.

```bash
bun run pipeline:mapping                # Muestra mapeo completo
bun run pipeline:mapping --stubs-only   # Solo muestra CMDs sin código
bun run pipeline:mapping --format json  # Output JSON
```

### `pipeline:coverage` — Cobertura BR → CMD

Analiza todas las Business Rules y verifica que cada una sea referenciada por al menos un Command.

```bash
bun run pipeline:coverage                  # Reporte completo
bun run pipeline:coverage --threshold 95   # Falla si cobertura < 95%
bun run pipeline:coverage --format json    # Output JSON
```

### `pipeline:status` — Dashboard de progreso por UV

Muestra el porcentaje de completitud de una UV: specs existentes, código existente, tests existentes.

```bash
bun run pipeline:status UV-004            # Status de una UV
bun run pipeline:status                   # Status de todas las UVs (sin argumento)
bun run pipeline:status --format json     # Output JSON
```

---

## Integración CI

El pipeline se ejecuta automáticamente en cada Pull Request que modifique archivos en `specs/`, `apps/api/src/` o `scripts/pipeline/`.

### Workflow: `pipeline-check.yml`

El workflow de GitHub Actions ejecuta:

```bash
bun run pipeline:check --all --quick --format github
```

- **`--all`**: Verifica todas las Value Units del proyecto.
- **`--quick`**: Omite typecheck y ejecución de tests (velocidad en CI).
- **`--format github`**: Genera annotations de GitHub que aparecen inline en el diff del PR.

Si algún gate falla, el PR queda bloqueado. El step summary muestra un resumen del resultado.

### Qué PRs activan el pipeline

| Path modificado | Activa pipeline |
|---|---|
| `specs/**` | Sí |
| `apps/api/src/**` | Sí |
| `scripts/pipeline/**` | Sí |
| Otros paths | No |

---

## Referencia rápida

| Quiero... | Uso |
|---|---|
| Verificar una UV completa | `bun run pipeline:check UV-004` |
| Verificar todas las UVs rápidamente | `bun run pipeline:check --all --quick` |
| Verificar solo specs (sin código) | `bun run pipeline:check UV-004 --gate 1` a `--gate 5` |
| Generar stubs de código desde specs | `bun run pipeline:scaffold UV-004` |
| Ver qué CMDs no tienen código | `bun run pipeline:mapping --stubs-only` |
| Ver qué BRs no están cubiertas | `bun run pipeline:coverage` |
| Ver progreso de una UV | `bun run pipeline:status UV-004` |
| Ejecutar solo en CI | `bun run pipeline:check --all --quick --format github` |

---

## Lectura relacionada

- [Herramientas de Automatización KDD](tooling.md): catálogo completo de skills, comandos y agentes.
- [Documentación como Código](../concepts/docs-as-code.md): el contexto de por qué el pipeline existe.
- [Guía para Tech Leads](../guides/tech-lead.md): cómo gobernar specs con el pipeline.
