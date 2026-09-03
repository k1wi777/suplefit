# AGENTS.md

> Este archivo es el **punto de entrada universal** para cualquier agente de IA que trabaje en este repositorio.
>
> Su objetivo es proporcionar únicamente el contexto esencial para orientarse dentro del proyecto y saber dónde encontrar información adicional. **No debe contener toda la documentación del proyecto.**
>Carga únicamente el contexto necesario para la tarea actual.
> Las responsabilidades específicas de cada rol se encuentran en `agents/`.

**No ignores estas reglas.**

---

# 1. Antes de comenzar

Antes de realizar cualquier modificación en el proyecto:

1. Ejecuta `bash init.sh`.
2. Si falla, DETENTE e informa el problema.
3. Carga únicamente la documentación necesaria para la tarea actual siguiendo el orden de la Sección 8.

No continúes hasta completar estos pasos.

---

# 2. Propósito del proyecto

> **Personaliza esta sección** al adaptar el harness a tu repositorio. Describe el producto concreto, no el arnés.

*Resume aquí el objetivo del proyecto. Esta información guía las decisiones del agente y evita cambios que contradigan la visión del producto.*

## Qué construimos

<Una o dos frases que describan claramente el producto y el problema que resuelve.>

## Para quién

- <Usuario principal.>
- <Usuarios secundarios, si existen.>
- <Otros interesados, si aplica.>

## Principios

*Todas las decisiones deben respetar estos principios.*

- **<Principio>** — <Qué implica en la práctica.>
- **<Principio>** — <Qué implica en la práctica.>
- **<Principio>** — <Qué implica en la práctica.>

## Qué NO es

*Acota explícitamente el alcance del proyecto para evitar feature creep.*

- <Fuera del alcance.>
- <Otro límite importante.>

---

# 3. Stack técnico

> **Personaliza esta sección** con el stack y los comandos reales de tu proyecto.

*Documenta únicamente la información técnica esencial para comprender el proyecto.*

## Tecnologías principales

- **Lenguaje:** <...>
- **Framework:** <...>
- **Base de datos:** <...>
- **Testing:** <...>
- **Despliegue:** <...>

## Comandos principales

*Comandos que cualquier agente utilizará con frecuencia.*

- `<comando>` — Desarrollo.
- `<comando>` — Tests.
- `<comando>` — Linter.
- `<comando>` — Build.

---

# 4. Estructura del repositorio

*Utiliza este mapa para orientarte dentro del proyecto.*

| Ruta | Propósito |
|------|-----------|
| `src/` | Código fuente del proyecto. |
| `tests/` | Suite de pruebas. |
| `specs/` | Work Items y planificación. |
| `progress/` | Estado actual e historial del trabajo. |
| `docs/harness/` | Documentación del arnés (workflow, specs, progreso). |
| `docs/project/` | Documentación del proyecto (arquitectura, convenciones, verificación). |
| `agents/` | Roles y comportamiento de los subagentes. |

---

# 5. Workflow

Todo Work Item debe seguir el workflow definido por el proyecto.

Antes de comenzar cualquier trabajo consulta:

`docs/harness/workflow.md`

**No omitas ninguna etapa del workflow.**

---

# 6. Rol del agente principal

El agente que recibe directamente las solicitudes del usuario actúa siempre como **Leader**.

Antes de comenzar cualquier tarea DEBE consultar:

`agents/leader.md`

El Leader es el único responsable de:

- comprender la solicitud del usuario;
- seleccionar el workflow adecuado;
- coordinar a los demás subagentes.

Ningún otro agente debe asumir estas responsabilidades.

---

# 7. Documentación

Consulta únicamente la documentación necesaria para la tarea actual.

## Documentación del harness

Define cómo funciona el arnés. No requiere personalización por proyecto.

| Si necesitas... | Consulta... |
|-----------------|-------------|
| Workflow | `docs/harness/workflow.md` |
| Spec Driven Development | `docs/harness/specs.md` |
| Sistema de progreso | `docs/harness/progress.md` |
| Estructura de `meta.json` | `docs/harness/meta.md` |
| El comportamiento de un agente | `agents/<role>.md` |

## Documentación del proyecto

Describe las reglas de **este repositorio**. Debe personalizarse al implementar el harness.

| Si necesitas... | Consulta... |
|-----------------|-------------|
| Arquitectura | `docs/project/architecture.md` |
| Convenciones | `docs/project/conventions.md` |
| Verificación | `docs/project/verification.md` |

## Work Items

| Si necesitas... | Consulta... |
|-----------------|-------------|
| Un Work Item concreto | `specs/<work-item>/` |
|El comportamiento de un agente | `agents/<role>.md` |
No cargues documentación que no aporte contexto a la tarea actual.

---

# 8. Carga de contexto

Prioriza siempre la carga de información en el siguiente orden:

1. `AGENTS.md`
2. `agents/<role>.md`
3. `docs/...`
4. `specs/<work-item>/`

Carga únicamente el contexto necesario para completar la tarea actual.

---

# 9. Principios generales

Estas reglas aplican a cualquier agente del repositorio.

- La documentación es la fuente de verdad.
- Trabaja sobre un único Work Item por sesión.
- No omitas etapas del workflow.
- Consulta la documentación antes de asumir comportamientos no especificados.
- Si encuentras documentación contradictoria, DETENTE y repórtala.
- En caso de conflicto entre documentos, prevalece el orden inverso de la Sección 8:
  `specs/<work-item>/` > `docs/...` > `agents/<role>.md` > `AGENTS.md`.