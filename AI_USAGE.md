# AI_USAGE.md — User Management SPA

## Tools Used

| Tool | Model | Used for |
|------|-------|----------|
| Claude Code (CLI) | Claude Sonnet 4.6 | Architecture design, scaffolding, component generation, visual redesign, unit tests, E2E setup, documentation |

---

## Estimated AI Contribution

| Area | AI % | Human % | Notes |
|------|------|---------|-------|
| Architecture | 60% | 40% | AI proposed options; human made final decisions (state, UI lib, bonus scope) |
| Components | 80% | 20% | AI generated complete templates; human reviewed, adjusted responsive breakpoints and approved |
| Services | 75% | 25% | AI generated service logic; human identified bugs (CDK overlay, optimistic update field merge) |
| Tests | 85% | 15% | AI generated tests and fixtures; human reviewed coverage and approved interceptor-in-TestBed strategy |
| CI/CD | — | — | Not implemented (out of scope) |
| Documentation | 50% | 50% | AI generated structure; human completed with real context |

---

## Session Log

Full prompt sessions are in [`/prompts/`](./prompts/). Summary below.

| Session | Date | Task | Key outcome | Prompt file |
|---------|------|------|-------------|-------------|
| 01 — Architecture | 2026-06-03 | Architecture decisions | Chose Signals + Tailwind v3 + CDK; folder structure; HTTP layer; optimistic pattern | `01-arquitectura.md` |
| 02 — Backlog | 2026-06-03 | Task planning | 25 tasks across 11 phases; Conventional Commits; human review before every commit | `02-backlog.md` |
| 03 — Core + interceptor | 2026-06-03 | T03–T06 | User model, mapper, HttpInterceptor, UserApiService, LoggerService | `03-core-e-interceptor.md` |
| 04 — Store + features | 2026-06-04 | T07–T18 | UserStoreService, `_optimistic<T>()` helper, UserList / Detail / Form | `04-store-y-features.md` |
| 05 — Responsive + A11y | 2026-06-04 | T19–T20 | Mobile card/table split; CDK overlay CSS fix; WCAG 2.1 AA audit | `04-store-y-features.md` |
| 06 — Unit tests | 2026-06-04 | T21–T23 | 12 tests across ApiService, StoreService and validators — all green | `05-tests-y-e2e.md` |
| 07 — Playwright E2E | 2026-06-04 | T24 | Full create→list→edit→deactivate flow; 8 screenshots; `page.route()` for API interception | `05-tests-y-e2e.md` |
| 08 — Visual redesign | 2026-06-05 | Polish | AvatarComponent (oklch hash), BadgeComponent, sidebar gradient, redesigned toasts | *(inline session)* |
| 09 — Design corrections | 2026-06-05 | Corrective | Initials-only avatars with light/dark oklch pairs; neutral dark palette (`#0E0D14`); sidebar gradient via inline style; crimson active bar | *(inline session)* |

---

## Where AI Helped Most

**1. Complex templates with Tailwind**
AI generated all templates for `UserListComponent`, `UserDetailComponent`, and `UserFormComponent` with Tailwind classes, dark mode, role/status badges, tooltips, accessibility attributes, and conditional rendering logic. Work that would have taken days manually. Human reviewed, adjusted breakpoints, and approved before each commit.

**2. Optimistic update pattern with rollback**
The private `_optimistic<T>(apiCall$, { onSuccess, onError })` helper in `UserStoreService` encapsulates the snapshot → mutate → API → confirm/rollback pattern in a reusable way, applied cleanly to `updateUser`, `deleteUser`, and `deactivateUser`. AI proposed the abstraction; human validated it under real DummyJSON response conditions.

**3. Unit test suite with `HttpTestingController`**
The 4 tests for `UserApiService` — including the decision to include the real `apiInterceptor` in the `TestBed` to exercise the `HttpErrorResponse → AppError` mapping without mocking the error path. All 4 tests passed green on the first run.

**4. Visual redesign: `AvatarComponent` + `BadgeComponent`**
AI generated `avatar-color.util.ts` (deterministic `oklch()` color from username hash), `AvatarComponent` (image or initials with status dot), and `BadgeComponent` (role/status variants, dark mode `*/20` backgrounds). This replaced inline badge logic scattered across three components with a single reusable abstraction. AI also updated the CDK overlay CSS architecture and the toast design in the same session.

---

## Where AI Got It Wrong

### Case 1 — Could not access the LATAM brand manual PDF
**Problem:** Asked to extract the palette and typography from the official manual at
`https://es.scribd.com/document/844420637/LATAM-Stand-Manual-v1-2`.
Scribd requires authentication — the AI retrieved the page UI HTML instead of the PDF content.

**How it was identified:** The AI reported the limitation explicitly rather than fabricating data.

