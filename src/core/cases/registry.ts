import type { AnyCaseDefinition, CaseDefinition } from './types';

const definitions = new Map<string, AnyCaseDefinition>();

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * 注册一个内置案例。定义在案例目录内保持强类型；
 * 这里擦除为 unknown 状态是框架的唯一类型边界。
 */
export function registerCase<S>(definition: CaseDefinition<S>): void {
  if (!ID_PATTERN.test(definition.id)) {
    throw new Error(`案例标识符必须是 kebab-case：${definition.id}`);
  }
  if (definitions.has(definition.id)) {
    throw new Error(`重复的案例标识符：${definition.id}`);
  }
  definitions.set(definition.id, definition as AnyCaseDefinition);
}

export function getCaseDefinition(id: string): AnyCaseDefinition | undefined {
  return definitions.get(id);
}

/** 按注册顺序返回全部案例定义（元数据常驻）。 */
export function listCaseDefinitions(): AnyCaseDefinition[] {
  return [...definitions.values()];
}
