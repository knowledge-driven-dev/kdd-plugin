# Flujo de Trabajo KDD

> Cómo fluye una feature desde la idea hasta producción.

---

## El flujo completo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  IDEA          DISEÑO          BUILD           VERIFY          SHIP        │
│   │               │               │               │               │        │
│   ▼               ▼               ▼               ▼               ▼        │
│                                                                             │
│  ┌─────┐      ┌─────┐      ┌─────┐      ┌─────┐      ┌─────┐              │
│  │ OBJ │  ──► │ UC  │  ──► │ CMD │  ──► │ REQ │  ──► │ REL │              │
│  │     │      │ UI  │      │ QRY │      │     │      │     │              │
│  │     │      │ BR  │      │     │      │     │      │     │              │
│  └─────┘      └─────┘      └─────┘      └─────┘      └─────┘              │
│                                                                             │
│  PM           PM + Design    Dev           QA            PM                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Fase 1: IDEA

**Quién**: PM

**Qué se crea**:
- `OBJ-xxx` con el objetivo del usuario

**Pregunta que responde**: "¿Qué quiere lograr el usuario?"

**Ejemplo**:

```markdown
# OBJ-020: Filtrar retos por estado

## Objetivo
Como Usuario, quiero filtrar mis retos por estado,
para encontrar rápidamente los que necesitan acción.

## Criterios de éxito
- Puedo ver solo retos en "borrador"
- Puedo ver solo retos "completados"
- El filtro persiste al navegar
```

**Entregable**: OBJ aprobado

---

## Fase 2: DISEÑO

**Quién**: PM + Diseñador

**Qué se crea**:
- `UC-xxx` con el flujo detallado
- `UI-xxx` con la especificación visual
- `BR-xxx` / `BP-xxx` si hay nuevas reglas

**Pregunta que responde**: "¿Cómo funciona y cómo se ve?"

**Ejemplo UC**:

```markdown
# UC-020: Filtrar Retos

## Flujo Principal
1. Usuario accede al dashboard
2. Sistema muestra retos con filtro "Todos" seleccionado
3. Usuario hace click en filtro de estado
4. Sistema muestra opciones: Todos, Borrador, En progreso, Completado
5. Usuario selecciona una opción
6. Sistema filtra la lista
7. Sistema persiste selección en localStorage
```

**Ejemplo UI**:

```markdown
# UI-Dashboard (actualización)

## Interacciones

### Click en Filtro de Estado
- **Trigger**: Click en dropdown
- **Query**: QRY-002-ListChallenges con parámetro `estado`
- **Feedback**: Lista se actualiza, contador cambia
```

**Entregable**: UC y UI aprobados

---

## Fase 3: BUILD

**Quién**: Dev

**Qué se crea/actualiza**:
- `CMD-xxx` si hay nuevas acciones
- `QRY-xxx` si hay nuevas consultas
- Código que implementa las specs

**Pregunta que responde**: "¿Qué operaciones necesita el sistema?"

**Ejemplo**:

```markdown
# QRY-002-ListChallenges (actualización)

## Input
| Parámetro | Tipo | Requerido | Default |
|-----------|------|-----------|---------|
| userId | UUID | Sí | - |
| estado | enum | No | todos |  ← NUEVO
| limit | number | No | 20 |
```

**Entregable**: Código implementado + specs actualizados

---

## Fase 4: VERIFY

**Quién**: QA

**Qué se crea**:
- `REQ-xxx` con criterios formales (si no existen)
- Tests basados en las specs

**Pregunta que responde**: "¿Cómo verificamos que funciona?"

**Los criterios vienen del UC**:

```
UC dice: "Usuario selecciona una opción → Sistema filtra la lista"

Test:
Given usuario en dashboard con 5 retos (2 borrador, 3 completados)
When selecciona filtro "Borrador"
Then ve solo 2 retos
```

**Entregable**: Tests pasando

---

## Fase 5: SHIP

**Quién**: PM

**Qué se actualiza**:
- `REL-xxx` para incluir la feature
- Status de artefactos a `approved`

**Pregunta que responde**: "¿Está listo para producción?"

**Checklist antes de ship**:
- [ ] OBJ tiene status `approved`
- [ ] UC tiene status `approved`
- [ ] UI tiene status `approved`
- [ ] Tests de QA pasando
- [ ] Feature incluida en REL

---

## Flujos alternativos

### Feature pequeña (skip design)

```
OBJ → UC → CMD/QRY → Tests → Ship
      │
      └── Sin UI spec formal (solo actualizar UC)
```

