---
title: "Tutorial: Crea tu primera UI spec"
audience: [designer]
type: tutorial
reading_time: "8 min"
status: draft
---

# Tutorial: Crea tu primera UI spec

> Para: Diseñadores · Tiempo: 8 min · Tipo: Tutorial

En este tutorial crearás una especificación UI para una pantalla real del proyecto TaskFlow. Al terminar, tendrás un documento que define layout, estados, interacciones y responsive de forma completa. El desarrollador podrá implementar tu diseño sin adivinar.

---

## Lo que necesitas antes de empezar

- Un editor de texto o VSCode abierto en `/mnt/c/workspaces/taskflow`.
- Familiaridad básica con Markdown.
- 8 minutos de tiempo ininterrumpido.

---

## Contexto del ejercicio

Vas a documentar la pantalla de **configuración de Miembros** para un Proyecto. Esta pantalla permite al usuario añadir entre 3 y 6 "participantes generados por IA" generados por IA que participarán en las sprints del método de análisis.

El Use Case ya existe: `UC-002-Configurar-Miembros.md`. Lo usarás como fuente de contexto.

---

## Paso 1: Lee el Use Case relacionado

Abre y lee el archivo completo:

```bash
specs/02-behavior/use-cases/UC-002-Configurar-Miembros.md
```

Busca estos elementos mientras lees:

- **Flujo Principal**: cada paso puede requerir una interacción o vista.
- **Excepciones**: cada excepción requiere un estado visual (error, validación, carga).
- **Mockup de Referencia**: wireframe ASCII que ya documenta la vista.

**Qué aprendes del UC**:
- El usuario necesita añadir entre 3 y 6 Miembros.
- Hay dos formas de añadir: manual o con IA.
- Si hay menos de 3 miembros, el botón "Iniciar Sprints" está deshabilitado.
- El usuario puede editar y eliminar miembros mientras el proyecto esté en `borrador` o `preparado`.

---

## Paso 2: Copia el template de UI view

Copia el template correspondiente a una nueva ubicación:

```bash
cp kdd/templates/ui-view.template.md specs/03-experience/proyectos/UI-ConfigurarMiembros.md
```

Abre el archivo recién creado: `specs/03-experience/proyectos/UI-ConfigurarMiembros.md`.

---

## Paso 3: Completa el frontmatter

Reemplaza el frontmatter del template con esta información:

```yaml
---
kind: ui-view
status: draft
links:
  entities:
    - "[[Proyecto]]"
    - "[[Miembro]]"
  use-cases:
    - "[[UC-002-Configurar-Miembros]]"
  commands:
    - "[[CMD-005-CreateMiembro]]"
    - "[[CMD-006-UpdateMiembro]]"
    - "[[CMD-007-DeleteMiembro]]"
    - "[[CMD-008-GenerateMiembrosWithAI]]"
  components:
    - "[[UI-MiembroCard]]"
---
```

**Por qué estos enlaces**:
- **Entities**: Las entidades de dominio que se muestran (Proyecto, Miembro).
- **Use-cases**: El caso de uso que esta vista implementa.
- **Commands**: Las operaciones que el usuario puede ejecutar desde esta vista.
- **Components**: Los componentes reutilizables que esta vista usa.

---

## Paso 4: Define propósito y navegación

Reemplaza las secciones `## Propósito` y `## Navegación` con:

```markdown
# Configurar Miembros

## Propósito

Permite al Usuario añadir, editar y eliminar los Miembros que participarán en las sprints del Proyecto. El Usuario debe configurar entre 3 y 6 miembros para que el Proyecto esté preparado e iniciar las sprints.

## Navegación

- **Ruta**: `/proyectos/:proyectoId/configurar`
- **Llega desde**:
  - [[UI-CrearProyecto]] tras crear un proyecto nuevo
  - Dashboard (botón "Configurar" en un proyecto en estado `borrador`)
- **Sale hacia**:
  - [[UI-IniciarSprints]] al hacer clic en "Iniciar Sprints" (si tiene 3-6 miembros)
  - Dashboard al hacer clic en "Guardar y salir"
```

