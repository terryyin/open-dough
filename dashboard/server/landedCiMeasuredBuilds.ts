// The measured builds of this machine's landed CI history
// (`./landedCiHistoryStore.ts`): which kept builds are points of CI wall
// time, as background collection counts them toward its window
// (`./landedCiCollection.ts`) and Intent's CI status reads them as points
// (`./landedCiHistoryEntries.ts`). A measured build is the landed revision's
// own passed build with both its start and its completion; its CI wall time
// is the CI timing comparison's (`../src/ciProofTimeWords.ts`).

import { wallTimeMs } from "../src/ciProofTimeWords.ts";
import {
  landedCiPointSchema,
  type LandedCiPoint,
} from "../src/landedCiHistory.ts";
import type { Observation, ProjectHistory } from "./landedCiHistoryStore.ts";

// The key of the build a landing's observation measures as a point of CI wall
// time: the landed revision's own passed build, with both its start and its
// completion. Undefined for every other observation.
export function measuredBuildOf(
  history: ProjectHistory,
  observed: Observation,
): string | undefined {
  if (observed.kind !== "build" || observed.selection !== "exact")
    return undefined;
  const build = history.builds[observed.build];
  if (
    build?.state !== "pass" ||
    wallTimeMs(build.startedAt, build.completedAt) === undefined
  )
    return undefined;
  return observed.build;
}

// The project's measured builds as the page's points, each once however many
// landings it measures, in no particular order (the history orders its
// entries, `./landedCiHistoryEntries.ts`); one whose CI read named its times
// or link in a form the page does not take is left out.
export function measuredPoints(history: ProjectHistory): LandedCiPoint[] {
  const points = new Map<string, LandedCiPoint>();
  for (const { observed } of Object.values(history.landings)) {
    const key = measuredBuildOf(history, observed);
    const build = key === undefined ? undefined : history.builds[key];
    if (key === undefined || build === undefined || points.has(key)) continue;
    const runUrl = landedCiPointSchema.shape.runUrl.safeParse(build.runUrl);
    const point = landedCiPointSchema.safeParse({
      kind: "point",
      revision: build.revision,
      provenance: "exact",
      ...(runUrl.success && runUrl.data !== undefined
        ? { runUrl: runUrl.data }
        : {}),
      ...(build.runId === undefined ? {} : { runId: build.runId }),
      ...(build.runAttempt === undefined
        ? {}
        : { runAttempt: build.runAttempt }),
      ...(build.adapterAttempt === undefined
        ? {}
        : { adapterAttempt: build.adapterAttempt }),
      startedAt: build.startedAt,
      completedAt: build.completedAt,
    });
    if (point.success) points.set(key, point.data);
  }
  return [...points.values()];
}
