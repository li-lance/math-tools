import type { CaseStateCodec, DecodeResult } from '../../core/cases';

import {
  clampValue,
  DEFAULT_PARAMS,
  INTERVAL_LIMIT,
  type NumberLineParams,
} from './math';

const KEYS = { value: 'value', min: 'min', max: 'max' } as const;

function parseInteger(raw: string): number | null {
  if (!/^-?\d+$/.test(raw)) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isSafeInteger(n) ? n : null;
}

function decode(params: URLSearchParams): DecodeResult<NumberLineParams> {
  const state: NumberLineParams = { ...DEFAULT_PARAMS };
  const issues: string[] = [];

  const rawMin = params.get(KEYS.min);
  if (rawMin !== null) {
    const parsed = parseInteger(rawMin);
    if (parsed !== null && Math.abs(parsed) <= INTERVAL_LIMIT) {
      state.min = parsed;
    } else {
      issues.push('区间起点无效，已恢复默认值');
    }
  }

  const rawMax = params.get(KEYS.max);
  if (rawMax !== null) {
    const parsed = parseInteger(rawMax);
    if (parsed !== null && Math.abs(parsed) <= INTERVAL_LIMIT) {
      state.max = parsed;
    } else {
      issues.push('区间终点无效，已恢复默认值');
    }
  }

  if (state.min >= state.max) {
    state.min = DEFAULT_PARAMS.min;
    state.max = DEFAULT_PARAMS.max;
    issues.push('区间起点必须小于终点，已恢复默认区间');
  }

  const rawValue = params.get(KEYS.value);
  if (rawValue !== null) {
    const parsed = parseInteger(rawValue);
    if (parsed !== null && parsed >= state.min && parsed <= state.max) {
      state.value = parsed;
    } else if (parsed !== null) {
      state.value = clampValue(parsed, state.min, state.max);
      issues.push('点的位置超出区间，已移动到区间内');
    } else {
      issues.push('点的位置无效，已恢复默认值');
    }
  } else {
    // 默认值可能落在自定义区间之外；静默夹入区间，不属于参数错误。
    state.value = clampValue(state.value, state.min, state.max);
  }

  return { state, issues };
}

/** 只编码与默认值不同的参数，保持分享链接简洁。 */
function encode(state: NumberLineParams): URLSearchParams {
  const params = new URLSearchParams();
  if (state.value !== DEFAULT_PARAMS.value) params.set(KEYS.value, String(state.value));
  if (state.min !== DEFAULT_PARAMS.min) params.set(KEYS.min, String(state.min));
  if (state.max !== DEFAULT_PARAMS.max) params.set(KEYS.max, String(state.max));
  return params;
}

export const numberLineCodec: CaseStateCodec<NumberLineParams> = { decode, encode };
