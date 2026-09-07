import type { Capability, Grade, Topic } from '../core/cases';

/** 分类词汇：键与 core/cases 的分类类型一一对应。 */
export const gradeLabels: Record<Grade, string> = {
  1: '一年级',
  2: '二年级',
  3: '三年级',
  4: '四年级',
  5: '五年级',
  6: '六年级',
};

export const topicLabels: Record<Topic, string> = {
  'number-and-algebra': '数与代数',
  'shape-and-geometry': '图形与几何',
  'statistics-and-probability': '统计与概率',
  'integrated-practice': '综合与实践',
};

export const capabilityLabels: Record<Capability, string> = {
  'svg-2d': '二维图形',
  'canvas-2d': '连续绘制',
  'three-3d': '三维几何',
  'direct-manipulation': '直接操作',
  'parameter-control': '参数调节',
};

/** 应用外壳的界面文案。案例自身的教学内容随案例定义存放。 */
export const copy = {
  appName: '数学工具',
  library: {
    title: '案例库',
    searchLabel: '搜索案例',
    searchPlaceholder: '输入案例名称或关键词',
    gradeFilterLabel: '按年级筛选',
    topicFilterLabel: '按主题筛选',
    allGrades: '全部年级',
    allTopics: '全部主题',
    empty: '没有找到符合条件的案例。',
    viewDetail: '查看详情',
  },
  detail: {
    objective: '教学目标',
    gradeRange: '适用年级',
    guidance: '操作指引',
    classification: '分类',
    reviewTitle: '教学评审',
    reviewStatus: { pending: '待评审', approved: '已通过评审' } as const,
    reviewTerminology: '使用术语',
    reviewParameterValidity: '参数有效性',
    reviewRisks: '误导风险与规避',
    enterPresentation: '进入演示',
    backToLibrary: '返回案例库',
  },
  presentation: {
    back: '返回',
    reset: '重置',
    fullscreen: '全屏',
    exitFullscreen: '退出全屏',
    help: '帮助',
    helpTitle: '操作指引',
    close: '关闭',
    collapseBar: '收起控制栏',
    expandBar: '展开控制栏',
    loading: '正在加载案例…',
    repairedNotice: (issues: string[]) => `链接中的参数已调整：${issues.join('；')}`,
    dismissNotice: '知道了',
  },
  recovery: {
    unknownCaseTitle: '没有找到这个案例',
    unknownCaseBody: '链接中的案例不存在或已被移除。',
    caseFailureTitle: '案例加载失败',
    caseFailureBody: '这个案例暂时无法运行，其他案例不受影响。',
    retry: '重试',
    resetToDefaults: '恢复默认',
    backToLibrary: '返回案例库',
    notFoundTitle: '页面不存在',
  },
} as const;
