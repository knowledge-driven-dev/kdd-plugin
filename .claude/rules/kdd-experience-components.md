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

| Tipo | Patron | Ejemplo |
|------|--------|---------|
| Componente | `UI-NombreComponente.md` | `UI-ProjectCard.md` |
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
Que es y proposito principal. Debe ser reutilizable.

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `Proyecto` | yes | - | Datos a mostrar |
| `onSave` | `() => void` | no | - | Callback al guardar |

## Structure
```ascii
+---------------------------------+
|  [Icon]  Titulo                 |
|          Subtitulo              |
+---------------------------------+
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
- **Result**: Accion ejecutada
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

## shadcn/ui Dependencies
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
data: Proyecto | Tarea | Usuario

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
### Click en boton principal

- **Trigger**: Click en `[Guardar]`
- **Precondition**: Formulario valido
- **Result**:
  - Ejecuta CMD-001
  - Actualiza estado
- **Feedback**: Spinner -> Toast
- **Emits**: `EVT-Proyecto-Creado`
- **Opens**: `[[MODAL-Success]]` -> `Default`
```

| Campo | Cuando usar |
|-------|-------------|
| Opens | Abre modal/drawer (overlay) |
| Navigates to | Cambia de ruta/pagina |
| Emits | Evento de dominio disparado |

## Estados: Wireframes

```ascii
# Default
+-----------------+
|  Estado normal  |
+-----------------+

# Hover
+-----------------+  <- shadow-lg
|  Estado hover   |
+-----------------+

# Disabled
+-----------------+  <- opacity-50
|  Deshabilitado  |
+-----------------+

# Loading
+-----------------+
|  O Cargando...  |
+-----------------+
```

## Modales: Estructura Especial

```markdown
# MODAL-NombreModal

## Description
Proposito del modal.

## Trigger
Que accion abre este modal.

## Structure
```ascii
+--------------------------------------+
|  Titulo del Modal              [x]   |
+--------------------------------------+
|                                       |
|  Contenido del modal                  |
|                                       |
+--------------------------------------+
|  [Cancelar]           [Confirmar]    |
+--------------------------------------+
```

## Actions
| Action | Result |
|--------|--------|
| Confirmar | Ejecuta accion, cierra |
| Cancelar | Cierra sin cambios |
| Click fuera | Cierra (o no, segun contexto) |
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

# UI-ProjectCard

## Description

Tarjeta que muestra resumen de un [[Proyecto]]: titulo, estado, y conteo de
tareas. Clickeable para navegar al detalle.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `proyecto` | `ProyectoSummary` | yes | - | Datos del proyecto |
| `onClick` | `() => void` | no | - | Click handler |

## Structure

```ascii
+-------------------------------------+
|  Titulo del Proyecto          [badge] |
|  3 tareas · 2 miembros                |
|  Creado hace 2 dias                   |
+-------------------------------------+
```

## States

### Default
Fondo blanco, borde sutil.

### Hover
Elevacion (shadow-md), borde primario.

## Interactions

### Click en card
- **Trigger**: Click en cualquier parte
- **Navigates to**: `[[VIEW-ProjectDetail]]`
- **Data**: `{ proyectoId: proyecto.id }`

## Accessibility

- **ARIA role**: `article`
- **Keyboard**: Tab + Enter navega
```
