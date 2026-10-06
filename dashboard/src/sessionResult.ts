// Passive report failure does not establish conversation absence or completion.
import { z } from "zod";
export const sessionResultSchema = z.union([
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
export type SessionResult = z.infer<typeof sessionResultSchema>;
export const sessionResultEndpoint = "/__agent-launch/result";
