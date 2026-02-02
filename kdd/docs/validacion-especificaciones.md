# Validación de Especificaciones KDD

> Guía completa del sistema de validación para documentación KDD (Knowledge-Driven Development).

## Resumen

El proyecto cuenta con un sistema de validación en tres niveles que asegura la calidad y consistencia de las especificaciones en `/specs`. Combina validación automática (script) con análisis inteligente (Claude Code).

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE VALIDACIÓN                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   bun run validate:specs     →    /analyze-entities    →    /fix-spec
│   ─────────────────────           ─────────────────         ─────────
│   Validación automática           Análisis IA               Corrección
│   (regex, schemas)                (semántico)               automática
│                                                                 │
│   Gratis, rápido                  Usa suscripción           Usa suscripción
│   Pre-commit / CI                 Claude Code               Claude Code
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Definition of Ready/Done por Artefacto

Esta guia convierte el cambio de estado (`draft` → `review` → `approved`) en un contrato verificable. Cada artefacto debe cumplir un checklist minimo antes de avanzar.

### Reglas Generales (todos los artefactos)

- Tiene `owner` definido (responsable claro).
- Trazabilidad basica completa (links a dependencias directas).
- No hay enlaces rotos (validador en verde).

### Checklists Minimos por Tipo

**Objective (OBJ)**
- Enunciado "Como X, quiero Y, para Z".
- Criterios de exito medibles.
- Link a al menos 1 UC o UV.

**Unidad de Valor (UV)**
- Alcance end-to-end completo (UC + CMD/QRY + REQ + UI).
- Inputs/Outputs definidos.
- Criterios de salida claros.

**Use Case (UC)**
- Flujo principal completo con pre/postcondiciones.
- Al menos 1 REQ derivado.

**Requirement (REQ)**
- Sintaxis EARS valida.
- Al menos 1 ejemplo Gherkin.
- Referencia a UC y BR si aplica.

**UI View (UI)**
- Estados documentados (loading/empty/error/success).
- Commands/Queries asociados.

**Command/Query (CMD/QRY)**
- Input/Output definidos.
- Reglas validadas o supuestos de lectura documentados.

### Politica de Estados

- `draft` → `review`: cumple checklist minimo.
- `review` → `approved`: revision humana + validacion automatica sin errores.
- `approved` → `deprecated`: debe enlazar al reemplazo.

## 1. Validador Automático (spec-validator)

### Ubicación
```
scripts/spec-validator/
├── index.ts                 # CLI principal
├── lib/
│   ├── parser.ts            # Parser de markdown + frontmatter
│   ├── entity-index.ts      # Índice de entidades conocidas
│   ├── template-loader.ts   # Carga schemas desde plantillas
│   └── reporter.ts          # Formateo de resultados
├── validators/
│   ├── frontmatter.ts       # Nivel 1: Validación de metadatos
│   ├── structure.ts         # Nivel 2: Estructura del documento
│   └── semantics.ts         # Nivel 3: Referencias y enlaces
└── schemas/
    ├── frontmatter.ts       # Schemas Zod (legacy)
    └── structure.ts         # Templates de secciones (legacy)
```

### Niveles de Validación

#### Nivel 1: Frontmatter
Valida que los metadatos YAML cumplan con el schema definido en las plantillas.

```yaml
---
id: UC-001                    # Requerido, patrón específico
kind: use-case                # Literal según tipo
status: draft                 # Enum: draft|proposed|approved|deprecated
actor: Usuario Registrado     # Requerido para use-cases
---
```

**Errores típicos:**
- Campo requerido faltante
- Formato de ID incorrecto
- Valor no permitido en enum

#### Nivel 2: Estructura
Verifica que el documento tenga las secciones requeridas según su tipo.

**Ejemplo para Use Case:**
- `## Descripción` (requerido)
- `## Precondiciones` (requerido)
- `## Flujo Principal` (requerido)
- `## Flujos Alternativos` (opcional)
- `## Postcondiciones` (requerido)

**Errores típicos:**
- Sección requerida faltante
- Múltiples H1
- Sección vacía

#### Nivel 3: Semántico
Analiza referencias cruzadas y enlaces wiki.

**Validaciones:**
- Wiki-links `[[entidad]]` apuntan a entidades existentes
- Eventos mencionados (`EVT-*`) están documentados
- Reglas referenciadas (`BR-XXX-NNN`) existen
- Requisitos individuales (`REQ-NNN.M`) están definidos

