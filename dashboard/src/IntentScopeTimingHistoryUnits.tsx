// Declared units share one generic chart renderer and never share a scale.
import { useId } from "react";
import { buildDateWords } from "./ciHistoryWords.ts";
import { declaredUnits, unitName, type DeclaredUnit } from "./ciProofUnits.ts";
import { executionTimeWords } from "./ciProofTimeWords.ts";
import { failedBuildReason, type CiScopeHistory } from "./ciScopeHistory.ts";
import {
  gapStatus,
  isMeasured,
  type HistoryChartBuild,
} from "./ciHistoryChart.ts";
import { IntentCiHistoryChart } from "./IntentCiHistoryChart.tsx";
import { scopeHistoryProvenance } from "./IntentScopeTimingHistoryEvidence.tsx";
import {
  scopeHistoryEndpointWords,
  scopeHistoryReason,
  scopeHistorySelectionWords,
  type ScopeHistoryContext,
} from "./intentScopeHistoryContext.ts";
import { IntentScopePriorBuildReference } from "./IntentScopePriorBuildReference.tsx";

function UnitHistory({
  history,
  unit,
  context,
}: {
  readonly history: CiScopeHistory;
  readonly unit: DeclaredUnit;
  readonly context: ScopeHistoryContext;
}) {
  const heading = useId();
  const endpointWords = scopeHistoryEndpointWords(context);
  const selectionWords = scopeHistorySelectionWords(context);
  const name = unitName(unit);
  const title = `${name[0]?.toUpperCase() ?? ""}${name.slice(1)}`;
  const comparison = history.references?.find(
    (candidate) => candidate.unit === unit,
  );
  const averageMs = comparison?.reference.averageMs;
  const builds = history.entries.map((entry): HistoryChartBuild => {
    const reading = entry.readings.find((each) => each.unit === unit);
    const common = {
      key: entry.key,
      date: entry.date,
      selected: entry.selected,
    };
    if (reading?.kind === "point")
      return {
        ...common,
        kind: "point",
        ms: reading.ms,
        segment: reading.segment,
        description: `${buildDateWords(entry.date)} · ${executionTimeWords(reading.ms)} · ${name} · ${scopeHistoryProvenance(entry)}${entry.selected ? ` · ${endpointWords}` : ""}`,
      };
    const reason =
      reading?.reason ?? (entry.kind === "gap" ? entry.reason : undefined);
    return {
      ...common,
      kind: "gap",
      ...gapStatus(
        reason === failedBuildReason,
        reason === undefined ? undefined : scopeHistoryReason(context, reason),
      ),
    };
  });
  return (
    <section aria-labelledby={heading}>
      <h5 id={heading}>{title}</h5>
      <IntentScopePriorBuildReference
        comparison={comparison}
        entries={history.entries}
        context={context}
      />
      {!builds.some(isMeasured) ? (
        <p className="intent-ci-history-note">
          No complete test execution times are available for {name}.
        </p>
      ) : (
        <IntentCiHistoryChart
          series={{
            label: `Test execution time for ${name} by build date; ${endpointWords.toLowerCase()} marked`,
            precise: true,
            selectedLabel: selectionWords,
            builds,
            ...(averageMs === undefined
              ? {}
              : {
                  reference: {
                    ms: averageMs,
                    label: `Prior-build average: ${executionTimeWords(averageMs)}`,
                  },
                }),
          }}
        />
      )}
    </section>
  );
}

export function IntentScopeTimingHistoryUnits({
  history,
  context,
}: {
  readonly history: CiScopeHistory;
  readonly context: ScopeHistoryContext;
}) {
  const units = declaredUnits.filter((unit) =>
    history.entries.some((entry) =>
      entry.readings.some((reading) => reading.unit === unit),
    ),
  );
  return (
    <>
      {units.map((unit) => (
        <UnitHistory
          key={unit}
          history={history}
          unit={unit}
          context={context}
        />
      ))}
    </>
  );
}
