// Branch evidence belongs to one Done on the launch record.
import { z } from "zod";
import { commitIdSchema } from "./launchLanding.ts";

export const sessionBranchEntryEndpoint = "/__agent-launch/branch-entry";

export const sessionBranchEntrySchema = z.object({
  repository: z.string().min(1),
  workspace: z.string().min(1),
  branch: z.string().min(1),
  committedTip: commitIdSchema,
  tree: commitIdSchema,
  defaultTip: commitIdSchema.optional(),
});
export type SessionBranchEntry = z.infer<typeof sessionBranchEntrySchema>;

export const sessionBranchResultSchema = z.object({
  repository: z.string().min(1),
  doneAt: z.iso.datetime(),
  base: commitIdSchema,
  revision: commitIdSchema,
  committedTip: commitIdSchema,
});
export type SessionBranchResult = z.infer<typeof sessionBranchResultSchema>;

export const sessionBranchEvidenceSchema = z.object({
  branchReviewRepository: z.string().min(1).optional(),
  branchEntry: sessionBranchEntrySchema.optional(),
  branchResult: sessionBranchResultSchema.optional(),
  branchResultFailedAt: z.iso.datetime().optional(),
});

export function branchResultAtDone({
  branchResult,
  doneAt,
}: {
  readonly branchResult?: SessionBranchResult | undefined;
  readonly doneAt?: string | undefined;
}): SessionBranchResult | undefined {
  return branchResult?.doneAt === doneAt ? branchResult : undefined;
}
