# Backlog de Desarrollo — User Management SPA

## Contexto

- **Framework:** Angular 18, standalone components, strict TypeScript
- **State:** Service + Angular Signals (`UserStoreService`)
- **UI:** Tailwind CSS v4 + Angular CDK (sin Angular Material)
- **Design system:** LATAM Brand — paleta indigo `#2C048C` / crimson `#EB1453`, tipografía Inter
- **API:** https://dummyjson.com/users
- **Bonus:** dark mode + localStorage, i18n ES/EN (@ngx-translate), optimistic updates, E2E Playwright
- **Directorio:** `~/Documents/user-management-app`

## Flujo de trabajo por tarea

```
1. Implementar la tarea
2. Code review humano (revisar archivos generados)
3. Aprobar → commit con mensaje sugerido
4. Marcar tarea como completada en este backlog
```

> Ningún commit se realiza sin code review y aprobación humana previa.

---

## FASE 0 — PROJECT SETUP

### T01 — Scaffold Angular + configuración base

**OBJETIVO:**
Crear el proyecto Angular 18 con CLI y aplicar configuración de TypeScript strict,
paths, editorconfig y estructura de carpetas inicial. Es la base de todo el proyecto.

**ARCHIVOS INVOLUCRADOS:**
- `package.json` (generado por CLI)
- `tsconfig.json` → habilitar `strict: true`, `paths` para `@core/*`, `@shared/*`, `@features/*`
- `tsconfig.app.json`
- `.editorconfig` → indent 2 spaces, LF, UTF-8
- `angular.json` → ajustar `budgets` y `outputHashing`
- `src/main.ts`
- `src/app/app.component.ts` (standalone, shell mínimo)
- `src/app/app.routes.ts` (solo `{ path: '**', redirectTo: '/users' }` por ahora)
- `src/environments/environment.ts` → `{ production: false, apiUrl: 'https://dummyjson.com' }`
- `src/environments/environment.production.ts` → `{ production: true, apiUrl: 'https://dummyjson.com' }`
- `.gitignore`
- `src/styles.scss` → import de Inter desde Google Fonts + reset base

**DEPENDENCIAS:** ninguna

**CRITERIOS DE ACEPTACIÓN:**
1. `ng serve` levanta en `localhost:4200` sin errores en consola
2. `ng build --configuration production` genera `/dist` sin warnings de budget
3. `tsc --noEmit` pasa sin errores con strict activado
4. El browser muestra la app shell (texto de placeholder)
5. `src/environments/environment.ts` tiene `apiUrl` configurado

**Commit:** `chore: scaffold angular project with strict config and environments`

---

### T02 — Instalar dependencias + ESLint, Prettier, Husky, lint-staged

**OBJETIVO:**
Instalar todas las dependencias del proyecto (Tailwind, ngx-translate, Angular CDK,
Playwright) y configurar el toolchain de calidad de código para que cada commit
sea validado automáticamente.

**ARCHIVOS INVOLUCRADOS:**
- `package.json` → devDependencies y scripts
- `tailwind.config.ts` → design tokens LATAM (colores, tipografía, borderRadius)
- `postcss.config.js`
- `src/styles.scss` → `@import 'tailwindcss'`
- `.eslintrc.json` → reglas Angular + TypeScript strict
- `.prettierrc` → `{ "singleQuote": true, "semi": true, "printWidth": 100 }`
- `.prettierignore`
- `.husky/pre-commit` → ejecuta lint-staged
- `.lintstagedrc` → `{ "*.ts": ["eslint --fix", "prettier --write"], "*.html": ["prettier --write"] }`
- `e2e/` → directorio vacío con `.gitkeep`

**Dependencias instaladas:**
```
tailwindcss @tailwindcss/forms
@angular/cdk
@ngx-translate/core @ngx-translate/http-loader
@playwright/test
eslint @typescript-eslint/eslint-plugin @angular-eslint/eslint-plugin
prettier eslint-config-prettier
husky lint-staged
```

**DEPENDENCIAS:** T01

**CRITERIOS DE ACEPTACIÓN:**
1. `npx tailwindcss --input src/styles.scss --output /dev/null` termina sin error
2. Un elemento HTML con clase `bg-brand-indigo` toma el color `#2C048C` en el browser
3. `npx eslint src/` pasa sin errores
4. `npx prettier --check src/` pasa sin errores
5. Al hacer `git commit` con código sucio, Husky lo rechaza automáticamente
6. `npx playwright --version` responde correctamente

**Commit:** `chore: configure tailwind, eslint, prettier and husky`

---

## FASE 1 — CORE INFRASTRUCTURE

### T03 — User model + mapDummyJsonToUser()

**OBJETIVO:**
Definir el contrato de datos central del dominio. Todas las capas del proyecto
dependen de esta interfaz, por lo que debe existir antes que cualquier servicio o componente.

**ARCHIVOS INVOLUCRADOS:**
- `src/app/core/models/user.model.ts` →
  - `UserRole` type
  - `User` interface (con `first_name`, `last_name`, `active`, `created_at`, `updated_at`)
  - `DummyJsonUser` interface (raw response)
  - `UserListParams` interface
  - `UserListResponse` interface
  - `mapDummyJsonToUser(raw, index)` función pura
  - `AppError` interface para errores tipados

**DEPENDENCIAS:** T01

