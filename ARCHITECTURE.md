# Architecture Decisions — User Management SPA

## Stack base

| Decisión | Elección | Versión |
|----------|----------|---------|
| Framework | Angular | 18 |
| Language | TypeScript strict | 5.x |
| API | DummyJSON | — |
| Node | — | 25 |

---

## 1. State Management → **Service + Angular Signals**

### Elección
`UserStoreService` con Angular Signals (`signal`, `computed`, `effect`).

### Justificación
- El dominio es pequeño: una sola entidad (`User`) con operaciones CRUD.
- Angular Signals son primitivas nativas de Angular 18, sin dependencias externas.
- Los optimistic updates son sencillos: mutar el signal, llamar la API, y revertir en `catchError`.
- Menor curva de aprendizaje que NgRx; más fácil de defender en entrevista técnica.
- Reactive en templates sin `async pipe` ni `subscribe`.

### Trade-offs vs alternativas

| Alternativa | Por qué no |
|-------------|-----------|
| NgRx | Overkill para un dominio; boilerplate de actions/reducers/effects innecesario |
| NgRx Signals | Mejor que NgRx clásico, pero aún añade dependencias sin beneficio real aquí |
| Akita | Librería de terceros con menor adopción en Angular 18 |
| BehaviorSubject | Válido, pero Signals es la dirección futura de Angular; más ergonómico |

---

## 2. UI Library → **Tailwind CSS v4**

### Elección
`tailwindcss` v4 con estrategia `class` para dark mode + `@angular/cdk` para overlays accesibles.

### Justificación
- Estándar actual del desarrollo frontend: utility-first, sin overhead de componentes no usados.
- Dark mode con `dark:` classes y `class` strategy: un toggle en el `<html>` cambia todo.
- Sin abstracción de componentes opinionados — control total sobre el markup y el diseño.
- `@angular/cdk` (incluido con Angular) provee `Dialog`, `Overlay` y `FocusTrap` accesibles sin necesidad de Angular Material completo.
- Tree-shaking real: solo los estilos usados llegan a producción.

### Estrategia WCAG 2.1 AA con Tailwind
- `aria-label` y `role` se agregan manualmente en cada componente (más explícito, más controlado).
- Focus rings: `focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500` en todos los interactivos.
- Contraste: paleta definida en `tailwind.config.ts` con ratios AA verificados.
- `@angular/cdk/a11y` para `LiveAnnouncer` y manejo de foco en diálogos.

### Trade-offs
| Alternativa | Por qué no |
|-------------|-----------|
| Angular Material | Accesibilidad integrada pero diseño más rígido; overkill instalar todo para usarlo parcialmente |
| PrimeNG | Componentes más ricos pero mayor bundle size y menor control sobre estilos |

---

## 3. i18n → **@ngx-translate**

### Estrategia
- `@ngx-translate/core` + `@ngx-translate/http-loader`
- Archivos: `src/assets/i18n/en.json` y `src/assets/i18n/es.json`
- `TranslateModule` importado en cada standalone component que lo necesite
- Selector de idioma en el header, persistido en `localStorage`
- Para textos de Angular Material (labels internos): `MAT_DATE_LOCALE` + `LOCALE_ID`

### Estructura de translation keys
```
users.list.title, users.list.search, users.list.filter.role ...
users.detail.title, users.form.create, users.form.edit ...
common.actions.save, common.actions.cancel, common.actions.delete ...
common.states.loading, common.states.empty, common.states.error ...
```

---

## 4. Estructura de carpetas

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── api.interceptor.ts
│   │   ├── models/
│   │   │   └── user.model.ts
│   │   ├── services/
│   │   │   ├── logger.service.ts
│   │   │   └── toast.service.ts
│   │   └── store/
│   │       └── user-store.service.ts
│   ├── features/
│   │   └── users/
│   │       ├── user-list/
│   │       │   ├── user-list.component.ts
│   │       │   ├── user-list.component.html
│   │       │   └── user-list.component.scss
│   │       ├── user-detail/
│   │       │   ├── user-detail.component.ts
│   │       │   ├── user-detail.component.html
│   │       │   └── user-detail.component.scss
│   │       ├── user-form/
│   │       │   ├── user-form.component.ts
│   │       │   ├── user-form.component.html
│   │       │   └── user-form.component.scss
│   │       └── users.routes.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── confirm-dialog/
│   │   │   │   └── confirm-dialog.component.ts
│   │   │   ├── empty-state/
│   │   │   │   └── empty-state.component.ts
│   │   │   ├── error-state/
│   │   │   │   └── error-state.component.ts
│   │   │   └── skeleton-loader/
│   │   │       └── skeleton-loader.component.ts
│   │   └── validators/
│   │       └── user.validators.ts
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.component.scss
│   └── app.routes.ts
├── assets/
│   └── i18n/
│       ├── en.json
│       └── es.json
└── environments/
    ├── environment.ts
    └── environment.production.ts
