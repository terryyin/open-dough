// Shared comparison-slot helpers for Intent's CI comparison read
// (`./intentCiComparisonRead.ts`): project-folder lookup context, revision-
// build mapping, and Trunk Mode's not-applicable branch slot.
import type { StoryCiComparisonSlot } from "../src/storyCiComparison.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  revisionLookupOrGap,
  type RevisionBuildSlot,
} from "./baseCiRevisionLookup.ts";
import type { BaseCiJudgment } from "./baseCiNearest.ts";
import type { GitCall } from "./gitRunner.ts";
import { projectFolder } from "./projectFolders.ts";

export const trunkBranchNotApplicable: StoryCiComparisonSlot = {
  kind: "not-applicable",
  explanation: "Branch comparison is not applicable for a Trunk Mode story.",
};

export function asComparisonSlot(
  slot: RevisionBuildSlot,
): StoryCiComparisonSlot {
  if (slot.kind === "build") {
    return {
      kind: "build",
      revision: slot.revision,
      subject: slot.subject,
      state: slot.state,
      selection: slot.selection,
      laterWithoutResult: slot.laterWithoutResult,
      ...(slot.runUrl === undefined ? {} : { runUrl: slot.runUrl }),
      ...(slot.runBranch === undefined ? {} : { runBranch: slot.runBranch }),
      ...(slot.runId === undefined ? {} : { runId: slot.runId }),
      ...(slot.runAttempt === undefined ? {} : { runAttempt: slot.runAttempt }),
      ...(slot.startedAt === undefined ? {} : { startedAt: slot.startedAt }),
      ...(slot.completedAt === undefined
        ? {}
        : { completedAt: slot.completedAt }),
    };
  }
  if (slot.kind === "running") {
    return {
      kind: "running",
      revision: slot.revision,
      subject: slot.subject,
      selection: slot.selection,
      laterWithoutResult: slot.laterWithoutResult,
      ...(slot.runUrl === undefined ? {} : { runUrl: slot.runUrl }),
      ...(slot.runId === undefined ? {} : { runId: slot.runId }),
      ...(slot.runAttempt === undefined ? {} : { runAttempt: slot.runAttempt }),
    };
  }
  return { kind: slot.kind, explanation: slot.explanation };
}

export function gapFromUnread(judgment: BaseCiJudgment): StoryCiComparisonSlot {
  const reason =
    "reason" in judgment && typeof judgment.reason === "string"
      ? judgment.reason
      : "The CI could not be read";
  return { kind: "unavailable", explanation: reason };
}

export function lookupContext(
  source: PublishedSource,
  signal: AbortSignal,
):
  | {
      readonly call: GitCall;
      readonly lookupOrGap: ReturnType<typeof revisionLookupOrGap>;
    }
  | { readonly unavailable: string } {
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
    lookupOrGap: revisionLookupOrGap(source, folder.path, call, signal),
  };
}

export function isUnreadJudgment(
  value: ReturnType<typeof revisionLookupOrGap>,
): value is BaseCiJudgment {
  return "state" in value;
}
