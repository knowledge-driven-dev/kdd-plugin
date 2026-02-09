# Capa 03: Experience (Experiencia)

## La Capa de Presentación: ¿Cómo lo Ven los Usuarios?

---

## Introducción

La capa de Experience responde a la pregunta: **¿Cómo se presenta el sistema al usuario?**

En las capas anteriores definimos el dominio (01-Domain) y las operaciones disponibles incluyendo casos de uso (02-Behavior). La capa de Experience es donde **diseñamos la interfaz visual** que implementa esas operaciones.

> **Nota importante**: Esta capa es de **PRESENTATION**. Referencia a 02-Behavior y contiene únicamente especificaciones de vistas (Views).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   00-Requirements  →  01-Domain   →  02-Behavior     →  03-Experience       │
│                                                                              │
│   "¿Por qué           "¿Qué           "¿Cómo se           "¿CÓMO LO         │
│    existe?"           existe?"         comporta?"           VEN?"            │
│                                                                              │
│   ──────────────────────────────────────────────────────────────────────────│
│                                                                              │
│   Motivación          Conceptual      Funcional           PRESENTACIÓN      │
│   Contexto            (entidades)     (operaciones)       (vistas)          │
│   Objetivos           (reglas)        (use cases)                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## La Filosofía: Views como Consumidores de Behavior

### El Usuario como Consumidor del Comportamiento

El diseño de esta capa parte de un principio clave:

> **Las interfaces de usuario son "clientes" de las capacidades del sistema, no su definición.**

Esto significa que una View (UI) **no define** lo que el sistema hace; una View **consume** lo que el sistema ya sabe hacer.

```
❌ Incorrecto: "El sistema puede crear retos porque hay un formulario"
✅ Correcto:   "Hay un formulario porque el sistema puede crear retos"
```

Esta distinción es crucial porque:

1. **Desacopla la lógica de la presentación**: El mismo Command puede ser invocado desde una web, una CLI, una API, o un test automatizado.
2. **Permite evolución independiente**: Puedes rediseñar completamente la UI sin tocar la lógica de negocio.
3. **Facilita el testing**: Los Commands se pueden probar aislados de la UI.

### Las Tres Responsabilidades de una View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   1. PRESENTAR DATOS                                                         │
│      Obtener información via Queries y mostrarla al usuario                  │
│      Query → Datos → Renderizado visual                                      │
│                                                                              │
│   2. CAPTURAR INTENCIONES                                                    │
│      Traducir acciones del usuario en Commands                               │
│      Click/Input → Validación → Command                                      │
│                                                                              │
│   3. DAR FEEDBACK                                                            │
│      Comunicar el resultado de las operaciones                               │
│      Loading → Success/Error → Actualización visual                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

La UI **no debe contener lógica de negocio**. Si te encuentras escribiendo reglas de validación complejas o cálculos en un componente, probablemente esa lógica pertenece a un Command o a un Domain Service.

---

## El Único Artefacto: Views (Vistas)

Las Views son **especificaciones de la interfaz visual** que implementan los Use Cases definidos en 02-Behavior.

### Tipos de Views

| Tipo | Prefijo | Propósito | Tiene ruta |
|------|---------|-----------|------------|
| **View** | `UI-{Name}` | Página completa | Sí (`/retos/:id/editar`) |
| **Component** | `UI-{Name}` | Pieza reutilizable | No |
| **Modal** | `UI-{Name}Modal` | Overlay sobre vista | No |

### Estructura de una View

