# Levantamiento KDD para Migración Tecnológica

> **Propósito**: Estrategia para levantar el conocimiento funcional de una aplicación existente usando metodología KDD, orientado a migración tecnológica.

## Contexto de uso

Este documento describe cómo capturar el conocimiento de una aplicación legacy cuando se dispone de:

- **Documentación funcional** (potencialmente desactualizada)
- **Código fuente** (Java, PL/SQL u otros)
- **Acceso a usuarios e IT** para sesiones de trabajo

El objetivo es generar especificaciones KDD que sirvan como fuente de verdad para la migración.

---

## Visión General

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LEVANTAMIENTO KDD - MIGRACIÓN TECNOLÓGICA                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FASE 0          FASE 1           FASE 2          FASE 3         FASE 4    │
│  Preparación     Descubrimiento   Validación      Extracción     Curación  │
│  ──────────      ────────────     ──────────      ──────────     ────────  │
│                                                                             │
│  • Docs → Hip.   • Event Storm.   • Mapeo         • 3 pasadas    • Review  │
│  • C4 Level 1    • C4 Level 2     • Técnico ↔     • código       • Approve │
│  • Inventario    • Ontología        Dominio       • Reglas       • KB Gold │
│    técnico         borrador                         ocultas                 │
│                                                                             │
│  ────────────────────────────────────────────────────────────────────────── │
│  KB Draft ──────────────────────────────────────────────────▶ KB Approved  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Principios clave

1. **La documentación genera hipótesis, no conocimiento asumido** - Evita contaminar al equipo con información potencialmente obsoleta.

2. **El código entra temprano** - El análisis estructural informa el Event Storming, no viene después.

3. **Los eventos son el eje central** - Son más atómicos que los casos de uso y mapean mejor al código. Los casos de uso se derivan después.

4. **El KB tiene estados, no repositorios separados** - Los artefactos progresan de `draft` → `reviewed` → `approved` mediante metadatos en frontmatter.

5. **Usuarios aportan el qué y por qué; código revela el cómo exacto** - Las sesiones con usuarios son para conocimiento superficial/intermedio; los detalles salen del código.

---

## Fase 0: Preparación

> **Objetivo**: Llegar al Event Storming con hipótesis estructuradas, no con la mente en blanco ni con "conocimiento" asumido.

### Entradas

- Documentación funcional del cliente (manuales, specs antiguas)
- Acceso al código fuente (Java + PL/SQL)
- Acceso a la base de datos

### Actividades

| Actividad | Responsable | Output |
|-----------|-------------|--------|
| Revisar documentación | Analista | Lista de hipótesis a validar |
| Script SQL de inventario | Tech Lead | `inventario-objetos.csv` |
| JQAssistant sobre Java | Tech Lead | Grafo de dependencias Java |
| Identificar módulos/esquemas | Equipo | C4 Level 1 borrador |
| Cruzar dependencias Java ↔ PL/SQL | Tech Lead | Mapa de integración |

### Script SQL de inventario (PL/SQL)

```sql
-- Inventario de objetos
SELECT object_name, object_type, status, created, last_ddl_time
FROM dba_objects
WHERE owner = 'TU_SCHEMA'
AND object_type IN ('PACKAGE', 'PROCEDURE', 'FUNCTION', 'TRIGGER', 'VIEW');

-- Dependencias entre objetos
SELECT name, type, referenced_name, referenced_type
FROM dba_dependencies
WHERE owner = 'TU_SCHEMA';

-- Tablas y relaciones
SELECT table_name, constraint_name, r_constraint_name
FROM dba_constraints
WHERE owner = 'TU_SCHEMA' AND constraint_type = 'R';
```

### Output de Fase 0

```
/specs/_draft/
├── HIPOTESIS-001-modulo-facturacion.md
├── HIPOTESIS-002-modulo-inventario.md
├── ...
├── C4-LEVEL1-borrador.md
└── inventario-tecnico/
    ├── java-dependencies.json
    ├── plsql-objects.csv
    └── integracion-java-plsql.md
```

