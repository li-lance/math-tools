import { describe, expect, it } from 'vitest';

import { registerBuiltinCases } from '../cases';
import { listCaseDefinitions } from '../core/cases';

registerBuiltinCases();

const definitions = listCaseDefinitions();

describe('案例契约', () => {
  it('至少注册了一个案例', () => {
    expect(definitions.length).toBeGreaterThan(0);
  });

  it('案例标识符唯一', () => {
    const ids = definitions.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(definitions.map((d) => [d.id, d] as const))('%s：元数据完整', (_id, definition) => {
    expect(definition.title.length).toBeGreaterThan(0);
    expect(definition.summary.length).toBeGreaterThan(0);
    expect(definition.grades.length).toBeGreaterThan(0);
    expect(definition.topics.length).toBeGreaterThan(0);
    expect(definition.guidance.length).toBeGreaterThan(0);
    expect(definition.runtime).toBeDefined();
  });

  it.each(definitions.map((d) => [d.id, d] as const))('%s：教学评审信息完整', (_id, definition) => {
    const review = definition.teachingReview;
    expect(review.objective.length).toBeGreaterThan(0);
    expect(review.gradeRange.length).toBeGreaterThan(0);
    expect(review.terminology.length).toBeGreaterThan(0);
    expect(review.parameterValidity.length).toBeGreaterThan(0);
    expect(['pending', 'approved']).toContain(review.status);
  });

  it.each(definitions.map((d) => [d.id, d] as const))(
    '%s：默认参数编解码往返且无修复项',
    (_id, definition) => {
      const encoded = definition.codec.encode(definition.defaultState);
      const decoded = definition.codec.decode(encoded);
      expect(decoded.state).toEqual(definition.defaultState);
      expect(decoded.issues).toEqual([]);
    },
  );

  it.each(definitions.map((d) => [d.id, d] as const))(
    '%s：空 URL 解码为文档化默认值',
    (_id, definition) => {
      const decoded = definition.codec.decode(new URLSearchParams());
      expect(decoded.state).toEqual(definition.defaultState);
      expect(decoded.issues).toEqual([]);
    },
  );

  it.each(definitions.map((d) => [d.id, d] as const))(
    '%s：编码结果解码后保持同一状态（幂等）',
    (_id, definition) => {
      const once = definition.codec.decode(definition.codec.encode(definition.defaultState));
      const twice = definition.codec.decode(definition.codec.encode(once.state));
      expect(twice.state).toEqual(once.state);
    },
  );
});
