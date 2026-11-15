// Explicit completion evidence is independent of native session activity.
import { z } from "zod";
import { sessionHostSchema } from "./sessionReference.ts";

export const completionSchema = z.object({
  delivery: z.uuid().optional(),
  receipt: z.uuid(),
  reference: z.uuid(),
  outcome: z.enum(["completed", "unfinished"]),
  message: z.string().max(16000),
  receivedAt: z.iso.datetime(),
});
export type CompletionReport = z.infer<typeof completionSchema>;

// The words a reported outcome reads with wherever the dashboard shows it:
// completed, with attention when its report carries a message, or unfinished.
export function reportedOutcomeLabel({
  completed,
  attention,
}: {
  readonly completed: boolean;
  readonly attention: boolean;
}): string {
  return completed
    ? attention
      ? "Completed with attention"
      : "Completed"
    : "Unfinished work";
}

// A reported launch whose closure kept its outcome as returned to the backlog.
export const returnedToBacklogLabel = "Returned to backlog";

export function completionLabel(report: CompletionReport): string {
  return reportedOutcomeLabel({
    completed: report.outcome === "completed",
    attention: report.message !== "",
  });
}

// Whether a record's report is unread: it has a message, the session is not marked
// done, and the developer has not marked this report read. A newer report
// comes with a new receipt, so it is unread again.
export function reportUnread(record: {
  readonly completion?:
    Pick<CompletionReport, "receipt" | "message"> | undefined;
  readonly doneAt?: string | undefined;
  readonly reportRead?: string | undefined;
}): boolean {
  return (
    record.completion !== undefined &&
    record.completion.message !== "" &&
    record.doneAt === undefined &&
    record.reportRead !== record.completion.receipt
  );
}

// Whether a record's Done is the automatic Done of its quiet completion, set
// when it was received, rather than a later explicit Done.
export function doneAutomatically(record: {
  readonly completion?: CompletionReport | undefined;
  readonly doneAt?: string | undefined;
  readonly dispositionChangedAt?: string | undefined;
}): boolean {
  const { completion } = record;
  return (
    completion !== undefined &&
    completedWithoutAttention(completion) &&
    record.doneAt === completion.receivedAt &&
    (record.dispositionChangedAt === undefined ||
      record.dispositionChangedAt < completion.receivedAt)
  );
}

export function completedWithoutAttention(
  report: Pick<CompletionReport, "outcome" | "message">,
): boolean {
  return report.outcome === "completed" && report.message === "";
}

export function hasCompletionMessage(
  report: CompletionReport | undefined,
): report is CompletionReport {
  return report !== undefined && report.message !== "";
}

// A receipt belongs to one delivery; retry returns these original facts even after binding.
export const completionReceiptSchema = completionSchema.extend({
  state: z.enum(["recorded", "pending-native-session"]),
  session: z
    .object({ host: sessionHostSchema, sessionId: z.string().min(1) })
    .optional(),
});
export type CompletionReceipt = z.infer<typeof completionReceiptSchema>;
