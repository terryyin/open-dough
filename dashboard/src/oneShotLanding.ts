// A fixed delivered comparison is independent of completion and native Done.
import { z } from "zod";
export const commitIdSchema = z
  .string()
  .regex(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/);
export const landingRepositorySchema = z.object({
  repository: z.string().min(1),
  workspace: z.string().min(1),
  branch: z.string().min(1),
  identity: z.string().min(1),
  remote: z.string().min(1),
  target: z.string().startsWith("refs/heads/"),
});
export const oneShotLandingSchema = landingRepositorySchema
  .omit({ workspace: true, branch: true })
  .extend({
    reference: z.uuid(),
    delivery: z.uuid(),
    receipt: z.uuid(),
    base: commitIdSchema,
    revision: commitIdSchema,
    receivedAt: z.iso.datetime(),
  });
export type OneShotLanding = z.infer<typeof oneShotLandingSchema>;
export const landingReceiptSchema = oneShotLandingSchema
  .omit({ repository: true })
  .extend({
    state: z.enum(["prepared", "recorded", "pending-native-session"]),
  });
export type LandingReceipt = z.infer<typeof landingReceiptSchema>;
