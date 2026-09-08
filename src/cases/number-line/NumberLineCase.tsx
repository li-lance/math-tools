import { useEffect, useRef, useState } from 'react';

import type { CaseRuntimeProps } from '../../core/cases';

import {
  clampValue,
  generateTicks,
  INTERVAL_LIMIT,
  positionToValue,
  snapToInteger,
  valueToPosition,
  type NumberLineParams,
} from './math';
import './number-line.css';

const HEIGHT = 320;
const AXIS_X0 = 60;
const AXIS_Y = 190;

export default function NumberLineCase({
  state,
  onStateChange,
}: CaseRuntimeProps<NumberLineParams>) {
  const { min, max, value } = state;
  // 拖动中的中间位置是瞬时状态：只在松手时提交为教学参数。
  const [dragValue, setDragValue] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(1000);
  const displayValue = dragValue ?? value;
  const axisEnd = width - AXIS_X0;
  const toX = (position: number) => AXIS_X0 + position * (axisEnd - AXIS_X0);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width > 0) {
        setWidth(Math.min(1000, entry.contentRect.width));
      }
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  const valueFromClientX = (clientX: number): number => {
    const svg = svgRef.current;
    if (!svg) return displayValue;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return displayValue;
    const x = ((clientX - rect.left) / rect.width) * width;
    const position = (x - AXIS_X0) / (axisEnd - AXIS_X0);
    return clampValue(snapToInteger(positionToValue(position, min, max)), min, max);
  };

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    setDragValue(valueFromClientX(event.clientX));

    const onMove = (moveEvent: PointerEvent) => {
      setDragValue(valueFromClientX(moveEvent.clientX));
    };
    const onUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      const next = valueFromClientX(upEvent.clientX);
      setDragValue(null);
      if (next !== value) onStateChange({ ...state, value: next });
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const handleKeyDown = (event: React.KeyboardEvent<SVGGElement>) => {
    let next: number;
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        next = Math.max(value - 1, min);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        next = Math.min(value + 1, max);
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }
    event.preventDefault();
    if (next !== value) onStateChange({ ...state, value: next });
  };

  const commitInterval = (nextMin: number, nextMax: number) => {
    if (!Number.isInteger(nextMin) || !Number.isInteger(nextMax)) return;
    if (Math.abs(nextMin) > INTERVAL_LIMIT || Math.abs(nextMax) > INTERVAL_LIMIT) return;
    if (nextMin >= nextMax) return;
    onStateChange({
      min: nextMin,
      max: nextMax,
      value: clampValue(value, nextMin, nextMax),
    });
  };

  const ticks = generateTicks(min, max);

  return (
    <div className="number-line">
      <svg
        ref={svgRef}
        className="number-line__stage"
        viewBox={`0 0 ${width} ${HEIGHT}`}
        role="img"
        aria-label={`数轴，区间从 ${min} 到 ${max}`}
        onPointerDown={handlePointerDown}
      >
        <line
          x1={AXIS_X0}
          y1={AXIS_Y}
          x2={axisEnd}
          y2={AXIS_Y}
          className="number-line__axis"
        />
        <polygon
          points={`${axisEnd},${AXIS_Y} ${axisEnd - 14},${AXIS_Y - 7} ${axisEnd - 14},${AXIS_Y + 7}`}
          className="number-line__axis"
        />
        {ticks.map((tick) => {
          const x = toX(valueToPosition(tick, min, max));
          return (
            <g key={tick}>
              <line
                x1={x}
                y1={AXIS_Y - 8}
                x2={x}
                y2={AXIS_Y + 8}
                className="number-line__tick"
              />
              {(width >= 900 || tick === min || tick === max ||
                (tick === 0 && x - AXIS_X0 >= 60 && axisEnd - x >= 60)) && (
                <text x={x} y={AXIS_Y + 52} textAnchor="middle" className="number-line__tick-label">
                  {tick}
                </text>
              )}
            </g>
          );
        })}
        <text
          x={toX(valueToPosition(displayValue, min, max))}
          y={AXIS_Y - 64}
          textAnchor="middle"
          className="number-line__value-label"
        >
          {displayValue}
        </text>
        <g
          role="slider"
          tabIndex={0}
          aria-label="数轴上的点"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={displayValue}
          aria-valuetext={`点的位置：${displayValue}`}
          onKeyDown={handleKeyDown}
          className="number-line__handle"
        >
          <circle
            cx={toX(valueToPosition(displayValue, min, max))}
            cy={AXIS_Y}
            r={24}
            className="number-line__handle-circle"
          />
        </g>
      </svg>

      <details className="number-line__settings">
        <summary>区间设置</summary>
        <p className="number-line__settings-hint">
          起点必须小于终点，两者都是绝对值不超过 {INTERVAL_LIMIT} 的整数。
        </p>
        <div className="number-line__settings-fields">
          <IntervalField
            key={`min-${min}`}
            label="起点"
            defaultValue={min}
            onCommit={(nextMin) => commitInterval(nextMin, max)}
          />
          <IntervalField
            key={`max-${max}`}
            label="终点"
            defaultValue={max}
            onCommit={(nextMax) => commitInterval(min, nextMax)}
          />
        </div>
      </details>
    </div>
  );
}

interface IntervalFieldProps {
  label: string;
  defaultValue: number;
  onCommit: (value: number) => void;
}

function IntervalField({ label, defaultValue, onCommit }: IntervalFieldProps) {
  const commit = (raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isInteger(parsed)) onCommit(parsed);
  };
  return (
    <label className="number-line__field">
      {label}
      <input
        type="number"
        defaultValue={defaultValue}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit(event.currentTarget.value);
        }}
      />
    </label>
  );
}
