// A retained unresolved or final landing remains a gap, with the build or
// attempt the shared Landed resolver named, without inventing scoped timing.
import { gapReasonWords } from "../src/ciHistoryGapWords.ts";
import type { DeclaredUnit } from "../src/ciProofUnits.ts";
import type { ScopeHistoryEntry } from "../src/ciScopeHistory.ts";
import type { ProjectHistory } from "./landedCiHistoryStore.ts";
import { historyBuildOf, runOf } from "./landedCiHistoryEntries.ts";

type KeptLanding = ProjectHistory["landings"][string];
type Unmeasured = Exclude<KeptLanding["observed"], { kind: "build" }>;

// Why no build measures the landing, in the Done wall-time history's words
// ("Pending · CI queued or running", "Cancelled").
const gapReason = (observed: Unmeasured) =>
  gapReasonWords(
    observed.kind === "pending"
      ? { reason: "pending", waitsFor: observed.waitsFor }
      : observed,
  );

export function scopeHistoryGapOf(
  landing: KeptLanding & { readonly observed: Unmeasured },
  represented: ScopeHistoryEntry["landings"][number],
  units: readonly DeclaredUnit[],
): Extract<ScopeHistoryEntry, { kind: "gap" }> {
  const observed = landing.observed;
  const build = observed.kind === "gap" ? observed.build : undefined;
  const run =
    observed.kind === "pending" && observed.run !== undefined
      ? runOf(observed.run)
      : undefined;
  const reason = gapReason(observed);
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
