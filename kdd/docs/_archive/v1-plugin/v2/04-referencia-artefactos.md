# Referencia de Artefactos KDD

> Una card por cada tipo de documento que puedes crear.

---

## Vista general

```
┌─────────────────────────────────────────────────────────────┐
│  /specs                                                     │
│                                                             │
│  00-requirements/     "¿Por qué existe esto?"               │
│  ├── objectives/        OBJ - Qué quiere el usuario        │
│  ├── releases/          REL - Qué va en cada versión       │
│  └── decisions/         ADR - Por qué decidimos X          │
│                                                             │
│  01-domain/           "¿Qué conceptos existen?"             │
│  ├── entities/          Reto, Sesión, Usuario...           │
│  ├── events/            EVT - Cosas que pasan              │
│  └── rules/             BR/BP - Reglas del negocio         │
│                                                             │
│  02-behavior/         "¿Cómo se comporta?"                  │
│  ├── use-cases/         UC - Flujos usuario-sistema        │
│  ├── commands/          CMD - Acciones que modifican       │
│  ├── queries/           QRY - Consultas de datos           │
│  └── policies/          XP - Reglas transversales          │
│                                                             │
│  03-experience/       "¿Cómo se ve?"                        │
│  └── views/             UI - Pantallas y componentes       │
│                                                             │
│  04-verification/     "¿Cómo sabemos que funciona?"         │
│  └── criteria/          REQ - Criterios de aceptación      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 00 - Requirements

### OBJ (Objective)

| | |
|---|---|
| **Qué es** | Lo que un usuario quiere lograr |
| **Quién lo crea** | PM |
| **Ejemplo** | "Como Usuario, quiero exportar a PDF..." |
| **Ubicación** | `/specs/00-requirements/objectives/` |
| **Nombrado** | `OBJ-001-NombreCorto.md` |

```yaml
---
id: OBJ-001
kind: objective
title: Exportar análisis a PDF
actor: Usuario
status: draft
---
```

**Secciones clave**: Actor, Objetivo ("Como X, quiero Y, para Z"), Criterios de éxito

---

### REL (Release)

| | |
|---|---|
| **Qué es** | Plan de qué va en cada versión |
| **Quién lo crea** | PM |
| **Ejemplo** | "v1.2 incluye exportaciones" |
| **Ubicación** | `/specs/00-requirements/releases/` |
| **Nombrado** | `REL-001-v1.2.md` |

```yaml
---
id: REL-001
kind: release
title: v1.2 - Exportaciones
target_date: 2025-02-15
status: draft
---
```

**Secciones clave**: Objetivo, Lo que incluye (OBJs), Lo que NO incluye, Criterios de salida

---

### ADR (Architecture Decision Record)

| | |
|---|---|
| **Qué es** | Documentación de una decisión importante |
| **Quién lo crea** | PM, Tech Lead |
| **Ejemplo** | "Por qué usamos créditos en vez de suscripción" |
| **Ubicación** | `/specs/00-requirements/decisions/` |
| **Nombrado** | `ADR-0001-NombreDecision.md` |

```yaml
---
id: ADR-0001
kind: adr
title: Modelo de créditos
status: accepted
date: 2025-01-15
---
```

**Secciones clave**: Contexto, Opciones consideradas, Decisión, Consecuencias

---

## 01 - Domain

### Entity (y variantes)

| | |
|---|---|
| **Qué es** | Un concepto del negocio con identidad |
| **Quién lo crea** | PM, Dev |
| **Ejemplo** | Reto, Sesión, Usuario, Crédito, ORACLE |
| **Ubicación** | `/specs/01-domain/entities/` |
| **Nombrado** | `NombreEntidad.md` (ver variantes) |

```yaml
---
kind: entity   # entity | role | system
aliases:
  - Retos
