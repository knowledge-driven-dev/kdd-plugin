---
title: "Guía KDD para Diseñadores"
audience: [designer]
type: how-to
reading_time: "10 min"
status: draft
---

# Guía KDD para Diseñadores

> Para: Diseñadores UX/UI · Tiempo: 10 min · Tipo: How-to

Esta guía te enseña a usar KDD para diseñar con contexto. Al terminar, sabrás qué especificaciones leer antes de diseñar, cómo documentar tus diseños para que otros los implementen sin ambigüedad, y cómo asegurar que ningún estado visual quede sin documentar.

---

## Qué KDD hace por ti

KDD conecta tu trabajo de diseño con el comportamiento del sistema. Tu diseño no vive aislado en Figma. Vive en especificaciones que enlazan con casos de uso, reglas de negocio y comandos. Esto significa que:

- Diseñas con contexto: sabes qué problema resuelve cada pantalla.
- Documentas todos los estados: carga, error, vacío, éxito.
- El desarrollador implementa siguiendo tu spec, no inventando sobre la marcha.
- QA puede verificar que el diseño implementado coincide con lo especificado.

---

## Los artefactos que usas

Como diseñador, trabajas principalmente con tres tipos de especificaciones: **UI specs**, **Use Cases** y **Business Rules**. Aquí está el rol de cada uno.

### UI specs: tu artefacto principal

Las **UI specs** documentan pantallas completas (kind: `ui-view`) o componentes reutilizables (kind: `ui-component`). Viven en `specs/03-experience/`.

Una UI spec incluye:

- **Contexto**: a qué caso de uso responde, qué ruta tiene, quién accede.
- **Layout**: wireframe o enlace a Figma.
- **Estados**: carga, error, vacío, éxito.
- **Interacciones**: qué ocurre al hacer click, hover, submit.
- **Responsive**: cómo cambia el layout en distintos breakpoints.
- **Accesibilidad**: navegación por teclado, ARIA labels, foco visible.

Ejemplo del proyecto TaskFlow:

```
specs/03-experience/proyectos/UI-MiembroCard.md       (componente)
specs/03-experience/creditos/UI-CreditBalanceIndicator.md  (componente)
```

### Use Cases: tu fuente de contexto

Los **Use Cases (UC)** describen el flujo completo de usuario-sistema para lograr un objetivo. Viven en `specs/02-behavior/use-cases/`.

Antes de diseñar una pantalla, lee el UC relacionado. Te dice:

- Qué quiere lograr el usuario (el "por qué" de tu diseño).
- El flujo paso a paso (cada paso puede requerir una vista o interacción).
- Qué puede salir mal (cada excepción requiere un estado visual).
- Qué comandos y queries se ejecutan (te dicen qué datos cargar y qué acciones existen).

### Business Rules: las restricciones

Las **Business Rules (BR)** documentan reglas invariables del dominio. Viven en `specs/01-domain/rules/`.

Las BR definen validaciones que tu diseño debe reflejar:

- `BR-PROYECTO-001`: "El título debe tener entre 1 y 100 caracteres" → tu input tiene maxLength de 100 y muestra contador.
- `BR-PROYECTO-005`: "Un Proyecto terminado es inmutable" → tus botones de edición se ocultan o deshabilitan en estado terminado.

---

## Flujo de trabajo recomendado

Usa este flujo cuando diseñas una nueva pantalla o componente.

### 1. Lee el Use Case relacionado

Abre el UC que describe el flujo que tu pantalla implementa.

```
specs/02-behavior/use-cases/UC-002-Configurar-Miembros.md
```

Busca:

- **Flujo Principal**: cada paso puede requerir una pantalla, modal o interacción.
- **Excepciones**: cada excepción requiere un estado visual (error, validación).
- **Postcondiciones**: qué confirma el sistema al terminar (mensaje de éxito, navegación).

**Ejemplo**: Si el UC dice "El Usuario selecciona entre 3-6 Miembros", tu diseño debe permitir agregar hasta 6 miembros y mostrar error si el usuario intenta agregar la séptima.

### 2. Revisa las Business Rules relevantes

Busca reglas que afecten validaciones, límites o comportamientos en tu pantalla.

```
specs/01-domain/rules/BR-PROYECTO-005.md    (transición a terminado)
```

Cada regla te dice qué restricciones visualizar en la UI. Usa los mensajes de error documentados en las reglas, no inventes texto.

### 3. Crea la spec de tu vista o componente

Copia el template correspondiente:

```bash
kdd/templates/ui-view.template.md       # Para pantallas
kdd/templates/ui-component.template.md  # Para componentes reutilizables
```

Renombra el archivo siguiendo la convención:

```
UI-NombreDescriptivo.md
```

Ejemplos reales del proyecto:

```
UI-MiembroCard.md
UI-CreditBalanceIndicator.md
UI-ProyectoHeader.md
```

