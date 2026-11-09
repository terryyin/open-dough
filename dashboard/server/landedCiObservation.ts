// What one recorded trunk landing resolved to under the CI timing
// comparison's Landed rule (`./landedCiResolution.ts`), as this machine's
// landed CI history keeps it (`./landedCiHistoryStore.ts`): its observation
// -- the build it resolved to, by that build's key, and how the build was
// selected for it; a gap with why no build measures it, in the history's own
// final reasons (`../src/landedCiHistory.ts`); or, while neither is final,
// what it waits for -- and that build, kept once by its run and attempt, a
// CI adapter's attempt or, for a build its CI read named neither of, its
// revision. A run attempt keeps its link and identity only as its CI read
// named them, so an observation made again from the same answer equals the
// one read back from the file.

import { z } from "zod";
import { runIdentityShape } from "../src/baseCiConfirmation.ts";
import { finalGapReasons, pendingWaits } from "../src/landedCiHistory.ts";
import { commitIdSchema } from "../src/launchLanding.ts";
import {
  buildSelectionSchema,
  requestedRevisionCiStatusSchema,
} from "../src/storyCiComparison.ts";
import type { FinalSlot, RevisionBuildSlot } from "./revisionBuildSlot.ts";

// A run attempt as its CI read named it: its link and identity.
const keptRunSchema = z.object({
  runUrl: z.string().min(1).optional(),
  ...runIdentityShape,
});

export type KeptRun = z.infer<typeof keptRunSchema>;

// One completed build as its CI read named it.
export const keptBuildSchema = z.object({
  revision: commitIdSchema,
  state: z.enum(["pass", "failed"]),
  ...keptRunSchema.shape,
  startedAt: z.string().min(1).optional(),
  completedAt: z.string().min(1).optional(),
});

export type KeptBuild = z.infer<typeof keptBuildSchema>;

// Why no build measures a landing, finally, as the Landed rule answers it:
// each final gap reason but those its kept build gives, a failed build and
// one whose attempt named no CI wall time.
const unmeasuredReasonSchema = z
  .enum(finalGapReasons)
  .exclude(["failed", "not-recorded"]);

// What one landing resolved to: a build, and how that build was selected for
// it, or a gap with why, in the Landed rule's words; or, while neither is
// final, what it waits for.
export const observationSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("build"),
    build: z.string().min(1),
    selection: buildSelectionSchema,
  }),
  z.object({
    kind: z.literal("gap"),
    reason: unmeasuredReasonSchema,
    explanation: z.string().min(1),
    requestedStatus: requestedRevisionCiStatusSchema.optional(),
  }),
  z.object({
    kind: z.literal("pending"),
    waitsFor: z.enum(pendingWaits),
    // The run attempt it waits on, when there is one.
    run: keptRunSchema.optional(),
  }),
]);

export type Observation = z.infer<typeof observationSchema>;

// What a landing finally resolved to under the Landed rule: a completed
// build, or a gap that no later read changes (`finalSlot`).
type FinalResolution = FinalSlot<RevisionBuildSlot>;

// What a landing waits for while its resolution is not final.
export type PendingResolution = Extract<Observation, { kind: "pending" }>;

// What a landing resolved to now: final, or pending.
export type LandedResolution = FinalResolution | PendingResolution;

// A run attempt's link and identity, each only when its CI read named it.
export function keptRunOf(run: KeptRun): KeptRun {
  const { runUrl, runId, runAttempt, adapterAttempt } = run;
  return {
    ...(runUrl === undefined ? {} : { runUrl }),
    ...(runId === undefined ? {} : { runId }),
    ...(runAttempt === undefined ? {} : { runAttempt }),
    ...(adapterAttempt === undefined ? {} : { adapterAttempt }),
  };
}

// Why no build measures a landing whose final resolution is a gap: the CI
// proof of the build that would have stood for it expired, or could not be
// read or used; its own build was cancelled or timed out; a confirmed skip
// found no equivalent build with CI proof; otherwise CI did not build it.
function unmeasuredReasonOf(
  gap: Exclude<FinalResolution, { kind: "build" }>,
): z.infer<typeof unmeasuredReasonSchema> {
  const unusableProof = gap.kind === "none" ? gap.unusableProof : undefined;
  if (unusableProof === "expired") return "expired";
  if (unusableProof !== undefined && unusableProof !== "none")
    return "unreadable";
  if (
    (gap.kind === "none" && gap.cancelled === true) ||
    gap.requestedStatus?.kind === "cancelled"
  )
    return "cancelled";
  return gap.requestedStatus?.kind === "skipped" ? "no-equivalent" : "no-build";
}

// One build's key: its run and attempt, a CI adapter's attempt, or, for a
// build its CI read named neither of, its revision.
function buildKeyOf(build: Extract<FinalResolution, { kind: "build" }>) {
  if (build.adapterAttempt !== undefined)
    return `attempt/${String(build.adapterAttempt.attemptId)}`;
  if (build.runId !== undefined && build.runAttempt !== undefined)
    return `run/${String(build.runId)}/${String(build.runAttempt)}`;
  return `revision/${build.revision}`;
}

// What `resolution` is kept as: its observation, and the build it resolved
// to with that build's key.
export function keptResolution(resolution: LandedResolution): {
  readonly observed: Observation;
  readonly build?: readonly [string, KeptBuild];
} {
  if (resolution.kind === "pending") return { observed: resolution };
  if (resolution.kind !== "build")
    return {
      observed: {
        kind: "gap",
        reason: unmeasuredReasonOf(resolution),
        explanation: resolution.explanation,
        ...(resolution.requestedStatus === undefined
          ? {}
          : { requestedStatus: resolution.requestedStatus }),
      },
    };
  const key = buildKeyOf(resolution);
  const { revision, state, startedAt, completedAt } = resolution;
  return {
    observed: { kind: "build", build: key, selection: resolution.selection },
    build: [
      key,
      {
        revision,
        state,
        ...keptRunOf(resolution),
        ...(startedAt === undefined ? {} : { startedAt }),
        ...(completedAt === undefined ? {} : { completedAt }),
      },
    ],
  };
}
