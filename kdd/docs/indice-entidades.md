# Índice de Entidades KDD

> Sistema de indexación automática para entidades del dominio, optimizado para uso por Claude, scripts y humanos.

## Descripción General

El índice de entidades es una caché estática que lista todas las entidades conocidas en el repositorio de especificaciones. Facilita:

1. **Contexto rápido para Claude**: Cargar `specs/_index.md` proporciona visibilidad inmediata de todas las entidades
2. **Auto-enlazado**: El validador usa el índice para detectar menciones sin enlazar
3. **Navegación humana**: Referencia rápida para encontrar archivos de especificación
4. **Validación semántica**: Verificar que las referencias apunten a entidades existentes

---

## Archivos Generados

| Archivo | Formato | Uso Principal |
|---------|---------|---------------|
| `specs/_index.md` | Markdown | Lectura humana, contexto de Claude |
| `specs/_index.json` | JSON | Uso programático en scripts |

### specs/_index.md

Documento Markdown con tablas organizadas por tipo de entidad:

- **Entidades de Dominio**: Aggregates, Entities, Value Objects
- **Eventos**: Eventos del sistema (EVT-*)
- **Reglas de Negocio**: Reglas de proceso (`BR-XXX-NNN`)
- **Casos de Uso**: UC-NNN
- **Requisitos**: Grupos (REQ-NNN-*) e individuales (REQ-NNN.M)
- **Procesos**: PRC-NNN

Incluye también una lista completa de **términos de búsqueda** reconocidos para auto-enlazado.

### specs/_index.json

Estructura JSON para uso programático:

```json
{
  "generatedAt": "2025-12-11T22:37:27.500Z",
  "totalEntities": 159,
  "byType": {
    "entity": 11,
    "event": 9,
    "rule": 8,
    "individual-rule": 45,
    "use-case": 10,
    "requirement": 10,
    "individual-requirement": 65,
    "process": 1
  },
  "entities": [
    {
      "name": "Reto",
      "id": null,
      "aliases": ["Retos", "Challenge", "Problema"],
      "type": "entity",
      "subtype": null,
      "path": "02-domain/entities/Reto.md",
      "line": null,
      "parentId": null,
      "searchTerms": ["reto", "retos", "challenge", "problema"]
    },
    {
      "name": "Dependencia secuencial de rondas",
      "id": "BR-RONDA-003",
      "aliases": ["BR-RONDA-003"],
      "type": "rule",
      "subtype": "business-rule",
      "path": "02-domain/rules/BR-RONDA-003.md",
      "line": 1,
      "parentId": null,
      "searchTerms": ["br-ronda-003", "dependencia secuencial"]
    }
  ]
}
```

---

## Regeneración del Índice

### Comando

```bash
bun run specs:index
```

### Cuándo Regenerar

El índice debe regenerarse cuando:

| Situación | Acción |
|-----------|--------|
| Se crea una nueva entidad | Regenerar |
| Se renombra una entidad | Regenerar |
| Se añaden aliases en frontmatter | Regenerar |
| Se añaden reglas/requisitos individuales | Regenerar |
| Se modifica contenido sin cambiar estructura | No necesario |
| Antes de ejecutar validación completa | Recomendado |

### Automatización Sugerida

#### Pre-commit hook (opcional)

```bash
# .husky/pre-commit
bun run specs:index
git add specs/_index.md specs/_index.json
```

#### En CI/CD

```yaml
# .github/workflows/validate-specs.yml
- name: Regenerate entity index
  run: bun run specs:index

- name: Validate specifications
  run: bun run validate:specs:ci
```

### Salida del Comando

```
🔍 Escaneando entidades en specs/...
   Encontradas 159 entidades
✅ Generado: specs/_index.json
✅ Generado: specs/_index.md

📊 Resumen:
   entity: 11
   event: 9
   individual-requirement: 65
   individual-rule: 45
   process: 1
   requirement: 10
   rule: 8
   use-case: 10
```

---

## Uso en Claude y Comandos

### Cargar Contexto de Entidades

Para que Claude tenga acceso rápido a todas las entidades al escribir o revisar especificaciones:

```markdown
<!-- En un comando .claude/commands/*.md -->
Primero, lee el índice de entidades:
- `specs/_index.md` para contexto completo
```

### Ejemplo: Comando /analyze-entities

El comando `/analyze-entities` usa el índice para detectar menciones de entidades sin enlazar en un archivo específico.

