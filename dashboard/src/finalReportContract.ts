// Passive report failure does not establish conversation absence or completion.
import { z } from "zod";

// Present only when tracked-execution landing plus readable published closure
// hold. Omitted otherwise so Codex's native reader shape stays unchanged.
const productClosureEvidence = {
  productClosureEvidence: z.literal(true).optional(),
};

export const finalReportSchema = z.union([
  z.object({
    kind: z.literal("available"),
    turnId: z.string().min(1),
    text: z.string().min(1),
    ...productClosureEvidence,
  }),
  z.object({
    kind: z.literal("available"),
    receipt: z.uuid(),
    text: z.string().min(1),
    ...productClosureEvidence,
  }),
  z.object({
    kind: z.literal("unavailable"),
    explanation: z.string().min(1),
    ...productClosureEvidence,
  }),
]);
export type FinalReportRead = z.infer<typeof finalReportSchema>;
export const finalReportEndpoint = "/__agent-launch/result";
