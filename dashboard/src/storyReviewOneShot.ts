// Retained one-shot runs belong to their launch, independently of live workspace selection.
import { z } from "zod";
import { isEstablishedOneShot, type LaunchRecord } from "./launchRecord.ts";
import { launchSubject } from "./launchWorkflow.ts";
import { oneShotLandingSchema } from "./oneShotLanding.ts";

export function reviewOneShotRunsOf<Kept extends LaunchRecord>(
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
export type ReviewOneShotRun = ReturnType<typeof reviewOneShotRunsOf>[number];
// Review exposes comparison identity and context, never the saved repository path.
export const landedReviewContextSchema = oneShotLandingSchema
  .omit({ repository: true })
  .extend({
    workflow: z.enum(["refinement", "execution"]),
    launchedAt: z.iso.datetime(),
  });
export type LandedReviewContext = z.infer<typeof landedReviewContextSchema>;
