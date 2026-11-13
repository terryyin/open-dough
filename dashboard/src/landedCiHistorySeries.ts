// Collected CI wall time as the shared chart's dated series
// (`./ciHistoryChart.ts`): each measured build a point, each gap a dated mark
// with its status words, and a gap starting a new line segment. Project CI
// status draws its whole window. A Done endpoint draws only the verified
// observations through it, marking the build selected for it, so newer
// landings never enter its chart.
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
import {
  isThroughEndpoint,
  type PriorBuildEvidence,
  type PriorBuildReference,
} from "./ciPriorBuildReference.ts";
import { wholeSecondWords } from "./ciProofTimeWords.ts";
import { buildKeyOf } from "./landedCiBuildKey.ts";
import {
  entryDate,
  landedCiEntryKey,
  type MeasuredEntry,
} from "./landedCiHistory.ts";

// The reference sample an entry stands for: its measured attempt, or a gap's
// landing or the build named for it.
export function evidenceOfEntry(
  entry: MeasuredEntry,
  evidence: readonly PriorBuildEvidence[],
): PriorBuildEvidence | undefined {
  const keys =
    entry.kind === "point"
      ? [buildKeyOf(entry)]
      : [
          `landing/${entry.revision}`,
          ...(entry.reason !== "pending" && entry.build !== undefined
            ? [buildKeyOf(entry.build)]
            : []),
        ];
  return evidence.find((sample) => keys.includes(sample.key));
}

// The prior-build average as the chart's dashed line.
export const averageLineOf = (
  reference: PriorBuildReference | undefined,
): HistoryChartSeries["reference"] =>
  reference?.averageMs === undefined
    ? undefined
    : {
        ms: reference.averageMs,
        label: `Prior-build average ${wholeSecondWords(reference.averageMs)}`,
      };

export function landedHistorySeries(
  entries: readonly MeasuredEntry[],
  options: {
    readonly label?: string;
    readonly reference?: HistoryChartSeries["reference"];
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
  const { reference } = options;
  return {
    label: options.label ?? "CI wall time by build date",
    builds,
    ...(reference === undefined ? {} : { reference }),
  };
}

// A Done endpoint's chart: its selected build and the verified retained
// observations through it, with its prior-build average.
export function doneWallTimeSeries(
  entries: readonly MeasuredEntry[],
  reference: PriorBuildReference,
): HistoryChartSeries {
  const through = entries.filter((entry) => {
    const sample = evidenceOfEntry(entry, reference.evidence);
    return sample !== undefined && isThroughEndpoint(sample);
  });
  return {
    ...landedHistorySeries(through, {
      label: "CI wall time by build date; selected landing marked",
      reference: averageLineOf(reference),
      isSelected: (entry) =>
        evidenceOfEntry(entry, reference.evidence)?.status === "selected",
    }),
    selectedLabel: "Selected landing",
  };
}
