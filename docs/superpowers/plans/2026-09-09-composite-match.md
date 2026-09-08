# 组合体找不同（composite-match）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a parameterized 3D case where students rotate a reference composite solid and four candidate solids to find the one that is not rotationally congruent.

**Architecture:** Follow the `cube-net` 3D case pattern. Pure math (canonical congruence, deterministic problem generation) lives in `solid.ts` / `generator.ts` with no React dependency; rendering uses React Three Fiber in a `SolidViewport` per solid; the case runtime composes five viewports plus a self-check answer flow. URL state is `{ level, seed }` via a codec.

**Tech Stack:** TypeScript (strict), React 19, React Three Fiber (`@react-three/fiber` 9, `@react-three/drei` 10), Three.js (`three` 0.185), Vitest, Testing Library, Playwright.

## Global Constraints

- Node `>=24`; package manager `pnpm@11.21.0`. Commands: `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test:e2e`.
- TypeScript strict mode; no `any`; validate data at URL and other untyped boundaries.
- Cases make no network requests; cases must not directly access routing, global state, browser persistence, or the service worker (read or write).
- Chinese interface copy and classification terms live in `src/content/zh-CN.ts`, not scattered in components.
- Mathematical logic must be independent of React and rendering; `three` is used in math only for matrix/vector math. SVG for 2D, Three.js/R3F for 3D.
- Visual values come from `src/styles/tokens.css`; cases read them via `src/styles/read-tokens.ts` (`readTokens`) through a case-local `scene-style.ts`. No duplicate color/material defaults.
- Case id is kebab-case; register via `registerCase` in `src/cases/index.ts`. Runtime is a `React.lazy` wrapper created at module scope in the definition.
- The default state must satisfy the case contract in `src/test/case-contract.test.ts`: `decode(empty) === defaultState` with no issues; `decode(encode(defaultState)) === defaultState`; idempotent.
- Key interactions support pointer, touch, and keyboard. Mathematical meaning is never carried by color alone.
- `three` / `@types/three` versions are fixed by the root `pnpm-workspace.yaml` catalog; do not add or change Three.js deps.

---

### Task 1: Composite-solid congruence math (`solid.ts`)

**Files:**
- Create: `src/cases/composite-match/solid.ts`
- Test: `src/cases/composite-match/solid.test.ts`

**Interfaces:**
- Consumes: nothing (pure module).
- Produces: `type Cube`, `type Solid`, `isValidSolid`, `canonicalForm`, `areCongruent`, `rotateSolid`, `ROTATION_COUNT` — used by Tasks 2 and 5.

- [ ] **Step 1: Write the failing test**

Create `src/cases/composite-match/solid.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { areCongruent, canonicalForm, isValidSolid, type Solid } from './solid';

const CORNER: Solid = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]];

describe('canonicalForm / 同构', () => {
  it('自身与自身同构', () => {
    expect(areCongruent(CORNER, CORNER)).toBe(true);
  });

  it('旋转后的同一组合体规范形相同', () => {
    // 绕 y 轴旋转 90°：(x, y, z) -> (z, y, -x)，属保向旋转。
    const rotated: Solid = CORNER.map(([x, y, z]) => [z, y, -x] as const);
    expect(canonicalForm(rotated)).toBe(canonicalForm(CORNER));
  });

  it('不同的组合体不同构', () => {
    const other: Solid = [[0, 0, 0], [1, 0, 0], [0, 1, 0]];
    expect(areCongruent(CORNER, other)).toBe(false);
  });
});

describe('isValidSolid', () => {
  it('接受贴地、连通、跨度小的组合体', () => {
    expect(isValidSolid([[0, 0, 0], [1, 0, 0], [0, 1, 0]])).toBe(true);
  });

  it('拒绝不贴地的组合体', () => {
    expect(isValidSolid([[0, 1, 0], [1, 1, 0]])).toBe(false);
  });

  it('拒绝不连通的组合体', () => {
    expect(isValidSolid([[0, 0, 0], [2, 0, 0]])).toBe(false);
  });

  it('拒绝空组合体', () => {
    expect(isValidSolid([])).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/cases/composite-match/solid.test.ts`
Expected: FAIL — module `./solid` cannot be resolved.

- [ ] **Step 3: Write the implementation**

Create `src/cases/composite-match/solid.ts`:

