// A local Done entry's legacy accepted delivery admits only its fixed pair.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  admitLandedRun,
  notOnCapturedRun,
  type HistoricalReviewedFileFields,
} from "./storyReviewHistoricalFileAdmission.ts";

export async function admitSessionReviewedFile(
  source: PublishedSource,
  record: LaunchRecord,
  reference: string | undefined,
  file: HistoricalReviewedFileFields,
  signal: AbortSignal,
) {
  if (record.landing === undefined || reference !== record.landing.reference)
    throw notOnCapturedRun();
  return admitLandedRun({ record }, file, signal, source);
}
