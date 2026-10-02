// Explicit completion evidence is independent of native session activity.
import { z } from "zod";

export const completionSchema = z.object({
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
