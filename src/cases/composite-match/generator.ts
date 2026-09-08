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
    const next = candidates[Math.floor(rng() * candidates.length)]!;
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
    const from = reference[Math.floor(rng() * reference.length)]!;
    const candidates: Cube[] = [];
    for (const [dx, dy, dz] of NEIGHBORS) {
      const cand = [from[0] + dx, from[1] + dy, from[2] + dz] as const;
      if (inBounds(cand) && !set.has(cand.join(','))) candidates.push(cand);
    }
    if (candidates.length === 0) continue;
    const to = candidates[Math.floor(rng() * candidates.length)]!;
    const mutated: Solid = reference.map((c) => (c === from ? to : c));
    if (isValidSolid(mutated) && !areCongruent(mutated, reference)) return mutated;
  }
  return null;
}

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
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
  const shuffledOptions = order.map((i) => options[i]!);
  const answerIndex = order.indexOf(3); // 3 是 decoy 打乱前的下标

  const congruentCount = shuffledOptions.filter((o) => areCongruent(o, reference)).length;
  if (congruentCount !== 3 || areCongruent(shuffledOptions[answerIndex]!, reference)) return null;

  return { reference, options: shuffledOptions, answerIndex };
}

export function generateProblem(level: Level, seed: number): Problem {
  for (let offset = 0; offset < 1000; offset++) {
    const candidate = build(level, seed + offset);
    if (candidate) return candidate;
  }
  throw new Error('组合体生成失败');
}
