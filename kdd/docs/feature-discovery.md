# Feature Discovery: De Idea a Artefactos KDD

## Introducción

Este documento describe el proceso conversacional para capturar, refinar y formalizar nuevas características o mejoras en el sistema. El objetivo es reducir la fricción inicial mientras mantenemos el rigor de KDD.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   IDEA CRUDA  →  REFINAMIENTO  →  SÍNTESIS  →  ARTEFACTOS KDD  │
│   (ligero)       (conversación)   (propuesta)   (formales)      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fase 1: Captura Ligera

### Dónde viven las ideas

```
/specs/00-inbox/
├── IDEA-2024-12-13-pausar-sesion.md
├── IDEA-2024-12-15-niveles-detalle.md
└── _archive/
    └── (ideas ya procesadas)
```

### Cómo capturar una idea

**Opción A: Comando `/feature`**
```bash
# En Claude Code
/feature
```
Claude te guiará para capturar la idea y comenzar el refinamiento.

**Opción B: Archivo manual**
1. Crea un archivo en `/specs/00-inbox/` usando el template `idea.template.md`
2. Llena al menos las secciones "El Problema" y "La Idea"
3. Inicia una conversación con Claude para refinar

### Qué incluir en la captura inicial

| Sección | Requerido | Descripción |
|---------|-----------|-------------|
| El Problema | Sí | ¿Qué situación actual es problemática? |
| La Idea | Sí | ¿Cuál es tu propuesta de solución? |
| Ejemplos | Recomendado | Un caso concreto de uso |
| Preguntas | Opcional | Dudas o aspectos a discutir |

**No te preocupes por:**
- Usar terminología exacta de KDD
- Identificar entidades o reglas
- Formato perfecto

Eso lo refinamos en la conversación.

---

## Fase 2: Refinamiento Conversacional

### El proceso de exploración

Claude sigue un flujo estructurado de preguntas para entender completamente la idea:

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE EXPLORACIÓN                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CLARIFICACIÓN DEL PROBLEMA                                  │
│     ├── ¿Qué problema específico resuelve?                      │
│     ├── ¿Quién tiene este problema?                             │
│     ├── ¿Con qué frecuencia ocurre?                             │
│     └── ¿Qué pasa hoy cuando ocurre?                            │
│                                                                 │
│  2. IDENTIFICACIÓN DE ENTIDADES                                 │
│     ├── ¿Qué entidades existentes están involucradas?           │
│     ├── ¿Necesitamos una entidad nueva?                         │
│     └── ¿Hay cambios de estado en entidades?                    │
│                                                                 │
│  3. REGLAS DE NEGOCIO                                           │
│     ├── ¿Hay restricciones que cumplir?                         │
│     ├── ¿Qué NO debería pasar?                                  │
│     └── ¿Casos límite que preocupen?                            │
│                                                                 │
│  4. INTERACCIÓN DEL USUARIO                                     │
│     ├── ¿Cómo lo dispara el usuario?                            │
│     ├── ¿Qué ve antes/durante/después?                          │
│     └── ¿Qué feedback necesita?                                 │
│                                                                 │
│  5. VERIFICACIÓN                                                │
│     ├── ¿Cómo sabemos que funciona?                             │
│     ├── Ejemplo del escenario "feliz"                           │
│     └── Ejemplo de un caso que debe fallar                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Ejemplo de conversación

```
Usuario: Quiero que el usuario pueda pausar una Sesión a mitad
         y retomarla después.

Claude: Entendido. Vamos a explorar esta idea.

        **Sobre el problema:**
        ¿Qué pasa actualmente cuando una reunión se interrumpe
        a mitad de una Sesión? ¿Se pierde todo el progreso?

Usuario: Sí, hay que empezar de cero. Es frustrante porque
         a veces ya tenemos 3 rondas completadas.

Claude: Claro, eso es un dolor real.

        **Sobre las restricciones:**
        ¿Debería haber un límite de tiempo para retomar?
        Por ejemplo, ¿una sesión pausada por 1 semana
        todavía tiene sentido?

Usuario: Buena pregunta. Diría que máximo 24-48 horas,
         después pierde contexto.

Claude: Perfecto. Eso sería una regla de negocio: BR-SESION-PAUSA.

        **Sobre la interacción:**
        ¿Dónde esperarías ver el botón de "Pausar"?
        ¿Y cómo volverías a la sesión pausada?

[... continúa el refinamiento ...]
```

---

## Fase 3: Síntesis

### El entregable intermedio

Antes de crear artefactos, Claude produce un **resumen estructurado** que mapea la idea a componentes KDD:

