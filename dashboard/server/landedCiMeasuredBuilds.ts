// The measured builds of this machine's landed CI history
// (`./landedCiHistoryStore.ts`) and the window they set: which kept builds
// are points of CI wall time, as background collection counts them toward
// its window (`./landedCiCollection.ts`), the history keeps to it, and
// Intent's CI status reads them as points (`./landedCiHistoryEntries.ts`). A
// measured build is a passed build that measures a landing -- its landed
// revision's own, a confirmed skip's equivalent, or the later trunk build a
// cancelled landing joins -- with valid start/completion bounds; equal bounds
// measure zero and reversed bounds are invalid (`historyWallTimeMs`).
// The window is the landings, newest first, up to the one that brings the
// 20th distinct measured build, with every older landing one of those builds
// also measures.

import { historyWallTimeMs, type Provenance } from "../src/landedCiHistory.ts";
import type { StoryCiBuildSelection } from "../src/storyCiComparison.ts";
import type { ProjectHistory } from "./landedCiHistoryStore.ts";
import type { Observation } from "./landedCiObservation.ts";

// How many distinct measured builds the window holds.
export const measuredWindow = 20;

// Unknown positions are visited first to record their local-order wait;
// known positions follow actual trunk ancestry, never receipt chronology.
export function newestFirst(order: readonly string[] | undefined) {
  const positions = new Map(order?.map((revision, index) => [revision, index]));
  return (
    a: { readonly receipt: string; readonly revision: string },
    b: { readonly receipt: string; readonly revision: string },
  ): number => {
    const left = positions.get(a.revision),
      right = positions.get(b.revision);
    if (left === undefined || right === undefined)
      return left === undefined && right !== undefined
        ? -1
        : right === undefined && left !== undefined
          ? 1
          : a.receipt.localeCompare(b.receipt);
    return right - left || a.receipt.localeCompare(b.receipt);
  };
}

// Prefer the supported order covering the most recorded landings. Caller
// order breaks ties; an endpoint filters candidates only for scoped reading.
export function mostCompleteLandingOrder(
  landings: readonly { readonly revision: string }[],
  candidates: readonly (readonly string[] | undefined)[],
  endpoint?: string,
): readonly string[] | undefined {
  return candidates
    .filter(
      (order): order is readonly string[] =>
        order !== undefined &&
        (endpoint === undefined || order.includes(endpoint)),
    )
    .sort(
      (a, b) =>
        landings.filter((landing) => b.includes(landing.revision)).length -
        landings.filter((landing) => a.includes(landing.revision)).length,
    )[0];
}

// How a build the Landed rule selected for a landing measures it; none for
// an ancestor, which Story Branch Landed never selects.
export function provenanceOf(
  selection: StoryCiBuildSelection,
): Provenance | undefined {
  return selection === "ancestor" ? undefined : selection;
}

// The key of the build a landing's observation measures as a point of CI wall
// time: a passed build selected for it, with valid start/completion bounds.
// Undefined for every other observation.
export function measuredBuildOf(
  history: ProjectHistory,
  observed: Observation,
): string | undefined {
  if (
    observed.kind !== "build" ||
    provenanceOf(observed.selection) === undefined
  )
    return undefined;
  const build = history.builds[observed.build];
  if (
    build?.state !== "pass" ||
    historyWallTimeMs(build.startedAt, build.completedAt) === undefined
  )
    return undefined;
  return observed.build;
}

// A new measurement needs a position relative to every already-retained
// measurement before the shared window can evict any of them safely.
export function hasLandingOrder(
  history: ProjectHistory,
  revision: string,
  order: readonly string[] | undefined = history.trunkOrder,
): boolean {
  const positions = new Set(order);
  return (
    positions.has(revision) &&
    Object.values(history.landings).every(
      (landing) =>
        measuredBuildOf(history, landing.observed) === undefined ||
        positions.has(landing.revision),
    )
  );
}

// A landing the history keeps, with its receipt.
type ReceivedLanding = {
  readonly receipt: string;
} & ProjectHistory["landings"][string];

// The history's window, newest first: its landings up to the one that brings
// the `measuredWindow`th distinct measured build, and every older landing one
// of those builds also measures.
export function windowLandings(history: ProjectHistory): ReceivedLanding[] {
  const all = Object.entries(history.landings).map(([receipt, landing]) => ({
    receipt,
    ...landing,
  }));
  const positioned = new Set(history.trunkOrder);
  const newest = all
    .filter((landing) => positioned.has(landing.revision))
    .sort(newestFirst(history.trunkOrder));
  const window: ReceivedLanding[] = [];
  const measured = new Set<string>();
  for (const landing of newest) {
    const build = measuredBuildOf(history, landing.observed);
    if (measured.size < measuredWindow) {
      window.push(landing);
      if (build !== undefined) measured.add(build);
    } else if (build !== undefined && measured.has(build)) window.push(landing);
  }
  // Existing unsupported evidence is preserved; it does not choose window
  // membership and readers explain its unavailable order without a number.
  return [
    ...window,
    ...all.filter((landing) => !positioned.has(landing.revision)),
  ];
}

// The history kept to its window: its window's landings and the builds they
// name.
export function windowedHistory(history: ProjectHistory): ProjectHistory {
  const window = new Set(windowLandings(history).map(({ receipt }) => receipt));
  const landings = Object.fromEntries(
    Object.entries(history.landings).filter(([receipt]) => window.has(receipt)),
  );
  const named = new Set(
    Object.values(landings).flatMap(({ observed }) =>
      observed.kind === "build" ? [observed.build] : [],
    ),
  );
  const builds = Object.fromEntries(
    Object.entries(history.builds).filter(([key]) => named.has(key)),
  );
  const revisions = new Set(
    Object.values(landings).map((landing) => landing.revision),
  );
  return {
    landings,
    builds,
    ...(history.trunkOrder === undefined
      ? {}
      : {
          trunkOrder: history.trunkOrder.filter((revision) =>
            revisions.has(revision),
          ),
        }),
  };
}