### 4. Completa el frontmatter

El frontmatter conecta tu spec con el resto del sistema.

```yaml
---
kind: ui-component              # o ui-view para páginas
status: draft
links:
  entities:
    - "[[Miembro]]"   # Entidades mostradas
  use-cases:
    - "[[UC-002-Configurar-Miembros]]"  # Caso de uso implementado
  commands:
    - "[[CMD-006-UpdateMiembro]]"   # Acciones disponibles
---
```

### 5. Documenta el layout

Incluye un wireframe ASCII, una imagen exportada o un enlace a Figma.

**Opción A: ASCII wireframe** (vive con el código, versiona bien)

```
## Estructura

┌─────────────────────────────────────┐
│  ┌───┐                              │
│  │MG │  ← Avatar (iniciales)        │
│  └───┘                              │
│                                     │
│  María García                       │
│  ───────────────                    │
│  CTO, 45 años                       │
│                                     │
│  Analítica, orientada a datos...    │
│                                     │
│  [✏️ Editar]  [🗑️ Eliminar]        │
└─────────────────────────────────────┘
```

**Opción B: Enlace a Figma**

```markdown
## Layout

**Figma**: [Ver diseño completo](https://figma.com/file/abc123)

Descripción:
- Header con balance de puntos
- Grid de 3 columnas con paquetes disponibles
- Paquete "popular" destacado con badge
```

**Opción C: Imagen embedida**

```markdown
## Layout

![Wireframe de compra de puntos](./images/ui-creditos.png)
```

### 6. Documenta estados obligatorios

Cada vista debe cubrir estos estados (los que apliquen). Usa el checklist de la siguiente sección.

### 7. Documenta interacciones

Para cada acción del usuario, especifica:

- **Trigger**: qué dispara la acción (click, hover, submit).
- **Comando**: qué comando se ejecuta (enlaza con `[[CMD-xxx]]`).
- **Feedback durante**: spinner, botón deshabilitado, overlay.
- **Feedback éxito**: toast, mensaje, navegación.
- **Feedback error**: toast con mensaje del error.

Ejemplo real de MiembroCard:

```markdown
## Acciones

| Acción | Resultado | Navegación |
|--------|-----------|------------|
| Click "Editar" | Abre editor de miembro | → [[UI-MiembroForm]] |
| Click "Eliminar" | Confirmación + [[CMD-007-DeleteMiembro]] | — |
```

### 8. Documenta responsive y accesibilidad

Indica qué cambia en cada breakpoint y cómo se navega por teclado.

---

## Checklist de estados visuales

Cada vista debe documentar estos estados. Si un estado no aplica, documenta por qué.

| Estado | Cuándo | Qué diseñar | Obligatorio |
|--------|--------|-------------|-------------|
| **Loading** | Datos cargando desde API | Skeleton, spinner, mensaje "Cargando..." | Sí (si hay datos remotos) |
| **Empty** | No hay datos que mostrar | Ilustración + texto + CTA para crear | Sí (si puede haber 0 items) |
| **Error** | Fallo al cargar datos o ejecutar comando | Icono alerta + mensaje + botón "Reintentar" | Sí |
| **Success** | Estado normal con datos | El diseño principal | Siempre |
| **Partial** | Carga incompleta, algunos datos fallan | Skeleton parcial + advertencia | Si aplica |

**Ejemplo de estado documentado** (del proyecto TaskFlow):

```markdown
## Estados Funcionales

### Cargando (durante eliminación)

┌─────────────────────────────────────┐
│  ┌───┐                              │
│  │MG │     (opacity-50)             │
│  └───┘                              │
│  María García                       │
│                                     │
│       ◐ Eliminando...               │
│                                     │
└─────────────────────────────────────┘
```

**Si un estado no aplica, documéntalo explícitamente:**

```markdown
### Empty
N/A — Siempre hay al menos el mensaje de bienvenida.
```

---

## Responsive: documenta los breakpoints

No dejes que el desarrollador adivine. Especifica qué cambia en cada breakpoint.

```markdown
## Responsive

| Breakpoint | Cambios |
|------------|---------|
| Desktop (>1024px) | Grid de 3 columnas, sidebar visible |
| Tablet (768-1024px) | Grid de 2 columnas, sidebar colapsable |
| Mobile (<768px) | Stack vertical, menú hamburguesa |
```

---

## Accesibilidad: no es opcional

Documenta cómo se navega tu diseño con teclado y lector de pantalla.

```markdown
## Accesibilidad

- **Navegación por teclado**: Tab para moverse entre campos, Enter para submit, Esc para cerrar modal.
- **Foco visible**: Borde azul de 2px en el elemento activo.
- **ARIA labels**:
  - Botón "Eliminar" tiene `aria-label="Eliminar a María García"`.
  - Modal tiene `role="dialog"` y `aria-labelledby` apuntando al título.
- **Mensajes de error**: Anunciados con `role="alert"` para lectores de pantalla.
```

