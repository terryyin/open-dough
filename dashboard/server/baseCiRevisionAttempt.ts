// The CI attempt a revision's comparison uses: newest run, then its newest
// completed timed attempt (a cancelled latest falls back to an earlier
// completed attempt of the same run). Walks live in
// `./baseCiRevisionNearest.ts`; adapter listings reuse the timed-conclusion
// rule (`./baseCiAdapterRevisionLookup.ts`).
import type { BaseCiState } from "../src/baseCiConfirmation.ts";
import { newestRunFor, type ListedRun } from "./baseCiNearest.ts";

export const isPositive = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) >= 1;

function completedStateOf(
  conclusion: ListedRun["conclusion"],
): "pass" | "failed" {
  return conclusion === "success" ? "pass" : "failed";
}

export function judgeAttempt(
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
