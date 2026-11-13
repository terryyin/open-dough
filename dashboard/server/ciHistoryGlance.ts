// The glance views' answer to a selected Done or scoped history read that
// names the glance capability (`../src/ciHistoryGlanceCapability.ts`): a
// projection of the same default answer, from the same retained history,
// Git-ordered cohort and reference, with no store or calculation of its own.
// It keeps the dated measurements, typed gaps and their reasons, segments,
// the selected endpoint and provenance, and the reference's compact figures;
// it leaves out the per-build membership, median and dates behind those
// figures, and the run links and landing metadata only the former lists read.
// The project read and the follow-up ledger keep their full references.
import {
  isThroughEndpoint,
  type PriorBuildFigures,
  type PriorBuildReference,
} from "../src/ciPriorBuildReference.ts";
import type { DoneWallTimeGlance } from "../src/ciDoneWallTimeHistory.ts";
import {
  failedBuildReason,
  type CiScopeHistory,
  type ScopeGlanceEntry,
  type ScopeHistoryGlance,
} from "../src/ciScopeHistory.ts";
import type { BaseCiRunIdentity } from "../src/baseCiConfirmation.ts";
import { evidenceOfEntry } from "../src/landedCiBuildKey.ts";
import type { LandedCiEntry } from "../src/landedCiHistory.ts";

function priorBuildFiguresOf(
  reference: PriorBuildReference,
): PriorBuildFigures {
  const { endpoint, selected, sampleCount, averageMs, difference } = reference;
  return {
    endpoint,
    ...(selected === undefined ? {} : { selected }),
    sampleCount,
    ...(averageMs === undefined ? {} : { averageMs }),
    ...(difference === undefined ? {} : { difference }),
  };
}

// The attempt identity that keys a build, without its run link.
const attemptOf = ({
  runId,
  runAttempt,
  adapterAttempt,
}: BaseCiRunIdentity) => ({
  ...(runId === undefined ? {} : { runId }),
  ...(runAttempt === undefined ? {} : { runAttempt }),
  ...(adapterAttempt === undefined ? {} : { adapterAttempt }),
});

// An entry as the Done chart reads it: a point keyed by its attempt with the
// landings it names, a pending landing without the attempt it waits on, and a
// final gap with the build that stands for it.
function doneEntryOf(entry: LandedCiEntry): LandedCiEntry {
  if (entry.kind === "point") {
    const { revision, startedAt, completedAt, landings } = entry;
    return {
      kind: "point",
      revision,
      ...attemptOf(entry),
      startedAt,
      completedAt,
      landings,
    };
  }
  if (entry.reason === "pending") {
    const { reason, waitsFor, revision, receivedAt, identity } = entry;
    return {
      kind: "gap",
      reason,
      waitsFor,
      revision,
      receivedAt,
      ...(identity === undefined ? {} : { identity }),
    };
  }
  const { build } = entry;
  return {
    ...entry,
    ...(build === undefined
      ? {}
      : {
          build: {
            revision: build.revision,
            provenance: build.provenance,
            ...attemptOf(build),
          },
        }),
  };
}

// The Done glance: only the observations verified through the endpoint, as
// its reference established them, so the browser needs no membership to
// leave newer landings out of the chart.
export function doneWallTimeGlanceOf(done: {
  readonly selectedRevision: string;
  readonly availability: DoneWallTimeGlance["availability"];
  readonly entries: readonly LandedCiEntry[];
  readonly reference: PriorBuildReference;
}): DoneWallTimeGlance {
  const { reference } = done;
  return {
    selectedRevision: done.selectedRevision,
    availability: done.availability,
    entries: done.entries
      .filter((entry) => {
        const sample = evidenceOfEntry(entry, reference.evidence);
        return sample !== undefined && isThroughEndpoint(sample);
      })
      .map(doneEntryOf),
    reference: priorBuildFiguresOf(reference),
  };
}

// A timing reason with its typed status.
const gapOf = (reason: string) => ({
  status:
    reason === failedBuildReason
      ? ("failed" as const)
      : ("unavailable" as const),
  reason,
});

function scopeEntryOf(
  entry: CiScopeHistory["entries"][number],
): ScopeGlanceEntry {
  const common = {
    key: entry.key,
    date: entry.date,
    selected: entry.selected,
    landings: entry.landings.map((landing) => {
      const provenance = landing.provenance ?? entry.build?.provenance;
      return {
        selected: landing.selected,
        ...(provenance === undefined ? {} : { provenance }),
      };
    }),
  };
  const readings = entry.readings.map((reading) =>
    reading.kind === "point"
      ? {
          kind: "point" as const,
          unit: reading.unit,
          ms: reading.ms,
          segment: reading.segment,
        }
      : { kind: "gap" as const, unit: reading.unit, ...gapOf(reading.reason) },
  );
  if (entry.kind === "point") return { ...common, kind: "point", readings };
  return {
    ...common,
    kind: "gap",
    readings: readings.filter(
      (reading): reading is Extract<typeof reading, { kind: "gap" }> =>
        reading.kind === "gap",
    ),
    ...(entry.reason === undefined ? {} : { gap: gapOf(entry.reason) }),
  };
}

export function scopeHistoryGlanceOf(
  history: CiScopeHistory,
): ScopeHistoryGlance {
  const { path, selectedRevision, availability, entries, references } = history;
  return {
    path,
    selectedRevision,
    availability,
    entries: entries.map(scopeEntryOf),
    ...(references === undefined
      ? {}
      : {
          references: references.map(({ unit, reason, reference }) => ({
            unit,
            ...(reason === undefined ? {} : { reason }),
            reference: priorBuildFiguresOf(reference),
          })),
        }),
  };
}
