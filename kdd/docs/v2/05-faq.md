# Preguntas Frecuentes (FAQ)

> Respuestas rápidas a dudas comunes sobre KDD.

---

## Generales

### ¿Es obligatorio usar KDD para todo?

No. El nivel de documentación depende del riesgo:

| Tipo de cambio | Documentación sugerida |
|----------------|------------------------|
| **Crítico** (pagos, seguridad, legal) | Todo: OBJ + UC + BR + UI + REQ |
| **Feature normal** | OBJ + UC + UI básica |
| **Cambio pequeño** | Solo actualizar el UC existente |
| **Bug fix** | Ninguna (solo el código) |

### ¿Quién es responsable de mantener los specs?

Quien hace el cambio:

- PM cambia requisitos → actualiza OBJ, UC
- Diseñador rediseña → actualiza UI
- Dev descubre nueva regla → crea/actualiza BR

### ¿Puedo escribir en español?

Sí, todo el contenido narrativo va en español. Solo van en inglés:

- IDs: `UC-001`, `BR-RETO-001`
- Prefijos: `kind: use-case`
- Código técnico en ejemplos

### ¿Dónde encuentro los templates?

```
/kdd/templates/
├── objective.template.md
├── use-case.template.md
├── rule.template.md
├── ui-view.template.md
└── ...
```

Copia el template, renombra, y rellena.

---

## Para PMs

### ¿Cuál es la diferencia entre OBJ y UC?

| OBJ (Objective) | UC (Use Case) |
|-----------------|---------------|
| **Qué** quiere el usuario | **Cómo** lo logra |
| Alto nivel | Detallado paso a paso |
| "Como X, quiero Y, para Z" | Flujo principal + excepciones |
| 1 OBJ puede generar N UCs | 1 UC implementa parte de 1+ OBJs |

**Ejemplo**:
- OBJ: "Como usuario, quiero compartir mis análisis"
- UCs derivados:
  - UC-015: Generar link de compartir
  - UC-016: Revocar link de compartir
  - UC-017: Ver análisis compartido (sin cuenta)

### ¿Cuándo creo un ADR?

Cuando alguien podría preguntar "¿por qué hicimos esto?" en el futuro:

- Elección de modelo de negocio
- Decisión de no hacer algo
- Cambio de estrategia
- Trade-off importante

**No necesitas ADR para**: decisiones técnicas menores, cosas obvias.

### ¿Cómo documento un requisito no funcional?

Los NFRs (performance, seguridad, etc.) van en `/specs/00-requirements/`:

```markdown
---
id: NFR-001
kind: nfr
title: Tiempo de respuesta
status: approved
---

# NFR-001: Tiempo de respuesta

## Requisito
El 95% de las requests deben responder en menos de 500ms.

## Cómo lo medimos
- APM en producción
- Tests de carga en staging

## Prioridad
Alta - afecta UX directamente
```

### ¿Cómo conecto un OBJ con las tareas de Jira/Linear?

En el OBJ puedes añadir una sección de tracking:

```markdown
## Tracking
- Epic: [PROJ-123](https://linear.app/...)
- Issues: PROJ-124, PROJ-125, PROJ-126
```

O viceversa: en Jira/Linear referencia el OBJ:
```
Spec: /specs/00-requirements/objectives/OBJ-015.md
```

---

## Para Diseñadores

### ¿Tengo que crear la spec antes de diseñar en Figma?

No necesariamente. Puedes:

1. **Spec first**: Lees UC → escribes UI-xxx → diseñas
2. **Design first**: Diseñas → documentas en UI-xxx

Lo importante es que exista la spec cuando terminas.

### ¿Qué estados debo documentar siempre?

Como mínimo:

| Estado | Siempre? | Cuándo omitir |
|--------|----------|---------------|
| **Loading** | Sí | Vista sin datos remotos |
| **Empty** | Sí | Siempre hay datos |
| **Error** | Sí | Nunca falla (raro) |
| **Success** | Sí | Nunca |

Si omites uno, documenta por qué:

```markdown
### Empty
N/A - Esta vista siempre tiene al menos el mensaje de bienvenida.
```

### ¿Cómo documento un componente vs una página?

