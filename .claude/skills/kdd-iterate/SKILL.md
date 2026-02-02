---
name: kdd-iterate
description: |
  Aplica feedback, cambios o mejoras a artefactos KDD existentes.
  Usa este skill cuando el usuario proporciona feedback sobre documentacion,
  quiere cambiar requisitos existentes, o necesita propagar cambios entre capas.
category: authoring
triggers:
  - cambiar requisito
  - actualizar spec
  - el limite deberia ser
  - ya no aplica
  - anadir caso de error
  - renombrar entidad
  - aplicar feedback
---

# KDD Iterate

Aplica feedback, cambios o mejoras a artefactos KDD existentes.

## Cuando Activarse

Activate cuando el usuario:
- Proporciona feedback sobre documentacion existente
- Quiere cambiar un valor, condicion o comportamiento documentado
- Menciona que algo "ya no aplica" o "deberia ser diferente"
- Pide propagar un cambio a documentos relacionados

## Proceso

### Fase 1: Analizar el Feedback

Identifica:
- Que artefactos se ven afectados directamente?
- Es un cambio de requisitos, correccion, o refinamiento?
- Hay impacto en cascada a otros documentos?

### Fase 2: Localizar Artefactos

Busca en las capas KDD:
```
specs/01-domain/     -> entidades, reglas, eventos
specs/02-behavior/   -> comandos, queries, procesos
specs/03-experience/ -> casos de uso, vistas, flows
specs/04-verification/ -> criterios de aceptacion
```

### Fase 3: Evaluar Impacto

Presenta al usuario:

```markdown
## Analisis de Impacto

### Cambio Solicitado
> [resumen del feedback]

### Artefactos Afectados Directamente
| Artefacto | Tipo de Cambio | Impacto |
|-----------|----------------|---------|
| [[Proyecto]] | Modificar atributo | Bajo |
| [[BR-PROYECTO-002]] | Actualizar condicion | Medio |

### Artefactos con Impacto en Cascada
| Artefacto | Razon | Accion Sugerida |
|-----------|-------|-----------------|
| [[UC-001-Crear-Proyecto]] | Usa atributo modificado | Revisar flujo |
| [[REQ-001]] | Criterios dependen de regla | Actualizar |

### Riesgo de Inconsistencia
- Alto/Medio/Bajo
- Explicacion breve
```

### Fase 4: Confirmar y Aplicar

1. **Confirma** con el usuario antes de modificar
2. **Aplica** los cambios en orden de dependencia
3. **Actualiza** versiones en frontmatter si aplica
4. **Manten** wiki-links consistentes

### Fase 5: Verificar

Ejecuta validacion:
```bash
bun run validate:specs specs/
```

## Tipos de Iteracion

### Cambio de Requisito
- Modificar valor, condicion o comportamiento
- Actualizar reglas de negocio afectadas
- Propagar a criterios de aceptacion

### Refinamiento
- Anadir detalle a descripcion existente
- Completar secciones vacias
- Mejorar ejemplos o escenarios

### Correccion
- Arreglar inconsistencias detectadas
- Resolver contradicciones entre docs
- Alinear con decisiones recientes

### Deprecacion
- Marcar artefacto como deprecated
- Documentar razon y alternativa
- Actualizar referencias

## Skills Relacionados

- `kdd-author` - Para crear artefactos nuevos desde cero
- `kdd-trace` - Para ver conexiones antes de cambiar
- `kdd-gaps` - Para detectar que falta despues de iterar
