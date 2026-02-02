---
paths:
  - specs/03-experience/**/VIEW-*.md
  - specs/domains/*/03-experience/**/VIEW-*.md
---

# Vistas UI KDD

> Aplica cuando trabajas en `specs/03-experience/**/VIEW-*.md`

## Nombrado de Archivo

Patron: `VIEW-NombreDeLaVista.md`

Ejemplos:
- `VIEW-Auth.md`
- `VIEW-Dashboard.md`
- `VIEW-ProjectDetail.md`

## Frontmatter Requerido

```yaml
---
kind: ui-view
status: draft
version: "1.0"
links:
  entities: []              # Entidades de dominio usadas
  use-cases: []             # Casos de uso implementados
  components: []            # Componentes que usa
storybook:
  category: "Views"
  auto-generate: true
---
```

## Estructura del Documento

### Secciones Obligatorias

```markdown
# View: NombreVista

## Description
Proposito de la vista. Que objetivo del usuario cumple?

## Navigation Context
- **Route**: `/path/to/view`
- **Access from**: De donde llega el usuario
- **Navigation to**: A donde puede ir

## Layout

### General Structure
```ascii
+--------------------------------------+
|              HEADER                   |
+--------------------------------------+
|                                       |
|          MAIN CONTENT                 |
|                                       |
+--------------------------------------+
```

### Responsive
- **Desktop (>=1024px)**: Layout descripcion
- **Tablet (768-1023px)**: Layout descripcion
- **Mobile (<768px)**: Layout descripcion

## Components
| Component | Location | Main props |
|-----------|----------|------------|
| [[UI-Header]] | Top | `title`, `showBack` |

## Data Requirements

### Entities
| Entity | Fields used | How to obtain |
|--------|-------------|---------------|
| [[Proyecto]] | `titulo`, `status` | GET `/api/proyectos/:id` |

### Local State
| State | Type | Purpose |
|-------|------|---------|
| `isLoading` | boolean | Estado de carga |

## View States
### Loading
### Empty
### Error
### Success / Default

## Main Wireframe
```ascii
[Wireframe principal en ASCII]
```

## Behavior

### On Load
1. Mostrar skeleton
2. Fetch data
3. If error -> error state
4. If OK -> render

### Main Interactions
| User Action | Result | Feedback |
|-------------|--------|----------|
| Click "Save" | Envia datos | Toast success/error |

## Accessibility
- **Initial focus**: Primer campo
- **Tab order**: Header -> Content -> Actions
- **Keyboard shortcuts**: Ctrl+S = Save

## Related Use Cases
- [[UC-001-Crear-Proyecto]]
```

## Wireframes ASCII

### Elementos Comunes

```ascii
# Header con back
+--------------------------------------+
|  <- Back    Titulo                    |
+--------------------------------------+

# Input field
|   Label: [___________________________] |

# Textarea
|   +--------------------------------+  |
|   |                                |  |
|   +--------------------------------+  |

# Buttons
|   [Cancel]            [Primary Action] |

# Card
|   +---------------------------------+ |
|   |  Card content                   | |
|   +---------------------------------+ |

# Skeleton loading
|   ████████████████████              |

# Empty state
|       (empty icon)                    |
|       No hay elementos                |
|       [Crear primero]                 |
```

## View States: Que Incluir

| Estado | Cuando | Contenido |
|--------|--------|-----------|
| Loading | Siempre | Skeleton que refleja estructura |
| Empty | Si puede no haber datos | Mensaje + CTA |
| Error | Siempre | Mensaje + Retry |
| Success | Siempre | Wireframe principal |

## Ejemplo Completo (Resumido)

```markdown
---
kind: ui-view
status: draft
version: "1.0"
links:
  entities: [Proyecto]
  use-cases: [UC-001]
  components: [UI-ProyectoForm]
---

# View: NewProject

## Description
Permite al [[Usuario]] crear un nuevo [[Proyecto]] ingresando titulo y descripcion.

## Navigation Context
- **Route**: `/proyectos/nuevo`
- **Access from**: Dashboard, boton "Nuevo Proyecto"
- **Navigation to**: VIEW-ProjectDetail (on success)

## Layout

### General Structure
```ascii
+--------------------------------------+
|  <- Mis Proyectos    Nuevo Proyecto   |
+--------------------------------------+
|                                       |
|  Titulo: [________________________]   |
|                                       |
|  Descripcion:                         |
|  +--------------------------------+  |
|  |                                |  |
|  +--------------------------------+  |
|                                       |
|  [Cancelar]           [Crear Proyecto]|
+--------------------------------------+
```

## Behavior

### Main Interactions
| User Action | Result | Feedback |
|-------------|--------|----------|
| Click "Crear Proyecto" | CMD-001 | Redirect o error toast |
| Click "Cancelar" | Volver a dashboard | Confirmar si hay cambios |

## Related Use Cases
- [[UC-001-Crear-Proyecto]]
```
