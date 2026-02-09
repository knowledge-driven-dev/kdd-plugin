---
title: "Preguntas Frecuentes (FAQ)"
audience: [all]
type: reference
reading_time: "consulta"
status: draft
---

# Preguntas Frecuentes (FAQ)

> Para: Todos — Tipo: Consulta — Uso: Busca tu pregunta y obtén una respuesta rápida

Este documento responde las preguntas más comunes sobre KDD. Cada respuesta es concisa y enlaza a documentación detallada. Si tu pregunta no está aquí, consulta la guía de tu rol o pregunta en el equipo.

---

## General

### ¿Qué es KDD?

**Knowledge-Driven Development (KDD)** es una metodología que convierte la documentación en la fuente de verdad del producto. Las especificaciones viven en `/specs` junto al código, se revisan en pull requests y evolucionan con el sistema. KDD se organiza en seis capas: desde requisitos de negocio hasta verificación.

> **Ver**: [¿Qué es KDD?](start/what-is-kdd.md) para introducción completa.

### ¿Es obligatorio usar KDD para todo?

No. El nivel de documentación depende del riesgo del cambio.

| Tipo de cambio | Documentación recomendada |
|---|---|
| **Crítico** (pagos, seguridad, legal) | Completa: OBJ + UC + BR + UI + REQ |
| **Feature normal** | Mínima: OBJ + UC + UI básica |
| **Cambio pequeño** | Actualizar el UC existente |
| **Bug fix** | Solo si revela conocimiento nuevo |

