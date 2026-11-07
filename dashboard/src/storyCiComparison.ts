// A story's CI comparison endpoints: baseline, branch result and landed
// result. Each is a build identity plus how it was selected, or a named gap.
// Shared by the authenticated read (`../server/intentCiComparisonRead.ts`),
// Intent's homepage, Summaries and the selected-file reading comparison.

import { z } from "zod";
import { runIdentityShape } from "./baseCiConfirmation.ts";

const runIdentity = {
  ...runIdentityShape,
  adapterAttempt: runIdentityShape.adapterAttempt
    .unwrap()
    .extend({
      runId: z.string(),
      attemptId: z.string(),
    })
    .optional(),
};

const attemptTimes = {
  startedAt: z.iso.datetime().optional(),
  completedAt: z.iso.datetime().optional(),
};

const timeWithoutRunnerWaitsSchema = z.union([
  z.object({ milliseconds: z.number().nonnegative() }),
  z.object({ reason: z.string().min(1) }),
]);

export type CiTimeWithoutRunnerWaits = z.infer<
  typeof timeWithoutRunnerWaitsSchema
>;

// Requested revision's own status when it is not the timed build shown
// (Skipped, Cancelled, or No build with why). Absent when the endpoint's
// build is that revision's own.
export const requestedRevisionCiStatusSchema = z.object({
  kind: z.enum(["skipped", "cancelled", "no-build"]),
  explanation: z.string().min(1),
});

export type RequestedRevisionCiStatus = z.infer<
  typeof requestedRevisionCiStatusSchema
>;

const requestedStatusField = {
  requestedStatus: requestedRevisionCiStatusSchema.optional(),
};

// How the build was selected for its endpoint: the requested revision's own
// (exact), a first-parent ancestor (ancestor), a confirmed skip's equivalent
// build (equivalent), or a later trunk build containing a cancelled landing
// (later). `laterWithoutResult` counts the revisions between the requested
// revision and the build: later revisions passed over for an ancestor, later
// trunk revisions included for a later build.
const selection = z.enum(["exact", "ancestor", "equivalent", "later"]);

export type StoryCiBuildSelection = z.infer<typeof selection>;

const buildSlot = z.object({
  kind: z.literal("build"),
  revision: z.string().min(1),
  subject: z.string().min(1),
  state: z.enum(["pass", "failed"]),
  selection,
  laterWithoutResult: z.number().int().nonnegative(),
  laterRunning: z.literal(true).optional(),
  runUrl: z.string().min(1).optional(),
  runBranch: z.string().min(1).optional(),
  ...runIdentity,
  ...attemptTimes,
  timeWithoutRunnerWaits: timeWithoutRunnerWaitsSchema,
  ...requestedStatusField,
});

const runningSlot = z.object({
  kind: z.literal("running"),
  revision: z.string().min(1),
  subject: z.string().min(1),
  selection,
  laterWithoutResult: z.number().int().nonnegative(),
  runUrl: z.string().min(1).optional(),
  runBranch: z.string().min(1).optional(),
  ...runIdentity,
  ...requestedStatusField,
});

const gapSlot = z.object({
  kind: z.enum(["none", "unavailable", "not-applicable", "not-landed"]),
  explanation: z.string().min(1),
  ...requestedStatusField,
  // A cancelled landing whose later trunk build has not finished yet (the
  // walk stopped at the read trunk head or a running build): the answer is
  // read again rather than remembered.
  awaitingLaterBuild: z.literal(true).optional(),
});

export const storyCiComparisonSlotSchema = z.discriminatedUnion("kind", [
  buildSlot,
  runningSlot,
  gapSlot,
]);

export type StoryCiComparisonSlot = z.infer<typeof storyCiComparisonSlotSchema>;

// Landed slot while a Taken story has not wrapped up (shared by the read and
// homepage wording).
export const notLandedYetExplanation = "The story has not landed yet.";

// Unavailable explanations that Intent hides beside a live judgment: board-
// only Taken fixtures without a recoverable claim, and an unconfigured
// project folder. Real claim/history gaps still show.
export const suppressedBesideJudgmentFragments = [
  "has no published completion record",
  "Unknown configured project",
] as const;

export function suppressesComparisonBesideJudgment(
  explanation: string,
): boolean {
  return suppressedBesideJudgmentFragments.some((fragment) =>
    explanation.includes(fragment),
  );
}

export const storyCiComparisonAnswerSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("comparison"),
    identity: z.string().min(1),
    // Final done answers are remembered; Taken answers are provisional and
    // must not be remembered past a head change.
    phase: z.enum(["done", "taken"]),
    mode: z.enum(["trunk", "story-branch"]),
    // Present for a done story's completion revision; absent while Taken.
    completion: z.string().min(1).optional(),
    storyStart: z.string().min(1),
    checkedAt: z.iso.datetime(),
    baseline: storyCiComparisonSlotSchema,
    branch: storyCiComparisonSlotSchema,
    landed: storyCiComparisonSlotSchema,
    // Taken Trunk Mode: provisional trunk tip beside Branch N/A and Landed
    // not-yet-landed. Absent for Story Branch Mode (provisional is Branch)
    // and for done stories.
    provisional: storyCiComparisonSlotSchema.optional(),
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
