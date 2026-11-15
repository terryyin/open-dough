// One responsive dated chart for collected history. Project CI status supplies
// CI time without runner waits and a Done CI comparison supplies wall time
// (`./landedCiHistorySeries.ts`); scope
// Proof supplies precise execution time, compatible segments and its builds
// without timing; System settings → Usage supplies each finished task's
// Token index with its rolling median as the trend. All use the same
// placement and marks (`./historyChartLayout.ts`, `./HistoryChartPlot.tsx`):
// a gap never acquires a numeric point or joining stroke. Every mark is also
// a button laid over the drawing, in history order, so pointer, keyboard focus
// and touch each show its short date and value or status in one readout. A
// chart whose entries can be chosen, such as Usage's tasks, also chooses the
// entry of a mark pressed by pointer, Enter or Space; its owner marks that
// entry selected and can return focus to the pressed mark. Independent trends
// keep dated overflow values available as observations, without task buttons.

import { useLayoutEffect, useRef, useState } from "react";
import { isMeasured, type HistoryChartSeries } from "./historyChartSeries.ts";
import {
  chartHeight,
  chartLayout,
  minimumChartWidth,
  type ChartLayout,
  type ChartMark,
} from "./historyChartLayout.ts";
import { HistoryChartPlot } from "./HistoryChartPlot.tsx";
import "./history-chart.css";

function useBoxWidth() {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const element = box.current;
    if (element === null) return;
    const measure = () => {
      setWidth(Math.floor(element.getBoundingClientRect().width));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);
  return { box, width };
}

const isSelected = (mark: ChartMark) => mark.entry.selected === true;

// Chooses the entry `key`, whose mark is the button `mark`.
export type ChooseEntry = (key: string, mark: HTMLButtonElement) => void;

// The marks as buttons over the drawing and the readout of the one the reader
// last pointed at, focused or tapped; the selected entry's, or else the
// latest entry's, until then.
function MarkReadout({
  layout,
  onChoose,
}: {
  readonly layout: ChartLayout;
  readonly onChoose: ChooseEntry | undefined;
}) {
  const [inspected, setInspected] = useState<string>();
  const shown =
    layout.marks.find((mark) => mark.entry.key === inspected) ??
    layout.marks.find(isSelected) ??
    layout.marks.at(-1);
  return (
    <>
      <div className="history-chart-marks">
        {layout.marks.map((mark) => {
          const { key } = mark.entry;
          const inspect = () => {
            setInspected(key);
          };
          return (
            <button
              key={key}
              type="button"
              className={`history-chart-mark${mark.overflow === undefined ? "" : " history-chart-overflow-button"}`}
              aria-label={mark.readout}
              aria-current={mark === shown ? "true" : undefined}
              aria-pressed={
                onChoose === undefined ? undefined : isSelected(mark)
              }
              style={{ left: mark.x, top: mark.y }}
              onPointerEnter={inspect}
              onFocus={inspect}
              onClick={(event) => {
                inspect();
                onChoose?.(key, event.currentTarget);
              }}
            />
          );
        })}
      </div>
      <p className="history-chart-readout" aria-live="polite">
        {shown?.readout}
      </p>
    </>
  );
}

export function HistoryChart({
  series,
  onChoose,
}: {
  readonly series: HistoryChartSeries;
  readonly onChoose?: ChooseEntry;
}) {
  const { box, width } = useBoxWidth();
  const layout =
    width > minimumChartWidth && series.entries.some(isMeasured)
      ? chartLayout(series, width)
      : undefined;
  return (
    <div className="history-chart-chart">
      <div ref={box} className="history-chart-plot">
        <svg
          role="img"
          aria-label={series.label}
          width="100%"
          height={layout?.height ?? chartHeight}
        >
          {layout !== undefined && <HistoryChartPlot layout={layout} />}
        </svg>
        {layout !== undefined && (
          <MarkReadout layout={layout} onChoose={onChoose} />
        )}
      </div>
      {layout !== undefined && layout.trendOverflows.length > 0 && (
        <ul
          className="history-chart-trend-values"
          aria-label="Above-scale trend values"
        >
          {layout.trendOverflows.map((point, index) => (
            <li key={index}>{point.readout}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
