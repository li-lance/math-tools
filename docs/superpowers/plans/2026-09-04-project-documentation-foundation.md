# Project Documentation Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish `CONTEXT.md`, `docs/architecture.md`, and an expanded `AGENTS.md` as the authoritative product, architecture, and Agent guidance for Math Tools.

**Architecture:** The documentation is split by responsibility: stable domain language and product rules live in `CONTEXT.md`, current technical structure and extension rules live in `docs/architecture.md`, and concise operational instructions live in `AGENTS.md`. `CLAUDE.md` remains a symbolic link to `AGENTS.md`, while the existing `docs/agents/` tracker configuration remains unchanged.

**Tech Stack:** Markdown, Git, `rg`, POSIX shell checks

## Global Constraints

- The product is a browser-based collection of interactive demonstrations for primary-school mathematics classrooms in mainland China.
- The first milestone contains a case framework plus a 3D geometry case, draggable number-line case, and fraction-partition case.
- The implementation stack is TypeScript, React, Vite, pnpm, Vitest, Testing Library, Playwright, Three.js, and React Three Fiber; pin the stable Node LTS during application scaffolding.
- The application is a modular monolith with developer-authored cases registered through a common case definition and loaded on demand.
- The production target is a static PWA on GitHub Pages that supports previously loaded built-in cases offline.
- The first release requires no account or backend and collects no usage analytics, cookies, or student data.
- The first release uses simplified Chinese and general mainland-China primary-school mathematics terminology.
- Pointer and touch are first-class inputs; keyboard access is required for key actions.
- Cases may not directly access the network, routing, global state, browser persistence, or the service worker, including reads or writes; they must use typed application-owned interfaces for permitted behavior.
- Do not claim that pnpm application commands work before the application scaffold exists.
- Preserve the existing Issue tracker, Triage labels, and Domain docs sections in `AGENTS.md`.
- Preserve `CLAUDE.md` as a symbolic link to `AGENTS.md`.
- Source of truth for all prose is `docs/superpowers/specs/2026-09-04-math-tools-foundation-design.md`.

---

### Task 1: Define the product domain and vocabulary

**Files:**
- Create: `CONTEXT.md`
- Reference: `docs/superpowers/specs/2026-09-04-math-tools-foundation-design.md`
- Reference: `docs/agents/domain.md`

**Interfaces:**
- Consumes: the approved foundation design and the single-context layout declared in `docs/agents/domain.md`
- Produces: the canonical definitions of `case`, `case definition`, `teaching parameter`, `ephemeral state`, and `device preference` used verbatim by architecture and Agent guidance

- [ ] **Step 1: Confirm the target does not already contain user work**

Run:

```sh
test ! -e CONTEXT.md
```

Expected: exit status 0. If the file exists, stop and reconcile its content instead of overwriting it.

- [ ] **Step 2: Create the domain document**

Create `CONTEXT.md` with these exact sections and facts:

