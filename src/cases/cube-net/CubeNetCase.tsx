import { Edges, Html, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useRef, type ComponentRef } from 'react';
import { DoubleSide } from 'three';

import type { CaseRuntimeProps } from '../../core/cases';

import type { CubeNetState } from './codec';
import { computeNetTransforms, type FaceId } from './net';
import './cube-net.css';

const FACE_LABELS: Record<FaceId, string> = {
  front: '前',
  back: '后',
  top: '上',
  bottom: '下',
  left: '左',
  right: '右',
};

/** 面的区分色始终配合文字标注，不单独依赖颜色（见教学评审信息）。 */
const FACE_COLORS: Record<FaceId, string> = {
  front: '#dbeafe',
  back: '#ede9fe',
  top: '#dcfce7',
  bottom: '#fef3c7',
  left: '#fee2e2',
  right: '#e0f2fe',
};

const EDGE_COLOR = '#334155';
const CAMERA_POSITION: [number, number, number] = [3, 2.2, 4];

export default function CubeNetCase({ state, onStateChange }: CaseRuntimeProps<CubeNetState>) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const t = state.unfold / 100;
  // 摊平时展开图整体上移，观察目标随之在立方体中心与展开图中心之间过渡。
  const target: [number, number, number] = [0, 0.5 * t, 0.5 * t];

  const resetView = () => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.object.position.set(...CAMERA_POSITION);
    controls.target.set(...target);
    controls.update();
  };

  const faces = computeNetTransforms(t);

  return (
    <div className="cube-net">
      <div className="cube-net__viewport">
        <Canvas
          camera={{ position: CAMERA_POSITION, fov: 40 }}
          dpr={[1, 2]}
          role="img"
          aria-label={`三维场景：正方体展开图，当前展开程度 ${state.unfold}%`}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 5]} intensity={1} />
          {faces.map((face) => (
            <group key={face.id} position={face.position} quaternion={face.quaternion}>
              <mesh>
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial
                  color={FACE_COLORS[face.id]}
                  side={DoubleSide}
                  roughness={0.85}
                />
                <Edges color={EDGE_COLOR} />
              </mesh>
              <Html center style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
                <span className="cube-net__face-label">{FACE_LABELS[face.id]}</span>
              </Html>
            </group>
          ))}
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enablePan={false}
            minDistance={3}
            maxDistance={9}
            minPolarAngle={0.15}
            maxPolarAngle={Math.PI * 0.55}
            target={target}
          />
        </Canvas>
        <button type="button" className="cube-net__reset-view" onClick={resetView}>
          重置视角
        </button>
      </div>

      <div className="cube-net__controls">
        <label>
          展开程度
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={state.unfold}
            onChange={(event) => onStateChange({ unfold: Number(event.target.value) })}
          />
          <output className="cube-net__unfold-value">{state.unfold}%</output>
        </label>
        <button type="button" onClick={() => onStateChange({ unfold: 0 })}>
          折叠
        </button>
        <button type="button" onClick={() => onStateChange({ unfold: 100 })}>
          展开
        </button>
      </div>
    </div>
  );
}
