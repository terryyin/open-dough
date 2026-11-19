// Ordinary completed Story A histories for review cases: Trunk Mode and Story
// Branch Mode, declared as named repository revisions. Completion facts come
// from completionRevision. Mid-test later merges that must stay real Git merges
// use laterDeveloperCarriesDoneRecord (not a declared first-parent overlay).
import { agentIdentity } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  completionRevision,
  queuedReadyRepository,
  storyA,
  storyB,
  takeRevision,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import type { StartOrigin } from "./startOrigin.ts";
import { dashboardDeveloper } from "./startOriginPreparation.ts";
import { laterBranchMergesTrunkAndFastForwards } from "./laterStoryMergesTrunk.ts";
import { git, lines } from "./storyReviewWorktree.ts";

const claimantName = "Yui";
const claimant = agentIdentity(claimantName);
const author = { name: claimant.agent, email: claimant.email };
const storyBranch = "claude/another-agent";
const implemented = {
  "shared.txt": lines("line").replace("line 0\n", "story first\n"),
  "[literal]*.txt": "delivered on another machine\n",
} as const;
const interleavedShared = lines("line")
  .replace("line 0\n", "story first\n")
  .replace("line 11\n", "other last\n");
const integrated = {
  ...implemented,
  "shared.txt": interleavedShared,
  "other-story.txt": "another story\n",
} as const;

const yuiClaim = (branch?: string) =>
  takeRevision({
    story: storyA,
    queued: [storyB],
    agent: claimantName,
    committer: dashboardDeveloper,
    host: "claude",
    publisher: "another-publisher",
    ...(branch === undefined ? {} : { branch }),
  });

const yuiCompletion = () =>
  completionRevision({
    story: storyA,
    queued: [storyB],
    developer: dashboardDeveloper.name,
    agent: claimantName,
    host: "claude",
  });

// Ordinary Trunk Mode: claim, Yui's implementation, another writer's
// interleaving on that tip, then the completion with Yui's done record.
export function ordinaryTrunkModeCompletedHistory() {
  return queuedReadyRepository()
    .withRevision("shared", { files: { "shared.txt": lines("line") } })
    .withRevision("claim", yuiClaim())
    .withRevision("implementation", {
      message: "story implementation",
      author,
      files: implemented,
    })
    .withRevision("interleaving", {
      message: "another writer interleaves",
      files: {
        "shared.txt": interleavedShared,
        "other-story.txt": "another story\n",
      },
    })
    .withRevision("completion", yuiCompletion())
    .please();
}

// Ordinary Story Branch Mode: Yui's claim on a branch, implementation,
// interleaved trunk writer from the claim, story merge of trunk, branch-side
// completion, trunk advance, and trunk-first landing authored by Yui.
export function ordinaryStoryBranchCompletedHistory() {
  const trunkWriterShared = lines("line").replace("line 11\n", "other last\n");
  return queuedReadyRepository()
    .withRevision("shared", { files: { "shared.txt": lines("line") } })
    .withRevision("claim", yuiClaim(storyBranch))
    .withRevision("implementation", {
      message: "story implementation",
      author,
      files: implemented,
    })
    .withRevision("interleaving", {
      parents: ["claim"],
      message: "another writer interleaves",
      files: {
        "shared.txt": trunkWriterShared,
        "other-story.txt": "another story\n",
      },
    })
    .withRevision("integration", {
      parents: ["implementation", "interleaving"],
      message: "merge trunk into the story",
      author,
      files: integrated,
    })
    .withRevision("branch completion", { ...yuiCompletion(), author })
    .withRevision("trunk before landing", {
      parents: ["interleaving"],
      message: "trunk advances before story integration",
      files: {
        "shared.txt": trunkWriterShared,
        "other-story.txt": "another story\n",
        "integration-other.txt": "another change before integration\n",
      },
    })
    .withRevision("completion", {
      ...yuiCompletion(),
      parents: ["trunk before landing", "branch completion"],
      author,
      committer: author,
      files: integrated,
    })
    .please();
}

/** Ordinary Trunk and Story Branch completed histories, paired by mode name. */
export function ordinaryCompletedReviewHistories() {
  return [
    ["trunk", ordinaryTrunkModeCompletedHistory()],
    ["story-branch", ordinaryStoryBranchCompletedHistory()],
  ] as const;
}

// After the review was first read: another developer's branch that started
// before completion merges trunk as its second parent and fast-forwards trunk,
// carrying Story A's existing done record onto a new first-parent path. This
// stays a visible mid-test Git action (not a declared starting history).
export function laterDeveloperCarriesDoneRecord(
  origin: StartOrigin,
  completion: string,
) {
  return laterBranchMergesTrunkAndFastForwards(
    origin,
    git(origin.project, "rev-parse", `${completion}^1`),
  );
}
