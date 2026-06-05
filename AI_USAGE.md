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
| Components | 80% | 20% | IA generó templates completos; humano revisó, ajustó clases responsive y aprobó |
| Services | 75% | 25% | IA generó lógica de servicios; humano identificó bugs (CDK overlay, optimistic updates) |
| Tests | 85% | 15% | IA generó tests y fixtures; humano revisó cobertura y aprobó estrategia de interceptor en TestBed |
| CI/CD | — | — | No implementado (fuera de scope del challenge) |
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

### Session 03 — T19: Responsive design
**Fecha:** 2026-06-04
**Fase:** Fase 8 — Quality

#### Prompt enviado
```
trabajemos en el T19
[contexto: BACKLOG.md T19 cargado en el IDE — Responsive design para mobile/tablet/desktop]
```

#### Qué generó la IA
- `AppShellComponent`: sidebar colapsado (solo iconos, `md:w-16`) en tablet y expandido (`xl:w-60`) en desktop con `justify-center xl:justify-start` en brand y nav items; texto del nav envuelto en `<span class="hidden xl:inline">`; margen del contenido `md:ml-16 xl:ml-60`
- `UserListComponent`: vista de cards (`md:hidden`) para mobile con avatar, nombre, email, badges y acciones; tabla original envuelta en `hidden md:block` para tablet+; paginación duplicada para la vista mobile
- `UserFormComponent`: header del formulario en modo edit cambiado a `flex-col sm:flex-row` para evitar overflow de botones en mobile; padding del body `p-4 sm:p-6`
- Fix del `ConfirmDialogService`: `positionStrategy` con `global().centerHorizontally().centerVertically()` para centrar el modal
- Fix de `styles.scss`: CSS base del CDK overlay (`cdk-overlay-container`, `cdk-global-overlay-wrapper`, `cdk-overlay-pane`, `cdk-overlay-backdrop`) que faltaba y causaba que el modal apareciera fuera del viewport

#### Qué acepté
- Breakpoints `md` (768px) para el cambio tabla→cards y `xl` (1280px) para el sidebar completo
- Cards con footer de acciones destructivas separado visualmente del contenido principal
- Columna de email oculta hasta `lg` en la tabla para dar espacio a role y status en tablet

#### Qué modifiqué
- Identifiqué que el modal seguía apareciendo abajo tras el primer fix del servicio; la IA diagnosticó que faltaba el CSS base del CDK overlay (`overlay-prebuilt.css`) y lo añadió directamente en `styles.scss`

#### Qué descarté
- Nada descartado en esta sesión

### Session 04 — T20: Accesibilidad WCAG 2.1 AA
**Fecha:** 2026-06-04
**Fase:** Fase 8 — Quality

#### Prompt enviado
```
pasemos a la siguiente tarea, t20
[contexto: BACKLOG.md T20 cargado en el IDE — Accesibilidad WCAG 2.1 AA]
```

#### Qué generó la IA
- Auditoría sistemática de todos los componentes contra WCAG 2.1 AA antes de tocar código
- `index.html`: `lang="es"` y título descriptivo "Gestión de Usuarios"
- `UserListComponent`: `scope="col"` en todos los `<th>`; `aria-busy` bound al estado de carga
- `UserFormComponent`: `aria-required="true"` en los 5 campos obligatorios (inputs + select)
- `UserDetailComponent`: contraste corregido en labels `<dt>` — `text-neutral-400` → `text-neutral-500` (2.5:1 → 4.6:1)
- `ConfirmDialogComponent`: `tabindex="-1"` en root div; `cdkFocusInitial` en botón Cancelar; import `A11yModule`
- `AppShellComponent`: `aria-current` reactivo via template ref `#usersLink="routerLinkActive"`, eliminado `isUsersActive()` basado en `location.pathname`

#### Qué acepté
- Enfoque de auditoría previa a los cambios para identificar todos los gaps antes de implementar
- Uso de `routerLinkActive` template ref en lugar de `location.pathname` para `aria-current`

#### Qué modifiqué
- El usuario pidió revisar y respetar el formato de los commits anteriores — los dos commits de T19 y T20 fueron enmendados con `git reset --hard` + `cherry-pick` y force push para eliminar los prefijos de componente en los bullets

#### Qué descarté
- Nada descartado en esta sesión

### Session 08 — T24: Playwright E2E — flujo completo
**Fecha:** 2026-06-04
**Fase:** Fase 10 — E2E

