---
title: "Revisar especificaciones en un PR"
audience: [tech-lead, pm, dev]
type: how-to
reading_time: "5 min"
status: draft
---

# Revisar especificaciones en un PR

> Para: Tech Leads, PMs, Devs — Tiempo: 5 min — Tipo: How-to

Esta guía te muestra cómo revisar cambios en especificaciones KDD dentro de un Pull Request. Aprenderás a verificar estructura, contenido y estilo usando un checklist práctico.

Si revisas specs por primera vez, lee antes la [Guía para Tech Leads](../guides/tech-lead.md#revisar-prs-de-specs).

---

## Cuándo usar esta guía

Aplica este checklist cada vez que revisas un PR que:

- Crea una nueva spec en `/specs`.
- Modifica una spec existente.
- Cambia el estado de una spec (ej: `draft` → `review`).
- Actualiza una spec para reflejar cambios de implementación.

---

## Checklist de revisión

Revisa cada sección en orden. Marca con comentario en el PR cualquier punto que no se cumpla.

### 1. Estructura del archivo

Verifica que el archivo cumple requisitos básicos de formato.

**Frontmatter completo**

- [ ] El bloque YAML existe y está bien formado.
- [ ] El campo `id` está presente y sigue el patrón del tipo.
- [ ] El campo `kind` coincide con el tipo de artefacto.
- [ ] El campo `status` tiene un valor válido (`draft`, `review`, `approved`, `deprecated`).
- [ ] Los campos específicos del tipo están completos (consulta [Referencia de Frontmatter](../reference/frontmatter.md)).

**Nombre de archivo**

- [ ] El nombre del archivo coincide con el identificador.
- [ ] Sigue el patrón de nombrado del tipo (consulta [Convenciones de Nombrado](../reference/naming.md)).

Ejemplo de verificación:

```markdown
# Archivo: BR-PROYECTO-005.md
# Frontmatter debe contener:
id: BR-PROYECTO-005
kind: business-rule
entity: Proyecto
category: state
severity: high
status: draft
```

### 2. Contenido obligatorio

Verifica que todas las secciones requeridas están presentes y completas.

**Opening claro**

- [ ] El primer párrafo responde "¿qué hace y por qué importa?".
- [ ] La primera oración funciona como resumen completo.

**Secciones obligatorias por tipo**

Cada tipo de artefacto tiene secciones requeridas. Consulta [Referencia de Artefactos](../reference/artifacts.md) para la lista completa.

**Para Business Rules (BR):**

- [ ] Declaración (la regla en una oración).
- [ ] Por qué existe (justificación de negocio).
- [ ] Cuándo aplica (scope).
- [ ] Casos válidos e inválidos (ejemplos).
- [ ] Errores o consecuencias del incumplimiento.

**Para Commands (CMD):**

- [ ] Propósito (qué hace).
- [ ] Input (estructura con tipos).
- [ ] Validaciones (qué se verifica antes de ejecutar).
- [ ] Precondiciones (estado requerido antes).
- [ ] Postcondiciones (garantías después de ejecutar).
- [ ] Errores (tabla con código, condición, mensaje).
- [ ] Eventos emitidos (si aplica).

**Para Use Cases (UC):**

- [ ] Actores (quién participa).
- [ ] Precondiciones (estado inicial).
- [ ] Flujo principal (pasos numerados).
- [ ] Excepciones (qué puede salir mal).
- [ ] Postcondiciones (estado final).

**Para Entities:**

- [ ] Responsabilidad (qué representa).
- [ ] Atributos (tabla con nombre, tipo, descripción).
- [ ] Estados (si tiene ciclo de vida).
- [ ] Invariantes (reglas que siempre se cumplen).

### 3. Trazabilidad

Verifica que los enlaces entre artefactos son correctos y completos.

**Wiki-links válidos**

- [ ] Todos los enlaces `[[Nombre]]` apuntan a specs existentes o están marcados como WIP.
- [ ] La primera mención de cada entidad en cada sección está enlazada.
- [ ] No hay enlaces en headers (`##`, `###`).
- [ ] No hay enlaces dentro de bloques de código.

**Dependencias explícitas**

- [ ] Si el artefacto depende de otro, el enlace está presente.
- [ ] Los Commands referencian las Business Rules que validan.
- [ ] Los Use Cases referencian los Commands que ejecutan.
- [ ] Las UI Views referencian los Use Cases que disparan.

**Sin dependencias circulares**

- [ ] Un artefacto de capa superior no referencia uno de capa inferior.
- [ ] Las entidades no referencian Commands o Queries.
- [ ] Los Objectives no referencian detalles de implementación.

Ejemplo de comentario en PR:

```markdown
El CMD-024 referencia [[Proyecto]], pero no documenta qué BR valida el input.
Agrega enlace a [[BR-PROYECTO-003]] en la sección Validaciones.
```

### 4. Terminología

Verifica que el documento usa terminología consistente y correcta.

**Términos KDD definidos**

- [ ] La primera mención de cada término KDD está en **negrita** con sigla.
- [ ] Menciones posteriores usan la forma abreviada consistentemente.

Ejemplo correcto:

```markdown
Un **Business Rule (BR)** define una restricción del dominio.
Cada BR tiene un identificador único.
```

**Sin alternancia de sinónimos**

- [ ] No alterna entre "Use Case", "caso de uso" y "UC" de forma inconsistente.
- [ ] Usa el mismo término en todo el documento.

**Entidades capitalizadas**

- [ ] Las entidades de dominio llevan la primera letra en mayúscula en prosa.
- [ ] Los nombres en código usan `camelCase` o `snake_case`.
- [ ] Los sistemas externos van en TODO MAYÚSCULAS.

Ejemplo correcto:

```markdown
El Usuario crea un Proyecto. Los datos se sincronizan con ORACLE.

```typescript
const proyecto = await createProyecto(input)
```

### 5. Estilo de escritura

Verifica que el documento aplica el style guide.

**Voz activa**

- [ ] Más del 90% de las oraciones usan voz activa (sujeto + verbo + objeto).
- [ ] Excepciones solo cuando el actor es irrelevante.

Ejemplo correcto:

```markdown
El Sistema valida el input.
QA verifica los criterios.
```

Ejemplo incorrecto:

```markdown
El input es validado por el Sistema.
Los criterios son verificados durante QA.
```

**Una idea por oración**

- [ ] Cada oración transmite un solo concepto.
- [ ] Las oraciones con "y" conectando ideas distintas están divididas.

**Párrafos cortos**

- [ ] Cada párrafo tiene entre 3 y 5 oraciones.
- [ ] La primera oración es la más importante (topic sentence).

**Verbos fuertes**

- [ ] No usa construcciones débiles: "hace la creación de" → "crea".
- [ ] Reemplaza expresiones largas: "con el fin de" → "para".

### 6. Ejemplos y código

Verifica que los ejemplos son claros y usan datos reales.

**Ejemplos concretos**

- [ ] Usa datos reales del proyecto (Proyecto, Tarea, Miembro).
- [ ] No inventa datos genéricos como "Proyecto ABC".

**Bloques de código con lenguaje**

- [ ] Cada bloque especifica el lenguaje (`yaml`, `typescript`, `gherkin`, `markdown`).
- [ ] Los bloques de código no tienen errores de sintaxis.

Ejemplo correcto:

````markdown
```yaml
id: BR-PROYECTO-005
kind: business-rule
entity: Proyecto
```
````

**Estados documentados**

- [ ] Si la spec maneja estados, están en una tabla separada.
- [ ] La tabla incluye: Estado (nombre visible), ID (técnico), Descripción.

### 7. Status apropiado

Verifica que el estado de la spec es correcto según su completitud.

**Nuevas specs**

- [ ] Empiezan en `status: draft`.

**Specs completas y revisadas**

- [ ] Cambian a `status: review` cuando el autor las considera listas.
- [ ] Cambian a `status: approved` después de aprobación del reviewer.

**Specs modificadas**

- [ ] Una spec `approved` que se modifica vuelve a `review`.

**Specs obsoletas**

- [ ] Una spec reemplazada cambia a `status: deprecated` y enlaza al reemplazo.

---

## Validación automática

Ejecuta el validador antes de aprobar el PR:

```bash
bun run validate:specs
```

El validador verifica:

- Esquema YAML correcto por tipo.
- Campos requeridos presentes.
- Valores dentro del enum válido.
- Patrones de ID correctos.
- Links rotos (solo en `status: approved`).

El validador NO verifica estilo, terminología ni contenido. Esas revisiones son manuales.

---

## Cómo dar feedback

Cuando encuentres un problema, comenta en el PR con:

1. **Qué está mal**: Cita la línea o sección específica.
2. **Por qué está mal**: Referencia la regla del style guide.
3. **Cómo corregirlo**: Sugiere texto concreto o enlace a ejemplo.

### Ejemplo de comentario constructivo

```markdown
> El campo `estado` acepta los valores `borrador`, `preparado`, `en_analisis` y `terminado`.
> El **Estado** del Proyecto define...

Inconsistencia: usa `estado` (código) en la primera mención y **Estado** (concepto)
en la segunda. Aplica la regla de capitalización:
- En prosa: "El Estado del Proyecto..."
- En código/campos: `estado`, `proyecto.estado`

Ref: STYLE-GUIDE.md#capitalización-de-entidades-de-dominio
```

### Ejemplo de comentario directo

```markdown
Falta la sección "Por qué existe" requerida para toda Business Rule.
Agrega una sección que explique la justificación de negocio de esta regla.

Ref: reference/artifacts.md#business-rule-br
```

---

## Casos especiales

### Spec incompleta en draft

Si la spec está en `status: draft` y tiene huecos marcados explícitamente, es aceptable:

```markdown
## Excepciones

### E1: Título vacío
WHEN el Usuario envía un título vacío...
(A definir con PM)

### E2-E4
Por documentar en próxima iteración.
```

Comenta: "OK para draft. Recuerda completar antes de pasar a `review`."

### Spec que cambia comportamiento existente

Si la spec modifica una regla de negocio o comando ya implementado, exige que el PR incluya:

1. El cambio en la spec.
2. El cambio en el código correspondiente.
3. La actualización de tests afectados.

Comenta: "Este cambio afecta `apps/api/src/use-cases/delete-proyecto.ts`. Incluye el cambio de código y tests en este PR o enlaza el PR de implementación."

### Spec con conflicto vs implementación

Si la spec contradice el código actual:

1. Identifica cuál es la fuente de verdad.
2. Si la spec está correcta, abre un issue de bug.
3. Si el código está correcto, pide actualizar la spec.
4. Si ambos divergieron, pide un ADR que documente la decisión.

Comenta: "Esta spec dice que un Proyecto con tareas no puede eliminarse, pero el código actual permite eliminarlo si todas están `completed`. ¿Cuál es el comportamiento correcto? Si cambió con el tiempo, crea un ADR que documente la decisión."

---

## Siguiente paso

Has aprendido a revisar PRs de specs con un checklist sistemático. Para profundizar en el rol de gobernanza, lee la [Guía para Tech Leads](../guides/tech-lead.md).

Si necesitas consultar los requisitos de un tipo específico de artefacto, ve a [Referencia de Artefactos](../reference/artifacts.md).
