---
# @type: idea
# @description: Captura ligera de una idea o característica antes de formalizar
# @file-pattern: ^IDEA-\d{4}-\d{2}-\d{2}-.+\.md$
# @path-pattern: 00-inbox/

status: raw                    # @enum: raw|exploring|ready|processed @default: raw
created: YYYY-MM-DD            # @required @format: date
author: "@username"            # @optional
priority: medium               # @enum: low|medium|high|critical @optional
tags: []                       # @type: array @optional
---

# Título de la Idea <!-- title-is-name -->

## El Problema <!-- required -->

<!-- Describe el problema o necesidad que motiva esta idea -->
<!-- Preguntas guía:
     - ¿Qué situación actual es problemática?
     - ¿Quién tiene este problema?
     - ¿Con qué frecuencia ocurre?
     - ¿Qué impacto tiene?
-->



## La Idea <!-- required -->

<!-- Describe tu propuesta de solución en lenguaje natural -->
<!-- No te preocupes por el formato, solo captura la esencia -->



## Ejemplos <!-- optional but-recommended -->

<!-- Dame un ejemplo concreto de cómo funcionaría -->
<!-- Ejemplo: "El usuario está en una sesión, hace clic en 'Pausar',
     y puede volver mañana para continuar donde lo dejó" -->



## Preguntas Abiertas <!-- optional -->

<!-- ¿Hay algo que no tengas claro o que necesite discutirse? -->

-

## Contexto Adicional <!-- optional -->

<!-- Enlaces, capturas, conversaciones relevantes, etc. -->


---

<!--
PRÓXIMOS PASOS:
1. Guarda este archivo en /specs/00-inbox/
2. Usa el comando /feature en Claude Code
3. Claude te guiará para refinar esta idea
4. Al final se generarán los artefactos KDD formales
-->
