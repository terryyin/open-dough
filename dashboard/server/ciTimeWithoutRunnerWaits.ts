import type { CiTimeWithoutRunnerWaits } from "../src/storyCiComparison.ts";
import { readWorkflowJobs, workflowJobNameMatcher } from "./ciWorkflowJobs.ts";

export type ReportedAttemptJob = {
  readonly name?: unknown;
  readonly started_at?: unknown;
  readonly completed_at?: unknown;
  readonly conclusion?: unknown;
};

export type CiTimingJob = {
  readonly id: string;
  readonly durationMs: number;
  readonly needs: readonly string[];
};

function longestJobChain(jobs: readonly CiTimingJob[]): number | undefined {
  const unresolved = new Set(jobs);
  const chains = new Map<string, number>();
  while (unresolved.size > 0) {
    const before = unresolved.size;
    for (const job of unresolved) {
      const predecessors = job.needs.map((id) => chains.get(id));
      if (predecessors.some((ms) => ms === undefined)) continue;
      chains.set(
        job.id,
        Math.max(0, ...predecessors.map((ms) => ms ?? 0)) + job.durationMs,
      );
      unresolved.delete(job);
    }
    if (unresolved.size === before) return undefined;
  }
  return Math.max(...chains.values());
}

export function timeWithoutAdapterRunnerWaits(
  jobs: readonly unknown[],
): CiTimeWithoutRunnerWaits {
  if (jobs.length === 0) return { reason: "The CI adapter reported no jobs." };

  const timedJobs: CiTimingJob[] = [];
  const ids = new Set<string>();
  for (const job of jobs) {
    if (typeof job !== "object" || job === null || Array.isArray(job))
      return { reason: "The CI adapter reported a job that is not an object." };
    const { id, durationMs, needs } = job as Partial<CiTimingJob>;
    if (typeof id !== "string" || id === "")
      return { reason: "The CI adapter reported a job without a nonempty ID." };
    if (ids.has(id))
      return { reason: `The CI adapter reported duplicate job ID “${id}”.` };
    if (typeof durationMs !== "number")
      return {
        reason: `The CI adapter's job “${id}” has no numeric durationMs.`,
      };
    if (!Number.isFinite(durationMs))
      return {
        reason: `The CI adapter's job “${id}” has a non-finite durationMs.`,
      };
    if (durationMs < 0)
      return {
        reason: `The CI adapter's job “${id}” has a negative durationMs.`,
      };
    if (
      !Array.isArray(needs) ||
      needs.some((need: unknown) => typeof need !== "string")
    )
      return {
        reason: `The CI adapter's job “${id}” has an invalid needs list.`,
      };
    ids.add(id);
    timedJobs.push({ id, durationMs, needs });
  }
  for (const { id, needs } of timedJobs) {
    const unknownNeed = needs.find((need) => !ids.has(need));
    if (unknownNeed !== undefined)
      return {
        reason: `The CI adapter's job “${id}” needs unknown job “${unknownNeed}”.`,
      };
  }
  const milliseconds = longestJobChain(timedJobs);
  if (milliseconds === undefined)
    return {
      reason: "The CI adapter's job graph contains a dependency cycle.",
    };
  if (!Number.isFinite(milliseconds))
    return {
      reason: "The CI adapter's job chain duration exceeds the numeric limit.",
    };
  return { milliseconds };
}

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

  const timedJobs: CiTimingJob[] = [];
  for (const job of jobs) {
    const duration = durations.get(job.id);
    if (duration === undefined)
      return {
        reason: `No attempt jobs were reported for workflow job “${job.id}”.`,
      };
    timedJobs.push({ id: job.id, durationMs: duration, needs: job.needs });
  }
  const milliseconds = longestJobChain(timedJobs);
  return milliseconds === undefined || !Number.isFinite(milliseconds)
    ? { reason: "The workflow's job dependencies could not be resolved." }
    : { milliseconds };
}
