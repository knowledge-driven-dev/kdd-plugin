# Capa 04: Verification

## El Cierre del Ciclo: ¿Cómo Sabemos que Funciona?

---

## Introducción

La capa de Verification es el **cierre del ciclo de especificación** en KDD. Responde a la pregunta más pragmática: **¿Cómo verificamos que el sistema hace lo que debe hacer?**

Esta capa no es un anexo o un "nice to have". Es la culminación de todo el trabajo anterior, donde las especificaciones abstractas se transforman en **criterios verificables** que pueden ser automatizados, auditados y mantenidos.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   00-Requirements → 01-Domain → 02-Behavior    → 03-Experience              │
│         │               │              │                 │                  │
│         │               │              │                 │                  │
│         └───────────────┴──────────────┴─────────────────┘                  │
│                                   │                                          │
│                                   ▼                                          │
│                           04-Verification                                    │
│                                                                              │
│                        "¿LO CONSTRUIMOS BIEN?"                              │
│                        "¿CONSTRUIMOS LO CORRECTO?"                          │
│                                                                              │
│                           ────────────────────                               │
│                                                                              │
│                        Requisitos formales (EARS)                           │
│                        Criterios de aceptación (Gherkin)                    │
│                        Trazabilidad completa                                 │
│                        Esquemas de implementación                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## La Filosofía: Especificaciones Ejecutables

### Por Qué Esta Capa Cierra el Ciclo

En metodologías tradicionales, la verificación es un ejercicio retrospectivo: primero se construye, luego se testea. KDD invierte esto:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ENFOQUE TRADICIONAL              ENFOQUE KDD                              │
│   ───────────────────              ───────────                              │
│                                                                              │
│   1. Escribir código               1. Especificar comportamiento            │
│   2. Probar manualmente            2. Derivar requisitos formales           │
│   3. Escribir tests (a veces)      3. Definir criterios de aceptación       │
│   4. Documentar (casi nunca)       4. Implementar código                    │
│         ↓                          5. Los tests YA EXISTEN                  │
│   Tests desactualizados                  ↓                                  │
│   Documentación obsoleta           Especificación = Documentación = Tests   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### El Principio de Trazabilidad Completa

En KDD, cada línea de código debe poder rastrearse hasta una especificación:

```
Código → Test → Requisito EARS → Caso de Uso → Regla de Negocio → Objetivos
```

Si no puedes establecer esta cadena, estás escribiendo código sin justificación.

---

## Los Artefactos de la Capa de Verification

### 1. Requisitos EARS (Easy Approach to Requirements Syntax)

EARS es una sintaxis estructurada para escribir requisitos no ambiguos. Cada requisito sigue uno de estos patrones:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   PATRONES EARS                                                              │
│   ─────────────                                                              │
│                                                                              │
│   UBIQUITOUS (siempre):                                                      │
│   "The system SHALL [comportamiento]"                                        │
│   → Comportamiento que siempre se cumple                                     │
│                                                                              │
│   EVENT-DRIVEN (cuando):                                                     │
│   "WHEN [trigger], the system SHALL [respuesta]"                            │
│   → Respuesta a un evento específico                                         │
│                                                                              │
│   STATE-DRIVEN (mientras):                                                   │
│   "WHILE [estado], the system SHALL [comportamiento]"                       │
│   → Comportamiento durante un estado                                         │
│                                                                              │
│   UNWANTED/IF (si no deseado):                                              │
│   "IF [condición], the system SHALL [prevención]"                           │
│   → Manejo de situaciones no deseadas                                        │
│                                                                              │
│   OPTIONAL/WHERE (donde aplique):                                            │
│   "WHERE [condición], the system SHALL [comportamiento]"                    │
│   → Comportamiento condicional/opcional                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Ejemplo: Requisito Event-Driven

```markdown
## REQ-001.1: Creación de Reto (Event-Driven)

**Patrón**: Event-Driven

WHEN the user submits the challenge creation form with a valid title,
the system SHALL create a new Challenge entity
  AND SHALL assign the authenticated user as owner (creador_id)
  AND SHALL set the status to "borrador"
  AND SHALL redirect the user to the synthetic personas configuration screen.

**Trazabilidad**: UC-001-CrearReto, pasos 7-11
```

#### Ejemplo: Requisito Unwanted

```markdown
## REQ-003.3: Sesión Única Activa (Unwanted/If)

**Patrón**: Unwanted Behavior (If)

IF the Reto already has a Session in state "en_progreso",
the system SHALL reject new session creation
  AND SHALL display message "Este reto ya tiene una sesión en progreso"
  AND SHALL offer options to continue or cancel the existing session.

**Trazabilidad**: UC-003-IniciarSesion, extensión; BR-SESION-002
```

