// The build Story Branch Landed names for a landing it could not measure by
// that build (`unusableBuild` of a `none` slot, `./revisionBuildSlot.ts`):
// the build whose CI proof could not be used -- a confirmed skip's
// equivalent build (`./exactSkippedEquivalent.ts`) or a cancelled landing's
// nearest later trunk build (`./laterTrunkBuild.ts`) -- told with why and
// whether GitHub left its proof read unanswered; or else the landing's own
// attempt that stopped without a verdict.
import type { CiProofUnavailable } from "../src/ciProof.ts";
import type { StoryCiBuildSelection } from "../src/storyCiComparison.ts";
import type { ListedRun } from "./baseCiNearest.ts";
import { runLinkOf, type RevisionCiBuild } from "./baseCiRevisionNearest.ts";
import { isUnansweredProof } from "./ciProofArtifact.ts";

// A build Story Branch Landed named for a landing without measuring the
// landing by it, as its CI read named it: its revision, how it would have
// stood for the landing, its run attempt and link, and, for a build that
// completed, when it started and completed.
export type UnusableBuild = Pick<
  RevisionCiBuild,
  | "revision"
  | "runUrl"
  | "runId"
  | "runAttempt"
  | "adapterAttempt"
  | "startedAt"
  | "completedAt"
> & { readonly selection: StoryCiBuildSelection };

// `build` named as it would have stood for the landing (`selection`).
function unusableBuildOf(
  build: RevisionCiBuild,
  selection: StoryCiBuildSelection,
): UnusableBuild {
  const { revision, runUrl, runId, runAttempt, adapterAttempt } = build;
  const { startedAt, completedAt } = build;
  return {
    revision,
    selection,
    ...(runUrl === undefined ? {} : { runUrl }),
    ...(runId === undefined ? {} : { runId }),
    ...(runAttempt === undefined ? {} : { runAttempt }),
    ...(adapterAttempt === undefined ? {} : { adapterAttempt }),
    ...(startedAt === undefined ? {} : { startedAt }),
    ...(completedAt === undefined ? {} : { completedAt }),
  };
}

// What a slot tells of `build`, which would have stood for the landing as
// `selection`, when its CI proof could not be used (`absence`): why, whether
// GitHub left its read unanswered (`isUnansweredProof`), so a later read may
// still use it, and the build.
export function unusableProofOf(
  build: RevisionCiBuild,
  selection: StoryCiBuildSelection,
  absence: CiProofUnavailable,
) {
  return {
    unusableProof: absence.reason,
    ...(isUnansweredProof(absence) ? { proofUnanswered: true as const } : {}),
    unusableBuild: unusableBuildOf(build, selection),
  };
}

// A landing's own attempt at its landed revision that stopped without a
// verdict -- cancelled, timed out, or a CI adapter's that stopped -- named as
// its exact build.
export function landedRunOf(revision: string, run: ListedRun): UnusableBuild {
  return { revision, selection: "exact", ...runLinkOf(run) };
}
