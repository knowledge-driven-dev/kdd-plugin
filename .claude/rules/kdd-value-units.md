# Value Units: Tracking de Implementación

> Esta rule aplica cuando trabajas con Value Units (`specs/00-requirements/value-units/`).

## Regla principal

Toda Value Unit (UV) DEBE organizar su alcance con tracking de estado:

```markdown
### Implemented
- [x] Artefacto ya codificado

### Pending — Iteration: {nombre}
- [ ] Artefacto por implementar

### Out of scope (deferred)
- ~~Artefacto pospuesto~~
```

## Al crear una UV nueva

- Usar el template `kdd/templates/value-unit.template.md`
- Todos los items empiezan como `[ ]` en "Pending"
- Nombrar la iteración de forma descriptiva

## Al implementar tareas de una UV

- Leer la UV completa antes de empezar
- Implementar solo los items marcados `[ ]` en "Pending"
- NO reimplementar items marcados `[x]` en "Implemented"
- Al terminar cada item, marcar `[x]` y moverlo a "Implemented"

## Al modificar specs existentes de una UV

- Añadir nueva sección "Pending — Iteration: {nombre}" con los cambios
- Marcar items existentes afectados con la versión (ej: `UI-MiembroForm v2.0`)
- Items reemplazados van a "Out of scope" con ~~strikethrough~~

## Commits

- Referenciar la UV en el mensaje de commit: `feat(api): implement CMD-024 (UV-002)`

## Referencia

Guía completa: `kdd/docs/guides/pm.md`
