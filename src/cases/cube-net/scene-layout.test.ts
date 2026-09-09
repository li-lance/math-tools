import { PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';

import { computeNetTransforms } from './net';
import { getSceneLayout, SCENE_FOV } from './scene-layout';

describe('三维场景取景', () => {
  it('默认正方体居中，参考面位于模型下方', () => {
    const layout = getSceneLayout(computeNetTransforms(0), 16 / 9);
    for (const coordinate of layout.center) expect(coordinate).toBeCloseTo(0, 10);
    expect(layout.floorY).toBeLessThan(-0.5);
    expect(layout.distance).toBeLessThan(4);
  });

  it('窄画布使用更远距离容纳模型', () => {
    expect(getSceneLayout(computeNetTransforms(1), 0.8).distance)
      .toBeGreaterThan(getSceneLayout(computeNetTransforms(1), 16 / 9).distance);
  });

  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    for (const aspect of [0.8, 16 / 9]) {
      it(`${t * 100}% 展开 / 宽高比 ${aspect}：模型完整位于视口内`, () => {
        const faces = computeNetTransforms(t);
        const layout = getSceneLayout(faces, aspect);
        const camera = new PerspectiveCamera(SCENE_FOV, aspect, 0.1, 100);
        const center = new Vector3(...layout.center);
        camera.position.copy(new Vector3(3, 2.4, 4).normalize().multiplyScalar(layout.distance).add(center));
        camera.lookAt(center);
        camera.updateMatrixWorld();
        for (const face of faces) {
          for (const x of [-0.5, 0.5]) for (const y of [-0.5, 0.5]) {
            const point = new Vector3(x, y, 0)
              .applyQuaternion(new Quaternion(...face.quaternion))
              .add(new Vector3(...face.position));
            expect(point.y).toBeGreaterThan(layout.floorY);
            point.project(camera);
            expect(Math.abs(point.x)).toBeLessThan(0.95);
            expect(Math.abs(point.y)).toBeLessThan(0.95);
          }
        }
      });
    }
  }
});
