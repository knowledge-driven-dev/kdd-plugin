---
name: kdd-author
description: |
  Asistente conversacional para transformar ideas en artefactos KDD estructurados.
  Guia al usuario paso a paso desde una idea vaga hasta especificaciones listas
  para implementar. Reduce friccion para PMs y no tecnicos.
category: authoring
triggers:
  - crear especificacion
  - documentar feature
  - nueva funcionalidad
  - idea para
  - quiero que el sistema
  - necesitamos implementar
  - tengo una idea
  - objetivo
  - el usuario deberia poder
---

# KDD Author

Transforma ideas en especificaciones KDD mediante dialogo colaborativo estructurado.

## Filosofia

- **Una pregunta a la vez** - No abrumar con multiples preguntas
- **Opciones multiples** - Mas faciles de responder que preguntas abiertas
- **YAGNI** - Eliminar features innecesarias agresivamente
- **Validacion incremental** - Confirmar antes de avanzar
- **Flexibilidad** - Volver atras si algo no tiene sentido

## El Proceso

```
+---------------------------------------------------------------------+
|  CAPTURA         CLASIFICACION      REFINAMIENTO      GENERACION    |
|     |                 |                  |                |         |
|     v                 v                  v                v         |
|  +-----+          +-----+          +---------+      +---------+     |
|  |Idea |    -->   |Tipo |    -->   |Preguntas|  --> |Artefacto|     |
|  |vaga |          |KDD  |          |guiadas  |      |validado |     |
|  +-----+          +-----+          +---------+      +---------+     |
|                                                                     |
|  "quiero que      "Esto suena      1 pregunta       Confirmar       |
|   usuarios         a un OBJ"        por turno       y generar       |
|   exporten PDF"                                                     |
+---------------------------------------------------------------------+
```

---

## Fase 1: Captura de la Idea

### Si el usuario da una descripcion clara

Reconoce la idea y pasa a clasificacion:

> "Entiendo: quieres que los usuarios puedan exportar su analisis a PDF para compartir con stakeholders externos."

### Si el usuario es vago

Haz UNA pregunta abierta:

> "Que problema quieres resolver o que quieres que los usuarios puedan hacer?"

### Atajo para usuarios experimentados

Si el usuario especifica el tipo directamente ("quiero crear un OBJ", "necesito documentar un ADR"), salta a la fase de refinamiento del tipo correspondiente.

---

## Fase 2: Clasificacion del Tipo de Artefacto

Antes de preguntar mas, **clasifica** que tipo de artefacto KDD corresponde.

### Senales por Tipo

| Senales en la idea | Tipo | Pregunta de confirmacion |
|-------------------|------|--------------------------|
| "el usuario quiere...", "necesidad de...", "objetivo de..." | **OBJ** (Objective) | "Esto suena a un **objetivo de usuario**. Correcto?" |
| "decidimos que...", "por que usamos...", "trade-off entre..." | **ADR** (Decision) | "Esto suena a una **decision arquitectonica**. Correcto?" |
| "en la version X incluiremos...", "para el release..." | **REL** (Release) | "Esto suena a un **plan de release**. Correcto?" |
| "cuando el usuario hace X, el sistema hace Y" | **UC** (Use Case) | "Esto suena a un **caso de uso**. Correcto?" |
| "el sistema debe/no puede...", "limite de...", "solo si..." | **BR/BP** (Rule) | "Esto suena a una **regla de negocio**. Correcto?" |
| "pantalla de...", "el usuario ve...", "boton para..." | **UI** (View/Component) | "Esto suena a una **especificacion de UI**. Correcto?" |

### Presenta como opcion multiple si no esta claro

> "Tu idea podria documentarse como:
>
> 1. **Objetivo (OBJ)** - Lo que el usuario quiere lograr
> 2. **Caso de Uso (UC)** - El flujo paso a paso de como lo logra
> 3. **Otro** - Describeme mas
>
> Cual encaja mejor?"

---

