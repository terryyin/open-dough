// Admission and immutable delivery identity stay tied to the accepted launch.
import { z } from "zod";
import type { LaunchAttemptRecord } from "../src/agentLaunch.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { CreationRecord } from "../src/launchCreation.ts";
import {
  completedWithoutAttention,
  completionSchema,
} from "../src/completionReport.ts";
import { sessionHostSchema } from "../src/sessionReference.ts";
import { RefusedRequest } from "./localOrigin.ts";

export const submissionSchema = z
  .strictObject({
    delivery: z.uuid().optional(),
    source: z.string().min(1),
    host: sessionHostSchema,
    reference: completionSchema.shape.reference,
    session: z.string().min(1).optional(),
    outcome: completionSchema.shape.outcome,
    message: completionSchema.shape.message,
  })
  .refine(
    (report) =>
      completedWithoutAttention(report) || report.message.trim().length > 0,
  );
export type CompletionSubmission = z.infer<typeof submissionSchema>;

// The caller selects this project's records before matching the launch identity.
export function isReportingRecord(
  record: LaunchRecord | CreationRecord,
  report: CompletionSubmission,
): record is LaunchRecord {
  return (
    "session" in record &&
    record.request.reporting?.reference === report.reference &&
    record.session.host === report.host
  );
}

export function reportingAttempt(
  attempts: readonly LaunchAttemptRecord[] | undefined,
  report: Pick<CompletionSubmission, "source" | "host" | "reference">,
  origin: string,
): LaunchAttemptRecord {
  const attempt = attempts?.find(
    (entry) =>
      entry.id === report.reference &&
      entry.request.source === report.source &&
      entry.request.host === report.host,
  );
  if (attempt?.reporting === undefined || attempt.reportingOrigin !== origin)
    throw new RefusedRequest(
      404,
      "This dashboard accepted no such reporting launch.",
    );
  if (attempt.reportingDeletedAt !== undefined)
    throw new RefusedRequest(409, "The reporting session was deleted.");
  return attempt;
}

export function sameCompletionContent(
  previous: { outcome: string; message: string },
  report: CompletionSubmission,
): void {
  if (
    previous.outcome !== report.outcome ||
    previous.message !== report.message
  )
    throw new RefusedRequest(
      409,
      "A completion delivery cannot change its original outcome or message.",
    );
}
