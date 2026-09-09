import { Edges, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef, type ComponentRef } from 'react';
import { Vector3 } from 'three';

import type { Solid } from './solid';
import { fitSolid, SOLID_FOV } from './scene-layout';
import type { SolidSceneStyle } from './scene-style';

const CAMERA_DIRECTION: [number, number, number] = [3, 2.4, 4];

interface SolidViewportProps {
  solid: Solid;
  label: string;
  cubeColor: string;
  style: SolidSceneStyle;
  resetKey: number;
}

function SolidScene({ solid, cubeColor, style, resetKey }: {
  solid: Solid; cubeColor: string; style: SolidSceneStyle; resetKey: number;
}) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const lastResetKey = useRef(-1);
  const { camera } = useThree();
  const layout = useMemo(() => fitSolid(solid), [solid]);

  useLayoutEffect(() => {
    const orbit = controls.current;
    if (!orbit) return;
    const isReset = lastResetKey.current !== resetKey;
    lastResetKey.current = resetKey;
    const direction = isReset
      ? new Vector3(...CAMERA_DIRECTION).normalize()
      : camera.position.clone().sub(orbit.target).normalize();
    orbit.target.set(...layout.center);
    camera.position.copy(direction.multiplyScalar(layout.distance).add(orbit.target));
    orbit.minDistance = layout.distance * 0.5;
    orbit.maxDistance = layout.distance * 2.5;
    orbit.update();
  }, [camera, layout, resetKey]);

  return (
    <>
      <hemisphereLight args={[style.hemisphereSky, style.hemisphereGround, style.hemisphereIntensity]} />
      <directionalLight position={[4, 7, 5]} color={style.directionalColor} intensity={style.directionalIntensity} />
      <group>
        {solid.map(([x, y, z], index) => (
          <mesh key={index} position={[x, y, z]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={cubeColor} roughness={style.materialRoughness} />
            <Edges color={style.edgeColor} />
          </mesh>
        ))}
      </group>
      <OrbitControls
        ref={controls} makeDefault enablePan={false} enableDamping={false}
        minPolarAngle={0.15} maxPolarAngle={Math.PI * 0.55}
      />
    </>
  );
}

export default function SolidViewport({ solid, label, cubeColor, style, resetKey }: SolidViewportProps) {
  return (
    <Canvas camera={{ position: CAMERA_DIRECTION, fov: SOLID_FOV }} dpr={[1, 2]} role="img" aria-label={label}>
      <SolidScene solid={solid} cubeColor={cubeColor} style={style} resetKey={resetKey} />
    </Canvas>
  );
}
