import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import { readTokens, type TokenRule } from './read-tokens';

const element = document.documentElement;

function computed(values: Record<string, string>) {
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    getPropertyValue: (name: string) => values[name] ?? '',
  } as CSSStyleDeclaration);
}

afterEach(() => vi.restoreAllMocks());

describe('readTokens', () => {
  it('按字面 schema 推导各字段的精确类型', () => {
    computed({ '--ink': '#abc', '--width': '1' });
    const result = readTokens(element, {
      ink: { name: '--ink', kind: 'color' },
      width: { name: '--width', kind: 'number', min: 0, max: 2 },
    });

    expectTypeOf(result.ink).toEqualTypeOf<string>();
    expectTypeOf(result.width).toEqualTypeOf<number>();
  });

  it('宽化 schema 的值保留 string 与 number 联合类型', () => {
    computed({ '--value': '1' });
    const schema: Record<string, TokenRule> = {
      value: { name: '--value', kind: 'number', min: 0, max: 2 },
    };

    expectTypeOf(readTokens(element, schema)).toEqualTypeOf<Record<string, string | number>>();
  });

  it('一次读取 computed style 并解析颜色与数字', () => {
    computed({ '--ink': '#AbC', '--width': '1.25' });

    expect(readTokens(element, {
      ink: { name: '--ink', kind: 'color' },
      width: { name: '--width', kind: 'number', min: 0, max: 2 },
    })).toEqual({ ink: '#AbC', width: 1.25 });
    expect(window.getComputedStyle).toHaveBeenCalledOnce();
  });

  it('保留合法的数字 0', () => {
    computed({ '--value': '0' });
    expect(readTokens(element, {
      value: { name: '--value', kind: 'number', min: 0, max: 1 },
    }).value).toBe(0);
  });

  it.each([
    ['', '缺失'],
    ['NaN', 'NaN'],
    ['Infinity', 'Infinity'],
    ['1px', '单位'],
    ['1e2', '指数'],
  ])('拒绝非法数字 %s（%s）', (value) => {
    computed({ '--value': value });
    expect(() => readTokens(element, {
      value: { name: '--value', kind: 'number', min: 0, max: 10 },
    })).toThrow('--value');
  });

  it.each(['red', '#abcd', '#12', '#12345678', ''])('拒绝非法颜色 %s', (value) => {
    computed({ '--color': value });
    expect(() => readTokens(element, {
      color: { name: '--color', kind: 'color' },
    })).toThrow('--color');
  });

  it.each(['-0.01', '1.01'])('拒绝范围外数字 %s', (value) => {
    computed({ '--value': value });
    expect(() => readTokens(element, {
      value: { name: '--value', kind: 'number', min: 0, max: 1 },
    })).toThrow('--value');
  });
});
