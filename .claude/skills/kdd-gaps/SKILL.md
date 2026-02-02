---
name: kdd-gaps
description: |
  Detecta huecos y artefactos faltantes en la documentacion KDD.
  Usa este skill para identificar reglas no documentadas, casos de error
  sin cubrir, eventos faltantes, o criterios de aceptacion incompletos.
category: quality
triggers:
  - que falta
  - gaps en documentacion
  - artefactos faltantes
  - cobertura incompleta
  - casos sin documentar
  - analisis de completitud
---

# KDD Gaps

Detecta huecos y artefactos faltantes en la documentacion KDD.

## Cuando Activarse

Activate cuando:
- El usuario pregunta "que falta?"
- Se completa una feature y se quiere verificar completitud
- Antes de pasar a implementacion
- Como check de calidad en PRs

## Estructura de Capas KDD

**IMPORTANTE**: Antes de analizar gaps, entiende la estructura actual de capas:

```
specs/
├── 00-requirements/     # PRD, objetivos, decisiones de alto nivel
│   ├── PRD.md
│   ├── objectives/
│   └── decisions/       # ADRs de requisitos
│
├── 01-domain/           # Modelo de dominio (NO referencia capas superiores)
│   ├── entities/        # Entidades del dominio
│   ├── rules/           # Reglas de negocio (BR-*, BP-*)
│   └── events/          # Eventos de dominio (EVT-*)
│
├── 02-behavior/         # Que puede hacer el sistema
│   ├── commands/        # Comandos (CMD-*)
│   ├── queries/         # Consultas (QRY-*)
│   ├── processes/       # Procesos orquestados (PROC-*)
│   ├── use-cases/       # Casos de uso (UC-*)
│   └── policies/        # Politicas transversales
│
├── 03-experience/       # Como interactua el usuario
│   ├── views/           # Vistas/pantallas (UI-*)
│   └── flows/           # Flujos multi-paso (FLOW-*)
│
├── 04-verification/     # Criterios de aceptacion
│   └── criteria/        # Requisitos verificables (REQ-*)
│
└── 05-architecture/     # Decisiones tecnicas
    ├── decisions/       # ADRs tecnicos
    └── implementation-charter.md
```

## Reglas de Dependencia entre Capas

**Las capas inferiores NO pueden referenciar capas superiores.**

```
00-requirements  ->  Define el "que" de alto nivel
       | puede referenciar
01-domain        ->  Entidades, reglas, eventos
       | puede referenciar
02-behavior      ->  Comandos, queries, use-cases
       | puede referenciar
03-experience    ->  Vistas, flows
       | puede referenciar
04-verification  ->  Criterios de aceptacion
       | puede referenciar
05-architecture  ->  Decisiones tecnicas
```

### Referencias Validas

| Desde | Puede referenciar |
|-------|-------------------|
| `01-domain/events/` | Solo `01-domain/entities/`, `01-domain/rules/` |
| `01-domain/rules/` | Solo `01-domain/entities/` |
| `02-behavior/commands/` | `01-domain/*`, `02-behavior/processes/` |
| `02-behavior/use-cases/` | `01-domain/*`, `02-behavior/commands,queries/` |
| `03-experience/views/` | `01-domain/entities/`, `02-behavior/use-cases/` |
| `04-verification/criteria/` | Todas las capas superiores |

### NO es un Gap (Falsos Positivos a Evitar)

| Situacion | Por que NO es gap |
|-----------|-------------------|
| Evento sin mencion de comando | Correcto: eventos (01) no referencian comandos (02) |
| Entidad sin mencion de vista | Correcto: entidades (01) no referencian vistas (03) |
| Regla sin mencion de criterio | Correcto: reglas (01) no referencian verificacion (04) |
| Use cases en 02-behavior | Correcto: es su ubicacion actual |

## Diferencia con kdd-trace

| kdd-trace | kdd-gaps |
|-----------|----------|
| Muestra conexiones existentes | Detecta conexiones faltantes |
| "Que tenemos?" | "Que nos falta?" |
| Descriptivo | Prescriptivo |

## Proceso

### Fase 1: Cargar Estructura Actual

**Antes de analizar**, verifica la estructura real:
```bash
ls specs/*/
```

No asumas estructura - las capas pueden haber cambiado.

