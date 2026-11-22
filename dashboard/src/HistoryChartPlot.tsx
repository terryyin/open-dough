// SVG marks for one placed dated series (`./historyChartLayout.ts`): the
// value grid, the dashed reference level, the line, a filled point per
// measured entry, a hollow diamond for a partial one, an ≈ beside an
// estimated one, a larger diamond for
// the selected one, and on the row below the axis a red × per failed build
// or a hollow mark per other build without timing. A selected build without
// timing is also marked across the plot. A named trace after the first adds
// its slot's class (`history-chart-trace-N`) to its points, trend and ↑ marks;
// unselected points take their trace's shape (`./historyChartShapes.tsx`).
import type { ChartLayout, ChartMark } from "./historyChartLayout.ts";
import { dateBaseline, plotBottom, plotTop } from "./historyChartLayout.ts";
import { diamond, PointShape, traceClass } from "./historyChartShapes.tsx";

function Mark({
  mark,
  layout,
}: {
  readonly mark: ChartMark;
  readonly layout: ChartLayout;
}) {
  const { x, y, entry } = mark;
  const { selectedLabel } = layout;
  const trace = traceClass(mark.slot);
  if (mark.overflow !== undefined)
    return (
      <g className="history-chart-overflow" data-key={entry.key}>
        <path
          className="history-chart-large"
          d={`M${String(x - 5)} ${String(y - 5)} l10 10 m0 -10 l-10 10`}
        />
        <text x={mark.overflow.labelX} y={y - 10} textAnchor="middle">
          {mark.overflow.label}
        </text>
      </g>
    );
  if (entry.kind === "gap")
    return (
      <g>
        {entry.status === "failed" ? (
          <path
            className="history-chart-failed"
            d={`M${String(x - 4)} ${String(y - 4)} l8 8 m0 -8 l-8 8`}
          />
        ) : (
          <circle className="history-chart-unavailable" cx={x} cy={y} r={4} />
        )}
        {entry.selected === true && (
          <>
            <line
              className="history-chart-gap-marker"
              x1={x}
              x2={x}
              y1={plotTop + layout.overflowHeight}
              y2={plotBottom + layout.overflowHeight}
            />
            <text
              x={Math.max(
                layout.plotLeft + 38,
                Math.min(x, layout.plotEnd - 38),
              )}
              y={plotTop + layout.overflowHeight}
              textAnchor="middle"
            >
              {`${selectedLabel} gap`}
            </text>
          </>
        )}
      </g>
    );
  const estimate = entry.estimate !== undefined && (
    <text
      className="history-chart-estimate"
      x={x + 8}
      y={y - 6}
      aria-hidden="true"
    >
      ≈
    </text>
  );
  if (entry.selected !== true)
    return (
      <>
        <PointShape
          slot={mark.slot}
          partial={entry.partial !== undefined}
          x={x}
          y={y}
        >
          <title>{entry.description}</title>
        </PointShape>
        {estimate}
      </>
    );
  return (
    <g>
      {estimate}
      <path
        className={`history-chart-point${entry.partial === undefined ? "" : " history-chart-partial"}${trace}`}
        d={diamond(x, y, 6)}
      >
        <title>{entry.description}</title>
      </path>
      <text
        className="history-chart-selected"
        x={Math.max(layout.plotLeft + 28, Math.min(x, layout.plotEnd - 28))}
        y={y < plotTop + 20 ? y + 22 : y - 10}
        textAnchor="middle"
      >
        {selectedLabel}
      </text>
    </g>
  );
}

// Each trend's strokes; an independent trend paints above the task marks.
function Trends({
  layout,
  className,
}: {
  readonly layout: ChartLayout;
  readonly className: string;
}) {
  return layout.trends.map(
    ({ path, slot }, index) =>
      path !== "" && (
        <path
          key={index}
          className={`history-chart-line${className}${traceClass(slot)}`}
          d={path}
        />
      ),
  );
}

export function HistoryChartPlot({ layout }: { readonly layout: ChartLayout }) {
  const { plotLeft, plotEnd, reference } = layout;
  return (
    <>
      {layout.ticks.map((tick) => (
        <g key={tick.value}>
          <line
            className="history-chart-grid"
            x1={plotLeft}
            x2={plotEnd}
            y1={tick.y}
            y2={tick.y}
          />
          <text x={plotLeft - 8} y={tick.y + 4} textAnchor="end">
            {tick.words}
          </text>
        </g>
      ))}
      {reference !== undefined && (
        <g className="history-chart-reference">
          <title>{reference.label}</title>
          <line x1={plotLeft} x2={plotEnd} y1={reference.y} y2={reference.y} />
        </g>
      )}
      {layout.line !== "" && (
        <path className="history-chart-line" d={layout.line} />
      )}
      {!layout.trendOnTop && <Trends layout={layout} className="" />}
      {layout.marks.map((mark) => (
        <Mark key={mark.entry.key} mark={mark} layout={layout} />
      ))}
      {layout.trendOnTop && (
        <Trends layout={layout} className=" history-chart-trend" />
      )}
      {layout.trendOverflows.map((point, index) => (
        <g
          className={`history-chart-trend-overflow${traceClass(point.slot)}`}
          key={index}
        >
          <path d={`M${point.x - 5} ${point.y + 3} l5 -6 l5 6`} />
          <text x={point.labelX} y={point.y - 10} textAnchor="middle">
            {point.label}
          </text>
        </g>
      ))}
      {layout.dates.map(({ x, words }) => (
        <text
          key={words}
          x={x}
          y={dateBaseline + layout.overflowHeight}
          textAnchor="middle"
        >
          {words}
        </text>
      ))}
    </>
  );
}
