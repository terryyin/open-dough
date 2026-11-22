// The key under System settings → Usage's trend (`./TokenIndexTrend.tsx`):
// for each shown tool, its task mark, partial or provisional mark and rolling
// median, each drawn as the chart draws that tool's trace
// (`./historyChartShapes.tsx`) and named with the tool, so tools read apart
// without colour.
import { HistoryChartKey } from "./historyChartShapes.tsx";
import { usageToolName, usageToolSlot } from "./usageComparison.ts";
import type { UsageTool } from "./usageTokenIndex.ts";
import "./usage-legend.css";

export function UsageLegend({
  tools,
}: {
  readonly tools: readonly UsageTool[];
}) {
  return (
    <ul className="usage-legend" aria-label="Chart key">
      {tools.flatMap((tool) => {
        const name = usageToolName(tool);
        const slot = usageToolSlot(tool);
        return [
          <li key={`${tool}-point`}>
            <HistoryChartKey slot={slot} kind="point" /> {name} task
          </li>,
          <li key={`${tool}-partial`}>
            <HistoryChartKey slot={slot} kind="partial" /> {name} partial or
            provisional
          </li>,
          <li key={`${tool}-trend`}>
            <HistoryChartKey slot={slot} kind="trend" /> {name} rolling median
            (↑ above scale)
          </li>,
        ];
      })}
    </ul>
  );
}
