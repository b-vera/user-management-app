# Architecture Decisions — User Management SPA

## Stack

| Decision | Choice | Version |
|----------|--------|---------|
| Framework | Angular | 18 |
| Language | TypeScript strict | 5.x |
| API | DummyJSON | — |
| Node | — | 20+ |

---

## 1. State Management → **Service + Angular Signals**

### Choice
`UserStoreService` with Angular Signals (`signal`, `computed`, `effect`).

### Justification
- Single-entity domain (`User`) — no cross-feature coordination needed.
- Angular Signals are native primitives in Angular 18, zero external dependencies.
- Optimistic updates are straightforward: mutate the signal, call the API, revert in `catchError`.
- Lower learning curve than NgRx; easier to defend in a technical interview.
- Reactive in templates without `async pipe` or `subscribe`.

### Trade-offs vs alternatives

| Alternative | Why not |
|-------------|---------|
| NgRx | Overkill for a single entity; actions/reducers/effects add boilerplate with no architectural gain |
| NgRx Signals | Better than classic NgRx, but still adds a dependency without real benefit at this domain size |
| Akita | Third-party library with lower adoption in Angular 18 |
| BehaviorSubject | Valid, but Signals is Angular's stated future direction; more ergonomic |

---

## 2. UI Library → **Tailwind CSS v3 + Angular CDK**

### Choice
`tailwindcss` v3.4 with `class` dark mode strategy + `@angular/cdk` for accessible overlays.

> **Note:** Tailwind CSS v4 was initially attempted but is incompatible with Angular CLI 18's
> esbuild context — utility classes are not generated. v3.4 is the correct version for this stack.
> See `AI_USAGE.md → Where AI Got It Wrong → Case 2`.

### Justification
- Utility-first, no unused component overhead — true tree-shaking.
- Dark mode via `dark:` classes and `class` strategy: a single toggle on `<html>` changes everything.
- No opinionated component abstractions — full control over markup and design.
- `@angular/cdk` (bundled with Angular) provides `Dialog`, `Overlay`, and `FocusTrap` without the full Angular Material install.

### WCAG 2.1 AA strategy with Tailwind
- `aria-label` and `role` attributes added explicitly per component (more controlled, easier to audit).
- Focus rings: `focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo` on all interactive elements.
- Contrast: palette defined in `tailwind.config.js` with verified AA ratios.
- `@angular/cdk/a11y` for `LiveAnnouncer` and focus management in dialogs.

### Trade-offs
| Alternative | Why not |
|-------------|---------|
| Angular Material | Built-in accessibility, but rigid design and heavy to install partially |
| PrimeNG | Richer components but larger bundle size and less control over styles |

---

## 3. i18n → **@ngx-translate**

### Strategy
- `@ngx-translate/core` + `@ngx-translate/http-loader`
- Files: `src/assets/i18n/en.json` and `src/assets/i18n/es.json`
- `TranslateModule` imported in each standalone component that needs it
- Language selector in the header, persisted in `localStorage`

### Translation key structure
```
users.list.title, users.list.search, users.list.filter.role ...
users.detail.title, users.form.create, users.form.edit ...
common.actions.save, common.actions.cancel, common.actions.delete ...
common.states.loading, common.states.empty, common.states.error ...
```

---

## 4. Folder structure

```
src/
├── app/
│   ├── core/
│   │   ├── interceptors/
│   │   │   └── api.interceptor.ts
│   │   ├── models/
│   │   │   └── user.model.ts
│   │   ├── services/
│   │   │   ├── logger.service.ts
│   │   │   ├── toast.service.ts
│   │   │   └── user-api.service.ts
│   │   └── store/
│   │       └── user-store.service.ts
│   ├── features/
│   │   └── users/
│   │       ├── user-list/
│   │       ├── user-detail/
│   │       ├── user-form/
│   │       └── users.routes.ts
│   └── shared/
│       ├── components/
│       │   ├── avatar/
│       │   ├── badge/
│       │   ├── confirm-dialog/
│       │   ├── empty-state/
│       │   ├── error-state/
│       │   └── skeleton-loader/
│       ├── utils/
│       │   └── avatar-color.util.ts
│       └── validators/
│           └── user.validators.ts
├── assets/
│   └── i18n/
│       ├── en.json
│       └── es.json
└── environments/
    ├── environment.ts
    └── environment.production.ts
```

---

## 5. Data model