```markdown
---
id: UI-RetoEditor
kind: view
title: Editor de Reto
route: /retos/:id/editar
status: approved
---

# UI-RetoEditor

## Contexto
| Elemento | Descripción |
|----------|-------------|
| Ruta | `/retos/:id/editar` |
| Tipo | Página completa |
| Acceso | Usuario autenticado |
| Use Case | [[UC-001-CrearReto]], [[UC-002-EditarReto]] |

## Queries Consumidas
- [[QRY-001-GetChallenge]] - Carga datos del reto

## Commands Invocados
- [[CMD-001-CreateChallenge]] - Al crear nuevo
- [[CMD-002-UpdateChallenge]] - Al guardar cambios

## Layout

```ascii
┌──────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                       │
│  ← Volver    [Título del Reto]                    [Guardar] [Siguiente →]    │
├────────────────┬─────────────────────────────────────────────┬───────────────┤
│                │                                             │               │
│  NAV STEPPER   │            EDITOR MARKDOWN                  │  TABLE OF     │
│  (200px)       │            (flexible)                       │  CONTENTS     │
│                │                                             │  (220px)      │
│  ○ Objetivos   │  # Objetivos del Reto                       │               │
│  ○ Contexto    │                                             │  • Objetivos  │
│  ● Hipótesis   │  Describir aquí los objetivos               │  • Contexto   │
│                │  principales...                             │  • Hipótesis  │
│                │                                             │               │
├────────────────┴─────────────────────────────────────────────┴───────────────┤
│  FOOTER                                                                       │
│  [Potenciar con IA]           Último guardado: hace 2 min      [Vista previa]│
└──────────────────────────────────────────────────────────────────────────────┘
```

## Estados

### Loading
- Mostrar skeleton del editor
- Header con título placeholder

### Empty (Nuevo Reto)
- Formulario vacío con placeholders guía
- Stepper en primer paso

### Success (Reto Existente)
- Datos cargados en el editor
- Stepper refleja progreso

### Error
- Toast con mensaje de error
- Opción de reintentar carga

## Interacciones

### Click en [Guardar]
- **Trigger**: Click en botón Guardar
- **Precondición**: Formulario válido (título no vacío)
- **Comando**: [[CMD-002-UpdateChallenge]]
- **Feedback**:
  - Durante: Spinner + botón deshabilitado
  - Éxito: Toast "Cambios guardados"
  - Error: Toast con mensaje del error

### Click en [Siguiente →]
- **Trigger**: Click en botón Siguiente
- **Precondición**: Reto guardado
- **Navega a**: [[UI-ConfigurarPersonas]]

## Responsive

| Breakpoint | Cambios |
|------------|---------|
| Desktop (>1024px) | Layout 3 columnas |
| Tablet (768-1024px) | TOC colapsable, 2 columnas |
| Mobile (<768px) | Una columna, stepper horizontal |

## Accesibilidad
- Focus trap en modales
- Keyboard shortcuts: Ctrl+S para guardar
- ARIA labels en botones de acción
```

---

## El Principio de Dependencia Unidireccional

Este es el corazón de cómo KDD estructura las relaciones entre capas:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   REGLA FUNDAMENTAL:                                                         │
│                                                                              │
│   03-Experience → referencia → 02-Behavior                                   │
│   02-Behavior → NO referencia → 03-Experience                                │
│                                                                              │
│   La View conoce qué Commands puede invocar.                                 │
│   El Command NO sabe qué Views lo usan.                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Por Qué Esta Regla

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   El mismo CMD-001-CreateChallenge puede ser invocado desde:                │
│                                                                              │
│   ┌─────────────────┐                                                        │
│   │  UI-RetoEditor  │ ────┐                                                  │
│   └─────────────────┘     │                                                  │
│                           │                                                  │
│   ┌─────────────────┐     │      ┌─────────────────────┐                    │
│   │  API REST       │ ────┼────► │ CMD-001             │                    │
│   └─────────────────┘     │      │ CreateChallenge     │                    │
│                           │      │                     │                    │
│   ┌─────────────────┐     │      │ (no sabe quién      │                    │
│   │  CLI Admin      │ ────┤      │  lo invoca)         │                    │
│   └─────────────────┘     │      └─────────────────────┘                    │
│                           │                                                  │
│   ┌─────────────────┐     │                                                  │
│   │  Test E2E       │ ────┘                                                  │
│   └─────────────────┘                                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Implicaciones en las Especificaciones

