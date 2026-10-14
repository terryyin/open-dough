import { isFullGitRevision } from "./ci-revisions.mjs";

export function normalizeCommandAttempts(attempts, branch) {
  return latestTimedAttempts(
    attempts.map((attempt) => normalizeAttempt(attempt, branch)),
  );
}

// Comparable timestamps identify superseded attempts without interpreting
// provider identities. Missing timestamps keep that revision's existing
// selection semantics; equal timestamps do not invent an ordering either.
function latestTimedAttempts(runs) {
  const latest = new Map();
  for (const run of runs) {
    const sha = run.headSha.toLowerCase();
    latest.set(
      sha,
      Math.max(latest.get(sha) ?? -Infinity, Date.parse(run.createdAt)),
    );
  }
  return runs.filter((run) => {
    const time = latest.get(run.headSha.toLowerCase());
    return !Number.isFinite(time) || Date.parse(run.createdAt) === time;
  });
}

function normalizeAttempt(attempt, branch) {
  if (
    !attempt ||
    !["string", "number"].includes(typeof attempt.runId) ||
    !["string", "number"].includes(typeof attempt.attemptId) ||
    !isFullGitRevision(attempt.sha) ||
    !["pending", "success", "failure", "incomplete"].includes(attempt.outcome)
  )
    throw new Error("CI adapter returned an invalid attempt");

  const completed = attempt.outcome !== "pending";
  return {
    databaseId: attempt.runId,
    attempt: attempt.attemptId,
    headSha: attempt.sha,
    headBranch: branch,
    status: completed ? "completed" : "in_progress",
    conclusion:
      attempt.outcome === "incomplete"
        ? "cancelled"
        : completed
          ? attempt.outcome
          : null,
    ...(attempt.url === undefined ? {} : { url: attempt.url }),
    ...(attempt.time === undefined ? {} : { createdAt: attempt.time }),
  };
}