```ts
// 组合体：整数格点上的单位立方体集合（y 为上）。纯几何逻辑，不依赖 React。

export type Cube = readonly [x: number, y: number, z: number];
export type Solid = readonly Cube[];

interface Rotation {
  perm: readonly [number, number, number];
  sign: readonly [number, number, number];
}

const PERMS: readonly (readonly [number, number, number])[] = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
];

function permutationSign(p: readonly [number, number, number]): number {
  let inversions = 0;
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) if (p[i] > p[j]) inversions++;
  return inversions % 2 === 0 ? 1 : -1;
}

function buildRotations(): Rotation[] {
  const out: Rotation[] = [];
  for (const perm of PERMS) {
    for (let mask = 0; mask < 8; mask++) {
      const sign = [0, 1, 2].map((i) => ((mask >> i) & 1) === 0 ? 1 : -1) as readonly [number, number, number];
      if (permutationSign(perm) * sign[0] * sign[1] * sign[2] === 1) out.push({ perm, sign });
    }
  }
  return out;
}

const ROTATIONS = buildRotations(); // 恰好 24 个保向旋转

export const ROTATION_COUNT = ROTATIONS.length;

function rotate(cube: Cube, r: Rotation): Cube {
  return [r.sign[0] * cube[r.perm[0]], r.sign[1] * cube[r.perm[1]], r.sign[2] * cube[r.perm[2]]] as const;
}

function normalize(cubes: readonly Cube[]): Cube[] {
  let minX = Infinity; let minY = Infinity; let minZ = Infinity;
  for (const [x, y, z] of cubes) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (z < minZ) minZ = z;
  }
  return cubes.map(([x, y, z]) => [x - minX, y - minY, z - minZ] as const).sort(compareCubes);
}

function compareCubes(a: Cube, b: Cube): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

function keyOf(cubes: readonly Cube[]): string {
  return cubes.map((c) => c.join(',')).join(';');
}

/** 规范形：24 个保向旋转中归一化后的字典序最小键。规范形相等 ⇔ 可旋转重合。 */
export function canonicalForm(solid: Solid): string {
  let best = '';
  for (const r of ROTATIONS) {
    const key = keyOf(normalize(solid.map((c) => rotate(c, r))));
    if (best === '' || key < best) best = key;
  }
  return best;
}

export function areCongruent(a: Solid, b: Solid): boolean {
  return canonicalForm(a) === canonicalForm(b);
}

/** 对组合体应用第 index 个保向旋转并重新归一化（用于展示不同朝向的同构体）。 */
export function rotateSolid(solid: Solid, index: number): Solid {
  const r = ROTATIONS[index % ROTATION_COUNT];
  return normalize(solid.map((c) => rotate(c, r)));
}

const NEIGHBORS: readonly (readonly [number, number, number])[] = [
  [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
];

/** 合法组合体：非空、贴地（min y = 0）、六邻域单连通、各轴跨度 ≤ 3。 */
export function isValidSolid(solid: Solid): boolean {
  if (solid.length === 0) return false;
  let minX = Infinity; let minY = Infinity; let minZ = Infinity;
  let maxX = -Infinity; let maxY = -Infinity; let maxZ = -Infinity;
  const set = new Set<string>();
  for (const [x, y, z] of solid) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (z < minZ) minZ = z;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    if (z > maxZ) maxZ = z;
    set.add(`${x},${y},${z}`);
  }
  if (minY !== 0) return false;
  if (maxX - minX > 3 || maxY - minY > 3 || maxZ - minZ > 3) return false;

  const seen = new Set<string>([solid[0].join(',')]);
  const stack: Cube[] = [solid[0]];
  while (stack.length) {
    const [x, y, z] = stack.pop()!;
    for (const [dx, dy, dz] of NEIGHBORS) {
      const key = `${x + dx},${y + dy},${z + dz}`;
      if (set.has(key) && !seen.has(key)) {
        seen.add(key);
        stack.push([x + dx, y + dy, z + dz] as const);
      }
    }
  }
  return seen.size === solid.length;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/cases/composite-match/solid.test.ts`