**Resultado visible**: Ya sabes el propósito de la pantalla y cómo se navega hacia/desde ella.

---

## Paso 5: Documenta el layout principal

Copia el wireframe del UC-002 (sección "Mockup de Referencia") a tu spec. Pégalo en la sección `## Layout`:

```markdown
## Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Volver al Dashboard          CONFIGURAR PROYECTO                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📋 PROYECTO                                                    [✏️] │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ¿Cómo mejorar la retención de usuarios?                   │  │
│  │                                                            │  │
│  │ Explorar estrategias para reducir el churn en nuestra     │  │
│  │ aplicación móvil y aumentar el engagement.                │  │
│  │                                                            │  │
│  │ 📎 App móvil B2C, 50k usuarios, churn 8% mensual          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  👥 MIEMBROS                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ████████████████████████████████████████  3 miembros ✓  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ 👤              │ │ 👤              │ │ 👤              │   │
│  │ María García    │ │ Carlos Ruiz     │ │ Ana Martínez    │   │
│  │ ─────────────── │ │ ─────────────── │ │ ─────────────── │   │
│  │ CTO, 45 años    │ │ Usuario, 28 años│ │ PM, 35 años     │   │
│  │ Analítica       │ │ Pragmático      │ │ Estratégica     │   │
│  │                 │ │                 │ │                 │   │
│  │ [✏️] [🗑️]       │ │ [✏️] [🗑️]       │ │ [✏️] [🗑️]       │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                  │
│  ┌─────────────────┐                                            │
│  │                 │                                            │
│  │    ➕ Añadir    │     ✓ Mínimo alcanzado (puedes añadir    │
│  │     Miembro    │       hasta 3 más)                        │
│  │                 │                                            │
│  └─────────────────┘                                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  🤖 Generar más miembros con IA (hasta 6 total)          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Guardar y salir]                         [Iniciar Sprints →]   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Responsive

| Breakpoint | Cambios |
|------------|---------|
| Desktop (>1024px) | Grid de 3 columnas para miembros, sidebar visible |
| Tablet (768-1024px) | Grid de 2 columnas, sidebar colapsable |
| Mobile (<768px) | Stack vertical, tarjetas ocupan 100% ancho |
```

**Resultado visible**: El diseño principal está documentado con proporciones y estructura clara.

---

## Paso 6: Documenta los componentes

Reemplaza la sección `## Componentes` con:

```markdown
## Componentes

| Zona | Componente | Propósito |
|------|------------|-----------|
| Header | Resumen del Proyecto | Muestra título, descripción y contexto del proyecto |
| Grid de miembros | [[UI-MiembroCard]] (3-6 instancias) | Cada tarjeta muestra un Miembro |
| Barra de progreso | Indicador personalizado | Muestra cuántos miembros configurados / mínimo requerido |
| Botones de acción | Botones estándar | Añadir, generar con IA, guardar, iniciar sprints |
```

---

## Paso 7: Documenta los datos que necesita la vista

Reemplaza la sección `## Datos` con:

```markdown
## Datos

| Dato | Fuente | Notas |
|------|--------|-------|
| proyecto | `GET /api/proyectos/:id` | Incluye título, descripción, contexto, estado |
| miembros | Incluidas en proyecto | Array de 0-6 Miembros |
| canEdit | Calculado en cliente | `proyecto.estado === 'borrador' || proyecto.estado === 'preparado'` |
```

**Resultado visible**: El desarrollador sabe exactamente qué llamadas de API hacer.

---

## Paso 8: Documenta los estados obligatorios

Esta es la parte más importante. Cada vista debe cubrir estos estados. Reemplaza la sección `## Estados de la Vista` con:

