import type {
  CiScopeHistory,
  ScopeHistoryEndpoint,
  ScopeHistoryEntry,
  ScopeHistoryReading,
} from "../src/ciScopeHistory.ts";
import { z } from "zod";
import { declaredUnits, type DeclaredUnit } from "../src/ciProofUnits.ts";
import {
  scopeHistoryDeclaredUnitsOf,
  scopeHistorySignatureOf,
  scopeHistoryTimingsOf,
} from "./ciScopeHistoryTiming.ts";
import type { ProjectHistory } from "./landedCiHistoryStore.ts";
import { historyBuildOf } from "./landedCiHistoryEntries.ts";
import { scopeHistoryGapOf } from "./ciScopeHistoryGap.ts";
import { historyEndpointOf } from "./ciHistoryEndpoint.ts";
import { scopeHistoryReferencesOf } from "./ciScopeHistoryReference.ts";

const buildDateSchema = z.iso.datetime({ offset: true });

// Read retained observations only. Landing resolution, attempt selection and
// retention belong to the shared collector/store, not to scope projection.
export function scopeHistoryOf(
  history: ProjectHistory,
  path: string,
  endpoint: ScopeHistoryEndpoint,
  order: readonly string[] | undefined,
): CiScopeHistory {
  const { selected, availability, cohort, missingReason } = historyEndpointOf(
    history,
    endpoint.revision,
    order,
  );
  const units = declaredUnits.filter((unit) =>
    cohort.some(
      (landing) =>
        landing.observed.kind === "build" &&
        scopeHistoryDeclaredUnitsOf(
          history.builds[landing.observed.build],
          path,
        ).includes(unit),
    ),
  );
  const expected = new Map(
    units.map((unit) => [
      unit,
      scopeHistorySignatureOf(
        selected?.observed.kind === "build"
          ? history.builds[selected.observed.build]
          : undefined,
        path,
        unit,
      ),
    ]),
  );
  const entries: ScopeHistoryEntry[] = [];
  const byAttempt = new Map<string, number>();
  const segments = new Map<DeclaredUnit, number>();
  const previousSignatures = new Map<DeclaredUnit, string>();
  for (const landing of cohort) {
    const observed = landing.observed;
    const represented = {
      revision: landing.revision,
      receivedAt: landing.receivedAt,
      selected: landing.revision === endpoint.revision,
      ...(observed.kind === "build" && observed.selection !== "ancestor"
        ? { provenance: observed.selection }
        : {}),
    };
    if (observed.kind !== "build") {
      entries.push(
        scopeHistoryGapOf({ ...landing, observed }, represented, units),
      );
      previousSignatures.clear();
      continue;
    }
    const build = history.builds[observed.build];
    const existing = byAttempt.get(observed.build);
    if (existing !== undefined) {
      const prior = entries[existing];
      if (prior !== undefined)
        entries[existing] = {
          ...prior,
          selected: prior.selected || represented.selected,
          landings: [...prior.landings, represented],
          ...(represented.selected && prior.build !== undefined
            ? {
                build: {
                  ...prior.build,
                  provenance:
                    observed.selection === "later"
                      ? "later"
                      : observed.selection === "equivalent"
                        ? "equivalent"
                        : "exact",
                },
              }
            : {}),
        };
      continue;
    }
    byAttempt.set(observed.build, entries.length);
    const measuredDate = buildDateSchema.safeParse(
      build?.startedAt ?? build?.completedAt,
    );
    const common = {
      key: observed.build,
      date: measuredDate.success ? measuredDate.data : landing.receivedAt,
      landings: [represented],
      selected: represented.selected,
      ...(build === undefined || observed.selection === "ancestor"
        ? {}
        : {
            build: historyBuildOf(
              build,
              observed.selection === "later"
                ? "later"
                : observed.selection === "equivalent"
                  ? "equivalent"
                  : "exact",
            ),
          }),
    };
    const timing = scopeHistoryTimingsOf(
      build,
      observed.selection,
      path,
      expected,
      measuredDate.success,
      units,
    );
    const readings = timing.readings.map((reading): ScopeHistoryReading => {
      if (reading.kind === "gap") {
        previousSignatures.delete(reading.unit);
        return reading;
      }
      let segment = segments.get(reading.unit) ?? 0;
      if (previousSignatures.get(reading.unit) !== reading.signature) segment++;
      segments.set(reading.unit, segment);
      previousSignatures.set(reading.unit, reading.signature);
      return {
        kind: "point",
        unit: reading.unit,
        ms: reading.ms,
        entry: reading.entry,
        segment: String(segment),
      };
    });
    const details = {
      ...common,
      readings,
      ...(timing.legacyReason === undefined
        ? {}
        : { legacyReason: timing.legacyReason }),
    };
    if (readings.some((reading) => reading.kind === "point"))
      entries.push({ ...details, kind: "point" });
    else
      entries.push({
        ...details,
        kind: "gap",
        readings: readings.filter((reading) => reading.kind === "gap"),
        ...(timing.reason === undefined ? {} : { reason: timing.reason }),
        ...(timing.failed === true ? { failed: true } : {}),
      });
  }
  if (selected === undefined) {
    const reason = missingReason;
    entries.push({
      kind: "gap",
      key: `uncollected/${endpoint.revision}`,
      date: endpoint.at,
      selected: true,
      landings: [
        {
          revision: endpoint.revision,
          receivedAt: endpoint.at,
          selected: true,
        },
      ],
      reason,
      readings: units.map((unit) => ({ kind: "gap" as const, unit, reason })),
    });
  }
  return {
    path,
    selectedRevision: endpoint.revision,
    availability,
    entries,
    references: scopeHistoryReferencesOf(
      entries,
      endpoint.revision,
      expected,
      order,
    ),
  };
}
