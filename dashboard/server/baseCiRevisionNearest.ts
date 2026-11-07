// Nearest CI build along a revision's first-parent ancestors: newest run per
// revision, then its newest completed timed attempt (cancelled latest falls
// back). Used by story CI comparison endpoint lookup
// (`./baseCiRevisionLookup.ts`). Live branch judgment keeps `./baseCiNearest.ts`.
import {
  attemptTimesOf,
  type BaseCiRunIdentity as RunIdentity,
  type BaseCiState,
} from "../src/baseCiConfirmation.ts";
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
// and timed_out do not.
function isTimedConclusion(
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
    if (newest.status === "completed" && isTimedConclusion(newest.conclusion))
      return newest;
  }
  // Cancelled / timed_out / unjudged latest: prefer the newest completed
  // timed attempt of the same run from the listing or earlier attempts.
  const sameRun = [...runs, ...earlierAttempts].filter(
    (run) =>
      run.headSha === sha &&
      run.databaseId === newest.databaseId &&
      run.status === "completed" &&
      isTimedConclusion(run.conclusion),
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
// many later revisions before the target lacked a completed timed attempt.
export type RevisionCiBuild = {
  readonly revision: string;
  readonly subject: string;
  readonly state: "pass" | "failed" | "running";
  readonly selection: "exact" | "ancestor" | "equivalent";
  readonly laterWithoutResult: number;
  readonly runUrl?: string;
  readonly runBranch?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
} & RunIdentity;

export type RevisionCiLookup = {
  // Runs listed for one head_sha (workflow runs?head_sha=).
  readonly listRunsAt: (sha: string) => Promise<readonly ListedRun[]>;
  // Optional earlier attempts of a run when its latest is cancelled.
  readonly earlierAttemptsOf?: (
    runId: number,
    latestAttempt: number,
  ) => Promise<readonly ListedRun[]>;
  // Subject line of a revision; "(no subject)" when unknown.
  readonly subjectOf: (sha: string) => Promise<string>;
};

// Walk `revisions` (newest / target first) and return the first revision that
// yields a judged attempt. `boundExclusive` when set skips that revision and
// older ones (story-start exclusive for result endpoints). Baseline walks
// omit the bound so the story-start revision itself may supply the build.
export async function nearestRevisionBuild(
  revisions: readonly string[],
  lookup: RevisionCiLookup,
  boundExclusive?: string,
): Promise<RevisionCiBuild | undefined> {
  let skipped = 0;
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
      !isTimedConclusion(newest.conclusion) &&
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
      !(run.status === "completed" && isTimedConclusion(run.conclusion))
    ) {
      skipped += 1;
      continue;
    }
    return {
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
      ...attemptTimesOf(run),
    };
  }
  return undefined;
}
