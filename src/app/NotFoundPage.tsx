import { Link } from 'react-router-dom';

import { copy } from '../content/zh-CN';

export function NotFoundPage() {
  return (
    <main className="page" role="alert">
      <h1>{copy.recovery.notFoundTitle}</h1>
      <div className="toolbar">
        <Link className="button primary" to="/">
          {copy.recovery.backToLibrary}
        </Link>
      </div>
    </main>
  );
}
