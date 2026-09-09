import { describe, expect, it } from 'vitest';

import { computeNetTransforms } from './net';
import { getSceneEdges } from './scene-edges';

describe('三维棱线去重', () => {
  for (const [unfold, count] of [[0, 12], [0.5, 19], [1, 19]] as const) {
    it(`${unfold * 100}% 展开只绘制 ${count} 条不同的单位棱`, () => {
      const points = getSceneEdges(computeNetTransforms(unfold));
      expect(points).toHaveLength(count * 2);
      const keys = new Set<string>();
      for (let i = 0; i < points.length; i += 2) {
        const start = points[i]!;
        const end = points[i + 1]!;
        expect(start.distanceTo(end)).toBeCloseTo(1, 10);
        const key = [start, end].map((p) => p.toArray().map((n) => Math.round(n * 1e6)).join(',')).sort().join('|');
        expect(keys.has(key)).toBe(false);
        keys.add(key);
      }
    });
  }
});