```markdown
# Math Tools Context

## Product mission

Math Tools is a browser-based collection of interactive demonstrations for primary-school mathematics classrooms in mainland China. It helps a teacher make an abstract mathematical idea visible and manipulable on a computer, projector, or interactive teaching display.

Mathematical clarity, classroom readability, and avoiding misleading representations take priority over decorative motion.

## Users and classroom setting

The primary user is a primary-school mathematics teacher. The teacher finds and prepares a case, then controls it during class. Students primarily watch and may interact directly with the shared teaching display. The primary hardware target is a teacher computer connected to a 16:9 projector or teaching display. Pointer and touch are first-class inputs, and key actions must also be usable with a keyboard.

## Domain vocabulary

### Case

A case is an independently runnable, interactive mathematics demonstration with a stated teaching objective, controlled parameters, and bounded interaction. A case is not a worksheet question, video, slide deck, or general-purpose document.

### Case definition

A case definition is the discoverable description and runtime entry point for a case. It provides a stable identity and route, Chinese metadata, classification, teaching guidance, validated defaults, URL state behavior, declared capabilities, a lazy runtime entry point, and teaching-review criteria.

### Teaching parameter

A teaching parameter is a mathematically meaningful state a teacher may want to reproduce, such as a fraction denominator, number-line interval, or solid's unfolding state. Supported teaching parameters may be represented in the URL.

### Ephemeral state

Ephemeral state records momentary interaction such as hover, an animation frame, or an intermediate camera drag. It remains inside a case and is not represented in the URL.

### Device preference

A device preference controls the local presentation environment rather than mathematical meaning. The application may store it locally through its settings service, but cases do not access browser persistence directly.

## Product experience

Teachers browse a searchable and filterable case library, read a case detail page, and enter a full-screen presentation through a stable URL. The mathematical stage occupies most of the presentation view. A large bottom control bar contains common actions and may be collapsed. Advanced case parameters use an expandable panel.

## First milestone

The first milestone establishes the case framework and three representative cases: a 3D geometry case, a draggable number-line case, and a fraction-partition case. They validate 3D, 2D direct manipulation, and parameterized discrete visual models. They do not represent complete curriculum coverage.

## Product rules

- Built-in cases are curated and implemented by developers through one case-definition interface.
- A case exposes bounded interactions that serve its teaching objective.
- No account or backend is required.
- A successful first load makes built-in cases available offline.
- Shareable teaching parameters may be encoded in the URL; ephemeral state is not.
- Device preferences may be stored locally through application-owned services.
- The first release uses simplified Chinese and general mainland-China primary-school mathematics terminology without binding to one textbook edition.
- The product collects no usage analytics, cookies, or student data.
- Cases do not make network requests.
- Key interactions support pointer, touch, and keyboard input.
- Mathematical distinctions are not communicated by color alone.

## Quality principles

Mathematical logic is tested independently from rendering wherever practical. Automated tests cover mathematical invariants, case contracts, interactions, and critical browser flows. Every case also receives a human teaching review covering its objective, terminology, parameter validity, readability, usability, and risk of visual or mathematical misinterpretation.

## Non-goals for the first release

- A general case or slide editor
- AI-generated cases
- Teacher, student, class, or school accounts
- Cloud persistence or cross-device synchronization
- Student-device participation or real-time rooms
- Assessment, grades, or learning analytics
- Third-party analytics or tracking
- Complete coverage of one textbook or the grades one-through-six curriculum
- A native desktop application
- A universal visualization DSL
- A content-management publishing workflow
```

- [ ] **Step 3: Verify domain terminology and scope**

Run:

```sh
rg -n '^## (Product mission|Users and classroom setting|Domain vocabulary|Product experience|First milestone|Product rules|Quality principles|Non-goals for the first release)$' CONTEXT.md
rg -n '^### (Case|Case definition|Teaching parameter|Ephemeral state|Device preference)$' CONTEXT.md
! rg -n 'T[B]D|T[O]DO|F[I]XME|X[X]X' CONTEXT.md
git diff --check -- CONTEXT.md
```

Expected: all eight level-two headings and five vocabulary headings are found; the placeholder scan prints nothing; `git diff --check` prints nothing.

- [ ] **Step 4: Commit the domain document**

```sh
git add CONTEXT.md
git diff --cached --check
git commit -m "docs: define Math Tools domain"
```

Expected: one commit containing only `CONTEXT.md`.

---

### Task 2: Document the modular application architecture

**Files:**
- Create: `docs/architecture.md`
- Read: `CONTEXT.md`
- Reference: `docs/superpowers/specs/2026-09-04-math-tools-foundation-design.md`

**Interfaces:**
- Consumes: the domain vocabulary defined by Task 1
- Produces: ownership and dependency rules for `src/app`, `src/cases`, `src/core/cases`, `src/features`, `src/components`, `src/visualization`, `src/content`, `src/styles`, and `src/test`; the state and loading protocol later summarized by `AGENTS.md`

- [ ] **Step 1: Confirm the target does not already contain user work**

Run:

```sh
test ! -e docs/architecture.md
```

Expected: exit status 0. If the file exists, stop and reconcile its content instead of overwriting it.

- [ ] **Step 2: Create the architecture document**

Create `docs/architecture.md` with the following required section structure and statements:

````markdown
# Math Tools Architecture

Read `CONTEXT.md` first for product vocabulary and rules. This document describes the current intended application structure; update it whenever implementation changes a module boundary or system-wide data flow.

## System shape

