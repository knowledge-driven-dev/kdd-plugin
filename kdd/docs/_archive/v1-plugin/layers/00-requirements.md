# Capa 00: Requirements (Requisitos)

## El Fundamento de Todo: ¿Por Qué Existe Este Sistema?

---

## Introducción

La capa de Requirements es el **punto de partida** de toda especificación KDD. Responde a la pregunta más fundamental: **¿Por qué existe este sistema?**

Aquí no hablamos de código, ni de tecnología, ni siquiera de software. Hablamos de **problemas humanos**, de **contexto de negocio**, de **objetivos medibles**. Un sistema que no tiene claro su "por qué" es un sistema condenado a la deriva.

> **Nota importante**: Esta capa es el **INPUT** que alimenta al diseño. Puede mencionar conceptos de dominio para dar contexto, pero está fuera del flujo de dependencias entre capas.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   00-Requirements  →  01-Domain  →  02-Behavior     →  03-Experience        │
│                                                                              │
│   "¿POR QUÉ           "¿Qué          "¿Qué puede        "¿Cómo lo          │
│    EXISTE?"            existe?"        hacer?"             ven?"             │
│                                                                              │
│   ──────────────────────────────────────────────────────────────────────────│
│                                                                              │
│   MOTIVACIÓN          Conceptual     Funcional          Experiencial        │
│   CONTEXTO            (entidades)    (operaciones)      (vistas)            │
│   OBJETIVOS                                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## La Filosofía: El Problema Antes que la Solución

### Por Qué Esta Capa es Primera

En el desarrollo tradicional, es común saltar directamente al código. "Necesitamos una app que haga X" → empezamos a programar. Esto genera sistemas que:

- Resuelven problemas que nadie tiene
- No miden si están teniendo éxito
- Acumulan features sin dirección clara
- Son difíciles de justificar ante stakeholders

KDD invierte esto:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ENFOQUE TRADICIONAL              ENFOQUE KDD                              │
│   ───────────────────              ───────────                              │
│                                                                              │
│   "Hagamos una app"                "¿Qué problema resolvemos?"              │
│         ↓                                   ↓                               │
│   Empezar a codear                 "¿Para quién?"                           │
│         ↓                                   ↓                               │
│   "¿Qué debería hacer?"            "¿Cómo medimos éxito?"                   │
│         ↓                                   ↓                               │
│   Features sin fin                 PRD claro y acotado                      │
│         ↓                                   ↓                               │
│   "¿Esto era lo que querían?"      Dominio → Capacidades → Experience       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### El Problema como Ancla

Cuando las cosas se complican (y siempre se complican), la capa de Requirements es tu **ancla**:

- "¿Deberíamos añadir esta feature?" → ¿Resuelve el problema definido?
- "¿Esta arquitectura es correcta?" → ¿Cumple los objetivos de negocio?
- "¿Priorizamos X o Y?" → ¿Cuál acerca más a las métricas de éxito?

---

## Los Artefactos de la Capa de Requirements

### 1. PRD (Product Requirements Document)

El PRD es el documento central que define la visión del producto.

#### Estructura Recomendada

```markdown
# PRD: [Nombre del Producto]

## El Problema
¿Qué dolor o necesidad existe? ¿Por qué es importante resolverlo ahora?

## Usuarios Objetivo
¿Quiénes son? ¿Qué características tienen? ¿Cuántos son?

## Objetivos de Negocio
¿Qué queremos lograr como organización?

## Métricas de Éxito
¿Cómo sabremos que el producto funciona?

## Lo Que NO Es Este Producto
Límites claros para evitar scope creep.

## Restricciones
Técnicas, legales, de tiempo, de presupuesto.

## Stakeholders
¿Quiénes tienen interés en este producto?
```

#### Ejemplo: Six Hats App