---

### 2. Criterios de Aceptación (Gherkin)

Cada requisito EARS se descompone en criterios de aceptación ejecutables usando sintaxis Gherkin:

```gherkin
Given a logged-in user on the challenge creation form
When the user enters title "¿Deberíamos expandir al mercado europeo?"
  And clicks "Crear Reto"
Then a new Challenge should be created with status "borrador"
  And the user should be redirected to /retos/{id}/personas
  And a success message "Reto creado correctamente" should be displayed
```

#### La Anatomía de un Buen Criterio

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ESTRUCTURA GHERKIN                                                         │
│   ──────────────────                                                         │
│                                                                              │
│   Given [contexto/precondiciones]                                            │
│     → Estado inicial del sistema                                             │
│     → Usuario autenticado, datos existentes, etc.                           │
│                                                                              │
│   When [acción/trigger]                                                      │
│     → La acción que dispara el comportamiento                               │
│     → Un clic, un submit, un evento del sistema                             │
│                                                                              │
│   Then [resultado esperado]                                                  │
│     → Lo que debe ocurrir                                                    │
│     → Observable, verificable, específico                                    │
│                                                                              │
│   And [condiciones adicionales]                                              │
│     → Múltiples condiciones en cualquier sección                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Ejemplo Completo con Múltiples Escenarios

```gherkin
# REQ-003.3: Sesión Única Activa

Given reto "Test" has a session in state "en_progreso"
When the user attempts to create a new session
Then error "Este reto ya tiene una sesión en progreso" should be displayed
  And options "Continuar sesión" and "Cancelar sesión" should be offered
  And no new session should be created

Given reto "Test" has a session in state "completada"
When the user attempts to create a new session
Then the session creation should proceed normally

Given reto "Test" has a session in state "cancelada"
When the user attempts to create a new session
Then the session creation should proceed normally
```

---

### 3. Matriz de Trazabilidad

La matriz de trazabilidad conecta **todas** las capas:

```
UC → REQ → BR (y viceversa)
```

```markdown
## Matriz Completa: UC → REQ → BR

UC-001-CrearReto
├── REQ-001.1 Creación de Reto
├── REQ-001.2 Validación longitud título ──────── BR-RETO-001
├── REQ-001.3 Título obligatorio ──────────────── BR-RETO-001
├── REQ-001.4 Límite retos activos ────────────── BR-RETO-002
├── REQ-001.5 Emisión de evento
├── REQ-001.6 Asistencia IA
└── REQ-001.7 Estado inicial borrador ─────────── BR-RETO-003
```

#### Usos de la Matriz de Trazabilidad

| Uso | Descripción |
|-----|-------------|
| **Desarrollo** | Al implementar un UC, verificar que todos los REQ estén cubiertos |
| **Testing** | Generar test cases a partir de REQ, validando BR |
| **Cambios** | Al modificar una BR, identificar todos los REQ/UC afectados |
| **Code Review** | Verificar que el código implementa las BR referenciadas |
| **Auditoría** | Demostrar cumplimiento de requisitos regulatorios |

---

### 4. Esquemas de Implementación

La capa de verificación incluye **hints de implementación** que traducen los requisitos a código:

```typescript
// packages/shared/validators/reto.ts
import { z } from 'zod'

export const createRetoSchema = z.object({
  titulo: z
    .string()
    .min(1, 'Ingresa un título para tu reto')          // REQ-001.3
    .max(100, 'El título no puede exceder 100 caracteres') // REQ-001.2
    .transform(s => s.trim()),
  descripcion: z
    .string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .optional(),
  contexto: z
    .string()
    .max(5000, 'El contexto no puede exceder 5000 caracteres')
    .optional(),
})

export type CreateRetoInput = z.infer<typeof createRetoSchema>
```

Nota que los comentarios referencian los requisitos EARS específicos.

---

## Estructura de un Documento de Requisitos

### Front-matter

```yaml
---
id: REQ-001
kind: requirements
status: draft
source: UC-001-CrearReto   # Caso de uso del que deriva
domain: six-hats
---
```

### Estructura Interna

