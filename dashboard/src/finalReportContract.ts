// Passive report failure does not establish conversation absence or completion.
import { z } from "zod";
export const finalReportSchema = z.union([
  z.object({
    kind: z.literal("available"),
    turnId: z.string().min(1),
    text: z.string().min(1),
  }),
  z.object({
    kind: z.literal("available"),
    receipt: z.uuid(),
    text: z.string().min(1),
  }),
  z.object({ kind: z.literal("unavailable"), explanation: z.string().min(1) }),
]);
export type FinalReportRead = z.infer<typeof finalReportSchema>;
export const finalReportEndpoint = "/__agent-launch/result";