```yaml
# ✅ CORRECTO: La View conoce al Command
# UI-RetoEditor.md
## Commands Invocados
- [[CMD-001-CreateChallenge]]

# ❌ INCORRECTO: El Command conoce a la View
# CMD-001-CreateChallenge.md (en 02-behavior)
## Usado por:  # NO DEBE EXISTIR
- [[UI-RetoEditor]]
```

---

## Estados de una Vista

Toda vista debe especificar sus posibles estados:

### 1. Loading

Mientras se cargan los datos iniciales.

```ascii
┌──────────────────────────────────────┐
│  ← Volver    ████████████            │
├──────────────────────────────────────┤
│                                      │
│      ┌────────────────────┐          │
│      │   ▓▓▓▓▓▓▓▓▓▓▓▓▓   │          │
│      │   ▓▓▓▓▓▓▓▓▓▓▓▓▓   │          │
│      │   ▓▓▓▓▓▓▓▓▓▓▓▓▓   │          │
│      └────────────────────┘          │
│          (Skeleton)                  │
└──────────────────────────────────────┘
```

### 2. Empty

Cuando no hay datos que mostrar.

```ascii
┌──────────────────────────────────────┐
│                                      │
│         📋                           │
│                                      │
│    No tienes retos todavía           │
│                                      │
│    Crea tu primer reto para          │
│    empezar a analizar ideas          │
│                                      │
│       [+ Crear mi primer reto]       │
│                                      │
└──────────────────────────────────────┘
```

### 3. Error

Cuando algo falla.

```ascii
┌──────────────────────────────────────┐
│                                      │
│         ⚠️                           │
│                                      │
│    No pudimos cargar los datos       │
│                                      │
│    Error: Connection timeout         │
│                                      │
│       [Reintentar]  [Volver]         │
│                                      │
└──────────────────────────────────────┘
```

### 4. Success/Default

El estado normal con datos cargados.

---

## Estructura de Interacciones

La sección más crítica de una especificación de View. Documenta exactamente qué pasa cuando el usuario hace algo.

### Campos de una Interacción

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Trigger** | Qué acción del usuario dispara esto | Click, Hover, Submit |
| **Precondición** | Condiciones que deben cumplirse | Formulario válido |
| **Comando** | Command que se ejecuta | CMD-001-CreateChallenge |
| **Query** | Query que se ejecuta | QRY-001-GetChallenge |
| **Feedback** | Feedback visual al usuario | Spinner, Toast |
| **Abre** | Modal/drawer que se abre | UI-PersonaModal |
| **Navega a** | Vista destino | UI-ConfigurarPersonas |

### Diferencia entre "Abre" y "Navega a"

```
ABRE: Modal, drawer, popover (overlay sobre la vista actual)
─────
- La vista actual permanece debajo
- El usuario puede cerrar y volver
- No cambia la URL

NAVEGA A: Cambio de ruta/página (reemplaza la vista actual)
─────────
- La vista actual se desmonta
- Cambia la URL del navegador
- El usuario usa "atrás" para volver
```

---

## Conexión con Storybook

Las especificaciones de Views están diseñadas para generar stories de Storybook:

```yaml
# En el front-matter de una View
storybook:
  category: "Views"
  auto-generate: true
```

Cada **estado** documentado se convierte en una story:

| Estado en Spec | Story Generada |
|----------------|----------------|
| Loading | `RetoEditor.stories.tsx` → `Loading` |
| Empty | `RetoEditor.stories.tsx` → `Empty` |
| Error | `RetoEditor.stories.tsx` → `Error` |
| Default | `RetoEditor.stories.tsx` → `Default` |

---

## Estructura de Carpetas

```
/specs/03-experience/
└── /views/
    ├── UI-Dashboard.md
    ├── UI-RetoEditor.md
    ├── UI-ConfigurarPersonas.md
    ├── UI-SesionActiva.md
    ├── UI-VerAnalisis.md
    ├── UI-PersonaCard.md          # Component
    ├── UI-PersonaModal.md         # Modal
    └── UI-CreditBalance.md        # Component
```

