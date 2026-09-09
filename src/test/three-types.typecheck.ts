import type { Html } from '@react-three/drei';
import type { RootState } from '@react-three/fiber';
import type { ComponentProps } from 'react';
import type { Group, Vector3 } from 'three';

type Assert<Condition extends true> = Condition;

/** 由 pnpm typecheck 执行：防止传递依赖再次引入不兼容的 Three.js 类型。 */
export type ThreeTypeCompatibility = [
  Assert<RootState['camera']['position'] extends Vector3 ? true : false>,
  Assert<{ current: Group }[] extends NonNullable<ComponentProps<typeof Html>['occlude']> ? true : false>,
];
