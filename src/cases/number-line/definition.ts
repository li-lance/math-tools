import { lazy } from 'react';

import type { CaseDefinition } from '../../core/cases';

import { numberLineCodec } from './codec';
import { DEFAULT_PARAMS, type NumberLineParams } from './math';

const runtime = lazy(() => import('./NumberLineCase'));

export const numberLineDefinition: CaseDefinition<NumberLineParams> = {
  id: 'number-line',
  title: '可拖动数轴',
  summary: '在数轴上拖动一个点，观察整数与负数的位置关系。',
  grades: [6],
  topics: ['number-and-algebra'],
  capabilities: ['svg-2d', 'direct-manipulation', 'parameter-control'],
  guidance: [
    '拖动数轴上的圆点，或使用方向键移动它，观察点对应的数值。',
    '在「区间设置」中调整数轴的起点和终点，讨论区间的变化。',
    '把链接发给同事或保存下来，打开时会还原相同的区间和位置。',
  ],
  defaultState: DEFAULT_PARAMS,
  codec: numberLineCodec,
  runtime,
  teachingReview: {
    objective: '借助数轴直观认识整数与负数的大小和位置关系。',
    gradeRange: '六年级（负数初步认识）',
    terminology: ['数轴', '整数', '负数', '原点'],
    parameterValidity:
      '默认区间 -10 到 10、点在原点；区间端点限定为绝对值不超过 1000 的整数且起点小于终点。',
    misrepresentationRisks: [
      '区间跨度过大时刻度自动稀疏，已限制步长为 1、2、5 的倍数，避免刻度值难以认读。',
      '点的位置同时以数值文字显示，不依赖颜色或位置单独传达含义。',
    ],
    status: 'pending',
  },
};