Math Tools is a modular React monolith with one build, router, application shell, PWA, and design system. Developer-authored cases are isolated modules behind a shared case-definition interface. The application provides explicit extension points without introducing a general plugin runtime or universal visualization DSL.

## Source layout

```text
src/
├── app/             application bootstrap, routing, pages, global error handling
├── cases/           one isolated directory per interactive case
├── core/
│   └── cases/       case definition, registry, state codecs, and loading protocol
├── features/        library, filtering, details, and presentation features
├── components/      reusable classroom UI and accessible controls
├── visualization/   shared 2D/3D adapters and visual helpers
├── content/         centralized Chinese UI copy and classification vocabulary
├── styles/          design tokens, global styles, and large-screen layout
└── test/            cross-module test utilities and case contract tests
```

## Case extension point

The registry loads lightweight metadata eagerly and dynamically imports a case runtime only after its route is selected. A case definition owns its stable identifier, route metadata, classification, teaching objective, guidance, validated defaults, URL codec, declared capabilities, lazy component entry point, and teaching-review criteria.

Cases own their mathematical logic and rendering. They do not import other cases. They may not directly access routing, global application state, browser persistence, or the service worker, including reads or writes, and they do not make network requests. They request permitted shell behavior through typed application-owned interfaces.

## Rendering choices

Use SVG for ordinary 2D diagrams, Canvas for dense continuous drawing, and Three.js through React Three Fiber for 3D scenes. Share coordinates, labels, colors, gestures, or controls only after multiple real cases establish a stable common need. Do not force SVG, Canvas, and Three.js behind one rendering abstraction.

## Presentation state flow

1. The router parses the stable case identifier and URL parameters.
2. The registry resolves the case definition.
3. The case codec validates recognized parameters and supplies documented defaults or an explicit recovery result.
4. The application lazy-loads the runtime component.
5. The presentation shell supplies controlled teaching state and common actions.
6. Teaching-parameter changes replace URL state without adding a browser-history entry for every drag update.

Ephemeral state stays in the case. Device preferences go through the application settings service to `localStorage`. Every case provides a reset to documented defaults.

## Presentation shell

The stage occupies most of the viewport. A touch-friendly bottom bar provides back, reset, full-screen, help, and case controls and can be collapsed or restored by pointer, touch, or keyboard. Advanced parameters use an expandable panel. Three-dimensional cases provide a reset-view action and constrain camera freedom when necessary for the teaching objective.

## Offline delivery

The output is a static PWA deployable to GitHub Pages under a configurable repository base path. The service worker caches same-origin versioned application assets and built-in case resources. A successful initial visit enables later offline use. Update handling prevents incompatible asset versions from being silently mixed and offers a controlled refresh.

## Failure handling

The application shell handles boot and routing failures. Each case has a local error boundary so one failure cannot break the library or other cases. Invalid external URL values do not reach mathematical logic unchecked. Recovery UI is in Chinese and offers retry when meaningful, reset to defaults, or return to the library. Never silently display a mathematically misleading fallback.

## Accessibility and classroom visibility

Use large text and targets, sufficient contrast, visible keyboard focus, semantic control labels, and reduced-motion behavior. Never communicate a mathematical distinction by color alone. Key actions support pointer, touch, and keyboard. Cases include a textual objective, operating guidance, and a current-parameter summary where the visualization cannot be represented fully through nonvisual semantics.

## Testing

- Unit tests cover pure mathematical rules, boundaries, and invariants.
- Case-contract tests cover metadata, identifier uniqueness, defaults, URL round trips, and capability declarations.
- Component tests cover interactions and equivalent input paths.
- Playwright covers the library-to-presentation path and representative keyboard and offline behavior.
- Stable key scenes use screenshot regression, but screenshots do not establish mathematical correctness.
- Human teaching review covers objective, terminology, parameter validity, readability, usability, and misleading representations.

## Where new behavior goes

| Goal | Location |
| --- | --- |
| Add a mathematical demonstration | `src/cases/<case-id>/` plus registry entry |
| Change case discovery or detail pages | `src/features/` |
| Change routing, application boot, or global recovery | `src/app/` |
| Change the case contract, registry, or URL state protocol | `src/core/cases/` |
| Add a proven cross-case visual primitive | `src/visualization/` |
| Add a reusable classroom control | `src/components/` |
| Change Chinese interface copy or classification terms | `src/content/` |
| Change global visual tokens or presentation layout | `src/styles/` |
| Record a durable architecture decision | `docs/adr/` |

