# Specs-to-Storybook: Guía del Proceso

> Cómo materializar especificaciones de UI en wireframes visuales antes de codificar.

## Resumen Ejecutivo

Este documento describe el flujo de trabajo para transformar especificaciones de UI escritas en lenguaje natural (Markdown) en wireframes visuales de Storybook, permitiendo validar diseños **antes de escribir código de producción**.

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Spec en MD    │  →   │  /generate-story │  →   │   Storybook     │
│  (lenguaje      │      │     (Claude)     │      │   (wireframe)   │
│   natural)      │      │                  │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## ¿Por qué este proceso?

### El Problema

En desarrollo tradicional:
1. Diseñador crea mockup en Figma
2. Desarrollador interpreta el mockup
3. Se pierde contexto de comportamiento
4. Iteraciones costosas en código

### La Solución

Con Specs-to-Storybook:
1. **Analista/Diseñador** escribe spec completa (estructura + comportamiento)
2. **Claude** genera wireframe visual en Storybook
3. **Stakeholders** validan en Storybook antes de codificar
4. **Desarrollador** implementa con spec clara y wireframe de referencia

## Tipos de Especificación UI

| Tipo | Tag | Uso | Plantilla |
|------|-----|-----|-----------|
| **Component** | `ui/component` | Elementos reutilizables (botón, card, input) | `kdd/templates/ui-component.md` |
| **View** | `ui/view` | Pantallas completas | `kdd/templates/ui-view.md` |
| **Flow** | `ui/flow` | Secuencias de interacción | `kdd/templates/ui-flow.md` |

## Estructura de Directorios

```
specs/03-experience/
├── auth/                 # Autenticación
│   └── VIEW-Auth.md
├── creditos/             # Gestión de créditos
│   ├── UI-CreditBalanceIndicator.md
│   └── MODAL-InsufficientCredits.md
├── retos/                # Core: retos y sesiones
│   ├── VIEW-Challenge.md
│   ├── UI-PersonaCard.md
│   └── MODAL-PersonaGenerate.md
├── shared/               # Componentes compartidos
│   ├── UI-AppHeader.md
│   └── LAYOUT-ThreeColumn.md
└── flows/                # Flujos de usuario
    └── FLOW-Onboarding.md

kdd/templates/
├── ui-component.template.md       # Plantilla componentes (UI-*)
├── ui-view.template.md            # Plantilla vistas (VIEW-*)
└── ui-flow.template.md            # Plantilla flujos (FLOW-*)

apps/web/components/features/
└── {feature}/
    ├── {componente}.stories.tsx  # Stories generados
    └── {componente}.tsx          # Implementación (después)
```

Los archivos se nombran con prefijo según su tipo:
- `VIEW-*` - Vistas/páginas completas
- `UI-*` - Componentes reutilizables
- `MODAL-*` - Diálogos modales
- `LAYOUT-*` - Estructuras de layout
- `FLOW-*` - Flujos multi-paso

## Flujo de Trabajo Paso a Paso

### Paso 1: Crear la Especificación

Usa la plantilla correspondiente de `kdd/templates/`:

```bash
# Copiar plantilla
cp kdd/templates/ui-view.md specs/03-experience/retos/VIEW-MiNuevaVista.md
```

Completa las secciones:
- **Front-matter**: tags, links a entidades/casos de uso
- **Descripción**: Propósito de la vista
- **Layout**: Estructura en ASCII art
- **Estados**: Loading, empty, error, success
- **Comportamiento**: Interacciones y validaciones
- **Accesibilidad**: Consideraciones a11y

### Paso 2: Generar el Story

Ejecuta el slash command de Claude:

```
/generate-story specs/03-experience/retos/VIEW-MiNuevaVista.md
```

Claude:
1. Lee y comprende la spec
2. Traduce ASCII art a componentes shadcn/ui
3. Genera mock data basada en entidades referenciadas
4. Crea stories para cada estado descrito
5. Guarda en `apps/web/components/features/{feature}/`

### Paso 3: Visualizar en Storybook

```bash
bun run storybook
```

Navega al story generado y valida:
- ¿La estructura coincide con la spec?
- ¿Los estados están correctos?
- ¿La responsividad funciona?

### Paso 4: Iterar

Si algo no está bien:
1. **Ajusta la spec** (no el story directamente)
2. **Re-genera** con `/generate-story`
3. El story refleja los cambios

### Paso 5: Aprobar e Implementar

Una vez validado:
1. Marca la spec como `status: approved`
2. Implementa el componente real basándote en:
   - La spec (comportamiento)
   - El wireframe (estructura visual)
3. Reemplaza el wireframe por la implementación real

