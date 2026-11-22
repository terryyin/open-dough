// Story A, or `story` as the Take names it, taken in Story Branch Mode by
// Yui's declared Take, its worktree changing the tests Intent publishes, or
// as `change` changes it; its Taken card selected by an empty-area click, and
// Intent shown. Intent opens the story at its CI comparison; this then
// chooses Changes, which the journeys read. The baseline is the claim,
// where the worktree meets trunk; the head is the worktree's last commit.
// What those journeys then read of Intent: ./intentStoryPage.ts.

import { expect, type Page } from "@playwright/test";
import {
  storyA,
  storyB,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { parts } from "../dashboardPage.ts";
import { chooseStoryTab, expectStoryTab } from "../intentModePage.ts";
import { expectSelected } from "../storyCardSelection.ts";
import {
  changeIntentTests,
  publishIntentTrunk,
} from "./intentStoryWorktree.ts";
import { expectStoryComparisonRead } from "./intentStoryPage.ts";
import { openBacklog } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { git } from "./storyReviewWorktree.ts";

export async function selectTakenStoryInIntent(
  page: Page,
  origin: StartOrigin,
  change: (workspace: string) => void = changeIntentTests,
  // Whether the published trunk follows the origin's main as it moves.
  follows = false,
  story = storyA,
) {
  publishIntentTrunk(origin.project);
  const { workspace } = await origin.publishTake({
    agent: "Yui",
    story,
    queued: [storyB],
    mode: "story-branch",
  });
  change(workspace);
  await openBacklog(page, origin, follows);
  const { taken, intentChoice, intent } = parts(page);
  const card = taken.getByRole("article", { name: story.title });
  await card.getByRole("heading", { level: 3 }).click();
  await expectSelected(card, true);
  await intentChoice.click();
  await expect(intent).toBeVisible();
  await expectStoryTab(intent, "CI comparison");
  await chooseStoryTab(intent, "Changes");
  await expectStoryComparisonRead(intent);
  return {
    card,
    intent,
    workspace,
    baseline: (await origin.originGit("rev-parse", "main")).trim(),
    head: git(workspace, "rev-parse", "HEAD"),
  };
}