### Formato de hipótesis

Las hipótesis se escriben como **preguntas**, no como afirmaciones:

```markdown
---
id: HIPOTESIS-001
modulo: Facturación
source: Manual Usuario 2019, Cap. 4
---

# Hipótesis: Módulo de Facturación

## Preguntas a validar en Event Storming

- [ ] ¿Existen los estados "Borrador", "Validada", "Anulada" que menciona el manual?
- [ ] ¿El proceso de aprobación >10K€ sigue vigente?
- [ ] ¿La integración con SAP sigue activa o se desactivó?

## Conceptos mencionados en documentación

- Factura (¿entidad principal?)
- Línea de factura
- Aprobador (¿rol o usuario?)

## Dudas técnicas (del inventario)

- PKG_FACT_LEGACY: ¿Sigue en uso o es código muerto?
- TRG_FACT_AUDIT: ¿Qué eventos dispara?
```

---

## Fase 1: Descubrimiento (Event Storming)

> **Objetivo**: Construir la ontología del dominio con el vocabulario real del negocio, validando hipótesis de la Fase 0.

### Participantes

- **Usuarios clave de negocio**: Conocen el "qué" y "por qué"
- **Equipo IT del cliente**: Conocen integraciones y excepciones
- **Equipo de migración**: Capturan y facilitan

### Estructura de las sesiones

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SESIÓN DE EVENT STORMING                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Bloque 1 (45 min): Descubrimiento de eventos                       │
│  ─────────────────────────────────────────────                      │
│  "¿Qué cosas PASAN en [módulo X] que son importantes?"              │
│  → Capturar eventos en post-its naranjas                            │
│  → Ordenar en línea temporal                                        │
│                                                                     │
│  Bloque 2 (30 min): Validación de hipótesis                         │
│  ─────────────────────────────────────────────                      │
│  "En la documentación vimos X, ¿sigue siendo así?"                  │
│  → Confirmar / Descartar / Matizar hipótesis                        │
│                                                                     │
│  Bloque 3 (15 min): Hallazgos técnicos                              │
│  ─────────────────────────────────────────────                      │
│  "En el código vimos un proceso llamado X, ¿qué es?"                │
│  → Mapear nombres técnicos a conceptos de negocio                   │
│                                                                     │
│  Pausa (10 min)                                                     │
│                                                                     │
│  Repetir para siguiente módulo...                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Preguntas que desbloquean eventos

| Pregunta | Tipo de evento que descubre |
|----------|----------------------------|
| "¿Qué pasa cuando...?" | Eventos del happy path |
| "¿Qué puede salir mal?" | Eventos de error/excepción |
| "¿Hay casos donde NO se puede continuar?" | Eventos de bloqueo |
| "¿Quién se entera cuando esto pasa?" | Eventos que disparan notificaciones |
| "¿Esto queda registrado en algún lado?" | Eventos que generan auditoría |
| "¿Hay algo que pasa automáticamente después?" | Eventos que disparan procesos batch |

### Del evento al comando

Una vez tienes los eventos, preguntas: **"¿Quién o qué CAUSA que esto pase?"**

```
┌─────────────────┐         ┌─────────────────┐
│    COMANDO      │────────▶│     EVENTO      │
│  (la acción)    │         │  (el resultado) │
└─────────────────┘         └─────────────────┘

"Aprobar Pedido"      →     "Pedido Aprobado"
"Rechazar Pedido"     →     "Pedido Rechazado"
"Generar Factura"     →     "Factura Generada"
   (automático)
```

### Nivel de detalle

**Superficial/intermedio**. Las sesiones con usuarios son para:
- Flujos principales (happy path)
- Conceptos de negocio y su vocabulario
- Reglas de negocio CONOCIDAS
- Integraciones con otros sistemas

Los detalles (validaciones exactas, cálculos, casos edge) vendrán del código.

### Output por sesión