```markdown
## Estados de la Vista

### Cargando (datos iniciales)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Volver             ░░░░░░░░░░░░░░░                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────┐                     │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │  ← Skeleton proyecto   │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │                     │
│  └────────────────────────────────────────┘                     │
│                                                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐                                    │
│  │░░░░░░│ │░░░░░░│ │░░░░░░│  ← Skeleton miembros               │
│  └──────┘ └──────┘ └──────┘                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Vacío (sin miembros configurados)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Volver al Dashboard          CONFIGURAR PROYECTO                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📋 PROYECTO                                                         │
│  [Resumen del proyecto aquí...]                                     │
│                                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  👥 MIEMBROS                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                  │
│                     👥                                           │
│                                                                  │
│           Sin miembros configurados aún                         │
│                                                                  │
│    Necesitas entre 3 y 6 miembros para iniciar las sprints      │
│                                                                  │
│                  [➕ Añadir Miembro]                             │
│                                                                  │
│              [🤖 Generar 3 miembros con IA]                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Error (al cargar el proyecto)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Volver al Dashboard                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│                      ⚠️ Error al cargar                         │
│                                                                  │
│              No pudimos obtener los datos del proyecto              │
│                                                                  │
│                      [Reintentar]                               │
│                                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Parcial (< 3 miembros)

Layout normal, pero:
- Barra de progreso muestra "N/3 miembros" en naranja
- Mensaje de advertencia: "⚠️ Añade al menos N miembros más para iniciar sprints"
- Botón "Iniciar Sprints" deshabilitado (gris, sin hover)

### Éxito (3-6 miembros configuradas)

Layout principal documentado en sección "Layout" arriba.
- Barra de progreso verde con ✓
- Botón "Iniciar Sprints" habilitado (azul, hover activo)
```

**Resultado visible**: Cada estado tiene su wireframe. El desarrollador sabe exactamente qué renderizar en cada caso.

---

## Paso 9: Documenta las interacciones principales

Reemplaza la sección `## Comportamiento` con:

```markdown
## Comportamiento

### Al cargar

1. Mostrar skeleton (estado "Cargando")
2. Fetch `GET /api/proyectos/:id` con miembros incluidos
3. Si error → estado "Error" con botón "Reintentar"
4. Si OK y 0 miembros → estado "Vacío"
5. Si OK y 1-2 miembros → estado "Parcial"
6. Si OK y 3-6 miembros → estado "Éxito"

### Acciones principales

| Acción | Comando | Feedback éxito | Feedback error |
|--------|---------|----------------|----------------|
| Click "Añadir Miembro" | Abre modal (sin comando aún) | — | — |
| Click "Generar con IA" en modal | [[CMD-008-GenerateMiembrosWithAI]] | Preview de miembro + botones "Regenerar", "Editar", "Aceptar" | Toast: "No se pudo generar el miembro. [Reintentar]" |
| Click "Aceptar" en preview | [[CMD-005-CreateMiembro]] | Nueva tarjeta aparece en grid, contador actualizado | Toast: mensaje del error |
| Click "Editar" en [[UI-MiembroCard]] | Abre modal con formulario pre-rellenado | — | — |
| Click "Guardar cambios" en modal editar | [[CMD-006-UpdateMiembro]] | Tarjeta actualizada en grid | Toast: mensaje del error |
| Click "Eliminar" en [[UI-MiembroCard]] | Confirmación + [[CMD-007-DeleteMiembro]] | Tarjeta desaparece, contador actualizado, si < 3 → advertencia visible | Toast: mensaje del error |
| Click "Iniciar Sprints" | Navegación a [[UI-IniciarSprints]] | — | — |
| Click "Guardar y salir" | Navegación a Dashboard | — | — |

### Validaciones

| Condición | Resultado |
|-----------|-----------|
| Intentar iniciar sprints con < 3 miembros | Botón deshabilitado (no clickable) |
| Intentar añadir miembro #7 | Botón "Añadir Miembro" oculto |
| Proyecto en estado `en_analisis` o `terminado` | Botones "Editar" y "Eliminar" ocultos en todas las tarjetas |
```