**Detección de sub-entidades:**
El índice detecta automáticamente los requisitos individuales dentro de sus archivos padre (ej: `REQ-001.1`, `REQ-001.2`). Las reglas de negocio (`BR-XXX-NNN`) se detectan a partir de sus propios archivos en `specs/02-domain/rules/`.

### Comandos

```bash
# Validar todo /specs
bun run validate:specs

# Validar con detalles (muestra info y sugerencias)
bun run validate:specs -v

# Validar solo un nivel
bun run validate:specs --level frontmatter
bun run validate:specs --level structure
bun run validate:specs --level semantics

# Validar directorio específico
bun run validate:specs specs/02-domain

# Auto-corregir enlaces (nivel semántico)
bun run validate:specs --fix

# Formato para GitHub Actions
bun run validate:specs -o github

# Formato JSON (para integración)
bun run validate:specs -o json
```

### Salida Ejemplo

```
🔍 Spec Validator - KDD Documentation Linter

  Target: specs
  Level:  all
  Fix:    disabled

  Found 56 spec files

📊 Índice de Entidades:
   Total: 159 entidades indexadas
   Entidades: 11
   Eventos: 9
   Reglas: 53
   Casos de Uso: 10
   Requisitos: 75
   └─ Requisitos individuales: 65

specs/02-domain/rules/BR-RONDA-003.md
  ✗ Falta campo requerido "id" en frontmatter:1
  ⚠ La sección "Implementación" parece estar vacía:45

behavior/use-cases/UC-001-Crear-Reto.md
  ⚠ El enlace [[EVT-Reto-Creado]] no corresponde a ninguna entidad:83
  ℹ "Usuario" debería ser un enlace a [[Usuario]]:15

──────────────────────────────────────────────────
Resumen: 56 archivos, 3 errores, 12 warnings

✗ Validación fallida
```

---

## 2. Análisis Inteligente con Claude Code

Para análisis más profundo que requiere comprensión semántica, usamos slash commands que aprovechan la suscripción de Claude Code.

### `/analyze-entities <archivo>`

Análisis IA profundo de un archivo para detectar:

- **Menciones explícitas**: Entidades conocidas sin enlazar
- **Sinónimos y variaciones**: Plurales, tildes, términos equivalentes
- **Referencias implícitas**: "el usuario" → `[[Usuario]]`
- **Abreviaciones**: UC-001 → `[[UC-001-Crear-Reto]]`
- **Entidades faltantes**: Conceptos que deberían documentarse

**Uso:**
```
/analyze-entities specs/vision/charter.md
```

**Cuándo usarlo:**
- Después de crear un documento nuevo
- Cuando el validador automático reporta muchos "info"
- Para documentos complejos con muchas referencias

### `/list-entities`

Genera un índice completo de todas las entidades del sistema.

**Uso:**
```
/list-entities
```

**Cuándo usarlo:**
- Para obtener visión general del dominio
- Antes de crear nuevas entidades (evitar duplicados)
- Para documentación o onboarding

### `/fix-spec <archivo>`

Corrige automáticamente problemas detectados.

**Uso:**
```
/fix-spec specs/vision/charter.md
```

**Qué corrige:**
- Enlaces rotos con nombre similar
- Menciones sin enlazar (alta confianza)
- Frontmatter incompleto

**Qué NO corrige:**
- Entidades que no existen
- Secciones faltantes
- Problemas que requieren decisión humana

---

## 3. Plantillas KDD

Las validaciones se basan en plantillas ubicadas en `/kdd/templates/`.

### Estructura de una Plantilla

```markdown
---
# @type: use-case
# @description: Caso de uso del sistema
# @file-pattern: ^UC-\d{3}.*\.md$

id: UC-NNN                    # @required @pattern: ^UC-\d{3}$
kind: use-case                # @literal: use-case
status: draft                 # @enum: draft|proposed|approved|deprecated
actor: Actor Principal        # @required
---

# UC-NNN: Nombre del Caso de Uso <!-- required pattern: ^UC-\d{3}: -->

## Descripción <!-- required -->

## Precondiciones <!-- required -->

## Flujo Principal <!-- required -->
<!-- expects: gherkin -->

## Postcondiciones <!-- required -->
```

### Anotaciones Disponibles

**Para frontmatter:**
- `@required` - Campo obligatorio
- `@optional` - Campo opcional (por defecto)
- `@pattern: regex` - Validar formato
- `@enum: val1|val2|val3` - Valores permitidos
- `@literal: value` - Valor exacto esperado
- `@type: string|number|boolean|array|date`
- `@contains: value` - Array debe contener valor
- `@description: texto` - Descripción del campo