Expected: PASS (4 + 3 = 7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/cases/composite-match/solid.ts src/cases/composite-match/solid.test.ts
git commit -m "feat(composite-match): 组合体同构判定数学模块"
```

---

### Task 2: Deterministic problem generator (`generator.ts`)

**Files:**
- Create: `src/cases/composite-match/generator.ts`
- Test: `src/cases/composite-match/generator.test.ts`

**Interfaces:**
- Consumes: `areCongruent`, `isValidSolid`, `rotateSolid`, `ROTATION_COUNT`, `type Solid` from `./solid` (Task 1).
- Produces: `type Level = 1 | 2 | 3`, `const CUBE_COUNTS: Record<Level, [number, number]>`, `interface Problem`, `generateProblem(level, seed)` — used by Tasks 3, 7, 8.

- [ ] **Step 1: Write the failing test**

Create `src/cases/composite-match/generator.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { areCongruent, isValidSolid } from './solid';
import { CUBE_COUNTS, generateProblem, type Level } from './generator';

describe('组合体题目生成', () => {
  for (const level of [1, 2, 3] as Level[]) {
    for (const seed of [1, 7, 42, 2024]) {
      it(`level ${level} seed ${seed}：恰好三个同构、一个不同，块数一致`, () => {
        const p = generateProblem(level, seed);

        expect(p.options).toHaveLength(4);
        expect(isValidSolid(p.reference)).toBe(true);
        for (const option of p.options) expect(isValidSolid(option)).toBe(true);

        const congruent = p.options.filter((o) => areCongruent(o, p.reference));
        expect(congruent).toHaveLength(3);
        expect(areCongruent(p.options[p.answerIndex], p.reference)).toBe(false);

        const [lo, hi] = CUBE_COUNTS[level];
        expect(p.reference.length).toBeGreaterThanOrEqual(lo);
        expect(p.reference.length).toBeLessThanOrEqual(hi);
        for (const option of p.options) expect(option.length).toBe(p.reference.length);
      });
    }
  }

  it('同一种子可复现', () => {
    expect(generateProblem(2, 99)).toEqual(generateProblem(2, 99));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/cases/composite-match/generator.test.ts`
Expected: FAIL — module `./generator` cannot be resolved.

- [ ] **Step 3: Write the implementation**

Create `src/cases/composite-match/generator.ts`:

```ts
import { areCongruent, isValidSolid, rotateSolid, ROTATION_COUNT, type Cube, type Solid } from './solid';

export type Level = 1 | 2 | 3;

export interface Problem {
  reference: Solid;
  options: readonly Solid[];
  answerIndex: number;
}

export const CUBE_COUNTS: Record<Level, [number, number]> = {
  1: [4, 4],
  2: [5, 6],
  3: [7, 8],
};

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NEIGHBORS = [
  [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
] as const;

function inBounds([x, y, z]: readonly [number, number, number]): boolean {
  return x >= 0 && x <= 3 && y >= 0 && y <= 3 && z >= 0 && z <= 3;
}

/** 逐块长出贴地、连通、跨度内的参照体。 */
function growSolid(rng: () => number, count: number): Solid {
  const cubes: Cube[] = [[0, 0, 0]];
  const set = new Set<string>(['0,0,0']);
  while (cubes.length < count) {
    const candidates: Cube[] = [];
    for (const c of cubes) {
      for (const [dx, dy, dz] of NEIGHBORS) {
        const n = [c[0] + dx, c[1] + dy, c[2] + dz] as const;
        if (inBounds(n) && !set.has(n.join(','))) candidates.push(n);
      }
    }
    if (candidates.length === 0) break;
    const next = candidates[Math.floor(rng() * candidates.length)];
    cubes.push(next);
    set.add(next.join(','));
  }
  return cubes;
}

/** 有高差且有水平延伸，避免一字排开或完全平铺的平庸形体。 */
function isRich(solid: Solid): boolean {
  let minX = Infinity; let maxX = -Infinity; let minY = Infinity; let maxY = -Infinity;
  let minZ = Infinity; let maxZ = -Infinity;
  for (const [x, y, z] of solid) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  return maxY > minY && (maxX > minX || maxZ > minZ);
}

/** 移动一块到相邻空位，得到块数一致、仍合法且不同构的形体。 */
function makeDecoy(reference: Solid, rng: () => number): Solid | null {
  const set = new Set(reference.map((c) => c.join(',')));
  for (let t = 0; t < 400; t++) {
    const from = reference[Math.floor(rng() * reference.length)];
    const candidates: Cube[] = [];
    for (const [dx, dy, dz] of NEIGHBORS) {
      const cand = [from[0] + dx, from[1] + dy, from[2] + dz] as const;
      if (inBounds(cand) && !set.has(cand.join(','))) candidates.push(cand);
    }
    if (candidates.length === 0) continue;
    const to = candidates[Math.floor(rng() * candidates.length)];
    const mutated: Solid = reference.map((c) => (c === from ? to : c));
    if (isValidSolid(mutated) && !areCongruent(mutated, reference)) return mutated;
  }
  return null;
}

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function build(level: Level, seed: number): Problem | null {
  const [minCount, maxCount] = CUBE_COUNTS[level];
  const rng = mulberry32(seed);
  const count = minCount + Math.floor(rng() * (maxCount - minCount + 1));

  let reference = growSolid(rng, count);
  for (let t = 0; t < 20 && !isRich(reference); t++) reference = growSolid(rng, count);

  const options: Solid[] = [];
  const usedRot = new Set<number>();
  while (options.length < 3) {
    const ri = 1 + Math.floor(rng() * (ROTATION_COUNT - 1)); // 1..23，避免与参照体同朝向
    if (usedRot.has(ri)) continue;
    usedRot.add(ri);
    options.push(rotateSolid(reference, ri));
  }

  const decoy = makeDecoy(reference, rng);
  if (decoy === null) return null;
  options.push(decoy);

  const order = shuffle([0, 1, 2, 3], rng);
  const shuffledOptions = order.map((i) => options[i]);
  const answerIndex = order.indexOf(3); // 3 是 decoy 打乱前的下标

  const congruentCount = shuffledOptions.filter((o) => areCongruent(o, reference)).length;
  if (congruentCount !== 3 || areCongruent(shuffledOptions[answerIndex], reference)) return null;

  return { reference, options: shuffledOptions, answerIndex };
}

export function generateProblem(level: Level, seed: number): Problem {
  for (let offset = 0; offset < 1000; offset++) {
    const candidate = build(level, seed + offset);
    if (candidate) return candidate;
  }
  throw new Error('组合体生成失败');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/cases/composite-match/generator.test.ts`
Expected: PASS (13 tests).

- [ ] **Step 5: Commit**

```bash
git add src/cases/composite-match/generator.ts src/cases/composite-match/generator.test.ts
git commit -m "feat(composite-match): 确定性题目生成器"
```

---

### Task 3: URL codec (`codec.ts`)

**Files:**
- Create: `src/cases/composite-match/codec.ts`
- Test: `src/cases/composite-match/codec.test.ts`

**Interfaces:**
- Consumes: `type Level` from `./generator` (Task 2); `CaseStateCodec`, `DecodeResult` from `../../core/cases`.
- Produces: `interface CompositeState { level: Level; seed: number }`, `const DEFAULT_STATE`, `compositeCodec` — used by Tasks 7 and 9.

- [ ] **Step 1: Write the failing test**

Create `src/cases/composite-match/codec.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { compositeCodec, DEFAULT_STATE } from './codec';

describe('组合体找不同编解码', () => {
  it('空参数解码为默认状态且无提示', () => {
    const r = compositeCodec.decode(new URLSearchParams());
    expect(r.state).toEqual(DEFAULT_STATE);
    expect(r.issues).toEqual([]);
  });

  it('合法 level 与 seed 往返', () => {
    const state = { level: 3, seed: 42 };
    expect(compositeCodec.decode(compositeCodec.encode(state)).state).toEqual(state);
  });

  it('默认状态编码为空参数', () => {
    expect(compositeCodec.encode(DEFAULT_STATE).toString()).toBe('');
  });

  it('无效 level 恢复默认并提示', () => {
    const r = compositeCodec.decode(new URLSearchParams('level=9'));
    expect(r.state.level).toBe(DEFAULT_STATE.level);
    expect(r.issues.length).toBeGreaterThan(0);
  });

  it('无效 seed 恢复默认并提示', () => {
    const r = compositeCodec.decode(new URLSearchParams('seed=-1'));
    expect(r.state.seed).toBe(DEFAULT_STATE.seed);
    expect(r.issues.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/cases/composite-match/codec.test.ts`
Expected: FAIL — module `./codec` cannot be resolved.

- [ ] **Step 3: Write the implementation**

Create `src/cases/composite-match/codec.ts`:

```ts
import type { CaseStateCodec, DecodeResult } from '../../core/cases';
import type { Level } from './generator';

/** 案例的教学参数：难度等级与题目种子。 */
export interface CompositeState {
  level: Level;
  seed: number;
}

export const DEFAULT_STATE: CompositeState = { level: 2, seed: 1 };

const LEVEL_KEY = 'level';
const SEED_KEY = 'seed';
const LEVELS: readonly Level[] = [1, 2, 3];

function decode(params: URLSearchParams): DecodeResult<CompositeState> {
  const state: CompositeState = { ...DEFAULT_STATE };
  const issues: string[] = [];

  const levelRaw = params.get(LEVEL_KEY);
  if (levelRaw !== null) {
    const level = Number(levelRaw);
    if (LEVELS.includes(level as Level)) state.level = level as Level;
    else issues.push('难度无效，已恢复默认值');
  }

  const seedRaw = params.get(SEED_KEY);
  if (seedRaw !== null) {
    const seed = /^\d+$/.test(seedRaw) ? Number(seedRaw) : null;
    if (seed !== null && Number.isSafeInteger(seed) && seed >= 0) state.seed = seed;
    else issues.push('种子无效，已恢复默认值');
  }

  return { state, issues };
}

function encode(state: CompositeState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.level !== DEFAULT_STATE.level) params.set(LEVEL_KEY, String(state.level));
  if (state.seed !== DEFAULT_STATE.seed) params.set(SEED_KEY, String(state.seed));
  return params;
}

export const compositeCodec: CaseStateCodec<CompositeState> = { decode, encode };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/cases/composite-match/codec.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/cases/composite-match/codec.ts src/cases/composite-match/codec.test.ts
git commit -m "feat(composite-match): 难度与种子 URL 编解码"
```

---

### Task 4: Scene token reader (`scene-style.ts`) + design tokens

**Files:**
- Create: `src/cases/composite-match/scene-style.ts`
- Test: `src/cases/composite-match/scene-style.test.ts`
- Modify: `src/styles/tokens.css:213-233` (append two cube color tokens near the `--viz-3d-*` block)

**Interfaces:**
- Consumes: `readTokens`, `TokenRule` from `../../styles/read-tokens`; CSS custom properties from `src/styles/tokens.css`.
- Produces: `solidSceneTokenSchema`, `type SolidSceneStyle`, `readSolidSceneStyle` — used by Tasks 6, 7, 8.

- [ ] **Step 1: Write the failing test**

Create `src/cases/composite-match/scene-style.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';

import { readSolidSceneStyle, solidSceneTokenSchema } from './scene-style';

describe('组合体场景样式', () => {
  it('所有三维视觉值均由 --viz-3d-* token 提供', () => {
    expect(Object.values(solidSceneTokenSchema).every(({ name }) => name.startsWith('--viz-3d-'))).toBe(true);
    expect(Object.keys(solidSceneTokenSchema)).toEqual([
      'cubeReference', 'cubeOption', 'edgeColor',
      'hemisphereSky', 'hemisphereGround', 'hemisphereIntensity',
      'directionalColor', 'directionalIntensity', 'materialRoughness',
    ]);
  });

  it('从根元素读取类型化场景样式', () => {
    const values = Object.fromEntries(Object.values(solidSceneTokenSchema).map((rule) => [
      rule.name, rule.kind === 'color' ? '#abc' : '1',
    ]));
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (name: string) => values[name] ?? '',
    } as CSSStyleDeclaration);

    const style = readSolidSceneStyle(document.documentElement);

    expect(style.cubeReference).toBe('#abc');
    expect(style.materialRoughness).toBe(1);
    expect(window.getComputedStyle).toHaveBeenCalledOnce();
    vi.restoreAllMocks();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/cases/composite-match/scene-style.test.ts`
Expected: FAIL — module `./scene-style` cannot be resolved.

- [ ] **Step 3: Write the implementation**

Create `src/cases/composite-match/scene-style.ts`:

```ts
import { readTokens } from '../../styles/read-tokens';

const color = (name: `--${string}`) => ({ name, kind: 'color' } as const);
const number = (name: `--${string}`, min: number, max: number) => ({ name, kind: 'number', min, max } as const);

export const solidSceneTokenSchema = {
  cubeReference: color('--viz-3d-cube-reference'),
  cubeOption: color('--viz-3d-cube-option'),
  edgeColor: color('--viz-3d-edge-color'),
  hemisphereSky: color('--viz-3d-light-hemisphere-sky'),
  hemisphereGround: color('--viz-3d-light-hemisphere-ground'),
  hemisphereIntensity: number('--viz-3d-light-hemisphere-intensity', 0, 10),
  directionalColor: color('--viz-3d-light-directional-color'),
  directionalIntensity: number('--viz-3d-light-directional-intensity', 0, 10),
  materialRoughness: number('--viz-3d-material-roughness', 0, 1),
} as const;

export type SolidSceneStyle = ReturnType<typeof readSolidSceneStyle>;

export function readSolidSceneStyle(element: Element) {
  return readTokens(element, solidSceneTokenSchema);
}
```

Then append two tokens to the `--viz-3d-*` block in `src/styles/tokens.css`, right after the `--viz-3d-face-*` entries (line 212):

```css
  --viz-3d-cube-reference: var(--color-manipulative-green);
  --viz-3d-cube-option: var(--color-manipulative-blue);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/cases/composite-match/scene-style.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/cases/composite-match/scene-style.ts src/cases/composite-match/scene-style.test.ts src/styles/tokens.css
git commit -m "feat(composite-match): 场景 token 读取器与立方体颜色 token"
```

---

### Task 5: Camera fit (`scene-layout.ts`)

**Files:**
- Create: `src/cases/composite-match/scene-layout.ts`
- Test: `src/cases/composite-match/scene-layout.test.ts`

**Interfaces:**
- Consumes: `type Solid` from `./solid` (Task 1); `three` (Box3/Sphere/Vector3/PerspectiveCamera).
- Produces: `const SOLID_FOV`, `fitSolid(solid)` — used by Task 6.

- [ ] **Step 1: Write the failing test**

Create `src/cases/composite-match/scene-layout.test.ts`:

```ts
import { PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';

import type { Solid } from './solid';
import { fitSolid, SOLID_FOV } from './scene-layout';

const SAMPLE: Solid = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]];

describe('三维场景取景', () => {
  it('参照体中心即包围盒中心，取景距离为正', () => {
    const { center, distance } = fitSolid(SAMPLE);
    expect(center[0]).toBeCloseTo(0.25, 10);
    expect(center[1]).toBeCloseTo(0.25, 10);
    expect(center[2]).toBeCloseTo(0.25, 10);
    expect(distance).toBeGreaterThan(0);
  });

  it('所有立方体角点均落在视口内', () => {
    const { center, distance } = fitSolid(SAMPLE);
    const camera = new PerspectiveCamera(SOLID_FOV, 1, 0.1, 100);
    const target = new Vector3(...center);
    camera.position.copy(new Vector3(3, 2.4, 4).normalize().multiplyScalar(distance).add(target));
    camera.lookAt(target);
    camera.updateMatrixWorld();

    for (const [x, y, z] of SAMPLE) {
      for (const dx of [-0.5, 0.5]) for (const dy of [-0.5, 0.5]) for (const dz of [-0.5, 0.5]) {
        const p = new Vector3(x + dx, y + dy, z + dz);
        p.project(camera);
        expect(Math.abs(p.x)).toBeLessThan(1);
        expect(Math.abs(p.y)).toBeLessThan(1);
      }
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/cases/composite-match/scene-layout.test.ts`
Expected: FAIL — module `./scene-layout` cannot be resolved.

- [ ] **Step 3: Write the implementation**

Create `src/cases/composite-match/scene-layout.ts`:

```ts
import { Box3, Sphere, Vector3 } from 'three';

import type { Solid } from './solid';

export const SOLID_FOV = 42;

/** 根据组合体包围球计算取景中心与相机距离。 */
export function fitSolid(solid: Solid): { center: [number, number, number]; distance: number } {
  const bounds = new Box3();
  for (const [x, y, z] of solid) {
    bounds.expandByPoint(new Vector3(x - 0.5, y - 0.5, z - 0.5));
    bounds.expandByPoint(new Vector3(x + 0.5, y + 0.5, z + 0.5));
  }
  const sphere = bounds.getBoundingSphere(new Sphere());
  const halfFov = (SOLID_FOV * Math.PI) / 360;
  const distance = (sphere.radius / Math.sin(halfFov)) * 1.15;
  return { center: sphere.center.toArray() as [number, number, number], distance };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/cases/composite-match/scene-layout.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/cases/composite-match/scene-layout.ts src/cases/composite-match/scene-layout.test.ts
git commit -m "feat(composite-match): 组合体取景布局"
```

---

### Task 6: Single-solid viewport (`SolidViewport.tsx`)

**Files:**
- Create: `src/cases/composite-match/SolidViewport.tsx`

**Interfaces:**
- Consumes: `type Solid` from `./solid` (Task 1); `fitSolid`, `SOLID_FOV` from `./scene-layout` (Task 5); `type SolidSceneStyle` from `./scene-style` (Task 4); `@react-three/fiber`, `@react-three/drei`.
- Produces: `default export SolidViewport` with props `{ solid, label, cubeColor, style, resetKey }` — used by Task 7.

This task has no jsdom unit test: the R3F `<Canvas>` requires WebGL. It is verified by `pnpm typecheck`, `pnpm lint`, the Task 8 component test (which mocks `SolidViewport`), and the Task 10 Playwright screenshot.

- [ ] **Step 1: Write the implementation**

Create `src/cases/composite-match/SolidViewport.tsx`:

```tsx
import { Edges, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef, type ComponentRef } from 'react';
import { Vector3 } from 'three';

import type { Solid } from './solid';
import { fitSolid, SOLID_FOV } from './scene-layout';
import type { SolidSceneStyle } from './scene-style';

const CAMERA_DIRECTION: [number, number, number] = [3, 2.4, 4];

interface SolidViewportProps {
  solid: Solid;
  label: string;
  cubeColor: string;
  style: SolidSceneStyle;
  resetKey: number;
}

function SolidScene({ solid, cubeColor, style, resetKey }: {
  solid: Solid; cubeColor: string; style: SolidSceneStyle; resetKey: number;
}) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const lastResetKey = useRef(-1);
  const { camera } = useThree();
  const layout = useMemo(() => fitSolid(solid), [solid]);

  useLayoutEffect(() => {
    const orbit = controls.current;
    if (!orbit) return;
    const isReset = lastResetKey.current !== resetKey;
    lastResetKey.current = resetKey;
    const direction = isReset
      ? new Vector3(...CAMERA_DIRECTION).normalize()
      : camera.position.clone().sub(orbit.target).normalize();
    orbit.target.set(...layout.center);
    camera.position.copy(direction.multiplyScalar(layout.distance).add(orbit.target));
    orbit.minDistance = layout.distance * 0.5;
    orbit.maxDistance = layout.distance * 2.5;
    orbit.update();
  }, [camera, layout, resetKey]);

  return (
    <>
      <hemisphereLight args={[style.hemisphereSky, style.hemisphereGround, style.hemisphereIntensity]} />
      <directionalLight position={[4, 7, 5]} color={style.directionalColor} intensity={style.directionalIntensity} />
      <group>
        {solid.map(([x, y, z], index) => (
          <mesh key={index} position={[x, y, z]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={cubeColor} roughness={style.materialRoughness} />
            <Edges color={style.edgeColor} />
          </mesh>
        ))}
      </group>
      <OrbitControls
        ref={controls} makeDefault enablePan={false} enableDamping={false}
        minPolarAngle={0.15} maxPolarAngle={Math.PI * 0.55}
      />
    </>
  );
}

export default function SolidViewport({ solid, label, cubeColor, style, resetKey }: SolidViewportProps) {
  return (
    <Canvas camera={{ position: CAMERA_DIRECTION, fov: SOLID_FOV }} dpr={[1, 2]} role="img" aria-label={label}>
      <SolidScene solid={solid} cubeColor={cubeColor} style={style} resetKey={resetKey} />
    </Canvas>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint src/cases/composite-match/SolidViewport.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/cases/composite-match/SolidViewport.tsx
git commit -m "feat(composite-match): 单组合体三维视口"
```

---

### Task 7: Case runtime (`CompositeMatchCase.tsx`), styles, and copy

**Files:**
- Create: `src/cases/composite-match/CompositeMatchCase.tsx`
- Create: `src/cases/composite-match/composite-match.css`
- Modify: `src/content/zh-CN.ts:104` (insert a `compositeMatch` copy block after the `cubeNet` block)

**Interfaces:**
- Consumes: `CaseRuntimeProps` from `../../core/cases`; `copy` from `../../content/zh-CN`; `generateProblem`, `type Level` from `./generator` (Task 2); `type CompositeState` from `./codec` (Task 3); `readSolidSceneStyle` from `./scene-style` (Task 4); `SolidViewport` (Task 6).
- Produces: `default export CompositeMatchCase` — used by Task 9 (via `React.lazy`).

- [ ] **Step 1: Add the copy block**

In `src/content/zh-CN.ts`, after the closing `},` of the `cubeNet` block (currently line 104), insert:

```ts
  compositeMatch: {
    viewHint: '拖动旋转 · 滚轮或双指缩放',
    referenceLabel: '参照',
    optionLetter: (letter: string) => `选项 ${letter}`,
    sceneLabel: (which: string) => `三维场景：${which}`,
    resetView: '重置视角',
    newProblem: '换一题',
    revealAnswer: '显示答案',
    difficultyLabel: '难度',
    difficulty: { 1: '初级', 2: '中级', 3: '高级' } as const,
    prompt: '找出与参照组合体旋转后无法重合的那一个。',
    correct: '答对了！这个就是不同的组合体。',
    incorrect: '再想想，找出与参照体不同的那个。',
    answerMarker: '不同',
  },
```

- [ ] **Step 2: Write the case component**

Create `src/cases/composite-match/CompositeMatchCase.tsx`:

```tsx
import { useMemo, useRef, useState, type KeyboardEvent } from 'react';

import type { CaseRuntimeProps } from '../../core/cases';
import { copy } from '../../content/zh-CN';

import type { CompositeState } from './codec';
import { generateProblem, type Level } from './generator';
import { readSolidSceneStyle } from './scene-style';
import SolidViewport from './SolidViewport';
import './composite-match.css';

const text = copy.compositeMatch;
const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;
const LEVELS: Level[] = [1, 2, 3];

export default function CompositeMatchCase({ state, onStateChange }: CaseRuntimeProps<CompositeState>) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const problem = useMemo(() => generateProblem(state.level, state.seed), [state.level, state.seed]);
  const [style] = useState(() => readSolidSceneStyle(document.documentElement));

  const isCorrect = selected !== null && selected === problem.answerIndex;

  function moveFocus(index: number, dx: number, dy: number) {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const nc = col + dx;
    const nr = row + dy;
    if (nc < 0 || nc > 1 || nr < 0 || nr > 1) return;
    optionRefs.current[nr * 2 + nc]?.focus();
  }

  function handleOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    moveFocus(index, move[0], move[1]);
  }

  function newProblem() {
    onStateChange({ level: state.level, seed: Math.floor(Math.random() * 0x7fffffff) });
    setSelected(null);
    setRevealed(false);
  }

  return (
    <div className="composite-match">
      <p className="composite-match__hint">{text.viewHint}</p>
      <div className="composite-match__board">
        <section className="composite-match__reference" aria-label={text.referenceLabel}>
          <span className="composite-match__badge">{text.referenceLabel}</span>
          <SolidViewport
            solid={problem.reference}
            label={text.sceneLabel(text.referenceLabel)}
            cubeColor={style.cubeReference}
            style={style}
            resetKey={resetKey}
          />
        </section>
        <div className="composite-match__options">
          {problem.options.map((option, index) => (
            <div key={index} className="composite-match__option">
              <SolidViewport
                solid={option}
                label={text.sceneLabel(OPTION_LETTERS[index])}
                cubeColor={style.cubeOption}
                style={style}
                resetKey={resetKey}
              />
              <button
                type="button"
                role="radio"
                aria-checked={selected === index}
                className="composite-match__option-button"
                onClick={() => setSelected(index)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                ref={(el) => { optionRefs.current[index] = el; }}
              >
                {OPTION_LETTERS[index]}
              </button>
              {revealed && index === problem.answerIndex && (
                <span className="composite-match__marker">{text.answerMarker}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="composite-match__prompt">{text.prompt}</p>
      <p className="composite-match__feedback" role="status">
        {selected !== null && (isCorrect ? text.correct : text.incorrect)}
      </p>
      <div className="composite-match__controls">
        <label>
          {text.difficultyLabel}
          <select
            value={state.level}
            onChange={(event) => onStateChange({ level: Number(event.target.value) as Level, seed: state.seed })}
          >
            {LEVELS.map((level) => (
              <option key={level} value={level}>{text.difficulty[level]}</option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => setResetKey((value) => value + 1)}>{text.resetView}</button>
        <button type="button" onClick={() => setRevealed(true)}>{text.revealAnswer}</button>
        <button type="button" onClick={newProblem}>{text.newProblem}</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write the styles**

Create `src/cases/composite-match/composite-match.css`:

```css
.composite-match {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
}

.composite-match__hint,
.composite-match__prompt {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.composite-match__prompt {
  color: var(--color-text);
  font-weight: var(--weight-medium);
}

.composite-match__board {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: var(--space-4);
  width: 100%;
}

.composite-match__reference {
  position: relative;
  min-height: var(--size-canvas-3d-mobile-min);
  background: var(--color-stage);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.composite-match__badge {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  z-index: 2;
  padding: var(--space-1) var(--space-3);
  font-weight: var(--weight-bold);
  color: var(--color-text);
  background: var(--color-label-bg);
  border-radius: var(--radius-pill);
  pointer-events: none;
}

.composite-match__options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: var(--space-4);
}

.composite-match__option {
  position: relative;
  min-height: var(--size-canvas-3d-mobile-min);
  background: var(--color-stage);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.composite-match__option-button {
  position: absolute;
  bottom: var(--space-2);
  left: var(--space-2);
  z-index: 2;
  min-width: var(--touch-target);
  min-height: var(--touch-target);
  font-weight: var(--weight-bold);
}

.composite-match__option-button[aria-checked='true'] {
  background: var(--control-primary-surface);
  border-color: var(--control-primary-surface);
  color: var(--control-primary-text);
}

.composite-match__marker {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  z-index: 2;
  padding: var(--space-1) var(--space-3);
  font-weight: var(--weight-bold);
  color: var(--color-on-primary);
  background: var(--color-primary);
  border-radius: var(--radius-pill);
  pointer-events: none;
}

.composite-match__feedback {
  min-height: var(--touch-target);
  font-size: var(--font-size-body);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
}

.composite-match__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.composite-match__controls label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

@media (max-width: 600px) {
  .composite-match__board { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint src/cases/composite-match src/content/zh-CN.ts`
Expected: no errors. (If the case is not yet registered, `CompositeMatchCase.tsx` is not imported by the app, so also run typecheck on the whole project to be safe.)

- [ ] **Step 5: Commit**

```bash
git add src/cases/composite-match/CompositeMatchCase.tsx src/cases/composite-match/composite-match.css src/content/zh-CN.ts
git commit -m "feat(composite-match): 案例运行时、样式与文案"
```

---

### Task 8: Interaction component test

**Files:**
- Test: `src/cases/composite-match/CompositeMatchCase.test.tsx`

**Interfaces:**
- Consumes: `CompositeMatchCase` (Task 7), `generateProblem` (Task 2), `DEFAULT_STATE` (Task 3). Mocks `./SolidViewport` and `./scene-style` to avoid WebGL/computed-style in jsdom.

- [ ] **Step 1: Write the test**

Create `src/cases/composite-match/CompositeMatchCase.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_STATE } from './codec';
import CompositeMatchCase from './CompositeMatchCase';
import { generateProblem } from './generator';
import type { SolidSceneStyle } from './scene-style';

vi.mock('./scene-style', () => ({
  readSolidSceneStyle: (): SolidSceneStyle => ({
    cubeReference: '#abc', cubeOption: '#def', edgeColor: '#000',
    hemisphereSky: '#fff', hemisphereGround: '#888', hemisphereIntensity: 1,
    directionalColor: '#fff', directionalIntensity: 1, materialRoughness: 0.8,
  }),
}));

vi.mock('./SolidViewport', () => ({
  default: () => <div data-testid="solid-viewport" />,
}));

function renderCase() {
  const onStateChange = vi.fn();
  render(<CompositeMatchCase state={DEFAULT_STATE} onStateChange={onStateChange} />);
  return onStateChange;
}

function optionButton(letter: string) {
  return screen.getByRole('radio', { name: `选项 ${letter}` });
}

describe('组合体找不同', () => {
  it('渲染一个参照与四个选项', () => {
    renderCase();
    expect(screen.getAllByTestId('solid-viewport')).toHaveLength(5);
    for (const letter of ['A', 'B', 'C', 'D']) {
      expect(optionButton(letter)).toBeInTheDocument();
    }
  });

  it('选中正确答案显示答对', () => {
    renderCase();
    const answer = generateProblem(DEFAULT_STATE.level, DEFAULT_STATE.seed).answerIndex;
    const letters = ['A', 'B', 'C', 'D'];
    fireEvent.click(optionButton(letters[answer]));
    expect(screen.getByRole('status')).toHaveTextContent('答对了');
  });

  it('选中错误答案提示再想想', () => {
    renderCase();
    const answer = generateProblem(DEFAULT_STATE.level, DEFAULT_STATE.seed).answerIndex;
    const wrong = (answer + 1) % 4;
    fireEvent.click(optionButton(['A', 'B', 'C', 'D'][wrong]));
    expect(screen.getByRole('status')).toHaveTextContent('再想想');
  });

  it('方向键在选项间移动焦点', () => {
    renderCase();
    optionButton('A').focus();
    fireEvent.keyDown(optionButton('A'), { key: 'ArrowRight' });
    expect(optionButton('B')).toHaveFocus();
    fireEvent.keyDown(optionButton('B'), { key: 'ArrowDown' });
    expect(optionButton('D')).toHaveFocus();
  });

  it('显示答案标出不同项', () => {
    renderCase();
    fireEvent.click(screen.getByRole('button', { name: '显示答案' }));
    expect(screen.getByText('不同')).toBeInTheDocument();
  });

  it('换一题提交新种子并清空作答状态', () => {
    const onStateChange = renderCase();
    const answer = generateProblem(DEFAULT_STATE.level, DEFAULT_STATE.seed).answerIndex;
    fireEvent.click(optionButton(['A', 'B', 'C', 'D'][answer]));
    fireEvent.click(screen.getByRole('button', { name: '换一题' }));
    expect(onStateChange).toHaveBeenCalledWith({ level: DEFAULT_STATE.level, seed: expect.any(Number) });
    for (const letter of ['A', 'B', 'C', 'D']) {
      expect(optionButton(letter)).toHaveAttribute('aria-checked', 'false');
    }
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `pnpm vitest run src/cases/composite-match/CompositeMatchCase.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 3: Commit**

```bash
git add src/cases/composite-match/CompositeMatchCase.test.tsx
git commit -m "test(composite-match): 作答与键盘交互覆盖"
```

---

### Task 9: Case definition and registration

**Files:**
- Create: `src/cases/composite-match/definition.ts`
- Create: `src/cases/composite-match/index.ts`
- Modify: `src/cases/index.ts` (register the new case)

**Interfaces:**
- Consumes: `CaseDefinition` from `../../core/cases`; `compositeCodec`, `DEFAULT_STATE`, `type CompositeState` from `./codec` (Task 3); `CompositeMatchCase` (Task 7, via `React.lazy`).
- Produces: `compositeMatchDefinition` — discovered by the registry.

- [ ] **Step 1: Write the definition**

Create `src/cases/composite-match/definition.ts`:

```ts
import { lazy } from 'react';

import type { CaseDefinition } from '../../core/cases';

import { compositeCodec, DEFAULT_STATE, type CompositeState } from './codec';

const runtime = lazy(() => import('./CompositeMatchCase'));

export const compositeMatchDefinition: CaseDefinition<CompositeState> = {
  id: 'composite-match',
  title: '组合体找不同',
  summary: '旋转观察参照组合体，找出四个选项中与它不同的那一个。',
  grades: [4, 5, 6],
  topics: ['shape-and-geometry'],
  capabilities: ['three-3d', 'direct-manipulation', 'parameter-control'],
  guidance: [
    '按住拖动旋转任意组合体，滚轮或双指缩放；「重置视角」回到初始角度。',
    '左边是参照组合体，右边 A、B、C、D 是四个选项；找出与参照体旋转后无法重合的那一个。',
    '每个小方块都是一块单位立方体，棱线帮助看清立方体的拆分。',
    '点击选项下方的字母按钮作答；「显示答案」会标出不同的组合体。',
    '切换「难度」或点「换一题」得到新题目；把链接发给同事会还原同一道题。',
  ],
  defaultState: DEFAULT_STATE,
  codec: compositeCodec,
  runtime,
  teachingReview: {
    objective: '通过旋转对照，识别与参照组合体旋转后能重合（同构）的组合体，并找出无法重合的那一个，锻炼空间想象。',
    gradeRange: '四至六年级（图形与几何·观察物体）',
    terminology: ['组合体', '单位立方体', '旋转', '重合'],
    parameterValidity: '难度为 1–3 级（约 4 / 5–6 / 7–8 块单位立方体），默认 2 级；种子为非负整数，默认 1，同一对难度与种子始终生成同一道题。',
    misrepresentationRisks: [
      '不同项与参照体块数相同，学生无法仅靠数块数判断，须通过旋转比对形状。',
      '参照体与选项颜色不同仅为区分身份，不代表数学含义；字母标签与位置也用于区分，不只依赖颜色。',
      '透视远近不代表实际尺寸；组合体由等大的单位立方体构成，棱线仅为观察拆分。',
      '相机俯仰角受限且禁止平移，避免视角翻转造成方向误判；提供「重置视角」。',
      '同一道题在四个选项中恰有三个与参照体旋转重合、一个不同，由生成器校验保证。',
    ],
    status: 'pending',
  },
};
```

Create `src/cases/composite-match/index.ts`:

```ts
export { compositeMatchDefinition } from './definition';
export type { CompositeState } from './codec';
```

- [ ] **Step 2: Register the case**

In `src/cases/index.ts`, add the import and the registration:

```ts
import { compositeMatchDefinition } from './composite-match';
```

and inside `registerBuiltinCases()` after `registerCase(cubeNetDefinition);`:

```ts
  registerCase(compositeMatchDefinition);
```

- [ ] **Step 3: Run the contract and full unit suite**

Run: `pnpm test`
Expected: all tests pass, including the contract tests that now enumerate `composite-match`.

- [ ] **Step 4: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/cases/composite-match/definition.ts src/cases/composite-match/index.ts src/cases/index.ts
git commit -m "feat(composite-match): 注册案例定义"
```

---

### Task 10: End-to-end scenario, screenshot, and full verification

**Files:**
- Create: `e2e/composite-match.spec.ts`
- Modify: `e2e/visual.spec.ts` (add a screenshot test)

**Interfaces:**
- Consumes: the registered case at routes `/cases/composite-match` and `/cases/composite-match/present`.

Note: `pnpm test:e2e` requires Playwright browsers — run `pnpm exec playwright install chromium` once per machine if not already installed.

- [ ] **Step 1: Write the e2e scenario**

Create `e2e/composite-match.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('组合体找不同：参照与四个选项渲染，选答显示反馈', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/cases/composite-match/present');
  await expect(page.getByText('参照', { exact: true })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(5);
  const first = page.getByRole('radio', { name: '选项 A' });
  await expect(first).toBeVisible();
  await first.click();
  await expect(page.getByRole('status')).not.toHaveText('');
});

test('带参数链接还原难度与种子', async ({ page }) => {
  await page.goto('/cases/composite-match/present?level=3&seed=42');
  await expect(page.getByRole('combobox')).toHaveValue('3');
  await expect(page).toHaveURL(/[?&]level=3/);
  await expect(page).toHaveURL(/[?&]seed=42/);
});

test('换一题写回新种子', async ({ page }) => {
  await page.goto('/cases/composite-match/present');
  await page.getByRole('button', { name: '换一题' }).click();
  await expect(page).toHaveURL(/[?&]seed=\d+/);
});

test('案例库展示三维案例并进入演示', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('listitem')
    .filter({ hasText: '组合体找不同' })
    .getByRole('link', { name: '查看详情' })
    .click();
  await expect(page).toHaveURL(/\/cases\/composite-match$/);
  await page.getByRole('link', { name: '进入演示' }).click();
  await expect(page.locator('canvas')).toBeVisible();
});
```

- [ ] **Step 2: Add a screenshot test**

In `e2e/visual.spec.ts`, append after the last test:

```ts
test('组合体找不同演示页默认状态', async ({ page }) => {
  await page.goto('/cases/composite-match/present');
  await expect(page.getByText('参照', { exact: true })).toBeVisible();
  await expect(page).toHaveScreenshot('composite-match.png', {
    animations: 'disabled',
    threshold: 0.05,
    maxDiffPixelRatio: 0.02,
  });
});
```

- [ ] **Step 3: Run e2e for the new scenario**

Run: `pnpm test:e2e composite-match`
Expected: PASS (4 tests). If the screenshot baseline does not exist, generate it with `pnpm test:e2e -- --update-snapshots` and re-run to confirm it is stable.

- [ ] **Step 4: Full verification**

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm build`
Expected: all pass. `pnpm build` runs `tsc` + `vite build`; the new case must typecheck and build into its lazy chunk.

- [ ] **Step 5: Commit**

```bash
git add e2e/composite-match.spec.ts e2e/visual.spec.ts e2e/visual.spec.ts-snapshots/composite-match.png
git commit -m "test(composite-match): 端到端场景与关键场景截图"
```

---

## Self-Review

**Spec coverage:** each spec section maps to tasks — math model (Tasks 1–2), URL state (Task 3), tokens/styles (Task 4), camera fit (Task 5), rendering (Task 6), interaction/answer flow (Tasks 7–8), definition/registration (Task 9), testing/e2e (Tasks 8, 10). The spec's "documentation" note (no architecture change) is satisfied by not touching `docs/architecture.md`.

**Placeholder scan:** no TBD/TODO; every code step contains full code.

**Type consistency:** `Cube`/`Solid`/`isValidSolid`/`canonicalForm`/`areCongruent`/`rotateSolid`/`ROTATION_COUNT` (Task 1) are the exact names used in Tasks 2 and 5; `generateProblem`/`Level`/`CUBE_COUNTS`/`Problem` (Task 2) are the exact names used in Tasks 3, 7, 8; `CompositeState`/`DEFAULT_STATE`/`compositeCodec` (Task 3) are used in Tasks 7, 8, 9; `SolidSceneStyle`/`readSolidSceneStyle` (Task 4) are used in Tasks 6, 7, 8; `fitSolid`/`SOLID_FOV` (Task 5) are used in Task 6; `SolidViewport` props `{ solid, label, cubeColor, style, resetKey }` (Task 6) match Task 7's usage.
