// The measured builds of Project Intent's CI wall time history
// (`./IntentCiHistory.tsx`) as a line of CI wall time by date: a
// hand-written inline SVG, with no chart library, drawn at the width its box
// is given so its words keep their size on a phone. Each point stands at its
// build's start, earliest left, and at its CI wall time against whole-step
// times that cover the measured range, so a line that climbs is CI getting
// slower; the dates span the history's gaps too, each at the date its landing
// was recorded. The line joins the points in the history's order and breaks
// at each gap -- pending, failed or unavailable -- drawing nothing for it, so
// a failed build has no point and a gap after the last point leaves the line
// ended before it; a landing a later build measures is in that build's point,
// so it breaks nothing. One series in the frame's accent with a surface ring
// around each point, a recessive grid and the axis words in quiet ink
// (`./intent-ci-history.css`). To assistive technology it is one image named
// for what it plots; Builds and evidence gives every point it draws, and
// every gap, in words, as each point's hover does.

import { useLayoutEffect, useRef, useState } from "react";
import { wholeSecondWords } from "./ciProofTimeWords.ts";
import {
  buildDateWords,
  plainWords,
  pointLandingsWords,
  pointWallTimeWords,
} from "./ciHistoryWords.ts";
import {
  entryDate,
  isPoint,
  landedCiEntryKey,
  type MeasuredEntry,
  type MeasuredPoint,
} from "./landedCiHistory.ts";

const height = 164;
const plotTop = 12;
const plotBottom = 128;
const dateBaseline = 152;
// Room for the time words left of the plot, and for a last date right of it.
const plotStart = 56;
const plotEndRoom = 16;
// The shortest range of time the plot spans, so one build or builds of one
// time stand inside it, not on its edge.
const shortestRangeMs = 2 * 60_000;
// Steps between time words, in seconds: the first that needs at most four.
const tickStepsSeconds = [
  10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 14_400,
];
// A date said under the plot keeps this much room from the next, and its
// middle this much from the image's right edge, so it is said whole.
const dateRoom = 64;
const dateEdgeRoom = 22;

// Whole-step times covering the measured CI wall times, never below zero.
function wallTimeTicks(values: readonly number[]): number[] {
  let low = Math.min(...values);
  let high = Math.max(...values);
  if (high - low < shortestRangeMs) {
    const middle = (low + high) / 2;
    low = middle - shortestRangeMs / 2;
    high = middle + shortestRangeMs / 2;
  }
  low = Math.max(0, low);
  const step =
    (tickStepsSeconds.find(
      (seconds) =>
        Math.ceil(high / (seconds * 1000)) -
          Math.floor(low / (seconds * 1000)) <=
        4,
    ) ?? 14_400) * 1000;
  const ticks: number[] = [];
  for (
    let at = Math.floor(low / step) * step;
    at <= Math.ceil(high / step) * step;
    at += step
  )
    ticks.push(at);
  return ticks;
}

// The width the box is given, kept as it changes.
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

type Placed = {
  readonly point: MeasuredPoint;
  readonly x: number;
  readonly y: number;
};

// The line through the placed points, in order, broken wherever a gap falls
// between two of them: each unbroken segment of two or more points is one
// stroke.
function lineThrough(segments: readonly (readonly Placed[])[]): string {
  return segments
    .filter((segment) => segment.length > 1)
    .map((segment) =>
      segment
        .map(
          (at, index) =>
            `${index === 0 ? "M" : "L"}${String(at.x)} ${String(at.y)}`,
        )
        .join(" "),
    )
    .join(" ");
}

function Plot({
  entries,
  width,
}: {
  readonly entries: readonly MeasuredEntry[];
  readonly width: number;
}) {
  const plotEnd = width - plotEndRoom;
  const points = entries.filter(isPoint);
  const ticks = wallTimeTicks(points.map((point) => point.wallTimeMs));
  const lowest = ticks[0] ?? 0;
  const highest = ticks.at(-1) ?? lowest + shortestRangeMs;
  const y = (ms: number) =>
    plotBottom - ((ms - lowest) / (highest - lowest)) * (plotBottom - plotTop);
  const dates = entries.map((entry) => Date.parse(entryDate(entry)));
  const earliest = Math.min(...dates);
  const latest = Math.max(...dates);
  const x = (at: number) =>
    latest === earliest
      ? (plotStart + plotEnd) / 2
      : plotStart +
        ((at - earliest) / (latest - earliest)) * (plotEnd - plotStart);
  // Each segment of points no gap falls between, in the history's order.
  const segments: Placed[][] = [[]];
  for (const entry of entries) {
    if (entry.kind === "gap") segments.push([]);
    else
      segments.at(-1)?.push({
        point: entry,
        x: x(Date.parse(entryDate(entry))),
        y: y(entry.wallTimeMs),
      });
  }
  const placed = segments.flat();
  const line = lineThrough(segments);
  // The first and last dates, and a middle one where there is room, each
  // said once under its point, kept whole within the image.
  const dated: { x: number; words: string }[] = [];
  const middle =
    placed.length >= 3 && width >= 480 ? [Math.floor(placed.length / 2)] : [];
  for (const index of [0, ...middle, placed.length - 1]) {
    const at = placed[index];
    if (at === undefined) continue;
    const words = buildDateWords(at.point.startedAt);
    const under = Math.min(at.x, width - dateEdgeRoom);
    if (
      dated.some(
        (each) => each.words === words || Math.abs(each.x - under) < dateRoom,
      )
    )
      continue;
    dated.push({ x: under, words });
  }
  return (
    <>
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            className="intent-ci-history-grid"
            x1={plotStart}
            x2={plotEnd}
            y1={y(tick)}
            y2={y(tick)}
          />
          <text x={plotStart - 8} y={y(tick) + 4} textAnchor="end">
            {wholeSecondWords(tick)}
          </text>
        </g>
      ))}
      {line !== "" && <path className="intent-ci-history-line" d={line} />}
      {placed.map(({ point, x: cx, y: cy }) => (
        <circle
          key={landedCiEntryKey(point)}
          className="intent-ci-history-point"
          cx={cx}
          cy={cy}
          r={4}
        >
          <title>
            {`${buildDateWords(point.startedAt)} · ${pointWallTimeWords(point)} · ${plainWords(pointLandingsWords(point))}`}
          </title>
        </circle>
      ))}
      {dated.map(({ x: at, words }) => (
        <text key={words} x={at} y={dateBaseline} textAnchor="middle">
          {words}
        </text>
      ))}
    </>
  );
}

export function IntentCiHistoryChart({
  entries,
}: {
  readonly entries: readonly MeasuredEntry[];
}) {
  const { box, width } = useBoxWidth();
  return (
    <div ref={box} className="intent-ci-history-chart">
      <svg
        role="img"
        aria-label="CI wall time by build date"
        width="100%"
        height={height}
      >
        {width > plotStart + plotEndRoom && (
          <Plot entries={entries} width={width} />
        )}
      </svg>
    </div>
  );
}