**CRITERIOS DE ACEPTACIÓN:**
1. `mapDummyJsonToUser({ firstName: 'Ana', lastName: 'Pérez', role: 'superadmin', ... }, 0)`
   devuelve `{ first_name: 'Ana', last_name: 'Pérez', role: 'user', active: true, created_at: '2023-01-01T00:00:00.000Z' }`
2. Roles inválidos (ej. `'superadmin'`) se normalizan a `'user'`
3. `created_at` y `updated_at` son strings ISO 8601 distintos entre usuarios (index-based)
4. `tsc --noEmit` pasa sin errores
5. Todos los tipos están exportados correctamente y accesibles con `@core/models/user.model`

**Commit:** `feat(core): add user model and dummyjson mapper`

---

### T04 — environments + HttpInterceptor

**OBJETIVO:**
Centralizar la configuración de la URL base de la API y el manejo de errores HTTP
en un interceptor, para que ningún servicio ni componente conozca la URL directamente.

**ARCHIVOS INVOLUCRADOS:**
- `src/environments/environment.ts` (modificar — añadir `logLevel: 'debug'`)
- `src/environments/environment.production.ts` (modificar — añadir `logLevel: 'silent'`)
- `src/app/core/interceptors/api.interceptor.ts` →
  - Añade `environment.apiUrl` como prefijo a todas las requests
  - Añade header `Authorization: Bearer demo-token` (placeholder)
  - En error: mapea `HttpErrorResponse` a `AppError` con `status`, `message`, `timestamp`
  - `4xx` → `AppError` con mensaje descriptivo
  - `5xx` / sin conexión → `AppError` genérico con `'error.server'` (key i18n)
- `src/app/app.config.ts` → registrar `provideHttpClient(withInterceptors([apiInterceptor]))`

**DEPENDENCIAS:** T03

**CRITERIOS DE ACEPTACIÓN:**
1. Una llamada a `/users` en `UserApiService` llega a `https://dummyjson.com/users` (verificable en Network tab)
2. Simular un error 404: el interceptor lanza `AppError` con `status: 404`
3. Simular un error de red (offline): el interceptor lanza `AppError` con `message: 'error.network'`
4. El header `Authorization` aparece en todas las requests salientes
5. No hay ninguna URL hardcodeada fuera de `environment.ts`

**Commit:** `feat(core): add http interceptor and environment config`

---

### T05 — UserApiService

**OBJETIVO:**
Encapsular todas las llamadas HTTP a DummyJSON en un servicio tipado. Ningún componente
ni store llama a `HttpClient` directamente — todo pasa por este servicio.

**ARCHIVOS INVOLUCRADOS:**
- `src/app/core/services/user-api.service.ts` →
  - `getUsers(params: UserListParams): Observable<UserListResponse>`
    — mapea cada `DummyJsonUser` con `mapDummyJsonToUser()`
  - `getUserById(id: number): Observable<User>`
  - `createUser(payload: Partial<User>): Observable<User>`
  - `updateUser(id: number, payload: Partial<User>): Observable<User>`
  - `deleteUser(id: number): Observable<{ id: number }>`
  - `searchUsers(q: string, params: UserListParams): Observable<UserListResponse>`
    — usa `/users/search?q=`

**DEPENDENCIAS:** T03, T04

**CRITERIOS DE ACEPTACIÓN:**
1. `getUsers({ limit: 5, skip: 0 })` devuelve un `Observable<UserListResponse>` con `users.length === 5`
2. Cada `User` retornado tiene `first_name` (no `firstName`) y `active: true`
3. `getUserById(1)` devuelve el usuario con `id: 1`
4. `searchUsers('Emily', { limit: 10, skip: 0 })` devuelve usuarios que contienen 'Emily'
5. `createUser(payload)` hace `POST /users/add` y retorna el usuario creado con `id`
6. El servicio es `providedIn: 'root'` e inyectable en el store

**Commit:** `feat(core): add user api service`

---

### T06 — LoggerService

**OBJETIVO:**
Crear un wrapper de `console` que puede silenciarse en producción mediante `environment.logLevel`,
cumpliendo el requisito explícito del reto de incluir logging básico.

**ARCHIVOS INVOLUCRADOS:**
- `src/app/core/services/logger.service.ts` →
  - `log(message, ...args)` → `console.log` solo si `!environment.production`
  - `warn(message, ...args)` → `console.warn` siempre
  - `error(message, ...args)` → `console.error` siempre
  - `debug(message, ...args)` → solo si `logLevel === 'debug'`
  - `providedIn: 'root'`

**DEPENDENCIAS:** T04

**CRITERIOS DE ACEPTACIÓN:**
1. En modo desarrollo: `logger.log('test')` imprime en consola
2. En modo producción (flag `--configuration production`): `logger.log('test')` no imprime
3. `logger.error('algo')` imprime siempre en ambos modos
4. El `LoggerService` se inyecta correctamente en `UserApiService` y registra las llamadas HTTP

**Commit:** `feat(core): add logger service`

---

## FASE 2 — STATE LAYER

### T07 — UserStoreService (estado base)

**OBJETIVO:**
Implementar el store central de usuarios con Angular Signals. Centraliza el estado,
expone selectores computados y coordina las llamadas al API service.

**ARCHIVOS INVOLUCRADOS:**
- `src/app/core/store/user-store.service.ts` →
  - Signals privados: `_users`, `_isLoading`, `_error`, `_total`, `_params`
  - Signals públicos (readonly): `users`, `isLoading`, `error`, `total`, `params`
  - Computed: `isEmpty`, `hasError`, `pagination`
  - Métodos: `loadUsers(params)`, `loadUserById(id)`, `createUser(payload)`,
    `updateUser(id, payload)`, `deleteUser(id)`, `setParams(params)`, `reset()`
  - `selectedUser` signal para el usuario activo en detail/edit view

