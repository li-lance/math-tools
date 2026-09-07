import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { DEFAULT_PARAMS, type NumberLineParams } from './math';
import NumberLineCase from './NumberLineCase';

function renderCase(state: NumberLineParams = DEFAULT_PARAMS) {
  const onStateChange = vi.fn();
  render(<NumberLineCase state={state} onStateChange={onStateChange} />);
  return onStateChange;
}

beforeAll(() => {
  // jsdom 不计算布局；给定固定的 SVG 视口以映射指针坐标。
  vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: 1000,
    height: 320,
    right: 1000,
    bottom: 320,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
});

describe('数轴渲染', () => {
  it('渲染 slider，并暴露当前值与区间', () => {
    renderCase();
    const slider = screen.getByRole('slider', { name: '数轴上的点' });
    expect(slider).toHaveAttribute('aria-valuenow', '0');
    expect(slider).toHaveAttribute('aria-valuemin', '-10');
    expect(slider).toHaveAttribute('aria-valuemax', '10');
  });

  it('刻度标签覆盖默认区间端点与原点', () => {
    renderCase();
    for (const label of ['-10', '0', '10']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });
});

describe('键盘交互', () => {
  it('右方向键将点加一', () => {
    const onStateChange = renderCase();
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
    expect(onStateChange).toHaveBeenCalledWith({ ...DEFAULT_PARAMS, value: 1 });
  });

  it('左方向键在区间左端不再移动', () => {
    const onStateChange = renderCase({ ...DEFAULT_PARAMS, value: -10 });
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft' });
    expect(onStateChange).not.toHaveBeenCalled();
  });

  it('Home/End 跳到区间端点', () => {
    const onStateChange = renderCase();
    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(onStateChange).toHaveBeenCalledWith({ ...DEFAULT_PARAMS, value: -10 });
    fireEvent.keyDown(slider, { key: 'End' });
    expect(onStateChange).toHaveBeenCalledWith({ ...DEFAULT_PARAMS, value: 10 });
  });
});

describe('指针拖动', () => {
  it('按下并松开后提交吸附后的整数值', () => {
    const onStateChange = renderCase();
    const stage = screen.getByRole('img', { name: /数轴/ });
    // clientX 530 → 位置 (530-60)/880 ≈ 0.534 → 值 ≈ 0.68 → 吸附为 1
    fireEvent.pointerDown(stage, { clientX: 530 });
    fireEvent.pointerUp(window, { clientX: 530 });
    expect(onStateChange).toHaveBeenCalledWith({ ...DEFAULT_PARAMS, value: 1 });
  });

  it('拖回原位置时不提交', () => {
    const onStateChange = renderCase();
    const stage = screen.getByRole('img', { name: /数轴/ });
    // 值 0 对应 clientX = 60 + 0.5*880 = 500
    fireEvent.pointerDown(stage, { clientX: 500 });
    fireEvent.pointerUp(window, { clientX: 500 });
    expect(onStateChange).not.toHaveBeenCalled();
  });
});

describe('区间设置', () => {
  it('提交合法的新区间', () => {
    const onStateChange = renderCase();
    fireEvent.blur(screen.getByLabelText('起点'), { target: { value: '-20' } });
    expect(onStateChange).toHaveBeenCalledWith({ min: -20, max: 10, value: 0 });
  });

  it('新区间夹入超出范围的当前值', () => {
    const onStateChange = renderCase({ ...DEFAULT_PARAMS, value: 8 });
    fireEvent.blur(screen.getByLabelText('终点'), { target: { value: '5' } });
    expect(onStateChange).toHaveBeenCalledWith({ min: -10, max: 5, value: 5 });
  });

  it('拒绝起点不小于终点的输入', () => {
    const onStateChange = renderCase();
    fireEvent.blur(screen.getByLabelText('起点'), { target: { value: '20' } });
    expect(onStateChange).not.toHaveBeenCalled();
  });
});
