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
