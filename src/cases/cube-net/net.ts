/**
 * 正方体展开图的纯几何逻辑。不依赖 React；three 仅用于矩阵计算。
 *
 * 模型：六个面各是一个单位正方形，前面（front）固定不动，其余面沿铰链边
 * 展开。t = 0 为折好的正方体，t = 1 为完全摊平的十字展开图：
 *
 *        后
 *        上
 *   左   前   右
 *        下
 *
 * 展开图所在平面是前面的平面（z = 0.5），后面挂在上的远端，需要两级铰链。
 */

import { Euler, Matrix4, Quaternion, Vector3 } from 'three';

export type FaceId = 'front' | 'back' | 'top' | 'bottom' | 'left' | 'right';

export interface FaceTransform {
  id: FaceId;
  position: [number, number, number];
  quaternion: [number, number, number, number];
}

const HALF = 0.5;

interface FaceNode {
  id: FaceId;
  /** t = 0 时（折好的正方体）的世界变换。 */
  folded: Matrix4;
  parent?: FaceId;
  /** 铰链边中点与轴向，在父面的局部坐标系中表达。 */
  hingePoint?: [number, number, number];
  hingeAxis?: [number, number, number];
  /** 展开旋转方向。 */
  hingeSign?: 1 | -1;
}

function foldedMatrix(
  position: [number, number, number],
  euler: [number, number, number],
): Matrix4 {
  return new Matrix4().compose(
    new Vector3(...position),
    new Quaternion().setFromEuler(new Euler(...euler)),
    new Vector3(1, 1, 1),
  );
}

const NODES: readonly FaceNode[] = [
  { id: 'front', folded: foldedMatrix([0, 0, HALF], [0, 0, 0]) },
  {
    id: 'top',
    folded: foldedMatrix([0, HALF, 0], [-Math.PI / 2, 0, 0]),
    parent: 'front',
    hingePoint: [0, HALF, 0],
    hingeAxis: [1, 0, 0],
    hingeSign: 1,
  },
  {
    id: 'bottom',
    folded: foldedMatrix([0, -HALF, 0], [Math.PI / 2, 0, 0]),
    parent: 'front',
    hingePoint: [0, -HALF, 0],
    hingeAxis: [1, 0, 0],
    hingeSign: -1,
  },
  {
    id: 'right',
    folded: foldedMatrix([HALF, 0, 0], [0, Math.PI / 2, 0]),
    parent: 'front',
    hingePoint: [HALF, 0, 0],
    hingeAxis: [0, 1, 0],
    hingeSign: -1,
  },
  {
    id: 'left',
    folded: foldedMatrix([-HALF, 0, 0], [0, -Math.PI / 2, 0]),
    parent: 'front',
    hingePoint: [-HALF, 0, 0],
    hingeAxis: [0, 1, 0],
    hingeSign: 1,
  },
  {
    id: 'back',
    folded: foldedMatrix([0, 0, -HALF], [0, Math.PI, 0]),
    parent: 'top',
    hingePoint: [0, HALF, 0],
    hingeAxis: [1, 0, 0],
    hingeSign: 1,
  },
];

function clamp01(t: number): number {
  return Math.min(Math.max(t, 0), 1);
}

/**
 * 计算展开程度 t ∈ [0,1] 下六个面的世界变换。
 * 每个子面随父面链式运动：C(t) = P(t) · 铰链旋转 · 折叠时相对位姿。
 */
export function computeNetTransforms(t: number): FaceTransform[] {
  const angle = clamp01(t) * (Math.PI / 2);
  const byId = new Map(NODES.map((node) => [node.id, node]));
  const world = new Map<FaceId, Matrix4>();

  const resolve = (node: FaceNode): Matrix4 => {
    const cached = world.get(node.id);
    if (cached) return cached;

    let matrix: Matrix4;
    if (!node.parent) {
      matrix = node.folded.clone();
    } else {
      const parent = byId.get(node.parent);
      if (!parent || !node.hingePoint || !node.hingeAxis || !node.hingeSign) {
        throw new Error(`展开图节点缺少铰链定义：${node.id}`);
      }
      const relativeFolded = parent.folded.clone().invert().multiply(node.folded);
      const [px, py, pz] = node.hingePoint;
      const hingeRotation = new Matrix4()
        .makeTranslation(px, py, pz)
        .multiply(
          new Matrix4().makeRotationAxis(
            new Vector3(...node.hingeAxis),
            angle * node.hingeSign,
          ),
        )
        .multiply(new Matrix4().makeTranslation(-px, -py, -pz));
      matrix = resolve(parent).clone().multiply(hingeRotation).multiply(relativeFolded);
    }

    world.set(node.id, matrix);
    return matrix;
  };

  return NODES.map((node) => {
    const matrix = resolve(node);
    const position = new Vector3();
    const quaternion = new Quaternion();
    matrix.decompose(position, quaternion, new Vector3());
    return {
      id: node.id,
      position: [position.x, position.y, position.z],
      quaternion: [quaternion.x, quaternion.y, quaternion.z, quaternion.w],
    };
  });
}