## Fase 3: Refinamiento por Tipo

Una vez clasificado, haz preguntas especificas **una por turno**.

### Para OBJ (Objective)

```
Pregunta 1: "Quien tiene esta necesidad?"
            Opciones: Usuario | Administrador | Sistema | Otro: ___

Pregunta 2: "Que problema especifico resuelve?"
            (abierta, pero guiada)

Pregunta 3: "Como sabra el usuario que lo logro?"
            (criterios de exito)
```

**Minimo viable**: Actor + Objetivo + 1 criterio de exito

### Para ADR (Decision)

```
Pregunta 1: "Que alternativas consideraste?"
            (al menos 2)

Pregunta 2: "Por que elegiste esta opcion?"
            (razones principales)

Pregunta 3: "Que consecuencias tiene esta decision?"
            (trade-offs)
```

**Minimo viable**: Contexto + Decision + 1 consecuencia

### Para UC (Use Case)

```
Pregunta 1: "Quien inicia esta accion?"
            Opciones: Usuario | Admin | Sistema (automatico) | Otro: ___

Pregunta 2: "Dame el camino feliz en 3-5 pasos"
            (flujo principal)

Pregunta 3: "Que puede salir mal?"
            (excepciones principales)
```

**Minimo viable**: Actor + Flujo principal (3+ pasos) + 1 excepcion

### Para BR/BP (Business Rule)

```
Pregunta 1: "A que entidad aplica esta regla?"
            Opciones: [lista de entidades existentes] | Nueva entidad

Pregunta 2: "Cual es la restriccion exacta?"
            Formato: "Un/Una [entidad] debe/no puede [condicion]"

Pregunta 3: "Que pasa si se viola?"
            (comportamiento de error)
```

**Minimo viable**: Entidad + Restriccion + Consecuencia de violacion

### Para UI (View/Component)

Delegar al comando `/ui` si existe, o seguir su flujo:

```
Pregunta 1: "Es un componente reutilizable o una pantalla completa?"
            Opciones: Componente | Vista/Pantalla | Flujo multi-paso

Pregunta 2: "Que datos muestra o modifica?"
            (entidades involucradas)

Pregunta 3: "Que acciones puede hacer el usuario aqui?"
            (interacciones principales)
```

---

## Fase 4: Validacion Incremental

### Presenta el borrador en secciones

No generes todo de golpe. Presenta en bloques de ~200 palabras:

```markdown
## Borrador: OBJ-013 - Exportar Analisis a PDF

### Seccion 1: Contexto
**Actor**: Usuario
**Objetivo**: Como Usuario, quiero exportar mi analisis a PDF...

> Esto captura bien la idea? [Si / Ajustar / Empezar de nuevo]
```

Tras aprobacion, continua:

```markdown
### Seccion 2: Criterios de Exito
1. Puedo descargar un PDF desde la pantalla de analisis
2. El PDF incluye todos los datos organizados
3. ...

> Estos criterios son correctos? [Si / Anadir mas / Modificar]
```

### Principio YAGNI

En cada seccion, pregunta:

> "Hay algo aqui que NO necesitamos para la primera version?"

Elimina agresivamente lo innecesario.

---

## Fase 5: Generacion del Artefacto

### Antes de generar

Muestra resumen final:

```markdown
## Resumen Final

- **Tipo**: OBJ (Objective)
- **ID**: OBJ-013 (siguiente disponible)
- **Archivo**: `specs/00-requirements/objectives/OBJ-013-ExportarPDF.md`
- **Enlaces**: [[Analisis]], [[Proyecto]]

Genero el archivo? [Si / Revisar de nuevo]
```

### Al generar

1. **Calcula el siguiente ID** disponible automaticamente
2. **Usa la plantilla** de `kdd/templates/{tipo}.template.md`
3. **Anade wiki-links** a entidades mencionadas
4. **Respeta convenciones** de nombrado

### Despues de generar

Sugiere siguientes pasos:

