# Backlog — User Management SPA

## Context

| | |
|---|---|
| Framework | Angular 18, standalone components, strict TypeScript |
| State | Service + Angular Signals (`UserStoreService`) |
| UI | Tailwind CSS v3 + Angular CDK |
| Design system | LATAM brand — indigo `#2C048C` / crimson `#EB1453`, Inter |
| API | https://dummyjson.com/users |
| Bonus | Dark mode + localStorage · i18n ES/EN · Optimistic updates · Playwright E2E |

## Development workflow

1. Implement the task
2. Human code review (inspect generated files)
3. Approve → commit with the suggested message
4. Mark task complete in this backlog

> No commit is made without prior human review and approval.

---

## Phases

| Phase | Tasks |
|-------|-------|
| 0 — Project setup | T01 Scaffold + strict tsconfig · T02 Tailwind + ESLint + Husky |
| 1 — Core infrastructure | T03 User model + mapper · T04 HttpInterceptor + environments · T05 UserApiService · T06 LoggerService |
| 2 — State layer | T07 UserStoreService (signals) · T08 Optimistic updates + rollback |
| 3 — Shared components | T09 ConfirmDialog + ToastService · T10 Skeleton + Empty + Error states |
| 4 — Routing | T11 Lazy routes + AppShell |
| 5 — i18n | T12 @ngx-translate EN/ES |
| 6 — Theming | T13 Dark mode + localStorage |
| 7 — Feature: users | T14 UserList + pagination · T15 Search + filters · T16 UserDetail · T17 UserForm CREATE · T18 UserForm EDIT + destructive actions |
| 8 — Quality | T19 Responsive (mobile/tablet/desktop) · T20 WCAG 2.1 AA |
| 9 — Tests | T21 UserApiService unit tests · T22 UserStoreService unit tests · T23 Form validators tests |
| 10 — E2E | T24 Playwright: create → list → edit → deactivate |
| 11 — Docs | T25 README + AI_USAGE + /prompts/ |

---

## Task summary

| ID | Phase | Task | Commit |
|----|-------|------|--------|
| T01 | Setup | Scaffold + tsconfig strict | `chore: scaffold angular project with strict config and environments` |
| T02 | Setup | Tailwind + ESLint + Husky | `chore: configure tailwind eslint prettier and husky` |
| T03 | Core | User model + mapper | `feat(core): add user model and dummyjson mapper` |
| T04 | Core | Environments + HttpInterceptor | `feat(core): add http interceptor and environment config` |
| T05 | Core | UserApiService | `feat(core): add user api service` |
| T06 | Core | LoggerService | `feat(core): add logger service` |
| T07 | Store | UserStoreService base | `feat(store): add user store service with angular signals` |
| T08 | Store | Optimistic updates + rollback | `feat(store): add optimistic updates with rollback` |
| T09 | Shared | ConfirmDialog + ToastService | `feat(shared): add confirm dialog and toast service` |
| T10 | Shared | Skeleton + Empty + Error states | `feat(shared): add skeleton loader empty state and error state components` |
| T11 | Routing | Lazy routes + AppShell | `feat(routing): configure lazy routes and app shell` |
| T12 | i18n | @ngx-translate EN/ES | `feat(i18n): add ngx-translate with english and spanish` |
| T13 | Theming | Dark mode + localStorage | `feat(ui): add dark mode toggle with local storage persistence` |
| T14 | Users | UserList + pagination | `feat(users): add user list with server-side pagination` |
| T15 | Users | Search + debounce + filters | `feat(users): add search with debounce and role active filters` |
| T16 | Users | UserDetail | `feat(users): add user detail view` |
| T17 | Users | UserForm CREATE | `feat(users): add user create form with reactive validation` |
| T18 | Users | UserForm EDIT + deactivate/delete | `feat(users): add user edit form with deactivate and delete` |
| T19 | Quality | Responsive design | `feat(ui): add responsive layout for mobile tablet and desktop` |
| T20 | Quality | WCAG 2.1 AA | `feat(a11y): add wcag 2.1 aa compliance` |
| T21 | Tests | UserApiService unit tests | `test: add unit tests for user api service` |
| T22 | Tests | UserStoreService unit tests | `test: add unit tests for user store and optimistic updates` |
| T23 | Tests | Form validators unit tests | `test: add unit tests for user form validators` |
| T24 | E2E | Playwright full flow | `test(e2e): add playwright e2e flow create edit deactivate` |
| T25 | Docs | README + AI_USAGE + /prompts/ | `docs: add readme ai_usage and prompts folder` |