> **Ver**: [Guía para Tech Leads](guides/tech-lead.md#cuanta-documentacion) para decidir el nivel de cobertura.

### ¿En qué idioma escribo las specs?

El contenido narrativo va en español. Los términos técnicos y de KDD van en inglés.

| Aspecto | Idioma | Ejemplo |
|---|---|---|
| Narrativa | Español | "El PM crea un Objective." |
| Términos KDD | Inglés | Use Case (UC), Business Rule (BR) |
| IDs | Inglés en MAYÚSCULAS | `BR-PROYECTO-001`, `CMD-003` |
| Frontmatter | Inglés | `kind: business-rule`, `status: draft` |
| Código en ejemplos | Inglés | `function createProyecto()` |

> **Ver**: [Guía de estilo](STYLE-GUIDE.md#idioma) para reglas completas.

### ¿Dónde encuentro los templates?

Los templates están en `/kdd/templates/`. Copia el template correspondiente, renómbralo según la convención de tu artefacto y rellena las secciones.

```
/kdd/templates/
├── objective.template.md
├── use-case.template.md
├── business-rule.template.md
├── ui-view.template.md
├── command.template.md
└── ...
```

> **Ver**: [Referencia de templates](reference/templates.md) para índice completo.

### ¿Quién es responsable de mantener los specs?

Quien hace el cambio actualiza la spec correspondiente. El cambio de código y el cambio de spec van en el mismo PR.

- PM cambia requisitos → actualiza OBJ, UC
- Diseñador rediseña → actualiza UI
- Dev descubre nueva regla → crea/actualiza BR
- QA encuentra caso no cubierto → actualiza UC o crea REQ

> **Ver**: [Cómo cambiar un requisito existente](workflows/change-requirement.md).

### ¿Cómo empiezo si nunca usé KDD?

Lee la guía específica de tu rol. Cada guía toma 10 minutos y te muestra qué artefactos crear.

- **Product Manager**: [Guía para PMs](guides/pm.md)
- **Diseñador UX/UI**: [Guía para Diseñadores](guides/designer.md)
- **Desarrollador**: [Guía para Devs](guides/dev.md)
- **QA Engineer**: [Guía para QA](guides/qa.md)
- **Tech Lead**: [Guía para Tech Leads](guides/tech-lead.md)

Si prefieres aprender haciendo, haz el tutorial de tu rol en `/tutorials/`.

> **Ver**: [Cómo adoptar KDD en un proyecto existente](workflows/adopt-kdd.md).

---

## Para Product Managers

### ¿Cuál es la diferencia entre OBJ y UC?

Un **Objective (OBJ)** captura *qué* quiere el usuario y *por qué*. Un **Use Case (UC)** describe *cómo* lo logra, paso a paso.

| Objective (OBJ) | Use Case (UC) |
|---|---|
| Alto nivel, contexto de usuario | Detallado, flujo paso a paso |
| "Como X, quiero Y, para Z" | Flujo principal + excepciones |
| 1 OBJ puede generar N UCs | 1 UC implementa parte de 1+ OBJs |

**Ejemplo**:
- **OBJ-015**: "Como usuario, quiero compartir mis análisis"
- **UC-015**: Generar link de compartir
- **UC-016**: Revocar link de compartir
- **UC-017**: Ver análisis compartido (sin cuenta)

> **Ver**: [Guía para PMs](guides/pm.md#objective-obj).

### ¿Cuándo creo un ADR?

Crea un **ADR (Architecture Decision Record)** cuando alguien podría preguntar "¿por qué hicimos esto?" en el futuro. Los ADRs documentan decisiones importantes con consecuencias duraderas.

**Crea ADR para**:
- Elección de tecnología principal
- Modelo de negocio o pricing
- Decisión de *no* hacer algo importante
- Trade-off significativo entre opciones

**No necesitas ADR para**:
- Decisiones técnicas menores
- Cosas obvias que el equipo entiende
- Decisiones temporales que cambiarán pronto

> **Ver**: [Referencia de ADRs](reference/artifacts.md#adr).

### ¿Cómo documento un requisito no funcional?

Los requisitos no funcionales (performance, seguridad, accesibilidad) van en archivos separados en `specs/04-verification/criteria/` con `kind: nfr`.

```yaml
---
id: NFR-001
kind: nfr
title: Tiempo de respuesta del API
status: approved
---

# NFR-001: Tiempo de respuesta del API

## Requisito
El 95% de las requests al API deben responder en menos de 500ms.

## Cómo lo medimos
- APM en producción (New Relic)
- Tests de carga en staging (k6)

## Prioridad
Alta - afecta UX directamente
```

> **Ver**: [Referencia de Requirement](reference/artifacts.md#requirement-req).

### ¿Cómo conecto un OBJ con mis tareas de Jira/Linear?

Añade una sección de tracking en el OBJ con enlaces a tu herramienta de gestión.

```markdown
## Tracking
- Epic: [PROJ-123](https://linear.app/team/issue/PROJ-123)
- Issues relacionados: PROJ-124, PROJ-125, PROJ-126
```

O referencia la spec desde el issue:
```
Spec: /specs/00-requirements/objectives/OBJ-015-Compartir-Analisis.md
```

> **Ver**: [Guía para PMs](guides/pm.md#tracking-con-herramientas-externas).

### ¿Cómo documento una Value Unit?

Una **Value Unit (UV)** agrupa múltiples artefactos que entregan valor juntos. Las UVs organizan el trabajo en iteraciones.

Crea el archivo en `specs/00-requirements/value-units/` con tres secciones: Implemented, Pending, Out of scope.

```markdown
## Implemented
- [x] BR-MIEMBRO-001: Mínimo 3 miembros

## Pending — Iteration: Configuración básica
- [ ] CMD-024: Generate miembro profile
- [ ] UI-MiembroForm: Formulario con IA

## Out of scope (deferred)
- ~~Importar miembros desde CSV~~
```

Marca ítems completos con `[x]` y muévelos a "Implemented". Nunca reimplementes ítems marcados como completos.

> **Ver**: [Guía para PMs](guides/pm.md) y `.claude/rules/kdd-value-units.md`.

---

## Para Diseñadores

### ¿Tengo que crear la spec antes de diseñar en Figma?

No necesariamente. Puedes trabajar en el orden que prefieras.

**Opción 1 (Spec first)**: Lee el UC → escribes `UI-xxx.md` → diseñas en Figma
**Opción 2 (Design first)**: Diseñas en Figma → documentas en `UI-xxx.md`

Lo importante es que la spec exista cuando entregas el diseño. La spec conecta tu diseño con el comportamiento del sistema.

> **Ver**: [Guía para Diseñadores](guides/designer.md#flujo-de-trabajo).

### ¿Qué estados debo documentar siempre?

El Diseñador documenta al menos estos cuatro estados en cada UI spec. Si omites uno, explica por qué.

| Estado | Siempre? | Cuándo omitir |
|---|---|---|
| **Loading** | Sí | Vista sin datos remotos (estática) |
| **Empty** | Sí | Siempre hay datos mínimos |
| **Error** | Sí | Operación que nunca puede fallar (raro) |
| **Success** | Sí | Nunca |

**Ejemplo de omisión justificada**:
```markdown
### Empty
N/A - Esta vista siempre muestra al menos el mensaje de bienvenida.
```

> **Ver**: [Guía para Diseñadores](guides/designer.md#estados-obligatorios).

### ¿Cómo documento un componente vs una página?

Ambos usan el mismo formato (`UI-xxx.md`) pero con diferente `kind` en el frontmatter.

```yaml
# Página (tiene ruta)
---
kind: ui-view
route: /dashboard
---

# Componente (reutilizable, sin ruta)
---
kind: ui-component
# sin campo route
---
```

Las páginas tienen navegación y contexto completo. Los componentes son reutilizables y se componen dentro de páginas.

> **Ver**: [Referencia de UI specs](reference/artifacts.md#ui-view).

### ¿Dónde pongo mis archivos de Figma?

Tienes tres opciones. Elige la que mejor funcione para tu equipo.

**Opción A - Link en la spec**:
```markdown
## Layout
**Figma**: [Ver diseño](https://figma.com/file/xxx)
```

**Opción B - Wireframe ASCII + Figma separado**:
```markdown
## Layout
┌──────────────┐
│  Header      │
├──────────────┤
│  Main        │
│  Content     │
└──────────────┘

**Figma (alta fidelidad)**: [Link](https://figma.com/...)
```

**Opción C - Imagen exportada**:
```markdown
![Layout Dashboard](./images/ui-dashboard.png)
```

> **Ver**: [Guía para Diseñadores](guides/designer.md#conectar-con-figma).

### ¿Qué hago si el UC no tiene todos los casos de error?

Colabora con el PM para completar el UC. Si es urgente, añade los casos tú y marca el UC como `status: review` para que lo revisen.

```markdown
## Excepciones

### E4: Usuario sin puntos suficientes
(Añadido por Designer - requiere validación PM)
- El Sistema muestra modal "Puntos insuficientes"
- El Sistema ofrece opción "Comprar puntos"
```

Notifica al PM que actualizaste el UC. Nunca adivines el comportamiento de negocio.

> **Ver**: [Cómo cambiar un requisito existente](workflows/change-requirement.md).

---

## Para Desarrolladores

### ¿Tengo que leer las specs antes de implementar?

Sí. Las specs te dicen qué implementar, qué validar y qué errores manejar.

**Qué leer antes de implementar**:
- **Use Case (UC)**: Flujo completo, contexto de usuario
- **Command (CMD)**: Validaciones, precondiciones, errores posibles
- **Business Rules (BR)**: Restricciones invariables del negocio
- **Entity**: Atributos, estados, transiciones

Lee las specs con el mismo rigor que lees el código existente. Si la spec está incompleta, complétala antes de implementar.

> **Ver**: [Guía para Devs](guides/dev.md#como-leer-specs).

### ¿Qué hago si la spec está incompleta?

Sigue este proceso en orden.

1. **Pregunta al PM o Diseñador**. Es su responsabilidad completar la spec.
2. **Si es urgente**, completa la parte faltante tú mismo y marca el artefacto como `status: review`.
3. **Notifica** al responsable original que actualizaste la spec.

Nunca adivines comportamiento de negocio. Una spec incompleta es mejor que una spec incorrecta.

> **Ver**: [Guía para Devs](guides/dev.md#specs-incompletas).

### ¿Cómo documento algo que descubrí durante la implementación?

Si descubres conocimiento no documentado, créalo inmediatamente en la capa correspondiente.

**Descubriste una regla de negocio**:
```bash
# Crea el archivo
touch specs/01-domain/rules/BR-PUNTO-003-Liberacion-En-Cancelacion.md
# Documenta la regla
# Notifica al PM que creaste la BR
```

**Descubriste un caso edge en un UC**:
```markdown
## Excepciones

### E5: Usuario cierra la sesión durante el proceso
(Descubierto durante implementación - 2024-12-15)
- El Sistema detecta sesión cerrada
- El Sistema cancela el proceso y libera recursos
```

Marca el artefacto como `status: review` y notifica al equipo.

> **Ver**: [Cómo documentar un bug fix](workflows/bug-fix.md#el-bug-revela-conocimiento-nuevo).

### ¿Los tests deben seguir los criterios de la spec?

Sí. Los criterios de aceptación en UCs y REQs son literalmente casos de test. Cada excepción documentada se convierte en un test case.

```markdown
## Excepciones
E1: Título vacío → Error "El título es requerido"
```

Se convierte en:

```typescript
it('should return error when title is empty', async () => {
  const result = await createProyecto({ titulo: '' })

  expect(result.error).toBe('El título es requerido')
})
```

Si encuentras un caso no documentado, añádelo a la spec primero, luego escribe el test.

> **Ver**: [Tutorial: De spec a test](tutorials/spec-to-test.md).

### ¿Qué hago si la spec y el código se contradicen?

La spec es la fuente de verdad. Si hay conflicto, la spec gana y el código se corrige. Sigue este proceso:

1. **Verifica que la spec refleje el comportamiento de negocio correcto**. Pregunta al PM si tienes duda.
2. **Si la spec es correcta**: corrige el código para que coincida con la spec.
3. **Si la spec está desactualizada**: actualiza la spec primero, luego adapta el código.

Nunca cambies el código sin sincronizar la spec en el mismo PR.

> **Ver**: [Cómo documentar un bug fix](workflows/bug-fix.md).

---

## Para QA

### ¿Dónde están los criterios de aceptación?

Los criterios de aceptación viven en dos lugares según el nivel de formalidad.

**Use Cases (UC)**: Criterios implícitos en el flujo principal y excepciones.
```markdown
## Flujo Principal
5. El Sistema valida que el título tenga entre 1 y 100 caracteres

## Excepciones
E1: Título vacío → mostrar error "El título es requerido"
```

**Requirements (REQ)**: Criterios formales usando sintaxis EARS.
```markdown
WHEN el Usuario submits el formulario,
  IF el título está vacío,
  the Sistema SHALL return error "El título es requerido"
  AND SHALL NOT create the Proyecto.
```

> **Ver**: [Guía para QA](guides/qa.md#donde-encontrar-criterios).

### ¿Cómo derivo test cases de un UC?

Mapea cada sección del UC a un tipo de test.

| Sección del UC | Tipo de test | Ejemplo |
|---|---|---|
| **Flujo principal** | Happy path test | Usuario crea Proyecto exitosamente |
| **Excepciones** | Edge case tests | Título vacío, título muy largo |
| **Precondiciones** | Setup tests | Usuario debe estar autenticado |
| **Postcondiciones** | Verification tests | Evento EVT-Proyecto-Creado emitido |

Cada paso del flujo principal se convierte en un assertion. Cada excepción se convierte en un test separado.

> **Ver**: [Tutorial: De spec a test](tutorials/spec-to-test.md).

### ¿Cómo reporto un hueco en las specs?

Si encuentras un caso no cubierto durante testing, documéntalo y notifica al responsable.

**Si el hueco está en un UC**:
```markdown
## Excepciones

### E6: Red lenta causa timeout
(Reportado por QA - 2024-12-15 - requiere definición de comportamiento)
- [ ] ¿Qué hace el Sistema si la request tarda más de 30s?
- [ ] ¿Reintenta automáticamente?
```

Marca el UC como `status: review` y asigna al PM. No implementes comportamiento sin validación.

> **Ver**: [Guía para QA](guides/qa.md#reportar-huecos).

### ¿Cómo verifico trazabilidad de spec a código?

Usa wiki-links y herramientas de búsqueda para verificar que cada spec tiene implementación correspondiente.

**Checklist de trazabilidad**:
1. **OBJ → UC**: Cada Objective tiene al menos un Use Case que lo implementa
2. **UC → CMD**: Cada acción del UC tiene un Command documentado
3. **BR → Código**: Cada Business Rule tiene validación en el código
4. **CMD → Test**: Cada Command tiene tests que cubren sus errores

**Herramientas**:
```bash
# Busca referencias a un BR
grep -r "BR-PROYECTO-005" specs/

# Busca wiki-links a una entidad
grep -r "\[\[Proyecto\]\]" specs/

# Busca tests relacionados con un comando
grep -r "CMD-003" tests/
```

> **Ver**: [Guía para QA](guides/qa.md#verificar-trazabilidad).

---

## Para Tech Leads

### ¿Cómo reviso PRs de specs?

Revisa specs con el mismo rigor que revisas código. Usa el checklist del style guide.

**Checklist rápido**:
- [ ] Frontmatter completo (`id`, `kind`, `status`)
- [ ] Primer párrafo responde "qué hace y por qué importa"
- [ ] Voz activa en 90%+ de las oraciones
- [ ] Términos KDD definidos en primera mención
- [ ] Ejemplos usan datos reales del proyecto (no genéricos)
- [ ] Wiki-links apuntan a artefactos existentes o en draft
- [ ] Status apropiado (`draft`, `review`, `approved`)

Rechaza PRs que modifican comportamiento sin actualizar la spec correspondiente.

> **Ver**: [Workflow: Revisar specs](workflows/review-specs.md) y [Guía de estilo completa](STYLE-GUIDE.md#checklist-rapido).

### ¿Cómo mido cobertura de specs?

Define métricas según el nivel de madurez de tu proyecto.

**Métricas básicas**:
- % de entidades documentadas en `/01-domain/entities/`
- % de comandos críticos con spec en `/02-behavior/commands/`
- % de pantallas principales con UI spec

**Métricas avanzadas**:
- Ratio specs `approved` vs `draft`
- % de PRs que incluyen actualización de spec
- % de bugs causados por spec incompleta vs bug de implementación

Herramienta de auditoría: revisa la carpeta `/specs` y compara con features en producción.

> **Ver**: [Guía para Tech Leads](guides/tech-lead.md#medir-cobertura).

### ¿Quién aprueba los specs?

Depende del tipo de artefacto. Los artefactos de negocio requieren aprobación del PM. Los artefactos técnicos los aprueba el Tech Lead.

| Artefacto | Aprueba |
|---|---|
| OBJ, REL, ADR (negocio) | PM Lead o Product Owner |
| UC, BR, BP | PM + Tech Lead |
| UI | Design Lead + PM |
| CMD, QRY, EVT | Tech Lead o Dev Senior |
| REQ | QA Lead + PM |

En la práctica, las specs se revisan en PR como cualquier código. El reviewer final depende del tipo.

> **Ver**: [Guía para Tech Leads](guides/tech-lead.md#gobernanza).

### ¿Cómo manejo conflictos entre spec y código en producción?

Si el código en producción contradice la spec aprobada, determina cuál refleja el comportamiento de negocio correcto.

**Caso A - La spec es correcta**:
- El código tiene un bug
- Crea issue con label "bug/spec-mismatch"
- Prioriza según impacto
- Fix: corregir código para que coincida con spec

**Caso B - El código es correcto**:
- La spec quedó desactualizada
- Actualiza la spec en el mismo PR donde se documenta
- Marca la spec como `status: review` hasta aprobación
- Considera si requiere ADR explicando el cambio

Nunca dejes specs y código inconsistentes. La inconsistencia destruye confianza en KDD.

> **Ver**: [Workflow: Cambiar un requisito](workflows/change-requirement.md).

---

## Sobre el flujo de trabajo

### ¿Puedo cambiar un spec que ya está `approved`?

Sí, pero el cambio pasa por el mismo proceso de revisión que la versión original.

1. Edita el archivo en tu rama
2. Cambia `status: approved` a `status: review`
3. Documenta el cambio en el PR description
4. Una vez aprobado, vuelve a `status: approved`

Para cambios mayores que afectan múltiples artefactos, considera crear un ADR explicando la decisión.

> **Ver**: [Workflow: Cambiar un requisito existente](workflows/change-requirement.md).

### ¿Qué hago con specs de features que ya no existen?

Marca el spec como `deprecated` y añade una nota indicando el reemplazo o la razón de deprecación. No borres el archivo: el historial tiene valor.

```yaml
---
id: OBJ-042
kind: objective
title: Integración con servicio X
status: deprecated
---

> **Nota**: Esta feature fue removida en v2.0 por bajo uso.
> Ver [[ADR-0025-Remover-Servicio-X]] para contexto.
```

Usa `git log` para investigar decisiones pasadas. Los specs deprecados son documentación histórica.

> **Ver**: [Referencia: Status lifecycle](reference/status-lifecycle.md#deprecated).

### ¿Cómo planifico una feature desde cero?

Sigue el workflow de cinco fases. Cada fase produce artefactos específicos.

```
IDEA → DISEÑO → BUILD → VERIFY → SHIP
```

| Fase | Artefactos | Responsable |
|---|---|---|
| **IDEA** | OBJ, ADR (si aplica) | PM |
| **DISEÑO** | UC, BR, UI | PM + Designer |
| **BUILD** | CMD, QRY, EVT | Dev |
| **VERIFY** | REQ, tests | QA + Dev |
| **SHIP** | Release notes, actualizar REL | PM |

Puedes saltar fases para features simples. Documenta solo lo necesario según el riesgo.

> **Ver**: [Workflow: Nueva feature](workflows/new-feature.md).

---

## Problemas comunes

### "No sé por dónde empezar"

Lee la guía de tu rol y haz un tutorial. El onboarding completo toma 20 minutos.

**Ruta recomendada**:
1. Lee [¿Qué es KDD?](start/what-is-kdd.md) (5 min)
2. Lee la guía de tu rol en `/guides/` (10 min)
3. Haz el tutorial de tu rol en `/tutorials/` (5 min)
4. Ten abierto el [Cheatsheet](reference/cheatsheet.md) mientras trabajas

Si prefieres ver ejemplos reales antes de leer, explora `/specs/` del proyecto TaskFlow.

> **Ver**: [Cómo adoptar KDD](workflows/adopt-kdd.md).

### "Mis links aparecen rotos"

Los wiki-links `[[XXX]]` apuntan a otros archivos. Si aparecen rotos, verifica:

- El archivo destino no existe aún (está OK si tu artefacto está en `draft`)
- El nombre no coincide exactamente (case-sensitive: `[[Proyecto]]` ≠ `[[proyecto]]`)
- El archivo está en una subcarpeta no esperada

Los links rotos son aceptables en estado `draft`. Corrígelos antes de cambiar a `status: review`.

> **Ver**: [Referencia: Naming](reference/naming.md#wiki-links).

### "No sé si es BR o BP"

Pregunta: "¿Este valor podría cambiar sin reconstruir el sistema?"

- **SÍ puede cambiar** → **Business Policy (BP)**: regla configurable (ej: "El precio de un punto es $0.99")
- **NO puede cambiar** → **Business Rule (BR)**: restricción invariable (ej: "El título debe tener máximo 100 caracteres")

**Más ejemplos**:
- "Un Proyecto tiene máximo 4 tareas" → BR (límite fijo del dominio)
- "El timeout de sesión es 30 minutos" → BP (podría ser configurable)

> **Ver**: [Referencia de BR vs BP](reference/artifacts.md#business-rule-vs-business-policy).

### "El spec es muy largo"

Divide el artefacto en piezas más pequeñas y enlázalas. Los Use Cases complejos se dividen en sub-UCs.

```markdown
# UC-001: Flujo Completo de Compra

Este caso incluye múltiples subflujos:

- [[UC-001A-Seleccionar-Producto]]
- [[UC-001B-Checkout]]
- [[UC-001C-Confirmacion]]

Cada subflujo se ejecuta en secuencia. Ver los UCs individuales
para detalle de validaciones y excepciones.
```

Cada sub-UC tiene su propio archivo con frontmatter completo.

> **Ver**: [Guía para PMs](guides/pm.md#dividir-use-cases-complejos).

### "Mi equipo no sigue las convenciones"

Establece validación en el proceso de revisión. Los PRs que no siguen convenciones se rechazan con feedback específico.

**Checklist de revisión obligatorio**:
- [ ] Frontmatter completo con `id`, `kind`, `status`
- [ ] Primer párrafo claro (qué hace y por qué importa)
- [ ] Términos KDD consistentes (no alternar sinónimos)
- [ ] Ejemplos usan datos del proyecto (no genéricos)

Considera añadir linter automatizado para frontmatter (`kdd-lint` en pipeline CI).

> **Ver**: [Workflow: Revisar specs](workflows/review-specs.md).

---

## ¿Tu pregunta no está aquí?

Consulta estos recursos adicionales:

- **Referencia completa de artefactos**: [reference/artifacts.md](reference/artifacts.md)
- **Cheatsheet de una página**: [reference/cheatsheet.md](reference/cheatsheet.md)
- **Guías por rol**: [guides/](guides/)
- **Tutoriales prácticos**: [tutorials/](tutorials/)
- **Conceptos avanzados**: [concepts/](concepts/)

Si ningún documento responde tu pregunta, pregunta en el canal del equipo o abre un issue para sugerir nueva documentación.
