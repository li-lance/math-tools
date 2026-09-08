import { Box3, Quaternion, Sphere, Vector3 } from 'three';

import type { FaceTransform } from './net';

export const SCENE_FOV = 42;

export function getSceneLayout(faces: readonly FaceTransform[], aspect: number): {
  center: [number, number, number]; distance: number; floorY: number;
} {
  const bounds = new Box3();
  for (const face of faces) {
    const rotation = new Quaternion(...face.quaternion);
    const position = new Vector3(...face.position);
    for (const x of [-0.5, 0.5]) for (const y of [-0.5, 0.5]) {
      bounds.expandByPoint(new Vector3(x, y, 0).applyQuaternion(rotation).add(position));
    }
  }
  const sphere = bounds.getBoundingSphere(new Sphere());
  const verticalHalfFov = SCENE_FOV * Math.PI / 360;
  const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * Math.max(aspect, 0.1));
  const distance = sphere.radius / Math.sin(Math.min(verticalHalfFov, horizontalHalfFov)) * 1.12;
  return { center: sphere.center.toArray(), distance, floorY: bounds.min.y - 0.04 };
}
