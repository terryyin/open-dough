// Branch evidence belongs to one Done on the launch record.
import { z } from "zod";
import { commitIdSchema } from "./launchLanding.ts";

export const sessionBranchResultSchema = z.object({
  repository: z.string().min(1),
  doneAt: z.iso.datetime(),
  base: commitIdSchema,
  revision: commitIdSchema,
  committedTip: commitIdSchema,
});
export type SessionBranchResult = z.infer<typeof sessionBranchResultSchema>;

export function branchResultAtDone({
  branchResult,
  doneAt,
}: {
  readonly branchResult?: SessionBranchResult | undefined;
  readonly doneAt?: string | undefined;
}): SessionBranchResult | undefined {
  return branchResult?.doneAt === doneAt ? branchResult : undefined;
}
