# Guía KDD para Product Managers

> **Tiempo de lectura**: 8 minutos

## Lo que KDD hace por ti

Como PM, tu trabajo es definir **qué construimos y por qué**. KDD te da un sistema donde:

- Tus requisitos tienen un lugar fijo y siempre actualizado
- Puedes rastrear cualquier decisión hasta su origen
- Sabes exactamente qué hay en cada release
- El equipo habla el mismo idioma

## Tu día a día con KDD

### Escenario 1: "Tengo una idea para una nueva feature"

**Antes de KDD**:
- Escribes un doc de Google
- Lo compartes en Slack
- Nadie sabe dónde quedó
- 3 versiones diferentes flotando

**Con KDD**:

```
1. Creas un Objective (OBJ)
   /specs/00-requirements/objectives/OBJ-012-NuevaFeature.md

2. El equipo lo revisa en el PR

3. Una vez aprobado, es LA fuente de verdad
```

**Ejemplo de Objective**:

```markdown
---
id: OBJ-012
kind: objective
title: Exportar análisis a PDF
actor: Usuario
status: draft
---

# OBJ-012: Exportar análisis a PDF

## Actor
Usuario que ha completado una sesión de análisis

## Objetivo
Como Usuario, quiero exportar mi análisis final a PDF,
para poder compartirlo con stakeholders que no usan la app.

## Criterios de éxito
- Puedo descargar un PDF desde la pantalla de análisis
- El PDF incluye todas las contribuciones organizadas por sombrero
- El formato es profesional y se puede imprimir
```

---

### Escenario 2: "¿Por qué el sistema hace X?"

**Antes de KDD**:
- "Pregúntale a Juan, él lo construyó"
- Juan ya no está en la empresa
- Nadie sabe

**Con KDD**:

```
Buscas en /specs/01-domain/rules/ la regla de negocio

Encontrarás algo como:
BP-CREDITO-003: Límite diario de compras
"Un usuario no puede comprar más de 100 créditos al día"

## Por qué existe
Prevenir fraude con tarjetas robadas
```

---

### Escenario 3: "¿Qué va en el próximo release?"

**Antes de KDD**:
- Spreadsheet desactualizado
- "Creo que iba esto otro también..."
- Sorpresas en el demo

**Con KDD**:

```
Creas un Release Plan (REL)
/specs/00-requirements/releases/REL-003-v1.2.md
```

**Ejemplo de Release**:

```markdown
---
id: REL-003
kind: release
title: v1.2 - Exportaciones
status: draft
target_date: 2025-02-15
---

# REL-003: v1.2 - Exportaciones

## Objetivo
Permitir que los usuarios compartan sus análisis fuera de la app.

## Lo que incluye
- [[OBJ-012-ExportarPDF]]
- [[OBJ-013-CompartirLink]]

## Lo que NO incluye (siguiente release)
- Exportar a PowerPoint
- Integración con Notion

## Dependencias
- Diseño de PDF aprobado por marketing
- [[ADR-0015-LibreriaPDF]] decidido

## Criterios de salida
- Todos los OBJ en status "approved"
- Tests de aceptación pasando
- QA sign-off
```

---

## Los artefactos que usarás más

### 1. Objectives (OBJ) - "¿Qué quiere el usuario?"

```
/specs/00-requirements/objectives/OBJ-001-*.md
```

| Campo | Qué poner |
|-------|-----------|
| Actor | Quién tiene esta necesidad |
| Objetivo | "Como X, quiero Y, para Z" |
| Criterios de éxito | Cómo sabe el usuario que lo logró |

**Tip**: Un OBJ es como una User Story de alto nivel. No es una tarea técnica.

---

### 2. Use Cases (UC) - "¿Cómo funciona el flujo?"

```
/specs/02-behavior/use-cases/UC-001-*.md
```

| Campo | Qué poner |
|-------|-----------|
| Actor | Quién ejecuta el caso |
| Flujo principal | Pasos del camino feliz |
| Excepciones | Qué pasa si algo falla |

**Tip**: El UC describe la interacción usuario-sistema sin hablar de tecnología.

**Ejemplo resumido**:

```markdown
# UC-005: Comprar Créditos

## Flujo Principal
1. Usuario accede a "Comprar créditos"
2. Sistema muestra opciones de paquetes
3. Usuario selecciona un paquete
4. Usuario ingresa datos de pago
5. Sistema procesa el pago
6. Sistema añade créditos a la cuenta
7. Sistema muestra confirmación

## Excepciones
- E1: Pago rechazado → Mostrar error, volver al paso 4
- E2: Créditos ya comprados hoy (límite) → Mostrar mensaje
```

---

### 3. Business Rules y Policies - "¿Por qué funciona así?"

| Tipo | Ubicación | Cuándo usar |
|------|-----------|-------------|
| **BR** (Business Rule) | `/specs/01-domain/rules/` | Restricción estructural invariable. "Un reto debe tener título" |
| **BP** (Business Policy) | `/specs/02-behavior/policies/` | Comportamiento configurable. "El precio de un crédito es $0.99" |

**Tip**: Si alguien pregunta "¿por qué?" y la respuesta es de negocio, debería existir una BR o BP.

---

### 4. ADRs - "¿Por qué decidimos esto?"

```
/specs/00-requirements/decisions/ADR-*.md
```

Documenta decisiones importantes que alguien podría cuestionar en el futuro:

- ¿Por qué usamos créditos en vez de suscripción?
- ¿Por qué limitamos a 6 personas sintéticas?
- ¿Por qué no soportamos colaboración en tiempo real?

**Ejemplo resumido**:

```markdown
# ADR-0005: Modelo de créditos en vez de suscripción

## Contexto
Necesitamos monetizar. Opciones: suscripción mensual o pago por uso.

## Decisión
Créditos (pago por uso)

## Por qué
- Menor fricción para usuarios ocasionales
- Más justo: pagas lo que usas
- Permite promociones y trials

## Consecuencias
- Más complejo de implementar
- Hay que comunicar bien el valor de un crédito
```

---

## Flujo de trabajo recomendado

### Nueva feature (de idea a release)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. IDEA                                                    │
│     └── Creas OBJ-xxx con status: draft                    │
│                                                             │
│  2. REFINAMIENTO                                            │
│     └── Creas UC-xxx para el flujo                         │
│     └── Identificas BR/BP necesarias                       │
│                                                             │
│  3. DISEÑO                                                  │
│     └── Diseñador crea UI-xxx                              │
│                                                             │
│  4. PLANIFICACIÓN                                           │
│     └── Añades a REL-xxx (release)                         │
│                                                             │
│  5. IMPLEMENTACIÓN                                          │
│     └── Dev implementa basándose en los specs              │
│                                                             │
│  6. VERIFICACIÓN                                            │
│     └── QA verifica contra los criterios del UC            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Cambio en requisito existente

```
1. Busca el OBJ o UC que hay que cambiar
2. Edítalo (crea PR si usas Git)
3. El cambio se propaga: todos ven la versión actualizada
```

---

## Preguntas frecuentes

### ¿Tengo que escribir TODO esto para cada feature?

No. El nivel de detalle depende del riesgo:

| Feature | Documentación mínima |
|---------|----------------------|
| **Crítica** (pagos, seguridad) | OBJ + UC + BR + UI + REQ completos |
| **Normal** | OBJ + UC + UI básica |
| **Pequeña** | OBJ suficiente, o directo al UC |

### ¿Puedo escribir en español?

Sí. El contenido narrativo va en español. Solo los IDs y términos técnicos van en inglés:

```markdown
# UC-005: Comprar Créditos    ← ID en inglés, título en español

## Flujo Principal            ← Todo en español
1. El Usuario accede a...
```

### ¿Qué pasa si no sé cómo clasificar algo?

Si dudas entre OBJ y UC:
- **OBJ**: Lo que quiere lograr el usuario (el "qué")
- **UC**: Cómo lo logra paso a paso (el "cómo")

Si dudas entre BR y BP:
- **BR**: ¿Puede cambiar sin reconstruir el sistema? No → BR
- **BP**: ¿Es un parámetro de negocio que podría variar? Sí → BP

### ¿Dónde escribo los criterios de aceptación?

Directamente en el UC, sección "Flujo Principal" y "Excepciones". Si necesitas más detalle, crea un REQ-xxx en `/specs/04-verification/criteria/`.

---

## Siguiente paso

1. **Abre** `/specs/00-requirements/` en tu editor
2. **Lee** un OBJ y un UC existentes
3. **Crea** tu primer OBJ para una feature pendiente

---

*¿Dudas? Pregunta en #producto o abre un issue.*
