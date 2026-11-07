// Nearest CI build along a revision's first-parent ancestors, using each
// revision's comparison attempt (`./baseCiRevisionAttempt.ts`). Walking
// endpoints may also require usable proof and continue past builds that lack
// it. Used by story CI comparison endpoint lookup
// (`./baseCiRevisionLookup.ts`). Live branch judgment keeps `./baseCiNearest.ts`.
import {
  attemptTimesOf,
  type BaseCiRunIdentity as RunIdentity,
} from "../src/baseCiConfirmation.ts";
import type { CiProofRun } from "../src/ciProof.ts";
import type {
  CiTimeWithoutRunnerWaits,
  StoryCiBuildSelection,
} from "../src/storyCiComparison.ts";
import {
  isBuildConclusion,
  isPositive,
  judgeAttempt,
  selectRevisionAttempt,
} from "./baseCiRevisionAttempt.ts";
import { newestRunFor, type ListedRun } from "./baseCiNearest.ts";

function runBranchOf(run: ListedRun): { runBranch?: string } {
  return typeof run.branch === "string" && run.branch !== ""
    ? { runBranch: run.branch }
    : {};
}

function runIdentityOf(run: ListedRun): RunIdentity {
  if (run.adapterAttempt !== undefined)
    return { adapterAttempt: run.adapterAttempt };
  return isPositive(run.databaseId) && isPositive(run.attempt)
    ? { runId: run.databaseId, runAttempt: run.attempt }
    : {};
}

// One revision's CI comparison build with how it was selected
// (`StoryCiBuildSelection`). For an ancestor, `laterWithoutResult` counts the
// later revisions before the target the walk passed over (no timed attempt,
// or — when a proof gate is set — a timed build whose proof was not usable).
export type RevisionCiBuild = {
  readonly revision: string;
  readonly subject: string;
  readonly state: "pass" | "failed" | "running";
  readonly selection: StoryCiBuildSelection;
  readonly laterWithoutResult: number;
  readonly laterRunning?: true;
  readonly runUrl?: string;
  readonly runBranch?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
} & RunIdentity;

// Run identity for a timed GitHub Actions comparison build, when the listing
// supplied a positive run id and attempt.
export function proofRunOf(build: RevisionCiBuild): CiProofRun | undefined {
  return build.runId !== undefined && build.runAttempt !== undefined
    ? {
        runId: build.runId,
        runAttempt: build.runAttempt,
        revision: build.revision,
      }
    : undefined;
}

export type RevisionCiLookup = {
  // Runs listed for one head_sha (workflow runs?head_sha=).
  readonly listRunsAt: (sha: string) => Promise<readonly ListedRun[]>;
  // A provisional adapter result can show its completed ancestor while
  // a newer attempt is running.
  readonly preferCompletedAncestor?: true;
  // Optional earlier attempts of a run when its latest is cancelled.
  readonly earlierAttemptsOf?: (
    runId: number,
    latestAttempt: number,
  ) => Promise<readonly ListedRun[]>;
  // Timing for a selected completed attempt, read only after selection.
  readonly timeWithoutRunnerWaitsOf: (
    build: RevisionCiBuild,
  ) => Promise<CiTimeWithoutRunnerWaits>;
  // Subject line of a revision; "(no subject)" when unknown.
  readonly subjectOf: (sha: string) => Promise<string>;
};

// Optional gate: Baseline / Branch (and Trunk Mode Landed / provisional tip)
// continue past a timed build whose proof is not usable. When every timed
// build in the bound fails the gate, the walk returns the nearest timed
// build so the endpoint can still name it. Omit the gate for Landed's
// equivalent-build search and for skip-confirmation basis walks.
export type RevisionProofUsable = (build: RevisionCiBuild) => Promise<boolean>;

export type NearestRevisionBuildOptions = {
  readonly preferCompletedAncestor?: boolean;
  readonly proofUsable?: RevisionProofUsable;
};

// Walk `revisions` (newest / target first) and return the first revision that
// yields a judged attempt. `boundExclusive` when set skips that revision and
// older ones (story-start exclusive for result endpoints). Baseline walks
// omit the bound so the story-start revision itself may supply the build.
// A running attempt stops the walk without a proof check unless
// `preferCompletedAncestor` continues past it.
export async function nearestRevisionBuild(
  revisions: readonly string[],
  lookup: RevisionCiLookup,
  boundExclusive?: string,
  options?: NearestRevisionBuildOptions,
): Promise<RevisionCiBuild | undefined> {
  const preferCompletedAncestor = options?.preferCompletedAncestor === true;
  const proofUsable = options?.proofUsable;
  let skipped = 0;
  let running: RevisionCiBuild | undefined;
  let nearestWithoutUsableProof: RevisionCiBuild | undefined;
  for (const sha of revisions) {
    if (boundExclusive !== undefined && sha === boundExclusive) break;
    const listed = await lookup.listRunsAt(sha);
    const newest = newestRunFor(listed, sha);
    let earlier: readonly ListedRun[] = [];
    if (
      newest !== undefined &&
      isPositive(newest.databaseId) &&
      isPositive(newest.attempt) &&
      newest.status === "completed" &&
      !isBuildConclusion(newest.conclusion) &&
      lookup.earlierAttemptsOf !== undefined
    ) {
      earlier = await lookup.earlierAttemptsOf(
        newest.databaseId,
        newest.attempt,
      );
    }
    const run = selectRevisionAttempt(listed, sha, earlier);
    if (run === undefined) {
      skipped += 1;
      continue;
    }
    const state = judgeAttempt(run.status, run.conclusion);
    if (state === undefined) {
      skipped += 1;
      continue;
    }
    if (state !== "running" && state !== "pass" && state !== "failed") {
      skipped += 1;
      continue;
    }
    if (
      state !== "running" &&
      !(run.status === "completed" && isBuildConclusion(run.conclusion))
    ) {
      skipped += 1;
      continue;
    }
    if (state === "running" && running !== undefined) {
      skipped += 1;
      continue;
    }
    const build: RevisionCiBuild = {
      revision: sha,
      subject: await lookup.subjectOf(sha),
      state:
        state === "pass" ? "pass" : state === "failed" ? "failed" : "running",
      selection: skipped === 0 ? "exact" : "ancestor",
      laterWithoutResult: skipped,
      ...(typeof run.url === "string" && run.url !== ""
        ? { runUrl: run.url }
        : {}),
      ...runBranchOf(run),
      ...runIdentityOf(run),
      ...attemptTimesOf({
        ...run,
        startedAt:
          run.attempt === 1 ? (run.createdAt ?? run.startedAt) : run.startedAt,
      }),
    };
    if (state === "running" && preferCompletedAncestor) {
      running = build;
      skipped += 1;
      continue;
    }
    if (build.state === "running") {
      return running === undefined ? build : { ...build, laterRunning: true };
    }
    if (proofUsable !== undefined) {
      if (await proofUsable(build)) {
        return running === undefined ? build : { ...build, laterRunning: true };
      }
      nearestWithoutUsableProof ??= build;
      skipped += 1;
      continue;
    }
    return running === undefined ? build : { ...build, laterRunning: true };
  }
  if (nearestWithoutUsableProof !== undefined) {
    return running === undefined
      ? nearestWithoutUsableProof
      : { ...nearestWithoutUsableProof, laterRunning: true };
  }
  return running;
}
