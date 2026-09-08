# 三维教具场景清晰度实施计划

> **For agentic workers:** Use executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 修复正方体标签穿透，以类似 3ds Max See-through 的半透明结构观察和可关闭参考网格改善空间辨识。

**Architecture:** 保留现有铰链几何和 URL codec。场景取景计算独立为案例内纯函数；相机、遮挡标签、参考网格仍由案例运行时负责。视角和网格开关为瞬时状态。

**Tech Stack:** React、React Three Fiber、drei、Three.js、Vitest、Playwright；不增加依赖。

## 约束

- 保留当前已确认的温暖课堂 UI，不改变面身份、展开路径及整数参数。
- UI 中文放在 `src/content/zh-CN.ts`，网格视觉值放在 `src/styles/tokens.css`。
- 不引入通用三维框架；不访问网络、路由、持久化。
- 默认只显示当前可见面的标签；平面展开状态六个面仍可辨认。

## Task 1：标签遮挡和取景

**Files:** `src/cases/cube-net/CubeNetCase.tsx`、`scene-layout.ts`、`scene-layout.test.ts`、`e2e/cube-net.spec.ts`。

**Interfaces:** `getSceneLayout(faces: readonly FaceTransform[], aspect: number)` 返回 `{ center: [number, number, number], distance: number, floorY: number }`。输入来自现有 `computeNetTransforms(t)`，视场角固定 42°；单位正方形四角计算包围球，取垂直/水平半视场角中较小者，距离为 `radius / Math.sin(halfFov) * 1.12`，地面为包围盒最低点下方 0.04。

- [x] 浏览器先复现：默认 `前/上/右` 可见，`后/左/下` 隐藏；展开后六个标签可见。
- [x] 单测先验证：默认 center 为零、floorY < -0.5；窄屏距离大于宽屏；0/50/100% 所有顶点投影位于安全范围。
- [x] 使用案例内 Raycaster，仅检测模型 group 中的实体面；检测点沿法线朝相机偏移 0.012，射线终点提前 0.006，避免自身共面闪烁。近乎侧向的标签隐藏；不以文字重命名来适应旋转。
- [x] 相机采用三分之四角度；在展开或视口尺寸变化时依包围球重新取景，保留旋转方向；重置恢复默认方向和当前展开状态的合适取景。
- [x] 执行 `pnpm test`、`pnpm build`、聚焦浏览器测试。

## Task 2：参考网格、视觉和验收

**Files:** `CubeNetCase.tsx`、`cube-net.css`、`src/content/zh-CN.ts`、`src/styles/tokens.css`、`src/cases/cube-net/definition.ts`、`docs/ui-guidelines.md`、`e2e/visual.spec.ts`。

**Interfaces:** 网格按钮使用 `aria-pressed`，默认 true；切换不修改 URL。网格只作为空间参照，不作为尺寸标尺。颜色读取 viewport 上的 CSS token；Grid 不参与标签射线遮挡。

- [x] 先测试 `参考网格` 按钮默认 pressed=true、键盘切换后 false，URL 不变。
- [x] 使用 drei Grid 绘制地平面，地面始终低于模型；半球光和方向光区分面朝向，面保持半透明。以无颜色深度预绘制区分遮挡：隐藏棱先画淡虚线，可见棱再按深度覆盖为实线；标签仍按实体遮挡。
- [x] 共享棱由 `scene-edges.ts` 在世界坐标中去重后绘制，避免相邻面虚线叠成实线；`scene-edges.test.ts` 覆盖折叠、半展开、完全展开的棱数、唯一性和单位长度。
- [x] 场景工具条移出模型覆盖区域，保留重置视角和参考网格，手机可换行。
- [x] 更新教学说明：名称是固定面身份，遮挡时隐藏；网格不是标尺，重置不改变展开程度。
- [x] 人工查看 1600×900 下 0/50/100% 和 360px 默认场景、旋转后场景，再更新截图。
- [x] 运行 `pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build`、`pnpm test:e2e`、`git diff --check`；独立审查改动。保留当前未提交的 UI 工作，不自动合并或推送。

## Task 3：统一 Three.js 类型（用户追加）

**Files:** `pnpm-workspace.yaml`、`package.json`、`pnpm-lock.yaml`、`src/test/three-types.typecheck.ts`、`docs/architecture.md`。

- [x] 编译期测试先捕获 Fiber 相机向量与本地 Vector3、drei Html 遮挡 ref 与本地 Group 的类型不兼容。
- [x] `pnpm why @types/three` 定位 stats-gl 的旧版 0.163.0 依赖；catalog + override 统一为配套 three@0.185.x 的 0.185.4。
- [x] 执行离线安装更新锁文件，再以 `--frozen-lockfile` 验证安装可复现；不改变 Three.js 运行时。
- [x] 再次检查依赖树只有一个类型版本、编译期测试通过、完整应用验证通过；记录已存在但与本修复无关的 peer 警告。

## 验证结果

- 51 项单元测试、29 项浏览器测试（含 8 项截图检查）通过；类型检查、lint、生产构建、diff 空白检查通过。
- 独立审查发现并修复共享棱虚线重复绘制问题，复核无新增发现。
- 安装仍提示已有的 eslint-plugin-jsx-a11y / ESLint 10、use-sync-external-store / React 19 peer 范围警告；本次不扩展修改这些依赖。生产构建仍有三维分块超过 500 kB 的体积提示。