**How it was resolved:** Public, verifiable sources were used
([schemecolor.com](https://www.schemecolor.com/latam-airlines-brasil-logo-colors.php),
[airhex.com](https://airhex.com/airline-logos/latam-airlines-group/))
to obtain the official hex codes (`#2C048C`, `#EB1453`). The full color scale and design tokens
were completed manually following design system principles and approved by the human before integration.

### Case 2 — Tailwind CSS v4 does not generate utilities with Angular CLI
**Problem:** AI recommended and configured Tailwind CSS v4 (`@tailwindcss/postcss`).
The build did not fail, but no utility class (`bg-brand-indigo`, `.flex`, etc.) was generated.
The output CSS contained only the `@layer base` reset — zero utilities.

**How it was identified:** The browser showed the app completely unstyled.
Diagnosis: `curl http://localhost:4200/styles.css | grep ".flex"` returned 0 results.
The PostCSS plugin works correctly from the project root but Angular's esbuild context does not invoke it.

**How it was resolved:** Downgraded to Tailwind CSS v3.4 (proven integration with Angular CLI 18).
Tailwind v4 is documented as incompatible with Angular CLI 18 in this context.

### Case 3 — `@angular/cdk@22` incompatible with Angular 18
**Problem:** AI installed `@angular/cdk@22` (latest version) without verifying Angular 18 compatibility.
When using `@angular/cdk/dialog` in `UserListComponent`, the build failed with:
`ChangeDetectionStrategy.Eager: Unsupported change detection strategy`.

**How it was identified:** The dev server crashed on loading the component in the browser.

**How it was resolved:** Downgraded to `@angular/cdk@18.2.14` to match the Angular core version.
Rule applied: `@angular/cdk` version must always match `@angular/core`.

### Case 5 — Visual redesign diverged from approved design on 3 points

**Problem:** The initial visual redesign commit deviated from the approved design in three ways:
1. Avatars rendered as identicon-like solid blocks instead of initials — `oklch(52% 0.17 H)` produced a saturated solid background that covered the text.
2. Dark mode remained in the deep purple palette (`#0D0221 / #1A0440`) instead of the approved neutral palette (`#0E0D14 / #15131F`).
3. Sidebar used Tailwind gradient tokens that collapsed to neutral in dark mode, and used `routerLinkActive` with `border-l-2` instead of a proper crimson bar span.

**How it was identified:** The user performed a manual visual review and identified the three deviations against the approved design spec.

**How it was resolved:**
- Avatar: added `ThemeService` injection to compute light vs dark `oklch` color pairs; removed `imageUrl` branch entirely; ring via `box-shadow` inline.
- Dark mode: updated Tailwind config dark tokens to neutral hex values; all `dark:bg-dark-*` components updated automatically; CSS custom properties updated to match.
- Sidebar: replaced Tailwind gradient with inline `style="linear-gradient(...)"` (immune to token changes); removed conflicting `relative` class that was overriding `fixed` and collapsing height; added `@if` span with `3px` crimson bar and `box-shadow` glow.

---

### Case 4 — CDK overlay base CSS missing: modal rendered outside viewport
**Problem:** `ConfirmDialog` (CDK Dialog) appeared at the bottom of the page instead of centered.
Adding `positionStrategy` to the service config did not fix it.

**How it was identified:** The user reported the modal was still appearing at the bottom after the first fix attempt.

**How it was resolved:** AI diagnosed that `@angular/cdk/overlay-prebuilt.css` was not imported anywhere.
Without it, `.cdk-overlay-container` lacks `position: fixed` and does not cover the viewport.
The essential rules were added directly to `styles.scss`:
`.cdk-overlay-container` (position fixed, z-index 1000), `.cdk-global-overlay-wrapper` (flex centering),
`.cdk-overlay-pane`, and `.cdk-overlay-backdrop`.

---

## Decisions Made Without AI

**1. Include all 4 bonus features**
AI did not propose including them by default given the small domain. I chose to implement all four
(dark mode, i18n, optimistic updates, Playwright) because the challenge explicitly values them
and they demonstrate modern Angular beyond basic CRUD.

**2. Tailwind CSS instead of Angular Material**
AI recommended Angular Material for its built-in accessibility. I chose Tailwind CSS v3 + CDK
because it is the current frontend standard, gives full control over markup, produces lighter bundles
through real tree-shaking, and the `dark:` class strategy is cleaner than Material's theming system.
WCAG 2.1 AA compliance was implemented explicitly with `aria-*` attributes and `@angular/cdk/a11y`.

**3. No LATAM trademark assets — brand palette only**
AI integrated LATAM's visual identity including logo references. I clarified that this is an
internal tool that adopts the color palette, typography, and design principles of the brand
without using or referencing any LATAM Airlines registered trademarks or logo assets.

**4. Directory name `user-management-app`**
AI suggested `fe-challenge`. I chose a descriptive, domain-neutral name that communicates
what the application does, not the evaluation process it came from.

---

## Prompting Strategy

**Session structure:** Each work session started with the full project context already loaded
in the IDE (open files, `BACKLOG.md` as reference) and a prompt specifying exactly which task
to implement with its observable acceptance criteria.

**Context provided:** Fixed stack (Angular 18, Tailwind, Signals), decisions already made,
relevant existing files, and acceptance criteria phrased as browser-observable behavior
(not "it compiles"). This prevented the AI from proposing patterns incompatible with the stack.

**Iteration cycle:** Generate → human review → approve or correct → apply to code if needed → commit.
No commit was made without human review. The most common corrections were Playwright selectors (T24),
the `active` field handling in the mapper (real bug), and the `onSuccess` merge strategy in the store.

**When I wrote code manually:** Architecture decisions (choosing Tailwind over Material, including all bonus),
the LATAM design tokens, and bug fixes requiring understanding of the interaction between the store
and the component lifecycle (the `load()` guard in `UserDetailComponent`).