```
/specs/_draft/
├── ES-001-facturacion/
│   ├── eventos.md           # Lista de eventos descubiertos
│   ├── actores.md           # Quién dispara qué (→ entidades kind: role)
│   ├── sistemas.md          # Sistemas externos (→ entidades kind: system, MAYÚSCULAS)
│   ├── reglas-conocidas.md  # Reglas que los usuarios mencionaron
│   ├── hipotesis-validadas.md
│   └── fotos-tablero/       # Evidencia visual
```

> **Nota sobre nomenclatura KDD:**
> - Actores/roles se documentan como entidades con `kind: role` (ej: `Usuario.md`, `Propietario.md`)
> - Sistemas externos con `kind: system` en **MAYÚSCULAS** (ej: `SAP.md`, `ORACLE.md`)

---

## Fase 2: Validación (Mapeo Técnico ↔ Dominio)

> **Objetivo**: Cruzar los hallazgos del Event Storming con el inventario técnico. Establecer la trazabilidad código → concepto de negocio.

### Participantes

- Equipo técnico de migración (principalmente)
- IT del cliente (consultas puntuales)

### Actividades

| Actividad | Input | Output |
|-----------|-------|--------|
| Mapear eventos → código | Eventos ES + inventario técnico | Matriz de trazabilidad |
| Identificar huecos | Matriz de trazabilidad | Lista de "código huérfano" |
| Completar C4 Level 2 | C4 L1 + hallazgos ES | Diagrama de contenedores |
| Generar ontología borrador | Eventos + actores + reglas | Entidades KDD (status: draft) |

### Matriz de trazabilidad

```markdown
| Evento (negocio)      | Código Java              | PL/SQL                  | Tabla(s)        |
|-----------------------|--------------------------|-------------------------|-----------------|
| Pedido Registrado     | PedidoService.crear()    | PKG_PEDIDOS.insertar    | PEDIDOS         |
| Pedido Aprobado       | AprobacionController     | TRG_PEDIDO_APROBADO     | PEDIDOS, LOG_AP |
| Factura Generada      | FacturaJob.run()         | PKG_FACTURACION.generar | FACTURAS        |
| ???                   | LegacyXProcessor.java    | SP_CALC_DESCUENTO       | ???             |
```

### Código huérfano

Código que no mapea a ningún evento conocido. Puede ser:

- **Funcionalidad obsoleta**: Candidata a no migrar
- **Funcionalidad olvidada**: Requiere sesión adicional con usuarios
- **Código técnico interno**: No es funcionalidad de negocio (logging, utils, etc.)

### Output de Fase 2

```
/specs/_draft/
├── trazabilidad/
│   ├── matriz-eventos-codigo.md
│   ├── codigo-huerfano.md
│   └── C4-LEVEL2.md
│
├── 01-domain/
│   ├── entities/
│   │   ├── ENT-Pedido.md        # status: draft
│   │   ├── ENT-Factura.md       # status: draft
│   │   └── ...
│   └── events/
│       ├── EVT-Pedido-Registrado.md
│       └── ...
```

---

## Fase 3: Extracción (Análisis de código en 3 pasadas)

> **Objetivo**: Extraer el conocimiento profundo del código usando la ontología validada como contexto.

### Herramientas

- **Claude Code** para análisis semántico
- **Script SQL de dependencias** para navegación
- **KB (RAG)** para contexto acumulado

### Pasada 1: Inventario técnico (sin IA semántica)

Extracción mecánica de firmas, sin interpretación:

```bash
# Para PL/SQL
SELECT object_name, object_type, referenced_name, referenced_type
FROM dba_dependencies WHERE owner = 'SCHEMA';

# Para Java (JQAssistant o grep)
→ Listar clases, métodos públicos, anotaciones
```

**Output**:
```
/specs/_draft/inventario/
├── plsql/
│   ├── PKG_PEDIDOS.md      # Solo firma: procedures, parámetros
│   ├── PKG_FACTURACION.md
│   └── triggers.md
└── java/
    ├── services.md
    ├── controllers.md
    └── jobs.md
```

