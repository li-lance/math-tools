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

function pick(t: readonly [number, number, number], i: number): number {
  return i === 0 ? t[0] : i === 1 ? t[1] : t[2];
}

function permutationSign(p: readonly [number, number, number]): number {
  let inversions = 0;
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) if (pick(p, i) > pick(p, j)) inversions++;
  return inversions % 2 === 0 ? 1 : -1;
}

function buildRotations(): Rotation[] {
  const out: Rotation[] = [];
  for (const perm of PERMS) {
    for (let mask = 0; mask < 8; mask++) {
      const sign: readonly [number, number, number] = [
        ((mask >> 0) & 1) === 0 ? 1 : -1,
        ((mask >> 1) & 1) === 0 ? 1 : -1,
        ((mask >> 2) & 1) === 0 ? 1 : -1,
      ];
      if (permutationSign(perm) * sign[0] * sign[1] * sign[2] === 1) out.push({ perm, sign });
    }
  }
  return out;
}

const ROTATIONS = buildRotations(); // 恰好 24 个保向旋转

export const ROTATION_COUNT = ROTATIONS.length;

function rotate(cube: Cube, r: Rotation): Cube {
  return [r.sign[0] * pick(cube, r.perm[0]), r.sign[1] * pick(cube, r.perm[1]), r.sign[2] * pick(cube, r.perm[2])] as const;
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
  const r = ROTATIONS[index % ROTATION_COUNT]!;
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

  const first = solid[0]!;
  const seen = new Set<string>([first.join(',')]);
  const stack: Cube[] = [first];
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
