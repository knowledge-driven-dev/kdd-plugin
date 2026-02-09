---
title: "Cómo Adoptar KDD en un Proyecto Existente"
audience: [tech-lead, pm, dev]
type: how-to
reading_time: "5 min"
status: draft
---

# Cómo Adoptar KDD en un Proyecto Existente

> **Para**: Tech Leads, PMs, Devs — **Tiempo**: 5 min — **Tipo**: How-to

Este documento describe cómo introducir KDD en un proyecto con código existente. La estrategia consiste en documentar incrementalmente, priorizando el conocimiento de alto impacto y evitando paralizar el desarrollo.

---

## Problema

Adoptar KDD de golpe genera sobrecarga y resistencia. Documentar todo antes de continuar desarrollando bloquea el progreso. Empezar sin estrategia produce documentación inconsistente y esfuerzo desperdiciado.

---

## Estrategia incremental: 4 fases

Adopta KDD en cuatro fases. Cada fase entrega valor inmediato y prepara la siguiente.

### Fase 1: Entidades (Semana 1)

Documenta las entidades principales del dominio. Las entidades son el vocabulario compartido del equipo.

**Qué documentar**:
- Agrega las 5-8 entidades core del sistema
- Atributos principales (sin exhaustividad)
- Estados del ciclo de vida (si aplica)
- Relaciones entre entidades

**Dónde**:
- `specs/01-domain/entities/`

**Criterio de prioridad**:
- Entidades que cambian frecuentemente
- Entidades mencionadas en cada conversación de equipo
- Entidades con lógica de negocio compleja

**Ejemplo del proyecto TaskFlow**:
```
specs/01-domain/entities/
├── Proyecto.md
├── Tarea.md
├── Miembro.md
├── Sprint.md
└── Etiqueta.md
```

**Beneficio inmediato**:
- Vocabulario consistente en PRs y discusiones
- Onboarding acelerado para nuevos miembros

---

### Fase 2: Reglas críticas (Semana 2-3)

Documenta las **Business Rules (BR)** que causan más bugs o malentendidos. Las reglas críticas son aquellas que el código implementa de manera dispersa o que cambian por decisiones de negocio.

**Qué documentar**:
- Restricciones invariables (límites, validaciones)
- Transiciones de estado
- Cálculos con fórmulas específicas
- Reglas que generan conflictos entre equipos

**Dónde**:
- `specs/01-domain/rules/`

**Cómo identificarlas**:
- Revisa el historial de bugs relacionados con lógica de negocio
- Pregunta al equipo: "¿Qué regla genera más confusión?"
- Busca validaciones repetidas en múltiples puntos del código

**Ejemplo del proyecto TaskFlow**:
```markdown
BR-PROYECTO-005: Un Proyecto transiciona a estado "terminado" cuando:
- Alcanza 4 tareas completadas, O
- El Usuario lo cierra manualmente
```

**Beneficio inmediato**:
- Reducción de bugs por malentendidos
- Fuente de verdad para validaciones
- Tests derivables directamente de la regla

---

### Fase 3: Casos de uso activos (Semana 4-6)

Documenta los **Use Cases (UC)** de los flujos que el equipo está desarrollando o modificando AHORA. No documentes casos de uso estables que nadie toca.

**Qué documentar**:
- Flujo principal (happy path)
- Excepciones que requieren manejo especial
- Precondiciones y postcondiciones
- Conexión con Commands/Events si ya existen

**Dónde**:
- `specs/02-application/use-cases/`

**Criterio de prioridad**:
- Features en desarrollo activo
- Flujos que van a cambiar en los próximos 2 sprints
- Áreas con alta rotación de personal

**Formato mínimo**:
```markdown
## Flujo Principal
1. El Usuario abre el formulario de creación de Proyecto
2. El Usuario completa el título
3. El Sistema valida que el título no esté vacío (BR-PROYECTO-001)
4. El Sistema crea el Proyecto en estado "borrador"
5. El Sistema redirige al Usuario a la pantalla de configuración

## Excepciones
- Si el Usuario no está autenticado → redirigir a login
- Si el título ya existe → mostrar error "Ya existe un Proyecto con ese título"
```

**Beneficio inmediato**:
- QA deriva tests de aceptación del UC
- Diseñadores entienden el contexto antes de proponer UI
- Desarrolladores tienen referencia al implementar

---

### Fase 4: Expansión guiada (Mes 2 en adelante)

Expande la documentación según la necesidad del equipo. Usa las preguntas recurrentes como señal de qué documentar a continuación.

