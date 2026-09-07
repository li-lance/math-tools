import { Component, type ReactNode } from 'react';

import { copy } from '../content/zh-CN';

interface AppErrorBoundaryState {
  failed: boolean;
}

/** 应用级错误边界：兜底路由与外壳的启动失败。 */
export class AppErrorBoundary extends Component<{ children: ReactNode }, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { failed: true };
  }

  override componentDidCatch(error: unknown): void {
    console.error('应用启动失败', error);
  }

  override render(): ReactNode {
    if (this.state.failed) {
      return (
        <main className="page" role="alert">
          <h1>{copy.recovery.caseFailureTitle}</h1>
          <div className="toolbar">
            <button type="button" onClick={() => window.location.assign('/')}>
              {copy.recovery.backToLibrary}
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
