// The selected landing's retained reading contract; no machine or CI runtime.
import { z } from "zod";
import { ciProofSchema } from "./ciProof.ts";
import { priorBuildReferenceSchema } from "./ciPriorBuildReference.ts";
import { followUpRuleSchema } from "./ciFollowUpRule.ts";
import { runUrlSchema } from "./landedCiHistory.ts";

const attemptSchema = z.object({
  revision: z.string(),
  workflowId: z.number(),
  runId: z.number().optional(),
  runAttempt: z.number().optional(),
  runUrl: runUrlSchema.optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  ms: z.number().nonnegative().optional(),
  comparableMs: z.number().nonnegative().optional(),
  completeness: z.string(),
  verdict: z.string(),
  status: z.string().optional(),
  proof: ciProofSchema.optional(),
});
export const ciFollowUpReadingSchema = z.object({
  identity: z.string(),
  at: z.iso.datetime({ offset: true }),
  revision: z.string(),
  repository: z.string(),
  workflow: z.string(),
  workflowId: z.number(),
  requestedAt: z.string(),
  kind: z.enum(["unverified", "progress", "slow", "recovered"]),
  explanation: z.string(),
  submission: z.string(),
  rule: followUpRuleSchema,
  reference: priorBuildReferenceSchema,
  original: attemptSchema,
  repeat: attemptSchema.optional(),
});
export type CiFollowUpReading = z.infer<typeof ciFollowUpReadingSchema>;
export type CiFollowUpAttempt = CiFollowUpReading["original"];
export type FollowUpDestination = {
  readonly identity: string;
  readonly revision: string;
};