## Anatomía de una Spec

### Front-matter (obligatorio)

```yaml
---
tags:
  - ui/view                    # Tipo de spec
status: draft                  # draft | review | approved | implemented
version: "1.0"
links:
  entities:                    # Entidades de dominio usadas
    - "[[Reto]]"
    - "[[Persona Sintética]]"
  use-cases:                   # Casos de uso implementados
    - "[[UC-002-Configurar-Personas-Sinteticas]]"
  components:                  # Componentes referenciados
    - "[[PersonaCard]]"
storybook:
  category: "Views"            # Categoría en Storybook
  auto-generate: true          # Si Claude debe generarlo
---
```

### Wireframe en ASCII (recomendado)

El ASCII art es interpretado por Claude:

```ascii
┌──────────────────────────────────────┐
│  [← Volver]    Título    [Badge]     │  ← Header
├──────────────────────────────────────┤
│                                      │
│  ┌────────────┐  ┌────────────┐      │  ← Grid de cards
│  │  Card 1    │  │  Card 2    │      │
│  └────────────┘  └────────────┘      │
│                                      │
│  [Botón Primario]  [Botón Sec.]      │  ← Acciones
└──────────────────────────────────────┘
```

Claude traduce:
- `┌───┐` → `<Card>` o `<div className="border rounded">`
- `[Texto]` → `<Button>`
- `←` → Icono de Lucide
- Proporciones → clases de Tailwind

### Estados (crítico para UX)

Documenta todos los estados de la vista:

```markdown
## Estados de la Vista

### Loading
- Mostrar skeleton
- Deshabilitar interacciones

### Empty
- Mensaje "Sin datos"
- CTA para crear/añadir

### Error
- Mensaje de error
- Botón de retry

### Success (default)
- Datos cargados
- Interacciones habilitadas
```

## Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `/generate-story specs/03-experience/...` | Genera story desde spec |
| `bun run storybook` | Inicia Storybook local |
| `bun run build:storybook` | Build estático de Storybook |

## Ejemplos Reales

### Spec: UI-PersonaCard

**Archivo**: `specs/03-experience/retos/UI-PersonaCard.md`

**Secciones clave**:
- Props documentadas con tipos
- ASCII art para cada tamaño (sm, md, lg)
- Estados: default, hover, selected, loading
- Comportamiento de eliminación con confirmación

**Story generado**: `apps/web/components/features/reto/persona-card.stories.tsx`

**Stories incluidos**:
- Default, Selected, ReadOnly, Loading
- SizeSmall, SizeMedium, SizeLarge
- GridOfPersonas, InteractiveDemo

### Spec: VIEW-ConfigureChallenge

**Archivo**: `specs/03-experience/retos/VIEW-ConfigureChallenge.md`

**Secciones clave**:
- Layout completo con header, main, footer
- Responsive: desktop, tablet, mobile
- Estados: loading, empty, partial, configured, error
- Comportamiento de cada interacción

**Story generado**: `apps/web/components/features/reto/configurar-reto-view.stories.tsx`

**Stories incluidos**:
- Loading, Empty, Partial, Configured, Error
- MobileView, TabletView
- InteractiveDemo (funcional)

## Mejores Prácticas

### DO ✅

- **Escribe specs completas** antes de generar
- **Incluye todos los estados** de la UI
- **Referencia entidades** para mock data realista
- **Usa ASCII art** para layouts complejos
- **Documenta comportamiento**, no solo apariencia
- **Itera en la spec**, no en el story

### DON'T ❌

- No edites stories generados directamente (se perderán al regenerar)
- No omitas estados de error/loading
- No escribas specs sin front-matter
- No generes sin validar que la spec está completa

## Troubleshooting

### El story no se genera correctamente

1. Verifica que la spec tiene front-matter válido
2. Asegúrate de que el ASCII art usa caracteres Unicode estándar
3. Revisa que las entidades referenciadas existen

### Storybook no encuentra el story

1. Verifica la ubicación del archivo
2. Revisa que `.storybook/main.ts` incluye el patrón correcto
3. Reinicia Storybook

### El wireframe no se parece a la spec

1. Sé más explícito en el ASCII art
2. Añade descripciones a cada sección
3. Especifica componentes de shadcn/ui a usar

## Referencias

- **Plan original**: `wip/plan-specs-to-storybook.md`
- **Plantillas**: `kdd/templates/ui-*.md`
- **Slash command**: `.claude/commands/generate-story.md`
- **Ejemplos**:
  - `specs/03-experience/retos/UI-PersonaCard.md`
  - `specs/03-experience/retos/VIEW-ConfigureChallenge.md`
