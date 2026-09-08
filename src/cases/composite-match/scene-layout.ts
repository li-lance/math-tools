import { Box3, Sphere, Vector3 } from 'three';

import type { Solid } from './solid';

export const SOLID_FOV = 42;

/** 根据组合体包围球计算取景中心与相机距离。 */
export function fitSolid(solid: Solid): { center: [number, number, number]; distance: number } {
  const bounds = new Box3();
  for (const [x, y, z] of solid) {
    bounds.expandByPoint(new Vector3(x - 0.5, y - 0.5, z - 0.5));
    bounds.expandByPoint(new Vector3(x + 0.5, y + 0.5, z + 0.5));
  }
  const sphere = bounds.getBoundingSphere(new Sphere());
  const halfFov = (SOLID_FOV * Math.PI) / 360;
  const distance = (sphere.radius / Math.sin(halfFov)) * 1.15;
  return { center: sphere.center.toArray() as [number, number, number], distance };
}
