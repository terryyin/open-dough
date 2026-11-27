// A completed story whose published history Intent overlays on its tests
// (../../../e2e/intent/intent-story-completed.spec.ts): trunk publishes Intent
// locations (./intentStoryWorktree.ts), Story A completes through a declared
// history with Intent test changes, and trunk advances past the completion so
// Intent's published revision is neither side of the compared revisions. Its
// Recently done card is selected by an empty-area click, and Intent shown.

import type { Page } from "@playwright/test";
import type { IntentCoverage } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { RevisionFacts } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { writeRevisionFiles } from "../../../Distribution/tests/support/repository-revision-files.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { intentTrunkCompletionOntoTip } from "./intentCompletedHistory.ts";
import { publishIntentTrunk } from "./intentStoryWorktree.ts";
import { selectDoneStoryInIntent } from "./selectDoneStoryInIntent.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { publishDeclaredTrunk } from "./storyCiComparisonBaseline.ts";
import { shallowPublishedHistory } from "./reviewRepositoryFixture.ts";
import { push } from "./storyReviewTrunkCommits.ts";

// The completed story's test changes as Review changes names each file's
// control.
export const completedChanges = {
  modified: "Modified dashboard/tests/a.spec.ts",
  added: "Added dashboard/tests/boundary/b.spec.ts",
  deleted: "Deleted dashboard/tests/gone.spec.ts",
} as const;

// `history` "shallow" leaves the project's checkout and Review repository with
// only trunk's last commit, so the published comparison cannot be recovered.
// `beforeIntent` runs once the card is selected, before Intent first reads the
// story.
// `implementation` supplies further story facts; `later` supplies changes
// published on trunk after completion, independently of the historical read.
export async function selectCompletedStoryInIntent(
  page: Page,
  origin: StartOrigin,
  {
    history = "complete",
    intentCoverage,
    beforeIntent,
    beforeStory,
    later,
    implementation,
    interleaved,
  }: {
    readonly history?: "complete" | "shallow";
    readonly intentCoverage?: IntentCoverage;
    readonly beforeIntent?: () => Promise<void>;
    // Further trunk changes after Intent locations, before the story claim.
    readonly beforeStory?: (project: string) => void;
    readonly later?: RevisionFacts;
    readonly implementation?: RevisionFacts;
    readonly interleaved?: boolean;
  } = {},
) {
  publishIntentTrunk(origin.project);
  beforeStory?.(origin.project);
  const publishedCommits = await publishDeclaredTrunk(
    origin,
    intentTrunkCompletionOntoTip({
      intentCoverage,
      interleaved,
      implementation,
      completedTests: true,
      advance: history === "complete",
    }),
  );
  const completion = publishedCommits.completion;
  let published =
    history === "complete"
      ? publishedCommits["advance after completion"]
      : completion;
  if (history === "shallow") shallowPublishedHistory(origin);
  if (later !== undefined) {
    writeRevisionFiles(origin.project, later);
    published = makeMe
      .theWorkspace(origin.project)
      .commitAll("change current tests and settings after landing")
      .please();
    push(origin.project);
  }
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository: "terryyin/open-dough",
    follows: true,
  });
  const { card, intent } = await selectDoneStoryInIntent(
    page,
    "Story A",
    beforeIntent,
  );
  return { card, intent, completion, published };
}
