import { PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';

import type { Solid } from './solid';
import { fitSolid, SOLID_FOV } from './scene-layout';

const SAMPLE: Solid = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]];

describe('三维场景取景', () => {
  it('参照体中心即包围盒中心，取景距离为正', () => {
    const { center, distance } = fitSolid(SAMPLE);
    expect(center[0]).toBeCloseTo(0.5, 10);
    expect(center[1]).toBeCloseTo(0.5, 10);
    expect(center[2]).toBeCloseTo(0.5, 10);
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
