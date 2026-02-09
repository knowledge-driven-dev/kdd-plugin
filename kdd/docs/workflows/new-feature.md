---
title: "Flujo de trabajo: Nueva feature"
audience: [pm, designer, dev, qa, tech-lead]
type: how-to
reading_time: "5 min"
status: draft
---

# Flujo de trabajo: Nueva feature

> **Para**: Todos — **Tiempo**: 5 min — **Tipo**: How-to

Este documento describe cómo llevar una feature desde la idea inicial hasta producción usando KDD. El flujo consta de cinco fases: IDEA, DISEÑO, BUILD, VERIFY y SHIP. Cada fase produce artefactos específicos y responde una pregunta clave.

---

## El flujo completo

```
IDEA → DISEÑO → BUILD → VERIFY → SHIP

OBJ → UC/UI/BR → CMD/QRY → Tests → Deploy
```

Cada fase la lidera un rol específico. Las fases se ejecutan en orden, pero puedes saltar DISEÑO para features pequeñas.

---

## Fase 1: IDEA

**Quién**: Product Manager

**Qué crea**: Un **Objective (OBJ)** que captura qué quiere lograr el usuario y por qué.

**Pregunta que responde**: "¿Qué quiere lograr el usuario?"

**Cuándo termina**: El PM aprueba el OBJ y lo marca como `status: approved`.

**Ejemplo real (TaskFlow)**:

```markdown
# OBJ-020: Filtrar proyectos por estado

## Objetivo
Como Usuario, quiero filtrar mis proyectos por estado,
para encontrar rápidamente los que necesitan acción.

## Criterios de éxito
- Puedo ver solo proyectos en "borrador"
- Puedo ver solo proyectos "completados"
- El filtro persiste al navegar
```

> **Tip**: Para features muy pequeñas, puedes documentar el objetivo en el commit y saltar la creación de OBJ formal.

---

## Fase 2: DISEÑO

**Quién**: Product Manager + Diseñador

**Qué crea**:
- **Use Case (UC)** con el flujo usuario-sistema detallado
- **UI Spec (UI)** con layout, estados e interacciones
- **Business Rule (BR)** o **Business Policy (BP)** si hay nuevas reglas de negocio

**Pregunta que responde**: "¿Cómo funciona y cómo se ve?"

**Cuándo termina**: PM y Diseñador aprueban UC y UI.

**Ejemplo UC (TaskFlow)**:

```markdown
# UC-020: Filtrar Proyectos

## Flujo Principal
1. Usuario accede al dashboard
2. Sistema muestra proyectos con filtro "Todos" seleccionado
3. Usuario hace clic en Filtro de Estado
4. Sistema muestra opciones: Todos, Borrador, En progreso, Completado
5. Usuario selecciona una opción
6. Sistema filtra la lista
7. Sistema persiste selección en localStorage
```

**Ejemplo UI (TaskFlow)**:

```markdown
# UI-Dashboard (actualización)

## Interacciones

### Clic en Filtro de Estado
- **Trigger**: Clic en dropdown
- **Query**: [[QRY-002-ListProyectos]] con parámetro `estado`
- **Feedback**: Lista se actualiza, contador cambia
```

**Cuándo saltar esta fase**:
- Feature no afecta UI (solo backend)
- Cambio menor sin flujo nuevo (ej: renombrar campo visible)
- Bug fix que no cambia comportamiento existente

Si saltas DISEÑO, documenta el cambio directamente en el Use Case afectado.

---

## Fase 3: BUILD

**Quién**: Desarrollador

**Qué crea o actualiza**:
- **Command (CMD)** si la feature tiene acciones que modifican estado
- **Query (QRY)** si la feature requiere consultas nuevas o actualizadas
- **Event (EVT)** si el sistema necesita comunicar un evento
- Código que implementa las specs

**Pregunta que responde**: "¿Qué operaciones necesita el sistema?"

**Cuándo termina**: El código implementa las specs y todas las specs técnicas están actualizadas.

**Ejemplo (TaskFlow)**:

```markdown
# QRY-002-ListProyectos (actualización)

## Input
| Parámetro | Tipo | Requerido | Default |
|-----------|------|-----------|---------|
| userId | UUID | Sí | - |
| estado | enum | No | todos |  ← NUEVO
| limit | number | No | 20 |

## Output
Lista de Proyectos filtrada por estado.
```

> **Importante**: Actualiza las specs técnicas (CMD, QRY, EVT) durante la implementación, no después. El código y las specs evolucionan juntos.

---

## Fase 4: VERIFY

**Quién**: QA

**Qué crea**:
- **Requirements (REQ)** formales si no existían previamente
- Test cases derivados de las specs (UC, CMD, QRY, BR)