### Pasada 2: Mapeo a ontología (Claude Code + contexto ES)

**Prompt pattern**:

```markdown
## Contexto de dominio (del Event Storming)
- Entidad: Pedido (estados: Borrador, Aprobado, Rechazado)
- Evento: PedidoAprobado (disparado por Jefe de Ventas)
- Regla: BR-PED-001 - Pedidos >10K requieren aprobación director

## Código a analizar
[código del PKG_PEDIDOS.aprobar]

## Tarea
1. ¿Este código implementa el evento "PedidoAprobado"?
2. ¿Qué reglas de negocio están codificadas aquí?
3. ¿Hay lógica que NO se mencionó en el Event Storming?
```

**Output**:
```
/specs/_draft/mapeo/
├── PKG_PEDIDOS-aprobar.md
│   ├── evento: EVT-Pedido-Aprobado
│   ├── reglas-encontradas: [BR-PED-001, BR-PED-002*]  # * = nueva
│   └── gaps: "Validación de crédito no mencionada en ES"
```

### Pasada 3: Extracción de reglas (profundidad total)

**Prompt pattern**:

```markdown
## Ontología validada
[Entidades, eventos, reglas conocidas desde /specs]

## Código a analizar
[código completo con dependencias]

## Tarea
Extraer TODAS las reglas de negocio en formato KDD:
- Condiciones exactas (umbrales, estados, validaciones)
- Cálculos (fórmulas, porcentajes)
- Excepciones y casos edge
```

**Output**:
```
/specs/_draft/01-domain/rules/
├── BR-PED-001.md   # Aprobación >10K (confirmada)
├── BR-PED-002.md   # Validación crédito (descubierta)
├── BR-PED-003.md   # Descuento por volumen (descubierta)
└── ...
```

---

## Fase 4: Curación (De Draft a Approved)

> **Objetivo**: Validar, revisar y promover artefactos al KB Gold (status: approved).

### Flujo de promoción

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│    DRAFT    │─────▶│  REVIEWED   │─────▶│  APPROVED   │
│             │      │             │      │             │
│ Extraído de │      │ Validado    │      │ Confirmado  │
│ docs/código │      │ técnicamente│      │ por negocio │
└─────────────┘      └─────────────┘      └─────────────┘
       │                   │                    │
   ¿Quién?             ¿Quién?              ¿Quién?
   Analista/IA         Tech Lead            Product Owner
                                            o Usuario clave
```

### Criterios de promoción

| Transición | Criterio | Evidencia requerida |
|------------|----------|---------------------|
| Draft → Reviewed | Técnicamente correcto | Trazabilidad a código verificada |
| Reviewed → Approved | Negocio confirma | Sesión de validación o firma |

### Sesiones de validación con usuarios

```
┌─────────────────────────────────────────────────────────────────────┐
│                   SESIÓN DE VALIDACIÓN (30-45 min)                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Para cada artefacto en status "reviewed":                          │
│                                                                     │
│  1. Presentar la regla/entidad/evento en lenguaje de negocio        │
│     "Según lo que encontramos, cuando un pedido supera 10K€,        │
│      debe ser aprobado por el director. ¿Es correcto?"              │
│                                                                     │
│  2. Capturar respuesta:                                             │
│     ✓ Correcto → status: approved                                   │
│     ✗ Incorrecto → ajustar y volver a reviewed                      │
│     ? Parcial → refinar y re-validar                                │
│                                                                     │
│  3. Registrar evidencia:                                            │
│     validated_by: "@juan.perez"                                     │
│     validated_date: "2024-01-20"                                    │
│     validation_notes: "Confirmado, umbral cambió a 15K en 2023"     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Frontmatter del artefacto aprobado