```typescript
// src/app/core/models/user.model.ts

export type UserRole = 'admin' | 'user' | 'guest';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  created_at: string;   // ISO 8601 — derived from DummyJSON list index
  updated_at: string;   // ISO 8601 — derived from DummyJSON list index
  active: boolean;      // raw.active ?? true; echoed back on PUT
  image?: string;
}

export interface UserListParams {
  limit: number;
  skip: number;
  q?: string;
  role?: UserRole | '';
}

export interface UserListResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

// DummyJSON raw shape
export interface DummyJsonUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active?: boolean;
  image: string;
}

export function mapDummyJsonToUser(raw: DummyJsonUser, index = 0): User {
  const base = new Date('2023-01-01').getTime();
  const created = new Date(base + index * 86_400_000).toISOString();
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    first_name: raw.firstName,
    last_name: raw.lastName,
    role: (['admin', 'user', 'guest'].includes(raw.role) ? raw.role : 'user') as UserRole,
    created_at: created,
    updated_at: created,
    active: raw.active ?? true,
    image: raw.image,
  };
}
```

---

## 6. Route tree with lazy loading

```typescript
// src/app/app.routes.ts
export const appRoutes: Routes = [
  { path: '', redirectTo: '/users', pathMatch: 'full' },
  {
    path: 'users',
    loadChildren: () =>
      import('./features/users/users.routes').then(m => m.usersRoutes),
  },
  { path: '**', redirectTo: '/users' },
];

// src/app/features/users/users.routes.ts
export const usersRoutes: Routes = [
  { path: '',          component: UserListComponent },
  { path: 'new',       component: UserFormComponent },
  { path: ':id',       component: UserDetailComponent },
  { path: ':id/edit',  component: UserFormComponent },
];
```

---

## 7. HTTP layer + Optimistic Updates

### UserApiService interface
```typescript
interface UserApiService {
  getUsers(params: UserListParams): Observable<UserListResponse>;
  searchUsers(q: string, params: UserListParams): Observable<UserListResponse>;
  getUserById(id: number): Observable<User>;
  createUser(payload: Partial<User>): Observable<User>;
  updateUser(id: number, payload: Partial<User>): Observable<User>;
  deleteUser(id: number): Observable<void>;
}
```

### HttpInterceptor
```
api.interceptor.ts
├── Prepends environment.apiUrl to every request
├── Adds Authorization: Bearer <token> header (placeholder)
└── Centralised error mapping:
    ├── 4xx → AppError with localised message key
    └── 5xx / network → generic AppError with 'error.server'
```

### Optimistic Update pattern
```
1. Capture snapshot of current state
2. Apply change immediately to signal (UI updates)
3. Call API
4. On success → confirm (state is already correct)
5. On error  → restore snapshot + show error toast
```

```typescript
// Reusable private helper in UserStoreService
private _optimistic<T>(
  apiCall$: Observable<T>,
  handlers: { onSuccess: (res: T) => void; onError: () => void }
): void {
  apiCall$.pipe(
    tap(res => handlers.onSuccess(res)),
    catchError(() => {
      handlers.onError();
      return EMPTY;
    })
  ).subscribe();
}
```

---

## 8. Design System

**Brand reference:** LATAM Airlines visual identity — palette and typography only, no trademark assets.

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#2C048C` (indigo) | Navigation, headers, primary buttons, links |
| Accent | `#EB1453` (crimson) | Destructive actions, delete/deactivate badges, active alerts |

**Typography:** Inter (Google Fonts) — geometric sans-serif, closest publicly available match to LATAM's brand typeface.

**Dark mode:** Tailwind `class` strategy — a single `dark` class on `<html>` triggers all `dark:` variants. Toggle persisted in `localStorage`.

---

## Decision summary

| Area | Decision | Main reason |
|------|----------|-------------|
| State management | Service + Angular Signals | Small domain, native Angular 18 primitives |
| UI Library | Tailwind CSS v3 + Angular CDK | Current standard, real tree-shaking, clean dark mode |
| Design system | LATAM brand palette — indigo `#2C048C` + crimson `#EB1453` | Visually distinctive; Inter as web-safe substitute |
| i18n | @ngx-translate | More flexible than Angular i18n for SPA without SSR |
| API | DummyJSON | Closest schema to challenge, supports simulated CRUD |
| Field mapping | `mapDummyJsonToUser()` | `firstName→first_name`, `active: raw.active ?? true`, deterministic dates |
| Routing | Lazy-loaded feature routes | Production requirement: separate chunks per route |
