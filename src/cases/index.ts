import { registerCase } from '../core/cases';

import { numberLineDefinition } from './number-line';

let registered = false;

/** 注册全部内置案例。幂等，供应用入口与测试共用。 */
export function registerBuiltinCases(): void {
  if (registered) return;
  registered = true;
  registerCase(numberLineDefinition);
}