## Dependency direction

Cases depend on the case contract and explicitly shared UI or visualization modules. The shell depends on definitions and registry metadata, not case internals. Shared modules never import concrete cases. Pure mathematical modules do not depend on React or a renderer.
````

- [ ] **Step 3: Verify structure and architecture invariants**

Run:

```sh
rg -n '^## (System shape|Source layout|Case extension point|Rendering choices|Presentation state flow|Presentation shell|Offline delivery|Failure handling|Accessibility and classroom visibility|Testing|Where new behavior goes|Dependency direction)$' docs/architecture.md
rg -n 'do not make network requests|dynamically imports|GitHub Pages|local error boundary|URL round trips' docs/architecture.md
! rg -n 'T[B]D|T[O]DO|F[I]XME|X[X]X' docs/architecture.md
git diff --check -- docs/architecture.md
```

Expected: all twelve headings and all five architecture invariants are found; the placeholder scan and diff check print nothing.

- [ ] **Step 4: Commit the architecture document**

```sh
git add docs/architecture.md
git diff --cached --check
git commit -m "docs: document Math Tools architecture"
```

Expected: one commit containing only `docs/architecture.md`.

---

### Task 3: Expand the Agent entry point

**Files:**
- Modify: `AGENTS.md`
- Verify, do not modify: `CLAUDE.md`
- Read: `CONTEXT.md`
- Read: `docs/architecture.md`

**Interfaces:**
- Consumes: Task 1 domain definitions and Task 2 architectural placement rules
- Produces: the concise repository entry point all future Agents follow; preserves links to `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`, and `docs/agents/domain.md`

- [ ] **Step 1: Capture and validate the existing Agent configuration**

Run:

```sh
test -f AGENTS.md
test -L CLAUDE.md
test "$(readlink CLAUDE.md)" = 'AGENTS.md'
rg -n '^## Agent skills$|^### Issue tracker$|^### Triage labels$|^### Domain docs$' AGENTS.md
```

Expected: all commands pass and the existing configuration headings are present.

- [ ] **Step 2: Expand `AGENTS.md` without removing its existing configuration**

Place the following content before the existing `## Agent skills` section. Do not duplicate or rewrite the existing section.

````markdown
# Math Tools

Math Tools is a simplified-Chinese, browser-based collection of interactive demonstrations for primary-school mathematics classrooms. Read `CONTEXT.md` before changing product behavior or terminology. Read `docs/architecture.md` before adding a case or changing application structure.

## Project stage

The repository is establishing its first-release foundation. Prefer the simplest design that supports the three representative cases. Do not add foundations for accounts, classroom synchronization, analytics, AI generation, a general editor, or a universal visualization DSL.

## Intended repository layout

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

## Intended commands

These commands are the required top-level contract once the application scaffold exists. Do not report them as available before `package.json` defines them.

```sh
pnpm install
pnpm dev
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm test:e2e
```

## Engineering rules

- Use TypeScript strict mode. Avoid `any`; validate data at URL, persistence, and other untyped boundaries.
- Keep mathematical logic independent of React and rendering wherever practical.
- Use SVG for ordinary 2D diagrams, Canvas for dense continuous drawing, and React Three Fiber for Three.js scenes.
- Introduce a shared abstraction only after multiple real cases demonstrate the same stable need.
- Preserve the modular-monolith dependency direction documented in `docs/architecture.md`.
- Keep simplified-Chinese interface copy and classification terms in `src/content/`, not scattered through application components.
- Cases must not directly access the network, router, global state, browser persistence, or service worker, including reads or writes; they must use typed application-owned interfaces for permitted behavior.
- Design key interactions for pointer, touch, and keyboard. Do not use color as the only carrier of mathematical meaning.
- Prefer mathematical clarity and classroom readability over decorative effects.

## Case changes

Each new case includes its case definition, runtime implementation, isolated mathematical logic where applicable, unit coverage for mathematical invariants, shared case-contract coverage, interaction coverage, and explicit teaching-review information. Give every case a stable identifier and documented defaults. Keep ephemeral interaction state out of shareable URL state.

## Verification

