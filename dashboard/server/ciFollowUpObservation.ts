// Fresh exact-attempt reads deliberately bypass remembered/pending job caches.
import { createGitHubActions } from "../../Distribution/src/skills/dough-execute-plan/scripts/ci-github-actions.mjs";
import { exactRepeatRun, sameRun } from "./ciFollowUpGithub.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { attemptTimingBasis } from "../src/ciAttemptTiming.ts";
import { collectedProofOf } from "./landedCiCollectedProof.ts";
import { fullRepeatJobs } from "./ciFollowUpDecision.ts";
import type { GithubRepeatRequest } from "./ciFollowUpStore.ts";
import { repeatTimingVerdict } from "./ciFollowUpVerdict.ts";

const unverified = (explanation: string): GithubRepeatRequest["outcome"] => ({
  kind: "unverified",
  explanation,
});

export async function observeRepeat(
  source: PublishedSource,
  request: GithubRepeatRequest,
  signal: AbortSignal,
): Promise<GithubRepeatRequest["outcome"]> {
  if (request.submission.kind === "refused")
    return {
      settled: true,
      ...unverified(
        `CI repeat request refused: ${request.submission.explanation ?? "provider refused the full repeat"}`,
      ),
    };
  const runId = request.original.runId,
    originalAttempt = request.original.runAttempt;
  if (runId === undefined || originalAttempt === undefined)
    return unverified("Original run identity is incomplete");
  const github = createGitHubActions({
    repo: request.repository,
    workflow: request.workflow,
  });
  try {
    const current = (await github.viewCurrentRun(runId, signal)) as {
      attempt?: number;
      databaseId?: number;
      headSha?: string;
      workflowId?: number;
    };
    const attempt = originalAttempt + 1;
    if (
      current.databaseId !== runId ||
      current.headSha !== request.original.revision ||
      current.workflowId !== request.workflowId ||
      current.attempt !== attempt
    )
      return {
        settled: current.attempt !== undefined && current.attempt > attempt,
        ...unverified(
          current.attempt !== undefined && current.attempt > attempt
            ? "Multiple later attempts make the requested full repeat unattributable"
            : "No later attempt of the original run has been observed",
        ),
      };
    const run = await exactRepeatRun(
      request.repository,
      runId,
      attempt,
      signal,
    );
    if (!sameRun(run, request, attempt))
      return unverified(
        "The observed attempt does not match the original workflow/run/revision",
      );
    const observed = {
      runId,
      runAttempt: attempt,
      revision: request.original.revision,
      workflowId: request.workflowId,
      ...(run.status === undefined ? {} : { status: run.status }),
      ...(run.conclusion === undefined ? {} : { conclusion: run.conclusion }),
      ...(run.html_url === undefined ? {} : { runUrl: run.html_url }),
      ...(run.run_started_at === undefined
        ? {}
        : { startedAt: run.run_started_at }),
      ...(run.updated_at === undefined ? {} : { completedAt: run.updated_at }),
    };
    const acceptance =
      request.submission.kind === "intent"
        ? "Request intent was saved; submission acceptance is unverified and will not be resent"
        : `Request acceptance is uncertain: ${request.submission.explanation ?? "no definitive reply"}`;
    if (
      ["queued", "in_progress", "waiting", "pending", "requested"].includes(
        run.status ?? "",
      )
    )
      return request.submission.kind === "accepted"
        ? { observed, kind: "progress", explanation: "CI rerun in progress" }
        : { observed, ...unverified(acceptance) };
    if (run.status !== "completed")
      return unverified("The repeat's CI outcome is not recorded");
    if (run.conclusion === "cancelled")
      return {
        observed,
        settled: true,
        ...unverified(
          "The observed repeat was cancelled; timing is unverified",
        ),
      };
    if (run.conclusion === undefined || run.conclusion === null)
      return {
        observed,
        ...unverified(
          "The completed attempt has no provider verdict; timing is unverified",
        ),
      };
    if (run.conclusion !== "success") {
      const failed =
        run.conclusion === "failure" || run.conclusion === "timed_out";
      return {
        observed,
        settled:
          failed ||
          ["neutral", "skipped", "action_required", "stale"].includes(
            run.conclusion,
          ),
        ...unverified(
          failed
            ? `The observed repeat failed (${run.conclusion}); timing is unverified`
            : `CI reported ${run.conclusion}; timing is unverified`,
        ),
      };
    }
    const repeat = {
      revision: request.original.revision,
      state: "pass" as const,
      runId,
      runAttempt: attempt,
      timingBasis: attemptTimingBasis,
      ...(run.html_url === undefined ? {} : { runUrl: run.html_url }),
      ...(run.run_started_at === undefined
        ? {}
        : { startedAt: run.run_started_at }),
      ...(run.updated_at === undefined ? {} : { completedAt: run.updated_at }),
    };
    const jobs = await github.attemptJobs(runId, attempt, signal);
    if (
      !fullRepeatJobs(request.originalJobs, jobs, { ...repeat, runId }) ||
      Date.parse(repeat.startedAt ?? "") <=
        Date.parse(request.original.completedAt ?? "")
    )
      return {
        observed,
        ...unverified(
          "Full comparable repeat is unverified: missing, carried-forward or mismatched attempt jobs",
        ),
      };
    const collected = await collectedProofOf(source, repeat, signal);
    const measured = {
      ...repeat,
      proof: collected.proof,
      proofPending: collected.pending,
    };
    const verdict = repeatTimingVerdict(request, measured);
    if (verdict === undefined)
      return {
        observed,
        settled: !collected.pending,
        ...unverified(
          "Repeat measurement or comparable CI proof is incomplete",
        ),
        repeat: measured,
      };
    if (request.submission.kind !== "accepted")
      return {
        observed,
        settled: true,
        repeat: measured,
        ...unverified(acceptance),
      };
    return {
      observed,
      settled: true,
      ...verdict,
      repeat: measured,
    };
  } catch {
    return unverified(
      request.submission.kind === "accepted"
        ? "The requested repeat could not be observed; timing is unverified"
        : "Request acceptance is unverified; it will not be resent",
    );
  }
}
