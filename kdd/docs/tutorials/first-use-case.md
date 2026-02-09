---
title: "Tu primer Use Case"
audience: [pm, designer]
type: tutorial
reading_time: "8 min"
status: draft
---

# Tu primer Use Case

> Para: PM + Diseñador · Tiempo: 8 min · Tipo: Tutorial

Este tutorial te guía para crear tu primer **Use Case (UC)** a partir de un Objective existente del proyecto. Al terminar, habrás documentado un flujo completo con pasos, excepciones y conexiones con Commands.

## Lo que vas a construir

Vas a documentar el **Use Case (UC)** para configurar Miembros en un Proyecto. Usarás el Objective real `OBJ-001-Crear-Proyecto.md` como punto de partida. El UC que crees incluirá:

- Flujo principal con pasos numerados
- Excepciones documentadas
- Commands invocados
- Postcondiciones verificables

## Antes de empezar

Revisa que existe el Objective de referencia:

```bash
cat /specs/00-requirements/objectives/OBJ-001-Crear-Proyecto.md
```

Debes ver el Objective que vincula al Use Case que crearás. Confirma que menciona `[[UC-002-Configurar-Miembros]]` en la sección "Casos de uso relacionados".

## Paso 1: Crea el archivo

Crea el archivo del Use Case en la ubicación correcta.

```bash
touch specs/02-behavior/use-cases/UC-002-Configurar-Miembros.md
```

Los Use Cases viven en `specs/02-behavior/use-cases/`. El nombre del archivo sigue el patrón `UC-NNN-NombreCorto.md`.

## Paso 2: Copia el template

Abre el template de Use Case:

```bash
cat kdd/templates/use-case.template.md
```

Copia todo el contenido del template al archivo que acabas de crear. Esto te da la estructura básica con todas las secciones.

## Paso 3: Completa el frontmatter

Edita el frontmatter al inicio del archivo. Reemplaza los valores del template con los datos del Use Case real:

```yaml
---
id: UC-002
kind: use-case
version: 1
status: draft
actor: Usuario
links:
  commands:
    - "[[CMD-005-CreateMiembro]]"
    - "[[CMD-006-UpdateMiembro]]"
    - "[[CMD-007-DeleteMiembro]]"
---
```

El campo `id` usa el patrón `UC-NNN`. El campo `kind` es siempre `use-case`. El campo `status` empieza como `draft`. El campo `links.commands` conecta este UC con los Commands que implementa el flujo.

## Paso 4: Define el título y descripción

Escribe el título y la descripción del Use Case. El título resume en una frase lo que hace el flujo. La descripción explica el valor que aporta.

```markdown
# UC-002: Configurar Miembros

## Descripción

El Usuario configura los Miembros que participarán en las sprints del Proyecto. Los Miembros son "participantes generados por IA" generados por IA que aportan perspectivas diversas al análisis.

Este caso de uso es crítico porque:
- Los Miembros son propias del Proyecto (no reutilizables entre proyectos)
- Se requieren entre 3 y 6 Miembros para que el Proyecto esté preparado
- Sin Miembros configuradas, no se pueden iniciar las sprints
```

La descripción responde "¿Qué hace este flujo?" y "¿Por qué importa?". Usa listas para enlistar razones clave.

## Paso 5: Documenta los actores

Define quién participa en el flujo. Cada actor tiene un rol y una motivación.

```markdown
## Actores

- **Actor Principal**: [[Usuario]] (propietario del proyecto)
- **Actor Secundario**: Sistema de IA (generador de miembros)
```

Enlaza al actor principal con wiki-links si es una entidad de dominio documentada. Indica entre paréntesis el rol específico que tiene en este flujo.

## Paso 6: Escribe las precondiciones

Las precondiciones son el estado del sistema antes de que comience el flujo. Enumera cada condición como una línea separada.

```markdown
## Precondiciones

- El Usuario está autenticado en el Sistema
- Existe un Proyecto en estado `borrador` perteneciente al Usuario
- El Proyecto tiene título definido
```

Cada precondición es verificable. Si alguna falla, el flujo no puede comenzar.

## Paso 7: Documenta el flujo principal

El flujo principal es la secuencia de pasos del camino feliz. Numera cada paso. Alterna entre acciones del usuario y respuestas del sistema.

```markdown
## Flujo Principal (Happy Path)

1. El Usuario accede a la pantalla de configuración del Proyecto
2. El Sistema muestra el formulario de Miembros
3. El Sistema muestra indicador: "0 miembros configurados (mínimo 3)"
4. El Usuario selecciona "Añadir Miembro"
5. El Sistema muestra modal con opciones: "Generar con IA" o "Crear manual"
6. El Usuario selecciona "Generar con IA"
7. El Sistema genera un Miembro relevante
8. El Sistema muestra preview del Miembro generada
9. El Usuario revisa y selecciona "Aceptar"
10. El Sistema persiste el Miembro asociada al Proyecto
11. El Sistema emite evento EVT-Miembro-Creado
12. El Sistema actualiza el indicador: "1 miembro configurado (mínimo 3)"
```

Cada paso produce un resultado visible. El usuario puede verificar que el paso ocurrió. Los pasos que persisten datos o emiten eventos van en **negrita** o con verbo destacado.

## Paso 8: Añade excepciones

Las excepciones documentan qué pasa cuando algo sale mal. Cada excepción tiene un identificador (`Na`, `Nb`) que referencia el paso del flujo principal donde ocurre.

