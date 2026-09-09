# Composite Match (`composite-match`) Design

## Purpose

A new interactive 3D case for Math Tools that trains spatial visualization. Based on a
classroom worksheet item: a rotatable reference solid built from unit cubes is shown next to
four candidate solids; the student finds the one candidate that is **not** congruent to the
reference (cannot be made to coincide by rotation).

This is the second 3D case (after `cube-net`). It reuses the React Three Fiber + design-token
pattern established by `cube-net`, but introduces a distinct, self-contained mathematical model
for composite solids and congruent-shape recognition.

A case is not a worksheet question (`CONTEXT.md`), so this case is a parameterized, generated
demonstration rather than one fixed item.

## Case identity

- id: `composite-match`
- title: `组合体找不同`
- summary: `旋转观察参照组合体，找出四个选项中与它不同的那一个。`
- grades: `[4, 5, 6]`
- topics: `['shape-and-geometry']`
- capabilities: `['three-3d', 'direct-manipulation', 'parameter-control']`

Teaching objective: by rotating a reference composite solid and comparing against candidates,
recognize which solids are congruent to the reference (rotationally identical) and identify the
one that is not — building mental-rotation and "rotation invariant" intuition.

## URL state and codec

```ts
interface CompositeState {
  level: 1 | 2 | 3;   // difficulty: an index into per-level cube-count ranges
  seed: number;       // deterministic problem instance
}
```

- `level` selects the generation difficulty (see cube-count ranges below).
- `seed` is optional on first load: when absent it falls back to the fixed default `1`, so a fresh
  visitor always sees the same default problem. `换一题` draws a new random seed for variety, which
  is then URL-encoded. A present `seed` always reproduces the exact problem, so a shared link locks
  one problem. `encode` omits parameters equal to their default (the `CubeNetState` codec pattern).
- Invalid or out-of-range values are clamped or replaced by documented defaults, recording an
  issue message, following the existing `CubeNetState` codec pattern.

Difficulty → cube-count ranges (kept small for classroom readability):

| Level | Unit-cube count |
| --- | --- |
| 1 | 4 |
| 2 | 5–6 |
| 3 | 7–8 |

## Mathematical model

Math is isolated from React/rendering and unit-tested independently.

### `solid.ts` — composite solids and congruence

A composite solid is a set of unit cubes on the integer lattice. `y` is up. A valid solid must:

- be a single orthogonally connected component (no floating or disconnected cubes);
- rest on the ground (`min y === 0`), so it visually "sits" on a surface;
- fit within a bounded box (about `4 x 4 x 4`) for readability.

Congruence is decided by a canonical form:

- `canonicalForm(cubes)` — for each of the 24 **orientation-preserving** cube rotations, rotate the
  voxel coordinates, normalize so each axis minimum is 0, sort, and take the lexicographically
  minimum across all 24 rotations.
- Two solids are congruent **iff** their canonical forms are equal.

Only the 24 proper (det = +1) rotations are used: a solid and its mirror image are treated as
different, because a rotation cannot turn a solid into its mirror. This matches "find the one that
is different" — three options coincide with the reference under rotation, one genuinely does not.

### `generator.ts` — deterministic problem generation

`generate(level, seed)` uses a deterministic PRNG (e.g. mulberry32) to produce an instance:

1. Grow a valid reference solid `R` with a cube count in the level's range. Prefer solids with
   height variation and non-degenerate, non-linear shapes; higher difficulty avoids too-simple or
   ambiguous forms.
2. Choose 3 distinct rotations of `R` as the congruent distractors (they are congruent by
   construction).
3. Create the "different" solid: move one cube of `R` to an adjacent empty cell, preserving cube
   count, connectivity, and ground contact, and verify via `canonicalForm` that the result is
   **not** congruent to `R`. If the mutation yields a congruent variant, retry (bounded).
4. Shuffle A/B/C/D order. Return `{ reference, options: Solid[4], answerIndex }`.

