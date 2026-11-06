// A story's CI comparison endpoints: baseline, branch result and landed
// result. Each is a build identity plus how it was selected, or a named gap.
// Shared by the authenticated read (`../server/intentCiComparisonRead.ts`)
// and Intent's homepage. SEED-245 reuses the same endpoints.

import { z } from "zod";

const runIdentity = {
  runId: z.number().int().positive().optional(),
  runAttempt: z.number().int().positive().optional(),
};

const attemptTimes = {
  startedAt: z.iso.datetime().optional(),
  completedAt: z.iso.datetime().optional(),
};

const buildSlot = z.object({
  kind: z.literal("build"),
  revision: z.string().min(1),
  subject: z.string().min(1),
  state: z.enum(["pass", "failed"]),
  selection: z.enum(["exact", "ancestor"]),
  laterWithoutResult: z.number().int().nonnegative(),
  runUrl: z.string().min(1).optional(),
  runBranch: z.string().min(1).optional(),
  ...runIdentity,
  ...attemptTimes,
});

const runningSlot = z.object({
  kind: z.literal("running"),
  revision: z.string().min(1),
  subject: z.string().min(1),
  selection: z.enum(["exact", "ancestor"]),
  laterWithoutResult: z.number().int().nonnegative(),
  runUrl: z.string().min(1).optional(),
  ...runIdentity,
});

const gapSlot = z.object({
  kind: z.enum(["none", "unavailable", "not-applicable", "not-landed"]),
  explanation: z.string().min(1),
});

export const storyCiComparisonSlotSchema = z.discriminatedUnion("kind", [
  buildSlot,
  runningSlot,
  gapSlot,
]);

export type StoryCiComparisonSlot = z.infer<typeof storyCiComparisonSlotSchema>;

export const storyCiComparisonAnswerSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("comparison"),
    identity: z.string().min(1),
    mode: z.enum(["trunk", "story-branch"]),
    completion: z.string().min(1),
    storyStart: z.string().min(1),
    checkedAt: z.iso.datetime(),
    baseline: storyCiComparisonSlotSchema,
    branch: storyCiComparisonSlotSchema,
    landed: storyCiComparisonSlotSchema,
  }),
  z.object({
    kind: z.literal("unavailable"),
    identity: z.string().min(1),
    explanation: z.string().min(1),
    checkedAt: z.iso.datetime(),
  }),
]);

export type StoryCiComparisonAnswer = z.infer<
  typeof storyCiComparisonAnswerSchema
>;
