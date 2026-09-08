import { describe, expect, it } from 'vitest';

import { compositeCodec, DEFAULT_STATE, type CompositeState } from './codec';

describe('组合体找不同编解码', () => {
  it('空参数解码为默认状态且无提示', () => {
    const r = compositeCodec.decode(new URLSearchParams());
    expect(r.state).toEqual(DEFAULT_STATE);
    expect(r.issues).toEqual([]);
  });

  it('合法 level 与 seed 往返', () => {
    const state: CompositeState = { level: 3, seed: 42 };
    expect(compositeCodec.decode(compositeCodec.encode(state)).state).toEqual(state);
  });

  it('默认状态编码为空参数', () => {
    expect(compositeCodec.encode(DEFAULT_STATE).toString()).toBe('');
  });

  it('无效 level 恢复默认并提示', () => {
    const r = compositeCodec.decode(new URLSearchParams('level=9'));
    expect(r.state.level).toBe(DEFAULT_STATE.level);
    expect(r.issues.length).toBeGreaterThan(0);
  });

  it('无效 seed 恢复默认并提示', () => {
    const r = compositeCodec.decode(new URLSearchParams('seed=-1'));
    expect(r.state.seed).toBe(DEFAULT_STATE.seed);
    expect(r.issues.length).toBeGreaterThan(0);
  });
});
