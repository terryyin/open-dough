// Intent's story CI comparison read for the local authenticated read
// boundary (`./authenticatedRead.ts`): `intent=ci-comparison` with one story
// `identity`. Resolves baseline, branch and landed endpoints from published
// history and CI lookups by revision. Malformed identities are refused here
// before any `gh` or Git call. A done story's completed answer is remembered
// for this process (`./intentCiComparisonAnswers.ts`).

import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import type {
  StoryCiComparisonAnswer,
  StoryCiComparisonSlot,
} from "../src/storyCiComparison.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  lookupBaselineBuild,
  lookupResultBuild,
  revisionLookupOrGap,
  type RevisionBuildSlot,
} from "./baseCiRevisionLookup.ts";
import type { BaseCiJudgment } from "./baseCiNearest.ts";
import { runGit, type GitCall } from "./gitRunner.ts";
import {
  ciComparisonAnswerKey,
  keptCiComparisonAnswer,
  rememberCiComparisonAnswer,
} from "./intentCiComparisonAnswers.ts";
import {
  parseIntentCiComparisonRead,
  type IntentCiComparisonRead,
} from "./intentCiComparisonParse.ts";
import { projectFolder } from "./projectFolders.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import { publishedStoryEndpoints } from "./storyPublishedEndpoints.ts";

export type { IntentCiComparisonRead, StoryCiComparisonAnswer };
export { parseIntentCiComparisonRead };

const trunkBranchNotApplicable: StoryCiComparisonSlot = {
  kind: "not-applicable",
  explanation: "Branch comparison is not applicable for a Trunk Mode story.",
};

function asComparisonSlot(slot: RevisionBuildSlot): StoryCiComparisonSlot {
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

function gapFromUnread(judgment: BaseCiJudgment): StoryCiComparisonSlot {
  const reason =
    "reason" in judgment && typeof judgment.reason === "string"
      ? judgment.reason
      : "The CI could not be read";
  return { kind: "unavailable", explanation: reason };
}

export function readingIntentCiComparisonOf(
  source: PublishedSource,
  read: IntentCiComparisonRead,
): string {
  return `the CI comparison of ${read.identity} of ${source.repository}`;
}

export async function performIntentCiComparisonRead(
  source: PublishedSource,
  read: IntentCiComparisonRead,
  signal: AbortSignal,
): Promise<Outcome> {
  const key = ciComparisonAnswerKey(source.repository, read.identity);
  const kept = keptCiComparisonAnswer(key);
  if (kept !== undefined) return answered(kept);

  const bound = AbortSignal.timeout(readWaitLimitMs);
  const controller = AbortSignal.any([bound, signal]);
  const checkedAt = new Date().toISOString();
  const endpoints = await publishedStoryEndpoints(
    source,
    read.identity,
    controller,
  );
  if (endpoints.kind === "absent") {
    const answer: StoryCiComparisonAnswer = {
      kind: "unavailable",
      identity: read.identity,
      explanation: `${read.identity} has no published completion record.`,
      checkedAt,
    };
    rememberCiComparisonAnswer(key, answer);
    return answered(answer);
  }
  if (endpoints.kind === "unavailable") {
    const answer: StoryCiComparisonAnswer = {
      kind: "unavailable",
      identity: read.identity,
      explanation: endpoints.explanation,
      checkedAt,
    };
    rememberCiComparisonAnswer(key, answer);
    return answered(answer);
  }
  const { facts } = endpoints;
  const folder = projectFolder(source);
  const call: GitCall = {
    cwd: folder.path,
    signal: controller,
    maxBuffer: 64 * 1024 * 1024,
  };
  // Ensure the completion objects are present locally after fetch.
  await runGit(["rev-parse", "--verify", `${facts.completion}^{commit}`], call);
  const lookupOrGap = revisionLookupOrGap(
    source,
    folder.path,
    call,
    controller,
  );
  if (isUnreadJudgment(lookupOrGap)) {
    const gap = gapFromUnread(lookupOrGap);
    const answer: StoryCiComparisonAnswer = {
      kind: "comparison",
      identity: facts.identity,
      mode: facts.mode,
      completion: facts.completion,
      storyStart: facts.storyStart,
      checkedAt,
      baseline: gap,
      branch: facts.mode === "trunk" ? trunkBranchNotApplicable : gap,
      landed: gap,
    };
    rememberCiComparisonAnswer(key, answer);
    return answered(answer);
  }
  const lookup = lookupOrGap;

  const baseline = asComparisonSlot(
    await lookupBaselineBuild(facts.storyStart, lookup, call),
  );
  const branch: StoryCiComparisonSlot =
    facts.mode === "trunk"
      ? trunkBranchNotApplicable
      : facts.landing === undefined
        ? {
            kind: "none",
            explanation:
              "Published history does not name a landing merge for this story's branch result.",
          }
        : asComparisonSlot(
            await lookupResultBuild(
              facts.landing.branchSide,
              facts.storyStart,
              lookup,
              call,
              "No completed CI build was found at the final branch revision or a later story-side ancestor within the story's start bound.",
            ),
          );
  const landed = asComparisonSlot(
    await lookupResultBuild(
      facts.completion,
      facts.storyStart,
      lookup,
      call,
      "No completed CI build was found at the completion revision or a later trunk ancestor within the story's start bound.",
    ),
  );

  const answer: StoryCiComparisonAnswer = {
    kind: "comparison",
    identity: facts.identity,
    mode: facts.mode,
    completion: facts.completion,
    storyStart: facts.storyStart,
    checkedAt,
    baseline,
    branch,
    landed,
  };
  rememberCiComparisonAnswer(key, answer);
  return answered(answer);
}

function isUnreadJudgment(
  value: ReturnType<typeof revisionLookupOrGap>,
): value is BaseCiJudgment {
  return "state" in value;
}
