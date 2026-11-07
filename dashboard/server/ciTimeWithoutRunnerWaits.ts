import type { CiTimeWithoutRunnerWaits } from "../src/storyCiComparison.ts";
import {
  readWorkflowJobs,
  workflowJobNameMatcher,
  type WorkflowJob,
} from "./ciWorkflowJobs.ts";

export type ReportedAttemptJob = {
  readonly name?: unknown;
  readonly started_at?: unknown;
  readonly completed_at?: unknown;
  readonly conclusion?: unknown;
};

function jobDuration(
  job: ReportedAttemptJob,
  failed: boolean,
): number | undefined {
  const start =
    typeof job.started_at === "string" ? Date.parse(job.started_at) : NaN;
  const end =
    typeof job.completed_at === "string" ? Date.parse(job.completed_at) : NaN;
  if (Number.isFinite(start) && Number.isFinite(end) && end >= start)
    return end - start;
  // Skipped jobs after failure can be reported without a runner or times.
  const noStart = job.started_at === null || job.started_at === undefined;
  const noEnd = job.completed_at === null || job.completed_at === undefined;
  if (
    failed &&
    job.conclusion === "skipped" &&
    (noStart || noEnd) &&
    (noStart || Number.isFinite(start)) &&
    (noEnd || Number.isFinite(end))
  )
    return 0;
  return undefined;
}

export function timeWithoutRunnerWaits(
  workflow: string,
  rows: readonly ReportedAttemptJob[],
  failed: boolean,
): CiTimeWithoutRunnerWaits {
  if (rows.length === 0) return { reason: "No attempt jobs were reported." };
  const jobs = readWorkflowJobs(workflow);
  if (jobs === undefined)
    return { reason: "The workflow's job definitions could not be read." };

  const matches = jobs.map((job) => ({
    job,
    matches: workflowJobNameMatcher(job),
  }));
  const durations = new Map<string, number>();
  const reported = new Set<string>();
  for (const row of rows) {
    const name = row.name;
    if (typeof name !== "string" || name === "")
      return { reason: "An attempt job has no reported name." };
    const matching = matches.filter((job) => job.matches(name));
    const job = matching[0]?.job;
    if (job === undefined)
      return {
        reason: `Job “${name}” does not match a workflow job definition.`,
      };
    if (matching.length > 1 || reported.has(name))
      return { reason: `Job “${name}” has an ambiguous workflow job match.` };
    const duration = jobDuration(row, failed);
    if (duration === undefined)
      return {
        reason: `Job “${name}” has no valid start and completion times.`,
      };
    reported.add(name);
    // Matrix instances share their definition's needs. Only the longest
    // instance can extend a chain through that definition.
    durations.set(job.id, Math.max(duration, durations.get(job.id) ?? 0));
  }

  const unresolved = new Map<WorkflowJob, number>();
  for (const job of jobs) {
    const duration = durations.get(job.id);
    if (duration === undefined)
      return {
        reason: `No attempt jobs were reported for workflow job “${job.id}”.`,
      };
    unresolved.set(job, duration);
  }
  const chains = new Map<string, number>();
  while (unresolved.size > 0) {
    const before = unresolved.size;
    for (const [job, duration] of unresolved) {
      const predecessors = job.needs.map((id) => chains.get(id));
      if (predecessors.some((ms) => ms === undefined)) continue;
      chains.set(
        job.id,
        Math.max(0, ...predecessors.map((ms) => ms ?? 0)) + duration,
      );
      unresolved.delete(job);
    }
    if (unresolved.size === before)
      return {
        reason: "The workflow's job dependencies could not be resolved.",
      };
  }
  return { milliseconds: Math.max(...chains.values()) };
}