```markdown
# Requisitos EARS: [Nombre del Caso de Uso]

Requisitos derivados del caso de uso [[UC-NNN-Nombre]].

## Resumen de Requisitos

| ID | Patrón EARS | Resumen |
|----|-------------|---------|
| REQ-NNN.1 | Event-Driven | ... |
| REQ-NNN.2 | Unwanted (If) | ... |

---

## REQ-NNN.1: [Nombre del Requisito] (Patrón)

**Patrón**: [Event-Driven | State-Driven | Unwanted | Optional | Ubiquitous]

[Especificación EARS en inglés]

**Trazabilidad**: UC-NNN-Nombre, [paso/extensión]; [BR-XXX]

**Criterio de Aceptación**:
[Gherkin]

---

## Matriz de Trazabilidad

| Requisito | Paso UC | Regla de Negocio | Test Case |
|-----------|---------|------------------|-----------|

## Esquema Zod (Implementación)

[Código TypeScript]
```

---

## El Flujo Completo de Verificación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   1. CASO DE USO (02-Behavior)                                              │
│      │                                                                       │
│      │ "El Usuario crea un Reto con título y descripción"                   │
│      │                                                                       │
│      ▼                                                                       │
│   2. DERIVAR REQUISITOS EARS (04-Verification)                              │
│      │                                                                       │
│      │ "WHEN user submits form, system SHALL create Reto"                   │
│      │ "IF title > 100 chars, system SHALL reject"                          │
│      │                                                                       │
│      ▼                                                                       │
│   3. VINCULAR REGLAS DE NEGOCIO (01-Domain)                                 │
│      │                                                                       │
│      │ REQ-001.2 ← BR-RETO-001 (título 1-100 chars)                         │
│      │ REQ-001.4 ← BR-RETO-002 (máx 50 retos activos)                       │
│      │                                                                       │
│      ▼                                                                       │
│   4. ESCRIBIR CRITERIOS GHERKIN                                             │
│      │                                                                       │
│      │ Given user with 50 active challenges                                  │
│      │ When user attempts to create new challenge                            │
│      │ Then error "Has alcanzado el límite" should display                  │
│      │                                                                       │
│      ▼                                                                       │
│   5. IMPLEMENTAR Y TESTEAR                                                   │
│      │                                                                       │
│      │ - Código implementa REQ-001.4                                         │
│      │ - Test automatizado verifica criterio Gherkin                        │
│      │ - Test referencia REQ y BR en comentarios                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Relación con Otras Capas

La capa de Verification **consume** todas las capas anteriores y **no es consumida** por ninguna:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   00-Requirements ──────────────────────────────────────────────┐           │
│       │                                                         │           │
│       │  "¿Por qué este requisito?"                            │           │
│       │  → Ver OBJ: "Métricas de éxito"                        │           │
│       │                                                         ▼           │
│   01-Domain ────────────────────────────────────────┐    04-Verification    │
│       │                                             │           │           │
│       │  "¿Qué regla valida esto?"                 │           │           │
│       │  → BR-RETO-002: "Máximo 50 retos activos" │           │           │
│       │                                             ▼           │           │
│   02-Behavior ──────────────────────────┐     Trazabilidad     │           │
│       │                                 │           │           │           │
│       │  "¿Qué comando implementa?"    │           │           │           │
│       │  → CMD-001-CreateChallenge     │           │           │           │
│       │  "¿Qué caso de uso lo define?" │           │           │           │
│       │  → UC-001-CrearReto            │           │           │           │
│       │                                 ▼           │           │           │
│   03-Experience ─────────────────► UI-Views ───────┘           │           │
│                                       │                         │           │
│                                       │                         │           │
│                                       └───────► REQ-001.1 ──────┘           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Dependencias de Referencias

| Desde | Hacia | Propósito |
|-------|-------|-----------|
| REQ → UC | Origen del requisito (02-Behavior) |
| REQ → BR | Regla que valida (01-Domain) |
| REQ → CMD | Operación que implementa (02-Behavior) |
| REQ → OBJ | Justificación de negocio (00-Requirements) |

---

## Estructura de Carpetas

```
/specs/04-verification/
├── criteria/
│   ├── REQ-001-Crear-Reto.md
│   ├── REQ-002-Configurar-Personas.md
│   ├── REQ-003-Iniciar-Sesion.md
│   └── ...
├── contracts/                    # Contratos API (opcional)
│   └── api-contract.yaml
└── _TRACEABILITY.md             # Matriz de trazabilidad global
```

---

## Métricas de Cobertura

### ¿Qué Medir?

