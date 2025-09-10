# Repository Guidelines

## Project Structure & Module Organization
- Root: documentation in `resource/` (architecture, plans, provider guides).
- App: Next.js project lives in `project-apex/`.
  - `app/` App Router (routes, layouts, pages).
  - `public/` static assets.
  - `.next/` build output (ignored).
  - Config: `package.json`, `tsconfig.json`, `eslint.config.mjs`.
- Path alias: import app code via `@/*` (see `tsconfig.json`).

## Build, Test, and Development Commands
- Local dev: `cd project-apex && npm run dev`
  - Runs Next.js in dev mode (Turbopack) with HMR.
- Build: `cd project-apex && npm run build`
  - Creates production build into `.next/`.
- Start: `cd project-apex && npm run start`
  - Serves the production build.
- Lint: `cd project-apex && npm run lint`
  - Uses ESLint with Next + TypeScript rules.

## Coding Style & Naming Conventions
- Language: TypeScript (`strict: true`).
- Indentation: 2 spaces; no trailing whitespace; keep lines concise.
- Components: PascalCase filenames (`MyWidget.tsx`).
- Variables/functions: camelCase; constants UPPER_SNAKE_CASE.
- Routes: Next App Router folder conventions (e.g., `app/api/ping/route.ts`).
- Imports: prefer `@/*` alias over relative chains.

## Testing Guidelines
- No formal test runner is configured yet.
- When adding tests, colocate by domain (e.g., `lib/**/__tests__/*.test.ts`) and cover core logic first.
- Prefer Vitest + React Testing Library for unit/UI tests; keep fast, deterministic tests.

## Commit & Pull Request Guidelines
- Commits: concise, imperative subject; reference scope when useful.
  - Example: `feat(chat): add minimal /api/chat route`.
- PRs must include: purpose, linked issues, screenshots or logs, and clear test steps.
- Keep changes scoped; avoid unrelated refactors.

## Security & Configuration Tips
- Do not commit secrets. Use `project-apex/.env.local` for keys (e.g., `OPENROUTER_API_KEY`).
- Server-only secrets must be read on server routes (Node runtime), never shipped to the client.
- Large artifacts (`.next/`, `node_modules/`) remain ignored.

## Architecture Notes
- The app targets a modular design: `providers` (LLM/VLM/OCR) vs `services` (business orchestration).
- See `resource/architecture.md`, `resource/provider.md`, and `resource/e2b_llm_interaction_guide.md` for agent/E2B integration details.