**DEPENDENCIAS:** T05, T06

**CRITERIOS DE ACEPTACIÓN:**
1. `loadUsers({ limit: 10, skip: 0 })` actualiza el signal `users` con 10 usuarios
2. Durante la carga `isLoading()` es `true`; al completar es `false`
3. Si la API falla, `error()` contiene el `AppError` y `isLoading()` es `false`
4. `isEmpty` es `true` solo cuando `users().length === 0` y `!isLoading()`
5. `pagination` computed devuelve `{ currentPage, totalPages, limit, total }`
6. El store es `providedIn: 'root'`

**Commit:** `feat(store): add user store service with angular signals`

---

### T08 — Optimistic updates con rollback

**OBJETIVO:**
Extender el `UserStoreService` para que las mutaciones (update, delete, deactivate)
se reflejen inmediatamente en la UI sin esperar respuesta de la API, con rollback
automático si la API devuelve error.

**ARCHIVOS INVOLUCRADOS:**
- `src/app/core/store/user-store.service.ts` (modificar) →
  - `deleteUser(id)`: snapshot → remove del signal → API call → rollback en error
  - `updateUser(id, payload)`: snapshot → patch en signal → API call → rollback en error
  - `deactivateUser(id)`: snapshot → `active: false` en signal → `PATCH /users/:id` → rollback en error
  - Método privado `_withOptimisticUpdate(snapshot, apiCall$)` para reutilizar el patrón

**DEPENDENCIAS:** T07

**CRITERIOS DE ACEPTACIÓN:**
1. Al llamar `deleteUser(1)`, el usuario desaparece de `users()` **antes** de que la API responda
2. Si se simula un error en la API (interceptor bloqueado), el usuario **reaparece** en la lista
3. Tras el rollback, `toastService.error()` es llamado con la key de error correspondiente
4. `updateUser(1, { first_name: 'Test' })` actualiza el nombre en la UI inmediatamente
5. Si update falla, el nombre original se restaura

**Commit:** `feat(store): add optimistic updates with rollback`

---

## FASE 3 — SHARED COMPONENTS

### T09 — ConfirmDialogComponent + ToastService

**OBJETIVO:**
Construir los dos mecanismos de feedback del usuario: confirmación para acciones
destructivas (delete/deactivate) y notificaciones de resultado (success/error).

**ARCHIVOS INVOLUCRADOS:**
- `src/app/shared/components/confirm-dialog/confirm-dialog.component.ts` →
  - Usa `@angular/cdk/dialog` (no Angular Material)
  - Acepta `{ title, message, confirmLabel, cancelLabel, danger: boolean }`
  - Botón confirm: `bg-crimson-600` si `danger: true`, `bg-brand-indigo` si no
  - Devuelve `boolean` al cerrarse
  - Focus inicial en botón cancel (safe default)
  - `role="alertdialog"`, `aria-labelledby`, `aria-describedby`
- `src/app/core/services/toast.service.ts` →
  - `success(messageKey: string)`, `error(messageKey: string)`, `info(messageKey: string)`
  - Toasts apilables, auto-dismiss en 4s
  - Accesible: `role="status"` para success/info, `role="alert"` para error
  - Estilos Tailwind: verde para success, crimson para error, indigo para info
- `src/app/shared/components/toast-container/toast-container.component.ts` →
  - Declarativo, se ubica en `AppComponent`
  - Animación de entrada/salida con `@angular/animations`

**DEPENDENCIAS:** T02, T06

**CRITERIOS DE ACEPTACIÓN:**
1. `ConfirmDialog` abre con `CdkDialog.open()`, el foco va al botón "Cancelar"
2. Presionar Escape cierra el dialog y devuelve `false`
3. Presionar "Confirmar" cierra y devuelve `true`
4. Tab cycling funciona dentro del dialog (no escapa al fondo)
5. `toastService.success('user.created')` muestra un toast verde durante 4s
6. `toastService.error('delete.failed')` muestra un toast crimson con `role="alert"`
7. Múltiples toasts se apilan sin superponerse

**Commit:** `feat(shared): add confirm dialog and toast service`

---

### T10 — SkeletonLoader + EmptyState + ErrorState

**OBJETIVO:**
Implementar los tres estados alternativos de cualquier vista async para dar
feedback visual correcto mientras carga, sin datos o con error de API.

**ARCHIVOS INVOLUCRADOS:**
- `src/app/shared/components/skeleton-loader/skeleton-loader.component.ts` →
  - `@Input() rows = 5`
  - Filas animadas con `animate-pulse` de Tailwind
  - Simula la estructura visual de la tabla de usuarios
- `src/app/shared/components/empty-state/empty-state.component.ts` →
  - `@Input() title`, `@Input() description`, `@Input() actionLabel?`
  - `@Output() action` emite cuando se hace clic en el botón opcional
  - Icono SVG inline (usuarios vacíos)
  - Texto traducible con `TranslatePipe`
- `src/app/shared/components/error-state/error-state.component.ts` →
  - `@Input() message: string`
  - `@Output() retry` emite al hacer clic en "Reintentar"
  - Icono SVG inline de error
  - Botón retry con estilo `bg-brand-indigo`

