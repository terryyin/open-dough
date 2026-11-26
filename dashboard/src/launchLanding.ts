// A fixed delivered comparison is independent of completion and native Done.
import { z } from "zod";
import type { LaunchRecord } from "./launchRecord.ts";
export const commitIdSchema = z
  .string()
  .regex(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/);
export const admittedClaimCheckoutSchema = z.object({
  workspace: z.string().min(1),
  branch: z.string().min(1),
  publishedSha: commitIdSchema,
});
export type AdmittedClaimCheckout = z.infer<typeof admittedClaimCheckoutSchema>;
export const landingRepositorySchema = z.object({
  repository: z.string().min(1),
  workspace: z.string().min(1),
  branch: z.string().min(1),
  // The story the launch names; a session with no story names none, and its
  // landing is kept by its launch reference alone.
  identity: z.string().min(1).optional(),
  admission: admittedClaimCheckoutSchema.optional(),
  remote: z.string().min(1),
  target: z.string().startsWith("refs/heads/"),
});
export type LandingRepository = z.infer<typeof landingRepositorySchema>;
export const launchLandingSchema = landingRepositorySchema
  .omit({ workspace: true, branch: true, admission: true })
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
  branchContext: z
    .object({ reference: z.uuid(), file: z.string().min(1) })
    .optional(),
  settledAt: z.iso.datetime().optional(),
  deletedAt: z.iso.datetime().optional(),
});
export type LandingReporting = z.infer<typeof landingReportingSchema>;

export function landingReportingReference(record: {
  readonly request: {
    readonly reporting?: { readonly reference: string } | undefined;
  };
  readonly landingReporting?: LandingReporting | undefined;
}): string | undefined {
  return (
    record.landingReporting?.branchContext?.reference ??
    record.request.reporting?.reference
  );
}
// A migrated Done row can name a story while retaining its exact old report.
export function historicalUnboundLanding(
  record: Pick<LaunchRecord, "request" | "doneAt" | "landing">,
): LaunchLanding | undefined {
  const landing = record.landing;
  if (
    record.request.workflow !== "ad-hoc" ||
    record.doneAt === undefined ||
    landing === undefined ||
    landing.identity !== undefined ||
    landing.reference !== record.request.reporting?.reference
  )
    return undefined;
  return landing;
}

export const landingReceiptSchema = launchLandingSchema
  .omit({ repository: true })
  .extend({
    state: z.enum(["prepared", "recorded", "pending-native-session"]),
  });
export type LandingReceipt = z.infer<typeof landingReceiptSchema>;