**Pregunta que responde**: "¿Cómo verificamos que funciona según lo especificado?"

**Cuándo termina**: Todos los test cases pasan.

**Los criterios vienen del Use Case**. QA mapea cada paso del UC a un test case:

```
UC dice:
"Usuario selecciona una opción → Sistema filtra la lista"

Test:
Given Usuario en dashboard con 5 proyectos (2 borrador, 3 completados)
When selecciona filtro "Borrador"
Then ve solo 2 proyectos
```

**Derivación de tests**:
- **Flujo principal del UC** → Happy path tests
- **Excepciones del UC** → Edge case tests
- **Business Rules** → Validation tests
- **CMD preconditions** → Input validation tests
- **CMD postconditions** → State verification tests

> **Tip**: Consulta [Cómo derivar tests de specs](../tutorials/spec-to-test.md) para un ejemplo paso a paso.

---

## Fase 5: SHIP

**Quién**: Product Manager + Tech Lead

**Qué actualiza**:
- **Release (REL)** para incluir la feature en la próxima versión
- Status de todos los artefactos a `approved`

**Pregunta que responde**: "¿Está listo para producción?"

**Checklist antes de ship**:
- [ ] OBJ tiene `status: approved`
- [ ] UC tiene `status: approved`
- [ ] UI tiene `status: approved` (si aplica)
- [ ] Specs técnicas (CMD/QRY) actualizadas
- [ ] Tests de QA pasando
- [ ] Incluir la feature en REL

**Ejemplo**:

```markdown
# REL-005: v1.3 (actualización)

## Incluye
- [[OBJ-020-Filtrar-Proyectos]]
- [[UC-020-Filtrar-Proyectos]]
```

---

## Qué hace cada rol en cada fase

### Product Manager

| Fase | Acción |
|------|--------|
| IDEA | Crea OBJ con objetivos y criterios de éxito |
| DISEÑO | Crea o revisa UC, aprueba UI specs |
| BUILD | Resuelve dudas de negocio, acepta PRs de specs técnicas |
| VERIFY | Revisa que los criterios de aceptación se cumplan |
| SHIP | Aprueba para release, actualiza REL |

### Diseñador

| Fase | Acción |
|------|--------|
| IDEA | Lee OBJ para entender el contexto |
| DISEÑO | Crea UI specs, diseña en Figma, define estados visuales |
| BUILD | Resuelve dudas de implementación visual |
| VERIFY | Valida que la implementación refleje el diseño |
| SHIP | (Opcional) Revisa el resultado final |

### Desarrollador

| Fase | Acción |
|------|--------|
| IDEA | Lee OBJ para entender el valor de negocio |
| DISEÑO | Revisa UC y UI para evaluar factibilidad técnica |
| BUILD | Implementa código, crea/actualiza CMD/QRY/EVT |
| VERIFY | Escribe tests unitarios, corrige bugs |
| SHIP | Merge a main, deploy |

### QA

| Fase | Acción |
|------|--------|
| IDEA | (Opcional) Revisa que los criterios de éxito sean medibles |
| DISEÑO | Revisa excepciones en UC, identifica edge cases |
| BUILD | Prepara test cases basados en specs |
| VERIFY | Ejecuta tests de aceptación, reporta bugs |
| SHIP | Da sign-off final |

### Tech Lead

| Fase | Acción |
|------|--------|
| IDEA | Evalúa riesgo técnico, prioriza |
| DISEÑO | Revisa arquitectura, identifica dependencias técnicas |
| BUILD | Revisa PRs de código y specs, resuelve bloqueos |
| VERIFY | Verifica cobertura de tests, trazabilidad spec→código |
| SHIP | Aprueba deploy, actualiza documentación de release |

---

## Flujos alternativos

### Feature pequeña (sin diseño formal)

Para cambios menores que no requieren un flujo completo de diseño:

```
OBJ → UC actualizado → CMD/QRY → Tests → Ship
```

**Ejemplo**: Añadir un campo de texto adicional a un formulario existente.

**Qué saltas**: UI spec formal. Documenta el cambio directamente en el UC existente.

### Bug fix

Para bugs que requieren actualización de specs:

```
Reporta bug → Actualiza UC/BR si aplica → Fix código → Tests → Ship
```

**Ejemplo**: El sistema permite crear Proyectos sin título, violando BR-PROYECTO-001.

**Proceso**:
1. Identifica la spec incorrecta o faltante (en este caso, BR-PROYECTO-001)
2. Actualiza la spec si es incorrecta
3. Crea la spec si no existía
4. Implementa el fix
5. Añade test que verifica la regla

### Cambio de regla de negocio

Para cambios que afectan reglas existentes:

```
Actualiza BP o BR → Actualiza UCs afectados → Actualiza UI si aplica → Tests → Ship
```