**DEPENDENCIAS:** T02, T12 (para TranslatePipe — puede usarse i18n key hardcoded hasta T12)

**CRITERIOS DE ACEPTACIÓN:**
1. `SkeletonLoader` muestra N filas pulsantes que imitan el ancho de columnas de la tabla
2. `EmptyState` con `actionLabel="Crear usuario"` muestra el botón y emite `action` al click
3. `ErrorState` emite `retry` al hacer click en "Reintentar"
4. Todos los componentes son `standalone: true`
5. Ningún componente tiene lógica de negocio ni inyecta servicios

**Commit:** `feat(shared): add skeleton loader, empty state and error state components`

---

### T11 — Routing lazy + AppShell

**OBJETIVO:**
Configurar el routing completo con lazy loading del feature de usuarios e implementar
el shell de la aplicación (sidebar, topbar, área de contenido) con la identidad visual LATAM.

**ARCHIVOS INVOLUCRADOS:**
- `src/app/app.routes.ts` → lazy load de `users.routes`
- `src/app/features/users/users.routes.ts` → rutas de list/detail/form
- `src/app/app.component.ts` / `.html` / `.scss` → incluye `<app-shell>`
- `src/app/shared/components/app-shell/app-shell.component.ts` →
  - Sidebar con `bg-brand-indigo` (desktop) / drawer (mobile)
  - Topbar con toggle dark mode + selector de idioma
  - `<router-outlet>` en el área de contenido
  - Nav links: "Usuarios" (único por ahora)
- `src/app/core/guards/auth.guard.ts` → guard placeholder que siempre permite acceso

**DEPENDENCIAS:** T01, T02, T13 (dark mode toggle — puede ser placeholder hasta T13)

**CRITERIOS DE ACEPTACIÓN:**
1. Navegar a `/` redirige a `/users`
2. En Network tab, el chunk de `users` se carga **solo** al navegar a `/users`
3. La sidebar muestra el nav link "Usuarios" con estilo activo (`border-l-2 border-brand-crimson`)
4. El toggle de dark mode (placeholder) cambia la clase `dark` en `<html>`
5. En mobile (< 768px) la sidebar está oculta y hay un botón hamburger
6. `ng build` genera al menos 2 chunks JS separados (`main` + `users`)

**Commit:** `feat(routing): configure lazy routes and app shell`

---

## FASE 4 — I18N + THEMING

### T12 — Setup @ngx-translate (EN + ES)

**OBJETIVO:**
Configurar el sistema de internacionalización para que toda la UI sea traducible
y el idioma activo persista en `localStorage`.

**ARCHIVOS INVOLUCRADOS:**
- `src/app/app.config.ts` → `provideTranslateLoader()` con `HttpLoaderFactory`
- `src/assets/i18n/en.json` → todas las keys del proyecto en inglés
- `src/assets/i18n/es.json` → todas las keys en español
- `src/app/core/services/language.service.ts` →
  - `currentLang` signal
  - `setLanguage(lang: 'en' | 'es')` → llama `translateService.use()` + persiste en localStorage
  - `init()` → carga idioma de localStorage o detecta el del browser
- `src/app/shared/components/app-shell/app-shell.component.ts` (modificar) →
  - Selector de idioma EN/ES en topbar
  - Llama `languageService.setLanguage()`

**Keys mínimas para en.json / es.json:**
```
users.list.title, users.list.search, users.list.empty, users.list.error
users.list.columns.username, .email, .role, .status, .actions
users.detail.title, users.detail.edit, users.detail.deactivate
users.form.create.title, users.form.edit.title
users.form.fields.username, .email, .firstName, .lastName, .role
users.form.validation.required, .email, .minLength, .noSpaces, .roleInvalid
users.roles.admin, users.roles.user, users.roles.guest
users.status.active, users.status.inactive
common.actions.save, .cancel, .delete, .confirm
common.confirm.delete.title, .message
common.toast.created, .updated, .deleted, .deactivated, .error
common.states.loading, .empty, .error, .retry
nav.users
```

**DEPENDENCIAS:** T02, T04

**CRITERIOS DE ACEPTACIÓN:**
1. Al cargar la app, los textos aparecen en el idioma del browser (o español por defecto)
2. El selector EN/ES cambia todos los textos visibles inmediatamente sin recargar
3. Recargar la página mantiene el idioma seleccionado
4. `{{ 'nav.users' | translate }}` en cualquier componente muestra "Users" o "Usuarios"
5. No hay ningún texto hardcodeado en inglés o español en los templates (solo keys i18n)

**Commit:** `feat(i18n): add ngx-translate with english and spanish`

---

### T13 — Dark mode + localStorage

**OBJETIVO:**
Implementar el toggle de dark mode que aplica la clase `dark` al elemento `<html>`,
activa todas las `dark:` classes de Tailwind y persiste la preferencia del usuario.

**ARCHIVOS INVOLUCRADOS:**
- `src/app/core/services/theme.service.ts` →
  - `isDark` signal
  - `toggle()` → invierte, actualiza `document.documentElement.classList`, guarda en localStorage
  - `init()` → carga de localStorage o `prefers-color-scheme`
- `src/app/shared/components/app-shell/app-shell.component.ts` (modificar) →
  - Botón sol/luna en topbar llama `themeService.toggle()`
  - Icono cambia según `themeService.isDark()`
