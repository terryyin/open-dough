// The trigger consumes the existing comparison; it defines no second cohort.
import { z } from "zod";
import {
  wallTimeReadingOf,
  wallTimeReferenceOf,
} from "./ciWallTimeReference.ts";
import type { ProjectHistory } from "./landedCiHistoryStore.ts";
import type { RepeatJob } from "./ciFollowUpStore.ts";
import {
  followUpRule,
  reachesFollowUpThreshold,
} from "../src/ciFollowUpRule.ts";

export function repeatDecisionOf(history: ProjectHistory, receipt: string) {
  const landing = history.landings[receipt];
  const observed = landing?.observed;
  if (observed?.kind !== "build" || observed.selection !== "exact")
    return undefined;
  const original = history.builds[observed.build];
  if (
    original === undefined ||
    original.revision !== landing?.revision ||
    (original.adapterAttempt === undefined &&
      (original.runId === undefined || original.runAttempt === undefined))
  )
    return undefined;
  const ms = wallTimeReadingOf(original).ms;
  const reference = wallTimeReferenceOf(history, landing.revision);
  const average = reference.averageMs;
  if (
    ms === undefined ||
    average === undefined ||
    average <= 0 ||
    !reachesFollowUpThreshold(ms, average, followUpRule)
  )
    return undefined;
  return { original, reference };
}

const jobSchema = z.object({
  databaseId: z.number().int().positive(),
  name: z.string().min(1),
  run_id: z.number().int().positive(),
  head_sha: z.string().min(1),
  started_at: z.iso.datetime({ offset: true }),
  completed_at: z.iso.datetime({ offset: true }),
  status: z.literal("completed"),
});
// Jobs from the exact-attempt endpoint may include carried-forward jobs.
// GitHub documents job id/run_id/SHA and bounds, not job.run_attempt.
export function completedJobs(
  raw: unknown,
  run: {
    runId: number;
    revision: string;
    startedAt?: string | undefined;
    completedAt?: string | undefined;
  },
): RepeatJob[] | undefined {
  const parsed = z.array(jobSchema).min(1).safeParse(raw);
  const start = Date.parse(run.startedAt ?? ""),
    end = Date.parse(run.completedAt ?? "");
  if (
    !parsed.success ||
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end < start
  )
    return undefined;
  if (
    new Set(parsed.data.map((job) => job.databaseId)).size !==
    parsed.data.length
  )
    return undefined;
  return parsed.data.every(
    (job) =>
      job.run_id === run.runId &&
      job.head_sha === run.revision &&
      Date.parse(job.started_at) >= start &&
      Date.parse(job.completed_at) >= Date.parse(job.started_at) &&
      Date.parse(job.completed_at) <= end,
  )
    ? parsed.data
    : undefined;
}

export function fullRepeatJobs(
  original: readonly RepeatJob[],
  repeated: unknown,
  run: Parameters<typeof completedJobs>[1],
): boolean {
  const jobs = completedJobs(repeated, run);
  if (jobs === undefined || original.length !== jobs.length) return false;
  const originalIds = new Set(original.map((job) => job.databaseId));
  const names = (list: readonly RepeatJob[]) =>
    list.map((job) => job.name).sort();
  return (
    JSON.stringify(names(original)) === JSON.stringify(names(jobs)) &&
    jobs.every((job) => !originalIds.has(job.databaseId))
  );
}
