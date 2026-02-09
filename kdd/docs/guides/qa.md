---
title: "Guía KDD para QA"
audience: [qa]
type: how-to
reading_time: "10 min"
status: draft
---

# Guía KDD para QA

> Para: QA Engineers · Tiempo: 10 min · Tipo: How-to

Esta guía te muestra cómo derivar casos de test directamente de las especificaciones KDD. Al terminar, sabrás dónde buscar los criterios de aceptación y cómo convertirlos en tests verificables.

## Tu rol en KDD

Como QA Engineer, tu trabajo es verificar que el sistema cumple con lo documentado. KDD te da los criterios de aceptación de forma explícita: cada flujo, cada regla de negocio y cada comando describe qué debe pasar y qué no debe pasar.

Tu punto de partida son tres tipos de artefactos:

| Artefacto | Dónde vive | Qué extraes |
|-----------|-----------|-------------|
| **Use Case (UC)** | `specs/02-behavior/use-cases/` | Flujos completos, excepciones, estados |
| **Command (CMD)** | `specs/02-behavior/commands/` | Validaciones de input, precondiciones, errores |
| **Business Rule (BR)** | `specs/01-domain/rules/` | Reglas invariables del dominio |

---

## Dónde están los criterios

### Use Cases: flujos y excepciones

Un **Use Case (UC)** describe la interacción completa entre el usuario y el sistema. Cada UC contiene secciones que mapean directamente a tests.

**Secciones clave para QA**:

| Sección | Qué contiene | Cómo lo usas |
|---------|--------------|--------------|
| **Flujo Principal** | Pasos numerados del happy path | Deriva el test case principal |
| **Extensiones** | Excepciones etiquetadas (3a, 4b, etc.) | Deriva edge cases |
| **Postcondiciones** | Estado final esperado | Aserciones del test |
| **Reglas de Negocio Aplicables** | Referencias a BRs | Identifica validation tests |
| **Escenarios de Prueba** | Tabla con test cases sugeridos | Punto de partida rápido |

**Ejemplo real**: Abre `specs/02-behavior/use-cases/UC-001-Crear-Proyecto.md`.

El **Flujo Principal** dice:
```
1. El Usuario accede a la opción "Nuevo Proyecto" desde su dashboard
2. El Sistema muestra el formulario de creación con el campo principal
3. El Usuario ingresa el **título** del proyecto
4. El Sistema valida en tiempo real
5. El Usuario hace clic en "Crear Proyecto"
6. El Sistema crea el Proyecto con estado `borrador`
7. El Sistema redirige al Usuario a la pantalla de configuración
8. El Sistema muestra mensaje de confirmación
```

Esto se convierte en tu **happy path test**:
```gherkin
Given el Usuario está autenticado
When el Usuario ingresa título "¿Deberíamos expandir al mercado europeo?"
  And hace clic en "Crear Proyecto"
Then el Sistema crea un Proyecto con estado "borrador"
  And el Sistema redirige a /proyectos/:id/personas
  And el Sistema muestra "Proyecto creado correctamente"
```

Las **Extensiones** te dan los edge cases:

| Extensión en el UC | Test case derivado |
|--------------------|-------------------|
| `4a. Título demasiado largo` | Ingresar 101 caracteres → mostrar error → botón deshabilitado |
| `4b. Título vacío` | Dejar campo vacío → botón deshabilitado → mostrar hint |
| `9a. Error al persistir` | Simular fallo de BD → mostrar mensaje de error → no crear entidad |

### Commands: validaciones y errores

Un **Command (CMD)** define una operación atómica que cambia el estado del sistema. Cada CMD tiene una tabla de errores posibles.

**Secciones clave para QA**:

| Sección | Qué contiene | Cómo lo usas |
|---------|--------------|--------------|
| **Input** | Parámetros con sus validaciones | Deriva tests de input inválido |
| **Preconditions** | Condiciones requeridas antes de ejecutar | Deriva tests de estado incorrecto |
| **Postconditions** | Estado final garantizado | Aserciones del test |
| **Possible Errors** | Tabla código-condición-mensaje | Deriva tests de error |

