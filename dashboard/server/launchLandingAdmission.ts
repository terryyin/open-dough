// A bound launch keeps its capture authority after normal startup-attempt expiry.
import { z } from "zod";
import type { LaunchAttemptRecord } from "../src/agentLaunch.ts";
import { launchRetentionDays, type LaunchRecord } from "../src/launchRecord.ts";
import { launchLandingSchema } from "../src/launchLanding.ts";
import { sessionHostSchema } from "../src/sessionReference.ts";
import { reportingAttempt } from "./completionAdmission.ts";
import { keptRecords } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";
export const landingSubmissionSchema = launchLandingSchema
  .omit({ repository: true, receipt: true, receivedAt: true })
  .extend({ source: z.string().min(1), host: sessionHostSchema })
  .strict();
export type LandingSubmission = z.infer<typeof landingSubmissionSchema>;

export async function expiredAttemptRecord(
  attempts: readonly LaunchAttemptRecord[] | undefined,
  report: LandingSubmission,
  origin: string,
): Promise<LaunchRecord | undefined> {
  if (
    attempts === undefined ||
    attempts.some((entry) => entry.id === report.reference)
  ) {
    reportingAttempt(attempts, report, origin);
    return undefined;
  }
  const record = (await keptRecords(report.source)).find(
    (entry) =>
      entry.request.reporting?.reference === report.reference &&
      entry.session.host === report.host,
  );
  const retained = record?.landingReporting;
  if (
    retained === undefined ||
    retained.settledAt === undefined ||
    Date.now() - Date.parse(retained.settledAt) <=
      launchRetentionDays * 86_400_000 ||
    retained.origin !== origin
  )
    throw new RefusedRequest(
      404,
      "This dashboard accepted no such reporting launch.",
    );
  if (retained.deletedAt !== undefined)
    throw new RefusedRequest(409, "The reporting session was deleted.");
  const established =
    record?.request.workflow === "execution"
      ? record.start
      : record?.request.workflow === "refinement"
        ? record.preparation
        : undefined;
  const authority = retained.authority;
  if (
    record?.request.host !== report.host ||
    record.request.reporting?.origin !== origin ||
    record.request.workflow === "ad-hoc" ||
    record.request.identity !== report.identity ||
    established === undefined ||
    established.identity !== authority.identity ||
    established.workspace !== authority.workspace ||
    established.branch !== authority.branch ||
    established.remote !== authority.remote ||
    `refs/heads/${established.target}` !== authority.target
  )
    throw new RefusedRequest(
      409,
      "This is not the established launch's authorized landing.",
    );
  return record;
}
