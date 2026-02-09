---
title: "Cómo cambiar un requisito existente"
audience: [pm, dev, tech-lead]
type: how-to
reading_time: "5 min"
status: draft
---

# Cómo cambiar un requisito existente

> Para: PM, Desarrolladores, Tech Leads · Tiempo: 5 min · Tipo: How-to

Esta guía te enseña a modificar una especificación KDD existente cuando los requisitos cambian. Aprenderás a encontrar el spec afectado, editarlo correctamente, propagar cambios a specs relacionados y gestionar el PR de revisión.

---

## Cuándo usar este flujo

Aplica este flujo cuando:

- Un stakeholder modifica un requisito de negocio existente.
- Descubres que una **Business Rule (BR)** documentada es incorrecta.
- Necesitas cambiar el comportamiento de un **Command (CMD)** ya implementado.
- Un **Use Case (UC)** requiere un nuevo flujo alternativo.

No uses este flujo para añadir features nuevas. Para eso, consulta [Cómo desarrollar una feature nueva](new-feature.md).

---

## Paso 1: Identifica el spec afectado

Antes de editar, encuentra el spec que documenta el requisito que cambiará.

### Si conoces el identificador

Si tienes el ID del artefacto (ej: `BR-PROYECTO-005`, `CMD-002`, `UC-001`), ve directamente al archivo correspondiente:

```bash
# Business Rule
specs/01-domain/rules/BR-PROYECTO-005.md

# Command
specs/02-behavior/commands/CMD-002-UpdateProyecto.md

# Use Case
specs/02-behavior/use-cases/UC-001-Crear-Proyecto.md
```

### Si NO conoces el identificador

Busca por concepto o entidad usando herramientas de búsqueda:

```bash
# Grep: buscar por término de dominio
grep -r "Proyecto terminado" specs/01-domain/

# Grep: buscar por comportamiento
grep -r "UpdateProyecto" specs/02-behavior/

# Glob: listar todos los specs de una entidad
ls specs/01-domain/rules/BR-PROYECTO-*.md
```

También puedes consultar el índice de artefactos en `specs/01-domain/rules/_index.md` o `specs/02-behavior/use-cases/_index.md`.

---

## Paso 2: Crea una rama y edita el spec

Las specs se tratan como código. Crea una rama de trabajo antes de editar.

### Crear la rama

```bash
git checkout -b docs/update-br-proyecto-005
```

Usa el prefijo `docs/` para cambios de specs, seguido del ID del artefacto.

### Editar el spec

Abre el archivo y modifica la sección correspondiente. Aplica las reglas del [Style Guide](../STYLE-GUIDE.md):

- Usa voz activa.
- Una idea por oración.
- Mantén la terminología consistente.
- Actualiza ejemplos si el cambio los afecta.

**Ejemplo real**: Cambiar la regla de transición de estado en `BR-PROYECTO-005.md`.

**Antes** (spec original):

```markdown
## Declaración

Un Proyecto transiciona a estado `terminado` cuando alcanza el límite fijo de 4 tareas completadas.
```

**Después** (spec modificada):

```markdown
## Declaración

Un Proyecto transiciona a estado `terminado` cuando alcanza el límite fijo de 4 tareas completadas, o cuando el Usuario lo cierra manualmente via [[CMD-023-TerminarProyecto]]. Una vez terminado, no puede cambiar de estado.
```

### Actualizar el status del spec

Si el spec estaba en `status: approved`, cámbialo a `status: review`:

```yaml
---
id: BR-PROYECTO-005
kind: business-rule
status: review          # Cambió de "approved" a "review"
created: 2024-12-13
---
```

Esto indica que el spec modificado necesita aprobación antes de considerarse actualizado.

---

## Paso 3: Propaga cambios a specs relacionados

Modificar un spec puede afectar otros artefactos. Busca y actualiza los specs que dependan del que modificaste.

### Identifica dependencias

Busca wiki-links que apunten al spec modificado:

```bash
# Buscar referencias al spec modificado
grep -r "\[\[BR-PROYECTO-005\]\]" specs/
```

Ejemplo de resultado:

```
specs/02-behavior/commands/CMD-023-TerminarProyecto.md:28:- [[BR-PROYECTO-005]] - Transición a terminado
specs/02-behavior/use-cases/UC-001-Crear-Proyecto.md:155:| [[BR-PROYECTO-005]] | Transición automática a terminado |
```