```yaml
---
id: BR-PED-001
title: Aprobación de pedidos de alto valor
type: business-rule
status: approved
confidence: high
sources:
  - type: code
    ref: "PKG_PEDIDOS.aprobar:45-67"
  - type: interview
    ref: "ES-001, Validación-003"
validated_by: "@juan.perez"
validated_date: 2024-01-20
---

## Regla

Los pedidos con importe total superior a **15.000€** requieren aprobación
del Director Comercial antes de poder ser facturados.

## Condiciones

- `pedido.importe_total > 15000`
- `pedido.estado == 'pendiente_aprobacion'`

## Excepciones

- Clientes con categoría "Premium" tienen umbral de 25.000€

## Trazabilidad

- Código: `PKG_PEDIDOS.aprobar` líneas 45-67
- Tabla: `PEDIDOS.requiere_aprobacion_director`
```

### Estructura final del KB

```
/specs/                          # ← KB Gold (approved)
├── 01-domain/
│   ├── entities/
│   ├── events/
│   └── rules/
├── 02-behavior/
│   ├── commands/
│   └── queries/
└── 03-experience/               # (si aplica para migración UI)

/specs/_draft/                   # ← Aún en proceso
├── hipotesis/
├── inventario/
├── mapeo/
└── 01-domain/                   # Artefactos pendientes de revisión

/specs/_archive/                 # ← Descartados
└── (artefactos obsoletos/incorrectos con nota de por qué)
```

---

## Integración con RAG

### Modelo de metadatos para filtrado

El RAG (LightRAG) no soporta filtrado nativo por metadatos. Se usa un enfoque híbrido:

1. **LightRAG** busca semánticamente (sin filtro)
2. Devuelve referencias a documentos
3. **El asistente** lee los archivos locales
4. Filtra por `status` en frontmatter ANTES de responder
5. Indica al usuario el nivel de confianza de cada fuente

### Respuesta del asistente con contexto de confianza

```
Usuario: "¿Cómo funciona la aprobación de pedidos?"

Asistente: Según BR-PED-001 (status: approved, confidence: high),
los pedidos >15K€ requieren aprobación del Director Comercial.

⚠️ Nota: Hay 1 spec relacionada aún en draft:
- BR-PED-004 (aprobación para clientes nuevos) - pendiente validación
```

---

## Checklist de implementación

### Fase 0: Preparación
- [ ] Recibir documentación del cliente
- [ ] Obtener acceso a repositorio de código
- [ ] Obtener acceso a base de datos (al menos lectura)
- [ ] Ejecutar script SQL de inventario
- [ ] Ejecutar JQAssistant (si aplica)
- [ ] Crear hipótesis desde documentación
- [ ] Crear C4 Level 1 borrador
- [ ] Preparar agenda de sesiones Event Storming

### Fase 1: Descubrimiento
- [ ] Realizar sesiones de Event Storming por módulo
- [ ] Validar hipótesis con usuarios
- [ ] Mapear términos técnicos a vocabulario de negocio
- [ ] Documentar eventos, actores, reglas conocidas
- [ ] Actualizar C4 Level 2

### Fase 2: Validación
- [ ] Crear matriz de trazabilidad eventos ↔ código
- [ ] Identificar código huérfano
- [ ] Generar entidades KDD borrador
- [ ] Revisar huecos con IT del cliente

### Fase 3: Extracción
- [ ] Pasada 1: Inventario técnico completo
- [ ] Pasada 2: Mapeo a ontología con Claude Code
- [ ] Pasada 3: Extracción de reglas detalladas
- [ ] Indexar en RAG

### Fase 4: Curación
- [ ] Review técnico de artefactos draft
- [ ] Sesiones de validación con usuarios
- [ ] Promover artefactos a approved
- [ ] Archivar artefactos descartados con justificación

---

## Referencias

- [KDD: Qué es](./v2/00-que-es-kdd.md)
- [Feature Discovery](./feature-discovery.md)
- [Guía para PMs](./v2/01-guia-pm.md)
- [Referencia de Artefactos](./v2/04-referencia-artefactos.md)