#### Prompt enviado
```
sigamos con t24
```

#### Qué generó la IA
- `e2e/users.spec.ts` con 4 tests en `test.describe.serial`
- `test.use({ locale: 'es' })` para forzar español (sin esto `navigator.language` = 'en' y la app mostraba English)
- Test 1: navega a `/users/new`, llena el formulario, submit, verifica toast "Usuario creado exitosamente" y redirect a `/users`
- Test 2: navega a `/users`, espera tabla poblada, busca 'emily', verifica fila de tabla con 'emilys' (selector `tbody tr` para evitar los cards móviles ocultos)
- Test 3: navega a `/users/1/edit`, cambia email, guarda, verifica toast "Usuario actualizado exitosamente"
- Test 4: navega a `/users/2/edit`, click "Desactivar", confirma en `role="alertdialog"`, verifica toast y badge "Inactivo"
- `playwright.config.ts` ya existía con `webServer`, `screenshot: 'on'` y `video: 'retain-on-failure'`
- 8 screenshots en `e2e/screenshots/` para todos los pasos clave

#### Bugs encontrados y corregidos
- **Locale**: botón "Crear usuario" no encontrado porque Playwright arranca en inglés → `test.use({ locale: 'es' })` fuerza español
- **Strict mode violation**: `getByText('emilys')` resolvía a 2 elementos (card móvil oculto + fila de tabla) → selector cambiado a `tbody tr` que filtra solo el DOM visible en desktop
- **Badge "Inactivo" revertía**: `mapDummyJsonToUser` tenía `active: true` hardcodeado → ignoraba el campo `active: false` del PUT response de dummyjson → la IA identificó que era un bug real en el modelo, no solo un problema de test. Fix: `active?: boolean` en `DummyJsonUser` + `active: raw.active ?? true` en el mapper
- **Re-fetch en detail page**: después de deactivate, el form navega a `/users/2`, el detail component hace GET que devuelve `active: true` (dummyjson no persiste). Fix: `page.route()` intercepta la GET post-deactivation y agrega `active: false` al response

#### Qué acepté
- Interception de red con `page.route()` para simular persistencia de dummyjson — estrategia estándar para E2E contra APIs externas que no garantizan estado

#### Qué modifiqué
- Nada adicional — 4/4 tests en verde tras las iteraciones de diagnóstico

#### Qué descarté
- Nada descartado en esta sesión

### Session 07 — T23: Unit tests validadores del formulario
**Fecha:** 2026-06-04
**Fase:** Fase 9 — Tests

#### Prompt enviado
```
vamos con t23
```

#### Qué generó la IA
- `user.validators.spec.ts` con 4 tests puramente unitarios (sin `TestBed`)
- Test 1: `noWhitespace` retorna `null` con `'juanperez'` y `{ noWhitespace: true }` con `'juan perez'`
- Test 2: `noWhitespace` retorna `null` con string vacío
- Test 3: `FormGroup` construido con `new FormBuilder()` es inválido con `username: ''`
- Test 4: `FormGroup` es válido con todos los campos correctamente llenados
- Diagnóstico del error TS5103: conflicto entre TypeScript 6.x del IDE (global) y TypeScript 5.5.4 del proyecto (`node_modules`) — `"ignoreDeprecations": "6.0"` es válido en TS6 pero inválido para el compilador del proyecto

#### Qué acepté
- Tests sin `TestBed` — instancias directas de `FormControl` y `FormBuilder`
- Fix: eliminar `ignoreDeprecations: "6.0"` del tsconfig (la advertencia del IDE es un falso positivo de la versión global de TS)

#### Qué modifiqué
- Nada — 4/4 tests en verde en primera ejecución tras fix del tsconfig

#### Qué descarté
- Nada descartado en esta sesión

### Session 09 — Rediseño visual con Claude Design
**Fecha:** 2026-06-05
**Fase:** Fase 11 — Pulido visual

#### Prompt enviado
```
Prompt de diseño completo con 7 secciones:
1. CSS custom properties para superficies dark mode en styles.scss
2. Utilidad avatar-color.util.ts + AvatarComponent con color determinista por hue y dot de estado
3. Lista de usuarios: header de tabla, hover de fila, botones de acción solo-icono, chips de filtro, anillo de superficie
4. BadgeComponent con dot + fondo oscuro dark mode y safelist en tailwind.config.js
5. Detalle de usuario: banner gradiente, breadcrumb, fechas dd/MM/yyyy HH:mm, link de vuelta
6. Sidebar: gradiente vertical, indicador activo crimson, chip "Operativo" en footer
7. Toasts: tarjeta blanca con borde izquierdo de color
```