Ambos usan `UI-xxx.md`, pero diferente `kind`:

```yaml
# Página (tiene ruta)
kind: ui-view
route: /dashboard

# Componente (reutilizable, sin ruta)
kind: ui-component
# sin route
```

### ¿Dónde pongo mis archivos de Figma?

Opción A: Link en la spec
```markdown
## Layout
**Figma**: [Ver diseño](https://figma.com/file/xxx)
```

Opción B: Wireframe ASCII en la spec + Figma separado

Opción C: Imagen exportada
```markdown
![Layout](./images/ui-dashboard.png)
```

### ¿Qué pasa si el UC no tiene todos los casos de error?

Dos opciones:

1. **Pide al PM que lo complete** (ideal)
2. **Añádelos tú** y marca el UC como `status: review` para que lo revisen

---

## Para Devs

### ¿Tengo que leer los specs antes de implementar?

Sí, especialmente:

- El **UC** te dice el flujo completo
- Los **CMD** te dicen qué errores manejar
- Las **BR** te dicen las validaciones

### ¿Qué hago si la spec está incompleta?

1. Pregunta al PM/Diseñador
2. Si es urgente, complétala tú y marca como `review`
3. No adivines: una spec incompleta es mejor que una incorrecta

### ¿Cómo documento algo que descubrí durante la implementación?

Si descubres una regla de negocio no documentada:

```bash
# Crea la regla
/specs/01-domain/rules/BR-NUEVO-001.md
```

Si descubres un caso edge en un UC:

```markdown
## Excepciones

### E5: Caso edge descubierto durante implementación
(Añádelo y notifica al PM)
```

### ¿Los tests deben seguir los criterios de la spec?

Sí. Los criterios de aceptación en UC y REQ son literalmente los casos de test:

```markdown
## Excepciones
E1: Título vacío → Error "El título es requerido"
```

Se convierte en:

```typescript
it('should return error when title is empty', () => {
  // ...
  expect(error.message).toBe('El título es requerido')
})
```

---

## Sobre el flujo de trabajo

### ¿Quién aprueba los specs?

Depende del tipo:

| Artefacto | Aprueba |
|-----------|---------|
| OBJ, REL | PM Lead o Product Owner |
| UC, BR, BP | PM + Tech Lead |
| UI | Design Lead + PM |
| CMD, QRY | Tech Lead |

En la práctica: PR review como cualquier otro código.

### ¿Puedo cambiar un spec que ya está `approved`?

Sí, pero:

1. Crea una nueva versión o edita directamente
2. Cambia status a `review` mientras se revisa
3. Una vez aprobado, vuelve a `approved`

Para cambios mayores, considera crear un ADR explicando el cambio.

### ¿Qué pasa con specs de features que ya no existen?

Márcalos como `deprecated` y añade una nota:

```yaml
status: deprecated
---

> **Nota**: Esta feature fue removida en v2.0.
> Ver [[ADR-0025-RemoverFeatureX]] para contexto.
```

No los borres: el historial tiene valor.

---

## Problemas comunes

### "No sé por dónde empezar"

1. Abre `/specs/00-requirements/objectives/`
2. Lee 2-3 OBJs existentes
3. Crea tu primer OBJ para una feature que conozcas

### "Mis links aparecen rotos"

Los links `[[XXX]]` apuntan a otros archivos. Si están rotos:

- El archivo destino no existe aún (está ok si es WIP)
- El nombre no coincide exactamente (case-sensitive)

### "No sé si es BR o BP"

Pregunta: "¿Este valor podría cambiar sin reconstruir el sistema?"

- **Sí** → BP (policy configurable)
- **No** → BR (regla fija)

Ejemplos:
- "El título debe tener máximo 100 caracteres" → BR (es una restricción fija)
- "El precio de un crédito es $0.99" → BP (podría cambiar)

### "El spec es muy largo"

Divide y enlaza:

```markdown
# UC-001: Flujo Completo de Compra

Este caso incluye múltiples subflujos:
- [[UC-001A-SeleccionarProducto]]
- [[UC-001B-Checkout]]
- [[UC-001C-Confirmacion]]
```

---

*¿Tu pregunta no está aquí? Abre un issue o pregunta en Slack.*