**Para secciones:**
- `<!-- required -->` - Sección obligatoria
- `<!-- optional -->` - Sección opcional
- `<!-- alias: "Alt1|Alt2" -->` - Nombres alternativos
- `<!-- expects: mermaid|json|gherkin|typescript -->` - Contenido esperado

### Plantillas Disponibles

| Tipo | Archivo | Descripción |
|------|---------|-------------|
| use-case | `use-case.template.md` | Casos de uso |
| requirement | `requirement.template.md` | Requisitos EARS |
| entity | `entity.template.md` | Entidades de dominio |
| event | `event.template.md` | Eventos del sistema |
| rule | `rule.template.md` | Reglas de negocio |
| process | `process.template.md` | Procesos/flujos |
| story | `story.template.md` | User stories |
| nfr | `nfr.template.md` | Requisitos no funcionales |
| adr | `adr.template.md` | Architecture Decision Records |
| prd | `prd.template.md` | Product Requirements Document |
| ui-component | `ui-component.template.md` | Componentes UI |
| ui-view | `ui-view.template.md` | Vistas/páginas UI |
| ui-flow | `ui-flow.template.md` | Flujos de navegación UI |

---

## 4. Integración CI/CD

### Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Validar solo archivos modificados en /specs
CHANGED_SPECS=$(git diff --cached --name-only | grep "^specs/.*\.md$")

if [ -n "$CHANGED_SPECS" ]; then
  echo "Validando especificaciones modificadas..."
  bun run validate:specs $CHANGED_SPECS

  if [ $? -ne 0 ]; then
    echo "❌ Validación fallida. Corrige los errores antes de commitear."
    exit 1
  fi
fi
```

### GitHub Actions

```yaml
# .github/workflows/validate-specs.yml
name: Validate Specs

on:
  pull_request:
    paths:
      - 'specs/**/*.md'
      - 'kdd/templates/**/*.md'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - run: bun install

      - name: Validate specifications
        run: bun run validate:specs -o github
```

---

## 5. Flujo de Trabajo Recomendado

### Al Crear un Documento Nuevo

```bash
# 1. Copiar plantilla
cp kdd/templates/use-case.template.md specs/03-behavior/use-cases/UC-011-Nuevo.md

# 2. Editar contenido
# ... escribir el caso de uso ...

# 3. Validar
bun run validate:specs specs/03-behavior/use-cases/UC-011-Nuevo.md -v

# 4. Análisis profundo (opcional)
/analyze-entities specs/03-behavior/use-cases/UC-011-Nuevo.md

# 5. Corregir
/fix-spec specs/03-behavior/use-cases/UC-011-Nuevo.md
```

### Validación Periódica

```bash
# 1. Validación completa
bun run validate:specs -v

# 2. Revisar warnings por tipo
bun run validate:specs --level frontmatter
bun run validate:specs --level structure
bun run validate:specs --level semantics

# 3. Regenerar caché de entidades (si se añadieron/modificaron entidades)
bun run specs:index

# 4. Generar listado para revisión manual
/list-entities
```

### Antes de PR

```bash
# Validación estricta (debe pasar sin errores)
bun run validate:specs

# Si hay warnings importantes, analizar
/analyze-entities specs/archivo-con-warnings.md
```

---

## 6. Troubleshooting

### "No se pudieron cargar las plantillas KDD"
- Verificar que existe `/kdd/templates/`
- Los archivos deben terminar en `.template.md`
- El frontmatter debe tener `# @type: nombre`

### "Entidad no encontrada" pero existe
- Regenerar el índice: `bun run specs:index`
- Verificar que el archivo está en directorio escaneado (`02-domain/`, `03-behavior/`)
- El nombre debe coincidir (case-insensitive)
- Ver [Índice de Entidades](./indice-entidades.md) para más detalles

### Validador muy lento
- Usar `--level` para validar solo un nivel
- Especificar directorio concreto en lugar de todo `/specs`
- El índice de entidades se regenera en cada ejecución; considerar usar `specs/_index.json` como caché

### Wiki-link no detectado
- Formato correcto: `[[Nombre]]` o `[[Nombre|alias]]`
- Sin espacios después de `[[` o antes de `]]`
- El target debe existir como entidad

---

## Referencias

- [Índice de Entidades](./indice-entidades.md) - Sistema de indexación y caché de entidades
- [Convenciones de Escritura](./convenciones-escritura.md) - Guía de estilo para especificaciones
- [Plantillas KDD](/kdd/templates/_schema.md) - Guía de formato de plantillas
- [spec-validator README](/scripts/spec-validator/README.md) - Documentación técnica del validador
- [CLAUDE.md](/CLAUDE.md) - Instrucciones generales del proyecto
