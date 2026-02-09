---
title: "De Spec a Test: Derivar Casos de Prueba"
audience: [qa, dev]
type: tutorial
reading_time: "8 min"
status: draft
---

# De Spec a Test: Derivar Casos de Prueba

> Para: QA + Dev · Tiempo: 8 min · Tipo: Tutorial

En este tutorial vas a derivar casos de test de aceptación a partir de especificaciones KDD reales del proyecto. Al terminar, tendrás un archivo `.spec.ts` completo con tests de happy path, validaciones y reglas de negocio.

## Lo que vas a construir

Vas a tomar tres especificaciones existentes del proyecto TaskFlow:
- **UC-001**: Crear Proyecto (el flujo completo)
- **CMD-001**: CreateProyecto (validaciones y errores)
- **BR-PROYECTO-002**: Límite de proyectos activos (regla de negocio)

Vas a extraer:
- 1 test de happy path (flujo principal)
- 3 tests de validación (input inválido)
- 1 test de regla de negocio (límite de 50 proyectos)

Al final tendrás un archivo ejecutable listo para CI.

---

## Paso 1: Lee el Use Case completo

Abre el archivo `specs/02-behavior/use-cases/UC-001-Crear-Proyecto.md`.

Busca la sección **Flujo Principal**. Este es el happy path. Léelo completo. Identifica:
- Qué hace el usuario (acciones)
- Qué hace el sistema (respuestas)
- Cuál es el estado final (postcondiciones)

**Flujo Principal (extracto)**:
```markdown
1. El Usuario accede a la opción "Nuevo Proyecto" desde su dashboard
2. El Sistema muestra el formulario de creación
3. El Usuario ingresa el título del proyecto
4. El Sistema valida en tiempo real
5. El Usuario hace clic en "Crear Proyecto"
6. El Sistema crea el Proyecto con estado `borrador`
7. El Sistema redirige al Usuario a /proyectos/:id/miembros
8. El Sistema muestra mensaje "Proyecto creado correctamente"
```

Convierte este flujo en un test Gherkin en tu mente:
- Pasos 1-3 son el `Given` (setup del test)
- Paso 5 es el `When` (acción principal)
- Pasos 6-8 son el `Then` (aserciones)

---

## Paso 2: Extrae el happy path

Crea el archivo `tests/e2e/UC-001-crear-proyecto.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth.fixture';

test.describe('UC-001: Crear Proyecto', () => {

  test.describe('Happy Path', () => {
    test('should create proyecto with valid title', async ({ page }) => {
      // Given: Usuario autenticado en dashboard
      await login(page, 'test@example.com');
      await page.goto('/dashboard');

      // When: Usuario crea un proyecto con título válido
      await page.getByRole('button', { name: 'Nuevo Proyecto' }).click();
      await page.getByPlaceholder('Escribe el título de tu proyecto').fill(
        '¿Deberíamos expandir al mercado europeo?'
      );
      await page.getByRole('button', { name: 'Crear Proyecto' }).click();

      // Then: Sistema crea el proyecto y redirige
      await expect(page).toHaveURL(/\/proyectos\/[\w-]+\/miembros/);
      await expect(page.getByText('Proyecto creado correctamente')).toBeVisible();
    });
  });

});
```

**Verifica**:
- Ejecuta el test: `bun test:e2e UC-001`
- El test debe pasar si la app está corriendo

---

## Paso 3: Extrae las validaciones del Command

Abre el archivo `specs/02-behavior/commands/CMD-001-CreateProyecto.md`.

Busca la tabla **Possible Errors**. Esta tabla te da tests de error directo:

| Code | Condition | Message |
|------|-----------|---------|
| PROYECTO-001 | Empty title | "El título es obligatorio" |
| PROYECTO-002 | Title too long | "El título no puede exceder 100 caracteres" |
| PROYECTO-003 | Limit exceeded | "Has alcanzado el límite de 50 proyectos activos" |

Cada fila es un test case. Busca también la tabla **Input** para las reglas de validación:

| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| titulo | string | Yes | 1-100 chars, not empty/whitespace only |

Combina la información. Necesitas tests para:
1. Título vacío → PROYECTO-001
2. Título demasiado largo (>100 caracteres) → PROYECTO-002
3. Título solo con espacios → PROYECTO-001 (whitespace-only)

Añade estos tests a tu archivo:

```typescript
test.describe('Validaciones de Input', () => {

  test('should reject empty title', async ({ page }) => {
    // Given: Usuario en formulario de creación
    await login(page, 'test@example.com');
    await page.goto('/proyectos/nuevo');

    // When: Usuario deja título vacío
    const titleInput = page.getByPlaceholder('Escribe el título de tu proyecto');
    await titleInput.fill('');

    // Then: Sistema deshabilita botón
    await expect(page.getByRole('button', { name: 'Crear Proyecto' })).toBeDisabled();
  });

  test('should reject title exceeding 100 characters', async ({ page }) => {
    // Given: Usuario en formulario de creación
    await login(page, 'test@example.com');
    await page.goto('/proyectos/nuevo');

    // When: Usuario ingresa título de 101 caracteres
    const longTitle = 'A'.repeat(101);
    await page.getByPlaceholder('Escribe el título de tu proyecto').fill(longTitle);

    // Then: Sistema muestra error y deshabilita botón
    await expect(page.getByText('El título no puede exceder 100 caracteres')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Crear Proyecto' })).toBeDisabled();
  });

  test('should reject title with only whitespace', async ({ page }) => {
    // Given: Usuario en formulario de creación
    await login(page, 'test@example.com');
    await page.goto('/proyectos/nuevo');

    // When: Usuario ingresa solo espacios
    await page.getByPlaceholder('Escribe el título de tu proyecto').fill('     ');

    // Then: Sistema deshabilita botón
    await expect(page.getByRole('button', { name: 'Crear Proyecto' })).toBeDisabled();
  });

});
```

**Verifica**:
- Ejecuta los tests: `bun test:e2e UC-001`
- Los tres tests de validación deben pasar

---

## Paso 4: Añade el test de Business Rule

Abre el archivo `specs/01-domain/rules/BR-PROYECTO-002.md`.

Lee la sección **Declaración**:
> Un Usuario puede tener como máximo 50 Proyectos en estados no terminados (borrador, preparado, en_analisis).

Lee la sección **Qué pasa si se incumple**:

| Escenario | Comportamiento del sistema |
|-----------|---------------------------|
| Usuario con 50 proyectos activos intenta crear | Rechazado con error `BR-PROYECTO-002` |
| Mensaje al usuario | "Has alcanzado el límite de 50 proyectos activos. Completa o elimina algunos proyectos para crear nuevos." |

Esto describe exactamente qué debe hacer el test:
1. Setup: Usuario con 50 proyectos activos
2. Acción: Intenta crear un proyecto nuevo
3. Verificación: Sistema rechaza con mensaje específico

Añade este test:

```typescript
test.describe('BR-PROYECTO-002: Límite de Proyectos Activos', () => {

  test('should reject when user has 50 proyectos activos', async ({ page }) => {
    // Given: Usuario con exactamente 50 proyectos activos
    // Nota: Requiere helper de seed o usuario de prueba pre-configurado
    await login(page, 'user-with-50-proyectos@example.com');
    await page.goto('/proyectos/nuevo');

    // When: Usuario intenta crear un proyecto adicional
    await page.getByPlaceholder('Escribe el título de tu proyecto').fill('Proyecto número 51');
    await page.getByRole('button', { name: 'Crear Proyecto' }).click();

    // Then: Sistema muestra error de límite
    await expect(page.getByText('Has alcanzado el límite de 50 proyectos activos')).toBeVisible();

    // And: No se crea ningún proyecto
    await page.goto('/dashboard');
    const proyectoCount = await page.locator('[data-testid="proyecto-card"]').count();
    expect(proyectoCount).toBe(50);
  });

});
```

**Nota sobre el setup**: Este test requiere un usuario de prueba con 50 proyectos activos. Tienes dos opciones:

**Opción A: Usuario pre-configurado**
```typescript
// tests/e2e/fixtures/seed-users.ts
export const USER_WITH_50_PROYECTOS = {
  email: 'user-with-50-proyectos@example.com',
  password: 'test123',
  proyectosActivos: 50,
};
```

**Opción B: Helper de seed dinámico**
```typescript
// tests/e2e/helpers/seed-proyectos.ts
export async function seedProyectos(userId: string, count: number) {
  for (let i = 0; i < count; i++) {
    await createProyecto({ titulo: `Proyecto ${i + 1}`, userId });
  }
}
```

En el test:
```typescript
// Given: Usuario con 50 proyectos
await login(page, 'test@example.com');
const userId = await getUserId(page);
await seedProyectos(userId, 50);
await page.goto('/proyectos/nuevo');
```

**Verifica**:
- Ejecuta el test: `bun test:e2e UC-001`
- El test debe pasar si el seed está configurado

---

## Paso 5: Mapea excepciones a edge cases

Regresa al UC-001. Busca la sección **Extensiones / Flujos Alternativos**.

Cada extensión etiquetada (4a, 4b, 9a) es un edge case. Ya convertiste 4a y 4b en tests de validación. Ahora añade el test para 9a:

**Extensión 9a: Error al persistir en base de datos**
```markdown
1. El Sistema detecta error de persistencia
2. El Sistema NO crea ninguna entidad (rollback)
3. El Sistema registra el error en logs
4. El Sistema muestra: "Error al crear el proyecto. Por favor, intenta nuevamente"
5. El Usuario puede reintentar o cancelar
```

Este test requiere simular un error de BD. Puedes mockearlo:

