// Shared completion input, including the explicit ordinary Trunk Mode choice.
// completedPublishedStory owns the Take, history and publication sequence.
import type { IntentCoverage } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { writeRevisionFiles } from "../../../Distribution/tests/support/repository-revision-files.mjs";
import { lines } from "./storyReviewWorktree.ts";

export type CompletedStoryOptions = {
  // Ordinary trunk readers do not need a foreign writer interleaving work.
  readonly interleaved?: boolean | undefined;
  // The claim parent already contains shared.txt as lines("line").
  readonly sharedAlreadyReady?: boolean;
  readonly intentCoverage?: IntentCoverage | undefined;
  readonly retainWorkspace?: boolean;
  readonly skillsDirectory?: string;
  // Extra work after integration, before completion publication.
  readonly beforeComplete?: (workspace: string) => void;
};

export function requireUninterleavedTrunkInput(
  mode: "trunk" | "story-branch",
  variant: string | undefined,
  integrate: ((workspace: string) => void) | undefined,
  options: CompletedStoryOptions,
) {
  if (
    mode !== "trunk" ||
    variant !== undefined ||
    integrate !== undefined ||
    options.sharedAlreadyReady === true ||
    options.beforeComplete !== undefined
  )
    throw new Error(
      "Uninterleaved completion input requires ordinary Trunk Mode without variant, integration edits, shared-parent setup or beforeComplete work.",
    );
}

export function writeCompletedStoryImplementation(workspace: string) {
  const implementation = makeMe.aRepository
    .withRevision("implementation", {
      backlog: null,
      files: {
        "shared.txt": lines("line").replace("line 0\n", "story first\n"),
        "[literal]*.txt": "delivered on another machine\n",
      },
    })
    .please().revisions[0];
  writeRevisionFiles(workspace, implementation);
}
