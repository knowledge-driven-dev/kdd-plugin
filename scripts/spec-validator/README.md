# Spec Validator

Validador de especificaciones KDD (Knowledge-Driven Development) para el proyecto Six Hat App.

## Descripción

Este validador asegura que los documentos de especificación en `/specs` cumplan con las plantillas y convenciones definidas en la guía KDD. Implementa tres niveles de validación progresivos.

## Instalación

Las dependencias se instalan automáticamente con el proyecto:

```bash
bun install
```

## Uso

### Comandos básicos

```bash
# Validar todas las especificaciones
bun run validate:specs

# Validar con auto-corrección de enlaces
bun run validate:specs:fix

# Validar un directorio específico
bun run validate:specs specs/02-domain

# Formato para GitHub Actions (CI)
bun run validate:specs:ci
```

### Opciones

| Opción | Descripción |
|--------|-------------|
| `--level <nivel>` | Nivel de validación: `frontmatter`, `structure`, `semantics`, `domain`, `all` (default: `all`) |
| `--output <formato>` | Formato de salida: `console`, `json`, `github` (default: `console`) |
| `--domain <nombre>` | Validar solo un dominio específico (modo multi-dominio) |
| `--check-dependencies` | Validar dependencias entre dominios |
| `--fix` | Auto-corregir enlaces de entidades |
| `-v, --verbose` | Mostrar detalles y sugerencias |
| `-h, --help` | Mostrar ayuda |

### Ejemplos

```bash
# Solo validar frontmatter (rápido)
bun run validate:specs --level frontmatter

# Validar estructura de los use cases
bun run validate:specs specs/03-behavior/use-cases --level structure

# Exportar resultados a JSON
bun run validate:specs -o json > validation-report.json

# Modo verbose con todas las sugerencias
bun run validate:specs -v
```

## Niveles de Validación

### Nivel 1: Frontmatter

Valida que el frontmatter YAML cumpla con el schema esperado según el tipo de documento.

**Qué valida:**
- Campos requeridos (`id`, `status`, `actor`, etc.)
- Formato de IDs (`UC-001`, `REQ-001`, `EVT-xxx`)
- Valores permitidos para enums (`status: draft|proposed|approved|deprecated`)
- Tags requeridos por tipo (`entity`, `event`)

**Ejemplo de error:**
```
behavior/use-cases/UC-005.md
  ⚠ "actor": se esperaba string, se recibió undefined
```

### Nivel 2: Estructura

Valida que el documento tenga las secciones (headings) requeridas según su plantilla.

**Qué valida:**
- Presencia de H1 único
- Secciones obligatorias por tipo de documento
- Secciones vacías (warning)
- Contenido específico (diagramas mermaid, bloques gherkin)

**Secciones por tipo:**

| Tipo | Secciones requeridas |
|------|---------------------|
| Use Case | Descripción, Actores, Precondiciones, Flujo Principal, Postcondiciones |
| Requirement | Al menos un REQ-XXX.X |
| Entity | Descripción, Atributos |
| Event | Descripción, Payload |
| Rule | Al menos un RUL-XXX-NNN |
| ADR | Contexto, Decisión, Consecuencias |

**Ejemplo de error:**
```
domain/entities/NuevaEntidad.md
  ✗ Falta la sección requerida "Atributos"
```

### Nivel 3: Semántico

Valida la coherencia de referencias y sugiere enlaces faltantes.

**Qué valida:**
- Wiki-links rotos (`[[EntidadInexistente]]`)
- Menciones de entidades sin enlazar
- Referencias cruzadas (eventos mencionados, UCs referenciados)
- Consistencia de nomenclatura

**Qué puede auto-corregir (con `--fix`):**
- Añadir `[[]]` a menciones de entidades conocidas
- Corregir capitalización de enlaces

**Ejemplo de warning:**
```
behavior/use-cases/UC-001.md
  ⚠ El enlace [[EVT-Order-Created]] no corresponde a ninguna entidad conocida
  ⚠ El evento "EVT-Order-Created" no tiene definición en /domain/events/
```

## Arquitectura

