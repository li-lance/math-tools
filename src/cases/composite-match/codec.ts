import type { CaseStateCodec, DecodeResult } from '../../core/cases';
import type { Level } from './generator';

/** 案例的教学参数：难度等级与题目种子。 */
export interface CompositeState {
  level: Level;
  seed: number;
}

export const DEFAULT_STATE: CompositeState = { level: 2, seed: 1 };

const LEVEL_KEY = 'level';
const SEED_KEY = 'seed';
const LEVELS: readonly Level[] = [1, 2, 3];

function decode(params: URLSearchParams): DecodeResult<CompositeState> {
  const state: CompositeState = { ...DEFAULT_STATE };
  const issues: string[] = [];

  const levelRaw = params.get(LEVEL_KEY);
  if (levelRaw !== null) {
    const level = Number(levelRaw);
    if (LEVELS.includes(level as Level)) state.level = level as Level;
    else issues.push('难度无效，已恢复默认值');
  }

  const seedRaw = params.get(SEED_KEY);
  if (seedRaw !== null) {
    const seed = /^\d+$/.test(seedRaw) ? Number(seedRaw) : null;
    if (seed !== null && Number.isSafeInteger(seed) && seed >= 0) state.seed = seed;
    else issues.push('种子无效，已恢复默认值');
  }

  return { state, issues };
}

function encode(state: CompositeState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.level !== DEFAULT_STATE.level) params.set(LEVEL_KEY, String(state.level));
  if (state.seed !== DEFAULT_STATE.seed) params.set(SEED_KEY, String(state.seed));
  return params;
}

export const compositeCodec: CaseStateCodec<CompositeState> = { decode, encode };