Run checks that match the changed surface. Documentation-only changes require `git diff --check` and link/path verification. Application behavior changes require focused tests plus typecheck and lint for affected code. Changes to a critical classroom path require the relevant Playwright scenario. Visual changes to stable key scenes require the relevant screenshot check. Do not claim a command passed unless it was run in the current turn.

## Documentation

- Domain language, users, product rules, and non-goals belong in `CONTEXT.md`.
- Current module ownership and data flow belong in `docs/architecture.md`.
- Long-lived architecture decisions belong in `docs/adr/`.
- Update affected documentation in the same change as behavior.
- Documentation describes current facts and durable rationale, not the discussion that produced them.
````

- [ ] **Step 3: Verify the complete documentation set**

Run:

```sh
test -f CONTEXT.md
test -f docs/architecture.md
test -f AGENTS.md
test -L CLAUDE.md
test "$(readlink CLAUDE.md)" = 'AGENTS.md'
test "$(rg -c '^## Agent skills$' AGENTS.md)" = '1'
rg -n '^## (Project stage|Intended repository layout|Intended commands|Engineering rules|Case changes|Verification|Documentation|Agent skills)$' AGENTS.md
rg -n 'docs/agents/(issue-tracker|triage-labels|domain)\.md' AGENTS.md
! rg -n 'T[B]D|T[O]DO|F[I]XME|X[X]X' AGENTS.md CONTEXT.md docs/architecture.md
git diff --check -- AGENTS.md CONTEXT.md docs/architecture.md
```

Expected: every command exits 0; the eight required Agent headings and all three existing configuration links are found; the placeholder scan and diff check print nothing.

- [ ] **Step 4: Review the three documents for duplicated authority**

Run:

```sh
rg -n '^## |^### ' AGENTS.md CONTEXT.md docs/architecture.md
```

Expected: `CONTEXT.md` owns domain definitions, `docs/architecture.md` owns detailed module/data-flow rules, and `AGENTS.md` contains only concise navigation and operational constraints. Remove accidental long-form duplication before committing.

- [ ] **Step 5: Commit the Agent entry point**

```sh
git add AGENTS.md
git diff --cached --check
git commit -m "docs: expand repository agent guidance"
```

Expected: one commit containing only `AGENTS.md`; `CLAUDE.md` remains an unchanged symbolic link.

---

### Task 4: Final cross-document verification

**Files:**
- Verify: `AGENTS.md`
- Verify: `CLAUDE.md`
- Verify: `CONTEXT.md`
- Verify: `docs/architecture.md`
- Verify unchanged: `docs/agents/issue-tracker.md`
- Verify unchanged: `docs/agents/triage-labels.md`
- Verify unchanged: `docs/agents/domain.md`

**Interfaces:**
- Consumes: all documentation created by Tasks 1–3
- Produces: evidence that the repository has one coherent documentation entry path and no uncommitted implementation residue

- [ ] **Step 1: Run the complete documentation gate**

```sh
set -eu
test -f AGENTS.md
test -L CLAUDE.md
test "$(readlink CLAUDE.md)" = 'AGENTS.md'
test -f CONTEXT.md
test -f docs/architecture.md
test -f docs/agents/issue-tracker.md
test -f docs/agents/triage-labels.md
test -f docs/agents/domain.md
test "$(rg -c '^## Agent skills$' AGENTS.md)" = '1'
rg -n 'CONTEXT\.md|docs/architecture\.md' AGENTS.md
rg -n 'Case definition|Teaching parameter|Ephemeral state|Device preference' CONTEXT.md
rg -n 'Case extension point|Presentation state flow|Where new behavior goes|Dependency direction' docs/architecture.md
! rg -n 'T[B]D|T[O]DO|F[I]XME|X[X]X' AGENTS.md CONTEXT.md docs/architecture.md
git diff --check HEAD~3..HEAD
git status --short
```

Expected: all assertions pass, required terms and links are printed, no placeholder matches are printed, `git diff --check` prints nothing, and `git status --short` prints nothing.

- [ ] **Step 2: Inspect the three implementation commits**

```sh
git log -3 --oneline --decorate
git show --stat --oneline HEAD~2..HEAD
```

Expected: three focused commits appear in order for domain context, architecture, and Agent guidance; their file sets match the tasks above.
