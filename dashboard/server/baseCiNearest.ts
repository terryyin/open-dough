// Nearest selected-check result along the origin target's commit listing:
// newest run per revision, then the first revision that yields a judged state.
import type { BaseCiState } from "../src/baseCiConfirmation.ts";
import type { BaseCiJudgment } from "./baseCiJudgment.ts";

export type ListedCommit = {
  readonly sha?: unknown;
  readonly commit?: { readonly message?: unknown };
};

export type ListedRun = {
  readonly headSha?: string;
  readonly status?: string;
  readonly conclusion?: string | null;
  readonly url?: string;
  readonly createdAt?: string;
};

export function unread(reason: string): BaseCiJudgment {
  return {
    state: "unread",
    revision: "unavailable",
    subject: "(unavailable)",
    laterWithoutResult: 0,
    reason,
  };
}

function subjectOf(message: unknown): string {
  if (typeof message !== "string" || message.trim() === "")
    return "(no subject)";
  return message.split(/\r?\n/, 1)[0] ?? "(no subject)";
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
  if (conclusion === "success") return "pass";
  return "failed";
}

// Newest listed run for `sha`, by creation time then listing order.
function newestRunFor(
  runs: readonly ListedRun[],
  sha: string,
): ListedRun | undefined {
  let newest: ListedRun | undefined;
  let newestAt = Number.NEGATIVE_INFINITY;
  for (const run of runs) {
    if (run.headSha !== sha) continue;
    const at = Date.parse(run.createdAt ?? "");
    const stamp = Number.isFinite(at) ? at : Number.NEGATIVE_INFINITY;
    if (newest === undefined || stamp >= newestAt) {
      newest = run;
      newestAt = stamp;
    }
  }
  return newest;
}

export function judgeNearest(
  commits: readonly ListedCommit[],
  runs: readonly ListedRun[],
): BaseCiJudgment {
  let skipped = 0;
  for (const commit of commits) {
    if (typeof commit.sha !== "string" || commit.sha === "") {
      skipped += 1;
      continue;
    }
    const run = newestRunFor(runs, commit.sha);
    if (run === undefined) {
      skipped += 1;
      continue;
    }
    const state = judgeAttempt(run.status, run.conclusion);
    if (state === undefined) {
      skipped += 1;
      continue;
    }
    return {
      state,
      revision: commit.sha,
      subject: subjectOf(commit.commit?.message),
      laterWithoutResult: skipped,
      ...(typeof run.url === "string" && run.url !== ""
        ? { runUrl: run.url }
        : {}),
    };
  }
  return unread(
    "No result of the selected check was found in the readable history",
  );
}
