// This machine's landed CI history (`./landedCiHistoryStore.ts`) as Intent's
// CI status reads it (`./intentCiHistoryRead.ts`): its window
// (`./landedCiMeasuredBuilds.ts`) as one list, oldest first, of each
// measured build once as a point naming every landing of the window it
// measures and how, and each other landing of the window as a gap with why:
// pending with what it waits for and the run attempt it waits on; failed, or
// naming no CI wall time, with the build that measures it; or the reason its
// final resolution was kept with and the build the Landed rule named for it.
// A point stands at its build's start, a gap at the time the dashboard
// recorded its landing. A run link that is not a web address is left out,
// keeping the run attempt it names.

import {
  runUrlSchema,
  type LandedCiEntry,
  type LandedCiGap,
  type LandedCiPoint,
  type MeasuredLanding,
  type Provenance,
} from "../src/landedCiHistory.ts";
import type { ProjectHistory } from "./landedCiHistoryStore.ts";
import {
  measuredBuildOf,
  provenanceOf,
  windowLandings,
} from "./landedCiMeasuredBuilds.ts";
import {
  keptRunOf,
  type KeptRun,
  type Observation,
} from "./landedCiObservation.ts";

// A run attempt as the history answers it: its identity, and its link only
// when that is a web address.
export function runOf(run: KeptRun) {
  const { runUrl, ...identity } = keptRunOf(run);
  return {
    ...(runUrlSchema.safeParse(runUrl).success ? { runUrl } : {}),
    ...identity,
  };
}

// A build as public history names it: its revision, how it stands for the
// landing, and its safely linked run attempt.
export const historyBuildOf = (
  build: KeptRun & { readonly revision: string },
  provenance: Provenance,
) => ({ revision: build.revision, provenance, ...runOf(build) });

type Landing = Pick<MeasuredLanding, "revision" | "receivedAt" | "identity">;

// The gap of a landing of the window no build measures.
function gapOf(
  history: ProjectHistory,
  landing: Landing,
  observed: Observation,
): LandedCiGap {
  if (observed.kind === "pending")
    return {
      kind: "gap",
      reason: "pending",
      waitsFor: observed.waitsFor,
      ...landing,
      ...(observed.run === undefined ? {} : runOf(observed.run)),
    };
  if (observed.kind === "gap") {
    const { reason, build } = observed;
    return {
      kind: "gap",
      reason,
      ...landing,
      ...(reason === "unclassified" || reason === "identity"
        ? { explanation: observed.explanation }
        : {}),
      ...(build === undefined
        ? {}
        : { build: historyBuildOf(build, build.provenance) }),
    };
  }
  const build = history.builds[observed.build];
  const provenance = provenanceOf(observed.selection);
  if (build === undefined || provenance === undefined)
    return { kind: "gap", reason: "no-build", ...landing };
  return {
    kind: "gap",
    reason: build.state === "failed" ? "failed" : "not-recorded",
    ...landing,
    build: historyBuildOf(build, provenance),
  };
}

// The history's window as its points and gaps, oldest first.
export function historyEntries(history: ProjectHistory): LandedCiEntry[] {
  const measuring = new Map<string, MeasuredLanding[]>();
  const gaps: LandedCiGap[] = [];
  // Oldest first, so a point names its landings oldest first.
  for (const kept of windowLandings(history).reverse()) {
    const { revision, receivedAt, identity, observed } = kept;
    const landing = {
      revision,
      receivedAt,
      ...(identity === undefined ? {} : { identity }),
    };
    const key = measuredBuildOf(history, observed);
    const provenance =
      observed.kind === "build" ? provenanceOf(observed.selection) : undefined;
    if (key !== undefined && !history.trunkOrder?.includes(revision)) {
      const build = history.builds[key];
      gaps.push({
        kind: "gap",
        reason: "pending",
        waitsFor: "order",
        ...landing,
        ...(build === undefined ? {} : runOf(build)),
      });
      continue;
    }
    if (key === undefined || provenance === undefined) {
      gaps.push(gapOf(history, landing, observed));
      continue;
    }
    const measured = measuring.get(key) ?? [];
    measured.push({ ...landing, provenance });
    measuring.set(key, measured);
  }
  const points: LandedCiPoint[] = [];
  for (const [key, landings] of measuring) {
    const build = history.builds[key];
    if (build?.startedAt === undefined || build.completedAt === undefined)
      continue;
    points.push({
      kind: "point",
      revision: build.revision,
      ...runOf(build),
      startedAt: build.startedAt,
      completedAt: build.completedAt,
      landings,
    });
  }
  const positions = new Map(
    history.trunkOrder?.map((revision, index) => [revision, index]),
  );
  const position = (entry: LandedCiEntry): number =>
    entry.kind === "point"
      ? Math.min(
          ...entry.landings.map(
            (landing) => positions.get(landing.revision) ?? Infinity,
          ),
        )
      : (positions.get(entry.revision) ?? Infinity);
  return [...points, ...gaps].sort((a, b) => position(a) - position(b));
}