```
scripts/spec-validator/
├── index.ts                         # CLI y orquestación
├── spec-validator.config.ts         # Configuración personalizable
├── migrate-to-multi-domain.ts       # Script de migración a multi-dominio
├── generate-index.ts                # Generador de índices
├── README.md                        # Esta documentación
│
├── lib/
│   ├── parser.ts                    # Parser de markdown + extracción de frontmatter
│   ├── entity-index.ts              # Índice de entidades (soporta multi-dominio)
│   ├── domain.ts                    # Parsing y validación de manifests de dominio
│   ├── reporter.ts                  # Formateo de resultados
│   └── template-loader.ts           # Cargador de templates
│
├── schemas/
│   ├── frontmatter.ts               # Schemas Zod por tipo de documento
│   └── structure.ts                 # Definición de secciones por tipo
│
├── validators/
│   ├── frontmatter.ts               # Validador nivel 1
│   ├── structure.ts                 # Validador nivel 2
│   ├── semantics.ts                 # Validador nivel 3
│   ├── domain-validator.ts          # Validador nivel 4 (multi-dominio)
│   └── readiness.ts                 # Validador de readiness
│
└── hooks/
    └── pre-commit                   # Git hook
```

### Flujo de validación

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Archivos   │────▶│    Parser    │────▶│   SpecFile  │
│    .md      │     │ (gray-matter │     │  (AST +     │
└─────────────┘     │  + remark)   │     │  metadata)  │
                    └──────────────┘     └──────┬──────┘
                                                │
                    ┌───────────────────────────┼───────────────────────────┐
                    │                           │                           │
                    ▼                           ▼                           ▼
           ┌────────────────┐         ┌────────────────┐         ┌────────────────┐
           │  Frontmatter   │         │   Structure    │         │   Semantics    │
           │   Validator    │         │   Validator    │         │   Validator    │
           │  (Zod schema)  │         │  (templates)   │         │ (entity index) │
           └───────┬────────┘         └───────┬────────┘         └───────┬────────┘
                   │                          │                          │
                   └──────────────────────────┼──────────────────────────┘
                                              │
                                              ▼
                                     ┌────────────────┐
                                     │    Reporter    │
                                     │ (console/json/ │
                                     │    github)     │
                                     └────────────────┘
```

## Tipos de Documento Soportados

| Tipo | Identificación | Ejemplo |
|------|---------------|---------|
| `use-case` | Prefijo `UC-`, path `/use-cases/`, kind `use_case` | `UC-001-CreateOrder.md` |
| `requirement` | Prefijo `REQ-`, path `/requirements/`, kind `requirements` | `REQ-001-CreateOrder.md` |
| `entity` | Path `/entities/`, tag `entity` | `Order.md` |
| `event` | Prefijo `EVT-`, path `/events/`, tag `event` | `EVT-Order-Created.md` |
| `rule` | Prefijo `RUL-`, path `/rules/`, kind `rule` | `RUL-ORDER.md` |
| `process` | Prefijo `PRC-`, path `/processes/`, kind `process` | `PRC-001-FulfillOrder.md` |
| `prd` | Prefijo `PRD-`, kind `prd` | `PRD-MVP.md` |
| `story` | Prefijo `US-` o `STORY-`, kind `story` | `US-001.md` |
| `nfr` | Prefijo `NFR-`, kind `nfr` | `NFR-Performance.md` |
| `adr` | Prefijo `ADR-`, kind `adr` | `ADR-0001.md` |

## Configuración

Crea un archivo `.spec-validator.config.ts` en la raíz del proyecto para personalizar:

```typescript
import type { ValidatorConfig } from './scripts/spec-validator/spec-validator.config'

const config: Partial<ValidatorConfig> = {
  // Reglas a ignorar
  ignoreRules: [
    'structure/empty-section',
    'semantics/unlinked-entity',
  ],

  // Archivos a ignorar
  ignorePaths: [
    '**/TEMPLATE*.md',
    '**/WIP/**',
  ],

  // Tratar warnings como errores (para CI estricto)
  warningsAsErrors: true,

  // Entidades custom que no tienen archivo propio
  customEntities: [
    { name: 'Sistema', type: 'concept' },
    { name: 'IA', type: 'external' },
  ],

  // Términos a ignorar en detección semántica
  ignoreTerms: [
    'usuario',
    'sistema',
    'error',
  ],
}