Key invariant, asserted after construction: **exactly 3 of the 4 options are congruent to the
reference and exactly 1 is not**; `answerIndex` points at the non-congruent one. If the instance
fails the assertion, retry with the next deterministic candidate (bounded).

## Rendering

Five independent viewports, fitting a 16:9 projector:

- Left, larger viewport (~40%): the reference solid, labeled `参照`.
- Right, a 2 x 2 grid (~60%): options A / B / C / D.

Each viewport is its own R3F `<Canvas>` with independent `OrbitControls` (rotate and zoom, no pan).
Polar angle is constrained so the solid cannot flip into a confusing upside-down view (as in
`cube-net`), and each viewport has its own reset-view action.

Solid rendering (`SolidViewport` component):

- Each unit cube is a box with `meshStandardMaterial`, plus dark edges so the decomposition into
  unit cubes stays visible (counting cubes is part of the skill). Edges are the primary
  decomposition cue — meaning is not carried by color alone.
- Reuse the existing per-case `scene-style.ts` token-reader pattern (same as `cube-net`) reading
  `--viz-3d-*` tokens: cube face color (reference uses a distinct accent token from the options),
  edge color, lighting, roughness, and opacity.
- A `参照` badge distinguishes the reference from the options in addition to color.

## Interaction and answer flow

Self-check with a teacher-reveal mode:

- Submit by clicking an option, or by keyboard (arrow keys move the selection among A/B/C/D,
  Enter/Space confirms).
- Correct → `答对了`; incorrect → `再想想，找出与参照体不同的那个`, with retry allowed. Feedback is
  conveyed by text and icon as well as color.
- `显示答案` (teacher mode) marks the different option.
- `换一题` draws a new random seed (which the URL then encodes).
- `重置视角` resets all viewports; `重置` returns to defaults.
- Viewports stay rotatable after submit so the teacher can confirm by rotation.

Case-level controls mirror `cube-net`'s view-tools + controls bar:

- difficulty select `初级 / 中级 / 高级` (changes `level`, regenerates with a fresh seed);
- `换一题`; `显示答案`; `重置视角`.

Data flow: `problem = useMemo(() => generate(level, seed), [level, seed])`; rendering consumes
`problem.reference` and `problem.options`. `level` / `seed` come from `state` (URL-encoded).
Selected option, submitted flag, and revealed flag are case-local ephemeral state.

## Files

Add under `src/cases/composite-match/`:

```text
definition.ts        case metadata + lazy runtime + teaching review
index.ts             re-export
codec.ts             CompositeState + URL codec
solid.ts             composite solids + canonical congruence
solid.test.ts        congruence tests
generator.ts         generate(level, seed) -> instance
generator.test.ts    invariants over many seeds
scene-style.ts       token-reader schema for this case
CompositeMatchCase.tsx   case runtime
SolidViewport.tsx        single-solid R3F viewport
composite-match.css      layout styles
```

Register in `src/cases/index.ts` via `registerCase(compositeMatchDefinition)`.

## Testing

- Unit `solid.test.ts`: same solid under rotation → equal canonical form; a mirror → different;
  different solids → different.
- Unit `generator.test.ts`: over many seeds assert — reference solid is valid; exactly 3 of 4
  options are congruent to the reference and exactly 1 is not; `answerIndex` is consistent;
  same seed reproduces the same instance; cube count is within the level range; every solid is
  connected / grounded / in bounds.
- Component `CompositeMatchCase.test.tsx`: correct and incorrect answer paths, keyboard
  navigation, reveal, and `换一题` resetting the answer state.
- Contract: covered automatically by `src/test/case-contract.test.ts` once registered.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`. One Playwright library-to-presentation scenario
  plus a screenshot regression of the main layout (screenshot checks stable scenes, not
  mathematical correctness).
- Human teaching review (through `teachingReview` metadata) covers objective, terminology,
  parameter validity, readability, usability, and misrepresentation risks.

## Documentation

No module boundary or system data-flow changes, so `docs/architecture.md` is unchanged; this is a
new case registration. The design document is committed under `docs/superpowers/specs/`.