#### Qué generó la IA
- `src/app/shared/utils/avatar-color.util.ts`: función hash determinista que retorna color `oklch()` a partir del nombre del usuario
- `src/app/shared/components/avatar/avatar.component.ts`: componente standalone con imagen o iniciales, fondo dinámico por `avatarColor()`, dot de estado verde/neutral
- `src/app/shared/components/badge/badge.component.ts`: componente con `variant` input (`admin|user|guest|active|inactive`), dot interno, dark mode con fondo `*/20` y borde `*/40`
- `src/styles.scss`: CSS custom properties `--surface`, `--surface-2`, `--border-color`, `--text-muted` para light y dark mode
- `tailwind.config.js`: safelist para clases dark mode dinámicas del BadgeComponent
- `app-shell.component.ts`: gradiente `from-brand-indigo to-indigo-900` en sidebar, chip "Operativo" con punto verde en footer
- `toast-container.component.ts`: rediseño a tarjeta blanca con franja izquierda de color, icono coloreado, dismiss discreto
- `user-list.component.ts`: reemplazados avatares e inline-badges por `<app-avatar>` y `<app-badge>`
- `user-detail.component.ts`: banner gradiente `from-brand-indigo to-crimson-600` con avatar superpuesto (`-mt-10`), badges migrados a `<app-badge>`

#### Qué acepté
- `oklch()` para color de avatar: produce colores visualmente distintos y saturados sin necesidad de un mapa estático
- `<ng-content>` en BadgeComponent: permite pasar texto con pipe de traducción desde el template padre
- `-mt-10` para solapar el avatar con el banner: técnica CSS estándar sin dependencias adicionales
- Safelist en tailwind.config.js: necesario para que las clases dark mode generadas por computed strings no sean purgadas

#### Qué modifiqué
- Eliminados métodos `roleBadge()`, `statusBadge()` e `initials()` de `UserListComponent` y `UserDetailComponent` (reemplazados por los nuevos componentes)
- Corregido `border-crimson-300` (no definido en config) por `border-crimson-400` en user-detail

#### Qué descarté
- `NgClass` en el dot del AvatarComponent — reemplazado por computed string para evitar importar NgClass

### Session 06 — T22: Unit tests UserStoreService
**Fecha:** 2026-06-04
**Fase:** Fase 9 — Tests

#### Prompt enviado
```
[continuación automática tras recompresión de contexto — T22 ya confirmado en sesión anterior]
```

#### Qué generó la IA
- `user-store.service.spec.ts` con 4 tests usando `jasmine.createSpyObj` para `UserApiService`, `ToastService` y `LoggerService`
- Test 1: `loadUsers()` popula el signal `users` y setea `isLoading` a `false` tras éxito
- Test 2: `isLoading` es `true` mientras el `Subject` no ha emitido y `false` tras `next()`/`complete()`
- Test 3 (optimista): `deleteUser(1)` elimina el usuario del signal ANTES de que el `Subject` responda — verifica con `expect(store.users().length).toBe(1)` antes de flushar
- Test 4 (rollback): `deleteUser(1)` falla con `subject$.error(...)` → los 2 usuarios vuelven al signal y `hasError()` retorna `true`
- Patrón de siembra de estado: `(store as any)['_users'].set([...])` para inyectar usuarios sin pasar por `loadUsers()`

#### Qué acepté
- Mock de los 3 servicios inyectados para aislamiento total (no side-effects de Toast ni Logger)
- Acceso al signal privado `_users` via bracket notation para tests 3 y 4 — evita acoplar el setup a `loadUsers()`

#### Qué modifiqué
- Nada — 4/4 tests en verde en primera ejecución

#### Qué descarté
- Nada descartado en esta sesión

### Session 05 — T21: Unit tests UserApiService
**Fecha:** 2026-06-04
**Fase:** Fase 9 — Tests

#### Prompt enviado
```
pasemos a la siguiente tarea
[contexto implícito: siguiente tarea en el backlog es T21]
```

