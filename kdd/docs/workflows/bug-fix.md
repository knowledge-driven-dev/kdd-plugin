---
title: "Cómo Documentar un Bug Fix en KDD"
audience: [dev, qa, tech-lead]
type: how-to
reading_time: "3 min"
status: draft
---

# Cómo Documentar un Bug Fix en KDD

> **Para**: Devs, QA, Tech Leads — **Tiempo**: 3 min — **Tipo**: How-to

Esta guía describe cómo manejar un bug desde la perspectiva de documentación KDD. El proceso determina si el problema está en el código (implementación incorrecta) o en la spec (conocimiento incompleto), corrige el origen, y actualiza todo lo relacionado.

---

## Problema

Un bug reportado puede originarse en dos lugares: el código no implementa correctamente la spec, o la spec no captura un caso de uso real. Corregir solo el código sin actualizar la spec (o viceversa) genera inconsistencias. El equipo pierde confianza en las specs.

---

## Flujo de trabajo

Sigue estos cinco pasos en orden. Cada paso produce un resultado verificable.

### 1. Identifica la spec relacionada

Determina qué artefactos KDD describen el comportamiento afectado por el bug.

**Qué buscar**:
- **Use Case (UC)**: Si el bug ocurre en un flujo de usuario
- **Business Rule (BR)**: Si el bug involucra una validación o restricción de negocio
- **Command (CMD)**: Si el bug ocurre al ejecutar una operación
- **Entity**: Si el bug está en los estados o transiciones de una entidad

**Dónde buscar**:
- `specs/01-domain/entities/` para definiciones de entidades
- `specs/01-domain/rules/` para reglas de negocio
- `specs/02-application/commands/` para comandos (si existen)
- `specs/00-requirements/use-cases/` para flujos de usuario

**Ejemplo real**:
```
Bug: "Un Proyecto con 5 tareas completadas sigue aceptando nuevas tareas"
Spec relacionada: BR-PROYECTO-005 (transición a terminado)
Entidad: Proyecto.md (atributo `max_sesiones`)
```

---

### 2. Compara spec vs comportamiento esperado

Lee la spec completamente. Determina si describe correctamente el comportamiento que debería ocurrir.

**Pregunta clave**: ¿La spec describe el comportamiento correcto?

**Caso A: La spec es correcta**
- El código no implementa lo que la spec dice
- Acción: Fix en código, no toques la spec

**Caso B: La spec está incompleta**
- La spec no cubre el caso donde ocurrió el bug
- Acción: Actualiza la spec primero, luego el código

**Caso C: La spec es incorrecta**
- La spec describe un comportamiento que no refleja la realidad del negocio
- Acción: Corrige la spec, luego adapta el código

**Ejemplo real**:
```markdown
# BR-PROYECTO-005 dice:
"Un Proyecto transiciona a estado `terminado` cuando alcanza
el límite fijo de 4 tareas completadas"

# El código hace:
if (completedCount >= 4) { ... }

# El bug reportado:
"Un Proyecto con 5 tareas completadas sigue en estado `en_analisis`"

# Diagnóstico: Caso A (spec correcta, código incorrecto)
El código debería ejecutar la transición pero no lo está haciendo.
```

---

### 3. Actualiza la spec si es necesario

Si estás en **Caso B** o **Caso C**, actualiza la spec antes de tocar el código.

**Qué actualizar**:
- **BR**: Añade el caso no cubierto en la sección "Ejemplos > Casos Válidos/Inválidos"
- **Entity**: Corrige la descripción de estados o transiciones
- **CMD**: Añade el error faltante o la precondición omitida
- **UC**: Añade el flujo de excepción que no estaba documentado

**Formato**:
```markdown
### Casos Inválidos
- ✗ Proyecto con 5 tareas completadas NO debe aceptar nuevas tareas
- ✗ Proyecto terminado vuelve a "preparado"
```

**Commit**:
```bash
git add specs/01-domain/rules/BR-PROYECTO-005.md
git commit -m "docs(domain): add edge case to BR-PROYECTO-005 for session limit

Clarifies behavior when session count exceeds max_sesiones.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### 4. Corrige el código

Implementa el fix siguiendo la spec actualizada (o la spec original si era correcta desde el inicio).

**Reglas**:
- El código debe pasar todos los casos descritos en la spec
- Si la spec tiene "Formalización", el código debe implementarla exactamente
- Si la spec tiene "Implementación" de ejemplo, úsala como guía

**Test**:
- Añade un test que reproduzca el bug original
- Verifica que el test falla antes del fix
- Verifica que el test pasa después del fix
- Añade tests para casos relacionados documentados en la spec

**Commit**:
```bash
git add apps/api/src/domain/proyecto/
git add tests/e2e/proyecto-tarea-limit.spec.ts
git commit -m "fix(domain): enforce session limit transition to terminado

