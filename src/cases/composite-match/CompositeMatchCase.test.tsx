import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_STATE } from './codec';
import CompositeMatchCase from './CompositeMatchCase';
import { generateProblem } from './generator';
import type { SolidSceneStyle } from './scene-style';

vi.mock('./scene-style', () => ({
  readSolidSceneStyle: (): SolidSceneStyle => ({
    cubeReference: '#abc', cubeOption: '#def', edgeColor: '#000',
    hemisphereSky: '#fff', hemisphereGround: '#888', hemisphereIntensity: 1,
    directionalColor: '#fff', directionalIntensity: 1, materialRoughness: 0.8,
  }),
}));

vi.mock('./SolidViewport', () => ({
  default: () => <div data-testid="solid-viewport" />,
}));

function renderCase() {
  const onStateChange = vi.fn();
  render(<CompositeMatchCase state={DEFAULT_STATE} onStateChange={onStateChange} />);
  return onStateChange;
}

function optionButton(letter: string) {
  return screen.getByRole('radio', { name: `选项 ${letter}` });
}

describe('组合体找不同', () => {
  it('渲染一个参照与四个选项', () => {
    renderCase();
    expect(screen.getAllByTestId('solid-viewport')).toHaveLength(5);
    for (const letter of ['A', 'B', 'C', 'D']) {
      expect(optionButton(letter)).toBeInTheDocument();
    }
  });

  it('选中正确答案显示答对', () => {
    renderCase();
    const answer = generateProblem(DEFAULT_STATE.level, DEFAULT_STATE.seed).answerIndex;
    const letters = ['A', 'B', 'C', 'D'];
    fireEvent.click(optionButton(letters[answer]!));
    expect(screen.getByRole('status')).toHaveTextContent('答对了');
  });

  it('选中错误答案提示再想想', () => {
    renderCase();
    const answer = generateProblem(DEFAULT_STATE.level, DEFAULT_STATE.seed).answerIndex;
    const wrong = (answer + 1) % 4;
    fireEvent.click(optionButton(['A', 'B', 'C', 'D'][wrong]!));
    expect(screen.getByRole('status')).toHaveTextContent('再想想');
  });

  it('方向键在选项间移动焦点', () => {
    renderCase();
    optionButton('A').focus();
    fireEvent.keyDown(optionButton('A'), { key: 'ArrowRight' });
    expect(optionButton('B')).toHaveFocus();
    fireEvent.keyDown(optionButton('B'), { key: 'ArrowDown' });
    expect(optionButton('D')).toHaveFocus();
  });

  it('显示答案标出不同项', () => {
    renderCase();
    fireEvent.click(screen.getByRole('button', { name: '显示答案' }));
    expect(screen.getByText('不同')).toBeInTheDocument();
  });

  it('换一题提交新种子并清空作答状态', () => {
    const onStateChange = renderCase();
    const answer = generateProblem(DEFAULT_STATE.level, DEFAULT_STATE.seed).answerIndex;
    fireEvent.click(optionButton(['A', 'B', 'C', 'D'][answer]!));
    fireEvent.click(screen.getByRole('button', { name: '换一题' }));
    expect(onStateChange).toHaveBeenCalledWith({ level: DEFAULT_STATE.level, seed: expect.any(Number) });
    for (const letter of ['A', 'B', 'C', 'D']) {
      expect(optionButton(letter)).toHaveAttribute('aria-checked', 'false');
    }
  });
});
