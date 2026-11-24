// Landed runs belong to their launch, independently of live workspace selection:
// every retained one-shot launch, and a claimed launch once it holds a captured
// landing or its workspace is gone (then as its evidence gap). A claimed launch
// with a workspace and no landing has not landed.
import { z } from "zod";
import {
  isEstablishedOneShot,
  type EstablishedContext,
  type LaunchRecord,
} from "./launchRecord.ts";
import type { EstablishedSession } from "./unattachedSession.ts";
import { launchSubject } from "./launchWorkflow.ts";
import { launchLandingSchema, type LaunchLanding } from "./launchLanding.ts";
import { sessionKey } from "./sessionReference.ts";

export type ReviewLandedRun = {
  readonly record: LaunchRecord;
  readonly established: EstablishedContext | EstablishedSession;
};

export function reviewLandedRunsOf(
  records: readonly LaunchRecord[] | undefined,
  source: string,
  identity: string,
  workspaceGone: (workspace: string) => boolean,
): ReviewLandedRun[] {
  return (records ?? [])
    .flatMap((record): ReviewLandedRun[] => {
      const established = record.start ?? record.preparation;
      if (
        established === undefined ||
        record.request.source !== source ||
        launchSubject(record.request).identity !== identity ||
        !(
          isEstablishedOneShot(established) ||
          record.landing !== undefined ||
          workspaceGone(established.workspace)
        )
      )
        return [];
      return [{ record, established }];
    })
    .sort(
      (a, b) =>
        Date.parse(b.record.launchedAt) - Date.parse(a.record.launchedAt),
    );
}
export function storyReviewOffered(
  records: readonly LaunchRecord[] | undefined,
  source: string,
  identity: string,
  published: boolean,
): boolean | undefined {
  if (published) return true;
  if (records === undefined) return undefined;
  return reviewLandedRunsOf(records, source, identity, () => false).length > 0;
}

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
export const reviewLandedWorkflowSchema = z.enum([
  "refinement",
  "execution",
  "ad-hoc",
]);
export const reviewRunChoiceSchema = z.object({
  key: z.string().min(1),
  workflow: reviewLandedWorkflowSchema,
  launchedAt: z.iso.datetime().optional(),
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
  .omit({ repository: true, delivery: true, receipt: true })
  .extend({
    workflow: reviewLandedWorkflowSchema,
    launchedAt: z.iso.datetime().optional(),
    receivedAt: z.iso.datetime().optional(),
  });
export type LandedReviewContext = z.infer<typeof landedReviewContextSchema>;