- `src/styles.scss` → añadir colores dark al `:root` y `.dark` si necesario
- `tailwind.config.ts` → confirmar `darkMode: 'class'`

**DEPENDENCIAS:** T11

**CRITERIOS DE ACEPTACIÓN:**
1. Click en el toggle cambia el fondo de `#FAFAFA` (light) a `#0D0221` (dark)
2. El sidebar cambia de `bg-brand-indigo` a `bg-dark-bg`
3. Recargar la página mantiene el modo seleccionado
4. En sistema con `prefers-color-scheme: dark`, la app inicia en dark mode si no hay preferencia guardada
5. El icono del botón es ☀️ en dark mode y 🌙 en light mode (o equivalentes SVG)

**Commit:** `feat(ui): add dark mode toggle with local storage persistence`

---

## FASE 5 — FEATURE: USER LIST

### T14 — UserListComponent (tabla + paginación)

**OBJETIVO:**
Implementar la vista principal de la aplicación: tabla de usuarios con paginación
server-side usando los parámetros `limit` y `skip` de DummyJSON.

**ARCHIVOS INVOLUCRADOS:**
- `src/app/features/users/user-list/user-list.component.ts` →
  - Smart component: inyecta `UserStoreService`
  - Llama `store.loadUsers({ limit: 10, skip: 0 })` en `ngOnInit`
  - Métodos: `onPageChange(page)`, `onDelete(user)`, `onDeactivate(user)`, `onView(id)`, `onEdit(id)`
  - Abre `ConfirmDialog` antes de delete/deactivate
- `src/app/features/users/user-list/user-list.component.html` →
  - `@if (store.isLoading())` → `<app-skeleton-loader>`
  - `@else if (store.hasError())` → `<app-error-state>`
  - `@else if (store.isEmpty())` → `<app-empty-state>`
  - `@else` → tabla + paginación
  - Tabla: columnas avatar, username, email, role badge, status badge, acciones
  - Paginación: botones prev/next + info "Página X de Y"
  - Role badges: colores distintos para admin/user/guest con Tailwind
  - Status badge: verde para active, gris para inactive
- `src/app/features/users/user-list/user-list.component.scss`

**DEPENDENCIAS:** T07, T09, T10, T12

**CRITERIOS DE ACEPTACIÓN:**
1. La tabla muestra 10 usuarios de DummyJSON al cargar
2. "Siguiente" carga los 10 siguientes (skip += 10), "Anterior" vuelve atrás
3. El avatar muestra la imagen de DummyJSON o un placeholder con iniciales
4. Rol `admin` → badge indigo, `user` → badge azul, `guest` → badge gris
5. Usuario inactivo → badge gris "Inactivo", activo → badge verde "Activo"
6. Click en "Eliminar" abre `ConfirmDialog` con `danger: true`
7. Confirmar eliminación llama `store.deleteUser()` y muestra toast de éxito
8. Durante la carga inicial se muestra el skeleton (no tabla vacía)

**Commit:** `feat(users): add user list with server-side pagination`

---

### T15 — Búsqueda con debounce + filtros

**OBJETIVO:**
Añadir búsqueda en tiempo real y filtros combinables por rol y estado activo,
manteniendo la paginación sincronizada con los parámetros de búsqueda.

**ARCHIVOS INVOLUCRADOS:**
- `src/app/features/users/user-list/user-list.component.ts` (modificar) →
  - `FormControl` para el campo de búsqueda con `debounceTime(300)` + `distinctUntilChanged()`
  - `onRoleFilter(role: UserRole | '')` y `onActiveFilter(active: boolean | null)`
  - Al cambiar filtros: resetear `skip` a 0 y llamar `store.loadUsers()`
- `src/app/features/users/user-list/user-list.component.html` (modificar) →
  - Input de búsqueda con icono lupa (SVG inline)
  - Select de rol: Todos / Admin / User / Guest
  - Select de estado: Todos / Activo / Inactivo
  - Chip/tag que muestra filtros activos con botón ×

**DEPENDENCIAS:** T14

**CRITERIOS DE ACEPTACIÓN:**
1. Escribir "Emily" en el buscador dispara una sola llamada a la API (tras 300ms de pausa)
2. Los resultados se filtran y la paginación muestra el total correcto
3. Seleccionar rol "Admin" + buscar "a" combina ambos filtros
4. Limpiar el buscador restaura la lista completa
5. Cambiar de filtro resetea a la página 1
6. El input tiene `aria-label` traducido y `role="search"` en el contenedor

**Commit:** `feat(users): add search with debounce and role/active filters`

---

## FASE 6 — FEATURE: USER DETAIL

### T16 — UserDetailComponent

**OBJETIVO:**
Mostrar el perfil completo de un usuario en una vista dedicada, accesible desde la lista
mediante el botón "Ver" o navegando a `/users/:id`.

**ARCHIVOS INVOLUCRADOS:**
- `src/app/features/users/user-detail/user-detail.component.ts` →
  - Lee `:id` de `ActivatedRoute`
  - Llama `store.loadUserById(id)` en `ngOnInit`
  - Métodos: `onEdit()`, `onDeactivate()`, `onDelete()`, `onBack()`
- `src/app/features/users/user-detail/user-detail.component.html` →
  - `@if (store.isLoading())` → skeleton de perfil
  - Header: avatar grande + nombre + badge role + badge active
  - Secciones: Información personal, Cuenta, Actividad (created_at, updated_at)
  - Botones de acción: Editar, Desactivar, Eliminar
  - Breadcrumb: Usuarios > [nombre]
