import { readTokens } from '../../styles/read-tokens';

const color = (name: `--${string}`) => ({ name, kind: 'color' } as const);
const number = (name: `--${string}`, min: number, max: number) => ({ name, kind: 'number', min, max } as const);

export const solidSceneTokenSchema = {
  cubeReference: color('--viz-3d-cube-reference'),
  cubeOption: color('--viz-3d-cube-option'),
  edgeColor: color('--viz-3d-edge-color'),
  hemisphereSky: color('--viz-3d-light-hemisphere-sky'),
  hemisphereGround: color('--viz-3d-light-hemisphere-ground'),
  hemisphereIntensity: number('--viz-3d-light-hemisphere-intensity', 0, 10),
  directionalColor: color('--viz-3d-light-directional-color'),
  directionalIntensity: number('--viz-3d-light-directional-intensity', 0, 10),
  materialRoughness: number('--viz-3d-material-roughness', 0, 1),
} as const;

export type SolidSceneStyle = ReturnType<typeof readSolidSceneStyle>;

export function readSolidSceneStyle(element: Element) {
  return readTokens(element, solidSceneTokenSchema);
}
