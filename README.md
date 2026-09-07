# Math Tools（数学工具）

面向小学数学课堂的交互式演示工具集。简体中文界面，纯浏览器运行，无需账号与后端。教师在电脑、投影仪或教学一体机上打开一个案例，调节受控参数，把抽象的数学概念变成可操作的演示。

## 内置案例

| 案例 | 年级 | 主题 | 说明 |
| --- | --- | --- | --- |
| 可拖动数轴 | 六年级 | 数与代数 | 在数轴上拖动一个点（支持鼠标、触控、键盘），观察整数与负数的位置关系；区间端点可调 |
| 正方体展开图 | 五年级 | 图形与几何 | 三维旋转观察正方体，控制它沿棱展开成十字平面图再折叠回去；相机受限并提供重置视角 |

每个案例的教学参数（如数轴区间、展开程度）都编码在 URL 中——把链接发给同事或保存下来，打开即还原相同的演示状态。

## 快速开始

环境要求：

- Node 24 LTS（见 `.nvmrc`）
- pnpm（推荐 `corepack enable`，版本由 `package.json` 的 `packageManager` 锁定）

```sh
pnpm install
pnpm dev        # 本地开发，默认 http://localhost:5173
```

构建产物是纯静态文件，可用任意静态服务器托管：

```sh
pnpm build      # 输出到 dist/
pnpm preview    # 本地预览构建产物
```

克隆本仓库后执行 `pnpm install && pnpm dev` 即可运行；不依赖任何私有服务。

## 开发命令

```sh
pnpm test       # 单元、案例契约与组件测试（Vitest + Testing Library）
pnpm typecheck  # TypeScript 严格模式检查
pnpm lint       # ESLint（含可访问性规则）
pnpm test:e2e   # Playwright 端到端（首次需 pnpm exec playwright install chromium）
```

## 技术栈

TypeScript 严格模式 · React 19 · Vite · react-router · Three.js（React Three Fiber，三维案例懒加载分包）· Vitest · Playwright · pnpm

## 仓库结构

```text
src/app/             应用入口、路由、全局错误边界
src/cases/           案例（每个案例一个独立目录：定义 + 运行时 + 纯数学逻辑 + 测试）
src/core/cases/      案例契约、注册表、URL 编解码协议
src/features/        案例库、详情、演示外壳
src/components/      可复用的课堂 UI
src/content/         集中管理的简体中文界面文案与分类词汇
src/styles/          设计令牌（全项目唯一视觉来源）与全局样式
src/test/            共享测试支持与案例契约测试
e2e/                 Playwright 端到端与截图回归
```

## 文档

- `CONTEXT.md` — 产品定位、用户、领域语言、产品规则与非目标
- `docs/architecture.md` — 当前架构、模块归属与依赖方向
- `docs/ui-guidelines.md` — UI 风格规范（简洁课堂风）
- `docs/adr/` — 长期架构决策记录
- `AGENTS.md` — 工程规则与命令契约

## 路线图

第一个里程碑交付三个代表性案例（数轴 ✅、正方体展开图 ✅、分数切分待定）与案例框架，随后是 PWA 离线支持与 GitHub Pages 发布。不计划的方向（账号、云同步、AI 生成案例、通用编辑器等）见 `CONTEXT.md` 的非目标清单。

## License

见 `LICENSE`。
