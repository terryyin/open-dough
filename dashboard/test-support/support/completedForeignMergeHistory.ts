// Another writer's declared trunk merges for completed-story review (unrelated /
// non-owning resolutions, foreign octopus, inseparable rewrite). Ordinary /
// takeover / return stay in completedStoryHistory.ts.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { RepositoryBuilder } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import {
  author,
  freshYuiCompletion,
  implemented,
  interleavedFiles,
  interleavedShared,
  integrated,
  otherStory,
  storyBranchThroughInterleaving,
  trunkInterleaved,
  trunkThroughInterleaving,
  trunkWriterShared,
  yuiCompletion,
} from "./completedStoryThroughInterleaving.ts";

function landStoryBranch<Name extends string>(
  throughIntegration: RepositoryBuilder<Name>,
  trunkTip: string,
  tipFiles: Record<string, string>,
  completion = yuiCompletion(),
) {
  return throughIntegration
    .withRevision("branch completion", { ...completion, author })
    .withRevision("trunk before landing", {
      parents: [trunkTip],
      message: "trunk advances before story integration",
      files: {
        ...tipFiles,
        "integration-other.txt": "another change before integration\n",
      },
    })
    .withRevision("completion", {
      ...completion,
      parents: ["trunk before landing", "branch completion"],
      author,
      committer: author,
      files: tipFiles,
    });
}

function foreignConflict<Name extends string>(
  base: RepositoryBuilder<Name>,
  shared: string,
  baseFiles: Record<string, string>,
  unrelated: boolean,
) {
  const [file, branchText, trunkText, resolution] = unrelated
    ? [
        "unrelated.txt",
        "other branch\n",
        "other trunk\n",
        "other story's resolution\n",
      ]
    : [
        "shared.txt",
        shared.replace("line 5\n", "foreign five\n"),
        shared.replace("line 5\n", "trunk five\n"),
        shared
          .replace("line 5\n", "foreign resolution of shared\n")
          .replace("story first\n", "foreign rewrites story\n"),
      ];
  return base
    .withRevision("foreign branch", {
      parents: ["interleaving"],
      message: "another story's branch work",
      files: { ...baseFiles, [file]: branchText },
    })
    .withRevision("foreign trunk", {
      parents: ["interleaving"],
      message: "another story's trunk work",
      files: { ...baseFiles, [file]: trunkText },
    })
    .withRevision("foreign resolution", {
      parents: ["foreign trunk", "foreign branch"],
      message: "resolve another story's conflict",
      files: { ...baseFiles, [file]: resolution },
    });
}

export function unrelatedForeignMergeCompletedHistory() {
  return foreignConflict(
    trunkThroughInterleaving(),
    interleavedShared,
    interleavedFiles,
    true,
  )
    .withRevision("completion", yuiCompletion())
    .please();
}

export function inseparableRewriteCompletedHistory() {
  return trunkThroughInterleaving()
    .withRevision("rewrite story line", {
      message: "rewrite story line",
      files: {
        "shared.txt": interleavedShared.replace(
          "story first\n",
          "other rewrites story\n",
        ),
        ...otherStory,
      },
    })
    .withRevision("completion", yuiCompletion())
    .please();
}

export function foreignOctopusCompletedHistory() {
  const tip = {
    ...integrated,
    "octopus-a.txt": "octopus-a\n",
    "octopus-b.txt": "octopus-b\n",
  };
  return landStoryBranch(
    storyBranchThroughInterleaving()
      .withRevision("octopus-a", {
        parents: ["interleaving"],
        message: "another story's octopus-a work",
        files: { ...trunkInterleaved, "octopus-a.txt": "octopus-a\n" },
      })
      .withRevision("octopus-b", {
        parents: ["interleaving"],
        message: "another story's octopus-b work",
        files: { ...trunkInterleaved, "octopus-b.txt": "octopus-b\n" },
      })
      .withRevision("foreign octopus", {
        parents: ["interleaving", "octopus-a", "octopus-b"],
        message: "Merge octopus-a, octopus-b",
        files: tip,
      })
      .withRevision("integration", {
        parents: ["implementation", "foreign octopus"],
        message: "merge trunk into the story",
        author,
        files: tip,
      }),
    "foreign octopus",
    tip,
  ).please();
}

function nonOwningStoryBranchTip() {
  return {
    ...implemented,
    "shared.txt": interleavedShared.replace(
      "line 5\n",
      "foreign resolution of shared\n",
    ),
    ...otherStory,
  };
}

function nonOwningStoryBranchLanding<Name extends string>(
  base?: RepositoryBuilder<Name>,
  completion = yuiCompletion(),
) {
  const tipFiles = nonOwningStoryBranchTip();
  return landStoryBranch(
    foreignConflict(
      storyBranchThroughInterleaving(base),
      trunkWriterShared,
      trunkInterleaved,
      false,
    ).withRevision("integration", {
      parents: ["implementation", "foreign resolution"],
      message: "merge trunk into the story",
      author,
      files: tipFiles,
    }),
    "foreign resolution",
    tipFiles,
    completion,
  );
}

export function nonOwningStoryBranchCompletionOntoTip() {
  return nonOwningStoryBranchLanding(makeMe.aRepository, freshYuiCompletion());
}

export function nonOwningForeignMergeCompletedHistory(
  mode: "trunk" | "story-branch",
) {
  if (mode === "trunk")
    return foreignConflict(
      trunkThroughInterleaving(),
      interleavedShared,
      interleavedFiles,
      false,
    )
      .withRevision("completion", yuiCompletion())
      .please();
  return nonOwningStoryBranchLanding().please();
}
