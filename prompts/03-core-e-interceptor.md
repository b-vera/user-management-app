# Prompt 03 — Core infrastructure: model, interceptor, services

## Goal

Generate the typed model layer, the HTTP interceptor, `UserApiService`, and `LoggerService` — the foundation everything else builds on.

## Prompt sent

```
Implementá las siguientes piezas de core infrastructure para el proyecto Angular 18:

1. src/app/core/models/user.model.ts
   - Interface User con los campos del challenge (id, username, email, first_name, last_name,
     role, created_at, updated_at, active, image)
   - Interface DummyJsonUser (shape que devuelve dummyjson.com/users)
   - Función mapDummyJsonToUser(raw, index) que mappe firstName→first_name,
     derive active:true, y genere fechas deterministas a partir de BASE_DATE + index

2. src/app/core/interceptors/api.interceptor.ts (functional interceptor)
   - Prepend environment.apiUrl a cada request
   - Mapear HttpErrorResponse → AppError tipado { status, message, timestamp }
   - Mensajes i18n-ready: 'error.notFound', 'error.server', etc.

3. src/app/core/services/user-api.service.ts
   - getUsers(params), searchUsers(q, params), getUserById(id)
   - createUser(payload), updateUser(id, payload), deleteUser(id)
   - Todas las respuestas tipadas, todo pasa por mapDummyJsonToUser

4. src/app/core/services/logger.service.ts
   - Wrapper de console que respeta environment.logLevel ('debug' | 'silent')
   - Métodos: log, warn, error, debug

TypeScript strict mode. No any. Standalone. Angular 18.
```

## What I accepted

- Full implementation of all 4 files as specified.
- Functional interceptor style (no class-based).
- `mapDummyJsonToUser(raw, index)` with deterministic dates from `BASE_DATE`.
- Error message keys following `error.notFound` / `error.server` / `error.unknown` convention.

## What I modified

- Later discovered `active: true` was hardcoded in the mapper. Fixed to `raw.active ?? true` so PUT responses that echo `active: false` are respected (identified during E2E testing).

## What I discarded

- Nothing structural. One field omission (`active` in `DummyJsonUser` interface) was a genuine bug found during E2E — documented in `AI_USAGE.md`.
