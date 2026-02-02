---
paths:
  - specs/02-behavior/use-cases/**
  - specs/domains/*/02-behavior/use-cases/**
---

# Casos de Uso KDD

> Aplica cuando trabajas en `specs/02-behavior/use-cases/`

## Nombrado de Archivo

Patron: `UC-NNN-Nombre-Descriptivo.md`

Ejemplos:
- `UC-001-Crear-Proyecto.md`
- `UC-012-Asignar-Tarea.md`
- `UC-003-Configurar-Equipo.md`

## Frontmatter Requerido

```yaml
---
id: UC-NNN                    # Obligatorio, patron UC-\d{3}
kind: use-case                # Literal
version: 1                    # Numero de version
status: draft                 # draft|proposed|approved|deprecated
actor: Usuario                # Actor principal
domain: my-domain             # Dominio (opcional)
---
```

## Estructura del Documento

### Secciones Obligatorias

```markdown
# UC-NNN: Titulo del Caso de Uso

## Description
Objetivo principal y valor que aporta.

## Actors
- **Primary Actor**: [[Usuario]] - Rol y motivacion
- **Secondary Actor**: Sistema (opcional)

## Preconditions
1. Condicion que debe cumplirse antes de iniciar
2. Estado inicial del sistema

## Main Flow (Happy Path)
1. El Actor realiza la primera accion
2. El Sistema responde
3. El Sistema **valida** los datos
4. El Sistema **persiste** los cambios
5. El Sistema **emite** evento [[EVT-Algo-Ocurrio]]
6. El Sistema muestra confirmacion

## Postconditions

### On Success
- Estado final tras exito
- Entidades creadas/modificadas
- Eventos emitidos

### On Failure
- Estado si falla
- Rollback aplicado
```

### Secciones Opcionales

```markdown
## Triggers
- Accion o evento que inicia el caso de uso

## Extensions / Alternative Flows

### 3a. Validacion falla
1. El Sistema detecta datos invalidos
2. El Sistema muestra mensaje de error
3. Vuelve al paso 3

### 5a. Error de persistencia
1. El Sistema detecta error de BD
2. El Sistema hace rollback
3. Fin con error

## Minimal Guarantees
- Garantias incluso si el caso falla

## Business Rules
| Rule | Description |
|------|-------------|
| [[BR-PROYECTO-001]] | Descripcion breve |

## Events Emitted
| Event | Description |
|-------|-------------|
| [[EVT-Proyecto-Creado]] | Cuando se emite |

## Test Scenarios
| ID | Scenario | Expected |
|----|----------|----------|
| TC-001.1 | Descripcion | Resultado |
```

## Convenciones del Main Flow

### Verbos del Sistema

- **valida** -> comprobacion de datos
- **persiste** -> guarda en BD
- **emite** -> dispara evento
- **notifica** -> envia notificacion
- **calcula** -> logica de negocio

### Formato de Pasos

```markdown
1. El Usuario ingresa titulo y descripcion
2. El Sistema **valida** que el titulo no este vacio
3. El Sistema **persiste** el nuevo [[Proyecto]] con status `borrador`
4. El Sistema **emite** [[EVT-Proyecto-Creado]]
5. El Sistema muestra el Proyecto creado al Usuario
```

## Extensions: Nombrado

Usar numero del paso + letra:

```markdown
## Extensions

### 2a. Titulo vacio
### 2b. Titulo duplicado
### 3a. Error de base de datos
### 4a. Usuario sin permisos
```

## Postconditions: Detalle de Entidades

```markdown
### On Success

- El [[Proyecto]] esta creado con status `borrador`
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

Permite al Usuario crear un nuevo Proyecto para organizar su trabajo.

## Actors

- **Primary Actor**: [[Usuario]] - Quiere organizar su trabajo

## Preconditions

1. El Usuario esta autenticado
2. El Usuario tiene permisos de creacion

## Main Flow (Happy Path)

1. El Usuario selecciona "Nuevo Proyecto"
2. El Usuario ingresa titulo y descripcion
3. El Sistema **valida** los datos
4. El Sistema **persiste** el [[Proyecto]] con status `borrador`
5. El Sistema **emite** [[EVT-Proyecto-Creado]]
6. El Sistema redirige al Usuario a configuracion del Proyecto

## Extensions

### 3a. Titulo vacio
1. El Sistema muestra error "El titulo es obligatorio"
2. Vuelve al paso 2

### 3b. Titulo excede 200 caracteres
1. El Sistema muestra error "Maximo 200 caracteres"
2. Vuelve al paso 2

## Postconditions

### On Success
- Existe un nuevo [[Proyecto]] con status `borrador`
- El [[Usuario]] es propietario del Proyecto

### On Failure
- No se crea ningun Proyecto
- No se emite ningun evento

## Business Rules

| Rule | Description |
|------|-------------|
| [[BR-PROYECTO-001]] | El titulo debe tener entre 1 y 200 caracteres |

## Events Emitted

| Event | Description |
|-------|-------------|
| [[EVT-Proyecto-Creado]] | Al crear exitosamente el Proyecto |
```