**Ejemplo**: Cambiar el límite de Miembros de 6 a 10.

**Proceso**:
1. Actualiza [[BR-PROYECTO-002]]
2. Encuentra todos los UCs que referencian el límite
3. Actualiza UI-MiembroForm si muestra el límite
4. Actualiza tests de validación
5. Implementa el cambio en código

---

## El grafo de dependencias

Los artefactos se conectan con relaciones claras. Las dependencias fluyen siempre hacia abajo:

```
        OBJ  ← "¿Qué quiere el usuario?"
         ↓
        UC   ← "¿Cómo lo logra?"
       / | \
      /  |  \
    UI CMD  BR ← "¿Qué necesita el sistema?"
      \ | /
       \|/
       REQ  ← "¿Cómo lo verificamos?"
```

**Regla clave**: Las flechas solo van hacia abajo. Un Command no sabe qué UI lo usa. Una Business Rule no sabe qué Use Case la verifica.

Esta separación permite cambios independientes:

- Cambiar la UI sin tocar el Command
- Cambiar el Command sin tocar la Business Rule
- Reusar Commands en múltiples Use Cases

---

## Ejemplo completo: "Añadir modo oscuro"

### Fase 1: IDEA

```markdown
# OBJ-025: Modo Oscuro

## Objetivo
Como Usuario, quiero activar un modo oscuro,
para reducir fatiga visual en ambientes con poca luz.

## Criterios de éxito
- Puedo alternar entre modo claro y oscuro
- Mi preferencia se guarda y persiste entre tareas
- Se respeta la preferencia del sistema operativo
```

### Fase 2: DISEÑO

```markdown
# UC-025: Cambiar Tema Visual

## Flujo Principal
1. Usuario accede a configuración
2. Sistema muestra opción de tema: Auto / Claro / Oscuro
3. Usuario selecciona opción
4. Sistema aplica tema inmediatamente
5. Sistema guarda preferencia en localStorage
6. Sistema sincroniza con el perfil del Usuario
```

```markdown
# UI-Configuracion (actualización)

## Sección: Apariencia

### Toggle de Tema
- Opciones: Auto | Claro | Oscuro
- Default: Auto (sigue preferencia del sistema operativo)
- Persiste en: localStorage + perfil de Usuario

### Estados
- **Claro**: Fondo blanco, texto negro
- **Oscuro**: Fondo #1a1a1a, texto #e0e0e0
- **Auto**: Lee preferencia de `window.matchMedia('prefers-color-scheme')`
```

### Fase 3: BUILD

```markdown
# CMD-030-UpdateUserPreferences

## Input
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| userId | UUID | Usuario que actualiza |
| theme | enum | 'auto' | 'light' | 'dark' |

## Postcondiciones
- Preferencia guardada en perfil del Usuario
- EVT-User-PreferencesUpdated emitido
```

El desarrollador implementa:
- Toggle en UI de configuración
- Persistencia en localStorage
- Sincronización con backend mediante CMD-030
- CSS variables que cambian según el tema

### Fase 4: VERIFY

QA deriva los siguientes test cases del UC-025:

```gherkin
Test 1: Cambiar a tema oscuro
Given Usuario autenticado en configuración
When selecciona tema "Oscuro"
Then UI cambia a modo oscuro inmediatamente
And preferencia se guarda en localStorage
And preferencia se sincroniza con backend

Test 2: Persistencia entre tareas
Given Usuario configuró tema "Oscuro"
When cierra sesión y vuelve a iniciar
Then UI se muestra en tema oscuro

Test 3: Modo Auto con sistema en oscuro
Given Usuario selecciona tema "Auto"
And sistema operativo está en modo oscuro
Then UI se muestra en tema oscuro
```

### Fase 5: SHIP

```markdown
# REL-005: v1.3 (actualización)

## Incluye
- [[OBJ-025-ModoOscuro]]
- [[UC-025-Cambiar-Tema-Visual]]
- [[CMD-030-UpdateUserPreferences]]
```

---

## Referencias

- **Para crear tu primer OBJ**: Consulta [[tutorials/first-objective|Tutorial: Crea tu primer Objective]]
- **Para derivar tests de specs**: Consulta [[tutorials/spec-to-test|Tutorial: De spec a test]]
- **Guías por rol**:
  - [[guides/pm|Guía para PMs]]
  - [[guides/designer|Guía para Diseñadores]]
  - [[guides/dev|Guía para Desarrolladores]]
  - [[guides/qa|Guía para QA]]
  - [[guides/tech-lead|Guía para Tech Leads]]

---

> **¿Dudas sobre el flujo?** Consulta [[faq|FAQ]] o pregunta en el canal del equipo.
