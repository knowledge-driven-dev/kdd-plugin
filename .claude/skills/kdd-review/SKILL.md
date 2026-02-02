---
name: kdd-review
description: |
  Revisa documentos KDD por calidad semantica, completitud y coherencia.
  Usa este skill cuando el usuario quiera validar la calidad de especificaciones,
  detectar problemas de coherencia, o preparar documentacion para implementacion.
category: quality
triggers:
  - revisar spec
  - revisar documento
  - esta bien escrito
  - validar documentacion
  - review de calidad
  - preparar para implementacion
---

# KDD Review

Revisa un documento KDD por calidad semantica, completitud y coherencia narrativa.

## Cuando Activarse

Activate cuando el usuario:
- Pide revisar un documento o conjunto de specs
- Quiere validar si algo esta "listo para implementar"
- Menciona "revisar calidad", "esta completo", "es coherente"
- Prepara documentacion para handoff a desarrollo

## Diferencia con kdd-fix

| kdd-fix | kdd-review |
|---------|------------|
| Problemas tecnicos | Problemas semanticos |
| Enlaces rotos, frontmatter | Coherencia, completitud |
| Automatico | Requiere juicio |
| Ejecuta validador | Analisis cualitativo |

## Proceso

### Fase 1: Cargar Contexto

1. Lee el documento objetivo
2. Lee documentos relacionados (links en frontmatter)
3. Carga el template correspondiente de `kdd/templates/`

### Fase 2: Evaluar Dimensiones

#### A. Completitud
- Estan todas las secciones requeridas por el template?
- Las secciones tienen contenido sustancial o son placeholders?
- Faltan casos de error, edge cases, o escenarios alternativos?

#### B. Coherencia Interna
- La descripcion coincide con los detalles?
- Los ejemplos ilustran lo que dice el texto?
- Hay contradicciones dentro del documento?

#### C. Coherencia Externa
- Es consistente con las entidades que referencia?
- Las reglas de negocio citadas aplican correctamente?
- Los estados/transiciones coinciden con el modelo de dominio?

#### D. Claridad
- Un desarrollador nuevo entenderia que implementar?
- Hay ambiguedades que podrian causar malas interpretaciones?
- El lenguaje es preciso o usa terminos vagos ("deberia", "podria")?

#### E. Accionabilidad
- Se puede implementar/testear con esta informacion?
- Los criterios de aceptacion son verificables?
- Hay suficiente detalle para estimar esfuerzo?

### Fase 3: Generar Reporte

```markdown
## Revision: [Nombre del Documento]

### Puntuacion General
| Dimension | Score | Notas |
|-----------|-------|-------|
| Completitud | VERDE/AMARILLO/ROJO | ... |
| Coherencia Interna | VERDE/AMARILLO/ROJO | ... |
| Coherencia Externa | VERDE/AMARILLO/ROJO | ... |
| Claridad | VERDE/AMARILLO/ROJO | ... |
| Accionabilidad | VERDE/AMARILLO/ROJO | ... |

### Hallazgos Criticos (bloquean implementacion)
1. ...

### Hallazgos Importantes (deberian resolverse)
1. ...

### Sugerencias de Mejora (nice to have)
1. ...

### Preguntas para el Autor
1. ...
```

### Fase 4: Ofrecer Ayuda

Pregunta si el usuario quiere resolver algun hallazgo.

## Checklists por Tipo

### Entidades
- [ ] Descripcion clara del concepto
- [ ] Atributos con tipos y restricciones
- [ ] Estados y transiciones (si aplica)
- [ ] Invariantes de dominio
- [ ] Ejemplos concretos

### Reglas de Negocio
- [ ] Condicion claramente expresada
- [ ] Consecuencia/accion definida
- [ ] Excepciones documentadas
- [ ] Ejemplos de cumplimiento y violacion

### Casos de Uso
- [ ] Actor claramente identificado
- [ ] Precondiciones verificables
- [ ] Flujo principal paso a paso
- [ ] Flujos alternativos cubiertos
- [ ] Postcondiciones medibles

### Criterios de Aceptacion
- [ ] Formato Given/When/Then
- [ ] Datos de ejemplo concretos
- [ ] Casos positivos y negativos
- [ ] Independientes y atomicos

## Uso en CI/CD

Este skill puede ejecutarse como GitHub Action para:
- Revisar specs en PRs automaticamente
- Bloquear merge si hay hallazgos criticos
- Generar reportes de calidad de documentacion

## Skills Relacionados

- `kdd-fix` - Para corregir problemas tecnicos
- `kdd-iterate` - Para aplicar mejoras sugeridas
- `kdd-gaps` - Para detectar documentos faltantes