```markdown
## Resumen: Pausar y Retomar Sesión

### Impacto en el Dominio (02-domain/)
| Tipo | Artefacto | Acción |
|------|-----------|--------|
| Entidad | [[Sesión]] | Modificar: nuevo estado `pausada` |
| Evento | EVT-Sesion-Pausada | Crear |
| Evento | EVT-Sesion-Retomada | Crear |
| Regla | BR-SESION-PAUSA | Crear: timeout 24h |

### Behavior (02-behavior/)
| Tipo | Artefacto | Acción |
|------|-----------|--------|
| Comando | CMD-PauseSession | Crear |
| Comando | CMD-ResumeSession | Crear |

### Interacción (04-interaction/)
| Tipo | Artefacto | Acción |
|------|-----------|--------|
| Caso de Uso | UC-XXX-Pausar-Sesion | Crear |
| Caso de Uso | UC-XXX-Retomar-Sesion | Crear |
| Vista | UI-SessionActive | Modificar: agregar botón |

### Verificación (05-verification/)
| Tipo | Artefacto | Acción |
|------|-----------|--------|
| Criterios | REQ-XXX-Pausar-Sesion | Crear |
| Ejemplo | Pausar con rondas completas | Crear |
| Ejemplo | Retomar antes del timeout | Crear |
| Ejemplo | Timeout expirado | Crear |

### Escenarios de Ejemplo
```gherkin
Scenario: Pausar sesión exitosamente
  Given una Sesión activa con 2 Rondas completadas
  When el Propietario pausa la Sesión
  Then la Sesión pasa a estado "pausada"
  And se registra la fecha/hora de pausa
  And se genera evento SesionPausada

Scenario: Timeout de sesión pausada
  Given una Sesión pausada hace más de 24 horas
  When el sistema verifica sesiones pausadas
  Then la Sesión pasa a estado "cancelada"
  And se notifica al Propietario
```
```

### Validación antes de proceder

Claude confirma con el usuario:

```
✓ ¿Este resumen captura tu intención?
✓ ¿Los escenarios de ejemplo son correctos?
✓ ¿Falta considerar algún caso?
✓ ¿Procedo a crear los artefactos KDD?
```

---

## Fase 4: Generación de Artefactos

### Qué se genera

Con aprobación del usuario, Claude:

1. **Modifica** artefactos existentes (ej: agregar estado a Sesión)
2. **Crea** nuevos artefactos usando los templates de `/kdd/templates/`
3. **Enlaza** todo correctamente en el grafo KDD
4. **Actualiza** la idea original a estado `processed`

### Orden de generación

```
1. Dominio (fundamentos)
   └── Entidades → Eventos → Reglas

2. Behavior (qué puede hacer)
   └── Comandos → Queries → Procesos

3. Interacción (cómo se usa)
   └── Casos de Uso → Vistas

4. Verificación (cómo se prueba)
   └── Criterios → Ejemplos BDD
```

### Validación automática

Después de generar, ejecutar:

```bash
bun run validate:specs
```

Para verificar:
- Front-matter válido
- Enlaces no rotos
- Templates completos

---

## Buenas Prácticas

### Para quien captura la idea

1. **Sé específico con el problema** - "Los usuarios se quejan" es vago; "Perdemos el trabajo de 3 rondas cuando se corta la reunión" es concreto
2. **Incluye un ejemplo real** - Ayuda muchísimo a entender el contexto
3. **No te autocensures** - Las "malas ideas" a veces llevan a buenas soluciones

### Para el proceso de refinamiento

1. **Una idea = un problema** - Si hay múltiples problemas, sepáralos
2. **Valida suposiciones** - "Asumo que X, ¿es correcto?"
3. **Piensa en casos límite** - ¿Qué pasa si...?

### Para la generación

1. **Revisa antes de aprobar** - El resumen es tu última oportunidad de ajustar
2. **No todo necesita todos los artefactos** - Una idea pequeña puede ser solo 1-2 documentos
3. **Itera** - Si después de generar ves algo mal, ajústalo

---

## Comandos Útiles

```bash
# Iniciar flujo de feature discovery
/feature

# Validar especificaciones después de generar
bun run validate:specs

# Ver ideas pendientes de procesar
ls specs/00-inbox/*.md | grep -v README
```

---

## FAQ

### ¿Puedo saltar el proceso y crear artefactos directamente?

Sí, si tienes claridad total sobre lo que necesitas. El proceso conversacional es para cuando la idea aún está difusa.

### ¿Qué pasa con las ideas que no se implementan?

Pueden quedarse en `00-inbox/` con estado `raw` o moverse a `_archive/` con una nota de por qué se descartó.

### ¿Cuánto debería durar el refinamiento?

Depende de la complejidad. Una idea simple puede ser 5-10 minutos. Una feature compleja puede requerir múltiples sesiones.

### ¿Puedo refinar sin Claude?

Sí, el proceso está documentado aquí. Pero Claude ayuda a no olvidar aspectos importantes y a mantener consistencia con el dominio existente.
