---
paths:
  - specs/03-experience/**/UI-*.md
  - specs/03-experience/**/COMP-*.md
  - specs/03-experience/**/MODAL-*.md
  - specs/domains/*/03-experience/**/UI-*.md
  - specs/domains/*/03-experience/**/COMP-*.md
  - specs/domains/*/03-experience/**/MODAL-*.md
---

# Componentes UI KDD

> Aplica a componentes en `specs/03-experience/`
> Prefijos: `UI-*`, `COMP-*`, `MODAL-*`

## Nombrado de Archivo

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Componente | `UI-NombreComponente.md` | `UI-ProyectoCard.md` |
| Componente | `COMP-NombreComponente.md` | `COMP-Header.md` |
| Modal | `MODAL-NombreModal.md` | `MODAL-ConfirmDelete.md` |

## Frontmatter Requerido

```yaml
---
kind: ui-component            # Literal
status: draft
version: "1.0"
links:
  entities: []                # Entidades que muestra
  use-cases: []               # Use cases relacionados
  components: []              # Componentes hijos
  parent-views: []            # Vistas donde se usa
storybook:
  category: "Components"      # o "Modals"
  auto-generate: true
---
```

## Estructura del Documento

### Secciones Obligatorias

```markdown
# NombreComponente

## Description
Qué es y propósito principal. Debe ser reutilizable.

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `Proyecto` | yes | - | Datos a mostrar |
| `onSave` | `() => void` | no | - | Callback al guardar |

## Structure
```ascii
┌─────────────────────────────────┐
│  [Icon]  Título                 │
│          Subtítulo              │
└─────────────────────────────────┘
```

## States
### Default
### Hover
### Disabled
### Loading (si aplica)
### Error (si aplica)

## Interactions
### Click principal
- **Trigger**: Click en elemento
- **Result**: Acción ejecutada
- **Feedback**: Visual feedback

## Accessibility
- **ARIA role**: `role="button"`
- **Keyboard**: Tab + Enter
```

### Secciones Opcionales

```markdown
## Variants

### Sizes
- `sm`, `md`, `lg`

### Styles
- `default`, `outline`, `ghost`

## UI Library Dependencies
- `Button`, `Card`, `Input`

## Usage Examples
```tsx
<MyComponent data={proyecto} onSave={handleSave} />
```

## Implementation Notes
```

## Props: Tipos Comunes

```typescript
// Entidades de dominio
data: Proyecto | Tarea | Persona

// Callbacks
onSave: () => void
onChange: (value: T) => void
onSelect: (item: T) => void
onClose: () => void

// Estado
isLoading: boolean
isDisabled: boolean
isSelected: boolean

// Variantes
variant: 'default' | 'outline' | 'ghost'
size: 'sm' | 'md' | 'lg'
```

## Interactions: Formato

```markdown
### Click en botón principal

- **Trigger**: Click en `[Guardar]`
- **Precondition**: Formulario válido
- **Result**:
  - Ejecuta CMD-001
  - Actualiza estado
- **Feedback**: Spinner → Toast
- **Emits**: `EVT-Proyecto-Creado`
- **Opens**: `[[MODAL-Success]]` → `Default`
```

| Campo | Cuándo usar |
|-------|-------------|
| Opens | Abre modal/drawer (overlay) |
| Navigates to | Cambia de ruta/página |
| Emits | Evento de dominio disparado |

## Estados: Wireframes

```ascii
# Default
┌─────────────────┐
│  Estado normal  │
└─────────────────┘

# Hover
┌─────────────────┐  ← shadow-lg
│  Estado hover   │
└─────────────────┘

# Disabled
┌─────────────────┐  ← opacity-50
│  Deshabilitado  │
└─────────────────┘

# Loading
┌─────────────────┐
│  ◌ Cargando...  │
└─────────────────┘
```

## Modales: Estructura Especial

```markdown
# MODAL-NombreModal

## Description
Propósito del modal.

## Trigger
Qué acción abre este modal.

## Structure
```ascii
┌──────────────────────────────────────┐
│  Título del Modal              [×]   │
├──────────────────────────────────────┤
│                                       │
│  Contenido del modal                  │
│                                       │
├──────────────────────────────────────┤
│  [Cancelar]           [Confirmar]    │
└──────────────────────────────────────┘
```

## Actions
| Action | Result |
|--------|--------|
| Confirmar | Ejecuta acción, cierra |
| Cancelar | Cierra sin cambios |
| Click fuera | Cierra (o no, según contexto) |
```

## Ejemplo Completo

```markdown
---
kind: ui-component
status: draft
version: "1.0"
links:
  entities: [Proyecto]
  parent-views: [VIEW-Dashboard]
storybook:
  category: "Components"
  auto-generate: true
---

# UI-ProyectoCard

## Description

Tarjeta que muestra resumen de un [[Proyecto]]: título, estado, y conteo de
Miembros. Clickeable para navegar al detalle.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `proyecto` | `ProyectoSummary` | yes | - | Datos del proyecto |
| `onClick` | `() => void` | no | - | Click handler |

## Structure

```ascii
┌─────────────────────────────────────┐
│  Título del Proyecto            [badge] │
│  3 miembros · 2 tareas            │
│  Creado hace 2 días                 │
└─────────────────────────────────────┘
```

## States

### Default
Fondo blanco, borde sutil.

### Hover
Elevación (shadow-md), borde primario.

## Interactions

### Click en card
- **Trigger**: Click en cualquier parte
- **Navigates to**: `[[VIEW-Proyecto]]`
- **Data**: `{ proyectoId: proyecto.id }`

## Accessibility

- **ARIA role**: `article`
- **Keyboard**: Tab + Enter navega
```