**Ejemplo real**: Abre `specs/02-behavior/commands/CMD-001-CreateProyecto.md`.

La tabla **Possible Errors** dice:

| Code | Condition | Message |
|------|-----------|---------|
| PROYECTO-001 | Empty title | "El título es obligatorio" |
| PROYECTO-002 | Title too long | "El título no puede exceder 100 caracteres" |
| PROYECTO-003 | Limit exceeded | "Has alcanzado el límite de 50 proyectos activos" |

Cada fila es un test case:

```gherkin
# Test 1: Validar título vacío
Given el Usuario está autenticado
When el Usuario envía CreateProyecto con titulo ""
Then el Sistema responde con código PROYECTO-001
  And el Sistema muestra mensaje "El título es obligatorio"
  And no se crea ningún Proyecto

# Test 2: Validar título demasiado largo
Given el Usuario está autenticado
When el Usuario envía CreateProyecto con titulo de 101 caracteres
Then el Sistema responde con código PROYECTO-002
  And el Sistema muestra mensaje "El título no puede exceder 100 caracteres"
  And no se crea ningún Proyecto

# Test 3: Validar límite de proyectos
Given el Usuario tiene exactamente 50 proyectos activos
When el Usuario envía CreateProyecto con titulo válido
Then el Sistema responde con código PROYECTO-003
  And el Sistema muestra mensaje "Has alcanzado el límite de 50 proyectos activos"
  And no se crea ningún Proyecto
```

Las **Preconditions** te dicen qué estados preparar antes del test. Si un CMD dice `Preconditions: User has not exceeded proyectos activos limit`, tu test necesita un setup que cree 50 proyectos activos.

### Business Rules: validaciones de dominio

Un **Business Rule (BR)** define una restricción invariable. Las BRs protegen la integridad del modelo de dominio.

**Secciones clave para QA**:

| Sección | Qué contiene | Cómo lo usas |
|---------|--------------|--------------|
| **Declaración** | Regla en lenguaje natural | Entiendes qué protege |
| **Cuándo aplica** | Tabla de triggers | Identificas cuándo validar |
| **Qué pasa si se incumple** | Tabla escenario-comportamiento | Deriva tests de validación |
| **Formalización** | EARS keywords (WHEN, SHALL) | Especificación precisa |
| **Ejemplos** | Casos válidos e inválidos | Tests directos |

**Ejemplo real**: Abre `specs/01-domain/rules/BR-PROYECTO-005.md`.

La sección **Qué pasa si se incumple** dice:

| Escenario | Comportamiento del Sistema |
|-----------|---------------------------|
| Intento de reabrir Proyecto terminado | El Sistema RECHAZA la operación con error "Un proyecto terminado no puede cambiar de estado" |
| Intento de crear sesión en Proyecto terminado | El Sistema RECHAZA la operación con error "No se pueden crear tareas en un proyecto terminado" |

Cada fila es un test de validación:

```gherkin
# Test 1: Rechazar reapertura de Proyecto terminado
Given un Proyecto en estado "terminado"
When el Usuario intenta cambiar el estado a "preparado"
Then el Sistema rechaza la operación
  And el Sistema muestra "Un proyecto terminado no puede cambiar de estado"
  And el estado permanece como "terminado"

# Test 2: Rechazar sesión en Proyecto terminado
Given un Proyecto en estado "terminado"
When el Usuario intenta crear una Tarea
Then el Sistema rechaza la operación
  And el Sistema muestra "No se pueden crear tareas en un proyecto terminado"
  And no se crea ninguna Tarea
```

Los **Ejemplos** te dan casos concretos:

```markdown
### Casos Válidos
- ✓ Proyecto con 4 tareas completadas → termina automáticamente tras la cuarta
- ✓ Proyecto con 2 tareas completadas → Usuario lo cierra manualmente via CMD-023

### Casos Inválidos
- ✗ Proyecto terminado vuelve a "preparado"
- ✗ Proyecto terminado acepta nuevas tareas
```

