// Acquire CI time without runner waits for one retained measured attempt
// through the same lookup the CI timing comparison uses.
import type { CiTimeWithoutRunnerWaits } from "../src/storyCiComparison.ts";
import type { RevisionCiBuild } from "./baseCiRevisionNearest.ts";
import type { KeptBuild } from "./landedCiObservation.ts";
import type { landingResolution } from "./landedCiResolution.ts";

export function needsCollectedMeasure(build: KeptBuild): boolean {
  return build.state === "pass" && build.timeWithoutRunnerWaits === undefined;
}

function measureSubjectOf(build: KeptBuild | RevisionCiBuild): RevisionCiBuild {
  const state = build.state === "running" ? "pass" : build.state;
  const subject =
    "subject" in build ? build.subject : ("Retained CI attempt" as const);
  const selection = "selection" in build ? build.selection : ("exact" as const);
  const laterWithoutResult =
    "laterWithoutResult" in build ? build.laterWithoutResult : 0;
  return {
    subject,
    selection,
    laterWithoutResult,
    revision: build.revision,
    state,
    ...(build.runId === undefined ? {} : { runId: build.runId }),
    ...(build.runAttempt === undefined ? {} : { runAttempt: build.runAttempt }),
    ...(build.adapterAttempt === undefined
      ? {}
      : { adapterAttempt: build.adapterAttempt }),
    ...(build.runBranch === undefined ? {} : { runBranch: build.runBranch }),
  };
}

export async function collectedMeasureOf(
  build: KeptBuild | RevisionCiBuild,
  read: Parameters<typeof landingResolution>[2],
): Promise<CiTimeWithoutRunnerWaits | undefined> {
  try {
    const evidence = await read();
    if (evidence.kind !== "read") return undefined;
    return await evidence.builds.lookup.timeWithoutRunnerWaitsOf(
      measureSubjectOf(build),
    );
  } catch {
    return undefined;
  }
}
