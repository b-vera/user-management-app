# Prompt 05 — Unit tests y E2E

## Goal

Cover the three most important files with unit tests, then implement the full Playwright E2E flow.

## Prompts sent (abbreviated)

### Unit tests — UserApiService (T21)

```
Escribí unit tests para UserApiService usando HttpTestingController:
- getUsers() mapea firstName/lastName a first_name/last_name y deriva active:true
- getUserById() retorna User correctamente mapeado
- getUserById(999) con 404 lanza AppError { status: 404, message: 'error.notFound' }
- searchUsers('emily', ...) llama a /users/search con q=emily

Incluí apiInterceptor en el TestBed para que el mapeo HttpErrorResponse→AppError
sea ejercido en el test 3 sin mockear el error path.
```

### Unit tests — UserStoreService (T22)

```
Escribí unit tests para UserStoreService usando jasmine.createSpyObj:
- loadUsers() popula users signal y setea isLoading false
- isLoading es true mientras el Subject no emite y false después
- deleteUser() remueve usuario del signal ANTES de que el Subject responda (optimistic)
- deleteUser() restaura la lista cuando el Subject hace error (rollback)

Sembrá el estado con (store as any)['_users'].set([...]) para tests 3 y 4.
```

### Unit tests — validators (T23)

```
Tests puramente unitarios (sin TestBed) para src/app/shared/validators/user.validators.ts:
- noWhitespace retorna null con 'juanperez' y {noWhitespace:true} con 'juan perez'
- noWhitespace retorna null con string vacío
- FormGroup creado con new FormBuilder() es inválido con username:''
- FormGroup es válido con todos los campos correctos
```

### Playwright E2E (T24)

```
Implementá e2e/users.spec.ts con test.describe.serial:
- crear usuario en /users/new → toast 'Usuario creado exitosamente' → redirect /users
- lista carga datos de API → buscar 'emily' → fila de tabla con 'emilys' visible
- editar usuario /users/1/edit → cambiar email → toast 'Usuario actualizado exitosamente'
- desactivar usuario /users/2/edit → ConfirmDialog → badge 'Inactivo'

baseURL: http://localhost:4200. Screenshots en e2e/screenshots/ para cada paso.
```

## What I accepted

- Including `apiInterceptor` in the TestBed for T21: this tests the real `AppError` mapping path without mocking it.
- `(store as any)['_users'].set(...)` for seeding private signals in T22: standard Jasmine pattern, avoids coupling setup to `loadUsers()`.
- `test.use({ locale: 'es' })` for E2E: forces `navigator.language` to Spanish so the app renders in the correct locale.

## What I modified

- E2E test 2: `getByText('emilys')` resolved to 2 elements (mobile card hidden at desktop + table row). Fixed to `page.locator('tbody tr').filter({ hasText: 'emilys' })`.
- E2E test 4: needed `page.route()` interception initially to handle DummyJSON not persisting `active`. After the real fix in the store (`deactivateUser.onSuccess` merges `active:false`) the interception became defensive — left in place but no longer load-bearing.

## What I discarded

- Snapshot testing for components — not required by the challenge and adds fragile test maintenance.
- Mocking `ToastService` and `LoggerService` with real implementations in early T22 drafts — replaced with `jasmine.createSpyObj` for full isolation.
