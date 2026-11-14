// A completed story whose published history Intent overlays on its tests
// (../../../e2e/intent/intent-story-completed.spec.ts): trunk publishes Intent locations
// (./intentStoryWorktree.ts), Story A is claimed and completed through the
// real CLI (./completedPublishedStory.ts) with its implementation also
// modifying one spec, adding another, and deleting a third, and trunk then
// advances past the completion, so Intent's published revision is neither
// side of the compared revisions. Its Recently done card is selected by an
// empty-area click, and Intent shown.

import type { Page } from "@playwright/test";
import { rmSync } from "node:fs";
import path from "node:path";
import type { IntentCoverage } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { RevisionFacts } from "../../../tests/support/repositoryTestData.mjs";
import { writeRevisionFiles } from "../../../tests/support/repository-revision-files.mjs";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import {
  advanceCompletedTrunk,
  completedPublishedStory,
} from "./completedPublishedStory.ts";
import { publishIntentTrunk } from "./intentStoryWorktree.ts";
import { selectDoneStoryInIntent } from "./selectDoneStoryInIntent.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { commitAll, git, lines, writeAt } from "./storyReviewWorktree.ts";
import { push } from "./storyReviewTrunkCommits.ts";

// The completed story's test changes as Review changes names each file's
// control.
export const completedChanges = {
  modified: "Modified dashboard/tests/a.spec.ts",
  added: "Added dashboard/tests/boundary/b.spec.ts",
  deleted: "Deleted dashboard/tests/gone.spec.ts",
} as const;

function changeCompletedTests(workspace: string) {
  writeAt(workspace, "dashboard/tests/a.spec.ts", `${lines("a")}completed\n`);
  writeAt(workspace, "dashboard/tests/boundary/b.spec.ts", "added\n");
  rmSync(path.join(workspace, "dashboard/tests/gone.spec.ts"));
}

// `history` "shallow" leaves the project's checkout with only trunk's last
// commit, so the published comparison cannot be recovered. `beforeIntent`
// runs once the card is selected, before Intent first reads the story.
// `implementation` supplies further story facts; `later` supplies changes
// published on trunk after completion, independently of the historical read.
export async function selectCompletedStoryInIntent(
  page: Page,
  origin: StartOrigin,
  {
    history = "complete",
    intentCoverage,
    beforeIntent,
    later,
    implementation,
    interleaved,
  }: {
    readonly history?: "complete" | "shallow";
    readonly intentCoverage?: IntentCoverage;
    readonly beforeIntent?: () => Promise<void>;
    readonly later?: RevisionFacts;
    readonly implementation?: RevisionFacts;
    readonly interleaved?: boolean;
  } = {},
) {
  publishIntentTrunk(origin.project);
  const { completion } = await completedPublishedStory(
    origin,
    "trunk",
    undefined,
    (workspace) => {
      changeCompletedTests(workspace);
      if (implementation !== undefined)
        writeRevisionFiles(workspace, implementation);
    },
    undefined,
    { intentCoverage, interleaved },
  );
  if (history === "complete") advanceCompletedTrunk(origin);
  else git(origin.project, "fetch", "--quiet", "--depth=1", "origin", "main");
  if (later !== undefined) {
    writeRevisionFiles(origin.project, later);
    commitAll(
      origin.project,
      "change current tests and settings after landing",
    );
    push(origin.project);
  }
  const published = git(origin.origin, "rev-parse", "main");
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
