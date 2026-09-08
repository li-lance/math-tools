import { describe, expect, it, vi } from 'vitest';

import { cubeNetSceneTokenSchema, readCubeNetSceneStyle } from './scene-style';

describe('正方体展开场景样式', () => {
  it('所有三维视觉值均由 --viz-3d-* token 提供', () => {
    expect(Object.values(cubeNetSceneTokenSchema).every(({ name }) => name.startsWith('--viz-3d-'))).toBe(true);
    expect(Object.keys(cubeNetSceneTokenSchema)).toEqual([
      'faceFront', 'faceBack', 'faceTop', 'faceBottom', 'faceLeft', 'faceRight',
      'hemisphereSky', 'hemisphereGround', 'hemisphereIntensity',
      'directionalColor', 'directionalIntensity', 'materialRoughness', 'materialOpacity',
      'gridMinor', 'gridMajor', 'gridCellThickness', 'gridSectionThickness',
      'gridFadeDistance', 'gridFadeStrength', 'edgeColor', 'hiddenEdgeWidth',
      'hiddenEdgeOpacity', 'hiddenEdgeDashSize', 'hiddenEdgeGapSize',
      'visibleEdgeWidth', 'visibleEdgeOpacity', 'labelZIndexMax', 'labelZIndexMin',
    ]);
  });

  it('从根元素读取类型化场景样式', () => {
    const values = Object.fromEntries(Object.values(cubeNetSceneTokenSchema).map((rule) => [
      rule.name, rule.kind === 'color' ? '#abc' : '1',
    ]));
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (name: string) => values[name] ?? '',
    } as CSSStyleDeclaration);

    const style = readCubeNetSceneStyle(document.documentElement);

    expect(style.faceFront).toBe('#abc');
    expect(style.materialOpacity).toBe(1);
    expect(window.getComputedStyle).toHaveBeenCalledOnce();
    vi.restoreAllMocks();
  });
});
