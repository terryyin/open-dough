// Nearest CI build along a revision's first-parent ancestors: newest run per
// revision, then its newest completed timed attempt (cancelled latest falls
// back). Walking endpoints may also require usable proof and continue past
// builds that lack it. Used by story CI comparison endpoint lookup
// (`./baseCiRevisionLookup.ts`). Live branch judgment keeps `./baseCiNearest.ts`.
import {
  attemptTimesOf,
  type BaseCiRunIdentity as RunIdentity,
  type BaseCiState,
} from "../src/baseCiConfirmation.ts";
import type { CiProofRun } from "../src/ciProof.ts";
import type { CiTimeWithoutRunnerWaits } from "../src/storyCiComparison.ts";
import { newestRunFor, type ListedRun } from "./baseCiNearest.ts";

const isPositive = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) >= 1;

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

function completedStateOf(
  conclusion: ListedRun["conclusion"],
): "pass" | "failed" {
  return conclusion === "success" ? "pass" : "failed";
}

function judgeAttempt(
  status: string | undefined,
  conclusion: string | null | undefined,
): "pass" | BaseCiState | undefined {
  if (
    status === "queued" ||
    status === "in_progress" ||
    status === "pending" ||
    status === "waiting" ||
    status === "requested"
  )
    return "running";
  if (status !== "completed") return undefined;
  return completedStateOf(conclusion);
}

// Whether a completed conclusion yields timing (passed or failed); cancelled
// and timed_out do not. Exported for adapter revision lookup.
export function isBuildConclusion(
  conclusion: ListedRun["conclusion"],
): conclusion is "success" | "failure" {
  return conclusion === "success" || conclusion === "failure";
}

// The attempt a revision's comparison uses: newest run, then its newest
// completed attempt that passed or failed. A cancelled newest attempt falls
// back to an earlier completed attempt of that run when the listing or
// `earlierAttempts` supply one. Running attempts yield no timing.
export function selectRevisionAttempt(
  runs: readonly ListedRun[],
  sha: string,
  earlierAttempts: readonly ListedRun[] = [],
): ListedRun | undefined {
  const newest = newestRunFor(runs, sha);
  if (newest === undefined) return undefined;
  const state = judgeAttempt(newest.status, newest.conclusion);
  if (state === "running") return newest;
  if (state === "pass" || state === "failed") {
    if (newest.status === "completed" && isBuildConclusion(newest.conclusion))
      return newest;
  }
  // Cancelled / timed_out / unjudged latest: prefer the newest completed
  // timed attempt of the same run from the listing or earlier attempts.
  const sameRun = [...runs, ...earlierAttempts].filter(
    (run) =>
      run.headSha === sha &&
      run.databaseId === newest.databaseId &&
      run.status === "completed" &&
      isBuildConclusion(run.conclusion),
  );
  if (sameRun.length === 0) return newest;
  let chosen: ListedRun | undefined;
  let chosenAttempt = Number.NEGATIVE_INFINITY;
  for (const run of sameRun) {
    const attempt = isPositive(run.attempt) ? run.attempt : 0;
    if (chosen === undefined || attempt >= chosenAttempt) {
      chosen = run;
      chosenAttempt = attempt;
    }
  }
  return chosen;
}

// One revision's CI comparison build: exact or measured ancestor, with how
// many later revisions before the target the walk passed over (no timed
// attempt, or — when a proof gate is set — a timed build whose proof was
// not usable).
export type RevisionCiBuild = {
  readonly revision: string;
  readonly subject: string;
  readonly state: "pass" | "failed" | "running";
  readonly selection: "exact" | "ancestor" | "equivalent";
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
