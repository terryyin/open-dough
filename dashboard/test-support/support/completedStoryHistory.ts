// Completed Story A histories for review: ordinary Trunk/Story Branch, takeover,
// return, return-then-takeover, and agentless (missing-agent) records.
import { agentIdentity } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { direction } from "../../../Distribution/tests/support/product-backlog-fixture.mjs";
import {
  completionRevision,
  queuedReadyRepository,
  storyA,
  storyB,
  storyPlanPath,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import type { RepositoryBuilder } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import type { StartOrigin } from "./startOrigin.ts";
import { laterBranchMergesTrunkAndFastForwards } from "./laterStoryMergesTrunk.ts";
import {
  author,
  claimant,
  developer,
  integrated,
  otherStory,
  storyBranchThroughInterleaving,
  trunkThroughInterleaving,
  trunkWriterShared,
  yuiCompletion,
} from "./completedStoryThroughInterleaving.ts";
import { git } from "./storyReviewWorktree.ts";

const akihoName = "Akiho";
const akiho = agentIdentity(akihoName);
const akihoAuthor = { name: akiho.agent, email: akiho.email };
const akihoCompletion = () =>
  completionRevision({
    story: storyA,
    queued: [storyB],
    developer,
    agent: akihoName,
    host: "claude",
  });
const agentlessCompletion = () =>
  completionRevision({
    story: storyA,
    queued: [storyB],
    developer,
    agentless: true,
  });
const missingAgentCompletion = () => ({
  ...agentlessCompletion(),
  remove: [`.planning/${claimant.path}`],
});
const storyAWithPlan = () =>
  makeMe.aBacklogEntry
    .with({
      ...storyA,
      plan: { label: "plan", target: storyPlanPath(storyA) },
    })
    .please();
const akihoTakeover = () => ({
  message: "take over the story",
  remove: [`.planning/${claimant.path}`],
  agentProfiles: [
    makeMe.anAgentProfile
      .executing({
        name: akihoName,
        identity: storyA.identity,
        host: "claude",
      })
      .please(),
  ],
  author: akihoAuthor,
});
const takeoverWork = {
  message: "finish after takeover",
  author: akihoAuthor,
  files: { "takeover.txt": "second agent work\n" },
} as const;
const returnReleased = (ownerPath: string) => ({
  message: "return the story and release its execution profile",
  backlog: { direction, queued: [storyAWithPlan(), storyB] },
  remove: [ownerPath],
});

function ordinaryTrunkModeCompletedBuilder<Name extends string>(
  base: RepositoryBuilder<Name>,
) {
  return trunkThroughInterleaving(base).withRevision(
    "completion",
    yuiCompletion(),
  );
}

function storyBranchThroughIntegration() {
  return storyBranchThroughInterleaving().withRevision("integration", {
    parents: ["implementation", "interleaving"],
    message: "merge trunk into the story",
    author,
    files: integrated,
  });
}

function storyBranchLanding(branchCompletion: object) {
  return storyBranchThroughIntegration()
    .withRevision("branch completion", { ...branchCompletion, author })
    .withRevision("trunk before landing", {
      parents: ["interleaving"],
      message: "trunk advances before story integration",
      files: {
        "shared.txt": trunkWriterShared,
        ...otherStory,
        "integration-other.txt": "another change before integration\n",
      },
    })
    .withRevision("completion", {
      ...branchCompletion,
      parents: ["trunk before landing", "branch completion"],
      author,
      committer: author,
      files: integrated,
    });
}

export function ordinaryTrunkModeCompletedHistory() {
  return ordinaryTrunkModeCompletedBuilder(queuedReadyRepository()).please();
}

export function ordinaryTrunkModeCompletionOntoTip() {
  return ordinaryTrunkModeCompletedBuilder(makeMe.aRepository);
}

export function ordinaryStoryBranchCompletedHistory() {
  return storyBranchLanding(yuiCompletion()).please();
}

export function ordinaryCompletedReviewHistories() {
  return [
    ["trunk", ordinaryTrunkModeCompletedHistory()],
    ["story-branch", ordinaryStoryBranchCompletedHistory()],
  ] as const;
}

function throughAkihoTakeoverWork() {
  return trunkThroughInterleaving()
    .withRevision("takeover", akihoTakeover())
    .withRevision("takeover work", takeoverWork);
}

export function takeoverCompletedHistory() {
  return throughAkihoTakeoverWork()
    .withRevision("completion", akihoCompletion())
    .please();
}

export function returnedCompletedHistory() {
  return trunkThroughInterleaving()
    .withRevision("return", returnReleased(`.planning/${claimant.path}`))
    .withRevision("completion", agentlessCompletion())
    .please();
}

export function returnedThenTakeoverCompletedHistory() {
  return throughAkihoTakeoverWork()
    .withRevision("return", returnReleased(`.planning/${akiho.path}`))
    .withRevision("completion", agentlessCompletion())
    .please();
}

export function missingAgentTrunkCompletedHistory() {
  return trunkThroughInterleaving()
    .withRevision("completion", missingAgentCompletion())
    .please();
}

export function missingAgentStoryBranchCompletedHistory() {
  return storyBranchLanding(missingAgentCompletion()).please();
}

export function laterDeveloperCarriesDoneRecord(
  origin: StartOrigin,
  completion: string,
) {
  return laterBranchMergesTrunkAndFastForwards(
    origin,
    git(origin.project, "rev-parse", `${completion}^1`),
  );
}
