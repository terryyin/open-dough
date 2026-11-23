import {
  storyA,
  storyB,
} from "../../Distribution/tests/support/queued-repository.mjs";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import {
  chooseStoryTab,
  expectStoryTab,
  storyTab,
  storySummary,
} from "../../dashboard/test-support/intentModePage.ts";
import { reviewChanges } from "../../dashboard/test-support/storyCardControls.ts";
import {
  emptyArea,
  expectSelected,
} from "../../dashboard/test-support/storyCardSelection.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { intentDiffReading } from "../../dashboard/test-support/support/intentStoryPage.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { listed } from "../../dashboard/test-support/support/sidePanelContents.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/storyAReviewRepository.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import {
  branch,
  git,
  storyWorktree,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import {
  openTerminalControl,
  terminalPanel,
} from "../../dashboard/test-support/terminalScreenPage.ts";

const fileNames = [
  "Added fresh/new.txt",
  "Deleted gone.txt",
  "Modified image.png",
  "Renamed old.txt → new.txt",
  "Modified staged.txt",
  "Added story.txt",
  "Modified unstaged.txt",
];

test("the Taken Story card opens Changes beside its terminal and Back returns to that card", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  const session = dashboard.claudeListsSession({
    name: "Story A",
    cwd: workspace,
    startedAt: Date.now(),
  });
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .executing({ identity: queuedIdentity, title: "Story A" })
      .onStoryBranch({ workspace, branch })
      .inClaudeSession(listed(session))
      .please(),
  ]);
  git(origin.project, "fetch", "--quiet", "origin", "main");
  git(origin.project, "merge", "--ff-only", "origin/main");
  await origin.publishRevision({
    backlog: { taken: [storyA], queued: [storyB] },
  });
  await page.setViewportSize({ width: 1920, height: 900 });
  await openBacklog(page, origin);
  await showColumn(page, "Taken");
  const { intent, board, taken, development, intentChoice } = parts(page);
  const card = taken.getByRole("article", { name: "Story A", exact: true });
  await openTerminalControl(card).click();
  const terminal = terminalPanel(page);
  await expect(terminal).toContainText(`attached ${session.slice(0, 8)}`);
  const attached = dashboard.claudeAttaches();

  await reviewChanges(card).press("Enter");
  await expect(intent).toBeVisible();
  await expect(intent).toHaveAttribute("data-selected-story", queuedIdentity);
  await expectStoryTab(intent, "Changes");
  await expect(storyTab(intent, "Changes")).toBeFocused();
  await expect(terminal).toContainText(`attached ${session.slice(0, 8)}`);
  await page.goBack();
  await expect(board).toBeVisible();
  await expectSelected(card, true);
  await expect(terminal).toContainText(`attached ${session.slice(0, 8)}`);
  expect(dashboard.claudeAttaches()).toEqual(attached);

  const review = await openIntentReviewChanges(page, card);
  await review.comparison.expectChosen("All changes");
  await review.files.expectOutsideFiles(fileNames.length, fileNames);
  await review.files.choose("Added story.txt");
  const reading = intentDiffReading(intent);
  await expect(reading.name).toHaveText("Added story.txt");
  await review.comparison.choose("Commits");
  await review.comparison.expectChosen("Commits");

  await storySummary(intent)
    .getByRole("button", { name: "Project Intent" })
    .click();
  await development.click();
  await expectSelected(card, true);
  await openIntentReviewChanges(page, card);
  await expectStoryTab(intent, "Changes");
  await review.comparison.expectChosen("All changes");
  await expect(reading.name).toHaveText("Added story.txt");

  await chooseStoryTab(intent, "Intent coverage");
  await development.click();
  await openIntentReviewChanges(page, card);
  await expectStoryTab(intent, "Changes");
  await expect(reading.name).toHaveText("Added story.txt");

  await development.click();
  await emptyArea(card).click();
  await expectSelected(card, false);
  await emptyArea(card).click();
  await expectSelected(card, true);
  await intentChoice.click();
  await expectStoryTab(intent, "CI comparison");
  await chooseStoryTab(intent, "Changes");
  await review.comparison.expectChosen("All changes");
  await review.files.expectOutsideFiles(fileNames.length, fileNames);
  await expect(terminal).toContainText(`attached ${session.slice(0, 8)}`);
});
