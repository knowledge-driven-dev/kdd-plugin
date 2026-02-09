---
title: "Convenciones de Nombrado"
audience: [pm, designer, dev, qa, tech-lead]
type: reference
reading_time: "consulta"
status: draft
---

# Convenciones de Nombrado

> Para: Todos — Tipo: Referencia — Uso: Consulta puntual

Esta referencia documenta todas las convenciones de nombrado en KDD: identificadores de artefactos, nombres de archivo, wiki-links y capitalización de entidades. Consulta la sección que necesites.

---

## Identificadores de artefactos

Cada tipo de artefacto KDD usa un patrón fijo de identificador. Los identificadores siempre van en MAYÚSCULAS.

### Tabla completa de identificadores

| Tipo | Prefijo | Patrón ID | Patrón Archivo | Ubicación |
|---|---|---|---|---|
| Objective | OBJ | `OBJ-NNN` | `OBJ-NNN-{Nombre}.md` | `00-requirements/objectives/` |
| Value Unit | UV | `UV-NNN` | `UV-NNN-{Nombre}.md` | `00-requirements/value-units/` |
| Release | REL | `REL-NNN` | `REL-NNN-{Nombre}.md` | `00-requirements/releases/` |
| ADR | ADR | `ADR-NNNN` | `ADR-NNNN-{Título}.md` | `00-requirements/decisions/` |
| Entity | — | — | `PascalCase.md` | `01-domain/entities/` |
| Event | EVT | `EVT-{Entidad}-{Accion}` | `EVT-{Entidad}-{Accion}.md` | `01-domain/events/` |
| Business Rule | BR | `BR-{ENTIDAD}-NNN` | `BR-{ENTIDAD}-NNN.md` | `01-domain/rules/` |
| Business Policy | BP | `BP-{TOPIC}-NNN` | `BP-{TOPIC}-NNN.md` | `02-behavior/policies/` |
| Cross-Policy | XP | `XP-{TOPIC}-NNN` | `XP-{TOPIC}-NNN.md` | `02-behavior/policies/` |
| Command | CMD | `CMD-NNN` | `CMD-NNN-{Nombre}.md` | `02-behavior/commands/` |
| Query | QRY | `QRY-NNN` | `QRY-NNN-{Nombre}.md` | `02-behavior/queries/` |
| Process | PROC | `PROC-NNN` | `PROC-NNN-{Nombre}.md` | `02-behavior/processes/` |
| Use Case | UC | `UC-NNN` | `UC-NNN-{Nombre}.md` | `02-behavior/use-cases/` |
| UI View | UI | `UI-{Nombre}` | `UI-{Nombre}.md` | `03-experience/views/` |
| UI Component | UI | `UI-{Nombre}` | `UI-{Nombre}.md` | `03-experience/components/` |
| Requirement | REQ | `REQ-NNN` o `REQ-NNN.M` | `REQ-NNN-{Nombre}.md` | `04-verification/criteria/` |

### Patrones explicados

**NNN**: Número secuencial de 3 dígitos con ceros a la izquierda. Ejemplos: `001`, `012`, `123`.

**NNNN**: Número secuencial de 4 dígitos con ceros a la izquierda. Ejemplos: `0001`, `0023`, `1234`.

**{ENTIDAD}**: Nombre de la entidad en MAYÚSCULAS. Ejemplos: `PROYECTO`, `TAREA`, `SPRINT`.

**{TOPIC}**: Tema o categoría en MAYÚSCULAS. Ejemplos: `PUNTO`, `AUDIT`, `SECURITY`.

**{Nombre}**: Nombre descriptivo en PascalCase. Ejemplos: `CrearProyecto`, `BorrarTarea`, `Dashboard`.

**{Accion}**: Acción en PascalCase en pasado participio. Ejemplos: `Creado`, `Actualizado`, `Eliminado`.

### Ejemplos reales del proyecto

```markdown
OBJ-001-Gestion-Equipo.md
UV-002-Miembros-AI.md
ADR-0001-Tech-Stack.md
Proyecto.md
Miembro.md
EVT-Proyecto-Creado.md
EVT-Tarea-Completada.md
BR-PROYECTO-005.md
BR-TAREA-001.md
XP-PUNTOS-001.md
CMD-003-DeleteProyecto.md
CMD-MiembroProfile.md
QRY-001-GetProyecto.md
UC-001-Crear-Proyecto.md
UI-Dashboard.md
UI-ProyectoCard.md
REQ-001-Crear-Proyecto.md
REQ-001.1.md
REQ-001.2.md
```

