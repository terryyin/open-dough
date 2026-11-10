// What one recorded trunk landing resolved to under the CI timing
// comparison's Landed rule (`./landedCiResolution.ts`), as this machine's
// landed CI history keeps it (`./landedCiHistoryStore.ts`): its observation
// -- the build it resolved to, by that build's key, and how the build was
// selected for it; a gap with why no build measures it, in the history's own
// final reasons (`../src/landedCiHistory.ts`), and the build the rule named
// for it but could not measure it by, with how that build would have stood
// for it; or, while neither is final, what it waits for and the run attempt
// it waits on -- and that build, kept once by its run and attempt, a CI
// adapter's attempt or, for a build its CI read named neither of, its
// revision. A run attempt keeps its link and identity only as its CI read
// named them, so an observation made again from the same answer equals the
// one read back from the file.

import { z } from "zod";
import { runIdentityShape } from "../src/baseCiConfirmation.ts";
import { ciProofSchema } from "../src/ciProof.ts";
import {
  currentSummaryOf,
  summaryProblems,
} from "../../src/skills/dough-test-optimization/scripts/ci-proof-contract.mjs";
import {
  finalGapReasons,
  historyWallTimeMs,
  pendingWaits,
  provenances,
} from "../src/landedCiHistory.ts";
import { commitIdSchema } from "../src/launchLanding.ts";
import {
  buildSelectionSchema,
  requestedRevisionCiStatusSchema,
} from "../src/storyCiComparison.ts";
import { provenanceOf } from "./landedCiMeasuredBuilds.ts";
import type { FinalSlot, RevisionBuildSlot } from "./revisionBuildSlot.ts";
import type { UnusableBuild } from "./unusableBuild.ts";

// A run attempt as its CI read named it: its link and identity.
const keptRunSchema = z.object({
  runUrl: z.string().min(1).optional(),
  ...runIdentityShape,
});

export type KeptRun = z.infer<typeof keptRunSchema>;

// Stored summaries bypass the upstream readers. Apply their same readable
// contract and canonical conversion locally before the current schema parses.
const retainedProofSchema = z.preprocess((value, context) => {
  if (
    typeof value !== "object" ||
    value === null ||
    !("kind" in value) ||
    value.kind !== "summary" ||
    !("summary" in value)
  )
    return value;
  const problems = summaryProblems(value.summary) as readonly string[];
  if (problems.length > 0) {
    context.addIssue({
      code: "custom",
      message: `Invalid retained CI proof summary: ${problems.join("; ")}`,
    });
    return z.NEVER;
  }
  return { ...value, summary: currentSummaryOf(value.summary) as unknown };
}, ciProofSchema);

// One completed build as its CI read named it.
export const keptBuildSchema = z.object({
  revision: commitIdSchema,
  state: z.enum(["pass", "failed"]),
  ...keptRunSchema.shape,
  runBranch: z.string().min(1).optional(),
  startedAt: z.string().min(1).optional(),
  completedAt: z.string().min(1).optional(),
  proof: retainedProofSchema.optional(),
  // Absent in older records; a classified final answer is not acquired again.
  proofPending: z.boolean().optional(),
});

export type KeptBuild = z.infer<typeof keptBuildSchema>;

// Why no build measures a landing, finally, as the Landed rule answers it:
// each final gap reason but those its kept build gives, a failed build and
// one whose attempt named no CI wall time.
const unmeasuredReasonSchema = z
  .enum(finalGapReasons)
  .exclude(["failed", "not-recorded"]);

// The build the Landed rule named for a landing it could not measure by
// it: its revision, how it would have stood for the landing, and its run
// attempt as its CI read named it.
const namedBuildSchema = z.object({
  revision: commitIdSchema,
  provenance: z.enum(provenances),
  ...keptRunSchema.shape,
});

// What one landing resolved to: a build, and how that build was selected for
// it, or a gap with why, in the Landed rule's words, and the build it named;
// or, while neither is final, what it waits for.
export const observationSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("build"),
    build: z.string().min(1),
    selection: buildSelectionSchema,
  }),
  z.object({
    kind: z.literal("gap"),
    reason: unmeasuredReasonSchema.default("unclassified"),
    explanation: z.string().min(1),
    requestedStatus: requestedRevisionCiStatusSchema.optional(),
    build: namedBuildSchema.optional(),
    // Set after one reopen attempt under timed wall-time reuse
    // (`./landedCiNoProofReopen.ts`).
    reuseSettled: z.literal(true).optional(),
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
// read or used; that build, with its timing, published none; its own build
// was cancelled or timed out; a confirmed skip found no equivalent build, or
// one without timing; otherwise CI did not build it.
function unmeasuredReasonOf(
  gap: Exclude<FinalResolution, { kind: "build" }>,
): z.infer<typeof unmeasuredReasonSchema> {
  const none = gap.kind === "none" ? gap : undefined;
  const unusableProof = none?.unusableProof;
  if (unusableProof === "expired") return "expired";
  if (unusableProof !== undefined && unusableProof !== "none")
    return "unreadable";
  const named = none?.unusableBuild;
  if (
    unusableProof === "none" &&
    historyWallTimeMs(named?.startedAt, named?.completedAt) !== undefined
  )
    return "no-proof";
  if (none?.cancelled === true || gap.requestedStatus?.kind === "cancelled")
    return "cancelled";
  return gap.requestedStatus?.kind === "skipped" ? "no-equivalent" : "no-build";
}

// The build a gap names, with how it would have stood for its landing.
function namedBuildOf(
  build: UnusableBuild | undefined,
): z.infer<typeof namedBuildSchema> | undefined {
  const provenance =
    build === undefined ? undefined : provenanceOf(build.selection);
  if (build === undefined || provenance === undefined) return undefined;
  return { revision: build.revision, provenance, ...keptRunOf(build) };
}

// One build's key: its run and attempt, a CI adapter's attempt, or, for a
// build its CI read named neither of, its revision.
export function buildKeyOf(
  build: Pick<
    KeptBuild,
    "revision" | "adapterAttempt" | "runId" | "runAttempt"
  >,
) {
  if (build.adapterAttempt !== undefined)
    return `adapter/${JSON.stringify([String(build.adapterAttempt.runId), String(build.adapterAttempt.attemptId), build.revision])}`;
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
  if (resolution.kind !== "build") {
    const named = namedBuildOf(
      resolution.kind === "none" ? resolution.unusableBuild : undefined,
    );
    return {
      observed: {
        kind: "gap",
        reason: unmeasuredReasonOf(resolution),
        explanation: resolution.explanation,
        ...(resolution.requestedStatus === undefined
          ? {}
          : { requestedStatus: resolution.requestedStatus }),
        ...(named === undefined ? {} : { build: named }),
      },
    };
  }
  const key = buildKeyOf(resolution);
  const { revision, state, runBranch, startedAt, completedAt } = resolution;
  return {
    observed: { kind: "build", build: key, selection: resolution.selection },
    build: [
      key,
      {
        revision,
        state,
        ...keptRunOf(resolution),
        ...(runBranch === undefined ? {} : { runBranch }),
        ...(startedAt === undefined ? {} : { startedAt }),
        ...(completedAt === undefined ? {} : { completedAt }),
      },
    ],
  };
}
