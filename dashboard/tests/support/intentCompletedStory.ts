// A completed story whose published history Intent overlays on its tests
// (../intent/intent-story-completed.spec.ts): trunk publishes Intent locations
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
import { showColumn } from "../boardPage.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { parts } from "../dashboardPage.ts";
import { expect } from "../dashboardTest.ts";
import { expectSelected } from "../storyCardSelection.ts";
import {
  advanceCompletedTrunk,
  completedPublishedStory,
} from "./completedPublishedStory.ts";
import { publishIntentTrunk } from "./intentStoryWorktree.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { git, lines, writeAt } from "./storyReviewWorktree.ts";

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
export async function selectCompletedStoryInIntent(
  page: Page,
  origin: StartOrigin,
  {
    history = "complete",
    intentCoverage,
    beforeIntent,
  }: {
    readonly history?: "complete" | "shallow";
    readonly intentCoverage?: IntentCoverage;
    readonly beforeIntent?: () => Promise<void>;
  } = {},
) {
  publishIntentTrunk(origin.project);
  const { completion } = await completedPublishedStory(
    origin,
    "trunk",
    undefined,
    changeCompletedTests,
    undefined,
    { intentCoverage },
  );
  if (history === "complete") advanceCompletedTrunk(origin);
  else git(origin.project, "fetch", "--quiet", "--depth=1", "origin", "main");
  const published = git(origin.origin, "rev-parse", "main");
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  await showColumn(page, "Recently done");
  const { recentlyDone, intentChoice, intent } = parts(page);
  const card = recentlyDone.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await card.getByRole("heading", { level: 3 }).click();
  await expectSelected(card, true);
  await beforeIntent?.();
  await intentChoice.click();
  await expect(intent).toBeVisible();
  return { card, intent, completion, published };
}