---

## Nombres de archivo

Los nombres de archivo siguen reglas específicas según el tipo de artefacto.

### Entidades de dominio: PascalCase

Las entidades usan PascalCase con espacios permitidos. El nombre del archivo debe coincidir con el nombre de la entidad.

```
Proyecto.md
Tarea.md
Miembro.md
Etiqueta.md
Usuario.md
```

> **Nota**: Los espacios en nombres de archivo son válidos para entidades con nombres compuestos.

### Artefactos con prefijo: ID + guiones + nombre

Todos los artefactos que usan identificador prefijado siguen el patrón `{ID}-{Nombre}.md`:

```
UC-001-Crear-Proyecto.md
CMD-003-DeleteProyecto.md
BR-PROYECTO-005-Transicion-Terminado.md
EVT-Proyecto-Creado.md
OBJ-001-Gestion-Equipo.md
```

El nombre después del ID usa guiones como separadores. Usa PascalCase o kebab-case según preferencia del equipo, pero mantén consistencia.

### ADRs: 4 dígitos

Los ADRs usan 4 dígitos para permitir más de 999 decisiones en proyectos grandes:

```
ADR-0001-Tech-Stack.md
ADR-0002-Database-Choice.md
ADR-0023-AI-Provider.md
```

---

## Wiki-Links

Los wiki-links conectan artefactos entre sí. KDD usa sintaxis de Obsidian para enlaces internos.

### Sintaxis básica

```markdown
[[Nombre]]                        # Link simple
[[Nombre|texto alternativo]]      # Link con alias
```

### Por tipo de artefacto

```markdown
[[Proyecto]]                          # Entidad
[[Miembro]]             # Entidad con espacio
[[Tarea|tareas]]               # Entidad en plural
[[BR-PROYECTO-005]]                   # Business Rule
[[CMD-003-DeleteProyecto]]       # Command con nombre completo
[[UC-001]]                        # Use Case solo con ID
[[EVT-Proyecto-Creado]]               # Event
[[XP-PUNTOS-001]]               # Cross-Policy
[[UI-Dashboard]]                  # UI View
```

### Cuándo enlazar

| Contexto | Acción | Ejemplo |
|---|---|---|
| Primera mención en sección | Sí enlazar | `El [[Usuario]] puede...` |
| Menciones posteriores en la misma sección | Opcional | `El Usuario también...` |
| En headers | NO enlazar | `## Flujo del Usuario` |
| En bloques de código | NO enlazar | `` `usuario.create()` `` |
| En tablas | Sí enlazar | `\| [[Proyecto]] \| Borrador \|` |
| En listas de referencias | Sí enlazar | `- [[BR-PROYECTO-005]]` |

### Alias para plurales y variaciones

Usa alias para mantener el enlace correcto mientras varías el texto visible:

```markdown
[[Tarea|tareas]]                            # Plural
[[Miembro|participante]]             # Sinónimo
[[Miembro|Miembros]]      # Plural formal
[[Metodología|método de análisis]]    # Traducción
[[CMD-003-DeleteProyecto|CMD-003]]            # Abreviación
```

### Enlaces rotos

Los enlaces rotos son aceptables en estado `draft`. Antes de cambiar a `approved`, valida que todos los enlaces resuelvan correctamente:

```bash
bun run validate:specs
```

---

## Capitalización de entidades

Las entidades de dominio siguen reglas específicas de capitalización según el contexto.

### En documentación: Primera letra mayúscula

Las entidades de dominio (Aggregates, Entities, Value Objects) siempre llevan la primera letra en mayúscula en texto narrativo. Esto indica que el término es un concepto de dominio definido.

```markdown
# Correcto
El Usuario crea un Proyecto y configura los Miembros Sintéticas.
Cada Tarea contiene múltiples Sprints.
La Etiqueta Azul controla el proceso.

# Incorrecto
El usuario crea un proyecto y configura los miembros.
Cada tarea contiene múltiples sprints.
```

### En código: camelCase o snake_case

En bloques de código, nombres de variables, funciones y propiedades, usa convenciones del lenguaje:

