// Explicit completion evidence is independent of native session activity.
import { z } from "zod";

export const completionSchema = z.object({
  receipt: z.uuid(),
  reference: z.uuid(),
  outcome: z.enum(["completed", "unfinished"]),
  message: z.string().min(1).max(16000),
  receivedAt: z.iso.datetime(),
});
export type CompletionReport = z.infer<typeof completionSchema>;

export function completionLabel(report: CompletionReport): string {
  return report.outcome === "completed"
    ? "Completed with attention"
    : "Unfinished work";
}
