---
kind: ui-component
status: draft
links:
  entities: []
  use-cases: []
  commands: []
---

# {{ComponentName}}

## Propósito

<!-- 1-3 líneas: qué problema resuelve este componente para el usuario -->

## Datos

<!-- Qué información muestra. Lista simple, sin tipos TS -->

- campo1 — descripción breve
- campo2 — descripción breve
- campoOpcional? — cuándo aparece

## Estructura

<!-- UN wireframe que muestre la anatomía. Los estados van después -->

```
┌─────────────────────────────────────┐
│ [Estado]                        [⭐] │
│ ─────────────────────────────────── │
│ Título del elemento                  │
│                                      │
│ 📊 métrica1  │  📊 métrica2          │
│                                      │
│ [Acción Principal]  [Editar]  [⋮]   │
└─────────────────────────────────────┘
```

## Acciones

<!-- Qué puede hacer el usuario. Formato: Acción → Consecuencia -->

| Acción | Resultado | Navegación |
|--------|-----------|------------|
| Click en card | Abre detalle | → [[VIEW-Detalle]] |
| Click en acción principal | Inicia proceso X | → [[VIEW-Proceso]] |
| Click en menú (⋮) | Muestra opciones: Editar, Duplicar, Eliminar | — |
| Eliminar | Requiere confirmación, ejecuta [[CMD-Delete]] | — |

## Estados Funcionales

<!-- Solo estados que cambian QUÉ se muestra, no cómo se ve -->

### Por estado de la entidad

<!-- Si el componente cambia según el estado del dato que muestra -->

| Estado | Acción principal | Acciones disponibles |
|--------|------------------|----------------------|
| borrador | "Configurar" | editar, eliminar |
| activo | "Continuar" | solo menú |
| terminado | "Ver resultado" | duplicar |

### Cargando

```
┌─────────────────────────────────────┐
│ ░░░░░░░░                            │
│ ░░░░░░░░░░░░░░░░░░░░                │
│ ░░░░░  │  ░░░░░                     │
└─────────────────────────────────────┘
```

### Error / Vacío

<!-- Solo si aplica y cambia significativamente el layout -->

## Variantes

<!-- Solo si hay variantes funcionales, no de estilo -->

- **Compacta** (móvil): Oculta acciones secundarias, solo menú
- **Expandida**: Muestra métricas adicionales

## Conexiones

- **Entidades**: [[Entidad1]], [[Entidad2]]
- **Casos de uso**: [[UC-001]], [[UC-002]]
- **Comandos**: [[CMD-Create]], [[CMD-Delete]]
