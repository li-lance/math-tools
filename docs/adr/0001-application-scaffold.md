# ADR-0001：应用脚手架选型

## 状态

已接受（2026-09-07）

## 背景

首个交付需要确定应用脚手架的基础选型。约束来自 `docs/architecture.md`：模块化 React 单体、TypeScript 严格模式、命令契约（dev/test/typecheck/lint/build/test:e2e）、他人克隆仓库后可本地运行。

## 决定

- **Node 24 LTS**：当前活跃 LTS，固定在 `.nvmrc` 与 `package.json` 的 `engines`。
- **pnpm**：通过 `packageManager` 字段钉版本，`pnpm-lock.yaml` 入库，保证克隆后依赖一致。
- **Vite + React 19**：单一构建产物为纯静态文件。
- **TypeScript 6 严格模式**：不使用 TypeScript 7（原生实现），因为 typescript-eslint 尚不支持其 API。
- **react-router**：三条路由（案例库 / 详情 / 演示），`basename` 取自 Vite `BASE_URL`，为将来子路径部署留口。
- **纯 CSS + 设计令牌**：样式集中在 `src/styles/`，不引入 CSS 框架。
- **Vitest + Testing Library + Playwright**：单元/契约/组件测试与端到端测试分层。
- **案例运行时懒加载**：案例定义在模块作用域创建 `React.lazy` 包装；`lazy` 只在首次渲染时触发动态 import，因此元数据常驻而运行时分包。

## 推迟的决定

PWA 离线缓存、GitHub Pages base path 与部署、版本更新提示，推迟到第四个交付，脚手架不为其预留结构。

## 后果

- 升级 TypeScript 大版本前需确认 typescript-eslint 的支持状态。
- 新增案例的运行时自动成为独立分包；共享依赖由 Vite 合并到主包。
