import type { CaseStateCodec, DecodeResult } from '../../core/cases';

/** 案例的教学参数：展开程度，0（折好的正方体）到 100（完全摊平）。 */
export interface CubeNetState {
  unfold: number;
}

export const DEFAULT_STATE: CubeNetState = { unfold: 0 };

const KEY = 'unfold';

function decode(params: URLSearchParams): DecodeResult<CubeNetState> {
  const raw = params.get(KEY);
  if (raw === null) return { state: { ...DEFAULT_STATE }, issues: [] };

  const parsed = /^-?\d+$/.test(raw) ? Number.parseInt(raw, 10) : null;
  if (parsed === null) {
    return { state: { ...DEFAULT_STATE }, issues: ['展开程度无效，已恢复默认值'] };
  }
  if (parsed < 0 || parsed > 100) {
    return {
      state: { unfold: Math.min(Math.max(parsed, 0), 100) },
      issues: ['展开程度超出 0–100，已调整到范围内'],
    };
  }
  return { state: { unfold: parsed }, issues: [] };
}

function encode(state: CubeNetState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.unfold !== DEFAULT_STATE.unfold) params.set(KEY, String(state.unfold));
  return params;
}

export const cubeNetCodec: CaseStateCodec<CubeNetState> = { decode, encode };
