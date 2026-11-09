// SVG geometry and marks for one dated CI timing series.
import { buildDateWords } from "./ciHistoryWords.ts";
import { executionTimeWords, wholeSecondWords } from "./ciProofTimeWords.ts";
import type {
  HistoryChartPoint,
  HistoryChartSeries,
} from "./ciHistoryChart.ts";

const plotTop = 12;
const plotBottom = 128;
const dateBaseline = 152;
const plotStart = 56;
const plotEndRoom = 16;
export const minimumChartWidth = plotStart + plotEndRoom;
const shortestRangeMs = 2 * 60_000;
const tickStepsSeconds = [
  10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 14_400,
];
const dateRoom = 64;
const dateEdgeRoom = 22;

function timeTicks(values: readonly number[], precise: boolean): number[] {
  const minimumRange = precise ? 2_000 : shortestRangeMs;
  let low = Math.min(...values);
  let high = Math.max(...values);
  if (high - low < minimumRange) {
    const middle = (low + high) / 2;
    low = middle - minimumRange / 2;
    high = middle + minimumRange / 2;
  }
  low = Math.max(0, low);
  const scale = Math.pow(
    10,
    Math.floor(Math.log10(Math.max(1, high - low) / 4)),
  );
  const preciseStep =
    [1, 2, 5, 10]
      .map((factor) => factor * scale)
      .find(
        (candidate) =>
          Math.ceil(high / candidate) - Math.floor(low / candidate) <= 4,
      ) ?? scale * 10;
  const step = precise
    ? preciseStep
    : (tickStepsSeconds.find(
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

type Placed = {
  readonly point: HistoryChartPoint;
  readonly x: number;
  readonly y: number;
};

// Each compatible segment starts a new SVG subpath. A one-point subpath is
// only a move, so it draws no stroke and never joins either neighbouring gap.
function lineThrough(placed: readonly Placed[]): string {
  if (placed.length < 2) return "";
  return placed
    .map(
      (at, index) =>
        `${index === 0 || at.point.segment !== placed[index - 1]?.point.segment ? "M" : "L"}${String(at.x)} ${String(at.y)}`,
    )
    .join(" ");
}

export function IntentCiHistoryPlot({
  series,
  width,
}: {
  readonly series: HistoryChartSeries;
  readonly width: number;
}) {
  const { points } = series;
  const plotEnd = width - plotEndRoom;
  const ticks = timeTicks(
    points.map((point) => point.ms),
    series.precise === true,
  );
  const lowest = ticks[0] ?? 0;
  const highest = ticks.at(-1) ?? lowest + shortestRangeMs;
  const y = (ms: number) =>
    plotBottom - ((ms - lowest) / (highest - lowest)) * (plotBottom - plotTop);
  const starts = points.map((point) => Date.parse(point.date));
  const dates = [
    ...starts,
    ...(series.dates ?? []).map((date) => Date.parse(date)),
    ...(series.annotations ?? []).map((annotation) =>
      Date.parse(annotation.date),
    ),
  ];
  const earliest = Math.min(...dates);
  const latest = Math.max(...dates);
  const x = (at: number) =>
    latest === earliest
      ? (plotStart + plotEnd) / 2
      : plotStart +
        ((at - earliest) / (latest - earliest)) * (plotEnd - plotStart);
  const placed = points.map((point, at) => ({
    point,
    x: x(starts[at] ?? earliest),
    y: y(point.ms),
  }));
  const line = lineThrough(placed);
  const dated: { x: number; words: string }[] = [];
  const middle =
    placed.length >= 3 && width >= 480 ? [Math.floor(placed.length / 2)] : [];
  for (const index of [0, ...middle, placed.length - 1]) {
    const at = placed[index];
    if (at === undefined) continue;
    const words = buildDateWords(at.point.date);
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
            {series.precise === true
              ? executionTimeWords(tick)
              : wholeSecondWords(tick)}
          </text>
        </g>
      ))}
      {line !== "" && <path className="intent-ci-history-line" d={line} />}
      {placed.map(({ point, x: cx, y: cy }) => (
        <g key={point.key}>
          {point.selected === true ? (
            <>
              <path
                className="intent-ci-history-point"
                d={`M${String(cx)} ${String(cy - 6)} l6 6 l-6 6 l-6 -6 Z`}
              >
                <title>{point.description}</title>
              </path>
              <text
                className="intent-ci-history-selected"
                x={Math.max(plotStart + 28, Math.min(cx, plotEnd - 28))}
                y={cy < plotTop + 20 ? cy + 22 : cy - 10}
                textAnchor="middle"
              >
                Selected
              </text>
            </>
          ) : (
            <circle className="intent-ci-history-point" cx={cx} cy={cy} r={4}>
              <title>{point.description}</title>
            </circle>
          )}
        </g>
      ))}
      {(series.annotations ?? []).map((annotation) => (
        <g key={annotation.key}>
          <line
            className="intent-ci-history-gap-marker"
            x1={x(Date.parse(annotation.date))}
            x2={x(Date.parse(annotation.date))}
            y1={plotTop}
            y2={plotBottom}
          />
          <text
            x={Math.max(
              plotStart + 38,
              Math.min(x(Date.parse(annotation.date)), plotEnd - 38),
            )}
            y={plotTop}
            textAnchor="middle"
          >
            {annotation.label}
          </text>
        </g>
      ))}
      {dated.map(({ x: at, words }) => (
        <text key={words} x={at} y={dateBaseline} textAnchor="middle">
          {words}
        </text>
      ))}
    </>
  );
}
