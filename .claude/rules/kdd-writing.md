# Convenciones de Escritura KDD

> Esta rule se aplica siempre que trabajes con especificaciones en `/specs`.

## Filosofia: Documentacion Fluida

Prioriza **legibilidad humana** sobre estructura pseudo-codigo:

- **Narrativa sobre tablas**: Descripciones en prosa que fluyan naturalmente
- **Relaciones implicitas**: "Cada Proyecto pertenece a un [[Usuario]]" (el indexador las infiere)
- **Sin redundancia**: Cada concepto se define en un solo lugar
- **Minimo necesario**: Solo secciones que aporten valor real

## Capitalizacion

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Entidades de dominio | Primera mayuscula | El **Usuario** crea un **Proyecto** |
| Sistemas externos | TODO MAYUSCULAS | Los datos vienen de **ORACLE** |
| En codigo | camelCase/snake_case | `const proyecto = ...` |

## Wiki-Links

```markdown
[[Entidad]]                    # Link simple
[[Entidad|texto alternativo]]  # Con alias
[[Sesion|sesiones]]            # Plural
```

**Cuando enlazar:**
- Primera mencion en seccion: SI
- Menciones posteriores: opcional
- En titulos/headers: NO
- En codigo: NO

## Identificadores

| Tipo | Patron | Ejemplo |
|------|--------|---------|
| Use Case | `UC-NNN` | UC-001, UC-012 |
| Requirement | `REQ-NNN` / `REQ-NNN.M` | REQ-001, REQ-001.2 |
| Event | `EVT-Entidad-Accion` | EVT-Proyecto-Creado |
| Business Rule | `BR-ENTIDAD-NNN` | BR-PROYECTO-003 |
| Process | `PRC-NNN` | PRC-001 |
| ADR | `ADR-NNNN` | ADR-0001 |

Los identificadores siempre van en MAYUSCULAS y pueden enlazarse: `[[UC-001-Crear-Proyecto]]`

## Voz Activa

Preferir voz activa con sujeto claro:

```markdown
# Correcto
El Sistema SHALL rechazar la solicitud.
El Usuario DEBE confirmar la accion.

# Evitar
Se rechaza la solicitud.
La accion debe confirmarse.
```

## Keywords EARS (Requisitos)

Las palabras clave van en **MAYUSCULAS**:
- `WHEN` - Evento disparador
- `IF` - Condicion
- `WHILE` - Estado continuo
- `WHERE` - Caracteristica opcional
- `SHALL` / `SHALL NOT` - Obligacion/Prohibicion

```markdown
WHEN the Usuario submits the form,
the Sistema SHALL create a new Proyecto
  AND SHALL emit EVT-Proyecto-Creado.
```

## Estados de Entidades

Documentar en seccion **Estados** separada, no inline en Atributos:

```markdown
## Atributos
| `estado` | enum | Estado del ciclo de vida (ver [[#Estados]]) |

## Estados
| Estado | ID | Descripcion |
| **Borrador** | `borrador` | En configuracion, no listo |
| **Activo** | `activo` | Listo para usar |
```

## Frontmatter YAML

Orden de campos:
```yaml
---
id: UC-001                    # Identificador primero
kind: use-case                # Tipo de documento
status: draft                 # Estado
actor: Usuario                # Campos especificos
tags: [core, proyecto]        # Metadatos al final
---
```

## Bloques de Codigo

Siempre especificar lenguaje: `typescript`, `gherkin`, `mermaid`