```

---

## 5. Modelo de datos

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
  created_at: string;   // ISO 8601 — simulado desde DummyJSON
  updated_at: string;   // ISO 8601 — simulado desde DummyJSON
  active: boolean;      // derivado: true por defecto, false tras deactivate
  image?: string;
}

export interface UserListParams {
  limit: number;
  skip: number;
  q?: string;
  role?: UserRole | '';
  select?: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

// Tipos DummyJSON (raw response)
export interface DummyJsonUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  image: string;
}

// Función de mapeo
export function mapDummyJsonToUser(raw: DummyJsonUser, index = 0): User {
  const base = new Date('2023-01-01').getTime();
  const created = new Date(base + index * 86_400_000).toISOString();
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    first_name: raw.firstName,
    last_name: raw.lastName,
    role: (['admin', 'user', 'guest'].includes(raw.role)
      ? raw.role
      : 'user') as UserRole,
    created_at: created,
    updated_at: created,
    active: true,
    image: raw.image,
  };
}
```

---

## 6. Árbol de rutas con lazy loading

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
  { path: '',        component: UserListComponent },
  { path: 'new',     component: UserFormComponent },
  { path: ':id',     component: UserDetailComponent },
  { path: ':id/edit', component: UserFormComponent },
];
```

---

## 7. Capa HTTP + Optimistic Updates

### UserApiService (interfaz)
```typescript
interface UserApiService {
  getUsers(params: UserListParams): Observable<UserListResponse>;
  getUserById(id: number): Observable<User>;
  createUser(payload: Partial<User>): Observable<User>;
  updateUser(id: number, payload: Partial<User>): Observable<User>;
  deleteUser(id: number): Observable<void>;
}
```

### HttpInterceptor
```
api.interceptor.ts
├── Agrega base URL desde environment.apiUrl
├── Agrega header Authorization: Bearer <token> (placeholder)
└── Maneja errores centralizados:
    ├── 4xx → lanza AppError con mensaje localizado
    └── 5xx / network → lanza AppError genérico
```

### Patrón Optimistic Update
```
1. Capturar snapshot del estado actual
2. Aplicar cambio inmediatamente en el signal (UI actualiza)
3. Llamar a la API
4. Si OK → confirmar (el estado ya es correcto)
5. Si ERROR → restaurar snapshot + mostrar toast de error
```

```typescript
// Esquema en UserStoreService
deleteUser(id: number): void {
  const snapshot = this._users();          // 1. snapshot
  this._users.update(list =>               // 2. optimistic delete
    list.filter(u => u.id !== id));
  this.api.deleteUser(id).pipe(
    catchError(err => {
      this._users.set(snapshot);           // 5. rollback
      this.toast.error('delete_failed');
      return EMPTY;
    })
  ).subscribe();
}
```

---

## 8. Design System — LATAM Brand

> **Nota importante:** No se usa el logotipo de LATAM Airlines.
> Se toma únicamente la identidad visual de marca: paleta de colores, tipografía y principios de diseño.
> La aplicación es una herramienta interna propia que adopta el brand como sistema visual de referencia.
>
> Fuentes: [schemecolor.com](https://www.schemecolor.com/latam-airlines-brasil-logo-colors.php) · [airhex.com](https://airhex.com/airline-logos/latam-airlines-group/)

### Paleta de colores

#### Primarios (identidad LATAM)
| Token | Nombre | Hex | Uso |
|-------|--------|-----|-----|
| `brand-indigo` | Indigo LATAM | `#2C048C` | Color dominante: nav, headers, botones primarios, links |
| `brand-crimson` | Crimson LATAM | `#EB1453` | Acento: badges, alertas activas, hover states |

#### Escala de Indigo (generada desde el primario)
| Token | Hex | Uso |
|-------|-----|-----|
| `indigo-50` | `#F0EAFF` | Fondos de hover, selected rows |
| `indigo-100` | `#D9C8FF` | Borders de inputs focus |
| `indigo-500` | `#5B21E8` | Intermediate state |
| `indigo-700` | `#2C048C` | **Brand primary** |
| `indigo-900` | `#160047` | Dark mode surface, hover de botón primario |

