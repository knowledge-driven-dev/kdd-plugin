---
title: "Tutorial: Crea tu primer Objective"
audience: [pm]
type: tutorial
reading_time: "5 min"
status: draft
---

# Tutorial: Crea tu primer Objective

> Para: Product Managers (primer contacto) · Tiempo: 5 min · Tipo: Tutorial

En este tutorial crearás tu primer **Objective (OBJ)** documentando una feature real del proyecto TaskFlow: exportar un análisis de sesión a PDF.

Al terminar, tendrás un OBJ completo con formato válido, listo para revisión del equipo.

---

## Antes de empezar

Necesitas:
- Editor de texto (VS Code recomendado)
- Acceso al repositorio del proyecto
- 5 minutos sin interrupciones

No necesitas conocer KDD en profundidad. Este tutorial te guía paso a paso.

---

## Paso 1: Crea el archivo

Abre tu terminal y navega a la raíz del proyecto.

Crea el archivo en la ubicación correcta:

```bash
touch specs/00-requirements/objectives/OBJ-012-Exportar-Analisis-PDF.md
```

Abre el archivo en tu editor.

**Resultado esperado:** Archivo vacío en `specs/00-requirements/objectives/OBJ-012-Exportar-Analisis-PDF.md`.

---

## Paso 2: Completa el frontmatter

El frontmatter define la metadata del artefacto. Copia este bloque al inicio del archivo:

```yaml
---
id: OBJ-012
kind: objective
title: Exportar análisis de sesión a PDF
actor: Usuario
status: draft
---
```

Cada campo cumple una función específica:

| Campo | Qué es | Por qué importa |
|---|---|---|
| `id` | Identificador único | Permite enlazar desde otros artefactos |
| `kind` | Tipo de artefacto | El sistema identifica que es un Objective |
| `title` | Nombre descriptivo | Resume el objetivo en pocas palabras |
| `actor` | Quién lo necesita | Clarifica la audiencia del objetivo |
| `status` | Estado del ciclo de vida | Indica que está en progreso |

**Resultado esperado:** Frontmatter completo con campos correctos.

---

## Paso 3: Escribe el título

Después del frontmatter, escribe el título del documento:

```markdown
# OBJ-012: Exportar análisis de sesión a PDF
```

El título repite el ID y el título del frontmatter. Esto facilita la navegación cuando alguien lee el archivo directamente.

**Resultado esperado:** Título H1 con formato `# OBJ-NNN: Descripción`.

---

## Paso 4: Define el Actor

La sección **Actor** declara quién necesita esta funcionalidad. Añade:

```markdown
## Actor
Usuario con sesión completada
```

Sé específico. "Usuario" es demasiado genérico. "Usuario con sesión completada" clarifica el contexto.

**Resultado esperado:** Sección Actor con descripción precisa.

---

## Paso 5: Escribe el Objetivo

La sección **Objetivo** usa el formato "Como X, quiero Y, para Z". Añade:

```markdown
## Objetivo
Como Usuario con una sesión completada, quiero exportar el análisis
a formato PDF, para compartirlo con personas fuera de la aplicación
que no tienen cuenta.
```

Cada parte del objetivo responde una pregunta:

- **Como X**: ¿Quién?
- **Quiero Y**: ¿Qué acción?
- **Para Z**: ¿Por qué? (el valor de negocio)

**Resultado esperado:** Objetivo en formato estándar que responde quién, qué y por qué.

---

## Paso 6: Define los Criterios de éxito

Los **Criterios de éxito** establecen cómo verificar que el objetivo se cumplió. Añade:

```markdown
## Criterios de éxito
- El Usuario accede a la opción "Exportar PDF" desde la pantalla de análisis completado
- El Sistema genera un PDF con todos los resultados de la sesión
- El PDF incluye: título del proyecto, resumen por etiqueta, aportes destacados
- El Usuario descarga el PDF a su dispositivo
- El PDF tiene formato profesional (no es un dump raw de datos)
```

Cada criterio es verificable. Si QA puede decir "esto pasó" o "esto no pasó", el criterio está bien escrito.

**Resultado esperado:** Lista de 3-6 criterios verificables.

---

## Paso 7: Enlaza casos de uso relacionados

La sección **Casos de uso relacionados** conecta este objetivo con los flujos que lo implementan. Añade:

```markdown
## Casos de uso relacionados
- [[UC-015-Exportar-Analisis-PDF]] (por crear)
```

El wiki-link está roto porque `UC-015` aún no existe. Esto es normal y esperado. El UC se creará en la fase de refinamiento.

**Resultado esperado:** Wiki-link a UC que se creará después.

---

## Lo que construiste

Tu archivo completo debe verse así:

```markdown
---
id: OBJ-012
kind: objective
title: Exportar análisis de sesión a PDF
actor: Usuario
status: draft
---

# OBJ-012: Exportar análisis de sesión a PDF

## Actor
Usuario con sesión completada

## Objetivo
Como Usuario con una sesión completada, quiero exportar el análisis
a formato PDF, para compartirlo con personas fuera de la aplicación
que no tienen cuenta.

## Criterios de éxito
- El Usuario accede a la opción "Exportar PDF" desde la pantalla de análisis completado
- El Sistema genera un PDF con todos los resultados de la sesión
- El PDF incluye: título del proyecto, resumen por etiqueta, aportes destacados
- El Usuario descarga el PDF a su dispositivo
- El PDF tiene formato profesional (no es un dump raw de datos)

## Casos de uso relacionados
- [[UC-015-Exportar-Analisis-PDF]] (por crear)
```

Creaste un Objective completo que:

1. Tiene un identificador único (`OBJ-012`)
2. Declara quién lo necesita (Usuario con sesión completada)
3. Explica qué quiere y por qué (exportar para compartir)
4. Define cómo verificar el éxito (criterios concretos)
5. Conecta con el flujo que lo implementará (UC-015)

---

## Qué sigue

### Revisión del equipo

Guarda el archivo. Crea un commit:

```bash
git add specs/00-requirements/objectives/OBJ-012-Exportar-Analisis-PDF.md
git commit -m "docs: add OBJ-012 Exportar análisis PDF

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

Crea un PR para revisión. El equipo validará que el objetivo tiene sentido antes de pasar a la siguiente fase.

### Siguiente fase: Refinamiento

Una vez aprobado el OBJ (status `approved`), el siguiente paso es crear el Use Case que detalla el flujo completo.

> **Tutorial recomendado:** [first-use-case.md](./first-use-case.md) te muestra cómo derivar un UC desde este OBJ.

### Profundiza

- **Guía completa para PMs:** [guides/pm.md](../guides/pm.md) cubre todos los artefactos que usarás como PM.
- **Referencia de Objectives:** [reference/artifacts.md](../reference/artifacts.md#objective-obj) tiene el catálogo completo de campos y secciones.
- **Cheatsheet:** [reference/cheatsheet.md](../reference/cheatsheet.md) para consulta rápida mientras trabajas.

---

## Tips finales

**No te preocupes por hacerlo perfecto.** El status `draft` indica que es trabajo en progreso. Itera en base a feedback del equipo.

**Los links rotos están bien al inicio.** `[[UC-015-Exportar-Analisis-PDF]]` no existe todavía. Se creará cuando alguien lo refine.

**Empieza simple.** Un OBJ con Actor + Objetivo + 3 criterios es suficiente para arrancar la conversación.
