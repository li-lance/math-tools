import { Link, useParams } from 'react-router-dom';

import { UnknownCaseRecovery } from '../../components/UnknownCaseRecovery';
import {
  capabilityLabels,
  copy,
  gradeLabels,
  topicLabels,
} from '../../content/zh-CN';
import { getCaseDefinition } from '../../core/cases';

export function CaseDetailPage() {
  const { caseId } = useParams();
  const definition = caseId ? getCaseDefinition(caseId) : undefined;

  if (!definition) {
    return <UnknownCaseRecovery />;
  }

  const review = definition.teachingReview;

  return (
    <main className="page">
      <h1>{definition.title}</h1>
      <p>{definition.summary}</p>

      <section aria-labelledby="detail-classification">
        <h2 id="detail-classification">{copy.detail.classification}</h2>
        <ul className="tags">
          {definition.grades.map((g) => (
            <li key={g} className="tag">
              {gradeLabels[g]}
            </li>
          ))}
          {definition.topics.map((t) => (
            <li key={t} className="tag">
              {topicLabels[t]}
            </li>
          ))}
          {definition.capabilities.map((c) => (
            <li key={c} className="tag">
              {capabilityLabels[c]}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="detail-objective">
        <h2 id="detail-objective">{copy.detail.objective}</h2>
        <p>{review.objective}</p>
        <p>
          {copy.detail.gradeRange}：{review.gradeRange}
        </p>
      </section>

      <section aria-labelledby="detail-guidance">
        <h2 id="detail-guidance">{copy.detail.guidance}</h2>
        <ol>
          {definition.guidance.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="detail-review">
        <h2 id="detail-review">{copy.detail.reviewTitle}</h2>
        <p>{copy.detail.reviewStatus[review.status]}</p>
        <p>
          {copy.detail.reviewTerminology}：{review.terminology.join('、')}
        </p>
        <p>
          {copy.detail.reviewParameterValidity}：{review.parameterValidity}
        </p>
        <ul>
          {review.misrepresentationRisks.map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ul>
      </section>

      <div className="toolbar">
        <Link className="button primary" to={`/cases/${definition.id}/present`}>
          {copy.detail.enterPresentation}
        </Link>
        <Link className="button" to="/">
          {copy.detail.backToLibrary}
        </Link>
      </div>
    </main>
  );
}
