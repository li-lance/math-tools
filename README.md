# Math Tools（数学工具）

面向小学数学课堂的交互式演示工具集，简体中文，纯浏览器运行。

## 环境要求

- Node 24 LTS（见 `.nvmrc`）
- pnpm（推荐通过 `corepack enable` 提供，版本见 `package.json` 的 `packageManager`）

## 快速开始

```sh
pnpm install
pnpm dev        # 本地开发
```

构建与检查：

```sh
pnpm test       # 单元、契约与组件测试
pnpm typecheck
pnpm lint
pnpm build      # 产出纯静态文件到 dist/，可用任意静态服务器托管
pnpm test:e2e   # 端到端测试（首次需 pnpm exec playwright install chromium）
```

把仓库复制给他人后，对方只需满足上面的环境要求并执行 `pnpm install && pnpm dev` 即可使用；`pnpm build` 的产物是自包含的静态站点。

## 文档

- `CONTEXT.md` — 产品语言、用户、规则与非目标
- `docs/architecture.md` — 当前架构与模块归属
- `docs/adr/` — 长期架构决策
- `AGENTS.md` — 工程规则与命令契约