#### Escala de Crimson (acento)
| Token | Hex | Uso |
|-------|-----|-----|
| `crimson-400` | `#F5537B` | Hover states del acento |
| `crimson-600` | `#EB1453` | **Brand accent** — destructive actions, delete, deactivate badge |
| `crimson-800` | `#A00038` | Dark mode pressed state |

#### Neutros
| Token | Hex | Uso |
|-------|-----|-----|
| `neutral-50` | `#FAFAFA` | Background light mode |
| `neutral-100` | `#F4F4F5` | Surface cards |
| `neutral-300` | `#D1D5DB` | Borders, dividers |
| `neutral-600` | `#52525B` | Texto secundario |
| `neutral-900` | `#18181B` | Texto principal light mode |

#### Dark mode surfaces
| Token | Hex | Uso |
|-------|-----|-----|
| `dark-bg` | `#0D0221` | Background principal dark |
| `dark-surface` | `#1A0440` | Cards, sidebars dark |
| `dark-border` | `#2C048C` | Borders sutiles con tono brand |

#### Semánticos
| Token | Hex | Uso |
|-------|-----|-----|
| `success` | `#16A34A` | Usuario activo, guardado OK |
| `warning` | `#D97706` | Alertas no críticas |
| `error` | `#EB1453` | Reutiliza brand crimson para errores / destructivos |
| `info` | `#2C048C` | Reutiliza brand indigo para información |

---

### Tipografía

LATAM utiliza una tipografía geométrica sans-serif con barras ligeramente redondeadas.
Para la implementación web se usa **Inter** como sustituto más cercano disponible en Google Fonts
(geométrica, alta legibilidad, excelente soporte de pesos).

```
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

| Escala | Size | Weight | Uso |
|--------|------|--------|-----|
| `text-xs` | 12px | 400 | Labels, captions |
| `text-sm` | 14px | 400/500 | Body, table cells |
| `text-base` | 16px | 400 | Body principal |
| `text-lg` | 18px | 600 | Subtítulos de sección |
| `text-2xl` | 24px | 700 | Títulos de página |
| `text-4xl` | 36px | 800 | Hero / branding |

---

### Tailwind config — design tokens

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          indigo:  '#2C048C',
          crimson: '#EB1453',
        },
        indigo: {
          50:  '#F0EAFF',
          100: '#D9C8FF',
          500: '#5B21E8',
          700: '#2C048C',
          900: '#160047',
        },
        crimson: {
          400: '#F5537B',
          600: '#EB1453',
          800: '#A00038',
        },
        dark: {
          bg:      '#0D0221',
          surface: '#1A0440',
          border:  '#2C048C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
        lg: '10px',
        xl: '16px',
      },
    },
  },
} satisfies Config;
```

---

### Componentes — guía de estilo rápida

```
Botón primario:  bg-brand-indigo text-white hover:bg-indigo-900
Botón peligro:   bg-crimson-600 text-white hover:bg-crimson-800
Badge activo:    bg-green-100 text-green-700 dark:bg-green-900/30
Badge inactivo:  bg-neutral-100 text-neutral-600 dark:bg-neutral-800
Role admin:      bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30
Role user:       bg-blue-100 text-blue-700
Role guest:      bg-neutral-100 text-neutral-600
Input focus:     focus:ring-2 focus:ring-brand-indigo
Sidebar:         bg-brand-indigo dark:bg-dark-bg
Nav link activo: text-brand-crimson border-l-2 border-brand-crimson
```

---

## Tabla resumen de decisiones (para README.md)

| Área | Decisión | Razón principal |
|------|----------|----------------|
| State management | Service + Angular Signals | Dominio pequeño, primitivas nativas Angular 18 |
| UI Library | Tailwind CSS v4 + Angular CDK | Estándar actual, dark mode con `dark:` classes, tree-shaking real |
| Design system | LATAM Brand Manual v1.2 | Paleta indigo `#2C048C` + crimson `#EB1453`, tipografía Inter |
| i18n | @ngx-translate | Más flexible que Angular i18n para SPA sin SSR |
| API | DummyJSON | Schema más cercano al reto, soporta CRUD simulado |
| Mapeo de campos | `mapDummyJsonToUser()` | firstName→first_name, active simulado, fechas derivadas |
| Routing | Lazy loaded feature routes | Requisito de producción: chunks separados por ruta |
| Estilos | Tailwind CSS v4 con design tokens LATAM | Variables CSS en config, dark mode con clase `dark` en `<html>` |
