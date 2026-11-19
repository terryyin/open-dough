// Follow-up and review-journey completed histories: ordinary trunk with a
// fresh done stamp for Recently done, rename and expand-context implementation
// edits declared as revision files. Reuses ordinary / foreign shapes.
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import type { RepositoryBuilder } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import {
  renamedBaselineText,
  renamedNewPath,
  renamedOldPath,
  renamedTreeText,
} from "./followUpCompletedFile.ts";
import {
  freshYuiCompletion,
  implemented,
  interleavedFiles,
  implementation,
  trunkThroughInterleaving,
  yuiClaim,
  yuiCompletion,
} from "./completedStoryThroughInterleaving.ts";
import {
  expandContextFile,
  expandContextLines,
  lines,
} from "./storyReviewWorktree.ts";

function throughSharedFiles(files: Record<string, string>) {
  return queuedReadyRepository()
    .withRevision("shared", { files })
    .withRevision("claim", yuiClaim());
}

function completeAfterImplementation(
  base: RepositoryBuilder<string>,
  files: Record<string, string>,
  remove: readonly string[] = [],
  completion = freshYuiCompletion(),
) {
  return base
    .withRevision("implementation", {
      ...implementation,
      files,
      ...(remove.length === 0 ? {} : { remove: [...remove] }),
    })
    .withRevision("interleaving", {
      message: "another writer interleaves",
      files: interleavedFiles,
    })
    .withRevision("completion", completion);
}

export function ordinaryJourneyCompletedHistory() {
  return trunkThroughInterleaving()
    .withRevision("completion", freshYuiCompletion())
    .please();
}

export function renamedFileCompletedHistory() {
  return completeAfterImplementation(
    throughSharedFiles({
      "shared.txt": lines("line"),
      [renamedOldPath]: renamedBaselineText,
    }),
    { ...implemented, [renamedNewPath]: renamedTreeText },
    [renamedOldPath],
    yuiCompletion(),
  ).please();
}

function expandContextCompletedHistory(edited: string) {
  return completeAfterImplementation(
    throughSharedFiles({
      "shared.txt": lines("line"),
      [expandContextFile]: expandContextLines("line", 160),
    }),
    { ...implemented, [expandContextFile]: edited },
  ).please();
}

export function expandContextLineFollowUpHistory() {
  return expandContextCompletedHistory(
    expandContextLines("line", 160)
      .replace("line 54\n", "changed fifty-four\n")
      .replace("line 127\n", "changed one-twenty-seven\n"),
  );
}

export function expandContextAddNoteHistory() {
  return expandContextCompletedHistory(
    expandContextLines("line", 160).replace(
      "line 54\n",
      "changed fifty-four\n",
    ),
  );
}