```typescript
// TypeScript: camelCase
const miembro = await createMiembro(input)
const tareaActiva = await getTareaActiva(proyectoId)
const usuario = session.user

// SQL: snake_case
SELECT miembro_id, tarea_id
FROM proyectos
WHERE estado = 'preparado'
```

### Plurales y artículos

Los plurales mantienen la mayúscula. Los artículos van en minúscula:

```markdown
el Proyecto, un Proyecto, los Proyectos
la Tarea, una Tarea, las Tareas
la Etiqueta, las Etiquetas
el Miembro, los Miembros
```

### Sistemas externos: TODO MAYÚSCULAS

Los sistemas externos (integraciones, APIs de terceros) se escriben completamente en MAYÚSCULAS para diferenciarlos de entidades propias:

```markdown
# Correcto
El Sistema sincroniza los datos con ORACLE.
La pasarela de pago STRIPE procesa la transacción.
Los datos se consumen desde la API de OPENAI.

# Incorrecto
El Sistema sincroniza los datos con Oracle.
La pasarela de pago Stripe procesa la transacción.
```

Nombres de archivo para sistemas externos:

```
ORACLE.md
STRIPE.md
OPENAI.md
SAP.md
```

---

## Estados de entidades

Los estados siguen convenciones específicas según el contexto.

### En documentación: Capitalizado con espacios

```markdown
**Borrador**
**Preparado**
**En Análisis**
**Terminado**
**Cancelada por Timeout**
```

### En código y YAML: snake_case

```yaml
estado: borrador
estado: preparado
estado: en_analisis
estado: terminado
estado: cancelada_timeout
```

```typescript
if (proyecto.estado === 'preparado') {
  // ...
}
```

### En tablas: Ambos formatos

Las tablas de referencia muestran ambos formatos:

```markdown
| Estado | ID | Descripción |
|---|---|---|
| **Borrador** | `borrador` | Proyecto en configuración |
| **Preparado** | `preparado` | Listo para iniciar tareas |
| **En Análisis** | `en_analisis` | Al menos una tarea iniciada |
| **Terminado** | `terminado` | Proyecto cerrado, inmutable |
```

---

## Keywords EARS

Los requisitos formales usan keywords EARS (Easy Approach to Requirements Syntax) siempre en MAYÚSCULAS.

### Keywords disponibles

| Keyword | Propósito | Ejemplo |
|---|---|---|
| `WHEN` | Evento disparador | `WHEN the Usuario submits the form` |
| `IF` | Condición para comportamiento no deseado | `IF the Proyecto has active Tareas` |
| `WHILE` | Estado continuo | `WHILE the Tarea is in progress` |
| `WHERE` | Característica opcional | `WHERE the feature flag is enabled` |
| `SHALL` | Obligación del sistema | `the system SHALL create a Proyecto` |
| `SHALL NOT` | Prohibición | `the system SHALL NOT allow deletion` |

### Ejemplo completo

```markdown
WHEN a Proyecto completes its 4th Tarea,
the system SHALL transition the Proyecto to state "terminado"
  AND SHALL emit event EVT-Proyecto-Terminado with motivo "limite_sesiones"
  AND SHALL prevent any further state changes.

IF the Usuario attempts to delete a Proyecto WHILE it has Tareas,
the system SHALL reject the request
  AND SHALL return error PROYECTO-203.
```

---

## Términos KDD

Los términos propios de la metodología KDD se escriben siempre en inglés con forma fija.

### Glosario de términos

| Término | Forma correcta | Abreviatura | Formas incorrectas |
|---|---|---|---|
| Objective | Objective | OBJ | objetivo, objective |
| Value Unit | Value Unit | UV | unidad de valor, value-unit |
| Use Case | Use Case | UC | caso de uso, usecase, use-case |
| Business Rule | Business Rule | BR | regla de negocio, business rule |
| Business Policy | Business Policy | BP | política de negocio |
| Cross-Policy | Cross-Policy | XP | política transversal, cross policy |
| Command | Command | CMD | comando, command |
| Query | Query | QRY | consulta, query |
| Process | Process | PROC | proceso, process |
| Requirement | Requirement | REQ | requisito, requirement |

### Uso en texto

Primera mención: término completo en **negrita** + abreviatura entre paréntesis.

```markdown
Un **Business Rule (BR)** define una restricción invariable del dominio.
```

Menciones posteriores: usa la forma abreviada de manera consistente.

