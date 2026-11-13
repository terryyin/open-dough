// One chart of one declared unit at a time: with test case and test file
// readings both present, a Test cases / Test file choice changes the compact
// readout's value and average and the chart's scale together. Units never
// share a scale. A file's case timing is the aggregate of its test cases.
import { useId, useState } from "react";
import { buildDateWords, standInBuildWords } from "./ciHistoryWords.ts";
import { declaredUnits, unitName, type DeclaredUnit } from "./ciProofUnits.ts";
import { executionTimeWords } from "./ciProofTimeWords.ts";
import type { ScopeHistoryGlance, ScopeGlanceEntry } from "./ciScopeHistory.ts";
import {
  gapStatus,
  isMeasured,
  type HistoryChartBuild,
} from "./ciHistoryChart.ts";
import { IntentCiHistoryChart } from "./IntentCiHistoryChart.tsx";
import {
  scopeHistoryEndpointWords,
  scopeHistoryReason,
  scopeHistorySelectionWords,
  type ScopeHistoryContext,
} from "./intentScopeHistoryContext.ts";
import { IntentScopePriorBuildReference } from "./IntentScopePriorBuildReference.tsx";

// How a measured build stands for the landings it represents.
function provenanceWords(entry: ScopeGlanceEntry): string {
  const roles = new Set(entry.landings.map((landing) => landing.provenance));
  if (roles.size > 1) return "Measured build";
  const role = roles.values().next().value;
  return role === "later" || role === "equivalent"
    ? standInBuildWords[role]
    : "Exact build";
}

const unitTitle = (unit: DeclaredUnit) => {
  const name = unitName(unit);
  return `${name[0]?.toUpperCase() ?? ""}${name.slice(1)}`;
};

// The choice of a unit: a file's own outcome is its "Test file".
const choiceWords = (unit: DeclaredUnit, file: boolean) =>
  file && unit === "file" ? "Test file" : unitTitle(unit);

function UnitHistory({
  history,
  unit,
  context,
  heading,
}: {
  readonly history: ScopeHistoryGlance;
  readonly unit: DeclaredUnit;
  readonly context: ScopeHistoryContext;
  readonly heading: boolean;
}) {
  const headingId = useId();
  const endpointWords = scopeHistoryEndpointWords(context);
  const name = unitName(unit);
  const title = unitTitle(unit);
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
        description: `${buildDateWords(entry.date)} · ${executionTimeWords(reading.ms)} · ${name} · ${provenanceWords(entry)}${entry.selected ? ` · ${endpointWords}` : ""}`,
      };
    const gap = reading ?? (entry.kind === "gap" ? entry.gap : undefined);
    return {
      ...common,
      kind: "gap",
      ...gapStatus(
        gap?.status === "failed",
        gap === undefined ? undefined : scopeHistoryReason(context, gap.reason),
      ),
    };
  });
  return (
    <section
      {...(heading
        ? { "aria-labelledby": headingId }
        : { "aria-label": title })}
    >
      {heading && <h5 id={headingId}>{title}</h5>}
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
            selectedLabel: scopeHistorySelectionWords(context),
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
  file,
}: {
  readonly history: ScopeHistoryGlance;
  readonly context: ScopeHistoryContext;
  // Whether the scope is one test file rather than an entry or folder.
  readonly file: boolean;
}) {
  const [chosen, choose] = useState<DeclaredUnit | undefined>(undefined);
  const units = declaredUnits.filter((unit) =>
    history.entries.some((entry) =>
      entry.readings.some((reading) => reading.unit === unit),
    ),
  );
  const unit = units.find((each) => each === chosen) ?? units[0];
  if (unit === undefined) {
    return (
      <p className="intent-ci-history-note">
        No complete test execution times are available for this scope.
      </p>
    );
  }
  return (
    <>
      {units.length > 1 && (
        <div
          className="intent-ci-history-units"
          role="group"
          aria-label="Timing unit"
        >
          {units.map((each) => (
            <button
              key={each}
              type="button"
              aria-pressed={each === unit}
              onClick={() => {
                choose(each);
              }}
            >
              {choiceWords(each, file)}
            </button>
          ))}
        </div>
      )}
      <UnitHistory
        key={unit}
        history={history}
        unit={unit}
        context={context}
        heading={units.length === 1}
      />
    </>
  );
}