```markdown
## Verificación de Cobertura

### Reglas Cubiertas por Requisitos: 42/44 (95%)

### Requisitos Sin Regla Asociada (UX/Funcionalidad pura)
- REQ-001.5 (emisión evento)
- REQ-004.7 (progreso tiempo real)
- REQ-005.1, REQ-005.2 (visualización/navegación)
...

Estos requisitos son funcionalidades de UX que no violan reglas de negocio.
```

### Cobertura Ideal

| Métrica | Objetivo |
|---------|----------|
| BR cubiertas por REQ | 100% |
| REQ con criterios Gherkin | 100% |
| UC con REQ derivados | 100% |
| Tests automatizados por REQ | ≥ 80% |

---

## Anti-patrones a Evitar

### 1. Requisitos Vagos

```markdown
# ❌ INCORRECTO
The system should validate the input.

# ✅ CORRECTO
IF the title exceeds 100 characters,
the system SHALL reject the form submission
  AND SHALL display the error message "El título no puede exceder 100 caracteres"
  AND SHALL NOT create any Challenge entity.
```

### 2. Criterios No Verificables

```gherkin
# ❌ INCORRECTO
Then the system should work correctly

# ✅ CORRECTO
Then a new Challenge should be created with status "borrador"
  And the user should be redirected to /retos/{id}/personas
  And a success message "Reto creado correctamente" should be displayed
```

### 3. Trazabilidad Rota

```markdown
# ❌ INCORRECTO
REQ-001.4: Límite de retos
(sin referencia a UC ni BR)

# ✅ CORRECTO
REQ-001.4: Límite de Retos No Terminados (State-Driven)
**Trazabilidad**: UC-001-CrearReto, escenario TC-001.6; BR-RETO-002
```

### 4. Requisitos Sin Criterios

```markdown
# ❌ INCORRECTO
## REQ-001.1: Creación de Reto
[Solo especificación EARS, sin Gherkin]

# ✅ CORRECTO
## REQ-001.1: Creación de Reto
[Especificación EARS]
**Criterio de Aceptación**:
[Gherkin ejecutable]
```

---

## Cuándo Actualizar Esta Capa

La capa de Verification se actualiza cuando:

1. **Nuevos Casos de Uso**: Derivar REQ para cada UC nuevo (de 02-Behavior)
2. **Cambios en Reglas**: Actualizar REQ que referencian la BR modificada (de 01-Domain)
3. **Bugs encontrados**: Agregar criterios Gherkin que capturen el bug
4. **Refactoring**: Verificar que los criterios existentes siguen pasando
5. **Auditorías**: Completar trazabilidad faltante

> **Regla de oro**: Si escribes código que no tiene un REQ asociado, o el código está de más, o falta la especificación.

---

## Beneficios de la Capa de Verification

### Para Desarrollo

- **Claridad**: Saber exactamente qué implementar
- **Tests pre-escritos**: Los criterios Gherkin son la base de tests automatizados
- **Confianza**: Refactoring seguro si los tests pasan

### Para QA

- **Cobertura sistemática**: No se escapan edge cases
- **Criterios claros**: Sin ambigüedad sobre qué probar
- **Regresión automatizable**: Criterios se convierten en tests

### Para Producto

- **Trazabilidad a negocio**: Cada feature vinculada a los Objetivos
- **Impacto de cambios**: Saber qué se afecta al modificar una regla
- **Documentación viva**: Siempre actualizada con el código

### Para Auditoría

- **Compliance**: Demostrar que se cumplen requisitos regulatorios
- **Historial**: Saber por qué se tomó cada decisión
- **Cobertura medible**: Métricas objetivas de calidad

---

## Resumen

La capa de Verification en KDD:

1. **Cierra el ciclo**: Conecta especificaciones con implementación verificable
2. **Usa EARS**: Sintaxis estructurada para requisitos no ambiguos
3. **Incluye Gherkin**: Criterios de aceptación ejecutables
4. **Mantiene trazabilidad**: UC → REQ → BR completa
5. **Habilita automatización**: Los criterios se convierten en tests
6. **Documenta hints**: Esquemas de implementación para desarrolladores

> **"Un sistema sin verificación especificada es un sistema que solo funciona por accidente. KDD garantiza que funcione por diseño."**

---

## Artefactos Relacionados

- [[requirements.template]] - Template para documentos REQ
- [[03-experience]] - Vistas que consumen los casos de uso
- [[02-behavior]] - Casos de uso que generan requisitos
- [[01-domain]] - Reglas de negocio que validan requisitos
- [[00-requirements]] - Objetivos de negocio
- [[Introducción a KDD]] - Visión general de KDD

---

*Última actualización: 2025-01*
