// Declared units share one generic chart renderer and never share a scale.
import { useId } from "react";
import { buildDateWords } from "./ciHistoryWords.ts";
import { declaredUnits, unitName, type DeclaredUnit } from "./ciProofUnits.ts";
import { executionTimeWords } from "./ciProofTimeWords.ts";
import type { CiScopeHistory } from "./ciScopeHistory.ts";
import { IntentCiHistoryChart } from "./IntentCiHistoryChart.tsx";
import { scopeHistoryProvenance } from "./IntentScopeTimingHistoryEvidence.tsx";
import { IntentScopePriorBuildReference } from "./IntentScopePriorBuildReference.tsx";

function UnitHistory({
  history,
  unit,
}: {
  readonly history: CiScopeHistory;
  readonly unit: DeclaredUnit;
}) {
  const heading = useId();
  const name = unitName(unit);
  const title = `${name[0]?.toUpperCase() ?? ""}${name.slice(1)}`;
  const comparison = history.references?.find(
    (candidate) => candidate.unit === unit,
  );
  const averageMs = comparison?.reference.averageMs;
  const points = history.entries.flatMap((entry) =>
    entry.readings.flatMap((reading) =>
      reading.unit === unit && reading.kind === "point"
        ? [
            {
              key: entry.key,
              date: entry.date,
              ms: reading.ms,
              segment: reading.segment,
              selected: entry.selected,
              description: `${buildDateWords(entry.date)} · ${executionTimeWords(reading.ms)} · ${name} · ${scopeHistoryProvenance(entry)}${entry.selected ? " · Selected landing" : ""}`,
            },
          ]
        : [],
    ),
  );
  const annotations = history.entries
    .filter(
      (entry) =>
        entry.selected &&
        !entry.readings.some(
          (reading) => reading.unit === unit && reading.kind === "point",
        ),
    )
    .map((entry) => ({
      key: entry.key,
      date: entry.date,
      label: "Selected gap",
    }));
  return (
    <section aria-labelledby={heading}>
      <h5 id={heading}>{title}</h5>
      <IntentScopePriorBuildReference
        comparison={comparison}
        entries={history.entries}
      />
      {points.length === 0 ? (
        <p className="intent-ci-history-note">
          No complete test execution times are available for {name}.
        </p>
      ) : (
        <IntentCiHistoryChart
          series={{
            label: `Test execution time for ${name} by build date; selected landing marked`,
            precise: true,
            dates: history.entries.map((entry) => entry.date),
            annotations,
            points,
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
}: {
  readonly history: CiScopeHistory;
}) {
  const units = declaredUnits.filter((unit) =>
    history.entries.some((entry) =>
      entry.readings.some((reading) => reading.unit === unit),
    ),
  );
  return (
    <>
      {units.map((unit) => (
        <UnitHistory key={unit} history={history} unit={unit} />
      ))}
    </>
  );
}
