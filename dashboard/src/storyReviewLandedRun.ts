// Retained one-shot runs belong to their launch, independently of live workspace selection.
import { z } from "zod";
import { isEstablishedOneShot, type LaunchRecord } from "./launchRecord.ts";
import { launchSubject } from "./launchWorkflow.ts";
import { launchLandingSchema, type LaunchLanding } from "./launchLanding.ts";
import { sessionKey } from "./sessionReference.ts";

export function reviewLandedRunsOf<Kept extends LaunchRecord>(
  records: readonly Kept[] | undefined,
  source: string,
  identity: string,
) {
  return (records ?? [])
    .flatMap((record) => {
      const established = record.start ?? record.preparation;
      if (
        established === undefined ||
        !isEstablishedOneShot(established) ||
        record.request.source !== source ||
        launchSubject(record.request).identity !== identity
      )
        return [];
      return [{ record, established }];
    })
    .sort(
      (a, b) =>
        Date.parse(b.record.launchedAt) - Date.parse(a.record.launchedAt),
    );
}
export type ReviewLandedRun = ReturnType<typeof reviewLandedRunsOf>[number];
// Runs are newest first. Opening, switching to history, and replacing a
// vanished choice all prefer the newest captured comparison, then its gap.
export function preferredReviewRun<Run>(
  runs: readonly Run[],
  comparisonOf: (
    run: Run,
  ) => Pick<LaunchLanding, "base" | "revision"> | undefined,
): Run | undefined {
  return runs.find((run) => comparisonOf(run) !== undefined) ?? runs[0];
}
// The launch reference survives native session replacement. Older launches
// without the optional reporting handoff use their durable host/session key.
export const reviewRunKey = (record: LaunchRecord) =>
  record.request.reporting?.reference ?? sessionKey(record.session);
export const reviewRunChoiceSchema = z.object({
  key: z.string().min(1),
  workflow: z.enum(["refinement", "execution"]),
  launchedAt: z.iso.datetime(),
  remote: z.string().min(1),
  target: z.string().min(1),
  comparison: launchLandingSchema
    .pick({ base: true, revision: true })
    .optional(),
});
export type ReviewRunChoice = z.infer<typeof reviewRunChoiceSchema>;
export function reviewRunChoice(run: ReviewLandedRun): ReviewRunChoice {
  const { record, established } = run;
  return reviewRunChoiceSchema.parse({
    key: reviewRunKey(record),
    workflow: record.request.workflow,
    launchedAt: record.launchedAt,
    remote: established.remote,
    target: established.target,
    comparison:
      record.landing === undefined
        ? undefined
        : {
            base: record.landing.base,
            revision: record.landing.revision,
          },
  });
}
// Review exposes comparison identity and context, never the saved repository path.
export const landedReviewContextSchema = launchLandingSchema
  .omit({ repository: true })
  .extend({
    workflow: z.enum(["refinement", "execution"]),
    launchedAt: z.iso.datetime(),
  });
export type LandedReviewContext = z.infer<typeof landedReviewContextSchema>;
