import { describe, expect, it, vi } from 'vitest';

import { readSolidSceneStyle, solidSceneTokenSchema } from './scene-style';

describe('组合体场景样式', () => {
  it('所有三维视觉值均由 --viz-3d-* token 提供', () => {
    expect(Object.values(solidSceneTokenSchema).every(({ name }) => name.startsWith('--viz-3d-'))).toBe(true);
    expect(Object.keys(solidSceneTokenSchema)).toEqual([
      'cubeReference', 'cubeOption', 'edgeColor',
      'hemisphereSky', 'hemisphereGround', 'hemisphereIntensity',
      'directionalColor', 'directionalIntensity', 'materialRoughness',
    ]);
  });

  it('从根元素读取类型化场景样式', () => {
    const values = Object.fromEntries(Object.values(solidSceneTokenSchema).map((rule) => [
      rule.name, rule.kind === 'color' ? '#abc' : '1',
    ]));
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (name: string) => values[name] ?? '',
    } as CSSStyleDeclaration);

    const style = readSolidSceneStyle(document.documentElement);

    expect(style.cubeReference).toBe('#abc');
    expect(style.materialRoughness).toBe(1);
    expect(window.getComputedStyle).toHaveBeenCalledOnce();
    vi.restoreAllMocks();
  });
});
