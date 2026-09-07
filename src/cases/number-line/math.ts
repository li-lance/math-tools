/**
 * 数轴案例的纯数学逻辑。不依赖 React 或渲染层。
 * 数轴只使用整数：点的值、区间端点与刻度都是整数。
 */

export interface NumberLineParams {
  /** 点当前所在的整数值。 */
  value: number;
  /** 区间左端点（整数）。 */
  min: number;
  /** 区间右端点（整数），必须大于 min。 */
  max: number;
}

export const DEFAULT_PARAMS: NumberLineParams = { value: 0, min: -10, max: 10 };

/** 区间端点允许的绝对值上限，防止 URL 传入无法在屏幕上表达的区间。 */
export const INTERVAL_LIMIT = 1000;

/** 屏幕上最多容纳的刻度间隔数；超过时放大刻度步长。 */
const MAX_TICK_INTERVALS = 20;

/** 刻度步长只允许 1、2、5 的幂次倍，保证刻度值始终可读。 */
const TICK_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500] as const;

export function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** 吸附到最近的整数；已在边界处由 clampValue 处理越界。 */
export function snapToInteger(value: number): number {
  return Math.round(value);
}

/** 为给定区间选择刻度步长：刻度间隔数不超过 MAX_TICK_INTERVALS。 */
export function tickStep(min: number, max: number): number {
  const span = max - min;
  for (const step of TICK_STEPS) {
    if (span / step <= MAX_TICK_INTERVALS) return step;
  }
  return TICK_STEPS[TICK_STEPS.length - 1] as number;
}

/**
 * 生成区间内所有刻度值（含端点方向第一个 ≥min 且 ≤max 的步长倍数）。
 * 保证包含 min 和 max，即使它们不是步长的整数倍。
 */
export function generateTicks(min: number, max: number): number[] {
  const step = tickStep(min, max);
  const ticks: number[] = [];
  const first = Math.ceil(min / step) * step;
  for (let t = first; t <= max; t += step) {
    ticks.push(t);
  }
  if (!ticks.includes(min)) ticks.unshift(min);
  if (!ticks.includes(max)) ticks.push(max);
  return ticks;
}

/** 值到归一化位置（0 = min 端，1 = max 端）。 */
export function valueToPosition(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

/** 归一化位置还原为值（未吸附）。 */
export function positionToValue(position: number, min: number, max: number): number {
  return min + position * (max - min);
}