export default config
```

## Integración con CI/CD

### GitHub Actions

El workflow `.github/workflows/validate-specs.yml` ejecuta automáticamente la validación en:
- Push a archivos en `specs/`
- Pull requests que modifiquen specs

Los errores aparecen como anotaciones en el PR.

### Pre-commit Hook

Instalar el hook para validar antes de cada commit:

```bash
# Copiar el hook
cp scripts/spec-validator/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# O crear un symlink
ln -sf ../../scripts/spec-validator/hooks/pre-commit .git/hooks/pre-commit
```

El hook solo valida archivos modificados en el commit (rápido).

Para saltar la validación en casos excepcionales:
```bash
git commit --no-verify -m "WIP: trabajo en progreso"
```

## Extender el Validador

### Añadir nuevo tipo de documento

1. **Añadir schema de frontmatter** en `schemas/frontmatter.ts`:
```typescript
export const miTipoFrontmatterSchema = z.object({
  id: z.string().regex(/^MIT-\d{3}/),
  // ...
})

// Añadir al mapa
frontmatterSchemas['mi-tipo'] = miTipoFrontmatterSchema
```

2. **Añadir template de estructura** en `schemas/structure.ts`:
```typescript
const miTipoTemplate: StructureTemplate = {
  requiresH1: true,
  sections: [
    { name: 'Descripción', level: 2, required: true },
    // ...
  ],
}

// Añadir al mapa
structureTemplates['mi-tipo'] = miTipoTemplate
```

3. **Añadir detección de tipo** en `lib/parser.ts`:
```typescript
// En inferDocType()
if (fileName.startsWith('MIT-')) return 'mi-tipo'
```

### Añadir nueva regla de validación

1. Crear la lógica en el validador apropiado
2. Retornar un `ValidationResult` con:
   - `level`: 'error' | 'warning' | 'info'
   - `rule`: identificador único (ej: 'structure/mi-regla')
   - `message`: descripción del problema
   - `line`: línea del problema (opcional)
   - `suggestion`: cómo corregirlo (opcional)

## Troubleshooting

### "El enlace [[X]] no corresponde a ninguna entidad conocida"

**Causa**: El wiki-link apunta a algo que no tiene archivo en `/specs`.

**Soluciones**:
1. Crear el archivo de la entidad referenciada
2. Añadir la entidad a `customEntities` en la configuración
3. Usar el alias correcto si la entidad existe con otro nombre

### "Falta la sección requerida X"

**Causa**: El documento no tiene una sección que la plantilla marca como obligatoria.

**Soluciones**:
1. Añadir la sección con `## Nombre de Sección`
2. Verificar que el nombre coincida (se aceptan variantes, ver `alternatives` en el template)

### Muchos warnings en archivos legacy

Añade los paths a `ignorePaths` en la configuración:
```typescript
ignorePaths: ['**/legacy/**', '**/v1/**']
```

## Multi-Domain Support

The validator supports multi-domain KDD structure for large applications with multiple bounded contexts.

### Detecting Multi-Domain Mode

The validator automatically detects multi-domain mode if `specs/domains/` directory exists.

### Domain-Specific Commands

```bash
# Validate a specific domain
bun run validate:specs --domain sessions

# Validate domain dependencies
bun run validate:specs --check-dependencies

# Only run domain-level validation
bun run validate:specs --level domain
```

### Cross-Domain References

Multi-domain specs can use cross-domain references:

```markdown
# Reference in same domain
[[Entity]]                    # Looks in current domain, then core

# Explicit cross-domain reference
[[core::Usuario]]             # User in core domain
[[billing::Credito]]          # Credit in billing domain
[[_shared::XP-AUDIT-001]]     # Shared policy
```

### Migration to Multi-Domain

Use the migration script to convert from monolithic to multi-domain structure:

```bash
# Analyze current structure and get suggestions
bun run migrate:specs --analyze

# Initialize multi-domain structure
bun run migrate:specs --init-structure

# Extract a domain (dry run first)
bun run migrate:specs --extract-domain billing --entities Invoice,Payment --dry-run

# Extract a domain
bun run migrate:specs --extract-domain billing --entities Invoice,Payment
```

See `/kdd/docs/multi-domain.md` for complete documentation.

## Roadmap

- [x] Multi-domain support
- [ ] Validación de diagramas Mermaid (sintaxis)
- [ ] Detección de duplicados de contenido
- [ ] Reporte de cobertura de specs vs código
- [ ] Plugin para Obsidian (validación en tiempo real)
- [ ] Generación de índice de trazabilidad