```markdown
# PRD: Six Hats App

## El Problema

Los equipos de trabajo enfrentan decisiones complejas donde:
- Las perspectivas individuales dominan la discusión
- Las emociones se mezclan con los hechos
- No hay estructura para explorar alternativas
- Las conclusiones son sesgadas o incompletas

El Método de los Seis Sombreros de Edward de Bono ofrece una solución,
pero su aplicación manual es:
- Difícil de facilitar correctamente
- Limitada por la disponibilidad de participantes
- Inconsistente en la calidad de las aportaciones

## Usuarios Objetivo

**Primario**: Profesionales que toman decisiones estratégicas
- Product Managers definiendo roadmaps
- Emprendedores evaluando oportunidades
- Consultores analizando problemas de clientes
- Equipos de innovación explorando ideas

**Características**:
- Familiaridad básica con metodologías de pensamiento
- Disposición a pagar por herramientas de productividad
- Trabajan individualmente o en equipos pequeños

## Objetivos de Negocio

1. Validar que el concepto de "Personas Sintéticas" aporta valor
2. Conseguir 1,000 usuarios activos en 6 meses
3. Alcanzar MRR de $5,000 en 12 meses
4. Tasa de retención > 40% al mes 3

## Métricas de Éxito

| Métrica | Objetivo | Frecuencia |
|---------|----------|------------|
| Sesiones completadas | 5,000/mes | Mensual |
| NPS | > 40 | Trimestral |
| Tiempo promedio en análisis | < 15 min | Semanal |
| % usuarios que repiten | > 60% | Mensual |

## Lo Que NO Es Este Producto

- No es un reemplazo de reuniones presenciales
- No es una herramienta de colaboración en tiempo real (v1)
- No es un sistema de gestión de proyectos
- No almacena documentos o archivos externos

## Restricciones

- **Técnicas**: Stack moderno (Bun, Elysia, Next.js)
- **Legales**: GDPR compliance desde día 1
- **Tiempo**: MVP en 3 meses
- **Presupuesto**: Bootstrapped, costos mínimos de infra
```

---

### 2. Objectives (OBJ) - Objetivos de Usuario

Los Objectives capturan los objetivos de alto nivel de los actores del sistema en formato User Story.

#### Estructura de un Objective

```yaml
---
id: OBJ-NNN
kind: objective
title: ObjectiveName
actor: ActorName
status: draft
---
```

#### Secciones Requeridas

| Sección | Requerida | Descripción |
|---------|-----------|-------------|
| `## Actor` | Sí | Quién tiene este objetivo |
| `## Objetivo` | Sí | "Como X, quiero Y, para Z" |
| `## Criterios de éxito` | Sí | Cómo sabe el usuario que lo logró |
| `## Casos de uso relacionados` | No | Links a UC-* |

#### Ejemplo

---

### 3. Unidades de Valor (UV)

Las Unidades de Valor describen una **entrega end-to-end** que puede ser usada por el usuario y medida por el negocio. Son el puente entre objetivos y ejecución, y evitan planificar por componentes aislados.

#### Características

- **Verticales**: cruzan dominio → comportamiento → experiencia → verificación.
- **Verificables**: tienen criterios de salida claros.
- **Planificables**: se pueden estimar y priorizar.

#### Estructura Recomendada

```yaml
---
id: UV-NNN
kind: value-unit
title: Nombre de la unidad
status: draft
owner: PM/Lead
---
```

#### Ejemplo

```markdown
# UV-001: Crear Reto

## Objetivo
Permitir que el Usuario cree un Reto en estado borrador.

## Alcance (end-to-end)
- [[UC-001-CrearReto]]
- [[CMD-001-CreateChallenge]]
- [[REQ-001-CrearReto]]
- [[UI-RetoEditor]]

## Criterios de salida
- REQ-001 validado con feature.
- UI-RetoEditor en storybook.
- Comando implementado y probado.
```

---

### 4. Release Plans (REL)

Los Release Plans agrupan Unidades de Valor en entregas (MVP, v1, v1.1) con objetivos, dependencias y criterios de salida. Son el instrumento de planificación principal.

#### Estructura Recomendada

```yaml
---
id: REL-NNN
kind: release
title: Nombre del release
status: draft
owner: PM/Lead
target_date: 2025-03-31
---
```

#### Ejemplo

```markdown
# REL-001: MVP

## Objetivo
Validar creación de Retos y configuración de Personas.

## Unidades de Valor
- [[UV-001-CrearReto]]
- [[UV-002-ConfigurarPersonas]]

## Dependencias
- [[ADR-0002-Elysia-Backend]]

## Criterios de salida
- 100% UV con trazabilidad completa.
- Tests críticos en verde.
```

```markdown
---
id: OBJ-001
kind: objective
title: Analizar decisiones estructuradamente
actor: Usuario
status: approved
---

# OBJ-001: Analizar decisiones estructuradamente

## Actor
[[Usuario]] - Profesional que toma decisiones estratégicas

## Objetivo
Como Usuario, quiero analizar mis decisiones usando el método Six Hats,
para obtener perspectivas diversas sin depender de otras personas.

## Criterios de éxito
- Puedo crear un Reto con mi problema a analizar
- Recibo contribuciones desde 6 perspectivas diferentes
- Obtengo un análisis final que sintetiza los hallazgos

## Casos de uso relacionados
- [[UC-001-CrearReto]]
- [[UC-003-IniciarSesion]]
- [[UC-005-VerAnalisis]]
```

