// Nearest selected-check result along a branch's commit listing: newest run
// per revision, then the first revision that yields a judged state. A result
// belongs to its commit whichever branch's push produced it, so the runs may
// come from more than one branch's listing; each judged result names the
// branch its run was on (`branch`, as the listing that returned it says).
import type {
  BaseCiCompletedAncestor,
  BaseCiState,
} from "../src/baseCiConfirmation.ts";

// One judged result, unread with its reason when no state could be judged.
export type BaseCiJudgment =
  | {
      readonly state: "pass";
      readonly revision: string;
      readonly subject: string;
      readonly laterWithoutResult: number;
      readonly runUrl?: string;
      readonly runBranch?: string;
    }
  | {
      readonly state: BaseCiState;
      readonly revision: string;
      readonly subject: string;
      readonly laterWithoutResult: number;
      readonly completedAncestor?: BaseCiCompletedAncestor;
      readonly reason?: string;
      readonly runUrl?: string;
      readonly runBranch?: string;
      // GitHub has no published story branch of the judged name (its
      // history listing answered `404`); never the configured ref.
      readonly unpublished?: true;
    };

export type ListedCommit = {
  readonly sha?: unknown;
  readonly commit?: { readonly message?: unknown };
  readonly parents?: readonly { readonly sha?: unknown }[];
};

export type ListedRun = {
  readonly headSha?: string;
  readonly status?: string;
  readonly conclusion?: string | null;
  readonly url?: string;
  readonly createdAt?: string;
  // The branch whose listing returned the run.
  readonly branch?: string;
};

function runBranchOf(run: ListedRun): { runBranch?: string } {
  return typeof run.branch === "string" && run.branch !== ""
    ? { runBranch: run.branch }
    : {};
}

export function unread(
  reason: string,
): Exclude<BaseCiJudgment, { state: "pass" }> {
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

function completedStateOf(
  conclusion: ListedRun["conclusion"],
): BaseCiCompletedAncestor["state"] {
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

// Newest listed run for `sha`, by creation time then listing order.
function newestRunFor(
  runs: readonly ListedRun[],
  sha: string,
  completedOnly = false,
): ListedRun | undefined {
  let newest: ListedRun | undefined;
  let newestAt = Number.NEGATIVE_INFINITY;
  for (const run of runs) {
    if (run.headSha !== sha || (completedOnly && run.status !== "completed"))
      continue;
    const at = Date.parse(run.createdAt ?? "");
    const stamp = Number.isFinite(at) ? at : Number.NEGATIVE_INFINITY;
    if (newest === undefined || stamp >= newestAt) {
      newest = run;
      newestAt = stamp;
    }
  }
  return newest;
}

function nearestCompletedAncestor(
  revision: ListedCommit,
  commits: readonly ListedCommit[],
  runs: readonly ListedRun[],
): BaseCiCompletedAncestor | undefined {
  const bySha = new Map(commits.map((commit) => [commit.sha, commit]));
  const ancestors = new Set<string>();
  const pending = [...(revision.parents ?? [])];
  for (const parent of pending) {
    if (typeof parent.sha !== "string" || ancestors.has(parent.sha)) continue;
    ancestors.add(parent.sha);
    pending.push(...(bySha.get(parent.sha)?.parents ?? []));
  }
  // Target history may include merged siblings that do not precede this
  // running revision. Only its actual parents can supply ancestor evidence.
  for (const commit of commits) {
    if (
      typeof commit.sha !== "string" ||
      commit.sha === "" ||
      !ancestors.has(commit.sha)
    )
      continue;
    const run = newestRunFor(runs, commit.sha, true);
    if (run === undefined) continue;
    return {
      revision: commit.sha,
      subject: subjectOf(commit.commit?.message),
      state: completedStateOf(run.conclusion),
      ...(run.url ? { runUrl: run.url } : {}),
      ...runBranchOf(run),
    };
  }
  return undefined;
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
    const completedAncestor =
      state === "running"
        ? nearestCompletedAncestor(commit, commits, runs)
        : undefined;
    return {
      state,
      revision: commit.sha,
      subject: subjectOf(commit.commit?.message),
      laterWithoutResult: skipped,
      ...(completedAncestor === undefined ? {} : { completedAncestor }),
      ...(typeof run.url === "string" && run.url !== ""
        ? { runUrl: run.url }
        : {}),
      ...runBranchOf(run),
    };
  }
  return unread(
    "No result of the selected check was found in the readable history",
  );
}
