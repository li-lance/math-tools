# Design Token：温暖课堂工作台

本规范将当前页面、二维教具和半透明三维教具的视觉值统一管理。默认保持纸色、墨蓝、珊瑚色与浅色教具的现有外观，不提供暗色主题。

## 权威来源与分层

[tokens.css](../src/styles/tokens.css) 是唯一取值来源；本文解释用途和单位，不维护第二份默认值表。[UI 规范](ui-guidelines.md) 负责页面模式与教学可读性。

| 层级 | 命名 | 使用边界 |
| --- | --- | --- |
| 基础 | `--palette-*`、`--space-*`、`--font-*`、`--weight-*`、`--radius-*`、`--shadow-*`、`--motion-*` | 原始色板与尺度；组件不直接使用 palette |
| 语义 | `--color-*`、`--size-*`、`--viz-*` | 文字、表面、数学结构、尺寸和可视化角色 |
| 组件 | `--control-*`、`--input-*`、`--card-*`、`--stage-*`、`--viz-3d-face-*` | 将共享语义映射到具体控件/场景，可独立调整而不改全局品牌 |

引用方向为组件 → 语义 → 基础，允许排版、间距直接消费基础尺度。现有名称保留兼容，不为了命名整齐而重复创建同义 token。单一用途的场景值可直接声明在对应分组，不能在 TS 或案例 CSS 再复制默认值。

## 覆盖范围

| 类别 | 主要 token | 规则 |
| --- | --- | --- |
| 页面与文字 | `--color-bg/surface/stage`、`--color-text/text-secondary` | 纸色外围、明亮舞台、墨蓝文字；不以装饰颜色替代文字对比 |
| 品牌与操作 | `--color-brand-mark`、`--color-primary*`、`--color-on-primary` | 主操作为深珊瑚；浅珊瑚只用于辅助底色 |
| 反馈 | `--color-focus`、`--color-danger/danger-soft`、`--color-overlay` | 焦点环与错误语义分离；danger 是错误角色，不为尚不存在的 toast 创建状态体系 |
| 教具配色 | `--color-manipulative-*`、`--color-axis`、`--color-art-*` | 六种教具色与静态插图色各自有角色，均须配合文字/线型 |
| 排版 | `--font-*`、`--line-height-*`、`--weight-*`、`--letter-spacing-*` | 系统中文字体，正文/辅助/标题/数学数值各有尺度 |
| 空间与形状 | `--space-*`、`--radius-*`、`--border-*` | 4px 基数；控件、卡片、舞台逐级圆角 |
| 尺寸 | `--touch-target`、`--page-*`、`--stage-width`、`--size-*` | 页面、预览、对话框、画布、输入区域按用途命名，不按页面文件名命名 |
| 阴影、动效、层级 | `--shadow-*`、`--motion-*`、`--ease-feedback`、`--z-floating` | 反馈动效遵循 reduced-motion；数学对象不加装饰阴影 |
| 二维描边 | `--viz-axis-width`、`--viz-tick-width`、`--viz-handle-*`、`--viz-art-*`、`--viz-icon-line-width` | 按 SVG 用户坐标渲染，不能与 CSS 边框宽度混为一个 token |

### 控件状态

| 状态 | Token | 行为 |
| --- | --- | --- |
| 默认 | `--control-surface/text/border` | 描边次操作；输入使用相同表面、文字与边框 |
| Hover | `--control-hover-surface/border` | 浅珊瑚底和操作色边框 |
| Primary | `--control-primary-surface/text/shadow` | 深珊瑚按钮、白字、轻底部阴影 |
| Primary hover / active | `--control-primary-hover/active` | 递进加深，按下时移除阴影 |
| 次操作 active | 默认/hover 色与 `box-shadow: none` | 沿用当前表现，不为了补 token 创造新颜色 |
| Selected | `--control-selected-surface/text/border` | 适用于参考网格等 `aria-pressed` 控件；选中语义不是仅 hover |
| Focus-visible | `--control-focus-color/width/offset` | 与其他状态叠加，不能被阴影替代 |
| Disabled | `--control-disabled-opacity` | 保留原色并降低透明度，使用原生 disabled 禁止交互 |
| 尺寸与反馈 | `--control-height/radius/padding-*`、`--control-feedback-*` | 点击目标、形状、反馈时长和曲线统一 |
| 输入专用 | `--input-padding-inline/placeholder-color/focus-border` | 输入横向留白、占位文字和聚焦边框；禁用态与按钮共用透明度 |

不要把 disabled 当作只改变颜色；也不要让一个静态 class 冒充 `aria-pressed`、`:focus-visible` 等真实状态。

### 三维教具

三维样式仍使用相同 CSS 来源，由 [scene-style.ts](../src/cases/cube-net/scene-style.ts) 声明字段、类型和有效范围。

