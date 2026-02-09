---
title: "¿Qué es KDD?"
audience: [all]
type: explanation
reading_time: "5 min"
status: draft
---

# ¿Qué es KDD?

> Para: Todos · Tiempo: 5 min · Tipo: Explanation

## El problema que resuelve

Imagina esta escena. El PM pregunta: "¿Cómo funciona el flujo de puntos?". El Dev responde: "Está en el código... creo que también había algo en Confluence". El Diseñador interrumpe: "¿Pero el modal de error es el que yo diseñé o lo cambiaron?". Silencio incómodo.

La documentación tradicional nace desactualizada. Alguien la escribe una vez, al margen del desarrollo. Una semana después, el código evoluciona y la documentación se queda atrás. Al mes ya nadie confía en ella.

El resultado es predecible: las respuestas viven en la cabeza de las personas, no en un lugar compartido. Cuando esa persona se va de vacaciones o cambia de equipo, el conocimiento se va con ella.

## KDD en una frase

**Knowledge-Driven Development (KDD)** es una metodología que convierte la documentación en la fuente de verdad del producto. No es un wiki. No es un extra que se hace al final. Es el punto de partida del trabajo de cada rol.

## Los tres principios (resumen)

KDD se sostiene sobre tres ideas fundamentales. Aquí van en forma compacta.

**1. Docs como fuente de verdad.** La especificación manda. El código se deriva de ella, no al revés. Si hay conflicto entre lo que dice la spec y lo que hace el código, la spec gana y el código se corrige.

**2. Docs como conocimiento consultable.** Cada spec usa enlaces internos (wiki-links) que forman un grafo de conocimiento. Cualquier persona puede navegar desde un requisito de negocio hasta la pantalla que lo implementa, pasando por las reglas y los comandos intermedios.

**3. Docs como código versionado.** Las specs viven en el repositorio, junto al código. Se revisan en pull requests. Tienen historial en Git. Evolucionan con el producto.

> Para profundizar en los principios y sus beneficios concretos, lee *why-kdd.md*.

## La estructura de carpetas

Toda la documentación vive en `/specs`. KDD organiza la documentación en capas, y cada capa responde una pregunta diferente sobre el sistema.

```
/specs
├── 00-requirements/    ¿Por qué hacemos esto?
│   └── objectives/       Objetivos de usuario, releases, decisiones
│
├── 01-domain/          ¿Qué conceptos existen?
│   ├── entities/         Proyecto, Tarea, Usuario, Miembro...
│   └── rules/            Reglas de negocio (BR)
│
├── 02-behavior/        ¿Qué puede hacer el sistema?
│   ├── commands/         Operaciones que cambian datos (CMD)
│   ├── queries/          Operaciones que consultan datos (QRY)
│   └── use-cases/        Flujos completos usuario-sistema (UC)
│
├── 03-experience/      ¿Cómo se ve y se siente?
│   └── views/            Pantallas, componentes, estados visuales
│
├── 04-verification/    ¿Cómo sabemos que funciona?
│   └── criteria/         Criterios de aceptación, tests BDD
│
└── 05-architecture/    ¿Cómo está construido?
    └── patterns/         Patrones técnicos, guías de implementación
```

Lees las capas de arriba hacia abajo. Cada capa depende de las anteriores, nunca de las posteriores. Un **Command (CMD)** en la capa 02 puede referenciar una entidad de la capa 01, pero una entidad nunca referencia un CMD.

## Por qué te importa

### Product Managers

Trazas cada feature desde la idea hasta producción en un solo lugar. Las decisiones quedan documentadas con contexto. Nunca más la pregunta "¿Por qué se hizo así?".

### Diseñadores

Conectas tus specs de UI con el comportamiento real del sistema. Documentas todos los estados (carga, error, vacío) antes de diseñar. No diseñas en el vacío.

### Desarrolladores

Lees la spec antes de escribir código. Las reglas de negocio están explícitas, no escondidas en un if-else que alguien escribió hace seis meses. Los criterios de aceptación se convierten directamente en tests.

### QA

Derivas casos de test directamente de los **Use Case (UC)** y **Business Rule (BR)**. Cada flujo principal se convierte en un happy path. Cada excepción documentada se convierte en un edge case.

### Tech Leads

Revisas specs en pull requests como revisas código. Mides la cobertura de documentación. Gobiernas el ciclo de vida de cada artefacto.

## Un ejemplo real

Tomemos el concepto de **Proyecto** en TaskFlow. Un Proyecto es la pregunta o desafío que un usuario somete a análisis. Así se documenta en cada capa:

| Capa | Archivo | Qué contiene |
|------|---------|--------------|
| 01-domain | `entities/Proyecto.md` | Qué es un Proyecto: sus atributos (`titulo`, `estado`, `max_sesiones`), sus estados (Borrador, Preparado, En Análisis, Terminado) y las transiciones válidas entre ellos. |
| 01-domain | `rules/BR-PROYECTO-005.md` | La regla de negocio "Transición a terminado": define cuándo un Proyecto pasa a estado final, qué lo dispara y qué ocurre si alguien intenta reabrir uno terminado. |
| 02-behavior | `commands/CMD-003-DeleteProyecto.md` | El comando para eliminar un Proyecto: qué datos recibe, qué precondiciones valida (ser dueño, no tener tareas activas), qué eventos emite y qué errores puede devolver. |

Observa cómo se conectan. La entidad `Proyecto.md` define los estados. La regla `BR-PROYECTO-005` referencia esos estados y los protege. El comando `CMD-003` valida las reglas antes de ejecutar la operación. Cada archivo enlaza a los demás con wiki-links como `[[Proyecto]]` o `[[BR-PROYECTO-005]]`.

Si mañana cambia una regla de negocio, la actualizas en un solo lugar. Todos los artefactos que la referencian siguen apuntando al contenido correcto.

## Siguiente paso

Elige la guía que corresponde a tu rol:

- **Product Manager**: lee [Guía para PMs](../guides/pm.md)
- **Diseñador UX/UI**: lee [Guía para Diseñadores](../guides/designer.md)
- **Desarrollador**: lee [Guía para Devs](../guides/dev.md)
- **QA Engineer**: lee [Guía para QA](../guides/qa.md)
- **Tech Lead**: lee [Guía para Tech Leads](../guides/tech-lead.md) (recomendamos leer antes *why-kdd.md*)