### Actualiza specs relacionados

Abre cada archivo referenciado y verifica si el cambio afecta su contenido.

**Ejemplo**: Si agregaste un nuevo comando (`CMD-023-TerminarProyecto`) para cerrar manualmente un Proyecto, actualiza el `UC-001` para mencionar el flujo manual:

**Antes**:

```markdown
## Extensiones / Flujos Alternativos

(No existe flujo para cierre manual)
```

**Después**:

```markdown
## Extensiones / Flujos Alternativos

### 10a. Usuario cierra el Proyecto manualmente

1. El Usuario ejecuta [[CMD-023-TerminarProyecto]]
2. El Sistema transiciona el Proyecto a estado `terminado`
3. El Sistema emite evento `EVT-Proyecto-Terminado` con motivo "cierre_manual"
```

### Tipos de propagación comunes

| Cambio en | Afecta a | Qué actualizar |
|---|---|---|
| **Business Rule (BR)** | Commands (CMD), Use Cases (UC) | Precondiciones, validaciones, errores |
| **Command (CMD)** | Use Cases (UC), Queries (QRY) | Flujos alternativos, eventos generados |
| **Use Case (UC)** | Commands (CMD), UI Views (UI) | Pasos del flujo, criterios de aceptación |
| **Entity (ENT)** | Todo lo que la referencie | Atributos, estados, invariantes |

---

## Paso 4: Actualiza el código (si aplica)

Si el spec modificado ya está implementado, el código debe reflejar el cambio. De lo contrario, el spec y el código divergen.

### Determina si hay código afectado

Busca el identificador del spec en el código:

```bash
# Buscar referencias al spec en código
grep -r "BR-PROYECTO-005" apps/
```

Si encuentras referencias, actualiza el código en el mismo PR.

**Ejemplo**: El cambio en `BR-PROYECTO-005` requiere añadir lógica para el cierre manual:

```typescript
// apps/api/src/application/use-cases/terminate-proyecto.use-case.ts

export class TerminarProyectoUseCase {
  async execute(input: TerminarProyectoInput): Promise<void> {
    const proyecto = await this.retoRepository.findById(input.proyectoId)

    // Validar BR-PROYECTO-005: solo si está en análisis
    if (proyecto.estado !== 'en_analisis') {
      throw new BusinessRuleError('PROYECTO-301', 'Solo se pueden terminar proyectos en análisis')
    }

    // Transicionar a terminado
    proyecto.estado = 'terminado'
    await this.retoRepository.save(proyecto)

    // Emitir evento
    await this.eventBus.publish(new EVTProyectoTerminado({
      proyectoId: proyecto.id,
      motivo: 'cierre_manual',
      timestamp: new Date()
    }))
  }
}
```

### Si NO hay código implementado

Si el spec está en `status: draft` o `status: approved` pero no implementado, no necesitas cambiar código. Solo actualiza el spec. El dev lo leerá cuando implemente.

---

## Paso 5: Actualiza tests afectados

Los tests derivan de specs. Si cambiaste un spec implementado, actualiza los tests correspondientes.

### Tests de validación (BR)

Si modificaste una **Business Rule**, actualiza los tests que validan esa regla:

```typescript
// tests/e2e/proyecto/terminate-proyecto.spec.ts

test('BR-PROYECTO-005: Usuario cierra Proyecto manualmente', async ({ api, db }) => {
  const { proyecto } = await seedProyectoEnAnalisis(db)

  // Ejecutar CMD-023
  const result = await api.terminateProyecto({ proyectoId: proyecto.id })

  expect(result.estado).toBe('terminado')
  expect(result.motivo).toBe('cierre_manual')
})
```

### Tests de casos de uso (UC, CMD)

Si modificaste un **Command** o **Use Case**, actualiza los tests end-to-end:

```typescript
test('UC-001: Usuario cancela creación de Proyecto', async ({ page }) => {
  await page.goto('/proyectos/nuevo')
  await page.fill('input[name="titulo"]', 'Proyecto de prueba')
  await page.click('button:has-text("Cancelar")')

  // Verificar confirmación
  await page.click('button:has-text("Descartar cambios")')
  await expect(page).toHaveURL('/proyectos')
})
```

---

## Paso 6: Commit y PR

Agrupa los cambios relacionados en un solo commit. El mensaje del commit debe referenciar el spec modificado.

