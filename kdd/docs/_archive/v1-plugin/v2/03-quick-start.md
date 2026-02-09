# Quick Start: Tu primer artefacto KDD

> **Tiempo**: 5 minutos para crear tu primer spec

## El escenario

Imagina que el PM dice: "Necesitamos que los usuarios puedan invitar a otros usuarios a ver sus análisis".

Veamos cómo documentar esto en KDD.

---

## Paso 1: Crea el Objective (2 min)

El Objective captura **qué quiere el usuario y por qué**.

**Crea el archivo**:
```
/specs/00-requirements/objectives/OBJ-015-InvitarUsuarios.md
```

**Contenido**:

```markdown
---
id: OBJ-015
kind: objective
title: Invitar usuarios a ver análisis
actor: Usuario
status: draft
---

# OBJ-015: Invitar usuarios a ver análisis

## Actor
Usuario que ha completado una sesión de análisis

## Objetivo
Como Usuario, quiero invitar a otras personas a ver mi análisis,
para poder compartir los resultados con mi equipo sin que necesiten cuenta.

## Criterios de éxito
- Puedo generar un link de invitación desde la pantalla de análisis
- El link permite ver el análisis sin crear cuenta
- Puedo revocar el link si cambio de opinión
```

---

## Paso 2: Crea el Use Case (3 min)

El Use Case describe **cómo funciona el flujo** paso a paso.

**Crea el archivo**:
```
/specs/02-behavior/use-cases/UC-015-InvitarAVerAnalisis.md
```

**Contenido**:

```markdown
---
id: UC-015
kind: use-case
title: Invitar a Ver Análisis
actor: Usuario
status: draft
---

# UC-015: Invitar a Ver Análisis

## Contexto
| Elemento | Descripción |
|----------|-------------|
| Actor | Usuario con análisis completado |
| Objetivo | Compartir análisis con personas externas |
| Precondición | El análisis está en estado "completado" |
| Postcondición | Existe un link de acceso público al análisis |

## Flujo Principal
1. El Usuario accede a la pantalla de análisis
2. El Usuario hace click en "Compartir"
3. El Sistema muestra un modal con opciones de compartir
4. El Usuario hace click en "Generar link"
5. El Sistema crea un link único con token
6. El Sistema muestra el link copiable
7. El Usuario copia el link

## Flujos Alternativos

### A1: Ya existe un link activo
En el paso 3:
1. El Sistema muestra el link existente
2. El Usuario puede copiar o regenerar

## Excepciones

### E1: Análisis no completado
En el paso 1:
1. El botón "Compartir" está deshabilitado
2. Tooltip: "Completa el análisis para compartir"

## Reglas Aplicadas
- [[BR-ANALISIS-001]]: Solo análisis completados son compartibles

## Commands Invocados
- [[CMD-020-GenerateShareLink]]
- [[CMD-021-RevokeShareLink]] (opcional)

## Vistas Relacionadas
- [[UI-AnalisisDetalle]]
- [[UI-ShareModal]]
```

---

## ¡Listo!

Ya tienes documentada la feature con:

- **Contexto** (qué quiere el usuario)
- **Flujo** (cómo funciona)
- **Excepciones** (qué puede salir mal)
- **Conexiones** (qué Commands y vistas se necesitan)

---

## Siguiente nivel

Dependiendo de tu rol, puedes profundizar:

### Si eres PM

Añade un Release Plan para planificar cuándo entra:

```
/specs/00-requirements/releases/REL-004.md

## Lo que incluye
- [[OBJ-015-InvitarUsuarios]]
```

### Si eres Diseñador

Crea la spec de la vista:

```
/specs/03-experience/views/UI-ShareModal.md

## Estados
- Loading (generando link)
- Success (link listo para copiar)
- Error (no se pudo generar)
```

### Si eres Dev

El Use Case ya te dice qué Commands implementar:
- `CMD-020-GenerateShareLink`
- `CMD-021-RevokeShareLink`

---

## Tips

1. **No te preocupes por hacerlo perfecto**. `status: draft` indica que es trabajo en progreso.

2. **Los links rotos están bien al inicio**. `[[CMD-020-GenerateShareLink]]` no existe todavía, y eso está ok. Se creará cuando alguien lo implemente.

3. **Empieza simple**. No necesitas todas las secciones desde el día 1. Añade detalle conforme avanzas.

---

*¿Listo para más? Ve a la [Referencia de artefactos](./04-referencia-artefactos.md)*
