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
export type LandingRepository = z.infer<typeof landingRepositorySchema>;
export const launchLandingSchema = landingRepositorySchema
  .omit({ workspace: true, branch: true })
  .extend({
    reference: z.uuid(),
    delivery: z.uuid(),
    receipt: z.uuid(),
    base: commitIdSchema,
    revision: commitIdSchema,
    receivedAt: z.iso.datetime(),
  });
export type LaunchLanding = z.infer<typeof launchLandingSchema>;
// The original server-owned capture authority follows its bound conversation.
// Its lifetime is the record's existing retention, independent of startup attempts.
export const landingReportingSchema = z.object({
  origin: z.url(),
  authority: landingRepositorySchema,
  preparations: z.array(launchLandingSchema),
  settledAt: z.iso.datetime().optional(),
  deletedAt: z.iso.datetime().optional(),
});
export type LandingReporting = z.infer<typeof landingReportingSchema>;
export const landingReceiptSchema = launchLandingSchema
  .omit({ repository: true })
  .extend({
    state: z.enum(["prepared", "recorded", "pending-native-session"]),
  });
export type LandingReceipt = z.infer<typeof landingReceiptSchema>;