- `src/app/features/users/user-detail/user-detail.component.scss`

**DEPENDENCIAS:** T14, T09

**CRITERIOS DE ACEPTACIÓN:**
1. Navegar a `/users/1` muestra los datos del usuario con `id: 1`
2. El avatar es la imagen de DummyJSON (o placeholder con iniciales si falla)
3. `created_at` y `updated_at` se muestran en formato legible (DD/MM/YYYY)
4. Botón "Desactivar" abre `ConfirmDialog` y llama `store.deactivateUser(id)`
5. Botón "Editar" navega a `/users/1/edit`
6. Botón "Volver" navega a `/users`
7. Si el ID no existe, muestra `ErrorState` con mensaje "Usuario no encontrado"

**Commit:** `feat(users): add user detail view`

---

## FASE 7 — FEATURE: USER FORM

### T17 — UserFormComponent modo CREATE

**OBJETIVO:**
Implementar el formulario de creación de usuario con validación reactiva completa
que espeja el contrato de la API y proporciona feedback inmediato campo a campo.

**ARCHIVOS INVOLUCRADOS:**
- `src/app/features/users/user-form/user-form.component.ts` →
  - `ReactiveFormsModule`, `FormBuilder`
  - Detecta modo create/edit leyendo si hay `:id` en la ruta
  - Validadores en `username`: `required`, `minLength(3)`, `noWhitespace` (custom)
  - Validadores en `email`: `required`, `email`
  - Validadores en `role`: `required`, valor en `['admin', 'user', 'guest']`
  - Validadores en `first_name`, `last_name`: `required`
  - `onSubmit()` → llama `store.createUser(payload)` → toast → navega a `/users`
- `src/app/features/users/user-form/user-form.component.html` →
  - Campos: username, email, first_name, last_name, role (select)
  - Error messages campo a campo bajo cada input
  - Botones: Guardar (disabled mientras `form.invalid`) + Cancelar
  - Título dinámico: "Crear usuario" / "Editar usuario"
- `src/app/shared/validators/user.validators.ts` →
  - `noWhitespace`: falla si el valor contiene espacios

**DEPENDENCIAS:** T07, T09, T12

**CRITERIOS DE ACEPTACIÓN:**
1. Enviar el form vacío muestra errores en todos los campos obligatorios
2. `username` con espacios muestra "El nombre de usuario no puede contener espacios"
3. `username` con menos de 3 caracteres muestra "Mínimo 3 caracteres"
4. `email` con formato inválido muestra "Email inválido"
5. Formulario válido → botón "Guardar" activo; inválido → desactivado
6. Submit exitoso → toast "Usuario creado" + navegación a `/users`
7. El nuevo usuario aparece en la lista (optimistic o tras reload)

**Commit:** `feat(users): add user create form with reactive validation`

---

### T18 — UserFormComponent modo EDIT + deactivate/delete

**OBJETIVO:**
Extender el formulario para cargar los datos de un usuario existente, permitir su
edición y agregar los flujos de confirmación para deactivate y delete desde la misma vista.

**ARCHIVOS INVOLUCRADOS:**
- `src/app/features/users/user-form/user-form.component.ts` (modificar) →
  - En modo edit: carga usuario con `store.loadUserById(id)` y puebla el form
  - `onSubmit()` → llama `store.updateUser(id, payload)` en modo edit
  - `onDeactivate()` → `ConfirmDialog` → `store.deactivateUser(id)` → toast → back
  - `onDelete()` → `ConfirmDialog` (danger) → `store.deleteUser(id)` → toast → `/users`
- `src/app/features/users/user-form/user-form.component.html` (modificar) →
  - Botones "Desactivar" y "Eliminar" visibles solo en modo edit
  - Badge del estado actual del usuario
  - Indicador de cambios sin guardar (si el form está dirty)

**DEPENDENCIAS:** T17, T09

**CRITERIOS DE ACEPTACIÓN:**
1. Navegar a `/users/1/edit` precarga los campos con los datos del usuario 1
2. Modificar el email y guardar → toast "Usuario actualizado" + cambio visible en lista (optimistic)
3. Click en "Eliminar" → `ConfirmDialog` con `danger: true` → confirmar → toast → navega a `/users`
4. Click en "Desactivar" → `ConfirmDialog` → confirmar → badge cambia a "Inactivo" → toast
5. Si la API de update falla → rollback al valor anterior + toast de error
6. El campo `username` en modo edit es editable (no readonly)

**Commit:** `feat(users): add user edit form with deactivate and delete`

---

## FASE 8 — QUALITY

### T19 — Responsive design

**OBJETIVO:**
Garantizar que la aplicación es usable en mobile (375px), tablet (768px) y desktop (1280px)
mediante clases responsive de Tailwind sin CSS adicional.

**ARCHIVOS INVOLUCRADOS:**
- `src/app/shared/components/app-shell/app-shell.component.html` (modificar) →
  - Mobile: sidebar oculto → icono hamburger → drawer overlay
  - Tablet: sidebar colapsado (solo iconos)
  - Desktop: sidebar expandido con texto
- `src/app/features/users/user-list/user-list.component.html` (modificar) →
  - Mobile (< 768px): cards en lugar de tabla
  - Tablet: tabla con columnas reducidas (ocultar `created_at`)
  - Desktop: tabla completa
- `src/app/features/users/user-form/user-form.component.html` (modificar) →
  - Mobile: campos en columna única
  - Desktop: grid 2 columnas

