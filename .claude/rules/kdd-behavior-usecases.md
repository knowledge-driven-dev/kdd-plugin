---
paths:
  - specs/02-behavior/use-cases/**
  - specs/domains/*/02-behavior/use-cases/**
---

# Casos de Uso KDD

> Aplica cuando trabajas en `specs/02-behavior/use-cases/`

## Nombrado de Archivo

Patrón: `UC-NNN-Nombre-Descriptivo.md`

Ejemplos:
- `UC-001-Crear-Proyecto.md`
- `UC-012-Iniciar-Tarea.md`
- `UC-003-Configurar-Miembros.md`

## Frontmatter Requerido

```yaml
---
id: UC-NNN                    # Obligatorio, patrón UC-\d{3}
kind: use-case                # Literal
version: 1                    # Número de versión
status: draft                 # draft|proposed|approved|deprecated
actor: Usuario                # Actor principal
domain: taskflow              # Dominio (opcional)
---
```

## Estructura del Documento

### Secciones Obligatorias

```markdown
# UC-NNN: Título del Caso de Uso

## Description
Objetivo principal y valor que aporta.

## Actors
- **Primary Actor**: [[Usuario]] - Rol y motivación
- **Secondary Actor**: Sistema (opcional)

## Preconditions
1. Condición que debe cumplirse antes de iniciar
2. Estado inicial del sistema

## Main Flow (Happy Path)
1. El Actor realiza la primera acción
2. El Sistema responde
3. El Sistema **valida** los datos
4. El Sistema **persiste** los cambios
5. El Sistema **emite** evento [[EVT-Algo-Ocurrió]]
6. El Sistema muestra confirmación

## Postconditions

### On Success
- Estado final tras éxito
- Entidades creadas/modificadas
- Eventos emitidos

### On Failure
- Estado si falla
- Rollback aplicado
```

### Secciones Opcionales

```markdown
## Triggers
- Acción o evento que inicia el caso de uso

## Extensions / Alternative Flows

### 3a. Validación falla
1. El Sistema detecta datos inválidos
2. El Sistema muestra mensaje de error
3. Vuelve al paso 3

### 5a. Error de persistencia
1. El Sistema detecta error de BD
2. El Sistema hace rollback
3. Fin con error

## Minimal Guarantees
- Garantías incluso si el caso falla

## Business Rules
| Rule | Description |
|------|-------------|
| [[BR-PROYECTO-001]] | Descripción breve |

## Events Emitted
| Event | Description |
|-------|-------------|
| [[EVT-Proyecto-Creado]] | Cuándo se emite |

## Test Scenarios
| ID | Scenario | Expected |
|----|----------|----------|
| TC-001.1 | Descripción | Resultado |
```

## Convenciones del Main Flow

### Verbos del Sistema

- **valida** → comprobación de datos
- **persiste** → guarda en BD
- **emite** → dispara evento
- **notifica** → envía notificación
- **calcula** → lógica de negocio

### Formato de Pasos

```markdown
1. El Usuario ingresa título y descripción
2. El Sistema **valida** que el título no esté vacío
3. El Sistema **persiste** el nuevo [[Proyecto]] con status `borrador`
4. El Sistema **emite** [[EVT-Proyecto-Creado]]
5. El Sistema muestra el Proyecto creado al Usuario
```

## Extensions: Nombrado

Usar número del paso + letra:

```markdown
## Extensions

### 2a. Título vacío
### 2b. Título duplicado
### 3a. Error de base de datos
### 4a. Usuario sin permisos
```

## Postconditions: Detalle de Entidades

```markdown
### On Success

- El [[Proyecto]] está creado con status `borrador`
- El [[Usuario]] es propietario del Proyecto

**Entidades afectadas:**

- Existe un [[Proyecto]] con:
  - `titulo`: valor ingresado
  - `status`: `borrador`
  - `usuario_id`: ID del Usuario actual
```

## Ejemplo Completo

```markdown
---
id: UC-001
kind: use-case
version: 1
status: approved
actor: Usuario
---

# UC-001: Crear Proyecto

## Description

Permite al Usuario crear un nuevo Proyecto para analizar un problema
usando el método de análisis.

## Actors

- **Primary Actor**: [[Usuario]] - Quiere estructurar su pensamiento

## Preconditions

1. El Usuario está autenticado
2. El Usuario tiene puntos disponibles

## Main Flow (Happy Path)

1. El Usuario selecciona "Nuevo Proyecto"
2. El Usuario ingresa título y descripción
3. El Sistema **valida** los datos
4. El Sistema **persiste** el [[Proyecto]] con status `borrador`
5. El Sistema **emite** [[EVT-Proyecto-Creado]]
6. El Sistema redirige al Usuario a configuración del Proyecto

## Extensions

### 3a. Título vacío
1. El Sistema muestra error "El título es obligatorio"
2. Vuelve al paso 2

### 3b. Título excede 200 caracteres
1. El Sistema muestra error "Máximo 200 caracteres"
2. Vuelve al paso 2

## Postconditions

### On Success
- Existe un nuevo [[Proyecto]] con status `borrador`
- El [[Usuario]] es propietario del Proyecto

### On Failure
- No se crea ningún Proyecto
- No se emite ningún evento

## Business Rules

| Rule | Description |
|------|-------------|
| [[BR-PROYECTO-001]] | El título debe tener entre 1 y 200 caracteres |
| [[BR-PROYECTO-002]] | El Usuario debe tener al menos 1 punto |

## Events Emitted

| Event | Description |
|-------|-------------|
| [[EVT-Proyecto-Creado]] | Al crear exitosamente el Proyecto |
```
