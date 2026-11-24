// Story A, or `story` as the Take names it, taken in Story Branch Mode by
// Yui's declared Take and the changes published to its assigned branch; its Taken card selected by an empty-area click, and
// Intent shown. Intent opens the story at its CI comparison; this then
// chooses Changes, which the journeys read. The baseline is the claim tree.
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
import { commitAll, git } from "./storyReviewWorktree.ts";

export async function selectTakenStoryInIntent(
  page: Page,
  origin: StartOrigin,
  change: (workspace: string) => void = changeIntentTests,
  // Whether the published trunk follows the origin's main as it moves.
  follows = false,
  story = storyA,
) {
  publishIntentTrunk(origin.project);
  const { workspace, branch, claim } = await origin.publishTake({
    agent: "Yui",
    story,
    queued: [storyB],
    mode: "story-branch",
  });
  change(workspace);
  if (git(workspace, "status", "--porcelain") !== "")
    commitAll(workspace, "add the remaining story files");
  git(workspace, "push", "--quiet", "origin", `HEAD:refs/heads/${branch}`);
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
    baseline: git(workspace, "rev-parse", `${claim}^{tree}`),
    head: git(workspace, "rev-parse", "HEAD"),
  };
}