Implements BR-PROYECTO-005 correctly. Now transitions Proyecto to 'terminado'
when reaching exactly 4 completed sessions.

Fixes #234

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### 5. Verifica la trazabilidad

Comprueba que todos los artefactos relacionados siguen siendo consistentes.

**Checklist**:
- [ ] La spec describe el comportamiento actual del código
- [ ] Los tests cubren todos los casos documentados en la spec
- [ ] No hay otros lugares en el código que dependan del comportamiento antiguo
- [ ] Si hay un **Use Case (UC)** que menciona la entidad/comando afectado, sigue siendo válido
- [ ] Si hay otros **BR** que dependen de esta regla, siguen siendo consistentes

**Herramientas**:
- Busca referencias con `grep -r "BR-PROYECTO-005" specs/`
- Busca wiki-links: `grep -r "\[\[Proyecto\]\]" specs/`
- Revisa tests relacionados: `grep -r "terminado" tests/`

---

## Casos especiales

### El bug revela conocimiento nuevo

Si descubres que falta documentación fundamental (no solo un caso edge), crea un nuevo artefacto.

**Ejemplo**:
```
Bug: "El sistema no valida que una Tarea cancelada libere puntos"
Diagnóstico: No existe BR que documente el manejo de puntos en cancelaciones
Acción: Crea BR-PUNTO-003 antes de implementar
```

### El bug está en múltiples lugares

Si el bug ocurre porque la misma lógica está duplicada en varios lugares del código:
1. Documenta la regla en un **BR** si no existe
2. Centraliza la implementación en un solo lugar
3. Refactoriza el código duplicado para usar la implementación centralizada

---

## Antipatrones

**NO hagas esto**:
- ✗ Corregir el código sin leer la spec
- ✗ Asumir que "la spec está desactualizada" sin verificar
- ✗ Actualizar solo el código y dejar la spec inconsistente
- ✗ Crear una BR nueva cuando ya existe una que solo necesita un caso adicional

**SÍ haz esto**:
- ✓ Leer la spec completa antes de diagnosticar
- ✓ Actualizar la spec primero si está incompleta
- ✓ Añadir tests que cubran el caso del bug
- ✓ Verificar que specs relacionadas siguen siendo consistentes

---

## Ejemplo completo: Bug en límite de tareas

### Reporte del bug
```
Issue #234: Un Proyecto con 4 tareas completadas acepta una quinta sesión.
Esperado: Debería transicionar a `terminado` y rechazar nuevas tareas.
```

### Paso 1: Identificar spec
- Entidad: `specs/01-domain/entities/Proyecto.md` (atributo `max_sesiones`)
- Regla: `specs/01-domain/rules/BR-PROYECTO-005.md` (transición a terminado)

### Paso 2: Comparar spec vs comportamiento
```markdown
# BR-PROYECTO-005 dice:
"Un Proyecto transiciona a estado `terminado` cuando alcanza
el límite fijo de 4 tareas completadas"

# El código hace:
async function onSessionCompleted(tareaId) {
  // ❌ No verifica el límite
  await updateTarea(tareaId, { estado: 'completada' })
}

# Diagnóstico: Caso A (spec correcta, implementación faltante)
```

### Paso 3: Actualizar spec (no necesario en este caso)
La spec ya describe el comportamiento correcto.

### Paso 4: Corregir código
```typescript
// apps/api/src/domain/tarea/events/on-session-completed.ts
async function onSessionCompleted(tareaId: string) {
  const tarea = await getTarea(tareaId)
  await updateTarea(tareaId, { estado: 'completada' })

  const completedCount = await countCompletedTareasByProyecto(tarea.proyectoId)

  if (completedCount >= 4) {
    await transitionProyectoTo(tarea.proyectoId, 'terminado')
    await emitEvent('EVT-Proyecto-Terminado', {
      proyectoId: tarea.proyectoId,
      motivo: 'limite_sesiones'
    })
  }
}
```

### Paso 5: Verificar trazabilidad
- ✓ BR-PROYECTO-005 describe el comportamiento implementado
- ✓ Test `proyecto-tarea-limit.spec.ts` cubre el caso
- ✓ No hay otros BR que contradigan esta regla
- ✓ La entidad `Proyecto.md` es consistente con la implementación

---

## Recursos relacionados

- **Guía para Desarrolladores**: `kdd/docs/guides/dev.md`
- **Guía para QA**: `kdd/docs/guides/qa.md`
- **Referencia de Business Rules**: `kdd/docs/reference/artifacts.md#business-rule`
- **Convenciones de escritura**: `kdd/docs/STYLE-GUIDE.md`
