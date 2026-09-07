import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { copy } from '../content/zh-CN';

interface CaseErrorBoundaryProps {
  children: ReactNode;
  /** 重试时变化的键，用于强制重新挂载案例。 */
  resetKey: string;
}

interface CaseErrorBoundaryState {
  failed: boolean;
}

/**
 * 案例级错误边界：单个案例崩溃不影响案例库与其他案例。
 * 不向教师暴露堆栈；错误细节只进入开发控制台。
 */
export class CaseErrorBoundary extends Component<
  CaseErrorBoundaryProps,
  CaseErrorBoundaryState
> {
  override state: CaseErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): CaseErrorBoundaryState {
    return { failed: true };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error('案例运行失败', error, info.componentStack);
  }

  override componentDidUpdate(prevProps: CaseErrorBoundaryProps): void {
    if (prevProps.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  override render(): ReactNode {
    if (this.state.failed) {
      return (
        <div className="page" role="alert">
          <h1>{copy.recovery.caseFailureTitle}</h1>
          <p>{copy.recovery.caseFailureBody}</p>
          <div className="toolbar">
            <button type="button" onClick={() => this.setState({ failed: false })}>
              {copy.recovery.retry}
            </button>
            <Link className="button" to="/">
              {copy.recovery.backToLibrary}
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
