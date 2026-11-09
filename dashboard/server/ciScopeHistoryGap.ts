// A retained unresolved or final landing remains a gap, with the build or
// attempt the shared Landed resolver named, without inventing scoped timing.
import type { DeclaredUnit } from "../src/ciProofUnits.ts";
import type { ScopeHistoryEntry } from "../src/ciScopeHistory.ts";
import type { ProjectHistory } from "./landedCiHistoryStore.ts";
import { historyBuildOf, runOf } from "./landedCiHistoryEntries.ts";

type KeptLanding = ProjectHistory["landings"][string];

function gapReason(landing: KeptLanding): string {
  const observed = landing.observed;
  if (observed.kind === "pending" && observed.waitsFor === "order")
    return "Recorded landing order unavailable from local evidence";
  if ("explanation" in observed) return observed.explanation;
  if ("waitsFor" in observed) return `Pending CI ${observed.waitsFor}`;
  return "CI build is pending collection";
}

export function scopeHistoryGapOf(
  landing: KeptLanding,
  represented: ScopeHistoryEntry["landings"][number],
  units: readonly DeclaredUnit[],
): Extract<ScopeHistoryEntry, { kind: "gap" }> {
  const observed = landing.observed;
  const build = observed.kind === "gap" ? observed.build : undefined;
  const run =
    observed.kind === "pending" && observed.run !== undefined
      ? runOf(observed.run)
      : undefined;
  const reason = gapReason(landing);
  return {
    kind: "gap",
    key: `landing/${landing.revision}/${landing.receivedAt}`,
    date: landing.receivedAt,
    landings: [
      {
        ...represented,
        ...(build === undefined ? {} : { provenance: build.provenance }),
      },
    ],
    selected: represented.selected,
    reason,
    readings: units.map((unit) => ({ kind: "gap", unit, reason })),
    ...(build === undefined
      ? {}
      : { build: historyBuildOf(build, build.provenance) }),
    ...(run === undefined ? {} : { run }),
  };
}
