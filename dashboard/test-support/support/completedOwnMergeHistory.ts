// The story's own declared integration and landing merges for completed-story
// review (conflicted merge edits, plain merge edit, own octopus, conflicted
// completion landing). Ordinary / foreign stay in their modules.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import type { RepositoryBuilder } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import {
  author,
  freshYuiCompletion,
  implemented,
  integrated,
  otherStory,
  storyBranch,
  storyBranchThroughInterleaving,
  trunkWriterShared,
  yuiClaim,
} from "./completedStoryThroughInterleaving.ts";
import { lines } from "./storyReviewWorktree.ts";

const agentOnly = '{"agent":"only"}\n';
const otherProfile = '{"agent":"other"}\n';
const checksBefore = lines("check");
const checksAfter = `${lines("check")}renamed\n`;
const resolvedShared = lines("line")
  .replace("line 0\n", "resolved story and trunk\n")
  .replace("line 11\n", "other last\n");
const trunkFirstShared = lines("line")
  .replace("line 0\n", "trunk first\n")
  .replace("line 11\n", "other last\n");
const completionTrunkShared = lines("line")
  .replace("line 0\n", "completion trunk\n")
  .replace("line 11\n", "other last\n");
const integrationOther = "another change before integration\n";
const mergeResolution = {
  "merge-resolution.txt": "integration edit\n",
} as const;
const ownConflictTip = {
  ...implemented,
  "shared.txt": resolvedShared,
  ...otherStory,
  "profiles/only.json": agentOnly,
  "agents/other.json": otherProfile,
  "checks/after.test.mjs": checksAfter,
  ...mergeResolution,
} as const;

// Trunk-first owning landing: one completion fact, first-parent overlay drops
// trunk-only paths (and any caller `extraRemove`) so the tip matches merge-tree.
export function landStoryBranchOntoTip<Name extends string>(
  throughIntegration: RepositoryBuilder<Name>,
  trunkTip: string,
  trunkFiles: Record<string, string>,
  tipFiles: Record<string, string>,
  extraRemove: readonly string[] = [],
) {
  const done = freshYuiCompletion();
  const trunkLanding = {
    ...trunkFiles,
    "integration-other.txt": integrationOther,
  };
  const removed = [
    ...((done.remove as readonly string[] | undefined) ?? []),
    ...Object.keys(trunkLanding).filter(
      (path) =>
        path !== "integration-other.txt" && !Object.hasOwn(tipFiles, path),
    ),
    ...extraRemove,
  ];
  return throughIntegration
    .withRevision("branch completion", { ...done, author })
    .withRevision("trunk before landing", {
      parents: [trunkTip],
      message: "trunk advances before story integration",
      files: trunkLanding,
    })
    .withRevision("completion", {
      ...done,
      parents: ["trunk before landing", "branch completion"],
      author,
      committer: author,
      files: { ...tipFiles, "integration-other.txt": integrationOther },
      ...(removed.length === 0 ? {} : { remove: removed }),
    });
}

function throughOwnConflictIntegration<Name extends string>(
  base: RepositoryBuilder<Name> = queuedReadyRepository() as RepositoryBuilder<Name>,
) {
  return base
    .withRevision("shared", {
      files: {
        "shared.txt": lines("line"),
        "agents/only.json": agentOnly,
        "checks/before.test.mjs": checksBefore,
      },
    })
    .withRevision("claim", yuiClaim(storyBranch))
    .withRevision("implementation", {
      message: "story implementation",
      author,
      files: { ...implemented, "profiles/only.json": agentOnly },
      remove: ["agents/only.json"],
    })
    .withRevision("interleaving", {
      parents: ["claim"],
      message: "another writer interleaves",
      files: {
        "shared.txt": trunkFirstShared,
        ...otherStory,
        "agents/other.json": otherProfile,
      },
    })
    .withRevision("integration", {
      parents: ["implementation", "interleaving"],
      message: "resolve story integration conflict",
      author,
      files: ownConflictTip,
      remove: ["checks/before.test.mjs"],
    });
}

const ownConflictTrunkLanding = {
  "shared.txt": trunkFirstShared,
  ...otherStory,
  "agents/only.json": agentOnly,
  "agents/other.json": otherProfile,
  "checks/before.test.mjs": checksBefore,
} as const;

export function ownConflictExtraCompletionOntoTip() {
  return landStoryBranchOntoTip(
    throughOwnConflictIntegration(makeMe.aRepository),
    "interleaving",
    ownConflictTrunkLanding,
    ownConflictTip,
  );
}

export function ownConflictExtraCompletedHistory() {
  return landStoryBranchOntoTip(
    throughOwnConflictIntegration(),
    "interleaving",
    ownConflictTrunkLanding,
    ownConflictTip,
  ).please();
}

export function plainMergeEditCompletedHistory() {
  const tip = { ...integrated, ...mergeResolution };
  return landStoryBranchOntoTip(
    storyBranchThroughInterleaving().withRevision("integration", {
      parents: ["implementation", "interleaving"],
      message: "merge trunk into the story",
      author,
      files: tip,
    }),
    "interleaving",
    { "shared.txt": trunkWriterShared, ...otherStory },
    tip,
  ).please();
}

export function ownOctopusCompletedHistory() {
  const tip = { ...integrated, "story-side.txt": "side line\n" };
  return landStoryBranchOntoTip(
    storyBranchThroughInterleaving()
      .withRevision("story-side", {
        parents: ["claim"],
        message: "side line for the story's integration",
        files: { "story-side.txt": "side line\n" },
      })
      .withRevision("integration", {
        parents: ["implementation", "interleaving", "story-side"],
        message: "Merge origin/main and story-side",
        author,
        files: tip,
      }),
    "interleaving",
    { "shared.txt": trunkWriterShared, ...otherStory },
    tip,
  ).please();
}

export function completionConflictCompletedHistory() {
  return storyBranchThroughInterleaving()
    .withRevision("integration", {
      parents: ["implementation", "interleaving"],
      message: "merge trunk into the story",
      author,
      files: integrated,
    })
    .withRevision("branch completion", { ...freshYuiCompletion(), author })
    .withRevision("trunk before landing", {
      parents: ["interleaving"],
      message: "trunk advances before story integration",
      files: {
        "shared.txt": trunkWriterShared,
        ...otherStory,
        "integration-other.txt": integrationOther,
      },
    })
    .withRevision("trunk completion conflict", {
      parents: ["trunk before landing"],
      message: "trunk edits the story line before completion",
      files: { "shared.txt": completionTrunkShared, ...otherStory },
    })
    .withRevision("completion", {
      ...freshYuiCompletion(),
      parents: ["trunk completion conflict", "branch completion"],
      message: "resolve completion integration conflict",
      author,
      committer: author,
      files: {
        ...implemented,
        "shared.txt": resolvedShared,
        ...otherStory,
      },
    })
    .please();
}
