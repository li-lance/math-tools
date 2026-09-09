import { describe, expect, it } from 'vitest';

import { areCongruent, canonicalForm, isValidSolid, ROTATION_COUNT, type Solid } from './solid';

const CORNER: Solid = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]];

/** 沿 x 轴镜像后归一化（minX/minY/minZ 归零并排序）。 */
function mirrorX(solid: Solid): Solid {
  const mirrored = solid.map(([x, y, z]) => [-x, y, z] as const);
  let minX = Infinity; let minY = Infinity; let minZ = Infinity;
  for (const [x, y, z] of mirrored) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (z < minZ) minZ = z;
  }
  return mirrored
    .map(([x, y, z]) => [x - minX, y - minY, z - minZ] as const)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
}

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

  it('镜像（手性）组合体不与其保向同构', () => {
    // 手性四块组合体：其镜像无法通过保向旋转与原体重合。
    const chiral: Solid = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 0, 1]];
    const mirror = mirrorX(chiral);
    expect(canonicalForm(chiral)).not.toBe(canonicalForm(mirror));
    expect(areCongruent(chiral, mirror)).toBe(false);
  });

  it('保向旋转恰有 24 个', () => {
    expect(ROTATION_COUNT).toBe(24);
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

  it('接受各轴跨度恰为 3 的组合体', () => {
    expect(isValidSolid([[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0]])).toBe(true);
  });

  it('拒绝各轴跨度超过 3 的组合体', () => {
    expect(isValidSolid([[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0], [4, 0, 0]])).toBe(false);
  });
});
