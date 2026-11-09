// One responsive dated timing chart for collected history. Project CI status
// supplies its window of ordered points and gaps, including each measured
// build's represented landings; scope Proof supplies precise execution time
// and compatible segments. Both use the same segment drawing: a gap never
// acquires a numeric point or joining stroke. The enclosing history lists the
// same evidence in readable, linked words.

import { useLayoutEffect, useRef, useState } from "react";
import {
  buildDateWords,
  plainWords,
  pointLandingsWords,
  pointWallTimeWords,
} from "./ciHistoryWords.ts";
import {
  entryDate,
  landedCiEntryKey,
  type MeasuredEntry,
} from "./landedCiHistory.ts";

import type {
  HistoryChartPoint,
  HistoryChartSeries,
} from "./ciHistoryChart.ts";
export type {
  HistoryChartPoint,
  HistoryChartSeries,
} from "./ciHistoryChart.ts";
import {
  IntentCiHistoryPlot,
  minimumChartWidth,
} from "./IntentCiHistoryPlot.tsx";

const height = 164;

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

function projectSeries(entries: readonly MeasuredEntry[]): HistoryChartSeries {
  const points: HistoryChartPoint[] = [];
  let segment = 0;
  for (const entry of entries) {
    if (entry.kind === "gap") {
      segment++;
      continue;
    }
    points.push({
      key: landedCiEntryKey(entry),
      date: entry.startedAt,
      ms: entry.wallTimeMs,
      segment: String(segment),
      description: `${buildDateWords(entry.startedAt)} · ${pointWallTimeWords(entry)} · ${plainWords(pointLandingsWords(entry))}`,
    });
  }
  return {
    label: "CI wall time by build date",
    points,
    dates: entries.map(entryDate),
  };
}

export function IntentCiHistoryChart(
  props:
    | {
        readonly entries: readonly MeasuredEntry[];
        readonly series?: never;
      }
    | {
        readonly series: HistoryChartSeries;
        readonly entries?: never;
      },
) {
  const series = props.series ?? projectSeries(props.entries);
  const { box, width } = useBoxWidth();
  return (
    <div ref={box} className="intent-ci-history-chart">
      <svg role="img" aria-label={series.label} width="100%" height={height}>
        {width > minimumChartWidth && series.points.length > 0 && (
          <IntentCiHistoryPlot series={series} width={width} />
        )}
      </svg>
    </div>
  );
}
