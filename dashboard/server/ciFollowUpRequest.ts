// Verify the actual original workflow attempt and freeze its complete decision.
import { createGitHubActions } from "../../src/skills/dough-execute-plan/scripts/ci-github-actions.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import { completedJobs, repeatDecisionOf } from "./ciFollowUpDecision.ts";
import { exactRepeatRun, sameRun } from "./ciFollowUpGithub.ts";
import { followUpRule, type RepeatRequest } from "./ciFollowUpStore.ts";
export async function prepareCiRepeat(
  source: PublishedSource,
  workflow: string,
  decision: NonNullable<ReturnType<typeof repeatDecisionOf>>,
  signal: AbortSignal,
): Promise<RepeatRequest | string> {
  const { original, reference } = decision;
  const runId = original.runId,
    attempt = original.runAttempt;
  if (runId === undefined || attempt === undefined)
    return "The original run identity is incomplete";
  const github = createGitHubActions({ repo: source.repository, workflow });
  const selectedWorkflow = (await github.workflow(signal)) as { id?: number };
  if (selectedWorkflow.id === undefined)
    return "The original workflow identity is unavailable";
  const requestIdentity = { original, workflowId: selectedWorkflow.id };
  const current = (await github.viewCurrentRun(runId, signal)) as {
    attempt?: number;
    databaseId?: number;
    headSha?: string;
    workflowId?: number;
  };
  if (
    current.attempt !== attempt ||
    current.databaseId !== runId ||
    current.headSha !== original.revision ||
    current.workflowId !== selectedWorkflow.id
  )
    return "The original run is no longer the only observed attempt of the selected workflow; automatic repeat is unverified";
  const exact = await exactRepeatRun(source.repository, runId, attempt, signal);
  if (
    !sameRun(exact, requestIdentity, attempt) ||
    exact.status !== "completed" ||
    exact.conclusion !== "success" ||
    Date.parse(exact.run_started_at ?? "") !==
      Date.parse(original.startedAt ?? "") ||
    Date.parse(exact.updated_at ?? "") !==
      Date.parse(original.completedAt ?? "")
  )
    return "Exact original attempt identity or timing bounds are inconsistent; automatic repeat is unverified";
  const jobs = completedJobs(await github.attemptJobs(runId, attempt, signal), {
    ...original,
    runId,
  });
  if (jobs === undefined || signal.aborted)
    return "Original exact-attempt jobs are incomplete or carried forward; a full comparable repeat cannot be established";
  const request: RepeatRequest = {
    provider: "github",
    ...requestIdentity,
    repository: source.repository,
    workflow,
    reference,
    rule: followUpRule,
    originalJobs: jobs,
    requestedAt: new Date().toISOString(),
    submission: { kind: "intent" },
    outcome: {
      kind: "unverified",
      explanation:
        "Request intent was saved; submission acceptance is unverified and will not be resent",
    },
  };

  return request;
}