**DEPENDENCIAS:** T14, T17

**CRITERIOS DE ACEPTACIÓN:**
1. En 375px: no hay scroll horizontal, la tabla colapsa a cards legibles
2. En 375px: el sidebar está oculto, el botón hamburger es visible y funciona
3. En 768px: tabla visible con columnas prioritarias
4. En 1280px: sidebar expandido, tabla completa, formulario en 2 columnas
5. DevTools → throttling 3G: la UI es usable (no elementos superpuestos)

**Commit:** `feat(ui): add responsive layout for mobile tablet and desktop`

---

### T20 — Accesibilidad WCAG 2.1 AA

**OBJETIVO:**
Verificar y corregir todos los componentes para cumplir WCAG 2.1 AA: contraste,
navegación por teclado, roles ARIA y anuncios a lectores de pantalla.

**ARCHIVOS INVOLUCRADOS:**
- Todos los componentes existentes → auditar y corregir:
  - Añadir `aria-label` a todos los botones icono
  - `aria-live="polite"` en el contenedor de toasts
  - `aria-busy="true"` en la tabla durante carga
  - `aria-current="page"` en el nav link activo
  - Focus visible en todos los elementos interactivos (`focus-visible:ring-2`)
  - `<label>` asociado a cada input del formulario con `for` / `id`
  - Contraste mínimo 4.5:1 en todo el texto (verificar con axe DevTools)
  - Orden de focus lógico en el formulario y la tabla

**DEPENDENCIAS:** T14, T16, T17, T18

**CRITERIOS DE ACEPTACIÓN:**
1. axe DevTools en Chrome: **0 errores** en lista, detalle y formulario
2. Navegación solo con Tab por el formulario sigue el orden lógico de los campos
3. `ConfirmDialog` atrapa el focus (no se escapa al fondo)
4. Los toasts son anunciados por `aria-live` (verificable con lector de pantalla)
5. Ratio de contraste texto/fondo ≥ 4.5:1 en todos los textos (verificar con axe o Lighthouse)
6. Lighthouse Accessibility score ≥ 90

**Commit:** `feat(a11y): add wcag 2.1 aa compliance`

---

## FASE 9 — TESTS

### T21 — Unit tests: UserApiService

**OBJETIVO:**
Verificar que el API service mapea correctamente las respuestas de DummyJSON
y maneja errores HTTP usando `HttpClientTestingModule`.

**ARCHIVOS INVOLUCRADOS:**
- `src/app/core/services/user-api.service.spec.ts` →
  - Test 1: `getUsers()` devuelve `UserListResponse` con `users` mapeados (`first_name` en lugar de `firstName`)
  - Test 2: `getUserById(id)` devuelve `User` con `active: true` derivado
  - Test 3: error 404 en `getUserById()` lanza `AppError` con `status: 404`
  - Test 4: `searchUsers('q')` llama al endpoint `/users/search?q=` correcto

**DEPENDENCIAS:** T05

**CRITERIOS DE ACEPTACIÓN:**
1. `ng test --include=**/user-api.service.spec.ts` pasa los 4 tests en verde
2. Sin llamadas HTTP reales (todo mockeado con `HttpTestingController`)
3. Cobertura de los métodos `getUsers`, `getUserById`, `searchUsers`

**Commit:** `test: add unit tests for user api service`

---

### T22 — Unit tests: UserStoreService

**OBJETIVO:**
Verificar que el store actualiza correctamente los signals y que el mecanismo
de optimistic update + rollback funciona de forma aislada.

**ARCHIVOS INVOLUCRADOS:**
- `src/app/core/store/user-store.service.spec.ts` →
  - Test 1: `loadUsers()` actualiza el signal `users` con los datos del API
  - Test 2: `isLoading` es `true` durante la carga y `false` al completar
  - Test 3 (optimistic delete): `deleteUser(id)` elimina del signal antes de la respuesta de API
  - Test 4 (rollback): si `deleteUser(id)` falla, el usuario reaparece en el signal

**DEPENDENCIAS:** T08

**CRITERIOS DE ACEPTACIÓN:**
1. `ng test --include=**/user-store.service.spec.ts` pasa los 4 tests en verde
2. API mockeada con `jasmine.createSpyObj` o similar
3. El test de rollback verifica el estado del signal **antes** y **después** del error

**Commit:** `test: add unit tests for user store and optimistic updates`

---

### T23 — Unit tests: validadores del formulario

**OBJETIVO:**
Verificar los validadores personalizados y las reglas de validación del formulario
de usuario de forma aislada, sin renderizar componentes.

**ARCHIVOS INVOLUCRADOS:**
- `src/app/shared/validators/user.validators.spec.ts` →
  - Test 1: `noWhitespace` pasa con `'juanperez'` y falla con `'juan perez'`
  - Test 2: `noWhitespace` pasa con string vacío (la validación `required` lo maneja)
  - Test 3: el `FormGroup` de `UserFormComponent` es inválido con `username: ''`
  - Test 4: el `FormGroup` es válido con todos los campos correctos

**DEPENDENCIAS:** T17

**CRITERIOS DE ACEPTACIÓN:**
1. `ng test --include=**/user.validators.spec.ts` pasa los 4 tests en verde
2. Tests son puramente unitarios (no `TestBed`, solo instancias de `FormControl`)
3. Cubren los casos de éxito Y fallo de cada validador

