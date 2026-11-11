// Exact GitHub identities for admission and later-attempt observation.
import { readGitHubActions } from "../../src/skills/dough-execute-plan/scripts/ci-github-actions.mjs";
import type { RepeatRequest } from "./ciFollowUpStore.ts";

export type RunSnapshot = {
  id?: number;
  run_attempt?: number;
  head_sha?: string;
  workflow_id?: number;
  status?: string;
  conclusion?: string | null;
  html_url?: string;
  run_started_at?: string;
  updated_at?: string;
};
export async function exactRepeatRun(
  repository: string,
  runId: number,
  attempt: number,
  signal: AbortSignal,
): Promise<RunSnapshot> {
  return readGitHubActions(
    ["api", `repos/${repository}/actions/runs/${runId}/attempts/${attempt}`],
    signal,
  ) as Promise<RunSnapshot>;
}
export function sameRun(
  run: RunSnapshot,
  request: Pick<RepeatRequest, "original" | "workflowId">,
  attempt: number,
): boolean {
  return (
    run.id === request.original.runId &&
    run.head_sha === request.original.revision &&
    run.workflow_id === request.workflowId &&
    run.run_attempt === attempt
  );
}
