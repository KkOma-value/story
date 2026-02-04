<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Repo Guide for Coding Agents

This repo contains:
- `backend/`: Django + Django REST Framework API
- `frontend/`: React + TypeScript + Vite UI
- `openspec/`: spec-driven change proposals (see managed block above)

Prefer the smallest change that fixes the issue. Follow existing patterns in nearby files.

## Commands (Build/Lint/Test)

### Frontend (Vite + React)
Run commands from `frontend/`.

- Install: `npm install`
- Dev server: `npm run dev` (serves on `http://localhost:5173`)
- Build: `npm run build` (runs `tsc -b` then `vite build`)
- Lint: `npm run lint` (runs `eslint .`)
- Test (CI): `npm test` (alias for `vitest run`)
- Test (watch): `npm run test:watch` (alias for `vitest`)

**Run a single frontend test** (Vitest):
- By file: `npx vitest run src/test/auth.test.ts`
- By test name: `npx vitest run -t "should store and retrieve token"`

### Backend (Django)
Run commands from `backend/`. The project uses a local virtualenv in `backend/venw/`.

- Activate venv (PowerShell): `./venw/Scripts/Activate.ps1`
- Install deps: `pip install -r requirements.txt`
- Migrate DB: `python manage.py migrate`
- Run server: `python manage.py runserver 0.0.0.0:8000`
- Run tests: `python manage.py test`

**Run a single backend test** (Django test runner):
- By app: `python manage.py test core`
- By module: `python manage.py test core.tests`
- By class: `python manage.py test core.tests.PaginationTests`
- By method: `python manage.py test core.tests.PaginationTests.test_paginate_basic`

## API/Dev Notes

- Backend base path: `http://127.0.0.1:8000/api`
- Frontend dev proxy is configured in `frontend/vite.config.ts` to forward `/api/*` to `http://127.0.0.1:8000`.
- Frontend can switch API mode via env:
  - `VITE_API_MODE=real` (default) uses the proxy/backend
  - `VITE_API_MODE=mock` uses local mock data

## Code Style (Project Conventions)

### JavaScript/TypeScript (frontend)

Formatting is enforced by Prettier config in `frontend/.prettierrc`:
- `semi: false`
- `singleQuote: true`
- `trailingComma: es5`
- `tabWidth: 2`
- `printWidth: 100`

Linting is via `frontend/eslint.config.js` (flat config) using:
- `@eslint/js` recommended
- `typescript-eslint` recommended
- `eslint-plugin-react-hooks` recommended
- `eslint-plugin-react-refresh` (vite preset)

Guidelines:
- Imports: group external imports first, then local. Keep relative imports (`../`) consistent.
- Components: React components in `PascalCase`, files typically `PascalCase.tsx`.
- Hooks: custom hooks start with `use*` (see `frontend/src/hooks/useAuth.tsx`).
- Types: prefer `type` for unions/aliases and `interface` when extending shapes across modules; be consistent within a file.
- Error handling: API calls should surface backend `{ success, message, data }` messages. Axios interceptor in `frontend/src/api/http.ts` maps backend `message` onto `err.message` and redirects on 401.
- Avoid `any`; if unavoidable, isolate it at the boundary (API layer) and convert to typed objects.

### Python (backend)

Observed patterns in backend:
- Files commonly start with `from __future__ import annotations`.
- Import order: stdlib, then Django/third-party, then local apps (see `backend/users/api_auth.py`).
- Types: use modern typing (e.g., `Response | None`) and `typing.Any` where needed.
- Naming:
  - Functions: `snake_case`
  - Classes: `PascalCase`
  - Private helpers: prefix `_` (e.g., `_email_code_cache_key`)
  - URL params use `camelCase` in path converters (e.g., `novelId`) because frontend expects those names.

Error handling / responses:
- Prefer returning a consistent API envelope via `backend/core/responses.py`:
  - `api_ok(data=None, message="OK", status=200)`
  - `api_error(message, status=400)`
- DRF exception handler is customized via `backend/core/exception_handler.py` and returns `{ success: False, message, data: None }`.
- For auth/permission failures, use appropriate HTTP status codes (`401`, `403`, `409`, etc.).

### General
- Make changes locally narrow and easy to review.
- Add tests when changing behavior (Vitest for frontend, Django tests for backend).

## Cursor/Copilot Rules

- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` were found in this repo.
