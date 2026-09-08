import { Quaternion, Vector3 } from 'three';

import type { FaceTransform } from './net';

export function getSceneEdges(faces: readonly FaceTransform[]): Vector3[] {
  const points: Vector3[] = [];
  const seen = new Set<string>();
  for (const face of faces) {
    const rotation = new Quaternion(...face.quaternion);
    const position = new Vector3(...face.position);
    const corners = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]]
      .map(([x, y]) => new Vector3(x, y, 0).applyQuaternion(rotation).add(position));
    for (const [index, start] of corners.entries()) {
      const end = corners[(index + 1) % corners.length]!;
      // 忽略铰链旋转浮点误差；共享棱只画一次，避免虚线相位叠成实线。
      const key = [start, end].map((point) => point.toArray().map((n) => Math.round(n * 1e6)).join(',')).sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      points.push(start, end);
    }
  }
  return points;
}