#### Qué generó la IA
- `user-api.service.spec.ts` con 4 tests usando `HttpTestingController`
- Test 1: `getUsers()` mapea `firstName`/`lastName` a `first_name`/`last_name` y deriva `active: true`
- Test 2: `getUserById()` retorna `User` con `active: true` derivado del payload raw
- Test 3: `getUserById()` lanza `AppError` con `status: 404` y `message: 'error.notFound'`
- Test 4: `searchUsers()` llama a `/users/search` con el param `q` correcto
- Decisión de incluir `apiInterceptor` en el `TestBed` para que el mapeo de `HttpErrorResponse → AppError` sea ejercido en el test 3
- Helper `mockRaw()` y `mockListResponse()` para construir fixtures tipados sin repetición

#### Qué acepté
- Incluir el interceptor en los providers del test (no mockear el error a nivel de servicio)
- Uso de función predicate en `expectOne()` para validar URL + query params por separado

#### Qué modifiqué
- Nada — 4/4 tests en verde en primera ejecución

#### Qué descarté
- Nada descartado en esta sesión

---

## Where AI Helped Most

1. **Templates complejos con Tailwind**: la IA generó todos los templates de `UserListComponent`, `UserDetailComponent` y `UserFormComponent` con clases Tailwind, dark mode, badges por rol/estado, tooltips, accesibilidad y lógica de renderizado condicional — trabajo que habría tomado días manual. El humano revisó, ajustó breakpoints y aprobó antes de cada commit.

2. **Patrón de optimistic update con rollback**: el helper privado `_optimistic<T>(apiCall$, {onSuccess, onError})` en `UserStoreService` captura el patrón snapshot → mutate → API → confirm/rollback de forma reutilizable. La IA propuso la abstracción y el humano la validó aplicándola a `updateUser`, `deleteUser` y `deactivateUser`.

3. **Suite de tests con HttpTestingController**: los 4 tests de `UserApiService` incluyendo la decisión de incluir el `apiInterceptor` real en el TestBed para ejercitar el mapeo `HttpErrorResponse → AppError` sin mockear el error path. La IA generó los 4 tests en verde en primera ejecución.

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

### Caso 4 — CDK overlay CSS base faltante: modal fuera del viewport
**Problema:** El `ConfirmDialog` (CDK Dialog) aparecía en la parte inferior de la página
en lugar de centrarse en el viewport. Añadir `positionStrategy` al servicio no lo resolvió.

**Cómo se identificó:** El usuario reportó visualmente que el modal seguía apareciendo abajo
tras el primer intento de fix (agregar `positionStrategy` al `DialogConfig`).

**Cómo se resolvió:** La IA diagnosticó que faltaba el CSS base de `@angular/cdk/overlay-prebuilt.css`,
que no estaba siendo importado en ningún lugar. Sin él, `.cdk-overlay-container` no tiene
`position: fixed` y no cubre el viewport — el overlay queda anclado al flujo del documento.
Se añadieron las reglas esenciales del prebuilt directamente en `styles.scss`:
`.cdk-overlay-container` (position fixed, z-index 1000), `.cdk-global-overlay-wrapper`
(display flex, centering), `.cdk-overlay-pane` y `.cdk-overlay-backdrop`.

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

**Estructura general**: cada sesión de trabajo arrancaba con el contexto del proyecto ya cargado (archivos abiertos en el IDE, BACKLOG.md como referencia) y un prompt que especificaba exactamente qué tarea implementar con sus criterios de aceptación como se describe en los archivos de `/prompts/`.

**Contexto proporcionado**: stack fijo (Angular 18, Tailwind, Signals), decisiones ya tomadas, archivos existentes relevantes, y criterios de aceptación observables (no "que compile"). Esto evitó que la IA propusiera patrones incompatibles con el stack.

**Iteración**: el ciclo fue: generar → revisar → aprobar o corregir → corregir en el código si hacía falta → commit. En ningún caso se hizo commit sin revisión humana. Las correcciones más frecuentes fueron en selectores de Playwright (T24), en el manejo del campo `active` en el mapper (bug real), y en el formato de los commits (T19-T20).

**Cuándo escribí código manualmente**: las decisiones de arquitectura (elegir Tailwind sobre Material, incluir todos los bonus), los design tokens de la paleta LATAM, y las correcciones de bugs que requerían entender la interacción entre el store y el ciclo de vida de los componentes (el `load()` guard en UserDetailComponent).

---

*Documento vivo — se actualiza al cierre de cada fase del desarrollo.*
