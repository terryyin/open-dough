// SVG marks for one placed CI timing series (`./ciHistoryChartLayout.ts`):
// the duration grid, the dashed prior average, the line, a filled point per
// measured build or a diamond for the selected one, and on the row below the
// axis a red × per failed build or a hollow mark per other build without
// timing. A selected build without timing is also marked across the plot.
import type { ChartLayout, ChartMark } from "./ciHistoryChartLayout.ts";
import { dateBaseline, plotBottom, plotTop } from "./ciHistoryChartLayout.ts";

function Mark({
  mark,
  layout,
}: {
  readonly mark: ChartMark;
  readonly layout: ChartLayout;
}) {
  const { x, y, build } = mark;
  const { selectedLabel } = layout;
  if (build.kind === "gap")
    return (
      <g>
        {build.status === "failed" ? (
          <path
            className="intent-ci-history-failed"
            d={`M${String(x - 4)} ${String(y - 4)} l8 8 m0 -8 l-8 8`}
          />
        ) : (
          <circle
            className="intent-ci-history-unavailable"
            cx={x}
            cy={y}
            r={4}
          />
        )}
        {build.selected === true && (
          <>
            <line
              className="intent-ci-history-gap-marker"
              x1={x}
              x2={x}
              y1={plotTop}
              y2={plotBottom}
            />
            <text
              x={Math.max(
                layout.plotLeft + 38,
                Math.min(x, layout.plotEnd - 38),
              )}
              y={plotTop}
              textAnchor="middle"
            >
              {`${selectedLabel} gap`}
            </text>
          </>
        )}
      </g>
    );
  if (build.selected !== true)
    return (
      <circle className="intent-ci-history-point" cx={x} cy={y} r={4}>
        <title>{build.description}</title>
      </circle>
    );
  return (
    <g>
      <path
        className="intent-ci-history-point"
        d={`M${String(x)} ${String(y - 6)} l6 6 l-6 6 l-6 -6 Z`}
      >
        <title>{build.description}</title>
      </path>
      <text
        className="intent-ci-history-selected"
        x={Math.max(layout.plotLeft + 28, Math.min(x, layout.plotEnd - 28))}
        y={y < plotTop + 20 ? y + 22 : y - 10}
        textAnchor="middle"
      >
        {selectedLabel}
      </text>
    </g>
  );
}

export function IntentCiHistoryPlot({
  layout,
}: {
  readonly layout: ChartLayout;
}) {
  const { plotLeft, plotEnd, reference } = layout;
  return (
    <>
      {layout.ticks.map((tick) => (
        <g key={tick.ms}>
          <line
            className="intent-ci-history-grid"
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
        <g className="intent-ci-history-reference">
          <title>{reference.label}</title>
          <line x1={plotLeft} x2={plotEnd} y1={reference.y} y2={reference.y} />
        </g>
      )}
      {layout.line !== "" && (
        <path className="intent-ci-history-line" d={layout.line} />
      )}
      {layout.marks.map((mark) => (
        <Mark key={mark.build.key} mark={mark} layout={layout} />
      ))}
      {layout.dates.map(({ x, words }) => (
        <text key={words} x={x} y={dateBaseline} textAnchor="middle">
          {words}
        </text>
      ))}
    </>
  );
}