### Bug fix

```
Reporta bug → Actualiza UC/BR si aplica → Fix → Tests → Ship
```

### Cambio de regla de negocio

```
Actualiza BP → Actualiza UC afectados → Actualiza UI si aplica → Tests → Ship
```

---

## Por rol: ¿Qué hago en cada fase?

### PM

| Fase | Acción |
|------|--------|
| IDEA | Crear OBJ |
| DISEÑO | Crear/revisar UC, aprobar UI |
| BUILD | Resolver dudas, aceptar PRs de specs |
| VERIFY | Revisar criterios de aceptación |
| SHIP | Aprobar para release, actualizar REL |

### Diseñador

| Fase | Acción |
|------|--------|
| IDEA | (Leer OBJ para contexto) |
| DISEÑO | Crear UI specs, diseñar en Figma |
| BUILD | Resolver dudas de implementación |
| VERIFY | Validar que implementación = diseño |
| SHIP | (Opcional: review final) |

### Dev

| Fase | Acción |
|------|--------|
| IDEA | (Leer OBJ para contexto) |
| DISEÑO | Revisar UC para factibilidad |
| BUILD | Implementar, crear CMD/QRY |
| VERIFY | Escribir tests, fix bugs |
| SHIP | Merge, deploy |

### QA

| Fase | Acción |
|------|--------|
| IDEA | (Opcional: review de criterios) |
| DISEÑO | Revisar excepciones en UC |
| BUILD | Preparar casos de test |
| VERIFY | Ejecutar tests, reportar bugs |
| SHIP | Sign-off |

---

## El grafo de dependencias

Los artefactos se conectan así:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                              ┌──────┐                                       │
│                              │ OBJ  │  ← "¿Qué quiere el usuario?"         │
│                              └──┬───┘                                       │
│                                 │                                           │
│                                 ▼                                           │
│                              ┌──────┐                                       │
│                              │  UC  │  ← "¿Cómo lo logra?"                 │
│                              └──┬───┘                                       │
│                      ┌──────────┼──────────┐                                │
│                      │          │          │                                │
│                      ▼          ▼          ▼                                │
│                  ┌──────┐  ┌──────┐  ┌──────┐                               │
│                  │  UI  │  │ CMD  │  │  BR  │                               │
│                  │      │  │ QRY  │  │  BP  │                               │
│                  └──────┘  └──────┘  └──────┘                               │
│                      │          │          │                                │
│                      └──────────┼──────────┘                                │
│                                 │                                           │
│                                 ▼                                           │
│                              ┌──────┐                                       │
│                              │ REQ  │  ← "¿Cómo lo verificamos?"           │
│                              └──────┘                                       │
│                                                                             │
│  La flecha significa "referencia a" o "deriva de"                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Regla clave**: Las flechas solo van hacia abajo. Un CMD no sabe qué UI lo usa. Una BR no sabe qué UC la valida.

Esto permite cambiar la UI sin tocar el CMD, o cambiar el CMD sin tocar la BR.

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
- Mi preferencia se guarda
- Se respeta la preferencia del sistema
```

### Fase 2: DISEÑO

```markdown
# UC-025: Cambiar Tema Visual

## Flujo Principal
1. Usuario accede a configuración
2. Sistema muestra opción de tema: Auto/Claro/Oscuro
3. Usuario selecciona opción
4. Sistema aplica tema inmediatamente
5. Sistema guarda preferencia
```

```markdown
# UI-Configuracion (actualización)

## Sección: Apariencia

### Toggle de Tema
- Opciones: Auto | Claro | Oscuro
- Default: Auto (sigue preferencia del sistema)
- Persiste en: localStorage + perfil de usuario
```

### Fase 3: BUILD

```markdown
# CMD-030-UpdateUserPreferences

## Input
| Parámetro | Tipo |
|-----------|------|
| theme | 'auto' | 'light' | 'dark' |
```

Dev implementa toggle y persistencia.

### Fase 4: VERIFY

```
Test 1: Seleccionar "Oscuro" → UI cambia a tema oscuro
Test 2: Cerrar sesión, volver a entrar → Tema sigue en oscuro
Test 3: Seleccionar "Auto" con sistema en oscuro → UI en oscuro
```

### Fase 5: SHIP

```markdown
# REL-005: v1.3 (actualización)

## Incluye
- [[OBJ-025-ModoOscuro]]
```

---

*¿Dudas sobre el flujo? Pregunta en el canal o abre un issue.*