---

### 3. Contexto de Negocio

Documento que captura el entorno en el que opera el sistema.

#### Qué Incluye

```markdown
# Contexto de Negocio

## Situación Actual
¿Cómo se resuelve el problema hoy? ¿Qué herramientas existen?

## Competencia
¿Quién más está en este espacio? ¿Cómo nos diferenciamos?

## Tendencias del Mercado
¿Qué cambios están ocurriendo que hacen esto relevante?

## Sistemas Relacionados
¿Con qué otros sistemas debe integrarse o coexistir?

## Modelo de Negocio
¿Cómo generamos ingresos? ¿Cuál es la estructura de costos?
```

---

### 4. ADRs (Architecture Decision Records)

Los ADRs documentan decisiones importantes y su justificación. En esta capa se documentan decisiones de **negocio o estrategia**. Las decisiones puramente técnicas van en `05-architecture`.

#### Estructura de un ADR

```yaml
---
id: ADR-NNNN
kind: adr
title: Título de la Decisión
status: accepted  # proposed | accepted | deprecated | superseded
date: 2024-01-15
deciders: ["@juan", "@maria"]
---
```

#### Ejemplo

```markdown
---
id: ADR-0001
kind: adr
title: Modelo de monetización por créditos
status: accepted
date: 2024-01-15
deciders: ["@product", "@founder"]
---

# ADR-0001: Modelo de monetización por créditos

## Contexto
Necesitamos un modelo de monetización para Six Hats App que sea
justo para usuarios ocasionales y escalable para power users.

## Opciones Consideradas

### Opción A: Suscripción mensual fija
- **Pros**: Ingresos predecibles, simple de implementar
- **Cons**: Barrera alta para usuarios ocasionales

### Opción B: Pago por sesión
- **Pros**: Paga solo lo que usas
- **Cons**: Fricción en cada uso, impredecible

### Opción C: Sistema de créditos
- **Pros**: Flexibilidad, permite paquetes, reduce fricción
- **Cons**: Más complejo de implementar

## Decisión
Elegimos **Sistema de créditos** porque:
1. Permite a usuarios probar con pocos créditos iniciales
2. Los power users pueden comprar paquetes con descuento
3. Facilita promociones y onboarding

## Consecuencias

### Positivas
- Mejor conversión de usuarios free a paid
- Flexibilidad en pricing futuro

### Negativas
- Complejidad adicional en el sistema
- Necesidad de comunicar claramente el valor de un crédito

## Referencias
- Benchmark de apps similares (Notion, Linear)
```

#### Cuándo Crear un ADR

- Elección de modelo de negocio
- Decisión de mercado o posicionamiento
- Cambio de estrategia de producto
- Cualquier decisión que alguien preguntará "¿por qué hicimos esto?"

---

## El Lenguaje Ubicuo Nace Aquí

Aunque los términos del dominio se definen formalmente en la capa 01-Domain, **comienzan a emerger en el PRD**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   En el PRD mencionamos:                                                     │
│   - "Sesiones de análisis"                                                   │
│   - "Personas Sintéticas"                                                    │
│   - "Sombreros" (perspectivas)                                               │
│   - "Retos" (problemas a analizar)                                           │
│                                                                              │
│   Estos términos se formalizan en 01-Domain como Entidades:                  │
│   - [[Sesión]]                                                               │
│   - [[Persona Sintética]]                                                    │
│   - [[Sombrero]]                                                             │
│   - [[Reto]]                                                                 │
│                                                                              │
│   El PRD es donde el vocabulario compartido NACE.                            │
│   El Domain es donde se DEFINE formalmente.                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Relación con Otras Capas

La capa de Requirements es el **INPUT** que alimenta al diseño. Está **fuera del flujo de dependencias**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   00-Requirements (INPUT - fuera del flujo de capas)                         │
│       │                                                                      │
│       │  alimenta el diseño                                                  │
│       ▼                                                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  04-Verification   (tests, criteria)                                │   │
│   │      ↓ references                                                   │   │
│   ├─────────────────────────────────────────────────────────────────────┤   │
│   │  03-Experience     (views)                                          │   │
│   │      ↓ references                                                   │   │
│   ├─────────────────────────────────────────────────────────────────────┤   │
│   │  02-Behavior       (UC, CMD, QRY, XP)                               │   │
│   │      ↓ references                                                   │   │
│   ├─────────────────────────────────────────────────────────────────────┤   │
│   │  01-Domain         (entities, rules)   ← BASE                       │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Estructura de Carpetas

