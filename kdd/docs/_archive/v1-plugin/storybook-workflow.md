# Storybook en KDD: De Wireframes a Componentes

## Introducción

Este documento explica cómo Storybook se integra en la metodología KDD (Knowledge-Driven Development) como puente entre las especificaciones y el código de producción.

## ¿Qué es Storybook?

Storybook es una herramienta para desarrollar y documentar componentes UI de forma aislada. Permite visualizar componentes en diferentes estados sin necesidad de ejecutar toda la aplicación.

## El rol de Storybook en KDD

En KDD, Storybook cumple dos funciones distintas según la fase del proyecto:

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO KDD + STORYBOOK                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SPECS (markdown)                                               │
│       │                                                         │
│       ▼                                                         │
│  WIREFRAMES (en .stories.tsx)  ← Fase de diseño/validación      │
│       │                                                         │
│       ▼                                                         │
│  COMPONENTES REALES (.tsx)     ← Fase de implementación         │
│       │                                                         │
│       ▼                                                         │
│  STORIES ACTUALIZADOS          ← Documentación viva             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Fase 1: Wireframes como documentación ejecutable

### ¿Qué es un wireframe en Storybook?

Un wireframe es un componente simplificado que vive **dentro** del archivo `.stories.tsx`. Su propósito es:

- Visualizar el diseño antes de implementar
- Validar la especificación con stakeholders
- Documentar estados y variantes del componente
- Servir como referencia para la implementación real

### Estructura de un wireframe

```tsx
// persona-form.stories.tsx

/**
 * Wireframe generado desde: specs/04-interaction/views/UI-PersonaForm.md
 * Estado: draft (pendiente de implementación real)
 */

// El componente vive DENTRO del archivo .stories.tsx
function PersonaFormWireframe({ onSave, onCancel, isLoading }) {
  // Implementación básica para visualizar el diseño
  return (
    <div className="...">
      {/* UI simplificada */}
    </div>
  )
}

// Stories que documentan diferentes estados
export const Default: Story = { args: { ... } }
export const Loading: Story = { args: { isLoading: true } }
export const ConError: Story = { args: { error: "..." } }
```

### Características de los wireframes

| Aspecto | Wireframe |
|---------|-----------|
| **Ubicación** | Dentro de `.stories.tsx` |
| **Propósito** | Validar diseño, documentar |
| **Lógica de negocio** | Simulada o ausente |
| **Llamadas a API** | No |
| **Se usa en producción** | No |
| **Reutilizable** | No |

## Fase 2: Componentes reales

### Transición de wireframe a componente real

Cuando se implementa el componente real, el flujo es:

1. **Crear el componente** en un archivo `.tsx` separado
2. **Actualizar el story** para importar el componente real
3. **Eliminar el wireframe** del archivo `.stories.tsx`

### Ejemplo de transición

**Antes (wireframe):**
```tsx
// persona-form.stories.tsx

// Wireframe vive aquí
function PersonaFormWireframe({ ... }) {
  return <div>...</div>
}

const meta: Meta<typeof PersonaFormWireframe> = {
  component: PersonaFormWireframe,
}
```

**Después (componente real):**
```tsx
// persona-form.tsx (NUEVO ARCHIVO)
export function PersonaForm({ ... }) {
  // Implementación completa con hooks, API, etc.
}
```

```tsx
// persona-form.stories.tsx (ACTUALIZADO)
import { PersonaForm } from './persona-form'  // Importa el real

const meta: Meta<typeof PersonaForm> = {
  component: PersonaForm,  // Usa el real
}

// Los stories se mantienen, ahora documentan el componente real
export const Default: Story = { ... }
```

### Características de los componentes reales

| Aspecto | Componente Real |
|---------|-----------------|
| **Ubicación** | Archivo `.tsx` propio |
| **Propósito** | Código de producción |
| **Lógica de negocio** | Completa |
| **Llamadas a API** | Sí (mockeadas en stories) |
| **Se usa en producción** | Sí |
| **Reutilizable** | Sí |

## Convención de co-location

### ¿Qué es co-location?

Co-location significa que los archivos relacionados viven juntos:

```
components/features/reto/
├── persona-form.tsx           ← Componente
├── persona-form.stories.tsx   ← Documentación/Stories
├── persona-form.test.tsx      ← Tests
└── persona-form.types.ts      ← Tipos (opcional)
```

### ¿Por qué co-location?

1. **Descubribilidad**: Al abrir el componente, ves inmediatamente su documentación y tests
2. **Mantenimiento**: Cambios en el componente recuerdan actualizar stories y tests
3. **Modularidad**: Mover o eliminar un componente mueve toda su documentación
4. **Estándar de industria**: Es la convención recomendada por Storybook

### Configuración en Storybook

El archivo `.storybook/main.ts` busca stories en todo el proyecto:

```typescript
const config: StorybookConfig = {
  stories: [
    '../components/**/*.stories.@(js|jsx|ts|tsx)',
  ],
}
```

## Organización en el sidebar de Storybook

### Jerarquía por categorías

Los stories se organizan usando el campo `title` en el meta:

```tsx
// Componentes UI base
const meta = { title: 'UI/Button', ... }

// Features específicas
const meta = { title: 'Features/Reto/PersonaForm', ... }

// Vistas/Páginas completas
const meta = { title: 'Views/Dashboard', ... }
```

### Resultado en sidebar

```
├── UI/
│   ├── Button
│   └── Input
├── Features/
│   └── Reto/
│       ├── PersonaForm
│       └── PersonaCard
└── Views/
    └── Dashboard
```

## Navegación entre stories

### Conectando componentes según las specs

Las especificaciones KDD definen interacciones que pueden abrir otros componentes:

```markdown
<!-- En UI-PersonaGenerateModal.md -->

### Click en "Generar"
- **Trigger**: Click en botón [Generar]
- **Abre**: [[UI-PersonaForm]] → ConContenidoGenerado
```

### Implementación con linkTo

```tsx
import { linkTo } from '@storybook/addon-links'

const navigationLinks = {
  onGenerateSuccess: linkTo('Features/Reto/PersonaForm', 'ConContenidoGenerado'),
  onCancel: linkTo('Views/ConfigurarReto', 'Default'),
}

export const ConNavegacion: Story = {
  render: () => (
    <PersonaGenerateModal
      onGenerate={(prompt) => {
        // Simular generación exitosa
        setTimeout(() => {
          navigationLinks.onGenerateSuccess()
        }, 1000)
      }}
      onCancel={() => navigationLinks.onCancel()}
    />
  ),
}
```

## Flujo de trabajo recomendado

### 1. Crear especificación

```markdown
<!-- specs/04-interaction/views/UI-MiComponente.md -->

# MiComponente

## Props
...

## Estados
...

## Interacciones
...
```

### 2. Generar wireframe en story

```bash
# Usar comando de Claude Code
/generate-story para UI-MiComponente
```

### 3. Validar con stakeholders

- Revisar wireframe en Storybook
- Iterar sobre diseño si es necesario
- Actualizar spec y regenerar si hay cambios

### 4. Implementar componente real

```tsx
// mi-componente.tsx
export function MiComponente({ ... }) {
  // Implementación completa
}
```

### 5. Actualizar story

```tsx
// mi-componente.stories.tsx
import { MiComponente } from './mi-componente'

// Eliminar wireframe, importar componente real
```

## Identificando wireframes vs componentes reales

### Convención de marcado

Los wireframes incluyen un comentario al inicio:

```tsx
/**
 * Wireframe generado desde: specs/04-interaction/views/UI-XXX.md
 * Estado: draft (pendiente de implementación real)
 *
 * TODO: Reemplazar wireframe con implementación real
 */
```

### Verificación rápida

- **¿El componente está definido dentro del `.stories.tsx`?** → Es wireframe
- **¿El componente se importa de un `.tsx` separado?** → Es componente real

## Resumen

| Fase | Archivo | Contenido | Propósito |
|------|---------|-----------|-----------|
| Especificación | `.md` en /specs | Definición formal | Qué debe hacer |
| Wireframe | `.stories.tsx` | Componente embebido | Cómo se ve |
| Implementación | `.tsx` + `.stories.tsx` actualizado | Componente real | Código de producción |

El valor de este flujo es que permite validar el diseño visualmente antes de invertir en implementación, manteniendo siempre la trazabilidad hacia las especificaciones originales.

## Sincronización automática Spec → Story

### El problema de la desincronización

Cuando las specs evolucionan, los stories pueden quedar desactualizados:

```
Semana 1: Spec tiene 3 estados → Story tiene 3 stories ✓
Semana 4: Spec tiene 5 estados → Story tiene 3 stories ✗
```

### Solución: Pre-commit hook + Claude

El proyecto incluye un sistema de sincronización automática:

```
┌─────────────────────────────────────────────────────────────────┐
│  FLUJO DE SINCRONIZACIÓN                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Desarrollador edita spec UI                                 │
│         │                                                       │
│         ▼                                                       │
│  2. git add specs/04-interaction/views/UI-*.md                  │
│         │                                                       │
│         ▼                                                       │
│  3. git commit                                                  │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Pre-commit hook detecta specs UI modificadas           │   │
│  │  └── Avisa si no hay stories en staging                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  4. Desarrollador ejecuta: claude "/sync-story auto"            │
│         │                                                       │
│         ▼                                                       │
│  5. Claude sincroniza los stories automáticamente               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `/generate-story {spec}` | Crea un story nuevo desde una spec |
| `/sync-story {spec}` | Actualiza un story existente |
| `/sync-story auto` | Sincroniza todas las specs UI modificadas |

### Estructura del story con zonas

Los stories generados tienen dos zonas:

```tsx
// ============================================
// @generated from specs/04-interaction/views/UI-*.md
// DO NOT EDIT - Se regenera automáticamente
// ============================================

// ... código generado desde la spec ...

// ============================================
// @custom - Extensiones manuales (NO se sobrescriben)
// ============================================

// ... código personalizado que se preserva ...
```

### Uso del pre-commit hook

```bash
# El hook se ejecuta automáticamente al hacer commit
git commit -m "feat: actualizar spec de PersonaForm"

# Output del hook:
# 🔍 Verificando specs UI modificadas...
# 📋 Specs UI modificadas detectadas:
#    • specs/04-interaction/views/UI-PersonaForm.md
#
# ⚠️  AVISO: Has modificado specs UI pero no hay stories en staging.
#    Opciones:
#    1. Ejecutar: claude "/sync-story auto" para sincronizar
#    2. Continuar sin sincronizar

# Para sincronizar
claude "/sync-story auto"

# Para saltarse la verificación (no recomendado)
git commit --no-verify -m "..."
```

### Ventajas de este enfoque

| Aspecto | Beneficio |
|---------|-----------|
| **Inteligencia** | Claude interpreta la spec, no usa templates rígidos |
| **Flexibilidad** | Sección @custom se preserva siempre |
| **Sincronización** | Imposible olvidar actualizar stories |
| **Bajo esfuerzo** | Solo editar la spec, Claude hace el resto |

### Configuración

Los archivos relevantes son:

- `.husky/pre-commit` - Hook que detecta cambios
- `.claude/commands/sync-story.md` - Comando de sincronización
- `scripts/detect-ui-spec-changes.ts` - Script de detección
