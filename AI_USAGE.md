# AI_USAGE.md — User Management SPA

## Tools Used

| Tool | Model | Used for |
|------|-------|----------|
| Claude Code (CLI) | Claude Sonnet 4.6 | Architecture design, scaffolding, component generation, unit tests, E2E setup, documentation |

---

## Estimated AI Contribution

> Porcentajes estimados al finalizar el proyecto. Se actualizan al cerrar cada fase.

| Area | AI % | Human % | Notes |
|------|------|---------|-------|
| Architecture | 60% | 40% | AI propuso opciones; humano tomó las decisiones finales (state, UI lib, bonus scope) |
| Components | — | — | *Pendiente* |
| Services | — | — | *Pendiente* |
| Tests | — | — | *Pendiente* |
| CI/CD | — | — | *Pendiente* |
| Documentation | 50% | 50% | AI generó estructura; humano revisó y completó con contexto real |

---

## Session Log

### Session 01 — Arquitectura del proyecto
**Fecha:** 2026-06-03
**Fase:** Prompt 1 — Definición de arquitectura

#### Prompt enviado
```
Eres un arquitecto frontend senior. Voy a construir una SPA de User Management
como prueba técnica. Ayúdame a tomar y justificar decisiones de arquitectura
ANTES de escribir código...
[ver /prompts/01-arquitectura.md para el prompt completo]
```

#### Qué generó la IA
- Análisis comparativo de 5 opciones de state management con trade-offs
- Análisis comparativo de 3 librerías UI con criterios de accesibilidad y dark mode
- Estructura completa de carpetas feature-based
- Interfaz `User` tipada con todos los campos del reto
- Función `mapDummyJsonToUser()` con mapeo de campos, fechas simuladas y `active` derivado
- Árbol de rutas con lazy loading
- Interfaz de `UserApiService` y `HttpInterceptor`
- Patrón de optimistic update con rollback en `catchError`
- Archivo `ARCHITECTURE.md` completo

#### Qué acepté
- Recomendación de **Service + Angular Signals** para state management
- Recomendación de **Angular Material v18** como UI library
- Estructura de carpetas (core / features / shared)
- Interfaz `User` y función `mapDummyJsonToUser()`
- Patrón de optimistic update

#### Qué modifiqué
- **UI Library**: cambié Angular Material → Tailwind CSS v4 + Angular CDK (decisión propia, ver "Decisions Made Without AI")
- Scope: decidí incluir los 4 bonus (dark mode, i18n, optimistic updates, Playwright) — la IA no propuso incluirlos todos por defecto
- Nombre del directorio: cambié de `fe-challenge` a `user-management-app`

#### Qué descarté
- Nada descartado en esta sesión

### Session 02 — Backlog de desarrollo
**Fecha:** 2026-06-03
**Fase:** Prompt 2 — Planificación incremental

#### Qué generó la IA
- 25 tareas con Objetivo, Archivos involucrados, Dependencias y Criterios de aceptación
- Tabla resumen con IDs, fases y commit messages en formato Conventional Commits
- `BACKLOG.md` completo en el directorio del proyecto

#### Qué acepté
- Estructura de fases (Setup → Core → Store → Shared → i18n → Features → Quality → Tests → E2E → Docs)
- Criterios de aceptación orientados a comportamiento observable (no "compila")
- Commit messages en formato `feat(scope):`, `test:`, `chore:`

#### Qué modifiqué
- Añadí la restricción de **code review humano antes de cada commit** (la IA no lo incluyó por defecto)

#### Qué descarté
- Nada descartado en esta sesión

---

## Where AI Helped Most

> Se completa con ejemplos concretos al terminar el proyecto.

1. *Pendiente — completar al cerrar Fase 1 (Core Infrastructure)*
2. *Pendiente — completar al cerrar Fase 5 (Feature: User List)*
3. *Pendiente — completar al cerrar Fase 9 (Tests)*

---

## Where AI Got It Wrong

### Caso 1 — No pudo acceder al manual de marca LATAM
**Problema:** Se le pidió extraer la paleta y tipografía del manual oficial
`https://es.scribd.com/document/844420637/LATAM-Stand-Manual-v1-2`.
La IA no pudo acceder al contenido real del PDF (Scribd requiere autenticación)
y solo obtuvo el HTML de la interfaz de la plataforma.

**Cómo se identificó:** La IA reportó explícitamente la limitación en lugar de inventar datos.