```markdown
## Extensiones / Flujos Alternativos

### 5a. Usuario selecciona "Crear manual"

1. El Sistema muestra formulario con campos obligatorios
2. El Usuario completa los campos
3. El Sistema valida campos obligatorios
4. Si validación falla: muestra errores inline, Usuario corrige
5. El Usuario hace clic en "Guardar"
6. Continúa en paso 10 del flujo principal

### 7a. Error en generación de IA

1. El Sistema detecta error al generar (timeout, API error)
2. El Sistema muestra: "No se pudo generar el miembro. ¿Deseas reintentar?"
3. El Usuario puede reintentar o crear manual
4. Si reintenta: vuelve a paso 7 del flujo principal
```

Cada excepción termina indicando dónde continúa el flujo. Puede volver al flujo principal o terminar el Use Case.

## Paso 9: Define las postcondiciones

Las postcondiciones describen el estado del sistema después del flujo. Separa el caso de éxito del caso de fallo.

```markdown
## Postcondiciones

### En caso de éxito (Garantías de Éxito)

- El Proyecto tiene entre 1 y 6 Miembros asociadas
- Cada Miembro tiene todos los campos obligatorios completos
- El Usuario puede continuar añadiendo Miembros o avanzar

**Detalle de la entidad creada**:

- Existe un Miembro con:
  - `id`: UUID generado
  - `proyecto_id`: ID del Proyecto al que pertenece
  - `nombre`: nombre del miembro
  - `profesion`: rol profesional
  - `historia_vital`: resumen de trayectoria
  - `created_at`: timestamp de creación

### En caso de fallo

- No se creó ningún Miembro nueva
- El estado del Proyecto permanece sin cambios
- Se registró el error en sistema de logs
```

La sección "Detalle de la entidad creada" muestra los atributos clave de la entidad persistida. Usa bloques de código para mostrar estructuras de datos complejas.

## Paso 10: Enlaza Business Rules

Lista las Business Rules que aplican en este flujo. Cada regla tiene un enlace a su documento completo.

```markdown
## Reglas de Negocio Aplicables

| Regla | Descripción |
|-------|-------------|
| [[BR-MIEMBRO-001]] | Un Proyecto requiere entre 3 y 6 Miembros para estar preparado |
| [[BR-MIEMBRO-002]] | Los Miembros solo se pueden editar en estado `borrador` |
| [[BR-MIEMBRO-005]] | Los Miembros pertenecen exclusivamente a un Proyecto |
```

Si una regla aún no está documentada, crea el link de todas formas. Alguien la documentará después. Los links rotos están bien en estado `draft`.

## Verifica tu trabajo

Lee el Use Case completo de principio a fin. Verifica que cumple estos criterios:

**Estructura**
- [ ] Frontmatter completo con `id`, `kind`, `status`, `actor`, `links`
- [ ] Título con formato `UC-NNN: Nombre del Use Case`
- [ ] Descripción que explica qué hace y por qué importa
- [ ] Precondiciones enumeradas

**Flujo principal**
- [ ] Pasos numerados del 1 al N
- [ ] Alternancia entre acciones del Usuario y respuestas del Sistema
- [ ] Cada paso es verificable
- [ ] El último paso cierra el flujo

**Excepciones**
- [ ] Al menos una excepción documentada
- [ ] Cada excepción referencia el paso donde ocurre
- [ ] Cada excepción indica dónde continúa el flujo

**Postcondiciones**
- [ ] Caso de éxito documentado
- [ ] Caso de fallo documentado
- [ ] Entidades creadas/modificadas detalladas

**Conexiones**
- [ ] Business Rules enlazadas en tabla
- [ ] Commands enlazados en frontmatter
- [ ] Entidades de dominio enlazadas con `[[Entidad]]`

## Lo que construiste

Acabas de crear un Use Case completo que documenta el flujo de configuración de Miembros. El UC incluye:

- **12 pasos** en el flujo principal que describen el camino feliz
- **2 excepciones** que documentan qué pasa cuando el Usuario elige otra opción o algo falla
- **Postcondiciones** que definen el estado final del sistema
- **3 Business Rules** enlazadas que regulan el comportamiento
- **3 Commands** enlazados que implementan las operaciones atómicas

Este documento ahora sirve como referencia para:

- El diseñador puede crear la UI spec leyendo el flujo principal y las excepciones
- El dev sabe qué Commands implementar leyendo la sección `links.commands`
- QA puede derivar test cases de cada paso del flujo principal y cada excepción
- El equipo tiene una única fuente de verdad sobre cómo funciona este flujo

## Siguiente paso

Ahora que documentaste el flujo, puedes:

1. **Crear otro Use Case** para practicar. Elige un Objective del proyecto que aún no tenga UC.
2. **Documentar las Business Rules** enlazadas. Abre `BR-MIEMBRO-001.md` y completa su contenido.
3. **Crear los Commands** referenciados. Lee `/kdd/docs/tutorials/first-command.md` para aprender a documentar Commands.

> **Referencia rápida**: Consulta `/kdd/docs/reference/artifacts.md#use-case-uc` para ver todas las secciones opcionales de un Use Case.

> **Guía completa**: Lee `/kdd/docs/guides/pm.md` para ver cómo los Use Cases encajan en el flujo de trabajo completo de una feature.
