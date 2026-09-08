import { Grid, Html, Line, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef, useState, type ComponentRef, type RefObject } from 'react';
import { DoubleSide, Group, Quaternion, Raycaster, Vector3 } from 'three';

import { copy } from '../../content/zh-CN';
import type { CaseRuntimeProps } from '../../core/cases';

import type { CubeNetState } from './codec';
import { computeNetTransforms, type FaceId, type FaceTransform } from './net';
import { getSceneLayout, SCENE_FOV } from './scene-layout';
import { getSceneEdges } from './scene-edges';
import { readCubeNetSceneStyle } from './scene-style';
import './cube-net.css';

const CAMERA_POSITION: [number, number, number] = [3, 2.4, 4];
const text = copy.cubeNet;

/** 标签朝相机略微离开面，避免共面射线误判；仅实体面参与遮挡。 */
function FaceLabel({ face, model, zIndexRange }: {
  face: FaceTransform;
  model: RefObject<Group>;
  zIndexRange: [number, number];
}) {
  const label = useRef<HTMLSpanElement>(null);
  const scratch = useRef({
    normal: new Vector3(),
    position: new Vector3(),
    rotation: new Quaternion(),
    towardCamera: new Vector3(),
    rayTarget: new Vector3(),
    rayDirection: new Vector3(),
    raycaster: new Raycaster(),
  });

  useFrame(({ camera }) => {
    const vectors = scratch.current;
    vectors.normal.set(0, 0, 1).applyQuaternion(vectors.rotation.set(...face.quaternion));
    vectors.position.set(...face.position);
    const facing = vectors.normal.dot(vectors.towardCamera.copy(camera.position).sub(vectors.position).normalize());
    const target = vectors.rayTarget.copy(vectors.normal).multiplyScalar(facing >= 0 ? 0.012 : -0.012).add(vectors.position);
    vectors.rayDirection.copy(target).sub(camera.position);
    vectors.raycaster.far = vectors.rayDirection.length() - 0.006;
    vectors.raycaster.set(camera.position, vectors.rayDirection.normalize());
    model.current.updateWorldMatrix(true, true);
    const obscured = vectors.raycaster.intersectObject(model.current, true).length > 0;
    if (label.current) label.current.style.visibility = Math.abs(facing) < 0.18 || obscured ? 'hidden' : 'visible';
  });

  return (
    <Html center style={{ pointerEvents: 'none' }} zIndexRange={zIndexRange}>
      <span ref={label} className="cube-net__face-label" style={{ visibility: 'hidden' }}>
        {text.faces[face.id]}
      </span>
    </Html>
  );
}

