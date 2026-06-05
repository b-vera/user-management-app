# Prompt 01 — Arquitectura del proyecto

## Goal

Define the full technical architecture before writing a single line of code: framework version, state management approach, UI library, folder structure, and key patterns.

## Prompt sent

```
Eres un arquitecto frontend senior. Voy a construir una SPA de User Management
como prueba técnica con los siguientes requisitos:

Stack fijo: Angular 18, TypeScript strict mode, Angular CLI.

Decisiones que necesito tomar ANTES de escribir código:
1. State management: NgRx vs NgRx Signals vs Akita vs Service + BehaviorSubject vs Service + Angular Signals
2. UI library: Angular Material vs PrimeNG vs Tailwind CSS
3. Estructura de carpetas
4. Patron de HTTP layer (interceptor, typed service, error handling)
5. Estrategia de optimistic updates

Para cada decisión: dame las opciones, los trade-offs, y tu recomendación justificada.
El dominio es pequeño (una sola entidad: usuarios). El reto valora accesibilidad WCAG 2.1 AA
y dark mode. Presupón que el evaluador conoce Angular moderno.
```

## What I accepted

- **State management**: Service + Angular Signals. Justification: single-entity domain, fine-grained reactivity without NgRx boilerplate. `_optimistic<T>()` private helper covers the rollback pattern cleanly.
- **UI library**: Tailwind CSS v3 + Angular CDK. Gives full control over markup, true tree-shaking, and clean `dark:` class strategy. Accessibility (WCAG) implemented explicitly with `@angular/cdk` and `aria-*` attributes.
- **Folder structure**: `core/` (interceptors, models, services, store) · `features/users/` (list, detail, form) · `shared/` (components, validators).
- **HTTP layer**: functional `HttpInterceptor` that prepends `environment.apiUrl` and maps `HttpErrorResponse → AppError`.
- **Optimistic update pattern**: snapshot → mutate signal → call API → `onSuccess` merge / `onError` restore snapshot.

## What I modified

- Changed UI library from Angular Material (AI recommendation) to Tailwind CSS. Material has good a11y defaults, but Tailwind + CDK gives more control and cleaner dark mode.
- Decided to include all 4 bonus features (dark mode, i18n, optimistic updates, Playwright) — the AI did not propose them by default.

## What I discarded

- NgRx: overkill for a single entity. Would add actions/reducers/effects/selectors for no architectural gain at this domain size.
- PrimeNG: large bundle, opinionated markup, harder to customise for dark mode.