```typescript
test.describe('Manejo de Errores', () => {

  test('should rollback and show error when database fails', async ({ page }) => {
    // Given: Usuario autenticado
    await login(page, 'test@example.com');

    // And: Simulamos fallo de BD (via MSW o route intercept)
    await page.route('**/api/proyectos', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Database error' }),
      });
    });

    await page.goto('/proyectos/nuevo');

    // When: Usuario intenta crear proyecto
    await page.getByPlaceholder('Escribe el título de tu proyecto').fill('Proyecto de prueba');
    await page.getByRole('button', { name: 'Crear Proyecto' }).click();

    // Then: Sistema muestra mensaje de error
    await expect(page.getByText('Error al crear el proyecto. Por favor, intenta nuevamente')).toBeVisible();

    // And: Usuario permanece en el formulario (no redirige)
    await expect(page).toHaveURL(/\/proyectos\/nuevo/);
  });

});
```

---

## Paso 6: Organiza y documenta

Tu archivo completo debería verse así:

```typescript
// tests/e2e/UC-001-crear-proyecto.spec.ts
// @spec-source: specs/02-behavior/use-cases/UC-001-Crear-Proyecto.md
// @commands: CMD-001-CreateProyecto
// @rules: BR-PROYECTO-002
// @generated-at: 2026-02-07

import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth.fixture';

test.describe('UC-001: Crear Proyecto', () => {

  test.describe('Happy Path', () => {
    test('should create proyecto with valid title', async ({ page }) => {
      // ... (código del paso 2)
    });
  });

  test.describe('Validaciones de Input (CMD-001)', () => {
    test('should reject empty title', async ({ page }) => {
      // ... (código del paso 3)
    });

    test('should reject title exceeding 100 characters', async ({ page }) => {
      // ... (código del paso 3)
    });

    test('should reject title with only whitespace', async ({ page }) => {
      // ... (código del paso 3)
    });
  });

  test.describe('BR-PROYECTO-002: Límite de Proyectos Activos', () => {
    test('should reject when user has 50 proyectos activos', async ({ page }) => {
      // ... (código del paso 4)
    });
  });

  test.describe('Manejo de Errores', () => {
    test('should rollback and show error when database fails', async ({ page }) => {
      // ... (código del paso 5)
    });
  });

});
```

**Agrega comentarios de trazabilidad** al inicio:
- `@spec-source`: Qué UC origina este test
- `@commands`: Qué CMDs cubre
- `@rules`: Qué BRs verifica
- `@generated-at`: Fecha de creación

Estos comentarios permiten rastrear el origen de cada test y detectar specs sin coverage.

---

## Lo que construiste

Tienes un archivo de test E2E completo que cubre:

| Aspecto | Tests | Origen en specs |
|---------|-------|----------------|
| **Flujo completo** | 1 test de happy path | UC-001 Flujo Principal |
| **Validaciones** | 3 tests de input inválido | CMD-001 Possible Errors + Input |
| **Reglas de negocio** | 1 test de límite | BR-PROYECTO-002 Qué pasa si se incumple |
| **Excepciones** | 1 test de error de BD | UC-001 Extensión 9a |

**Total: 6 tests** derivados de 3 especificaciones.

### Mapeo completo

```
specs/02-behavior/use-cases/UC-001-Crear-Proyecto.md
  ├─ Flujo Principal (pasos 1-8)
  │   └─→ test: should create proyecto with valid title
  │
  ├─ Extensión 4a: Título demasiado largo
  │   └─→ test: should reject title exceeding 100 characters
  │
  ├─ Extensión 4b: Título vacío
  │   └─→ test: should reject empty title
  │
  └─ Extensión 9a: Error de persistencia
      └─→ test: should rollback and show error when database fails

specs/02-behavior/commands/CMD-001-CreateProyecto.md
  ├─ Possible Errors: PROYECTO-001
  │   └─→ test: should reject empty title
  │
  ├─ Possible Errors: PROYECTO-002
  │   └─→ test: should reject title exceeding 100 characters
  │
  └─ Input validation: whitespace only
      └─→ test: should reject title with only whitespace

specs/01-domain/rules/BR-PROYECTO-002.md
  └─ Qué pasa si se incumple: Usuario con 50 proyectos
      └─→ test: should reject when user has 50 proyectos activos
```

### Ejecuta el test completo

```bash
# Ejecutar solo este test
bun test:e2e UC-001-crear-proyecto.spec.ts

# Ejecutar con UI de Playwright
bunx playwright test --ui

# Generar reporte HTML
bunx playwright test && bunx playwright show-report
```

---

## Siguiente paso

Ahora que sabes derivar tests de specs:

1. **Aplica el proceso** a otro Use Case del proyecto (UC-002, UC-003)
2. **Verifica la cobertura**: ¿Todos los CMDs tienen tests de error?
3. **Lee la guía completa**: [Guía KDD para QA](../guides/qa.md) tiene más detalles sobre cómo reportar huecos en specs y verificar trazabilidad.

**Referencia rápida**:
- [Catálogo de Artefactos](../reference/artifacts.md): Estructura completa de UC, CMD, BR
- [Cheatsheet](../reference/cheatsheet.md): Referencia de una página