```markdown
Cada BR tiene un identificador único con formato `BR-ENTIDAD-NNN`.
El BR se documenta en `specs/01-domain/rules/`.
```

---

## Convenciones por tipo de artefacto

Cada tipo de artefacto tiene convenciones adicionales específicas.

### Commands (CMD)

```markdown
# ID
CMD-NNN

# Archivo
CMD-NNN-{Verbo}{Entidad}.md

# Ejemplos
CMD-003-DeleteProyecto.md
CMD-MiembroProfile.md
CMD-001-CreateProyecto.md
```

El nombre usa un verbo en infinitivo seguido de la entidad en singular. Usa inglés para los nombres de comando.

### Queries (QRY)

```markdown
# ID
QRY-NNN

# Archivo
QRY-NNN-{Verbo}{Entidad}.md

# Ejemplos
QRY-001-GetProyecto.md
QRY-002-ListTareas.md
QRY-003-GetMiembroProfile.md
```

El nombre usa un verbo de consulta (`Get`, `List`, `Find`, `Search`) seguido de la entidad.

### Events (EVT)

```markdown
# ID
EVT-{Entidad}-{Accion}

# Archivo
EVT-{Entidad}-{Accion}.md

# Ejemplos
EVT-Proyecto-Creado.md
EVT-Tarea-Completada.md
EVT-Miembro-Actualizado.md
```

La acción usa pasado participio. La entidad y la acción usan PascalCase.

### Business Rules (BR)

```markdown
# ID
BR-{ENTIDAD}-NNN

# Archivo
BR-{ENTIDAD}-NNN-{Descripcion}.md

# Ejemplos
BR-PROYECTO-005-Transicion-Terminado.md
BR-TAREA-001-Minimo-Personas.md
BR-SPRINT-003-Orden-Etiquetas.md
```

La entidad va en MAYÚSCULAS. La descripción opcional ayuda a identificar la regla.

### Use Cases (UC)

```markdown
# ID
UC-NNN

# Archivo
UC-NNN-{Verbo}-{Objeto}.md

# Ejemplos
UC-001-Crear-Proyecto.md
UC-002-Iniciar-Tarea.md
UC-003-Configurar-Miembros.md
```

El nombre usa verbo infinitivo + objeto. Usa guiones como separadores.

### Objectives (OBJ)

```markdown
# ID
OBJ-NNN

# Archivo
OBJ-NNN-{Nombre-Descriptivo}.md

# Ejemplos
OBJ-001-Gestion-Equipo.md
OBJ-002-Perspectivas-Diversas.md
```

El nombre captura la esencia del objetivo en 2-4 palabras.

---

## Checklist de validación

Antes de hacer PR con una spec, verifica:

**Identificadores**
- [ ] El ID sigue el patrón exacto del tipo de artefacto
- [ ] El ID usa MAYÚSCULAS donde corresponde
- [ ] El ID es único en su categoría

**Nombres de archivo**
- [ ] El nombre coincide con el patrón del tipo
- [ ] Entidades usan PascalCase
- [ ] Artefactos prefijados usan guiones como separadores
- [ ] No hay espacios excepto en nombres de entidades compuestas

**Wiki-links**
- [ ] Primera mención de cada entidad está enlazada
- [ ] No hay enlaces en headers
- [ ] No hay enlaces en bloques de código
- [ ] Alias usados correctamente para plurales

**Capitalización**
- [ ] Entidades de dominio capitalizadas en prosa
- [ ] Código usa camelCase/snake_case según lenguaje
- [ ] Sistemas externos en TODO MAYÚSCULAS
- [ ] Estados: Capitalizado en prosa, snake_case en código

**Términos KDD**
- [ ] Términos KDD en inglés
- [ ] Primera mención con definición completa
- [ ] Menciones posteriores consistentes
- [ ] Keywords EARS en MAYÚSCULAS

---

## Referencias

Consulta estos documentos para más contexto:

- `/kdd/kdd.md` — Referencia completa de KDD
- `/kdd/docs/convenciones-escritura.md` — Convenciones de escritura
- `/kdd/docs/STYLE-GUIDE.md` — Guía de estilo completa
- `/kdd/docs/reference/artifacts.md` — Catálogo de artefactos
- `/kdd/docs/reference/frontmatter.md` — Schemas de frontmatter
