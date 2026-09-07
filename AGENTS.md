# Math Tools

Math Tools is a simplified-Chinese, browser-based collection of interactive demonstrations for primary-school mathematics classrooms. Read `CONTEXT.md` before changing product behavior or terminology. Read `docs/architecture.md` before adding a case or changing application structure.

## Project stage

The repository is establishing its first-release foundation. Prefer the simplest design that supports the three representative cases. Do not add foundations for accounts, classroom synchronization, analytics, AI generation, a general editor, or a universal visualization DSL.

## Repository layout

Directories are created when their first real occupant arrives; `src/visualization/` stays empty until a second case proves a shared visual need.

```text
src/app/             application bootstrap, routing, and global recovery
src/cases/           independently runnable mathematical cases
src/core/cases/      case contract, registry, codecs, and loading
src/features/        library, details, and presentation features
src/components/      reusable classroom UI
src/visualization/   proven shared visualization helpers
src/content/         Chinese copy and classification vocabulary
src/styles/          design tokens and global layout
src/test/            shared test support and contract tests
docs/architecture.md current system architecture
docs/adr/             durable architecture decisions
```

## Commands

These commands are defined in `package.json` and must keep working. Do not claim a command passed unless it was run in the current turn.

```sh
pnpm install
pnpm dev
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm test:e2e
```

`pnpm test:e2e` requires Playwright browsers: run `pnpm exec playwright install chromium` once per machine.

## Engineering rules

- Node 24 LTS is pinned in `.nvmrc` and the `engines` field of `package.json`.
- Use TypeScript strict mode. Avoid `any`; validate data at URL, persistence, and other untyped boundaries.
- Keep mathematical logic independent of React and rendering wherever practical.
- Use SVG for ordinary 2D diagrams, Canvas for dense continuous drawing, and React Three Fiber for Three.js scenes.
- Introduce a shared abstraction only after multiple real cases demonstrate the same stable need.
- Preserve the modular-monolith dependency direction documented in `docs/architecture.md`.
- Keep simplified-Chinese interface copy and classification terms in `src/content/`, not scattered through application components.
- Cases do not make network requests.
- Cases may not directly access the router or routing, global state, browser persistence, or service worker, including reads or writes. Permitted shell behavior uses typed application-owned interfaces.
- Design key interactions for pointer, touch, and keyboard. Do not use color as the only carrier of mathematical meaning.
- Follow the project-wide UI style in `docs/ui-guidelines.md`; visual values live in `src/styles/tokens.css`.
- Prefer mathematical clarity and classroom readability over decorative effects.

## Case changes

Each new case includes its case definition, runtime implementation, isolated mathematical logic where applicable, unit coverage for mathematical invariants, shared case-contract coverage, interaction coverage, and explicit teaching-review information. Give every case a stable identifier and documented defaults. Keep ephemeral interaction state out of shareable URL state.

## Verification

Run checks that match the changed surface. Documentation-only changes require `git diff --check` and link/path verification. Application behavior changes require focused tests plus typecheck and lint for affected code. Changes to a critical classroom path require the relevant Playwright scenario. Visual changes to stable key scenes require the relevant screenshot check. Do not claim a command passed unless it was run in the current turn.

## Documentation

- Domain language, users, product rules, and non-goals belong in `CONTEXT.md`.
- Current module ownership and data flow belong in `docs/architecture.md`.
- The UI style guide belongs in `docs/ui-guidelines.md`; token values in `src/styles/tokens.css`.
- Long-lived architecture decisions belong in `docs/adr/`.
- Update affected documentation in the same change as behavior.
- Documentation describes current facts and durable rationale, not the discussion that produced them.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for `li-lance/math-tools`. See `docs/agents/issue-tracker.md`.

### Triage labels

The repository uses the five default triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository. See `docs/agents/domain.md`.