function Scene({ faces, resetKey, showGrid }: {
  faces: readonly FaceTransform[]; resetKey: number; showGrid: boolean;
}) {
  const model = useRef<Group>(null!);
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const lastResetKey = useRef(-1);
  const { camera, size } = useThree();
  const edges = useMemo(() => getSceneEdges(faces), [faces]);
  const layout = useMemo(() => getSceneLayout(faces, size.width / Math.max(size.height, 1)), [faces, size.width, size.height]);
  const [sceneStyle] = useState(() => readCubeNetSceneStyle(document.documentElement));
  const faceColors: Record<FaceId, string> = {
    front: sceneStyle.faceFront, back: sceneStyle.faceBack, top: sceneStyle.faceTop,
    bottom: sceneStyle.faceBottom, left: sceneStyle.faceLeft, right: sceneStyle.faceRight,
  };
  const labelZIndexRange: [number, number] = [sceneStyle.labelZIndexMax, sceneStyle.labelZIndexMin];

  useLayoutEffect(() => {
    const orbit = controls.current;
    if (!orbit) return;
    const direction = lastResetKey.current === resetKey
      ? camera.position.clone().sub(orbit.target).normalize()
      : new Vector3(...CAMERA_POSITION).normalize();
    lastResetKey.current = resetKey;
    orbit.target.set(...layout.center);
    camera.position.copy(direction.multiplyScalar(layout.distance).add(orbit.target));
    orbit.minDistance = layout.distance * 0.65;
    orbit.maxDistance = layout.distance * 1.8;
    orbit.update();
  }, [camera, layout, resetKey]);

  return (
    <>
      <hemisphereLight args={[
        sceneStyle.hemisphereSky,
        sceneStyle.hemisphereGround,
        sceneStyle.hemisphereIntensity,
      ]} />
      <directionalLight
        position={[4, 7, 5]}
        color={sceneStyle.directionalColor}
        intensity={sceneStyle.directionalIntensity}
      />
      {showGrid && (
        <Grid
          position={[0, layout.floorY, 0]} args={[12, 12]}
          cellSize={0.5} sectionSize={1}
          cellColor={sceneStyle.gridMinor} sectionColor={sceneStyle.gridMajor}
          cellThickness={sceneStyle.gridCellThickness} sectionThickness={sceneStyle.gridSectionThickness}
          fadeDistance={sceneStyle.gridFadeDistance} fadeStrength={sceneStyle.gridFadeStrength} infiniteGrid
        />
      )}
      <group ref={model}>
        {faces.map((face) => (
          <group key={face.id} position={face.position} quaternion={face.quaternion}>
            {/* 深度预绘制只判定棱线遮挡，不绘制不透明颜色。 */}
            <mesh renderOrder={-1} raycast={() => null}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial side={DoubleSide} colorWrite={false} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
            </mesh>
            <mesh renderOrder={1}>
              <planeGeometry args={[1, 1]} />
              <meshStandardMaterial
                color={faceColors[face.id]} side={DoubleSide} roughness={sceneStyle.materialRoughness}
                transparent opacity={sceneStyle.materialOpacity} depthWrite={false} depthTest={false}
              />
            </mesh>
            <FaceLabel face={face} model={model} zIndexRange={labelZIndexRange} />
          </group>
        ))}
        {/* 共享棱先去重：隐藏棱画淡虚线，可见棱按深度覆盖为实线。 */}
        <Line points={edges} segments raycast={() => null}
          color={sceneStyle.edgeColor} lineWidth={sceneStyle.hiddenEdgeWidth}
          transparent opacity={sceneStyle.hiddenEdgeOpacity}
          dashed dashSize={sceneStyle.hiddenEdgeDashSize} gapSize={sceneStyle.hiddenEdgeGapSize}
          depthTest={false} depthWrite={false} renderOrder={2} />
        <Line points={edges} segments raycast={() => null}
          color={sceneStyle.edgeColor} lineWidth={sceneStyle.visibleEdgeWidth}
          transparent opacity={sceneStyle.visibleEdgeOpacity}
          depthTest depthWrite={false} renderOrder={3} />
      </group>
      <OrbitControls
        ref={controls} makeDefault enablePan={false} enableDamping={false}
        minPolarAngle={0.15} maxPolarAngle={Math.PI * 0.55}
      />
    </>
  );
}

export default function CubeNetCase({ state, onStateChange }: CaseRuntimeProps<CubeNetState>) {
  const [resetKey, setResetKey] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const faces = useMemo(() => computeNetTransforms(state.unfold / 100), [state.unfold]);

  return (
    <div className="cube-net">
      <div className="cube-net__view-tools">
        <p>{text.viewHint}</p>
        <div>
          <button type="button" aria-pressed={showGrid} onClick={() => setShowGrid((value) => !value)}>
            {text.grid}
          </button>
          <button type="button" onClick={() => setResetKey((value) => value + 1)}>
            {text.resetView}
          </button>
        </div>
      </div>
      <div className="cube-net__viewport">
        <Canvas camera={{ position: CAMERA_POSITION, fov: SCENE_FOV }} dpr={[1, 2]} role="img" aria-label={text.sceneLabel(state.unfold)}>
          <Scene faces={faces} resetKey={resetKey} showGrid={showGrid} />
        </Canvas>
      </div>
      <p className="cube-net__grid-hint">{text.structureHint}{showGrid ? ` · ${text.gridHint}` : ''}</p>
      <div className="cube-net__controls">
        <label>
          {text.unfoldAmount}
          <input
            type="range" min={0} max={100} step={1} value={state.unfold}
            onChange={(event) => onStateChange({ unfold: Number(event.target.value) })}
          />
          <output className="cube-net__unfold-value">{state.unfold}%</output>
        </label>
        <button type="button" onClick={() => onStateChange({ unfold: 0 })}>{text.fold}</button>
        <button type="button" onClick={() => onStateChange({ unfold: 100 })}>{text.unfold}</button>
      </div>
    </div>
  );
}