**Commit:** `test: add unit tests for user form validators`

---

## FASE 10 — E2E

### T24 — Playwright E2E: flujo completo

**OBJETIVO:**
Implementar el flujo end-to-end completo del reto: crear un usuario, verlo en la lista,
editarlo y desactivarlo, usando Playwright contra la app corriendo en local.

**ARCHIVOS INVOLUCRADOS:**
- `e2e/users.spec.ts` →
  - Setup: `baseURL: 'http://localhost:4200'`
  - Test: crear usuario (`/users/new`) → formulario válido → submit → toast "creado"
  - Test: usuario aparece en la lista → buscar por username → encontrado
  - Test: editar → cambiar email → guardar → toast "actualizado"
  - Test: desactivar → `ConfirmDialog` → confirmar → badge "Inactivo"
- `playwright.config.ts` →
  - `webServer: { command: 'ng serve', port: 4200 }` para arranque automático
  - `use: { screenshot: 'on', video: 'retain-on-failure' }`

**DEPENDENCIAS:** T14, T15, T16, T17, T18

**CRITERIOS DE ACEPTACIÓN:**
1. `npx playwright test` pasa los 4 tests sin servidor manual previo
2. El flujo completo (crear → listar → editar → desactivar) pasa en un único `test.describe`
3. Screenshots en `/e2e/screenshots/` para cada paso clave
4. Si algún test falla, se genera video del fallo en `/e2e/test-results/`

**Commit:** `test(e2e): add playwright e2e flow create edit deactivate`

---

## FASE 11 — DOCUMENTACIÓN

### T25 — README + AI_USAGE + /prompts/

**OBJETIVO:**
Completar toda la documentación requerida por el reto: guía de instalación,
decisiones técnicas, evidencia del proceso con IA y carpeta de prompts.

**ARCHIVOS INVOLUCRADOS:**
- `README.md` → secciones: install, run, build, API choice, env config, screenshots/GIF, endpoints mapping
- `AI_USAGE.md` → completar todos los campos pendientes con ejemplos reales del desarrollo
- `prompts/01-arquitectura.md`
- `prompts/02-backlog.md`
- `prompts/03-core-infrastructure.md`
- `prompts/04-state-layer.md`
- `prompts/05-feature-users.md`
- `prompts/06-tests.md`
- `ARCHITECTURE.md` → ya existente, revisar que esté actualizado

**DEPENDENCIAS:** todas las anteriores

**CRITERIOS DE ACEPTACIÓN:**
1. `git clone` + `npm install` + `ng serve` funciona desde cero siguiendo el README
2. El README tiene al menos 1 screenshot de cada vista principal
3. `AI_USAGE.md` tiene todos los campos completos (ningún *Pendiente*)
4. La carpeta `/prompts/` tiene entre 3 y 6 archivos con el formato requerido
5. `ng build --configuration production` produce build limpio listado en el README

**Commit:** `docs: add readme ai_usage and prompts folder`

---

## Tabla resumen

| ID | Fase | Tarea | Commit message |
|----|------|-------|----------------|
| T01 | Setup | Scaffold + tsconfig strict | `chore: scaffold angular project with strict config and environments` |
| T02 | Setup | Tailwind + ESLint + Husky | `chore: configure tailwind eslint prettier and husky` |
| T03 | Core | User model + mapper | `feat(core): add user model and dummyjson mapper` |
| T04 | Core | Interceptor + environments | `feat(core): add http interceptor and environment config` |
| T05 | Core | UserApiService | `feat(core): add user api service` |
| T06 | Core | LoggerService | `feat(core): add logger service` |
| T07 | Store | UserStoreService base | `feat(store): add user store service with angular signals` |
| T08 | Store | Optimistic updates | `feat(store): add optimistic updates with rollback` |
| T09 | Shared | ConfirmDialog + Toast | `feat(shared): add confirm dialog and toast service` |
| T10 | Shared | Skeleton + Empty + Error | `feat(shared): add skeleton loader empty state and error state components` |
| T11 | Routing | Lazy routes + AppShell | `feat(routing): configure lazy routes and app shell` |
| T12 | i18n | ngx-translate EN/ES | `feat(i18n): add ngx-translate with english and spanish` |
| T13 | Theming | Dark mode | `feat(ui): add dark mode toggle with local storage persistence` |
| T14 | Users | UserList + paginación | `feat(users): add user list with server-side pagination` |
| T15 | Users | Búsqueda + filtros | `feat(users): add search with debounce and role active filters` |
| T16 | Users | UserDetail | `feat(users): add user detail view` |
| T17 | Users | UserForm CREATE | `feat(users): add user create form with reactive validation` |
| T18 | Users | UserForm EDIT + acciones | `feat(users): add user edit form with deactivate and delete` |
| T19 | Quality | Responsive | `feat(ui): add responsive layout for mobile tablet and desktop` |
| T20 | Quality | A11y WCAG 2.1 AA | `feat(a11y): add wcag 2.1 aa compliance` |
| T21 | Tests | UserApiService tests | `test: add unit tests for user api service` |
| T22 | Tests | UserStoreService tests | `test: add unit tests for user store and optimistic updates` |
| T23 | Tests | Form validators tests | `test: add unit tests for user form validators` |
| T24 | E2E | Playwright flujo completo | `test(e2e): add playwright e2e flow create edit deactivate` |
| T25 | Docs | README + AI_USAGE + prompts | `docs: add readme ai_usage and prompts folder` |
