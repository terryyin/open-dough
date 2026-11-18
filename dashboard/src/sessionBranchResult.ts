// A launch records its branch entry and the branch result for a particular Done.
import { z } from "zod";
import { commitIdSchema } from "./launchLanding.ts";
import {
  sessionHostSchema,
  type SessionReference,
} from "./sessionReference.ts";

export const sessionBranchEntryEndpoint = "/__agent-launch/branch-entry";

const branchTrunkSchema = z.object({
  remote: z.string().min(1),
  target: z.string().startsWith("refs/heads/"),
  revision: commitIdSchema.optional(),
});
export type BranchTrunk = z.infer<typeof branchTrunkSchema>;

export const sessionBranchEntrySchema = z.object({
  repository: z.string().min(1),
  workspace: z.string().min(1),
  branch: z.string().min(1),
  committedTip: commitIdSchema,
  tree: commitIdSchema,
  defaultTip: commitIdSchema.optional(),
  trunk: branchTrunkSchema.optional(),
});
export type SessionBranchEntry = z.infer<typeof sessionBranchEntrySchema>;

export const sessionBranchResultSchema = z.object({
  repository: z.string().min(1),
  doneAt: z.iso.datetime(),
  base: commitIdSchema,
  revision: commitIdSchema,
  committedTip: commitIdSchema,
  attributionGap: z.string().min(1).optional(),
});
export type SessionBranchResult = z.infer<typeof sessionBranchResultSchema>;

export const sessionBranchEvidenceSchema = z.object({
  branchReviewRepository: z.string().min(1).optional(),
  branchEntry: sessionBranchEntrySchema.optional(),
  branchResult: sessionBranchResultSchema.optional(),
  branchResultFailedAt: z.iso.datetime().optional(),
  // Existing pins keep their owner when recovery replaces the native session.
  branchEvidenceOwner: z
    .object({
      host: sessionHostSchema,
      sessionId: z.string().min(1),
    })
    .optional(),
});

type BranchEvidence = z.infer<typeof sessionBranchEvidenceSchema>;

export function keptBranchEvidence(record: BranchEvidence) {
  return {
    branchEntry: record.branchEntry,
    branchResult: record.branchResult,
    branchResultFailedAt: record.branchResultFailedAt,
    branchEvidenceOwner: record.branchEvidenceOwner,
  };
}

export function branchPinOwner(
  record: BranchEvidence & { readonly session: SessionReference },
): SessionReference {
  const { host, sessionId } = record.branchEvidenceOwner ?? record.session;
  return { host, sessionId };
}

export function branchResultAtDone({
  branchResult,
  doneAt,
}: {
  readonly branchResult?: SessionBranchResult | undefined;
  readonly doneAt?: string | undefined;
}): SessionBranchResult | undefined {
  return branchResult?.doneAt === doneAt ? branchResult : undefined;
}