status: approved
---
```

**Variantes de `kind`:**

| kind | Uso | Nombrado | Ejemplo |
|------|-----|----------|---------|
| `entity` | Concepto de dominio con ciclo de vida | PascalCase | `Reto.md`, `Sesión.md` |
| `role` | Rol/actor que interactúa con el sistema | PascalCase | `Propietario.md`, `Usuario.md` |
| `system` | Sistema externo / integración | **MAYÚSCULAS** | `ORACLE.md`, `SAP.md` |

> **Nota**: Los sistemas externos se nombran en MAYÚSCULAS tanto en archivo como en wiki-links: `[[ORACLE]]`

**Secciones clave**: Descripción, Atributos (tabla), Estados (si aplica), Relaciones

---

### BR / BP (Business Rule / Policy)

| | |
|---|---|
| **Qué es** | Una regla que el sistema debe cumplir |
| **Quién lo crea** | PM, Dev |
| **BR vs BP** | BR = fija, BP = configurable |
| **Ubicación** | `/specs/01-domain/rules/` |
| **Nombrado** | `BR-ENTIDAD-001.md` o `BP-TEMA-001.md` |

```yaml
---
id: BR-RETO-001
kind: business-rule
title: Título obligatorio
entity: Reto
status: approved
---
```

**Secciones clave**: Declaración, Por qué existe, Cuándo aplica, Qué pasa si se incumple, Ejemplos

---

### EVT (Event)

| | |
|---|---|
| **Qué es** | Algo que pasó en el sistema |
| **Quién lo crea** | Dev |
| **Ejemplo** | Reto creado, Sesión completada |
| **Ubicación** | `/specs/01-domain/events/` |
| **Nombrado** | `EVT-Entidad-Accion.md` |

```yaml
---
id: EVT-Reto-Creado
kind: event
title: Reto Creado
status: approved
---
```

**Secciones clave**: Descripción, Productor, Payload (datos), Consumidores

---

## 02 - Behavior

### UC (Use Case)

| | |
|---|---|
| **Qué es** | Flujo completo de interacción usuario-sistema |
| **Quién lo crea** | PM, Diseñador |
| **Ejemplo** | Crear Reto, Comprar Créditos |
| **Ubicación** | `/specs/02-behavior/use-cases/` |
| **Nombrado** | `UC-001-NombreUseCase.md` |

```yaml
---
id: UC-001
kind: use-case
title: Crear Reto
actor: Usuario
status: draft
---
```

**Secciones clave**: Contexto (tabla), Flujo Principal, Flujos Alternativos, Excepciones, Commands/Queries invocados

---

### CMD (Command)

| | |
|---|---|
| **Qué es** | Acción que modifica datos |
| **Quién lo crea** | Dev, PM |
| **Ejemplo** | CreateChallenge, PurchaseCredits |
| **Ubicación** | `/specs/02-behavior/commands/` |
| **Nombrado** | `CMD-001-NombreCommand.md` |

```yaml
---
id: CMD-001
kind: command
title: Create Challenge
status: draft
---
```

**Secciones clave**: Propósito, Input (tabla), Precondiciones, Postcondiciones, Errores posibles

---

### QRY (Query)

| | |
|---|---|
| **Qué es** | Consulta que lee datos (sin modificar) |
| **Quién lo crea** | Dev |
| **Ejemplo** | GetChallenge, ListChallenges |
| **Ubicación** | `/specs/02-behavior/queries/` |
| **Nombrado** | `QRY-001-NombreQuery.md` |

```yaml
---
id: QRY-001
kind: query
title: Get Challenge
status: draft
---
```

**Secciones clave**: Propósito, Input, Output, Casos especiales

---

### XP (Cross-Policy)

| | |
|---|---|
| **Qué es** | Regla que aplica a múltiples operaciones |
| **Quién lo crea** | Dev, PM |
| **Ejemplo** | Autenticación requerida, Rate limiting |
| **Ubicación** | `/specs/02-behavior/policies/` |
| **Nombrado** | `XP-TEMA-001.md` |

```yaml
---
id: XP-AUTH-001
kind: cross-policy
title: Autenticación Requerida
status: approved
---
```

**Secciones clave**: Propósito, Aplica a, Lógica, Errores

---

## 03 - Experience

### UI (View / Component)

| | |
|---|---|
| **Qué es** | Especificación de una pantalla o componente |
| **Quién lo crea** | Diseñador |
| **Ejemplo** | Dashboard, Editor de Reto, Modal de Compartir |
| **Ubicación** | `/specs/03-experience/views/` |
| **Nombrado** | `UI-NombreVista.md` |

```yaml
---
id: UI-Dashboard
kind: ui-view          # o ui-component
title: Dashboard
route: /dashboard      # solo para vistas, no componentes
status: draft
---
```

**Secciones clave**: Contexto, Queries consumidas, Commands invocados, Layout, Estados, Interacciones, Responsive

---

## 04 - Verification

### REQ (Requirement)

| | |
|---|---|
| **Qué es** | Criterios de aceptación verificables |
| **Quién lo crea** | QA, PM |
| **Ejemplo** | Criterios para "Crear Reto" |
| **Ubicación** | `/specs/04-verification/criteria/` |
| **Nombrado** | `REQ-001-NombreRequisito.md` |

```yaml
---
id: REQ-001
kind: requirement
title: Crear Reto
source: UC-001
status: draft
---
```

**Secciones clave**: Descripción, Criterios de aceptación (lista), Trazabilidad

---

## Cheatsheet: ¿Qué creo?

| Situación | Artefacto |
|-----------|-----------|
| "El usuario quiere poder..." | **OBJ** |
| "Este es el flujo de..." | **UC** |
| "Esta regla de negocio dice..." | **BR** o **BP** |
| "El precio/límite es..." | **BP** |
| "Esta acción modifica..." | **CMD** |
| "Esta pantalla muestra..." | **UI** |
| "¿Por qué decidimos X?" | **ADR** |
| "¿Qué va en la v1.2?" | **REL** |
| "Este rol/actor puede hacer..." | **Entity** (`kind: role`) |
| "Nos integramos con..." | **Entity** (`kind: system`, en MAYÚSCULAS) |

---

## Status lifecycle

Todos los artefactos siguen el mismo ciclo:

```
draft → review → approved → deprecated
  │        │         │            │
  │        │         │            └── Ya no aplica (enlaza al reemplazo)
  │        │         └── Es fuente de verdad oficial
  │        └── Pendiente de aprobación
  └── Trabajo en progreso
```

---

*¿Falta algo? Abre un issue o pregunta en el canal.*
