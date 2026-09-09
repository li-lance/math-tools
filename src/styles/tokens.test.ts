/// <reference types="node" />
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = resolve('src');
const tokens = readFileSync(resolve(root, 'styles/tokens.css'), 'utf8');
const consumers = readdirSync(root, { recursive: true }).map(String)
  .filter((path) => /\.(css|tsx?)$/.test(path) && !path.endsWith('tokens.css') && !path.includes('.test.'))
  .map((path) => [path, readFileSync(resolve(root, path), 'utf8')] as const);
const declarations = [...tokens.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)];
const values = new Map(declarations.map(([, name, value]) => [name!, value!]));
const references = (source: string) => [...source.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]!);

describe('全项目 design token 契约', () => {
  it('声明唯一，所有引用可解析且不形成循环', () => {
    expect(values.size).toBeGreaterThan(0);
    expect(values.size).toBe(declarations.length);
    const visit = (name: string, ancestors: string[] = []) => {
      expect(values.has(name), `未定义的 token: ${name}`).toBe(true);
      expect(ancestors, `循环引用: ${[...ancestors, name].join(' → ')}`).not.toContain(name);
      for (const next of references(values.get(name)!)) visit(next, [...ancestors, name]);
    };
    for (const name of values.keys()) visit(name);
    for (const [, source] of consumers) {
      for (const name of references(source)) visit(name);
      // Three.js 的类型化 schema 不使用 var()，也必须引用真实声明。
      for (const [, name] of source.matchAll(/['"](--[\w-]+)['"]/g)) visit(name!);
    }
  });

  it('组件只消费语义或组件 token，不直接使用色板或颜色字面量', () => {
    const violations = consumers.flatMap(([path, source]) => source.split('\n').flatMap((line, index) => {
      const rawColor = /#[\da-f]{3,8}\b|\brgba?\(|\bhsla?\(/i.test(line);
      return rawColor || /var\(--palette-/.test(line) ? [`${path}:${index + 1}: ${line.trim()}`] : [];
    }));
    expect(violations).toEqual([]);
  });

  it('CSS 排版、形状、线宽、透明度和层级不回流为魔法值', () => {
    const violations = consumers.filter(([path]) => path.endsWith('.css')).flatMap(([path, source]) => {
      const properties = [...source.matchAll(/(?:^|[;{])\s*(font-size|font-weight|letter-spacing|stroke-width|border-radius|opacity|z-index)\s*:\s*([^;}]+)/g)];
      return properties.filter(([, , value]) => !/var\(|^(?:0|1|inherit|normal|none)$/.test(value!.trim()))
        .map(([, property, value]) => `${path}: ${property}: ${value}`);
    });
    expect(violations).toEqual([]);
  });

  it('SVG 描边不通过 JSX 字面量绕过 token', () => {
    const violations = consumers.filter(([path]) => path.endsWith('.tsx')).flatMap(([path, source]) =>
      [...source.matchAll(/strokeWidth\s*=\s*(?:["'][\d.]+["']|\{[\d.]+\})/g)].map(([value]) => `${path}: ${value}`));
    expect(violations).toEqual([]);
  });

  it('布局断点统一为 600px 和 900px', () => {
    const breakpoints = consumers.flatMap(([, source]) => [...source.matchAll(/@media\s*\(max-width:\s*([^)]+)\)/g)].map((match) => match[1]));
    expect(breakpoints.length).toBeGreaterThan(0);
    for (const value of breakpoints) expect(['600px', '900px']).toContain(value);
  });
});
