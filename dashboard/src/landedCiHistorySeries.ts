// Collected CI wall time as the shared chart's dated series
// (`./ciHistoryChart.ts`): each measured build a point, each gap a dated mark
// with its status words, and a gap starting a new line segment. Project CI
// status draws its whole window. A Done endpoint's glance read
// (`./ciDoneWallTimeHistory.ts`) answers only the verified observations
// through it, so its chart marks the build selected for it and newer
// landings never enter it.
import {
  buildDateWords,
  gapReasonWords,
  plainWords,
  pointLandingsWords,
  pointWallTimeWords,
} from "./ciHistoryWords.ts";
import {
  gapStatus,
  type HistoryChartBuild,
  type HistoryChartSeries,
} from "./ciHistoryChart.ts";
import type { PriorBuildFigures } from "./ciPriorBuildReference.ts";
import { evidenceOfEntry } from "./landedCiBuildKey.ts";
import {
  entryDate,
  landedCiEntryKey,
  type MeasuredEntry,
} from "./landedCiHistory.ts";

export function landedHistorySeries(
  entries: readonly MeasuredEntry[],
  options: {
    readonly label?: string;
    readonly averageMs?: number | undefined;
    readonly isSelected?: (entry: MeasuredEntry) => boolean;
  } = {},
): HistoryChartSeries {
  let segment = 0;
  const builds = entries.map((entry): HistoryChartBuild => {
    const key = landedCiEntryKey(entry);
    const selected = options.isSelected?.(entry) === true;
    if (entry.kind === "point")
      return {
        kind: "point",
        key,
        date: entry.startedAt,
        ms: entry.wallTimeMs,
        segment: String(segment),
        selected,
        description: `${buildDateWords(entry.startedAt)} · ${pointWallTimeWords(entry)} · ${plainWords(pointLandingsWords(entry))}`,
      };
    segment++;
    return {
      kind: "gap",
      key,
      date: entryDate(entry),
      selected,
      ...gapStatus(entry.reason === "failed", gapReasonWords(entry)),
    };
  });
  return {
    label: options.label ?? "CI wall time by build date",
    builds,
    averageMs: options.averageMs,
  };
}

// A Done endpoint's chart: the observations its glance read answers through
// it, the build selected for it marked, with its prior-build average.
export function doneWallTimeSeries(
  entries: readonly MeasuredEntry[],
  reference: PriorBuildFigures,
): HistoryChartSeries {
  const { selected } = reference;
  return landedHistorySeries(entries, {
    label: "CI wall time by build date; selected landing marked",
    averageMs: reference.averageMs,
    isSelected: (entry) =>
      selected !== undefined &&
      evidenceOfEntry(entry, [selected]) !== undefined,
  });
}
