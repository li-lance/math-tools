import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

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
      if (text === '') return true;
      return `${definition.title} ${definition.summary}`.toLowerCase().includes(text);
    });
  }, [query, grade, topic]);

  return (
    <main className="page">
      <h1>{copy.library.title}</h1>
      <div className="toolbar">
        <label>
          {copy.library.searchLabel}
          <input
            type="search"
            value={query}
            placeholder={copy.library.searchPlaceholder}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          {copy.library.gradeFilterLabel}
          <select
            value={grade}
            onChange={(event) =>
              setGrade(event.target.value === '' ? '' : (Number(event.target.value) as Grade))
            }
          >
            <option value="">{copy.library.allGrades}</option>
            {([1, 2, 3, 4, 5, 6] as Grade[]).map((g) => (
              <option key={g} value={g}>
                {gradeLabels[g]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {copy.library.topicFilterLabel}
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value as Topic | '')}
          >
            <option value="">{copy.library.allTopics}</option>
            {Object.entries(topicLabels).map(([valueKey, label]) => (
              <option key={valueKey} value={valueKey}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {results.length === 0 ? (
        <p>{copy.library.empty}</p>
      ) : (
        <ul className="card-list">
          {results.map((definition) => (
            <li key={definition.id} className="card">
              <h2>{definition.title}</h2>
              <p>{definition.summary}</p>
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
              </ul>
              <Link className="button primary" to={`/cases/${definition.id}`}>
                {copy.library.viewDetail}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