---

## Conectar con Figma

Tus specs viven en el repositorio. Tus diseños detallados viven en Figma. Conecta ambos con enlaces.

**En la spec:**

```markdown
## Layout

**Figma**: [Ver diseño completo](https://figma.com/file/abc123)
```

**En Figma**, referencia la spec en la descripción del frame:

```
Spec: specs/03-experience/proyectos/UI-MiembroCard.md
```

Beneficio: cualquier persona puede navegar en ambas direcciones (spec → Figma → spec).

---

## Preguntas frecuentes

### ¿Tengo que escribir la spec ANTES de diseñar en Figma?

No necesariamente. Puedes diseñar primero y documentar después, o documentar primero y diseñar después. Lo importante es que ambos existan y estén sincronizados.

Flujos válidos:

1. **Spec primero**: Lees UC → escribes UI spec → diseñas en Figma.
2. **Diseño primero**: Diseñas en Figma → documentas en UI spec.

Usa el flujo que te resulte más natural. Algunas personas piensan mejor escribiendo, otras dibujando.

### ¿Qué pasa si el Use Case no existe?

Pídelo al PM. Un diseño sin contexto de comportamiento es riesgoso: no sabes qué validar, qué estados manejar, ni qué comandos existen.

Si es urgente y el PM no tiene tiempo, crea un UC borrador tú mismo para alinear expectativas. Márcalo como `status: review` y notifica al PM.

### ¿Cómo documento un componente reutilizable vs una página?

Ambos usan archivos `UI-*.md`, pero diferente `kind`:

```yaml
# Página (tiene ruta, es un destino de navegación)
kind: ui-view
route: /dashboard

# Componente (reutilizable, sin ruta)
kind: ui-component
# sin campo route
```

Ejemplos del proyecto:

- `UI-MiembroCard.md`: componente reutilizable (kind: `ui-component`).
- `UI-ProyectoHeader.md`: componente reutilizable (kind: `ui-component`).
- `UI-AnalysisExport.md`: pantalla completa (kind: `ui-view`).

### ¿Dónde encuentro los mensajes de error que debo usar?

Los mensajes de error están documentados en los **Commands (CMD)**. Cada comando lista los errores posibles con código y mensaje exacto.

```
specs/02-behavior/commands/CMD-007-DeleteMiembro.md

## Errores Posibles
| Código | Condición | Mensaje |
|--------|-----------|---------|
| PERSONA-201 | No encontrada | "Persona not found" |
| PERSONA-202 | No es propietario | "You don't have permission" |
```

Usa exactamente esos mensajes en tu diseño. No inventes texto alternativo.

### ¿Qué hago si el UC no tiene todos los casos de error?

Dos opciones:

1. **Pide al PM que lo complete** (ideal). Abre un issue o comenta en el PR del UC.
2. **Añádelos tú mismo** y marca el UC como `status: review` para que el PM lo revise.

No diseñes en el vacío. Si descubres un caso que el UC no cubre, eso es conocimiento valioso: documéntalo.

---

## Herramientas de automatización

Estas herramientas aceleran tu trabajo con specs de UI desde Claude Code:

| Herramienta | Qué hace | Cómo invocar |
|---|---|---|
| `/ui` | Genera spec de UI conectada al dominio | Escribe `/ui` en Claude Code |
| `/generate-story` | Genera componente React + Storybook desde UI spec | `/generate-story` |
| `/sync-story` | Sincroniza componente con UI spec actualizada | `/sync-story` |
| `/kdd-author` | Asistente conversacional para crear specs | `/kdd-author` |
| `/list-entities` | Lista entidades del dominio con atributos | `/list-entities` |

**Ejemplo**: Escribe `/ui` y describe "Necesito una card para mostrar un Miembro con avatar, nombre y perfil". El skill genera la spec con estados, responsive y enlaces al dominio.

> **Ver**: [Catálogo completo de herramientas](../reference/tooling.md)

---

## Siguiente paso

1. Abre un **Use Case** existente en `specs/02-behavior/use-cases/`.
2. Lee cómo está documentado el flujo principal y las excepciones.
3. Abre una **UI spec** existente en `specs/03-experience/` (por ejemplo, `UI-MiembroCard.md`).
4. Observa cómo la UI spec enlaza con el UC y los comandos.
5. Crea tu primera spec para una pantalla que vayas a diseñar.

---

**Referencias útiles**:

- [Referencia de artefactos](../reference/artifacts.md): catálogo completo de tipos de especificaciones.
- [Cheatsheet](../reference/cheatsheet.md): resumen de una página de todo lo esencial.
- [Tutorial: crea tu primera UI spec](../tutorials/first-ui-spec.md): ejercicio guiado paso a paso.