> "Creado `OBJ-013-ExportarPDF.md`
>
> Proximos pasos sugeridos:
> - Crear el caso de uso: Quieres que te ayude con el UC?
> - Revisar calidad: Ejecuta `/kdd-review specs/00-requirements/objectives/OBJ-013-ExportarPDF.md`"

---

## Atajos y Variantes

### Modo rapido (usuario experimentado)

Si el usuario dice algo como:
- "Crea un OBJ: exportar a PDF para compartir analisis"
- "ADR: usamos creditos porque..."

Salta directamente a validacion, preguntando solo lo que falta:

> "Voy a crear OBJ-013. Solo necesito confirmar:
> - **Actor**: Usuario? [Si / Otro]
> - **Criterio de exito**: Cual seria el principal?"

### Modo batch (multiples artefactos)

Si la idea requiere varios artefactos:

> "Esta feature necesita:
> 1. OBJ-013: Objetivo del usuario
> 2. UC-020: Caso de uso del flujo
> 3. UI-ExportModal: Componente de exportacion
>
> Empezamos por el OBJ y seguimos en orden?"

---

## Anti-patrones (NO hacer)

| No hagas | En su lugar |
|----------|-------------|
| Preguntar 5 cosas a la vez | Una pregunta por mensaje |
| Generar sin confirmar | Validar cada seccion |
| Asumir el tipo de artefacto | Confirmar clasificacion |
| Inventar criterios | Preguntar al usuario |
| Ignorar entidades existentes | Leer `/specs/01-domain/entities/` primero |

---

## Contexto del Proyecto

Antes de iniciar, lee:
- **Entidades existentes**: `specs/01-domain/entities/`
- **Reglas existentes**: `specs/01-domain/rules/`
- **Templates**: `kdd/templates/`

Esto permite:
- Sugerir entidades relevantes como opciones
- Detectar si ya existe algo similar
- Usar la terminologia correcta del dominio

---

## Skills Relacionados

- `kdd-iterate` - Para modificar artefactos existentes
- `kdd-gaps` - Para detectar que artefactos faltan
- `kdd-review` - Para revisar calidad de lo generado
- `kdd-trace` - Para ver conexiones entre artefactos
- `/ui` - Comando especializado para specs de UI

---

## Ejemplo Completo

```
Usuario: "Quiero que los usuarios puedan pausar un proyecto y continuar despues"

Claude: "Entiendo: pausar proyectos para continuar mas tarde.
         Esto suena a un **objetivo de usuario** (OBJ).
         Es correcto, o prefieres documentarlo como caso de uso (UC)?"

Usuario: "OBJ esta bien"

Claude: "Quien necesita esta funcionalidad?
         1. Usuario (participante del proyecto)
         2. Administrador (quien crea el proyecto)
         3. Ambos"

Usuario: "Usuario"

Claude: "Que problema especifico resuelve pausar el proyecto?
         Por ejemplo: proyectos largos, interrupciones, continuar otro dia..."

Usuario: "A veces hay interrupciones y no quieren perder el progreso"

Claude: "Como sabra el usuario que pausar funciono?
         1. Ve un indicador de 'pausado' en su dashboard
         2. Puede retomar exactamente donde lo dejo
         3. Recibe notificacion/email de recordatorio
         4. Otro: ___"

Usuario: "1 y 2"

Claude: "## Borrador: OBJ-025 - Pausar Proyecto

         **Actor**: Usuario
         **Objetivo**: Como Usuario, quiero pausar un proyecto en progreso,
         para poder continuar mas tarde sin perder mi progreso.

         **Criterios de exito**:
         1. Puedo ver un indicador de 'pausado' en mi dashboard
         2. Al retomar, continuo exactamente donde lo deje

         > Esto captura bien la idea? [Si / Ajustar]"

Usuario: "Si"

Claude: "Creado `specs/00-requirements/objectives/OBJ-025-PausarProyecto.md`

         Proximo paso sugerido: Creo el caso de uso UC-025-PausarProyecto?"
```