```
/specs/00-requirements/
├── PRD.md                    # Documento principal del producto
├── context.md                # Contexto de negocio (opcional)
├── /objectives/
│   ├── OBJ-001-AnalisisEstructurado.md
│   └── OBJ-002-PersonasSinteticas.md
└── /decisions/
    ├── ADR-0001-ModeloCreditos.md
    └── ADR-0002-EstrategiaGTM.md
```

---

## Checklist: Definiendo el Problema

Antes de avanzar a otras capas, asegúrate de tener:

- [ ] **Problema claro**: ¿Qué dolor resolvemos? ¿Por qué ahora?
- [ ] **Usuarios definidos**: ¿Quiénes son? ¿Qué características tienen?
- [ ] **Objetivos de negocio**: ¿Qué queremos lograr como organización?
- [ ] **Métricas de éxito**: ¿Cómo medimos si funciona?
- [ ] **Límites claros**: ¿Qué NO es este producto?
- [ ] **Restricciones**: ¿Qué limitaciones tenemos?
- [ ] **Objectives (OBJ)**: ¿Qué quieren lograr los usuarios?
- [ ] **ADRs iniciales**: ¿Qué decisiones de negocio tomamos?

---

## Anti-patrones a Evitar

### 1. PRD como Lista de Features

```markdown
# ❌ INCORRECTO
## Features
- Login con Google
- Dashboard con gráficas
- Exportar a PDF
- Modo oscuro

# ✅ CORRECTO
## El Problema
Los equipos toman decisiones sesgadas porque...

## Métricas de Éxito
- NPS > 40
- Tiempo de análisis < 15 min
```

### 2. Objetivos Vagos

```markdown
# ❌ INCORRECTO
## Objetivos
- Hacer una app útil
- Que la gente la use
- Ganar dinero

# ✅ CORRECTO
## Objetivos
- 1,000 usuarios activos en 6 meses
- MRR de $5,000 en 12 meses
- Retención > 40% al mes 3
```

### 3. Ausencia de "Lo Que NO Es"

```markdown
# ❌ INCORRECTO
(Sin sección de límites)

# ✅ CORRECTO
## Lo Que NO Es Este Producto
- No es un reemplazo de reuniones presenciales
- No es colaboración en tiempo real (v1)
- No gestiona proyectos
```

### 4. Decisiones Sin Documentar

```markdown
# ❌ INCORRECTO
"Usamos créditos porque sí"

# ✅ CORRECTO
ADR-0001 con:
- Contexto
- Opciones consideradas
- Pros/cons de cada una
- Decisión y justificación
- Consecuencias
```

---

## Cuándo Actualizar Esta Capa

La capa de Requirements **cambia poco** una vez establecida. Actualízala cuando:

1. **Pivot de producto**: El problema o los usuarios cambian fundamentalmente
2. **Nuevos objetivos**: Los OKRs de la organización evolucionan
3. **Decisiones estratégicas**: Nuevos ADRs por cambios de negocio
4. **Post-mortem**: Aprendizajes que cambian la visión

> **Regla de oro**: Si cambias el PRD frecuentemente, probablemente no tenías claro el problema desde el inicio.

---

## Resumen

La capa de Requirements en KDD:

1. **Es el fundamento**: Todo lo demás deriva de aquí
2. **Es estable**: Cambia poco una vez definida
3. **Es el "por qué"**: Justifica cada decisión posterior
4. **Es medible**: Define métricas de éxito concretas
5. **Es limitante**: Establece lo que NO es el producto
6. **Documenta decisiones**: ADRs capturan el razonamiento
7. **Captura objetivos**: OBJ define qué quieren lograr los usuarios

> **"Un sistema sin un problema claro es una solución buscando un problema. KDD empieza por el problema."**

---

## Artefactos Relacionados

- [[prd.template]] - Template para PRD
- [[adr.template]] - Template para ADRs
- [[objective.template]] - Template para Objectives
- [[01-domain]] - La siguiente capa: Dominio
- [[Introducción a KDD]] - Visión general de KDD

---

*Última actualización: 2025-01*
