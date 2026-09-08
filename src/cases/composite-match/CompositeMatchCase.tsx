import { useMemo, useRef, useState, type KeyboardEvent } from 'react';

import type { CaseRuntimeProps } from '../../core/cases';
import { copy } from '../../content/zh-CN';

import type { CompositeState } from './codec';
import { generateProblem, type Level } from './generator';
import { readSolidSceneStyle } from './scene-style';
import SolidViewport from './SolidViewport';
import './composite-match.css';

const text = copy.compositeMatch;
const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;
const LEVELS: Level[] = [1, 2, 3];

export default function CompositeMatchCase({ state, onStateChange }: CaseRuntimeProps<CompositeState>) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const problem = useMemo(() => generateProblem(state.level, state.seed), [state.level, state.seed]);
  const [style] = useState(() => readSolidSceneStyle(document.documentElement));

  const isCorrect = selected !== null && selected === problem.answerIndex;

  function moveFocus(index: number, dx: number, dy: number) {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const nc = col + dx;
    const nr = row + dy;
    if (nc < 0 || nc > 1 || nr < 0 || nr > 1) return;
    optionRefs.current[nr * 2 + nc]?.focus();
  }

  function handleOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    moveFocus(index, move[0], move[1]);
  }

  function newProblem() {
    onStateChange({ level: state.level, seed: Math.floor(Math.random() * 0x7fffffff) });
    setSelected(null);
    setRevealed(false);
  }

  return (
    <div className="composite-match">
      <p className="composite-match__hint">{text.viewHint}</p>
      <div className="composite-match__board">
        <section className="composite-match__reference" aria-label={text.referenceLabel}>
          <span className="composite-match__badge">{text.referenceLabel}</span>
          <SolidViewport
            solid={problem.reference}
            label={text.sceneLabel(text.referenceLabel)}
            cubeColor={style.cubeReference}
            style={style}
            resetKey={resetKey}
          />
        </section>
        <div className="composite-match__options">
          {problem.options.map((option, index) => (
            <div key={index} className="composite-match__option">
              <SolidViewport
                solid={option}
                label={text.sceneLabel(OPTION_LETTERS[index]!)}
                cubeColor={style.cubeOption}
                style={style}
                resetKey={resetKey}
              />
              <button
                type="button"
                role="radio"
                aria-checked={selected === index}
                className="composite-match__option-button"
                onClick={() => setSelected(index)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                ref={(el) => { optionRefs.current[index] = el; }}
              >
                {OPTION_LETTERS[index]}
              </button>
              {revealed && index === problem.answerIndex && (
                <span className="composite-match__marker">{text.answerMarker}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="composite-match__prompt">{text.prompt}</p>
      <p className="composite-match__feedback" role="status">
        {selected !== null && (isCorrect ? text.correct : text.incorrect)}
      </p>
      <div className="composite-match__controls">
        <label>
          {text.difficultyLabel}
          <select
            value={state.level}
            onChange={(event) => onStateChange({ level: Number(event.target.value) as Level, seed: state.seed })}
          >
            {LEVELS.map((level) => (
              <option key={level} value={level}>{text.difficulty[level]}</option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => setResetKey((value) => value + 1)}>{text.resetView}</button>
        <button type="button" onClick={() => setRevealed(true)}>{text.revealAnswer}</button>
        <button type="button" onClick={newProblem}>{text.newProblem}</button>
      </div>
    </div>
  );
}
