# 项目 Design Token 实施计划

> **For agentic workers:** Use executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 将已确认的温暖课堂 UI 与半透明三维结构观察沉淀为全项目设计 token，保持当前外观。

**Architecture:** `src/styles/tokens.css` 是视觉值的唯一来源，分基础、语义、组件三层。CSS 直接消费变量；Three.js 由 `src/styles/read-tokens.ts` 读取经过验证的样式快照，再由案例内 `scene-style.ts` 映射到渲染属性。不建立通用渲染框架。

**Tech Stack:** CSS custom properties、TypeScript、Vitest、Playwright；无新增运行时或工具链依赖。静态源码检查显式声明已在依赖树中的 `@types/node` 开发类型，不增加新的安装包。

## Global Constraints

- 不增加暗色主题、Figma 同步或 token 生成工具链。
- 不改模型坐标、展开逻辑、相机算法、交互语义和 URL。
- 保留已有未提交工作；不自动提交、合并或推送。
- 900px / 600px 媒体查询断点以文档和检查统一，不使用无效的 `@media var(...)`。
- 样式只在挂载时读取：当前固定浅色主题，无热切主题接口。

## Task 1：Token 契约与现有 CSS 迁移

**Files:** `src/styles/tokens.css`、`global.css`、两个案例 CSS、`CaseArtwork.tsx`、`src/styles/tokens.test.ts`。

**Interfaces:** 保留既有变量名；增加 `--control-*`、`--card-*`、`--stage-*`、`--viz-*` 和 `--size-*` 语义。布局比例与辅助隐藏几何保留局部常量。

- [x] 先写失败检查：所有 `var(--name)` 均已定义、token 引用无循环，组件不得直接消费 `--palette-*`，CSS/TSX 中不得保留硬编码色值，字体粗细和视觉描边必须引用 token。
- [x] 运行 `pnpm exec vitest run src/styles/tokens.test.ts`，确认缺失与硬编码被捕获。
- [x] 补充基础色与既有值的语义别名，迁移禁用透明度、选中态、焦点、尺寸、字距、二维线宽；不改实际值。
- [x] 运行同一检查及 `pnpm typecheck`、`pnpm lint`；修正漏用或悬空变量。

## Task 2：三维 Token 读取与接入

**Files:** `src/styles/read-tokens.ts`、`read-tokens.test.ts`、`src/cases/cube-net/scene-style.ts`、`CubeNetCase.tsx`。

**Interfaces:** `readTokens<T extends Record<string, TokenRule>>(element: Element, schema: T)` 返回根据 `kind: 'color' | 'number'` 推导的类型化值。数值必须完整匹配无单位十进制并在 schema 的 min/max 内；颜色只接受 RGB 十六进制。缺失或非法值抛错，由既有案例错误边界恢复，不以重复默认值掩盖问题。

- [x] 测试缺失值、非法颜色、NaN/Infinity、带单位数字、超范围、合法零值，以及正常颜色和数值的读取。
- [x] 实现 reader；案例 schema 使用语义变量 `--viz-3d-*`（六种色、棱线、透明度、网格、灯光、材质）并保留固定面身份映射。
- [x] `Scene` 使用 `useState(() => readCubeNetSceneStyle(document.documentElement))` 读取一次；替换 JSX 视觉字面量。标签 DOM 层级使用同一读取机制，渲染排序和数学常量仍留在案例。
- [x] 单测、typecheck、lint、build；以浏览器检查 CSS token 能影响三维样式且默认外观不变。

## Task 3：文档、验收和审查

**Files:** `docs/design-tokens.md`、`docs/ui-guidelines.md`、`docs/architecture.md`、`AGENTS.md`、相关测试。

- [x] 文档列出分层、命名、单位、默认值权威来源、控件状态、二维/三维使用示例、非 token 边界、断点、维护流程。
- [x] 增加浏览器计算样式检查，覆盖焦点、禁用/选中态和三维 token 快照读取。
- [x] 跑 `pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm build`、`pnpm test:e2e`、`git diff --check`。默认截图不主动更新；有差异先调查，不掩盖外观漂移。
- [x] 按 requesting-code-review 技能独立审查，处理实际问题后交付。

## 验证记录

- 静态检查先捕获组件色值、字重、字距与描边硬编码，再逐项迁移；声明和引用无环检查通过。
- 公开读取接口对字面 schema 保留精确类型，对宽化 schema 正确返回 string | number；编译期测试先红后绿。
- 合法三维透明度用例证明挂载快照与重新挂载更新；临时断开 opacity token 接线后，画布变化比例为 0，用例如期失败，恢复接线后通过。
- 独立审查提出的正向渲染验收缺口已补齐，复核无阻断问题。
- 保留所有已有 UI 改动，未提交、合并或推送；本次未更新截图基线。
