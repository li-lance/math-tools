# Math Tools Foundation Design

## Purpose

Math Tools is a browser-based collection of interactive demonstrations for primary-school mathematics classrooms in mainland China. A teacher opens a curated case, adjusts controlled parameters, and presents the mathematical idea on a computer, projector, or interactive teaching display. Students primarily watch but may also interact directly with the shared display.

This design defines the product and engineering foundation that will be recorded in `AGENTS.md`, `CONTEXT.md`, and `docs/architecture.md`. It also fixes the scope of the first implementation milestone. It does not define a general lesson-authoring system or a complete primary-school curriculum.

## Decisions

- Ship a curated built-in case library. Preserve a path toward editable templates or AI assistance without building either now.
- Implement cases as developer-authored modules registered through a common definition interface.
- Use a modular React application with explicit case extension points rather than independent mini-apps or a universal visualization DSL.
- Use TypeScript, React, Vite, pnpm, Vitest, Testing Library, and Playwright. Use the stable Node LTS selected and pinned during project scaffolding.
- Prefer SVG for ordinary 2D diagrams, Canvas for dense continuous drawing, and Three.js through React Three Fiber for 3D cases.
- Deliver a static PWA on GitHub Pages. Once loaded successfully, built-in cases remain usable without a network connection.
- Require no account or backend. Collect no usage analytics, cookies, or student data.
- Use simplified Chinese and general mainland-China primary-school mathematics terminology without binding the first release to one textbook edition.

## Users and classroom setting

The primary user is a primary-school mathematics teacher. The teacher discovers and prepares a case, then controls it during class. Students view the projected content and may approach an interactive display to manipulate it. Individual student devices, synchronized classroom sessions, accounts, classes, and achievement tracking are outside the first-release scope.

The primary hardware target is a teacher computer connected to a 16:9 projector or teaching display. Both pointer and touch input are first-class. Keyboard access is required for key actions. Phones only need a functional fallback; the first release does not optimize complex demonstrations for small screens.

## Domain model

A **case** is an independently runnable, interactive mathematics demonstration with a stated teaching objective, controlled parameters, and bounded interaction. A case is not a worksheet question, video, slide deck, or general-purpose document.

A **case definition** is the discoverable description and runtime entry point for a case. It owns:

- a stable identifier and route;
- a simplified-Chinese title and summary;
- grade, mathematical-topic, and capability tags;
- teaching objectives and operating guidance;
- default parameters and parameter validation;
- URL encoding and decoding for shareable teaching state;
- declared rendering or interaction capabilities;
- a lazy runtime component entry point;
- human teaching-review criteria.

A **teaching parameter** changes a mathematically meaningful state that a teacher may want to reproduce, such as a fraction denominator, a number-line interval, or a solid's unfolding state. Teaching parameters may be represented in the URL.

An **ephemeral state** captures momentary interaction, such as pointer hover, an animation frame, or an intermediate camera drag. It remains inside the case and is not represented in the URL.

A **device preference** controls the local presentation environment, such as sound or presentation display preferences. It may be stored in `localStorage` through an application-owned settings service.

## First milestone

The first milestone establishes the case framework and delivers three representative cases:

1. A 3D geometry case that supports spatial understanding through controlled rotation, zoom, unfolding, sections, auxiliary lines, or labels as appropriate to its final lesson objective.
2. A draggable number-line case that validates accessible 2D direct manipulation and numeric parameter behavior.
3. A fraction-partition case that validates discrete visual models, controlled parameter changes, and mathematical invariants.

These are architecture-validation samples, not a promise of complete curriculum coverage. The product may eventually cover grades one through six through a limited set of high-value foundational tools.

## User experience

The primary navigation flow is:

1. Browse the case library using grade, topic, and capability filters or search.
2. Open a case detail view to understand its teaching objective and operation.
3. Enter a full-screen presentation view through the case's stable URL.

The presentation view gives most of the viewport to the mathematical stage. A large, touch-friendly control bar sits at the bottom and can be collapsed or restored with a visible action and keyboard shortcut. Common shell actions include back, reset, full screen, and help. Advanced case parameters use an expandable panel. Idle controls may become visually quieter but must not become undiscoverable.

Cases expose only interactions that serve their teaching objective. A 3D case provides a reset-view action and constrains freedom where unlimited camera movement would weaken the explanation. Mathematical clarity and classroom readability take priority over decorative motion.

## Application architecture

The application is a modular monolith with one build, router, application shell, PWA, and design system. Cases are isolated modules behind a common interface. This preserves consistent behavior while allowing each case to choose the rendering technology appropriate to its mathematics.

The intended source layout is:

```text
src/
├── app/             application bootstrap, routing, pages, global error handling
├── cases/           one isolated directory per interactive case
├── core/
│   └── cases/       CaseDefinition, registry, state codecs, and loading protocol
├── features/        library, filtering, details, and presentation features
├── components/      reusable classroom UI and accessible controls
├── visualization/   shared 2D/3D adapters and visual helpers
├── content/         centralized Chinese UI copy and classification vocabulary
├── styles/          design tokens, global styles, and large-screen layout
└── test/            cross-module test utilities and case contract tests
```

The case registry loads lightweight metadata eagerly. Runtime implementations and their heavy dependencies load dynamically when a route selects the case. A Three.js case therefore does not add its full runtime cost to the initial library page.

Shared visualization code provides primitives that have demonstrated reuse across real cases, such as coordinates, labels, colors, gestures, and classroom controls. The architecture does not force SVG, Canvas, and Three.js through a single rendering abstraction. A shared abstraction is introduced only after multiple cases demonstrate the same stable need.

## State and data flow

The presentation data flow is:

