// Intent completed-story histories appended onto an existing tip through
// publishDeclaredTrunk: trunk with optional Intent coverage, interleaving,
// implementation files and advance; Story Branch comparison variants.
import type { IntentCoverage } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type {
  RepositoryBuilder,
  RevisionFacts,
} from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { agentWorktree } from "./agentAuthoredWorktree.ts";
import { ordinaryStoryBranchCompletionOntoTip } from "./completedStoryHistory.ts";
import { ownConflictExtraCompletionOntoTip } from "./completedOwnMergeHistory.ts";
import { nonOwningStoryBranchCompletionOntoTip } from "./completedForeignMergeHistory.ts";
import {
  advanceAfterCompletion,
  author,
  claimant,
  freshYuiCompletion,
  implemented,
  interleavedFiles,
  yuiClaim,
} from "./completedStoryThroughInterleaving.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { lines } from "./storyReviewWorktree.ts";

const completedIntentTests = {
  files: {
    "dashboard/tests/a.spec.ts": `${lines("a")}completed\n`,
    "dashboard/tests/boundary/b.spec.ts": "added\n",
  },
  remove: ["dashboard/tests/gone.spec.ts"],
} as const;

function mergeImplementation(
  extra?: RevisionFacts,
  withCompletedTests = false,
): RevisionFacts {
  const baseFiles = {
    ...implemented,
    ...(withCompletedTests ? completedIntentTests.files : {}),
    ...(extra?.files ?? {}),
  };
  const remove = [
    ...(withCompletedTests ? completedIntentTests.remove : []),
    ...(extra?.remove ?? []),
  ];
  return {
    message: "story implementation",
    author,
    files: baseFiles,
    ...(remove.length === 0 ? {} : { remove }),
  };
}

function uninterleavedTrunkCompletion(
  completion: ReturnType<typeof freshYuiCompletion>,
  implementation: RevisionFacts,
) {
  return makeMe.aRepository
    .withRevision("claim", yuiClaim())
    .withRevision("implementation", implementation)
    .withRevision("completion", completion);
}

function interleavedTrunkCompletion(
  completion: ReturnType<typeof freshYuiCompletion>,
  implementation: RevisionFacts,
) {
  return makeMe.aRepository
    .withRevision("shared", { files: { "shared.txt": lines("line") } })
    .withRevision("claim", yuiClaim())
    .withRevision("implementation", implementation)
    .withRevision("interleaving", {
      message: "another writer interleaves",
      files: interleavedFiles,
    })
    .withRevision("completion", completion);
}

// Named revisions Intent trunks publish; advance is optional at runtime but
// kept in the type so publishDeclaredTrunk answers typed claim/completion keys.
type IntentTrunkRevision =
  | "shared"
  | "claim"
  | "implementation"
  | "interleaving"
  | "completion"
  | "advance after completion";

// Ordinary Trunk Mode completion onto the current tip, for Intent overlays.
export function intentTrunkCompletionOntoTip({
  intentCoverage,
  interleaved = true,
  implementation,
  completedTests = false,
  advance = false,
}: {
  readonly intentCoverage?: IntentCoverage | undefined;
  readonly interleaved?: boolean | undefined;
  readonly implementation?: RevisionFacts | undefined;
  readonly completedTests?: boolean | undefined;
  readonly advance?: boolean | undefined;
} = {}): RepositoryBuilder<IntentTrunkRevision> {
  const completion = freshYuiCompletion(
    intentCoverage === undefined ? {} : { intentCoverage },
  );
  const implementedFacts = mergeImplementation(implementation, completedTests);
  const history = interleaved
    ? interleavedTrunkCompletion(completion, implementedFacts)
    : uninterleavedTrunkCompletion(completion, implementedFacts);
  return advance
    ? history.withRevision("advance after completion", advanceAfterCompletion)
    : history;
}

export function comparedStoryBranchCompletionOntoTip(
  variant?: "own-conflict-extra" | "non-owning-story-file",
) {
  if (variant === "own-conflict-extra")
    return ownConflictExtraCompletionOntoTip();
  if (variant === "non-owning-story-file")
    return nonOwningStoryBranchCompletionOntoTip();
  return ordinaryStoryBranchCompletionOntoTip();
}

// Readable retained workspace for a declared Intent completion; callers keep
// launch records or ingest landings against this shape.
export async function retainedDeclaredStoryWorkspace(
  origin: StartOrigin,
  published: { readonly claim: string; readonly completion: string },
  slug: string,
) {
  const workspace = await agentWorktree(
    origin,
    claimant.agent,
    slug,
    published.completion,
  );
  return {
    completion: published.completion,
    claim: published.claim,
    workspace,
    branch: `exec/${slug}`,
    agent: claimant.agent,
    branchSide: published.completion,
  };
}
