// The measured builds of this machine's landed CI history
// (`./landedCiHistoryStore.ts`) and the window they set: which kept builds
// are points of CI wall time, as background collection counts them toward
// its window (`./landedCiCollection.ts`), the history keeps to it, and
// Intent's CI status reads them as points (`./landedCiHistoryEntries.ts`). A
// measured build is a passed build that measures a landing -- its landed
// revision's own, a confirmed skip's equivalent, or the later trunk build a
// cancelled landing joins -- with a start and a later completion; its CI wall
// time is the CI timing comparison's, never a zero (`historyWallTimeMs`).
// The window is the landings, newest first, up to the one that brings the
// 20th distinct measured build, with every older landing one of those builds
// also measures.

import { historyWallTimeMs, type Provenance } from "../src/landedCiHistory.ts";
import type { StoryCiBuildSelection } from "../src/storyCiComparison.ts";
import type { ProjectHistory } from "./landedCiHistoryStore.ts";
import type { Observation } from "./landedCiObservation.ts";

// How many distinct measured builds the window holds.
export const measuredWindow = 20;

// Landings newest first: by when the dashboard recorded them, then by
// receipt, so every reader walks them in the same order.
export function newestFirst(
  a: { readonly receipt: string; readonly receivedAt: string },
  b: { readonly receipt: string; readonly receivedAt: string },
): number {
  return (
    Date.parse(b.receivedAt) - Date.parse(a.receivedAt) ||
    a.receipt.localeCompare(b.receipt)
  );
}

// How a build the Landed rule selected for a landing measures it; none for
// an ancestor, which Story Branch Landed never selects.
export function provenanceOf(
  selection: StoryCiBuildSelection,
): Provenance | undefined {
  return selection === "ancestor" ? undefined : selection;
}

// The key of the build a landing's observation measures as a point of CI wall
// time: a passed build selected for it, with a start and a later completion.
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

// A landing the history keeps, with its receipt.
type ReceivedLanding = {
  readonly receipt: string;
} & ProjectHistory["landings"][string];

// The history's window, newest first: its landings up to the one that brings
// the `measuredWindow`th distinct measured build, and every older landing one
// of those builds also measures.
export function windowLandings(history: ProjectHistory): ReceivedLanding[] {
  const newest = Object.entries(history.landings)
    .map(([receipt, landing]) => ({ receipt, ...landing }))
    .sort(newestFirst);
  const window: ReceivedLanding[] = [];
  const measured = new Set<string>();
  for (const landing of newest) {
    const build = measuredBuildOf(history, landing.observed);
    if (measured.size < measuredWindow) {
      window.push(landing);
      if (build !== undefined) measured.add(build);
    } else if (build !== undefined && measured.has(build)) window.push(landing);
  }
  return window;
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
  return { landings, builds };
}
