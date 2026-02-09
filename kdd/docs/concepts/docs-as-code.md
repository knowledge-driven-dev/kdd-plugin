---
title: "Documentación como Código"
audience: [pm, designer, dev, qa, tech-lead]
type: explanation
reading_time: "8 min"
status: draft
---

# Documentación como Código

> **Para**: Todos los roles -- **Tiempo**: 8 min -- **Tipo**: Explanation

Este documento explica por qué KDD trata las especificaciones como código fuente y qué ventajas obtiene el equipo con este enfoque. Si vienes de herramientas como Confluence, Google Docs o Notion, aquí descubrirás por qué los archivos Markdown en un repositorio Git resuelven problemas que esas plataformas no pueden resolver.

---

## El problema con la documentación tradicional

La mayoría de equipos documentan en plataformas colaborativas como Confluence, Google Docs o Notion. Estas herramientas funcionan bien para prosa libre, pero generan fricciones específicas cuando documentan especificaciones técnicas.

Las plataformas tradicionales presentan tres problemas recurrentes:

- **Sin historial granular.** Confluence muestra "quién editó la página", pero no qué cambió exactamente ni por qué. Revertir un cambio requiere comparar versiones a mano.
- **Sin validación automática.** Nadie verifica que el frontmatter de una spec esté completo, que los enlaces funcionen o que las secciones requeridas existan. Los errores se descubren al leer, si alguien lee.
- **Sin revisión formal.** El contenido se publica al guardar. No existe un flujo donde otro miembro del equipo revise, comente y apruebe antes de que la spec sea oficial.

Estas fricciones provocan que la documentación se desactualice, se contradiga y pierda la confianza del equipo. KDD resuelve estos problemas aplicando las mismas prácticas que ya usamos para el código.

---

## Qué significa "documentación como código"

**Documentación como código** es el principio de aplicar herramientas y flujos de desarrollo de software a la documentación. En KDD, esto se traduce en cinco prácticas concretas.

### Git como sistema de versiones

Cada especificación KDD es un archivo Markdown almacenado en el repositorio Git del proyecto, dentro de la carpeta `specs/`. Git registra cada cambio con autor, fecha y mensaje explicativo.

```bash
# Ver quién modificó una Business Rule y cuándo
git log --oneline specs/01-domain/rules/BR-PROYECTO-005.md
```

```
a3f2c1d fix: corregir condición de transición a terminado
7e8b9a2 feat: añadir BR-PROYECTO-005 transición a terminado
```

Este historial permite responder preguntas que en Confluence son imposibles: "Quién cambió esta regla el mes pasado y por qué lo hizo."

### Pull Requests para revisión

Cuando un miembro del equipo crea o modifica una spec, abre un **Pull Request (PR)**. El PR muestra exactamente qué líneas cambiaron y permite a otros miembros comentar, sugerir correcciones y aprobar.

El flujo de revisión funciona así:

1. El autor crea una rama y modifica la spec.
2. El autor abre un PR con el diff de cambios.
3. Un revisor lee los cambios, comenta si encuentra problemas y aprueba.
4. La spec se fusiona a la rama principal y pasa a ser fuente de verdad.

Este flujo garantiza que ninguna spec llega a estado `approved` sin que al menos una persona la haya revisado. En Confluence, cualquier persona edita y guarda sin revisión.

### CI para validación automática

El proyecto TaskFlow ejecuta un pipeline de validación cada vez que alguien modifica archivos en `specs/`. El workflow de GitHub Actions (`validate-specs.yml`) verifica tres aspectos:

- **Frontmatter válido.** Cada spec tiene los campos YAML requeridos según su tipo (`id`, `kind`, `status`).
- **Secciones completas.** Un Command (CMD) debe tener `## Purpose`, `## Input`, `## Preconditions`, `## Postconditions` y `## Possible Errors`.
- **Enlaces funcionales.** Los wiki-links como `[[Proyecto]]` o `[[BR-PROYECTO-005]]` apuntan a archivos que existen.

```yaml
# .github/workflows/validate-specs.yml (extracto)
on:
  push:
    paths:
      - 'specs/**/*.md'
  pull_request:
    paths:
      - 'specs/**/*.md'

jobs:
  validate:
    steps:
      - run: bun run validate:specs:ci
      - run: bun run verify:coverage
```

Si la validación falla, el PR no se puede fusionar. Esta protección evita que entren specs incompletas o con enlaces rotos al repositorio principal.

### Frontmatter como schema

Cada archivo Markdown comienza con un bloque YAML llamado **frontmatter**. El frontmatter funciona como el schema de la spec: define su tipo, estado, identificador y metadatos.

```yaml
---
id: BR-PROYECTO-005
kind: business-rule
title: Transición a terminado
entity: Proyecto
category: state
severity: medium
status: draft
created: 2024-12-13
tags:
  - proyecto
  - estado
---
```

El validador de CI lee este frontmatter y verifica que los campos obligatorios existan y tengan valores válidos. Por ejemplo, `kind: business-rule` activa las reglas de validación específicas para Business Rules: el archivo debe contener las secciones `## Declaración`, `## Por qué existe`, `## Cuándo aplica` y `## Ejemplos`.

El frontmatter también habilita búsqueda y filtrado. Un Tech Lead puede listar todas las specs en estado `draft` con un comando:

```bash
# Buscar specs en estado draft
grep -rl "status: draft" specs/
```

### Linting de especificaciones

Más allá de la validación de CI, KDD incluye un pipeline de 8 gates que verifica la consistencia entre specs y código. Los scripts viven en `scripts/pipeline/` y cubren verificaciones avanzadas:

- **Gate 1 (Capture).** La Value Unit tiene frontmatter correcto y secciones obligatorias.
- **Gate 2 (Domain).** Las entidades, eventos y reglas referenciadas existen como archivos.
- **Gate 3 (Behavior).** Los CMD/QRY/UC existen y las BRs tienen cobertura en al menos un CMD.
- **Gate 4 (Experience).** Las UI specs documentan los 4 estados requeridos (loading, empty, error, success).
- **Gate 5 (Verification).** Los REQ contienen criterios de aceptación Gherkin.
- **Gate 6 (Physical).** Cada CMD/QRY tiene un archivo `.use-case.ts` correspondiente.
- **Gate 7 (Code).** El proyecto TypeScript compila sin errores.
- **Gate 8 (Evidence).** Los tests existen y pasan.

```bash
# Verificar la consistencia de una Value Unit
bun run pipeline:check UV-004 --quick
```

Esta automatización detecta inconsistencias antes de que se conviertan en bugs o en documentación obsoleta.

Además del pipeline, KDD incluye skills de Claude Code que asisten en la escritura y revisión de specs. Skills como `/kdd-review` verifican calidad semántica, `/kdd-gaps` detecta artefactos faltantes y `/kdd-fix` corrige problemas técnicos automáticamente. Estas herramientas extienden el principio de documentación-como-código: las mismas prácticas de linting que aplicas al código las aplicas a las specs.

> **Ver**: [Pipeline de Validación KDD](../reference/pipeline.md) para la referencia completa de gates y comandos. [Herramientas de Automatización KDD](../reference/tooling.md) para el catálogo completo de skills y agentes.

---

## Comparación con herramientas tradicionales

La siguiente tabla compara las capacidades de documentación-como-código frente a plataformas tradicionales:

| Capacidad | Confluence / Notion | KDD (Markdown + Git) |
|---|---|---|
| Historial de cambios | Quién editó, sin detalle | Diff exacto línea por línea |
| Revisión antes de publicar | No existe | Pull Request obligatorio |
| Validación automática | No existe | CI verifica schema, secciones y enlaces |
| Búsqueda por metadatos | Limitada (tags manuales) | Frontmatter YAML consultable |
| Trabajo offline | Requiere conexión | Funciona con Git local |
| Formato estandarizado | Libre (cada autor decide) | Templates y validadores fuerzan estructura |
| Versionado junto al código | Separados | Mismo repositorio, misma rama, mismo PR |
| Trazabilidad código-spec | Manual, se desactualiza | Automatizada con pipeline |

> **Tip**: La mayor ventaja no es ninguna fila individual de la tabla. La ventaja es que las specs viajan con el código. Cuando un desarrollador cambia una ruta de API, puede actualizar el Command (CMD) correspondiente en el mismo PR.

---

## Cómo afecta a cada rol

Cada miembro del equipo interactúa con documentación-como-código de forma diferente.

### Product Manager

El PM crea Objectives (OBJ) y Use Cases (UC) en archivos Markdown. No necesita dominar Git: puede editar directamente en la interfaz web de GitHub y abrir un PR con un clic. El PM se beneficia de la revisión formal porque recibe feedback del equipo técnico antes de que una spec sea oficial.

### Desarrollador

El Dev ya conoce Git, PRs y CI. Documentación-como-código le resulta natural. El principal beneficio es que las specs viven junto al código: al implementar un Command (CMD), el Dev lee la spec en el mismo editor donde escribe código. Si descubre un error en la spec, lo corrige en el mismo PR.

### QA

QA deriva sus casos de test directamente de las specs. Cuando un Use Case (UC) cambia, el diff del PR muestra exactamente qué pasos del flujo principal cambiaron. QA revisa el PR y actualiza los tests correspondientes en el mismo ciclo.

### Diseñador

El Diseñador consulta los Use Cases para entender flujos y crea UI specs. Puede editar en la interfaz web de GitHub sin instalar herramientas. Los wiki-links en sus UI specs conectan automáticamente con las entidades de dominio que referencia.

### Tech Lead

El Tech Lead revisa PRs de specs con la misma herramienta que usa para revisar código. Puede exigir aprobación obligatoria antes de fusionar y configurar reglas de protección en la rama principal. El pipeline de CI le da confianza de que las specs cumplen los estándares.

---

## Herramientas recomendadas

Para trabajar con specs KDD como código, el equipo puede usar las siguientes herramientas:

- **VS Code** con la extensión Markdown All in One. Proporciona autocompletado de wiki-links, vista previa y navegación entre archivos.
- **Obsidian** como visor alternativo. Renderiza los wiki-links como un grafo visual navegable. Ideal para explorar relaciones entre entidades.
- **GitHub / GitLab** para revisión de PRs. La vista de diff resalta cambios en el frontmatter y en el contenido.
- **CI/CD** (GitHub Actions) para validación automática. El workflow `validate-specs.yml` se ejecuta en cada push a `specs/`.

> **Importante**: No necesitas dominar todas las herramientas. Un PM puede trabajar exclusivamente desde la interfaz web de GitHub. Un Dev puede usar VS Code. Lo relevante es que todos trabajan sobre los mismos archivos con las mismas reglas.

---

## Lectura relacionada

- *Guía de Estilo para Documentación KDD* (`STYLE-GUIDE.md`): reglas de escritura para specs.
- *El Grafo de Conocimiento* (`concepts/knowledge-graph.md`): cómo los wiki-links conectan las specs entre sí.
- *Referencia de Frontmatter* (`reference/frontmatter.md`): schemas YAML por tipo de artefacto.