---

## Checklist: Especificando una Nueva Vista

Cuando crees una nueva especificación de View, asegúrate de incluir:

- [ ] **ID** en formato `UI-{NombreDescriptivo}`
- [ ] **kind**: `view`, `component`, o `modal`
- [ ] **Contexto**: Ruta (si aplica), tipo, acceso requerido
- [ ] **Use Cases** que implementa (de 02-behavior)
- [ ] **Queries** que consume
- [ ] **Commands** que invoca
- [ ] **Layout** con wireframe ASCII
- [ ] **Estados**: loading, empty, error, success
- [ ] **Interacciones**: cada acción del usuario documentada
- [ ] **Responsive**: comportamiento en diferentes breakpoints
- [ ] **Accesibilidad**: focus, keyboard nav, ARIA

---

## Anti-patrones a Evitar

### 1. Lógica de Negocio en la View

```typescript
// ❌ INCORRECTO: Regla de negocio en el componente
function RetoEditor() {
  const canSave = reto.personas.length >= 3 && reto.personas.length <= 6
  // Esta regla debería estar en BR-PERSONA-001 (01-domain)
}

// ✅ CORRECTO: La UI solo presenta el resultado
function RetoEditor() {
  const { canInitiateSession } = useRetoValidation(reto)
  // La validación viene del dominio
}
```

### 2. View que Define Operaciones

```yaml
# ❌ INCORRECTO: La View "inventa" operaciones
# UI-RetoEditor.md
## Operaciones:
- Crear reto
- Duplicar reto

# ✅ CORRECTO: La View consume Commands existentes
# UI-RetoEditor.md
## Commands Invocados:
- [[CMD-001-CreateChallenge]]    # Ya definido en 02-behavior
- [[CMD-004-DuplicateChallenge]]
```

### 3. Especificar Solo el Happy Path

```markdown
# ❌ INCORRECTO: Solo el caso feliz
## Interacciones
- Click en Guardar → Reto guardado

# ✅ CORRECTO: Todos los casos
## Interacciones

### Click en Guardar (éxito)
- Comando: [[CMD-002-UpdateChallenge]]
- Feedback: Toast "Cambios guardados"

### Click en Guardar (error de validación)
- Feedback: Campos inválidos resaltados

### Click en Guardar (error de servidor)
- Feedback: Toast de error con opción de reintentar
```

### 4. View sin Use Case

```yaml
# ❌ INCORRECTO: View sin contexto de uso
# UI-RetoEditor.md
(Sin mención a Use Cases)

# ✅ CORRECTO: View vinculada a Use Cases
# UI-RetoEditor.md
## Contexto
| Use Case | [[UC-001-CrearReto]], [[UC-002-EditarReto]] |
```

---

## Resumen

La capa de Experience en KDD:

1. **Es de presentación**: Solo contiene especificaciones de Views
2. **Referencia hacia atrás**: Conoce Commands/Queries/Use Cases de 02-behavior
3. **No es referenciada por capas anteriores**: Los Commands no saben qué Views los usan
4. **Es derivable**: Si tienes Use Cases bien especificados, la UI es "solo presentación"
5. **Es verificable**: Los tests BDD ejercitan la UI contra los Commands
6. **Genera Storybook**: Las especificaciones alimentan la documentación visual

> **"La mejor UI es invisible: presenta las capacidades del sistema de forma natural, sin inventar comportamiento propio."**

---

## Artefactos Relacionados

- [[view.template]] - Template para vistas
- [[component.template]] - Template para componentes
- [[02-behavior]] - La capa anterior: Behavior (Commands, Queries, Use Cases)
- [[04-verification]] - La capa siguiente: Verification
- [[Introducción a KDD]] - Visión general de KDD

---

*Última actualización: 2025-01*