**Señales de qué documentar**:
- Pregunta repetida 3+ veces → crear artefacto que responda
- Nueva feature aprobada → documentar antes de implementar
- Bug recurrente → documentar la regla que lo previene

**Tipos de artefactos a considerar**:
- **Commands (CMD)**: Operaciones críticas del sistema
- **Queries (QRY)**: Consultas complejas con lógica de negocio
- **Events (EVT)**: Eventos que disparan procesos o notificaciones
- **UI Specs**: Pantallas con interacciones complejas o muchos estados
- **ADRs**: Decisiones arquitectónicas que impactan múltiples áreas

**No documentes**:
- CRUD trivial sin lógica de negocio
- Código técnico interno (utils, helpers)
- Decisiones transitorias que cambiarán en días

---

## Gobernanza: Estado `draft` vs `approved`

Durante la adopción, usa el campo `status` del frontmatter para indicar el nivel de confianza de cada spec.

| Estado | Significado | Quién lo otorga |
|---|---|---|
| `draft` | Captura inicial, puede estar incompleto | Cualquier miembro del equipo |
| `reviewed` | Técnicamente correcto | Tech Lead o Dev Senior |
| `approved` | Validado por negocio | PM o Product Owner |

**Regla durante adopción**:
- Documenta en `draft` primero. Es mejor tener conocimiento parcial que nada.
- Promueve a `reviewed` cuando el equipo técnico confirma que refleja el código.
- Promueve a `approved` cuando negocio valida que refleja la intención original.

**Ejemplo de frontmatter**:
```yaml
---
id: BR-PROYECTO-005
kind: business-rule
status: draft
created: 2024-12-15
---
```

---

## Errores comunes y cómo evitarlos

### Error 1: Intentar documentar todo antes de empezar

**Síntoma**: El equipo pasa semanas escribiendo specs sin entregar features.

**Solución**: Aplica la regla "documentar justo antes de implementar". Si una feature no está en el roadmap de los próximos 2 sprints, no la documentes aún.

### Error 2: Documentación desconectada del código

**Síntoma**: Las specs dicen una cosa, el código hace otra. Nadie confía en la documentación.

**Solución**: Establece la regla "código y spec se actualizan juntos en el mismo PR". Si cambias una BR en el código, actualizas el archivo `BR-XXX.md` en el mismo commit.

### Error 3: Perfeccionismo en el formato

**Síntoma**: El equipo dedica más tiempo a debatir el formato YAML que a capturar conocimiento.

**Solución**: Usa los templates de `kdd/templates/` sin modificaciones. Si algo no encaja, documéntalo en `draft` y refina después.

### Error 4: Documentar sin audiencia clara

**Síntoma**: Specs genéricas que nadie lee porque no están orientadas a un rol específico.

**Solución**: Antes de escribir, pregunta "¿Quién va a leer esto y para qué?". Ajusta el nivel de detalle según la audiencia (Dev necesita detalle técnico, PM necesita contexto de negocio).

---

## Checklist de adopción

### Semana 1
- [ ] Identifica las 5-8 entidades core del sistema
- [ ] Crea `specs/01-domain/entities/` con las entidades principales
- [ ] Define atributos y estados del ciclo de vida
- [ ] Comparte con el equipo para validación

### Semana 2-3
- [ ] Revisa historial de bugs relacionados con lógica de negocio
- [ ] Identifica 3-5 reglas críticas
- [ ] Crea `specs/01-domain/rules/` con las BR prioritarias
- [ ] Conecta las BR con las entidades usando wiki-links

### Semana 4-6
- [ ] Identifica features en desarrollo activo
- [ ] Crea `specs/02-application/use-cases/` con los UC relevantes
- [ ] Documenta flujo principal y excepciones
- [ ] Deriva tests de aceptación desde los UC (con QA)

### Mes 2+
- [ ] Establece la regla "spec + código en el mismo PR"
- [ ] Expande artefactos según necesidad del equipo
- [ ] Promueve specs de `draft` a `reviewed` a `approved`
- [ ] Mide reducción de preguntas repetidas y bugs de malentendidos

---

## Recursos relacionados

- **Guía para Tech Leads**: `kdd/docs/guides/tech-lead.md`
- **Referencia de artefactos**: `kdd/docs/reference/artifacts.md`
- **Templates**: `kdd/templates/`
- **Estrategia para migración tecnológica**: `kdd/docs/levantamiento-kdd-migracion.md`
