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

export function completionLabel(report: CompletionReport): string {
  return completedWithoutAttention(report)
    ? "Completed"
    : report.outcome === "completed"
      ? "Completed with attention"
      : "Unfinished work";
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
