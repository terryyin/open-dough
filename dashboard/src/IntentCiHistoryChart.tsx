// The measured builds of Project Intent's CI wall time history
// (`./IntentCiHistory.tsx`) as one line of CI wall time by build date: a
// hand-written inline SVG, with no chart library, drawn at the width its box
// is given so its words keep their size on a phone. Each point stands at its
// build's start, earliest left, and at its CI wall time against whole-step
// times that cover the measured range; the line joins the points in that
// order. One series in the frame's accent with a surface ring around each
// point, a recessive grid and the axis words in quiet ink
// (`./intent-ci-history.css`). To assistive technology it is one image named
// for what it plots; Builds and evidence gives every point it draws in words,
// as each point's hover does.

import { useLayoutEffect, useRef, useState } from "react";
import { shortSha } from "./baseCiWording.ts";
import { wholeSecondWords } from "./ciProofTimeWords.ts";
import {
  buildDateWords,
  pointWallTimeWords,
  provenanceWords,
} from "./ciHistoryWords.ts";
import { landedCiPointKey, type MeasuredPoint } from "./landedCiHistory.ts";

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

function Plot({
  points,
  width,
}: {
  readonly points: readonly MeasuredPoint[];
  readonly width: number;
}) {
  const plotEnd = width - plotEndRoom;
  const ticks = wallTimeTicks(points.map((point) => point.wallTimeMs));
  const lowest = ticks[0] ?? 0;
  const highest = ticks.at(-1) ?? lowest + shortestRangeMs;
  const y = (ms: number) =>
    plotBottom - ((ms - lowest) / (highest - lowest)) * (plotBottom - plotTop);
  const starts = points.map((point) => Date.parse(point.startedAt));
  const earliest = Math.min(...starts);
  const latest = Math.max(...starts);
  const x = (at: number) =>
    latest === earliest
      ? (plotStart + plotEnd) / 2
      : plotStart +
        ((at - earliest) / (latest - earliest)) * (plotEnd - plotStart);
  const placed = points.map((point, at) => ({
    point,
    x: x(starts[at] ?? earliest),
    y: y(point.wallTimeMs),
  }));
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
      {placed.length > 1 && (
        <path
          className="intent-ci-history-line"
          d={placed
            .map(
              (at, index) =>
                `${index === 0 ? "M" : "L"}${String(at.x)} ${String(at.y)}`,
            )
            .join(" ")}
        />
      )}
      {placed.map(({ point, x: cx, y: cy }) => (
        <circle
          key={landedCiPointKey(point)}
          className="intent-ci-history-point"
          cx={cx}
          cy={cy}
          r={4}
        >
          <title>
            {`${buildDateWords(point.startedAt)} · ${pointWallTimeWords(point)} · ${provenanceWords(point)} ${shortSha(point.revision)}`}
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
  points,
}: {
  readonly points: readonly MeasuredPoint[];
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
          <Plot points={points} width={width} />
        )}
      </svg>
    </div>
  );
}
