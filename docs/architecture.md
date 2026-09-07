# Math Tools Architecture

Read `CONTEXT.md` first for product vocabulary and rules. This document describes the current intended application structure; update it whenever implementation changes a module boundary or system-wide data flow.

## System shape

Math Tools is a modular React monolith with one build, router, application shell, PWA, and design system. Developer-authored cases are isolated modules behind a shared case-definition interface. The application provides explicit extension points without introducing a general plugin runtime or universal visualization DSL.

The approved tooling is TypeScript, React, Vite, pnpm, Vitest, Testing Library, Playwright, and Three.js through React Three Fiber. Application scaffolding pins a stable Node LTS.

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
├── styles/           design tokens, global styles, and large-screen layout
└── test/            cross-module test utilities and case contract tests
```

## Case extension point

The registry loads lightweight metadata eagerly. A case definition owns its stable identifier, route metadata, classification, teaching objective, guidance, validated defaults, URL codec, declared capabilities, runtime component entry point, and teaching-review criteria. The runtime is a `React.lazy` wrapper created at module scope in the case definition, so metadata stays in the main bundle while the runtime code splits into its own chunk and loads only after its route is selected.

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

**Not yet implemented** — the service worker, offline caching, and GitHub Pages deployment are deferred to the fourth milestone deliverable. The target design follows.

The output is a static PWA deployable to GitHub Pages under a configurable repository base path. The service worker caches same-origin versioned application assets and built-in case resources. A successful initial visit enables later offline use. There is no runtime API dependency. Update handling prevents incompatible asset versions from being silently mixed and offers a controlled refresh.

## Failure handling

The application shell handles boot and routing failures. Each case has a local error boundary so one failure cannot break the library or other cases. Invalid external URL values do not reach mathematical logic unchecked. Recovery UI is in Chinese and offers retry when meaningful, reset to defaults, or return to the library. Offline recovery distinguishes a resource that was never cached from a case runtime failure. Never silently display a mathematically misleading fallback or expose stack traces to teachers.

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
