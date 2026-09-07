import { lazy } from 'react';

import type { CaseDefinition } from '../../core/cases';

import { cubeNetCodec, DEFAULT_STATE, type CubeNetState } from './codec';

const runtime = lazy(() => import('./CubeNetCase'));

export const cubeNetDefinition: CaseDefinition<CubeNetState> = {
  id: 'cube-net',
  title: '正方体展开图',
  summary: '旋转观察正方体，控制它沿棱展开成平面图，再折叠回去。',
  grades: [5],
  topics: ['shape-and-geometry'],
  capabilities: ['three-3d', 'direct-manipulation', 'parameter-control'],
  guidance: [
    '按住拖动旋转正方体，滚轮或双指缩放；「重置视角」回到初始角度。',
    '拖动「展开程度」滑杆，或点「展开」「折叠」，观察六个面如何摊成平面图。',
    '展开到 100% 时，观察十字形展开图：前面居中，后面挂在最上方。',
    '把链接发给同事或保存下来，打开时会还原相同的展开程度。',
  ],
  defaultState: DEFAULT_STATE,
  codec: cubeNetCodec,
  runtime,
  teachingReview: {
    objective: '通过展开与折叠建立正方体与其展开图之间的空间对应关系。',
    gradeRange: '五年级（长方体和正方体）',
    terminology: ['正方体', '展开图', '面', '棱'],
    parameterValidity: '展开程度为 0–100 的整数，默认 0（折好的正方体）。',
    misrepresentationRisks: [
      '每个面同时用颜色和「前/后/上/下/左/右」文字标注，不只依赖颜色区分。',
      '相机俯仰角受限且禁止平移，避免视角翻转造成方向误判；提供重置视角。',
      '展开图固定为十字形一种，课堂上应说明正方体共有 11 种展开图。',
    ],
    status: 'pending',
  },
};
