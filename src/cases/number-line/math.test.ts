import { expect, it } from 'vitest';

import {
  clampValue,
  DEFAULT_PARAMS,
  generateTicks,
  INTERVAL_LIMIT,
  positionToValue,
  snapToInteger,
  tickStep,
  valueToPosition,
} from './math';

it('clampValue 将值限制在区间内', () => {
  expect(clampValue(5, -10, 10)).toBe(5);
  expect(clampValue(-20, -10, 10)).toBe(-10);
  expect(clampValue(20, -10, 10)).toBe(10);
});

it('snapToInteger 吸附到最近整数', () => {
  expect(snapToInteger(3.4)).toBe(3);
  expect(snapToInteger(3.5)).toBe(4);
  expect(snapToInteger(-3.5)).toBe(-3);
});

it('tickStep 保证刻度间隔数不超过上限', () => {
  expect(tickStep(-10, 10)).toBe(1);
  expect(tickStep(0, 100)).toBe(5);
  expect(tickStep(-INTERVAL_LIMIT, INTERVAL_LIMIT)).toBe(100);
  for (const [min, max] of [[0, 1], [-7, 33], [-1000, 1000]] as const) {
    expect((max - min) / tickStep(min, max)).toBeLessThanOrEqual(20);
  }
});

it('generateTicks 总是包含区间端点', () => {
  expect(generateTicks(-10, 10)).toEqual([
    -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  ]);
  const ticks = generateTicks(3, 97);
  expect(ticks[0]).toBe(3);
  expect(ticks[ticks.length - 1]).toBe(97);
  expect(ticks).toContain(5);
});

it('generateTicks 的刻度单调递增且无重复', () => {
  const ticks = generateTicks(-13, 41);
  for (let i = 1; i < ticks.length; i += 1) {
    expect(ticks[i]).toBeGreaterThan(ticks[i - 1] as number);
  }
});

it('valueToPosition 与 positionToValue 互逆', () => {
  expect(valueToPosition(0, -10, 10)).toBe(0.5);
  expect(positionToValue(0.5, -10, 10)).toBe(0);
  for (const v of [-10, -3, 0, 7, 10]) {
    expect(positionToValue(valueToPosition(v, -10, 10), -10, 10)).toBeCloseTo(v);
  }
});

it('默认参数合法且自洽', () => {
  expect(DEFAULT_PARAMS.min).toBeLessThan(DEFAULT_PARAMS.max);
  expect(DEFAULT_PARAMS.value).toBeGreaterThanOrEqual(DEFAULT_PARAMS.min);
  expect(DEFAULT_PARAMS.value).toBeLessThanOrEqual(DEFAULT_PARAMS.max);
});