**Cómo se resolvió:** Se consultaron fuentes públicas verificables
([schemecolor.com](https://www.schemecolor.com/latam-airlines-brasil-logo-colors.php),
[airhex.com](https://airhex.com/airline-logos/latam-airlines-group/))
para obtener los códigos hex oficiales del logo (`#2C048C`, `#EB1453`)
y se completó la escala de colores y tokens de diseño manualmente
siguiendo principios de design systems. El humano revisó y aprobó los tokens antes de integrarlos.

### Caso 2 — Tailwind CSS v4 no genera utilities con Angular CLI
**Problema:** La IA recomendó y configuró Tailwind CSS v4 (`@tailwindcss/postcss`).
El build no fallaba, pero ninguna utility class (`bg-brand-indigo`, `.flex`, etc.) era generada.
El CSS de salida contenía solo el `@layer base` (reset) pero cero utilities.

**Cómo se identificó:** El usuario abrió el browser y vio la app sin estilos.
Diagnóstico posterior: `curl http://localhost:4200/styles.css | grep ".flex"` devolvió 0 resultados.
Prueba directa con Node.js confirmó que el PostCSS plugin funciona correctamente desde la raíz del proyecto,
pero el contexto de ejecución de Angular's esbuild no lo permite.

**Cómo se resolvió:** Migración a Tailwind CSS v3.4 (versión con integración probada con Angular CLI).
- `tailwind.config.js` con `content: ['./src/**/*.{html,ts}']`
- `postcss.config.js` con `{ tailwindcss: {}, autoprefixer: {} }`
- `styles.scss` con `@tailwind base/components/utilities`
- Los design tokens LATAM se trasladaron a `theme.extend.colors`
- Tailwind v4 queda documentado como incompatible con Angular CLI 18 en este contexto.

### Caso 3 — @angular/cdk@22 incompatible con Angular 18
**Problema:** La IA instaló `@angular/cdk@22` (última versión) sin verificar la compatibilidad con Angular 18.
Al usar `@angular/cdk/dialog` en `UserListComponent`, el build falló con:
`ChangeDetectionStrategy.Eager: Unsupported change detection strategy`

**Cómo se identificó:** El servidor de desarrollo crasheó al cargar el componente en el browser.

**Cómo se resolvió:** Downgrade a `@angular/cdk@18.2.14` que coincide con la versión de Angular del proyecto.
Regla aplicada: la versión de `@angular/cdk` siempre debe coincidir con la de `@angular/core`.

---

## Decisions Made Without AI

1. **Incluir los 4 bonus del reto**
   La IA no propuso incluirlos por defecto dado el dominio pequeño. Decidí incluirlos todos
   (dark mode, i18n, optimistic updates, Playwright) porque el reto los valoriza explícitamente
   y demuestran manejo de Angular moderno más allá del CRUD básico.

2. **Tailwind CSS en lugar de Angular Material**
   La IA recomendó Angular Material por su accesibilidad integrada. Decidí usar Tailwind CSS v4
   porque es el estándar actual del desarrollo frontend, da control total sobre el markup,
   produce bundles más livianos por tree-shaking real, y el dark mode con `dark:` classes
   es más limpio que el theming de Material. La accesibilidad WCAG se implementa explícitamente
   con `@angular/cdk` y atributos `aria-*` manuales.

3. **No usar el logotipo de LATAM — solo el brand**
   La IA integró la identidad visual de LATAM incluyendo referencias al logo.
   El humano aclaró que la aplicación es una herramienta propia que toma la paleta,
   tipografía y principios visuales del brand, pero no usa ni referencia el logotipo
   ni los assets de marca registrada de LATAM Airlines.

4. **Nombre del directorio `user-management-app`**
   La IA sugirió `fe-challenge`. Elegí un nombre descriptivo y neutral que comunica
   el dominio de la aplicación, no el proceso de evaluación.

---

## Prompting Strategy

*Se completa al terminar el proyecto con una reflexión sobre cómo se estructuraron los prompts,
qué contexto se proporcionó en cada sesión, cómo se iteró sobre el output, y cuándo se eligió
escribir código manualmente en lugar de delegarlo a la IA.*

Estructura general utilizada:
- **Prompt 1** (Arquitectura): contexto del stack fijo + lista de decisiones a tomar con criterios
- **Prompt 2** (Planificación): arquitectura ya definida + instrucción de backlog incremental con 4 campos por tarea
- **Prompt 3** (Desarrollo): contexto del proyecto + estado actual de tareas completadas + tarea específica con criterios de aceptación observables

---

*Documento vivo — se actualiza al cierre de cada fase del desarrollo.*