1. The router parses a stable case identifier and URL parameters.
2. The registry resolves the case definition.
3. The case codec validates recognized parameters, rejects or repairs invalid values according to an explicit policy, and supplies defaults.
4. The application lazy-loads the runtime case component.
5. The presentation shell supplies controlled teaching state and common actions.
6. Changes to shareable teaching parameters replace the current URL state without recording noisy browser-history entries for every drag step.

Opening the same supported URL reproduces the same teaching state, excluding explicitly ephemeral state. Every case offers a reset action that restores its documented defaults. Unknown case identifiers and unrecoverable parameter states show a Chinese recovery screen with routes back to the library or defaults.

No case may directly access routing, global application state, browser persistence, or the service worker, including reads or writes. It requests those behaviors through typed application-owned interfaces. Cases may not make network requests.

## Offline and deployment

The production artifact is a static site deployable to GitHub Pages under the repository subpath. Routing, asset URLs, manifest paths, and service-worker scope must work under that base path and remain configurable for migration to another static host.

The service worker caches same-origin versioned application assets and built-in case resources. A successful initial visit makes those resources available offline. A new deployment must not silently mix incompatible asset versions; the shell detects an available update and offers a controlled refresh. No runtime dependency on an API is allowed.

## Accessibility and classroom visibility

The first release treats these as acceptance requirements:

- large text and touch targets suitable for projection and teaching displays;
- sufficient contrast and a visible keyboard focus indicator;
- no mathematical distinction communicated by color alone;
- pointer, touch, and keyboard paths for key actions;
- semantic labels and understandable control names;
- support for reduced-motion preferences;
- a textual objective, operating guidance, and current-parameter summary where a visualization cannot be fully represented non-visually;
- reset controls for case state and, where relevant, the 3D camera.

The first release does not claim a complete WCAG AA audit for every mathematical visualization. It establishes a non-negotiable accessible foundation and records known limitations rather than hiding them.

## Failure handling

The application shell owns global routing and boot failures. Each case runs inside a local error boundary so a broken case cannot make the library or other cases unavailable. A case load failure produces a Chinese recovery message, a retry where meaningful, a reset-to-default option, and a route back to the library.

Invalid external URL values never reach mathematical logic unchecked. Parameter codecs return validated domain values or explicit recovery results. Failure handling must not silently display a mathematically misleading fallback.

Offline failures distinguish between a resource that was never cached and a case runtime failure. The UI explains what the teacher can do without exposing internal stack traces.

## Quality strategy

Mathematical logic is separated from rendering and tested as pure code wherever practical. Unit tests cover boundary conditions and mathematical invariants. Component tests cover case interactions and input equivalence. Shared case-contract tests validate required metadata, unique identifiers, defaults, URL round trips, and capability declarations. A small Playwright suite covers the library-to-presentation path and representative keyboard and offline behavior. Stable key scenes use screenshot regression to detect unintended visual changes, but screenshots do not prove mathematical correctness.

Every case also passes a human teaching review covering:

- stated objective and intended grade range;
- accepted mathematical terminology;
- validity of defaults, ranges, and displayed results;
- projection readability and touch usability;
- risk that animation, perspective, scaling, color, or labels imply a false mathematical relationship;
- accuracy and completeness of operating guidance.

## Engineering guidance

The repository uses pnpm and a stable Node LTS pinned during scaffolding. The intended top-level command contract is:

```sh
pnpm install
pnpm dev
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm test:e2e
```

These commands become executable requirements when the application is scaffolded. Until then, documentation must label them as the intended command contract rather than claiming they already exist.

TypeScript uses strict mode. Avoid `any`; validate input at URL, persistence, and external-data boundaries. Keep mathematical logic independent of React and rendering where practical. New cases include their definition, runtime implementation, mathematical tests, case-contract coverage, and teaching-review information.

Current architecture belongs in `docs/architecture.md`; domain language and product rules belong in `CONTEXT.md`; concise operational instructions belong in `AGENTS.md`. A long-lived decision that changes architectural constraints receives an ADR under `docs/adr/`. Documentation records current facts and durable rationale, not a transcript of the design discussion.

## Documentation deliverables

The implementation phase updates the existing root `AGENTS.md`, creates root `CONTEXT.md`, and creates `docs/architecture.md`. Root `CLAUDE.md` remains a symbolic link to `AGENTS.md`.

`AGENTS.md` will retain the existing issue-tracker, triage-label, and domain-doc sections. It will add the product pointer, repository layout, intended commands, engineering rules, case rules, testing expectations, and documentation routing.

`CONTEXT.md` will define the product mission, users, classroom setting, domain vocabulary, first milestone, product rules, quality principles, and explicit non-goals.

`docs/architecture.md` will describe the current modular-monolith design, component ownership, case extension point, state flow, rendering choices, offline delivery, error isolation, test layers, and placement guidance for new behavior.

## Explicit non-goals

The first release does not include:

- a general case or slide editor;
- AI-generated cases;
- teacher, student, class, or school accounts;
- cloud persistence or cross-device synchronization;
- student-device participation or real-time rooms;
- assessment, grades, or learning analytics;
- third-party analytics or tracking;
- complete coverage of a textbook or the grades one-through-six curriculum;
- a native desktop application;
- a universal visualization DSL;
- a formal publishing workflow backed by a content-management system.

## Success criteria

The foundation is successful when a teacher can discover each of the three representative cases, understand its purpose, enter a presentation view, manipulate meaningful parameters with mouse or touch, use key actions with a keyboard, share a URL that restores teaching state, reset safely, and reopen previously loaded built-in cases without a network connection. The application must remain navigable if one case fails, and the three cases must pass automated engineering checks plus their documented human teaching reviews.
