// Shared comparison-slot helpers for Intent's CI comparison read
// (`./intentCiComparisonRead.ts`): project-folder lookup context, revision-
// build mapping, and Trunk Mode's not-applicable branch slot.
import type { StoryCiComparisonSlot } from "../src/storyCiComparison.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  revisionLookupOrGap,
  type RevisionBuildSlot,
} from "./baseCiRevisionLookup.ts";
import type { RevisionCiLookup } from "./baseCiRevisionNearest.ts";
import type { BaseCiJudgment } from "./baseCiNearest.ts";
import type { GitCall } from "./gitRunner.ts";
import { projectFolder } from "./projectFolders.ts";

export const trunkBranchNotApplicable = {
  kind: "not-applicable",
  explanation: "Branch comparison is not applicable for a Trunk Mode story.",
} satisfies RevisionBuildSlot;

export async function asComparisonSlot(
  slot: RevisionBuildSlot,
  lookup: RevisionCiLookup,
): Promise<StoryCiComparisonSlot> {
  if (slot.kind !== "build" && slot.kind !== "running")
    return { kind: slot.kind, explanation: slot.explanation };
  const { adapterAttempt } = slot;
  const adapter =
    adapterAttempt === undefined
      ? undefined
      : {
          ...adapterAttempt,
          runId: String(adapterAttempt.runId),
          attemptId: String(adapterAttempt.attemptId),
        };
  if (slot.kind === "build") {
    return {
      ...slot,
      adapterAttempt: adapter,
      timeWithoutRunnerWaits: await lookup.timeWithoutRunnerWaitsOf(slot),
    };
  }
  return {
    kind: "running",
    revision: slot.revision,
    subject: slot.subject,
    selection: slot.selection,
    laterWithoutResult: slot.laterWithoutResult,
    runUrl: slot.runUrl,
    runId: slot.runId,
    runAttempt: slot.runAttempt,
    ...(adapter === undefined
      ? {}
      : { adapterAttempt: adapter, runBranch: slot.runBranch }),
  };
}

export function gapFromUnread(judgment: BaseCiJudgment): StoryCiComparisonSlot {
  const reason =
    "reason" in judgment && typeof judgment.reason === "string"
      ? judgment.reason
      : "The CI could not be read";
  return { kind: "unavailable", explanation: reason };
}

export async function lookupContext(
  source: PublishedSource,
  signal: AbortSignal,
  storyBranch: string | undefined,
): Promise<
  | {
      readonly call: GitCall;
      readonly lookupOrGap: Awaited<ReturnType<typeof revisionLookupOrGap>>;
    }
  | { readonly unavailable: string }
> {
  let folder: ReturnType<typeof projectFolder>;
  try {
    folder = projectFolder(source);
  } catch (error) {
    return {
      unavailable:
        error instanceof Error ? error.message : "No configured project folder",
    };
  }
  const call: GitCall = {
    cwd: folder.path,
    signal,
    maxBuffer: 64 * 1024 * 1024,
  };
  return {
    call,
    lookupOrGap: await revisionLookupOrGap(
      source,
      folder.path,
      call,
      signal,
      storyBranch,
    ),
  };
}

export function isUnreadJudgment(
  value: Awaited<ReturnType<typeof revisionLookupOrGap>>,
): value is BaseCiJudgment {
  return "state" in value;
}
