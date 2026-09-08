import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { BrandHeader } from '../../components/BrandHeader';
import { CaseArtwork } from '../../components/CaseArtwork';
import { copy, gradeLabels, topicLabels } from '../../content/zh-CN';
import { listCaseDefinitions, type Grade, type Topic } from '../../core/cases';

export function LibraryPage() {
  const [query, setQuery] = useState('');
  const [grade, setGrade] = useState<Grade | ''>('');
  const [topic, setTopic] = useState<Topic | ''>('');

  const results = useMemo(() => {
    const text = query.trim().toLowerCase();
    return listCaseDefinitions().filter((definition) => {
      if (grade !== '' && !definition.grades.includes(grade)) return false;
      if (topic !== '' && !definition.topics.includes(topic)) return false;
      return text === '' || `${definition.title} ${definition.summary}`.toLowerCase().includes(text);
    });
  }, [query, grade, topic]);

  const clearFilters = () => { setQuery(''); setGrade(''); setTopic(''); };

  return (
    <>
      <BrandHeader />
      <main className="page library-page">
        <section className="library-hero" aria-labelledby="library-headline">
          <div className="library-hero__copy">
            <p className="eyebrow"><span aria-hidden="true">✳</span> {copy.library.eyebrow}</p>
            <h1 id="library-headline">{copy.library.headline}<br /><span>{copy.library.headlineAccent}</span></h1>
            <p className="library-hero__description">{copy.library.introduction}</p>
          </div>
          <div className="library-hero__illustration">
            <span className="illustration-caption">{copy.library.previewLabel}</span>
            <CaseArtwork geometry />
            <span className="illustration-footnote">{copy.library.previewCaption}</span>
          </div>
        </section>

        <section className="library-collection" aria-labelledby="library-title">
          <div className="section-heading">
            <div><p className="eyebrow">{copy.library.collectionTitle}</p><h2 id="library-title">{copy.library.title}</h2></div>
            <p className="result-count" role="status">{copy.library.resultCount(results.length)}</p>
          </div>
          <div className="filter-bar">
            <label className="search-field">
              <span className="sr-only">{copy.library.searchLabel}</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></svg>
              <input type="search" value={query} placeholder={copy.library.searchPlaceholder} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <label className="filter-field">
              <span className="sr-only">{copy.library.gradeFilterLabel}</span>
              <select value={grade} onChange={(event) => setGrade(event.target.value === '' ? '' : (Number(event.target.value) as Grade))}>
                <option value="">{copy.library.allGrades}</option>
                {([1, 2, 3, 4, 5, 6] as Grade[]).map((g) => <option key={g} value={g}>{gradeLabels[g]}</option>)}
              </select>
            </label>
            <label className="filter-field">
              <span className="sr-only">{copy.library.topicFilterLabel}</span>
              <select value={topic} onChange={(event) => setTopic(event.target.value as Topic | '')}>
                <option value="">{copy.library.allTopics}</option>
                {Object.entries(topicLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
          </div>
          {results.length === 0 ? (
            <div className="empty-state">
              <h3>{copy.library.empty}</h3><p>{copy.library.emptyHint}</p>
              <button type="button" onClick={clearFilters}>{copy.library.clearFilters}</button>
            </div>
          ) : (
            <ul className="card-list">
              {results.map((definition) => (
                <li key={definition.id} className="case-card">
                  <CaseArtwork geometry={definition.capabilities.includes('three-3d')} />
                  <div className="case-card__body">
                    <ul className="tags">
                      {definition.grades.map((g) => <li key={g} className="tag">{gradeLabels[g]}</li>)}
                      {definition.topics.map((t) => <li key={t} className="tag">{topicLabels[t]}</li>)}
                    </ul>
                    <h3>{definition.title}</h3>
                    <p>{definition.summary}</p>
                    <Link className="case-card__link" to={`/cases/${definition.id}`}>{copy.library.viewDetail}<span aria-hidden="true">↗</span></Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <footer className="site-footer">{copy.footer}</footer>
    </>
  );
}
