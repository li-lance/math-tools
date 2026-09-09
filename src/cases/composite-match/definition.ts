import { lazy } from 'react';

import type { CaseDefinition } from '../../core/cases';

import { compositeCodec, DEFAULT_STATE, type CompositeState } from './codec';

const runtime = lazy(() => import('./CompositeMatchCase'));

export const compositeMatchDefinition: CaseDefinition<CompositeState> = {
  id: 'composite-match',
  title: '组合体找不同',
  summary: '旋转观察参照组合体，找出四个选项中与它不同的那一个。',
  grades: [4, 5, 6],
  topics: ['shape-and-geometry'],
  capabilities: ['three-3d', 'direct-manipulation', 'parameter-control'],
  guidance: [
    '按住拖动旋转任意组合体，滚轮或双指缩放；「重置视角」回到初始角度。',
    '左边是参照组合体，右边 A、B、C、D 是四个选项；找出与参照体旋转后无法重合的那一个。',
    '每个小方块都是一块单位立方体，棱线帮助看清立方体的拆分。',
    '点击选项下方的字母按钮作答；「显示答案」会标出不同的组合体。',
    '切换「难度」或点「换一题」得到新题目；把链接发给同事会还原同一道题。',
  ],
  defaultState: DEFAULT_STATE,
  codec: compositeCodec,
  runtime,
  teachingReview: {
    objective: '通过旋转对照，识别与参照组合体旋转后能重合（同构）的组合体，并找出无法重合的那一个，锻炼空间想象。',
    gradeRange: '四至六年级（图形与几何·观察物体）',
    terminology: ['组合体', '单位立方体', '旋转', '重合'],
    parameterValidity: '难度为 1–3 级（约 4 / 5–6 / 7–8 块单位立方体），默认 2 级；种子为非负整数，默认 1，同一对难度与种子始终生成同一道题。',
    misrepresentationRisks: [
      '不同项与参照体块数相同，学生无法仅靠数块数判断，须通过旋转比对形状。',
      '参照体与选项颜色不同仅为区分身份，不代表数学含义；字母标签与位置也用于区分，不只依赖颜色。',
      '透视远近不代表实际尺寸；组合体由等大的单位立方体构成，棱线仅为观察拆分。',
      '相机俯仰角受限且禁止平移，避免视角翻转造成方向误判；提供「重置视角」。',
      '同一道题在四个选项中恰有三个与参照体旋转重合、一个不同，由生成器校验保证。',
    ],
    status: 'pending',
  },
};
