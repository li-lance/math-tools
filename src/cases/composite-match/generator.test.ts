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
        expect(areCongruent(p.options[p.answerIndex]!, p.reference)).toBe(false);

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
