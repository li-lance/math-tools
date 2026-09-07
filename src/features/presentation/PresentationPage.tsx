import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { CaseErrorBoundary } from '../../components/CaseErrorBoundary';
import { UnknownCaseRecovery } from '../../components/UnknownCaseRecovery';
import { copy } from '../../content/zh-CN';
import { getCaseDefinition, type AnyCaseDefinition } from '../../core/cases';

export function PresentationPage() {
  const { caseId } = useParams();
  const definition = caseId ? getCaseDefinition(caseId) : undefined;

  if (!definition) {
    return <UnknownCaseRecovery />;
  }
  return <PresentationShell key={definition.id} definition={definition} />;
}

function PresentationShell({ definition }: { definition: AnyCaseDefinition }) {
  const [searchParams, setSearchParams] = useSearchParams();
  // 教学状态一次性从 URL 解码；之后的修改通过 replace 写回，不产生历史噪音。
  const [decoded] = useState(() => definition.codec.decode(searchParams));
  const [state, setState] = useState<unknown>(decoded.state);
  const [issues, setIssues] = useState<readonly string[]>(decoded.issues);
  const [barCollapsed, setBarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const helpRef = useRef<HTMLDialogElement>(null);

  const Runtime = definition.runtime;

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const handleStateChange = (next: unknown) => {
    setState(next);
    setSearchParams(definition.codec.encode(next), { replace: true });
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  };

  return (
    <div className="presentation">
      <div className="presentation__stage">
        <div style={{ width: '100%' }}>
          {issues.length > 0 && (
            <p className="notice" role="status">
              {copy.presentation.repairedNotice([...issues])}
              <button type="button" onClick={() => setIssues([])}>
                {copy.presentation.dismissNotice}
              </button>
            </p>
          )}
          <CaseErrorBoundary resetKey={definition.id}>
            <Suspense fallback={<p role="status">{copy.presentation.loading}</p>}>
              <Runtime state={state} onStateChange={handleStateChange} />
            </Suspense>
          </CaseErrorBoundary>
        </div>
      </div>

      {barCollapsed ? (
        <button
          type="button"
          className="presentation__bar-toggle"
          onClick={() => setBarCollapsed(false)}
        >
          {copy.presentation.expandBar}
        </button>
      ) : (
        <div className="presentation__bar">
          <span className="presentation__bar-title">{definition.title}</span>
          <Link className="button" to={`/cases/${definition.id}`}>
            {copy.presentation.back}
          </Link>
          <button type="button" onClick={() => handleStateChange(definition.defaultState)}>
            {copy.presentation.reset}
          </button>
          <button type="button" onClick={toggleFullscreen}>
            {isFullscreen ? copy.presentation.exitFullscreen : copy.presentation.fullscreen}
          </button>
          <button type="button" onClick={() => helpRef.current?.showModal()}>
            {copy.presentation.help}
          </button>
          <button type="button" onClick={() => setBarCollapsed(true)}>
            {copy.presentation.collapseBar}
          </button>
        </div>
      )}

      <dialog ref={helpRef} className="help-dialog" aria-label={copy.presentation.helpTitle}>
        <h2>{copy.presentation.helpTitle}</h2>
        <ol>
          {definition.guidance.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <button type="button" onClick={() => helpRef.current?.close()}>
          {copy.presentation.close}
        </button>
      </dialog>
    </div>
  );
}
