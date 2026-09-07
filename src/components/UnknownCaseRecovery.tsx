import { Link } from 'react-router-dom';

import { copy } from '../content/zh-CN';

/** 未知案例标识符的中文恢复页。 */
export function UnknownCaseRecovery() {
  return (
    <main className="page" role="alert">
      <h1>{copy.recovery.unknownCaseTitle}</h1>
      <p>{copy.recovery.unknownCaseBody}</p>
      <div className="toolbar">
        <Link className="button primary" to="/">
          {copy.recovery.backToLibrary}
        </Link>
      </div>
    </main>
  );
}
