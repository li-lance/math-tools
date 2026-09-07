import { Quaternion, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';

import { computeNetTransforms, type FaceId } from './net';

function faceAt(t: number, id: FaceId) {
  const face = computeNetTransforms(t).find((f) => f.id === id);
  if (!face) throw new Error(`缺少面：${id}`);
  return face;
}

function normalOf(t: number, id: FaceId): Vector3 {
  const { quaternion } = faceAt(t, id);
  return new Vector3(0, 0, 1).applyQuaternion(new Quaternion(...quaternion));
}

function expectPosition(t: number, id: FaceId, expected: [number, number, number]) {
  const { position } = faceAt(t, id);
  expect(position[0]).toBeCloseTo(expected[0], 6);
  expect(position[1]).toBeCloseTo(expected[1], 6);
  expect(position[2]).toBeCloseTo(expected[2], 6);
}

function expectNormal(t: number, id: FaceId, expected: [number, number, number]) {
  const normal = normalOf(t, id);
  expect(normal.x).toBeCloseTo(expected[0], 6);
  expect(normal.y).toBeCloseTo(expected[1], 6);
  expect(normal.z).toBeCloseTo(expected[2], 6);
}

describe('t = 0：折好的正方体', () => {
  it('六个面的中心位于单位正方体表面', () => {
    expectPosition(0, 'front', [0, 0, 0.5]);
    expectPosition(0, 'back', [0, 0, -0.5]);
    expectPosition(0, 'top', [0, 0.5, 0]);
    expectPosition(0, 'bottom', [0, -0.5, 0]);
    expectPosition(0, 'left', [-0.5, 0, 0]);
    expectPosition(0, 'right', [0.5, 0, 0]);
  });

  it('六个面的法线朝外', () => {
    expectNormal(0, 'front', [0, 0, 1]);
    expectNormal(0, 'back', [0, 0, -1]);
    expectNormal(0, 'top', [0, 1, 0]);
    expectNormal(0, 'bottom', [0, -1, 0]);
    expectNormal(0, 'left', [-1, 0, 0]);
    expectNormal(0, 'right', [1, 0, 0]);
  });
});

describe('t = 1：完全摊平的十字展开图', () => {
  it('所有面共面于前面的平面（z = 0.5）', () => {
    for (const face of computeNetTransforms(1)) {
      expect(face.position[2]).toBeCloseTo(0.5, 6);
    }
  });

  it('呈十字布局，后面挂在上的远端', () => {
    expectPosition(1, 'front', [0, 0, 0.5]);
    expectPosition(1, 'top', [0, 1, 0.5]);
    expectPosition(1, 'bottom', [0, -1, 0.5]);
    expectPosition(1, 'left', [-1, 0, 0.5]);
    expectPosition(1, 'right', [1, 0, 0.5]);
    expectPosition(1, 'back', [0, 2, 0.5]);
  });

  it('所有面的法线一致朝上（+z）', () => {
    for (const id of ['front', 'back', 'top', 'bottom', 'left', 'right'] as FaceId[]) {
      expectNormal(1, id, [0, 0, 1]);
    }
  });
});

describe('展开过程', () => {
  it('中间状态不产生非法数值', () => {
    for (const t of [0.25, 0.5, 0.75]) {
      for (const face of computeNetTransforms(t)) {
        for (const component of [...face.position, ...face.quaternion]) {
          expect(Number.isFinite(component)).toBe(true);
        }
      }
    }
  });

  it('t 超出 [0,1] 时被夹取', () => {
    expect(computeNetTransforms(-1)).toEqual(computeNetTransforms(0));
    expect(computeNetTransforms(2)).toEqual(computeNetTransforms(1));
  });
});
