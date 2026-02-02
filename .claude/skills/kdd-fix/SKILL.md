---
name: kdd-fix
description: |
  Corrige automaticamente problemas tecnicos en documentos KDD.
  Usa este skill cuando se detecten errores de validacion, enlaces rotos,
  frontmatter incompleto, o problemas de formato en especificaciones.
category: quality
triggers:
  - corregir spec
  - fix documento
  - errores de validacion
  - enlaces rotos
  - frontmatter incompleto
  - normalizar formato
---

# KDD Fix

Corrige automaticamente problemas tecnicos detectados en documentos KDD.

## Cuando Activarse

Activate cuando:
- El validador reporta errores
- El usuario menciona "corregir", "arreglar", "fix"
- Se detectan enlaces rotos o frontmatter incompleto
- Se necesita normalizar formato o convenciones

## Proceso

### Fase 1: Diagnosticar

Ejecuta el validador (si existe):
```bash
bun run validate:specs [archivo o directorio] -v
```

O analiza manualmente buscando:
- Wiki-links rotos
- Frontmatter incompleto
- Convenciones de nombrado violadas

### Fase 2: Clasificar Problemas

#### Correcciones Automaticas (aplicar directamente)

**Enlaces Rotos**
- Si apunta a entidad con nombre similar -> corregir
- Ejemplo: `[[Sesion]]` -> `[[Sesión]]`

**Menciones Sin Enlazar**
- Convertir menciones de entidades conocidas a wiki-links
- Ejemplo: `el Proyecto` -> `el [[Proyecto]]`
- Solo aplicar con alta confianza (match exacto o plural/singular)

**Frontmatter Incompleto**
- Anadir campos requeridos faltantes con valores por defecto
- Corregir formato de IDs (UC-001, REQ-001, etc.)

**Naming y Convenciones**
- Corregir capitalizacion de entidades de dominio
- Normalizar IDs segun patron esperado
- Ajustar status lifecycle si es invalido

#### NO Corregir Automaticamente (reportar)

- Referencias a entidades que no existen
- Secciones faltantes (requiere contenido manual)
- Problemas semanticos complejos

### Fase 3: Aplicar Correcciones

1. Muestra resumen de correcciones a aplicar
2. Aplica las correcciones usando Edit
3. Muestra diff de cambios realizados

### Fase 4: Reportar Pendientes

Lista problemas que requieren intervencion manual:
```
Requieren intervencion manual (2):
  ! Linea 72: [[IdeaScoringService]] - entidad no existe
  ! Falta seccion "## Referencias"
```

## Formato de Salida

```
Correcciones aplicadas (5):
  OK Linea 15: "Proyecto" -> "[[Proyecto]]"
  OK Linea 23: "tareas" -> "[[Tarea|tareas]]"
  OK Frontmatter: anadido campo "status: draft"
  ...

Requieren intervencion manual (2):
  ! Linea 72: [[IdeaScoringService]] - entidad no existe
  ! Falta seccion "## Referencias"
```

## Uso en CI/CD

Este skill puede ejecutarse como:
- **Pre-commit hook**: Corregir antes de commit
- **GitHub Action**: Validar y auto-fix en PRs
- **Pipeline check**: Bloquear si hay errores no corregibles

### Ejemplo GitHub Action

```yaml
- name: KDD Fix
  run: |
    bun run validate:specs --fix
    git diff --exit-code || (git add -A && git commit -m "fix: auto-fix KDD specs")
```

## Skills Relacionados

- `kdd-review` - Para revisar calidad semantica
- `kdd-gaps` - Para detectar artefactos faltantes
- `kdd-trace` - Para verificar trazabilidad
