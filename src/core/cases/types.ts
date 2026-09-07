import type { ComponentType, LazyExoticComponent } from 'react';

/** 小学年级分类。 */
export type Grade = 1 | 2 | 3 | 4 | 5 | 6;

/** 数学主题分类（依据义务教育数学课程标准的内容领域）。 */
export type Topic =
  | 'number-and-algebra'
  | 'shape-and-geometry'
  | 'statistics-and-probability'
  | 'integrated-practice';

/** 案例声明的渲染与交互能力。 */
export type Capability =
  | 'svg-2d'
  | 'canvas-2d'
  | 'three-3d'
  | 'direct-manipulation'
  | 'parameter-control';

/**
 * URL 解码结果。无法识别的参数用文档化默认值替换并记录在 issues 中；
 * state 永远是可安全进入数学逻辑的校验结果。
 */
export interface DecodeResult<S> {
  state: S;
  /** 被重置为默认值的参数说明（中文，用于恢复提示）。 */
  issues: string[];
}

/** 教学参数在 URL 与内存状态之间的双向编解码。 */
export interface CaseStateCodec<S> {
  decode(params: URLSearchParams): DecodeResult<S>;
  encode(state: S): URLSearchParams;
}

/** 演示外壳传给案例运行时的受控属性。 */
export interface CaseRuntimeProps<S> {
  state: S;
  onStateChange(next: S): void;
}

/** 随案例定义携带的教学评审信息。 */
export interface TeachingReviewInfo {
  /** 教学目标。 */
  objective: string;
  /** 适用年级范围说明。 */
  gradeRange: string;
  /** 使用的数学术语及依据。 */
  terminology: string[];
  /** 默认值与参数范围的有效性说明。 */
  parameterValidity: string;
  /** 可能的视觉或数学误导风险及规避措施。 */
  misrepresentationRisks: string[];
  /** 人工教学评审状态。 */
  status: 'pending' | 'approved';
}

/**
 * 案例定义：案例的可发现描述与运行时入口。
 * 元数据常驻内存；runtime 通过 load 懒加载。
 */
export interface CaseDefinition<S = unknown> {
  /** 稳定标识符，kebab-case，同时是路由片段。 */
  id: string;
  title: string;
  summary: string;
  grades: readonly Grade[];
  topics: readonly Topic[];
  capabilities: readonly Capability[];
  /** 操作指引（帮助面板逐条展示）。 */
  guidance: readonly string[];
  defaultState: S;
  codec: CaseStateCodec<S>;
  /**
   * 懒加载的运行时组件。lazy() 只在首次渲染时才触发 import，
   * 因此在模块作用域创建不会拖慢案例库的首次加载。
   */
  runtime: LazyExoticComponent<ComponentType<CaseRuntimeProps<S>>>;
  teachingReview: TeachingReviewInfo;
}

/** 注册表内部使用的擦除类型：外壳只与 unknown 状态打交道。 */
export type AnyCaseDefinition = CaseDefinition<unknown>;