Convierte los casos inválidos en tests. Cada ✗ debe generar un error o rechazo.

---

## Cómo derivar test cases paso a paso

### Paso 1: Identifica la feature

Pregunta: "¿Qué estoy probando?" La respuesta es un **Use Case** o un **Command**.

Ejemplo: "Estoy probando la creación de Proyectos". Busca `UC-001-Crear-Proyecto.md`.

### Paso 2: Extrae el happy path del UC

Lee la sección **Flujo Principal**. Cada paso numerado es una acción o una verificación.

Convierte los pasos en un test Gherkin:
- Los pasos del usuario son `Given` (setup) y `When` (acción).
- Los pasos del sistema son `Then` (aserción).

### Paso 3: Extrae los edge cases de las Extensiones

Lee la sección **Extensiones**. Cada extensión etiquetada (3a, 4b) describe un camino alternativo.

Crea un test por extensión. El test debe probar que el sistema responde correctamente cuando ocurre la condición excepcional.

### Paso 4: Extrae validaciones del CMD relacionado

El UC referencia comandos en su sección **Reglas de Negocio Aplicables** o en los pasos del flujo. Abre cada CMD.

Lee la tabla **Possible Errors**. Crea un test por cada código de error.

Lee la tabla **Input**. Para cada parámetro con validación (min/max, pattern), crea un test con valor inválido.

### Paso 5: Verifica las BRs relacionadas

El UC o el CMD referencian Business Rules. Abre cada BR.

Lee la sección **Qué pasa si se incumple**. Crea un test por cada escenario de incumplimiento.

### Paso 6: Organiza los tests

Agrupa por comportamiento, no por artefacto. Un describe block por cada aspecto que estás probando.

```typescript
describe('UC-001: Crear Proyecto', () => {
  describe('Happy Path', () => {
    it('should create proyecto with valid title')
  })

  describe('Validaciones de Input', () => {
    it('should reject empty title')
    it('should reject title exceeding 100 characters')
  })

  describe('BR-PROYECTO-002: Límite de Proyectos', () => {
    it('should reject when user has 50 proyectos activos')
  })
})
```

---

## Ejemplo completo: De spec a test

### Spec: UC-001-Crear-Proyecto.md

**Flujo Principal (extracto)**:
```
5. El Usuario hace clic en "Crear Proyecto"
6. El Sistema crea el Proyecto con estado `borrador`
7. El Sistema redirige al Usuario a /proyectos/:id/personas
8. El Sistema muestra mensaje "Proyecto creado correctamente"
```

**Extensión 4a**:
```
### 4a. Título demasiado largo
1. El Sistema muestra indicador visual de error
2. El Sistema muestra mensaje: "El título no puede exceder 100 caracteres"
3. El Usuario corrige el título
```

**Reglas de Negocio Aplicables**:
```
| Regla | Descripción |
|-------|-------------|
| [[Proyecto#INV-PROYECTO-001]] | El título es obligatorio y tiene máximo 100 caracteres |
| [[BR-PROYECTO-002]] | Un Usuario puede tener máximo 50 proyectos no terminados |
```

### Test derivado

