# Convenciones de Escritura KDD

> Esta rule se aplica siempre que trabajes con especificaciones en `/specs`.

## Filosofía: Documentación Fluida

Prioriza **legibilidad humana** sobre estructura pseudo-código:

- **Narrativa sobre tablas**: Descripciones en prosa que fluyan naturalmente
- **Relaciones implícitas**: "Cada Proyecto pertenece a un [[Usuario]]" (el indexador las infiere)
- **Sin redundancia**: Cada concepto se define en un solo lugar
- **Mínimo necesario**: Solo secciones que aporten valor real

## Capitalización

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Entidades de dominio | Primera mayúscula | El **Usuario** crea un **Proyecto** |
| Sistemas externos | TODO MAYÚSCULAS | Los datos vienen de **ORACLE** |
| En código | camelCase/snake_case | `const miembro = ...` |

## Wiki-Links

```markdown
[[Entidad]]                    # Link simple
[[Entidad|texto alternativo]]  # Con alias
[[Tarea|tareas]]            # Plural
```

**Cuándo enlazar:**
- Primera mención en sección: SÍ
- Menciones posteriores: opcional
- En títulos/headers: NO
- En código: NO

## Identificadores

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Use Case | `UC-NNN` | UC-001, UC-012 |
| Requirement | `REQ-NNN` / `REQ-NNN.M` | REQ-001, REQ-001.2 |
| Event | `EVT-Entidad-Accion` | EVT-Proyecto-Creado |
| Business Rule | `BR-ENTIDAD-NNN` | BR-SPRINT-003 |
| Process | `PRC-NNN` | PRC-001 |
| ADR | `ADR-NNNN` | ADR-0001 |

Los identificadores siempre van en MAYÚSCULAS y pueden enlazarse: `[[UC-001-Crear-Proyecto]]`

## Voz Activa

Preferir voz activa con sujeto claro:

```markdown
# Correcto
El Sistema SHALL rechazar la solicitud.
El Usuario DEBE confirmar la acción.

# Evitar
Se rechaza la solicitud.
La acción debe confirmarse.
```

## Keywords EARS (Requisitos)

Las palabras clave van en **MAYÚSCULAS**:
- `WHEN` - Evento disparador
- `IF` - Condición
- `WHILE` - Estado continuo
- `WHERE` - Característica opcional
- `SHALL` / `SHALL NOT` - Obligación/Prohibición

```markdown
WHEN the Usuario submits the form,
the Sistema SHALL create a new Proyecto
  AND SHALL emit EVT-Proyecto-Creado.
```

## Estados de Entidades

Documentar en sección **Estados** separada, no inline en Atributos:

```markdown
## Atributos
| `estado` | enum | Estado del ciclo de vida (ver [[#Estados]]) |

## Estados
| Estado | ID | Descripción |
| **Borrador** | `borrador` | En configuración, no listo |
| **Preparado** | `preparado` | Listo para iniciar |
```

## Frontmatter YAML

Orden de campos:
```yaml
---
id: UC-001                    # Identificador primero
kind: use-case                # Tipo de documento
status: draft                 # Estado
actor: Usuario                # Campos específicos
tags: [core, proyecto]            # Metadatos al final
---
```

## Bloques de Código

Siempre especificar lenguaje: `typescript`, `gherkin`, `mermaid`