---

## Paso 10: Documenta accesibilidad

Añade al final del documento:

```markdown
## Accesibilidad

- **Navegación por teclado**:
  - Tab para moverse entre tarjetas y botones
  - Enter para abrir modales y confirmar acciones
  - Esc para cerrar modales
- **Foco visible**: Borde azul de 2px en el elemento activo
- **ARIA labels**:
  - Botón "Editar" tiene `aria-label="Editar a [Nombre]"`
  - Botón "Eliminar" tiene `aria-label="Eliminar a [Nombre]"`
  - Modal confirmación tiene `role="dialog"` y `aria-labelledby` apuntando al título
- **Anuncios para lectores de pantalla**:
  - Al añadir miembro: "Miembro [Nombre] añadida. Total: N miembros."
  - Al eliminar miembro: "Miembro [Nombre] eliminada. Total: N miembros."
  - Al alcanzar 3 miembros: "Proyecto preparado. Ya puedes iniciar las sprints."
  - Errores: `role="alert"` en mensajes de error

## Conexiones

- **Implementa**: [[UC-002-Configurar-Miembros]]
- **Usa componentes**: [[UI-MiembroCard]]
- **Ejecuta comandos**: [[CMD-005-CreateMiembro]], [[CMD-006-UpdateMiembro]], [[CMD-007-DeleteMiembro]], [[CMD-008-GenerateMiembrosWithAI]]
```

---

## Paso 11: Guarda y verifica

Guarda el archivo. Tu spec está completa.

Verifica que incluye:

- ✅ Frontmatter con `kind`, `status` y enlaces
- ✅ Propósito y navegación
- ✅ Layout principal con wireframe ASCII
- ✅ Responsive (breakpoints documentados)
- ✅ Componentes usados
- ✅ Datos requeridos (queries)
- ✅ Estados: Cargando, Vacío, Error, Parcial, Éxito
- ✅ Interacciones (tabla de acciones + comandos)
- ✅ Validaciones
- ✅ Accesibilidad
- ✅ Conexiones con UC, comandos, componentes

**Resultado final**: Tienes una UI spec completa, sin ambigüedad, que un desarrollador puede implementar directamente.

---

## Lo que construiste

Creaste una especificación UI profesional para una pantalla compleja que:

1. **Conecta con el dominio**: Enlaza con entidades, use cases y comandos. No está aislada.
2. **Cubre todos los estados**: Cargando, vacío, error, parcial, éxito. Ningún caso queda sin documentar.
3. **Define interacciones claras**: Cada acción del usuario tiene su comando, feedback de éxito y feedback de error.
4. **Es accesible**: Navegación por teclado, ARIA labels, anuncios para lectores de pantalla.
5. **Es responsive**: Documenta qué cambia en cada breakpoint.

Esta spec vive en el repositorio, versiona con el código, y sirve como **fuente de verdad** del diseño. Si el diseño cambia, actualizas la spec. Si la implementación no coincide con la spec, es un bug.

---

## Siguientes pasos

1. **Crea specs para tus propias pantallas** siguiendo este mismo proceso.
2. **Lee la Guía KDD para Diseñadores** (`kdd/docs/guides/designer.md`) para más contexto.
3. **Consulta la referencia de artefactos** (`kdd/docs/reference/artifacts.md`) cuando tengas dudas sobre frontmatter o secciones.
4. **Conecta con Figma**: Añade un enlace a tu diseño detallado en la sección "Layout" de la spec.

Cada pantalla que documentes reduce la ambigüedad y acelera la implementación. Tu spec es código documentado antes de escribir la primera línea de TypeScript.