### Fase 2: Detectar Huecos por Categoria

#### A. Reglas de Negocio Faltantes

Busca patrones que sugieren reglas no documentadas:
- Limites mencionados sin regla (`maximo 6` -> donde esta BR-X?)
- Validaciones en comandos sin regla en `01-domain/rules/`
- Condiciones en casos de uso sin regla explicita

```markdown
### Reglas Potencialmente Faltantes

| Senal Detectada | Ubicacion | Regla Sugerida |
|-----------------|-----------|----------------|
| "maximo 6 items" | CMD-009 | BR-ITEM-00X: Limite de items |
| "solo si tiene creditos" | CMD-009 | BR-CREDITO-00X: Validacion de creditos |
```

#### B. Casos de Error Sin Documentar

Analiza comandos buscando:
- Precondiciones que pueden fallar sin error code
- Estados invalidos no manejados
- Errores de integracion externa (IA, pagos)

```markdown
### Casos de Error Faltantes

| Artefacto | Caso de Error | Impacto |
|-----------|---------------|---------|
| CMD-009 | Que pasa si el Proyecto no tiene items? | Alto |
| CMD-011 | Que pasa si el servicio externo no responde? | Alto |
```

#### C. Eventos Sin Definir

Busca en **maquinas de estado de entidades** transiciones sin evento:
- Estado A -> Estado B en entidad pero sin EVT-* en `01-domain/events/`

**Nota**: Los eventos se definen en 01-domain y son disparados por comandos en 02-behavior. El comando referencia al evento, no al reves.

```markdown
### Eventos Potencialmente Faltantes

| Transicion | Entidad | Evento Sugerido |
|------------|---------|-----------------|
| Tarea: activa -> pausada | Tarea.md | EVT-Tarea-Pausada |
| Proyecto: borrador -> publicado | Proyecto.md | EVT-Proyecto-Publicado |
```

#### D. Criterios de Aceptacion Incompletos

Para cada caso de uso en `02-behavior/use-cases/`, verifica:
- Tiene criterios en `04-verification/criteria/`?
- Los criterios cubren el flujo principal?
- Los criterios cubren flujos alternativos?

```markdown
### Criterios Faltantes

| Caso de Uso | Cobertura | Faltante |
|-------------|-----------|----------|
| UC-001 | 80% | Falta criterio para duplicar proyecto |
| UC-004 | 60% | Faltan criterios de error externo |
```

#### E. Vistas/Flows Sin Spec

Busca en casos de uso referencias a UI no documentadas:
- Pantallas mencionadas sin UI-* en `03-experience/views/`
- Flujos multi-paso sin FLOW-* en `03-experience/flows/`

### Fase 3: Priorizar Huecos

```markdown
## Resumen de Gaps

### Criticos (bloquean implementacion)
1. X CMD-009 no tiene manejo de error para "sin creditos"
2. X UC-004 no define que pasa si servicio externo falla

### Importantes (deberian resolverse)
1. ! 3 eventos de transicion sin documentar
2. ! UC-007 sin criterios de aceptacion

### Menores (nice to have)
1. * Algunas entidades sin ejemplos concretos
2. * Reglas sin casos de violacion documentados

### Estadisticas
- Total gaps detectados: 12
- Criticos: 2
- Importantes: 5
- Menores: 5
```

### Fase 4: Sugerir Acciones

```markdown
## Acciones Recomendadas

1. **Inmediato**: Crear BR-CREDITO-00X para validacion de creditos
2. **Inmediato**: Documentar error handling en CMD-009
3. **Proximo sprint**: Completar criterios de UC-004, UC-007
4. **Backlog**: Anadir ejemplos a entidades
```

## Uso en CI/CD

### GitHub Action para PRs
```yaml
- name: KDD Gaps Check
  run: |
    # Ejecutar analisis de gaps
    # Fallar si hay gaps criticos
```

### Bloquear Merge
- Si hay gaps criticos en artefactos modificados -> bloquear
- Si hay gaps importantes -> warning en PR

## Skills Relacionados

- `kdd-trace` - Para ver conexiones existentes
- `kdd-author` - Para crear artefactos faltantes
- `kdd-review` - Para validar artefactos creados

## Referencias

- Metodologia KDD: `kdd/kdd.md`
- Documentacion de capas: `kdd/docs/layers/`
