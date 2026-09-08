import { readTokens } from '../../styles/read-tokens';

const color = (name: `--${string}`) => ({ name, kind: 'color' } as const);
const number = (name: `--${string}`, min: number, max: number) => ({ name, kind: 'number', min, max } as const);

export const cubeNetSceneTokenSchema = {
  faceFront: color('--viz-3d-face-front'),
  faceBack: color('--viz-3d-face-back'),
  faceTop: color('--viz-3d-face-top'),
  faceBottom: color('--viz-3d-face-bottom'),
  faceLeft: color('--viz-3d-face-left'),
  faceRight: color('--viz-3d-face-right'),
  hemisphereSky: color('--viz-3d-light-hemisphere-sky'),
  hemisphereGround: color('--viz-3d-light-hemisphere-ground'),
  hemisphereIntensity: number('--viz-3d-light-hemisphere-intensity', 0, 10),
  directionalColor: color('--viz-3d-light-directional-color'),
  directionalIntensity: number('--viz-3d-light-directional-intensity', 0, 10),
  materialRoughness: number('--viz-3d-material-roughness', 0, 1),
  materialOpacity: number('--viz-3d-material-opacity', 0, 1),
  gridMinor: color('--viz-3d-grid-minor'),
  gridMajor: color('--viz-3d-grid-major'),
  gridCellThickness: number('--viz-3d-grid-cell-thickness', 0, 10),
  gridSectionThickness: number('--viz-3d-grid-section-thickness', 0, 10),
  gridFadeDistance: number('--viz-3d-grid-fade-distance', 0.000001, 100),
  gridFadeStrength: number('--viz-3d-grid-fade-strength', 0, 10),
  edgeColor: color('--viz-3d-edge-color'),
  hiddenEdgeWidth: number('--viz-3d-edge-hidden-width', 0, 10),
  hiddenEdgeOpacity: number('--viz-3d-edge-hidden-opacity', 0, 1),
  hiddenEdgeDashSize: number('--viz-3d-edge-hidden-dash-size', 0, 10),
  hiddenEdgeGapSize: number('--viz-3d-edge-hidden-gap-size', 0, 10),
  visibleEdgeWidth: number('--viz-3d-edge-visible-width', 0, 10),
  visibleEdgeOpacity: number('--viz-3d-edge-visible-opacity', 0, 1),
  labelZIndexMax: number('--viz-3d-label-z-index-max', -1000000, 1000000),
  labelZIndexMin: number('--viz-3d-label-z-index-min', -1000000, 1000000),
} as const;

export type CubeNetSceneStyle = ReturnType<typeof readCubeNetSceneStyle>;

export function readCubeNetSceneStyle(element: Element) {
  return readTokens(element, cubeNetSceneTokenSchema);
}
