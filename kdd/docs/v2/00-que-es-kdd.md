# KDD: Tu documentación que nunca se desactualiza

> **Tiempo de lectura**: 3 minutos

## El problema que todos conocemos

Seguro te suena esto:

- **El PM**: "Necesito saber cómo funciona el flujo de créditos"
- **El dev**: "Está en el código... creo que también había algo en Confluence"
- **El diseñador**: "¿Pero el modal de error es igual al que diseñé?"
- *(Silencio incómodo)*

La documentación tradicional tiene un problema fatal: **nace desactualizada**. Se escribe una vez, nadie la mantiene, y al mes ya no refleja la realidad.

## Qué es KDD

**KDD (Knowledge-Driven Development)** es una forma de documentar productos donde:

1. **La documentación ES el producto** (no un extra que se hace al final)
2. **Cada cosa tiene un solo lugar** (no hay 3 versiones diferentes)
3. **Todo está conectado** (del requisito al diseño al código)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Documentación tradicional          KDD                    │
│   ────────────────────────          ────                    │
│                                                             │
│   "Escríbelo al final"    →    "Escríbelo primero"         │
│   "Está en algún lado"    →    "Está en /specs"            │
│   "Pregúntale a Juan"     →    "Léelo en la spec"          │
│   "Ya no aplica"          →    "Se actualiza junto"        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Por qué te importa (según tu rol)

### Si eres PM

- **Trazabilidad**: De "quiero esta feature" hasta "está en producción" en un solo lugar
- **Decisiones documentadas**: Nunca más "¿por qué se hizo así?"
- **Criterios de aceptación claros**: El dev sabe exactamente qué entregar

### Si eres Diseñador

- **Specs de UI conectadas al comportamiento**: No diseñas en el vacío
- **Estados documentados**: Loading, error, vacío... todos cubiertos
- **Storybook generado**: Tus specs se vuelven documentación visual

### Si eres Dev

- **Requisitos sin ambigüedad**: Sabes qué construir antes de escribir código
- **Reglas de negocio explícitas**: No tienes que adivinar validaciones
- **Tests que se escriben solos**: Los criterios de aceptación son los tests

## La estructura (vista rápida)

```
/specs
├── 00-requirements/    ← "¿Por qué hacemos esto?"
│   ├── PRD.md             Visión del producto
│   └── objectives/        Lo que quieren los usuarios
│
├── 01-domain/          ← "¿Qué conceptos existen?"
│   ├── entities/          Reto, Sesión, Usuario...
│   └── rules/             Reglas de negocio
│
├── 02-behavior/        ← "¿Qué puede hacer el sistema?"
│   ├── use-cases/         Flujos completos
│   └── commands/          Acciones específicas
│
├── 03-experience/      ← "¿Cómo se ve?"
│   └── views/             Pantallas y componentes
│
└── 04-verification/    ← "¿Cómo sabemos que funciona?"
    └── criteria/          Criterios de aceptación
```

## Un ejemplo real

Imagina que necesitas documentar "El usuario puede comprar créditos":

| Capa | Archivo | Contiene |
|------|---------|----------|
| Requirements | `OBJ-003-ComprarCreditos.md` | "Como usuario, quiero comprar créditos para..." |
| Domain | `Credito.md` + `BP-CREDITO-001.md` | Qué es un crédito, cuánto cuesta |
| Behavior | `UC-005-ComprarCreditos.md` | El flujo paso a paso |
| Experience | `UI-CompraCreditos.md` | El diseño de la pantalla |
| Verification | `REQ-005-CompraCreditos.md` | Criterios de aceptación |

**Todo conectado por enlaces**. Si cambias el precio del crédito, solo lo cambias en `BP-CREDITO-001.md` y todo el mundo ve la versión actualizada.

## Siguiente paso

Según tu rol:

- **PM**: Lee [Guía para PMs](./01-guia-pm.md)
- **Diseñador**: Lee [Guía para Diseñadores](./02-guia-disenador.md)
- **Dev**: Ve a la [Referencia completa](./10-referencia.md)

---

*¿Preguntas? Abre un issue o pregunta en el canal de Slack.*
