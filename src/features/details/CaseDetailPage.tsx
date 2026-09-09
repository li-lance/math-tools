import { Link, useParams } from 'react-router-dom';

import { BrandHeader } from '../../components/BrandHeader';
import { CaseArtwork } from '../../components/CaseArtwork';
import { UnknownCaseRecovery } from '../../components/UnknownCaseRecovery';
import { capabilityLabels, copy, gradeLabels, topicLabels } from '../../content/zh-CN';
import { getCaseDefinition } from '../../core/cases';

export function CaseDetailPage() {
  const { caseId } = useParams();
  const definition = caseId ? getCaseDefinition(caseId) : undefined;
  if (!definition) return <UnknownCaseRecovery />;
  const review = definition.teachingReview;

  return (
    <>
      <BrandHeader />
      <main className="page detail-page">
        <nav className="breadcrumb" aria-label={copy.detail.backToLibrary}>
          <Link to="/"><span aria-hidden="true">← </span>{copy.detail.backToLibrary}</Link>
          <span aria-hidden="true">/</span><span>{copy.detail.eyebrow}</span>
        </nav>
        <section className="detail-hero" aria-labelledby="case-title">
          <div className="detail-hero__preview">
            <CaseArtwork geometry={definition.capabilities.includes('three-3d')} />
            <span className="preview-label">{copy.detail.preview}</span>
          </div>
          <div className="detail-hero__copy">
            <ul className="tags">
              {definition.grades.map((g) => <li className="tag" key={g}>{gradeLabels[g]}</li>)}
              {definition.topics.map((t) => <li className="tag" key={t}>{topicLabels[t]}</li>)}
            </ul>
            <h1 id="case-title">{definition.title}</h1>
            <p className="detail-summary">{definition.summary}</p>
            <ul className="capabilities">
              {definition.capabilities.map((c) => <li key={c}><span aria-hidden="true">✓</span> {capabilityLabels[c]}</li>)}
            </ul>
            <Link className="button primary detail-cta" to={`/cases/${definition.id}/present`}>{copy.detail.enterPresentation}<span aria-hidden="true"> →</span></Link>
          </div>
        </section>

        <div className="detail-sections">
          <section className="objective-panel" aria-labelledby="detail-objective">
            <p className="eyebrow">{copy.detail.preparation}</p>
            <h2 id="detail-objective">{copy.detail.objective}</h2>
            <p>{review.objective}</p>
            <div className="objective-grade"><span>{copy.detail.gradeRange}</span><strong>{review.gradeRange}</strong></div>
          </section>
          <section className="guidance-panel" aria-labelledby="detail-guidance">
            <h2 id="detail-guidance">{copy.detail.guidance}</h2>
            <p className="muted">{copy.detail.guidanceIntro}</p>
            <ol className="guidance-steps">
              {definition.guidance.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </section>
        </div>
        <details className="review-panel">
          <summary><span>{copy.detail.reviewTitle}</span><span className="review-status">{copy.detail.reviewStatus[review.status]}</span></summary>
          <div className="review-content">
            <p><strong>{copy.detail.reviewTerminology}：</strong>{review.terminology.join('、')}</p>
            <p><strong>{copy.detail.reviewParameterValidity}：</strong>{review.parameterValidity}</p>
            <h3>{copy.detail.reviewRisks}</h3>
            <ul>{review.misrepresentationRisks.map((risk) => <li key={risk}>{risk}</li>)}</ul>
          </div>
        </details>
      </main>
      <footer className="site-footer">{copy.footer}</footer>
    </>
  );
}
