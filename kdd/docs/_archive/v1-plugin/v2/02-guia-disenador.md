# Guía KDD para Diseñadores

> **Tiempo de lectura**: 8 minutos

## Lo que KDD hace por ti

Como diseñador, KDD te ayuda a:

- **Conocer el contexto**: Sabes qué problema resuelve cada pantalla
- **Documentar estados**: Loading, error, vacío... sin que se olviden
- **Conectar con el comportamiento**: Tu diseño sabe qué acciones dispara
- **Generar Storybook**: Tus specs se convierten en documentación visual

## Tu día a día con KDD

### Escenario 1: "Tengo que diseñar una nueva pantalla"

**Antes de KDD**:
- "¿Qué debería hacer esta pantalla?"
- "Diseño algo y luego pregunto"
- El dev implementa diferente a lo que diseñaste

**Con KDD**:

```
1. Lees el Use Case (UC) relacionado
   /specs/02-behavior/use-cases/UC-005-ComprarCreditos.md

   → Sabes exactamente el flujo y las excepciones

2. Creas la spec de la vista (UI)
   /specs/03-experience/views/UI-CompraCreditos.md

   → Documentas estados, interacciones, responsive

3. El dev implementa siguiendo TU spec
```

---

### Escenario 2: "¿Qué estados necesita esta pantalla?"

**Antes de KDD**:
- Solo diseñas el "happy path"
- El dev inventa el estado de error
- QA encuentra inconsistencias

**Con KDD**:

Cada vista tiene sección de **Estados** obligatoria:

```markdown
## Estados

### Loading
- Skeleton de la tabla
- Header visible con título

### Empty
- Ilustración de carpeta vacía
- "No tienes retos todavía"
- Botón "Crear mi primer reto"

### Error
- Icono de alerta
- "No pudimos cargar los datos"
- Botón "Reintentar"

### Success (Default)
- Lista de retos con datos
```

---

### Escenario 3: "¿Qué pasa cuando el usuario hace click aquí?"

**Antes de KDD**:
- "Supongo que va a otra pantalla"
- El dev decide sobre la marcha
- El PM se sorprende en el demo

**Con KDD**:

Cada interacción está documentada:

```markdown
## Interacciones

### Click en [Guardar]
- **Trigger**: Click en botón
- **Comando**: CMD-002-UpdateChallenge
- **Feedback durante**: Spinner + botón deshabilitado
- **Feedback éxito**: Toast "Cambios guardados"
- **Feedback error**: Toast con mensaje del error

### Click en [Siguiente]
- **Trigger**: Click en botón
- **Navega a**: UI-ConfigurarPersonas
```

---

## Los artefactos que usarás

### 1. UI Views - "¿Cómo se ve cada pantalla?"

```
/specs/03-experience/views/UI-*.md
```

Este es TU artefacto principal. Aquí documentas cada pantalla o componente.

**Estructura de una View**:

```markdown
---
id: UI-CompraCreditos
kind: ui-view
title: Comprar Créditos
route: /creditos/comprar
status: draft
---

# UI-CompraCreditos

## Contexto
| Elemento | Valor |
|----------|-------|
| Ruta | `/creditos/comprar` |
| Acceso | Usuario autenticado |
| Use Case | [[UC-005-ComprarCreditos]] |

## Queries Consumidas
- [[QRY-006-GetCreditBalance]] - Balance actual
- [[QRY-007-GetCreditPackages]] - Paquetes disponibles

## Commands Invocados
- [[CMD-010-PurchaseCredits]] - Al confirmar compra

## Layout

(Tu wireframe aquí - ASCII, imagen, o link a Figma)

## Estados
(Loading, Empty, Error, Success)

## Interacciones
(Cada acción del usuario documentada)

## Responsive
(Cambios por breakpoint)

## Accesibilidad
(Focus, keyboard, ARIA)
```

---

### 2. Use Cases (UC) - Tu contexto

Antes de diseñar, **siempre** lee el UC relacionado:

```
/specs/02-behavior/use-cases/UC-*.md
```

El UC te dice:
- Qué quiere lograr el usuario
- El flujo paso a paso
- Qué puede salir mal (excepciones)
- Qué comandos y queries se usan

**Ejemplo**:

```markdown
# UC-005: Comprar Créditos

## Flujo Principal
1. Usuario accede a "Comprar créditos"     ← Necesitas diseñar esto
2. Sistema muestra balance actual          ← Query: QRY-006
3. Sistema muestra paquetes disponibles    ← Query: QRY-007
4. Usuario selecciona un paquete           ← Interacción
5. Sistema muestra checkout                ← Nueva vista o modal?
6. Usuario confirma compra                 ← Command: CMD-010
7. Sistema muestra confirmación            ← Estado success

## Excepciones
- E1: Pago rechazado                       ← Diseña este estado
- E2: Límite diario alcanzado              ← Y este también
```

---

### 3. Business Rules (BR/BP) - Las restricciones

```
/specs/01-domain/rules/BR-*.md
```

Las reglas te dicen **qué validaciones** existen:

- `BR-RETO-001`: "El título debe tener entre 1 y 100 caracteres"
  → Tu input tiene maxLength de 100 y muestra contador

