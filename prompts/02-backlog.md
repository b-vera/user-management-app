# Prompt 02 — Backlog de desarrollo

## Goal

Turn the architecture decisions into a sequenced, incremental task list with acceptance criteria observable from the browser — not from the compiler.

## Prompt sent

```
Tenés la arquitectura definida (ver ARCHITECTURE.md adjunto).
Generá un backlog de desarrollo incremental de 20-25 tareas que:
- Partan de un scaffold limpio de Angular CLI
- Construyan el proyecto capa por capa: Setup → Core → Store → Shared → i18n → Features → Quality → Tests → E2E → Docs
- Cada tarea tenga: Objetivo, Archivos involucrados, Dependencias, y Criterios de aceptación
- Los criterios de aceptación sean observables en el browser o en la terminal (no "compila sin errores")
- Los commit messages sigan Conventional Commits
```

## What I accepted

- 25 tasks, phased exactly as requested.
- Each task with: Objetivo, Archivos, Dependencias, Criterios de aceptación.
- Criteria phrased as behaviour ("toast appears", "badge changes") not as compiler output.
- Conventional Commits format with scopes.

## What I modified

- Added explicit constraint: **human code review before each commit**. The AI left this implicit.
- Renamed directory from `fe-challenge` (AI suggestion) to `user-management-app`.

## What I discarded

- Nothing in this session.
