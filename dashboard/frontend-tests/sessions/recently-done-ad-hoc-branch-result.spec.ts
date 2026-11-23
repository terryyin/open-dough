import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import { sidePanelPages } from "../../test-support/sidePanelPages.ts";
import { test } from "../../test-support/support/frontendApp.ts";
import { openFrontendBoardReview } from "../../test-support/support/frontendRecentlyDoneBoardReview.ts";
import type { FrontendServiceState } from "../../test-support/support/frontendServiceState.ts";
import {
  frontendFileDiff,
  frontendReviewIds,
  installFrontendStoryReview,
} from "../../test-support/support/frontendStoryReview.ts";

async function showDoneSession(
  page: Page,
  services: FrontendServiceState,
  title: string,
  files: Extract<StoryReview, { kind: "branch-result" }>["files"],
) {
  const doneAt = new Date().toISOString();
  const branch = makeMe.aLaunchRecord
    .adHoc({ title })
    .markedDoneAt(doneAt)
    .please();
  const answers = await installFrontendStoryReview(page, {
    kind: "branch-result",
    doneAt,
    baseline: frontendReviewIds.baseline,
    tree: frontendReviewIds.tree,
    files,
  });
  await openFrontendBoardReview(page, services, { doneSessions: [branch] });
  return answers;
}

test("Recently done opens the saved branch comparison and its changed file", async ({
  page,
  frontendServices,
}) => {
  const title = "Save the draft";
  const file = "draft.txt";
  const answers = await showDoneSession(page, frontendServices, title, [
    { kind: "added", path: file },
  ]);
  answers.answerFile(frontendFileDiff(file, ["+draft text"]), file);

  await sidePanelPages(page).phase("open the saved branch", (pages) => {
    const review = pages.board.reviewDoneSession(title);
    review.expectChangedFile("1 changed file", "Added draft.txt");
    pages.reviewToolbar.expectName("Branch at Done");
    review.expectFileDiff("Added draft.txt", "draft text");
  });
});

test("the saved branch comparison explains an empty result", async ({
  page,
  frontendServices,
}) => {
  const title = "Keep the empty branch";
  await showDoneSession(page, frontendServices, title, []);

  await sidePanelPages(page).phase("open the saved branch", (pages) => {
    const review = pages.board.reviewDoneSession(title);
    review.expectBodyText(
      "No changes: the branch at Done matches its starting revision.",
    );
  });
});
