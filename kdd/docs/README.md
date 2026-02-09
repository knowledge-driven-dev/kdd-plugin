---
title: "Documentación KDD"
audience: [all]
type: reference
reading_time: "3 min"
status: published
---

# Documentación KDD

> Índice completo de la documentación de Knowledge-Driven Development (KDD) para el proyecto TaskFlow.

**Knowledge-Driven Development (KDD)** organiza el conocimiento del sistema en especificaciones versionadas, trazables y navegables. Esta documentación te enseña a crear, leer y mantener specs KDD según tu rol en el equipo.

Los documentos están organizados por tipo ([Diataxis](https://diataxis.fr/): tutorial, how-to, reference, explanation) y por audiencia. La referencia compacta para agentes IA se mantiene en `kdd.md`.

---

## Contenido completo

### Inicio: conceptos esenciales

| Documento | Audiencia | Tiempo | Tipo |
|-----------|-----------|--------|------|
| [¿Qué es KDD?](start/what-is-kdd.md) | Todos | 5 min | Explanation |
| [¿Por qué KDD?](start/why-kdd.md) | Tech Leads | 5 min | Explanation |

### Guías por rol: tu día a día con KDD

| Documento | Audiencia | Tiempo | Tipo |
|-----------|-----------|--------|------|
| [Guía para Product Managers](guides/pm.md) | PM | 10 min | How-to |
| [Guía para Diseñadores](guides/designer.md) | Diseñador | 10 min | How-to |
| [Guía para Desarrolladores](guides/dev.md) | Desarrollador | 10 min | How-to |
| [Guía para QA](guides/qa.md) | QA | 10 min | How-to |
| [Guía para Tech Leads](guides/tech-lead.md) | Tech Lead | 10 min | How-to |

### Tutoriales: aprende haciendo

| Documento | Audiencia | Tiempo | Tipo |
|-----------|-----------|--------|------|
| [Crea tu primer Objective](tutorials/first-objective.md) | PM | 5 min | Tutorial |
| [Tu primer Use Case](tutorials/first-use-case.md) | PM, Diseñador | 8 min | Tutorial |
| [Crea tu primera UI spec](tutorials/first-ui-spec.md) | Diseñador | 8 min | Tutorial |
| [Crea tu primer Command](tutorials/first-command.md) | Desarrollador | 5 min | Tutorial |
| [De Spec a Test](tutorials/spec-to-test.md) | QA, Desarrollador | 8 min | Tutorial |

### Referencia: consulta rápida

| Documento | Audiencia | Tiempo | Tipo |
|-----------|-----------|--------|------|
| [Referencia de Artefactos](reference/artifacts.md) | Todos | Consulta | Reference |
| [Frontmatter por Tipo](reference/frontmatter.md) | Todos | Consulta | Reference |
| [Referencia de Capas](reference/layers.md) | Todos | Consulta | Reference |
| [Convenciones de Nombrado](reference/naming.md) | Todos | Consulta | Reference |
| [Índice de Templates](reference/templates.md) | Todos | Consulta | Reference |
| [Ciclo de vida de status](reference/status-lifecycle.md) | Todos | 5 min | Reference |
| [Cheatsheet KDD](reference/cheatsheet.md) | Todos | 1 min | Reference |

### Conceptos: profundización

| Documento | Audiencia | Tiempo | Tipo |
|-----------|-----------|--------|------|
| [Por qué seis capas](concepts/layers-explained.md) | Tech Lead, todos | 10 min | Explanation |
| [Trazabilidad: Del objetivo al test](concepts/traceability.md) | Tech Lead, QA | 10 min | Explanation |
| [Documentación como código](concepts/docs-as-code.md) | Todos | 8 min | Explanation |
| [El grafo de conocimiento](concepts/knowledge-graph.md) | Todos | 8 min | Explanation |

### Workflows: procesos recurrentes

| Documento | Audiencia | Tiempo | Tipo |
|-----------|-----------|--------|------|
| [Nueva feature](workflows/new-feature.md) | Todos | 5 min | How-to |
| [Cambiar un requisito](workflows/change-requirement.md) | PM, Dev, Tech Lead | 5 min | How-to |
| [Documentar un bug fix](workflows/bug-fix.md) | Dev, QA, Tech Lead | 3 min | How-to |
| [Revisar specs en un PR](workflows/review-specs.md) | Tech Lead, PM, Dev | 5 min | How-to |
| [Adoptar KDD en proyecto existente](workflows/adopt-kdd.md) | Tech Lead, PM, Dev | 5 min | How-to |

### Otros

| Documento | Audiencia | Tiempo | Tipo |
|-----------|-----------|--------|------|
| [FAQ](faq.md) | Todos | Consulta | How-to |
| [Guía de Estilo](STYLE-GUIDE.md) | Todos | Consulta | Reference |

---

## Rutas de lectura por rol

Qué leer y en qué orden según tu responsabilidad en el equipo.

### Product Manager

1. [¿Qué es KDD?](start/what-is-kdd.md) — contexto general
2. [Guía para Product Managers](guides/pm.md) — tu trabajo diario
3. [Crea tu primer Objective](tutorials/first-objective.md) — ejercicio práctico
4. [Tu primer Use Case](tutorials/first-use-case.md) — ejercicio práctico
5. [Nueva feature](workflows/new-feature.md) — proceso completo

**Consulta después:**
- [Referencia de Artefactos](reference/artifacts.md) — OBJ, UC, REL, ADR
- [Frontmatter por Tipo](reference/frontmatter.md) — esquemas YAML
- [Convenciones de Nombrado](reference/naming.md) — identificadores

### Diseñador UX/UI

1. [¿Qué es KDD?](start/what-is-kdd.md) — contexto general
2. [Guía para Diseñadores](guides/designer.md) — tu trabajo diario
3. [Tu primer Use Case](tutorials/first-use-case.md) — cómo leer flujos
4. [Crea tu primera UI spec](tutorials/first-ui-spec.md) — ejercicio práctico
5. [Nueva feature](workflows/new-feature.md) — tu fase DISEÑO

**Consulta después:**
- [Referencia de Artefactos](reference/artifacts.md) — UI, UC
- [Guía de Estilo](STYLE-GUIDE.md) — cómo escribir specs

### Desarrollador

1. [¿Qué es KDD?](start/what-is-kdd.md) — contexto general
2. [Guía para Desarrolladores](guides/dev.md) — tu trabajo diario
3. [Crea tu primer Command](tutorials/first-command.md) — ejercicio práctico
4. [De Spec a Test](tutorials/spec-to-test.md) — derivar tests
5. [Nueva feature](workflows/new-feature.md) — tu fase BUILD

**Consulta después:**
- [Referencia de Artefactos](reference/artifacts.md) — CMD, QRY, BR, EVT
- [Frontmatter por Tipo](reference/frontmatter.md) — esquemas YAML
- [Convenciones de Nombrado](reference/naming.md) — identificadores
- [Trazabilidad](concepts/traceability.md) — del objetivo al código

### QA Engineer

1. [¿Qué es KDD?](start/what-is-kdd.md) — contexto general
2. [Guía para QA](guides/qa.md) — tu trabajo diario
3. [De Spec a Test](tutorials/spec-to-test.md) — ejercicio práctico
4. [Nueva feature](workflows/new-feature.md) — tu fase VERIFY
5. [Documentar un bug fix](workflows/bug-fix.md) — cuando encuentras errores

**Consulta después:**
- [Referencia de Artefactos](reference/artifacts.md) — UC, BR, CMD
- [Trazabilidad](concepts/traceability.md) — qué verificar en cada capa

### Tech Lead

1. [¿Qué es KDD?](start/what-is-kdd.md) — contexto general
2. [¿Por qué KDD?](start/why-kdd.md) — argumentos de adopción
3. [Guía para Tech Leads](guides/tech-lead.md) — gobierno de specs
4. [Revisar specs en un PR](workflows/review-specs.md) — checklist de revisión
5. [Nueva feature](workflows/new-feature.md) — orquestar el flujo completo

**Lee después:**
- [Por qué seis capas](concepts/layers-explained.md) — arquitectura de KDD
- [Trazabilidad](concepts/traceability.md) — cómo fluye el conocimiento
- [Documentación como código](concepts/docs-as-code.md) — filosofía
- [Adoptar KDD](workflows/adopt-kdd.md) — estrategia de migración

---

## Por dónde empezar según tu tiempo

### Tengo 3 minutos

Lee el [Cheatsheet](reference/cheatsheet.md). Aprenderás la estructura de carpetas, los artefactos principales y los estados.

### Tengo 15 minutos

1. [¿Qué es KDD?](start/what-is-kdd.md) — 5 min
2. Tu guía de rol — 10 min
   - [PM](guides/pm.md) | [Diseñador](guides/designer.md) | [Dev](guides/dev.md) | [QA](guides/qa.md) | [Tech Lead](guides/tech-lead.md)

### Tengo 1 hora

1. [¿Qué es KDD?](start/what-is-kdd.md) — 5 min
2. Tu guía de rol — 10 min
3. Un tutorial práctico de tu rol — 5-8 min
4. [Nueva feature](workflows/new-feature.md) — 5 min
5. Explora [Referencia de Artefactos](reference/artifacts.md) con calma — 30 min

---

## Navegación

- **¿Primera vez?** → Empieza por [¿Qué es KDD?](start/what-is-kdd.md)
- **¿Conoces KDD pero no tu rol?** → Lee tu [guía de rol](#guías-por-rol-tu-día-a-día-con-kdd)
- **¿Necesitas crear un artefacto?** → Consulta [Referencia de Artefactos](reference/artifacts.md) y [Templates](reference/templates.md)
- **¿Tienes una duda específica?** → Busca en el [FAQ](faq.md) o en [Referencia](#referencia-consulta-rápida)
- **¿Quieres entender el porqué?** → Explora [Conceptos](#conceptos-profundización)

---

**Última actualización**: 2026-02-08
**Versión**: 1.0
