// One responsive dated timing chart for collected history. Project CI status
// supplies its window of ordered points and gaps, including each measured
// build's represented landings; scope Proof supplies precise execution time,
// compatible segments and its builds without timing. Both use the same
// placement and marks (`./ciHistoryChartLayout.ts`, `./IntentCiHistoryPlot.tsx`):
// a gap never acquires a numeric point or joining stroke. Every mark is also
// a button laid over the drawing, in history order, so pointer, keyboard focus
// and touch each show its short date and timing or status in one readout.

import { useLayoutEffect, useRef, useState } from "react";
import {
  buildDateWords,
  gapReasonWords,
  plainWords,
  pointLandingsWords,
  pointWallTimeWords,
} from "./ciHistoryWords.ts";
import {
  entryDate,
  landedCiEntryKey,
  type MeasuredEntry,
} from "./landedCiHistory.ts";

import {
  gapStatus,
  isMeasured,
  type HistoryChartBuild,
  type HistoryChartSeries,
} from "./ciHistoryChart.ts";
import {
  chartHeight,
  chartLayout,
  minimumChartWidth,
  type ChartLayout,
  type ChartMark,
} from "./ciHistoryChartLayout.ts";
import { IntentCiHistoryPlot } from "./IntentCiHistoryPlot.tsx";

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

function projectSeries(
  entries: readonly MeasuredEntry[],
  reference?: HistoryChartSeries["reference"],
): HistoryChartSeries {
  let segment = 0;
  const builds = entries.map((entry): HistoryChartBuild => {
    const key = landedCiEntryKey(entry);
    if (entry.kind === "point")
      return {
        kind: "point",
        key,
        date: entry.startedAt,
        ms: entry.wallTimeMs,
        segment: String(segment),
        description: `${buildDateWords(entry.startedAt)} · ${pointWallTimeWords(entry)} · ${plainWords(pointLandingsWords(entry))}`,
      };
    segment++;
    return {
      kind: "gap",
      key,
      date: entryDate(entry),
      ...gapStatus(entry.reason === "failed", gapReasonWords(entry)),
    };
  });
  return {
    label: "CI wall time by build date",
    builds,
    ...(reference === undefined ? {} : { reference }),
  };
}

const isSelected = (mark: ChartMark) => mark.build.selected === true;

// The marks as buttons over the drawing and the readout of the one the reader
// last pointed at, focused or tapped; the selected build's, or else the
// latest build's, until then.
function MarkReadout({ layout }: { readonly layout: ChartLayout }) {
  const [inspected, setInspected] = useState<string>();
  const shown =
    layout.marks.find((mark) => mark.build.key === inspected) ??
    layout.marks.find(isSelected) ??
    layout.marks.at(-1);
  return (
    <>
      <div className="intent-ci-history-marks">
        {layout.marks.map((mark) => {
          const { key } = mark.build;
          const inspect = () => {
            setInspected(key);
          };
          return (
            <button
              key={key}
              type="button"
              className="intent-ci-history-mark"
              aria-label={mark.readout}
              aria-current={mark === shown ? "true" : undefined}
              style={{ left: mark.x, top: mark.y }}
              onPointerEnter={inspect}
              onFocus={inspect}
              onClick={inspect}
            />
          );
        })}
      </div>
      <p className="intent-ci-history-readout" aria-live="polite">
        {shown?.readout}
      </p>
    </>
  );
}

export function IntentCiHistoryChart(
  props: { readonly reference?: HistoryChartSeries["reference"] } & (
    | {
        readonly entries: readonly MeasuredEntry[];
        readonly series?: never;
      }
    | {
        readonly series: HistoryChartSeries;
        readonly entries?: never;
      }
  ),
) {
  const series = props.series ?? projectSeries(props.entries, props.reference);
  const { box, width } = useBoxWidth();
  const layout =
    width > minimumChartWidth && series.builds.some(isMeasured)
      ? chartLayout(series, width)
      : undefined;
  return (
    <div className="intent-ci-history-chart">
      <div ref={box} className="intent-ci-history-plot">
        <svg
          role="img"
          aria-label={series.label}
          width="100%"
          height={chartHeight}
        >
          {layout !== undefined && <IntentCiHistoryPlot layout={layout} />}
        </svg>
        {layout !== undefined && <MarkReadout layout={layout} />}
      </div>
    </div>
  );
}