```typescript
// tests/e2e/UC-001-crear-proyecto.spec.ts
import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth.fixture'

test.describe('UC-001: Crear Proyecto', () => {

  test.describe('Happy Path', () => {
    test('should create proyecto with valid title', async ({ page }) => {
      // Given: Usuario autenticado en dashboard
      await login(page, 'test@example.com')
      await page.goto('/dashboard')

      // When: Usuario crea un proyecto con título válido
      await page.getByRole('button', { name: 'Nuevo Proyecto' }).click()
      await page.getByPlaceholder('Escribe el título de tu proyecto').fill(
        '¿Deberíamos expandir al mercado europeo?'
      )
      await page.getByRole('button', { name: 'Crear Proyecto' }).click()

      // Then: Sistema crea el proyecto y redirige
      await expect(page).toHaveURL(/\/proyectos\/[\w-]+\/personas/)
      await expect(page.getByText('Proyecto creado correctamente')).toBeVisible()
    })
  })

  test.describe('INV-PROYECTO-001: Validación de Título', () => {
    test('should reject title exceeding 100 characters', async ({ page }) => {
      // Given: Usuario en formulario de creación
      await login(page, 'test@example.com')
      await page.goto('/proyectos/nuevo')

      // When: Usuario ingresa título de 101 caracteres
      const longTitle = 'A'.repeat(101)
      await page.getByPlaceholder('Escribe el título de tu proyecto').fill(longTitle)

      // Then: Sistema muestra error y deshabilita botón
      await expect(page.getByText('El título no puede exceder 100 caracteres')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Crear Proyecto' })).toBeDisabled()
    })

    test('should reject empty title', async ({ page }) => {
      // Given: Usuario en formulario de creación
      await login(page, 'test@example.com')
      await page.goto('/proyectos/nuevo')

      // When: Usuario deja título vacío
      const titleInput = page.getByPlaceholder('Escribe el título de tu proyecto')
      await titleInput.fill('')

      // Then: Sistema deshabilita botón
      await expect(page.getByRole('button', { name: 'Crear Proyecto' })).toBeDisabled()
    })
  })

  test.describe('BR-PROYECTO-002: Límite de Proyectos Activos', () => {
    test('should reject when user has 50 proyectos activos', async ({ page }) => {
      // Given: Usuario con exactamente 50 proyectos activos
      // Nota: Requiere seed de datos de prueba
      await login(page, 'user-with-50-proyectos@example.com')
      await page.goto('/proyectos/nuevo')

      // When: Usuario intenta crear un proyecto adicional
      await page.getByPlaceholder('Escribe el título de tu proyecto').fill('Proyecto 51')
      await page.getByRole('button', { name: 'Crear Proyecto' }).click()

      // Then: Sistema muestra error de límite
      await expect(page.getByText('Has alcanzado el límite de 50 proyectos activos')).toBeVisible()

      // And: No se crea ningún proyecto
      await page.goto('/dashboard')
      const proyectoCount = await page.locator('[data-testid="proyecto-card"]').count()
      expect(proyectoCount).toBe(50)
    })
  })
})
```

---

## Cómo reportar huecos en las specs

A veces encuentras un comportamiento del sistema que no está documentado. Tu trabajo es reportarlo.

### Qué hacer cuando falta documentación

1. **Identifica el hueco**: ¿Qué comportamiento observaste que no está en la spec?
2. **Busca en capas superiores**: Puede estar documentado en un nivel más alto (OBJ, UC) pero falta detalle en el nivel bajo (CMD, BR).
3. **Crea un issue**: Usa el template de GitHub con estas secciones:
   - **Artefacto afectado**: `UC-001`, `CMD-001`, `BR-PROYECTO-005`
   - **Comportamiento observado**: Qué hace el sistema ahora
   - **Documentación actual**: Qué dice la spec (o qué falta)
   - **Propuesta**: Qué debería decir la spec
4. **Etiqueta**: `gap:documentation`, `qa`

**Ejemplo de issue**:

```markdown
## Artefacto afectado
`CMD-001-CreateProyecto`

## Comportamiento observado
Cuando el Usuario ingresa un título con solo espacios ("   "),
el Sistema lo acepta y crea un Proyecto con título vacío en la BD.

## Documentación actual
La spec dice:
> titulo: string, 1-100 chars, not empty/whitespace only

Pero no está implementado el trim ni la validación de whitespace-only.

## Propuesta
Actualizar la sección **Input** de CMD-001:
- Añadir `.trim()` en la validación
- Añadir refine: título trimmed no puede tener longitud 0

Actualizar la sección **Possible Errors**:
- PROYECTO-001: cambiar condición a "Empty or whitespace-only title"
```

