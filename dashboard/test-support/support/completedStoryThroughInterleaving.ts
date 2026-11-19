// Shared completed-story prefix through the interleaving writer: claim,
// implementation, and another writer's interleaving on trunk or the story
// branch. Ordinary, foreign-merge, and later own-merge histories compose on it.
import { agentIdentity } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  completionRevision,
  queuedReadyRepository,
  storyA,
  storyB,
  takeRevision,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import type { RepositoryBuilder } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { dashboardDeveloper } from "./startOriginPreparation.ts";
import { lines } from "./storyReviewWorktree.ts";

export const claimantName = "Yui";
export const claimant = agentIdentity(claimantName);
export const author = { name: claimant.agent, email: claimant.email };
export const storyBranch = "claude/another-agent";
export const developer = dashboardDeveloper.name;
export const implemented = {
  "shared.txt": lines("line").replace("line 0\n", "story first\n"),
  "[literal]*.txt": "delivered on another machine\n",
} as const;
export const interleavedShared = lines("line")
  .replace("line 0\n", "story first\n")
  .replace("line 11\n", "other last\n");
export const trunkWriterShared = lines("line").replace(
  "line 11\n",
  "other last\n",
);
export const otherStory = { "other-story.txt": "another story\n" } as const;
export const interleavedFiles = {
  "shared.txt": interleavedShared,
  ...otherStory,
} as const;
export const trunkInterleaved = {
  "shared.txt": trunkWriterShared,
  ...otherStory,
} as const;
export const integrated = { ...implemented, ...interleavedFiles } as const;
export const yuiClaim = (branch?: string) =>
  takeRevision({
    story: storyA,
    queued: [storyB],
    agent: claimantName,
    committer: dashboardDeveloper,
    host: "claude",
    publisher: "another-publisher",
    ...(branch === undefined ? {} : { branch }),
  });
export const yuiCompletion = () =>
  completionRevision({
    story: storyA,
    queued: [storyB],
    developer,
    agent: claimantName,
    host: "claude",
  });
export const implementation = {
  message: "story implementation",
  author,
  files: implemented,
} as const;

export function trunkThroughInterleaving<Name extends string>(
  base: RepositoryBuilder<Name> = queuedReadyRepository() as RepositoryBuilder<Name>,
) {
  return base
    .withRevision("shared", { files: { "shared.txt": lines("line") } })
    .withRevision("claim", yuiClaim())
    .withRevision("implementation", implementation)
    .withRevision("interleaving", {
      message: "another writer interleaves",
      files: interleavedFiles,
    });
}

export function storyBranchThroughInterleaving() {
  return queuedReadyRepository()
    .withRevision("shared", { files: { "shared.txt": lines("line") } })
    .withRevision("claim", yuiClaim(storyBranch))
    .withRevision("implementation", implementation)
    .withRevision("interleaving", {
      parents: ["claim"],
      message: "another writer interleaves",
      files: trunkInterleaved,
    });
}