- `BP-CREDITO-002`: "Mínimo de compra: 10 créditos"
  → El paquete mínimo es de 10

---

## Wireframes en specs

Puedes incluir wireframes de varias formas:

### Opción A: ASCII (rápido, vive con el código)

```
┌──────────────────────────────────────────┐
│  HEADER                                  │
│  ← Volver    Comprar Créditos            │
├──────────────────────────────────────────┤
│                                          │
│  Balance actual: 45 créditos             │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  PAQUETE BÁSICO                    │  │
│  │  10 créditos - $9.99               │  │
│  │  [Seleccionar]                     │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  PAQUETE POPULAR ⭐                │  │
│  │  50 créditos - $39.99 (20% off)    │  │
│  │  [Seleccionar]                     │  │
│  └────────────────────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘
```

### Opción B: Link a Figma

```markdown
## Layout

**Figma**: [Ver diseño](https://figma.com/file/xxx)

**Descripción**:
- Header con navegación back
- Card de balance actual
- Grid de 3 columnas con paquetes
- Paquete "popular" destacado
```

### Opción C: Imagen embedida

```markdown
## Layout

![Wireframe Compra Créditos](./images/ui-compra-creditos.png)
```

---

## Estados: la checklist obligatoria

Cada vista debe cubrir estos estados (los que apliquen):

| Estado | Cuándo | Qué diseñar |
|--------|--------|-------------|
| **Loading** | Datos cargando | Skeleton, spinner |
| **Empty** | Sin datos que mostrar | Ilustración + CTA |
| **Error** | Algo falló | Mensaje + retry |
| **Success** | Estado normal | El diseño principal |
| **Partial** | Carga incompleta | Skeleton parcial |

**Tip**: Si no aplica un estado, documéntalo explícitamente:

```markdown
## Estados

### Loading
Skeleton de cards

### Empty
N/A - Siempre hay al menos un paquete disponible

### Error
Toast con mensaje "No pudimos cargar los paquetes"
+ Botón "Reintentar"

### Success
Layout con paquetes (ver wireframe)
```

---

## Responsive: documenta los breakpoints

```markdown
## Responsive

| Breakpoint | Cambios |
|------------|---------|
| Desktop (>1024px) | Grid de 3 columnas, sidebar visible |
| Tablet (768-1024px) | Grid de 2 columnas, sidebar colapsable |
| Mobile (<768px) | Stack vertical, menú hamburguesa |
```

---

## Flujo de trabajo recomendado

### Diseñando una nueva pantalla

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. LEE el Use Case (UC)                                    │
│     → Entiendes el contexto y flujo                        │
│                                                             │
│  2. REVISA las Business Rules (BR/BP)                       │
│     → Conoces las restricciones                            │
│                                                             │
│  3. CREA la spec de la vista (UI-xxx.md)                   │
│     → Documenta layout, estados, interacciones             │
│                                                             │
│  4. DISEÑA en Figma                                         │
│     → Referencia la spec para contexto                     │
│                                                             │
│  5. ACTUALIZA la spec con link a Figma                     │
│     → Todo en un solo lugar                                │
│                                                             │
│  6. PR para review                                          │
│     → PM y Dev pueden comentar                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Storybook automático

Las specs de UI se pueden usar para generar stories de Storybook.

Cada **estado** que documentes se convierte en una story:

```
UI-CompraCreditos.md
└── Estados
    ├── Loading    →  CompraCreditos.stories.tsx → Loading
    ├── Error      →  CompraCreditos.stories.tsx → Error
    └── Success    →  CompraCreditos.stories.tsx → Default
```

**Beneficio**: Tu documentación se convierte en demos interactivos.

---

## Preguntas frecuentes

### ¿Tengo que escribir la spec ANTES de diseñar?

No necesariamente. El flujo puede ser:

1. **Spec primero**: Lees UC → escribes UI-xxx → diseñas
2. **Diseño primero**: Diseñas → documentas en UI-xxx

Lo importante es que al final exista la spec actualizada.

### ¿Qué pasa si el UC no existe?

Pídelo al PM. Un diseño sin contexto de comportamiento es riesgoso.

Si es urgente, crea un UC borrador tú mismo para alinear.

### ¿Dónde documento un componente reutilizable?

En el mismo lugar, pero con `kind: ui-component`:

```markdown
---
id: UI-CreditBalance
kind: ui-component
title: Indicador de Balance de Créditos
status: draft
---
```

Los componentes no tienen `route` (no son páginas).

### ¿Cómo conecto mi diseño con los mensajes de error?

Los errores están documentados en los Commands:

```
/specs/02-behavior/commands/CMD-010-PurchaseCredits.md

## Errores Posibles
| Código | Mensaje |
|--------|---------|
| CREDIT-001 | "Fondos insuficientes" |
| CREDIT-002 | "Límite diario alcanzado" |
```

Usa exactamente esos mensajes en tu diseño.

---

## Siguiente paso

1. **Abre** un Use Case existente en `/specs/02-behavior/use-cases/`
2. **Lee** cómo está documentado el flujo
3. **Revisa** una UI existente en `/specs/03-experience/views/`
4. **Crea** tu primera spec para una pantalla que vayas a diseñar

---

*¿Dudas? Pregunta en #diseño o abre un issue.*