| Token 组 | 用途 | 单位 |
| --- | --- | --- |
| `--viz-3d-face-*` | 固定前/后/上/下/左/右映射到通用教具色 | RGB 十六进制 |
| `--viz-3d-material-opacity/roughness` | 半透明表面与粗糙度 | 无单位，0–1 |
| `--viz-3d-edge-color` | 棱线色 | RGB 十六进制 |
| `--viz-3d-edge-visible-*`、`--viz-3d-edge-hidden-*` | 实线/淡虚线宽度和透明度 | 线宽为屏幕像素；透明度无单位 |
| `--viz-3d-edge-hidden-dash-size/gap-size` | 虚线段与间隔 | 场景世界单位，非 CSS px |
| `--viz-3d-grid-minor/major` | 地面参考线颜色 | RGB 十六进制；兼容既有 `--color-3d-grid-*` |
| `--viz-3d-grid-cell-thickness/section-thickness` | 网格 shader 线宽参数 | 无单位 shader 系数 |
| `--viz-3d-grid-fade-distance/fade-strength` | 网格远处淡出 | 距离为世界单位，强度无单位；距离须大于零 |
| `--viz-3d-light-*` | 半球光与方向光颜色/强度 | 颜色为 RGB 十六进制，强度为渲染参数 |
| `--viz-3d-label-z-index-min/max` | Html 标签 DOM 层级范围 | 无单位；默认低于浮动外壳控件 |

面身份属于数学案例，颜色属于设计系统。改变颜色不改变名称或展开拓扑。透明度不能改变棱线遮挡分类：仍保留深度预绘制、去重棱线、隐藏棱虚线和标签实体遮挡。

## 单位与读取

- CSS 排版/布局使用 `rem`、`em`、`px` 或 `clamp()`；`em` 只用于与文本宽度相关的区域。
- SVG 描边与三维世界距离使用无单位数字；不能把 `2px` 交给 Three.js 数值字段。
- DOM CSS 可以使用带 alpha 的颜色；Three.js 色 token 只接受 `#RGB` / `#RRGGBB`，透明度单独配置。
- [read-tokens.ts](../src/styles/read-tokens.ts) 按 schema 返回 `string` 或 `number`。数字必须是完整无单位十进制，排除 NaN、Infinity、单位和指数文本，并校验 min/max。
- Three.js 在场景挂载时读取一次 computed style，不在渲染帧内读 CSS。当前固定浅色主题不提供热切主题监听；调整 token 文件后重新挂载或刷新预览验证。
- 缺失/非法值抛错并进入既有案例恢复流程，不以组件内的第二份默认值掩盖错误。错误细节仅进入开发控制台。

CSS 用法：

```css
.example-control {
  min-height: var(--control-height);
  color: var(--control-text);
  background: var(--control-surface);
  border-radius: var(--control-radius);
  gap: var(--space-2);
}
```

Three.js 用法（schema 只有名称与范围，不持有视觉默认值）：

```ts
const style = readTokens(element, {
  edgeColor: { name: '--viz-3d-edge-color', kind: 'color' },
  opacity: { name: '--viz-3d-material-opacity', kind: 'number', min: 0, max: 1 },
});
// style.edgeColor: string；style.opacity: number
```

## 非 token 边界

模型顶点、铰链变换、数学区间、SVG 路径/坐标、数轴触点几何、相机位置与取景算法、射线偏移、防闪烁深度参数、渲染顺序和 dpr 属于数学或渲染配置，留在案例中。布局比例、0/100% 填充、flex/grid 比例、隐藏辅助文字的 1px 几何也不抽成品牌变量。

统一断点是 900px（平板）与 600px（紧凑/手机）。原生 CSS 自定义属性不能直接用于媒体查询条件，因此断点保留在 `@media` 中，由自动检查约束一致性，不维护无效的 `--breakpoint-*`。

## 扩展与验证

1. 先找已有角色；同值不一定同义，同义不应重复命名。
2. 在 `tokens.css` 对应分组定义或引用已有基础值，组件消费语义/组件 token。
3. 新的 Three.js 值同时更新案例 schema 和边界测试。只有第二个真实案例出现稳定共性后才抽共享场景适配层。
4. 修改 token 角色时更新本文；改页面模式时更新 UI 规范。
5. `pnpm test` 检查声明唯一、引用存在/无环、禁止原始色和裸描边回流、读取边界。静态检查不是完整 CSS/TS 解析器，代码审查仍需检查间接硬编码和语义误用。
6. `pnpm test:e2e` 检查计算样式的控件状态、真实 CSS 到三维读取/错误恢复，以及既有关键场景截图。结构迁移应通过原有截图，不批量更新基线掩盖变化。
7. 跑 typecheck、lint、build；真实视觉变更先人工审查 1600×900、360px 和 768px，再有针对性更新截图。自动检查不能替代教学评审。