### Qué hacer cuando descubres un bug

Si el sistema hace algo que contradice la spec:

1. **Confirma que la spec es correcta**: Pregunta al PM o Tech Lead si la spec refleja lo que se quiere.
2. **Si la spec es correcta**: El bug está en el código. Reporta el bug con referencia a la spec.
3. **Si la spec está desactualizada**: Reporta el gap de documentación primero, luego verifica si el código actual es el comportamiento deseado.

---

## Cómo verificar trazabilidad

Cada requisito debe tener tests que lo cubran. Cada test debe referenciar su spec de origen.

### Verificar cobertura: spec → test

1. **Abre un UC**: Ejemplo, `UC-001-Crear-Proyecto.md`.
2. **Cuenta los escenarios**: Flujo principal + extensiones + reglas aplicables.
3. **Busca los tests correspondientes**: Busca `UC-001` en `tests/e2e/`.
4. **Verifica que cada escenario tiene un test**: Si falta uno, créalo.

**Herramienta futura**: El proyecto tiene un plan para generar una matriz de trazabilidad automática. Mientras tanto, verifica manualmente.

### Verificar cobertura: test → código

1. **Ejecuta el test con coverage**: `bun test:coverage`.
2. **Revisa el reporte**: ¿El test ejecuta el código relacionado?
3. **Si no cubre**: El test está mal escrito o el código está en el lugar incorrecto.

---

## Herramientas y comandos

### Comandos de test

| Comando | Qué hace |
|---------|----------|
| `bun test` | Ejecuta todos los tests |
| `bun test:e2e` | Ejecuta solo tests E2E (Playwright) |
| `bun test:watch` | Ejecuta tests en modo watch |
| `bun test:coverage` | Genera reporte de cobertura |

### Herramientas de automatización KDD

Estas herramientas aceleran tu trabajo de QA desde Claude Code y la terminal:

| Herramienta | Qué hace | Cómo invocar |
|---|---|---|
| `/generate-e2e` | Genera test E2E Playwright desde spec REQ | Escribe `/generate-e2e` en Claude Code |
| `/kdd-trace` | Visualiza trazabilidad entre capas | `/kdd-trace` |
| `/kdd-gaps` | Detecta huecos en specs | `/kdd-gaps` |
| `/kdd-verify` | Verifica que el código cumple la spec | `/kdd-verify` |
| `pipeline:coverage` | Verifica cobertura BR → CMD | `bun run pipeline:coverage` |
| `pipeline:check` | Valida spec + código + tests | `bun run pipeline:check UV-004` |

**Ejemplo**: Escribe `/kdd-trace` y el skill construye la matriz OBJ → UC → CMD → código → test para la feature que indiques.

> **Ver**: [Pipeline de validación](../reference/pipeline.md) · [Catálogo completo](../reference/tooling.md)

---

## Checklist: ¿Listo para probar?

Antes de empezar a escribir tests para una feature, verifica:

- [ ] Existe un **Use Case (UC)** que describe el flujo
- [ ] Existen **Commands (CMD)** para las operaciones críticas
- [ ] Las **Business Rules (BR)** referenciadas están documentadas
- [ ] El UC tiene sección **Escenarios de Prueba** (punto de partida rápido)
- [ ] El UC tiene sección **Postcondiciones** (para tus aserciones)
- [ ] Los CMDs tienen tabla **Possible Errors** completa
- [ ] Las BRs tienen sección **Qué pasa si se incumple**

Si falta algo, reporta el gap antes de escribir tests.

---

## Siguiente paso

Lee el tutorial [De Spec a Test](../tutorials/spec-to-test.md) para un ejercicio práctico completo usando un UC real del proyecto.

**Referencia rápida**:
- [Catálogo de Artefactos](../reference/artifacts.md): Estructura completa de UC, CMD, BR
- [Cheatsheet](../reference/cheatsheet.md): Referencia de una página para consulta rápida
