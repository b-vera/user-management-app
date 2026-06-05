# Prompt 04 — Store y feature components

## Goal

Build `UserStoreService` with the optimistic update pattern, then implement all three user views: list, detail, and create/edit form.

## Prompts sent (abbreviated)

### Store

```
Implementá UserStoreService en src/app/core/store/user-store.service.ts usando Angular Signals:
- Señales privadas: _users, _selectedUser, _isLoading, _error, _total, _params
- Señales públicas readonly: users, selectedUser, isLoading, error, total, params
- Computed: isEmpty, hasError, pagination
- Métodos: loadUsers, searchUsers, loadUserById, createUser, updateUser, deleteUser, deactivateUser
- Todos los write operations con optimistic update + rollback
- Helper privado _optimistic<T>(apiCall$, {onSuccess, onError}) para no repetir el patrón
```

### User list

```
Implementá UserListComponent:
- Tabla paginada con columnas: avatar, nombre, email (oculto en tablet), rol, estado, acciones
- Vista de cards en mobile (md:hidden)
- Search input con debounce 300ms
- Filtros de rol y estado activo/inactivo
- Skeleton loader mientras isLoading
- Empty state y error state
- Acciones: ver, editar, eliminar (con ConfirmDialog)
Responsive: mobile cards, tablet/desktop tabla. WCAG: scope="col", aria-busy.
```

### User form (create/edit)

```
Implementá UserFormComponent standalone que sirva para crear y editar:
- Reactive form con: first_name, last_name, username (required, minLength 3, noWhitespace),
  email (required, email), role (required, validRole)
- Modo create: POST → optimistic add → toast → navigate /users
- Modo edit: carga usuario, parchea form, PUT → optimistic update → toast → navigate /users/:id
- Acciones destructivas en modo edit: Desactivar (ConfirmDialog) y Eliminar (ConfirmDialog)
- Validación campo a campo con mensajes en español e inglés
```

## What I accepted

- `_optimistic<T>()` private helper — clean pattern, avoids repetition across 3 write methods.
- Computed `pagination` signal that derives `currentPage` and `totalPages` from `_params` and `_total`.
- Dual-mode form (create/edit) driven by route param presence.
- Card/table responsive split at `md:` breakpoint.

## What I modified

- `updateUser.onSuccess`: changed from "replace with server response" to "merge server response with sent payload" (`{ ...updated, ...payload }`). DummyJSON doesn't echo all fields; without the merge, fields like `active` were lost on confirmation.
- `deactivateUser.onSuccess`: forces `active: false` on the confirmed object since DummyJSON's PUT response never includes a custom `active` field.
- `UserDetailComponent.load()`: added guard `selectedUser()?.id !== id` to skip the re-fetch when navigating from edit — prevents the GET response from overwriting a successful update.

## What I discarded

- Class-based `HttpInterceptor` (AI first proposed it, I requested the functional form).
- `NgZone.run()` wrappers the AI added around signal updates — unnecessary since Angular Signals are zone-agnostic.