### Uso Programático

```typescript
// En un script
import indexData from '../specs/_index.json'

// Buscar entidad por nombre
const reto = indexData.entities.find(e => e.name === 'Reto')

// Filtrar por tipo
const rules = indexData.entities.filter(e => e.type === 'rule')

// Buscar por término
const term = 'sesion'
const matches = indexData.entities.filter(e =>
  e.searchTerms.includes(term)
)
```

---

## Estructura de Entidades Indexadas

### Campos de EntityEntry

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | string | Nombre canónico (del H1 o nombre de archivo) |
| `id` | string? | ID único (BR-RONDA-003, REQ-001.1, etc.) |
| `aliases` | string[] | Nombres alternativos del frontmatter |
| `type` | enum | entity, event, rule, use-case, requirement, process |
| `kind` | enum? | entity, role, system (del frontmatter) |
| `subtype` | enum? | individual-rule, individual-requirement |
| `path` | string | Ruta relativa desde specs/ |
| `line` | number? | Línea donde se define (para sub-entidades) |
| `parentId` | string? | Entidad padre (para sub-entidades) |
| `searchTerms` | string[] | Términos normalizados para búsqueda |

### Variantes de Entidades por `kind`

Todas las variantes se almacenan en `entities/` pero se distinguen por su frontmatter:

| kind | Descripción | Convención de nombre | Ejemplo |
|------|-------------|---------------------|---------|
| `entity` | Entidad de dominio con ciclo de vida | PascalCase | `Reto.md`, `Sesión.md` |
| `role` | Rol/actor que interactúa con el sistema | PascalCase | `Propietario.md`, `Usuario.md` |
| `system` | Sistema externo / integración | **MAYÚSCULAS** | `ORACLE.md`, `SAP.md` |

> **Nota**: Los sistemas externos se escriben completamente en MAYÚSCULAS tanto en el nombre del archivo como en las referencias wiki-link: `[[ORACLE]]`, `[[SAP]]`.

### Detección de Sub-entidades

El indexador detecta automáticamente reglas y requisitos individuales dentro de archivos padre:

```markdown
<!-- En BR-RONDA-003.md -->
## BR-RONDA-003: Dependencia secuencial
...
```

```markdown
<!-- En REQ-001-Crear-Reto.md -->
## REQ-001.1: Creación de Reto (Event-Driven)
...

## REQ-001.2: Validación de Longitud de Título
...
```

---

## Directorios Escaneados

El indexador busca entidades en estos directorios:

| Directorio | Tipo |
|------------|------|
| `specs/02-domain/entities/` | entity |
| `specs/02-domain/events/` | event |
| `specs/02-domain/rules/` | rule |
| `specs/03-behavior/use-cases/` | use-case |
| `specs/03-behavior/requirements/` | requirement |
| `specs/03-behavior/processes/` | process |

También soporta estructura legacy sin prefijos numéricos (`specs/domain/`, `specs/behavior/`).

---

## Integración con Validador

El validador semántico (`bun run validate:specs`) usa el índice para:

1. **Verificar enlaces rotos**: `[[Entidad]]` debe apuntar a una entidad conocida
2. **Detectar menciones sin enlazar**: Texto que coincide con entidades pero no está enlazado
3. **Validar referencias cruzadas**: EVT-*, UC-*, BR-* deben existir
4. **Sugerir correcciones**: Propone el enlace correcto basado en similitud

---

## Troubleshooting

### El índice muestra 0 entidades

**Causa**: Los directorios de specs tienen una estructura diferente a la esperada.

**Solución**: Verificar que existan los directorios `specs/02-domain/` y `specs/03-behavior/` con los subdirectorios correctos.

### Una entidad no aparece en el índice

**Causas posibles**:
1. El archivo no tiene extensión `.md`
2. El archivo empieza con `_` (ignorado por convención)
3. El archivo está en un directorio no escaneado

### Los términos de búsqueda no coinciden

**Causa**: La normalización elimina tildes y convierte a minúsculas.

**Solución**: Añadir aliases en el frontmatter del archivo:

```yaml
---
aliases:
  - Término alternativo
  - Otro nombre
---
```

---

## Referencias

- [Validación de Especificaciones](./validacion-especificaciones.md)
- [Convenciones de Escritura](./convenciones-escritura.md)
- [Script: generate-index.ts](/scripts/spec-validator/generate-index.ts)