### Hacer commit

```bash
# Agregar specs modificados
git add specs/01-domain/rules/BR-PROYECTO-005.md
git add specs/02-behavior/commands/CMD-023-TerminarProyecto.md

# Agregar código y tests si aplica
git add apps/api/src/application/use-cases/terminate-proyecto.use-case.ts
git add tests/e2e/proyecto/terminate-proyecto.spec.ts

# Commit con mensaje descriptivo
git commit -m "$(cat <<'EOF'
docs(specs): update BR-PROYECTO-005 to support manual termination

Changes:
- BR-PROYECTO-005: Add manual termination via CMD-023
- CMD-023: Document TerminarProyecto command
- UC-001: Add extension for manual close flow
- Implement TerminarProyectoUseCase
- Add e2e test for manual termination

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

### Crear el PR

```bash
git push -u origin docs/update-br-proyecto-005
gh pr create --title "Update BR-PROYECTO-005: Add manual termination" \
  --body "$(cat <<'EOF'
## Cambio

Modificar [[BR-PROYECTO-005]] para permitir que el Usuario cierre un Proyecto manualmente mediante [[CMD-023-TerminarProyecto]], además del cierre automático por límite de tareas.

## Specs modificados

- `BR-PROYECTO-005.md`: Añadida regla de cierre manual
- `CMD-023-TerminarProyecto.md`: Nuevo comando (creado)
- `UC-001-Crear-Proyecto.md`: Extensión 10a para flujo manual

## Código implementado

- `TerminarProyectoUseCase`: Lógica de negocio
- Tests e2e: Caso de cierre manual

## Checklist

- [x] Spec modificado sigue el Style Guide
- [x] Status cambiado a `review`
- [x] Specs relacionados actualizados
- [x] Código implementado refleja el cambio
- [x] Tests actualizados

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Paso 7: Revisión y aprobación

El Tech Lead o PM Lead revisa el PR usando el [Checklist de revisión](../guides/tech-lead.md#checklist-de-revisión).

### Qué revisa el Tech Lead

- **Consistencia**: El spec modificado no contradice otros artefactos.
- **Completitud**: Todas las secciones requeridas están actualizadas.
- **Trazabilidad**: Los wiki-links apuntan a specs válidos.
- **Código alineado**: Si hay implementación, refleja el cambio de spec.

### Aprobar el cambio

Si el PR pasa la revisión:

1. El reviewer aprueba el PR.
2. El Tech Lead cambia el `status` del spec a `approved` en un commit adicional.
3. Se hace merge a `main`.

Si el cambio afecta una **Value Unit (UV)**, actualiza el tracking de la UV para reflejar el cambio:

```markdown
## Scope (end-to-end)

### Implemented
- [x] CMD-001-CreateProyecto — CRUD básico

### Pending — Iteration: Cierre Manual
- [ ] CMD-023-TerminarProyecto v1.0 — Nuevo
- [ ] BR-PROYECTO-005 v2.0 — Actualizar con cierre manual
```

---

## Problemas comunes

### "No sé si mi cambio afecta otros specs"

Usa búsqueda de texto para encontrar referencias. Busca el ID del spec modificado en todo `/specs`:

```bash
grep -r "BR-PROYECTO-005" specs/
```

Cada resultado es un spec que potencialmente debes revisar.

### "El código ya cambió pero la spec no"

Esto es deuda técnica. Actualiza la spec para que refleje la realidad del código. Si el cambio fue intencional, crea un **Architecture Decision Record (ADR)** explicando por qué cambió.

Consulta [Manejar conflictos spec vs implementación](../guides/tech-lead.md#manejar-conflictos-spec-vs-implementación) en la guía para Tech Leads.

### "Mi cambio rompe specs aprobados"

Si tu cambio invalida specs ya aprobados, es un cambio mayor. Convoca una revisión con PM y Tech Lead antes de proceder. Considera si el cambio:

- Rompe compatibilidad hacia atrás.
- Afecta features en producción.
- Requiere migración de datos.

---

## Siguiente paso

Has aprendido a modificar specs existentes de forma controlada. Para profundizar en cómo revisar cambios de specs en PRs, consulta la [Guía para Tech Leads](../guides/tech-lead.md).

Si necesitas documentar un bug fix, consulta [Cómo documentar un bug fix](bug-fix.md).
