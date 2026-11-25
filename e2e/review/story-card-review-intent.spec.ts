import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import {
  browseStoryFiles,
  chooseStoryTab,
  expectStoryTab,
} from "../../dashboard/test-support/intentModePage.ts";
import { reviewChanges } from "../../dashboard/test-support/storyCardControls.ts";
import {
  emptyArea,
  expectSelected,
} from "../../dashboard/test-support/storyCardSelection.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import {
  expectIntentReviewFocused,
  expectIntentReviewOpened,
  openIntentReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  intentDiffReading,
  intentStory,
} from "../../dashboard/test-support/support/intentStoryPage.ts";
import { intentSettingsText } from "../../dashboard/test-support/support/intentSettingsFile.ts";
import { intentReviewFiles } from "../../dashboard/test-support/intentReviewFiles.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { listed } from "../../dashboard/test-support/support/sidePanelContents.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import {
  commitAll,
  writeAt,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { push } from "../../dashboard/test-support/support/storyReviewTrunkCommits.ts";
import {
  openTerminalControl,
  terminalPanel,
} from "../../dashboard/test-support/terminalScreenPage.ts";

const firstFile = "Added a-tests/second-folder/second.spec.ts";
const storyFile = "Added story.txt";
const changedFiles = [
  firstFile,
  "Added z-tests/nested/first.spec.ts",
  storyFile,
];

test("the Taken Story card opens the first changed file beside its terminal and Back returns to that card", async ({
  page,
  dashboard,
  origin,
}) => {
  await origin.publishRevision({
    files: {
      ".planning/open-dough.json": intentSettingsText(
        makeMe.intentSettings
          .withLocations(
            makeMe.anIntentLocation
              .at("z-tests")
              .ofKind("typescript", ["**/*.spec.ts"])
              .please(),
            makeMe.anIntentLocation
              .at("a-tests")
              .ofKind("typescript", ["**/*.spec.ts"])
              .please(),
          )
          .please(),
      ),
      "z-tests/kept.spec.ts": "kept first location\n",
      "a-tests/kept.spec.ts": "kept second location\n",
    },
  });
  const { workspace, branch } = await origin.takenInTrunkMode("trunk-review");
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
  writeAt(workspace, "story.txt", "story\n");
  writeAt(
    workspace,
    "z-tests/nested/first.spec.ts",
    "first configured location\n",
  );
  writeAt(
    workspace,
    "a-tests/second-folder/second.spec.ts",
    "first by repository order\n",
  );
  commitAll(workspace, "Publish the story files");
  push(workspace);
  await page.setViewportSize({ width: 1920, height: 900 });
  await openBacklog(page, origin);
  await showColumn(page, "Taken");
  const { intent, board, taken, development, intentChoice } = parts(page);
  const card = taken.getByRole("article", { name: "Story A", exact: true });
  const files = intentReviewFiles(intent);
  await emptyArea(card).click();
  await intentChoice.click();
  await expectStoryTab(intent, "CI comparison");
  await browseStoryFiles(intent);
  await files.expectNoSelection();
  await files.expectChangedFiles(changedFiles);
  await intentStory(intent).expandFolderPath("a-tests/second-folder");
  await files.collapseFolder("second-folder");
  await files.collapseLocation("a-tests");
  await development.click();

  await openTerminalControl(card).click();
  const terminal = terminalPanel(page);
  await expect(terminal).toContainText(`attached ${session.slice(0, 8)}`);
  const attached = dashboard.claudeAttaches();

  await reviewChanges(card).press("Enter");
  await expect(intent).toBeVisible();
  await expect(intent).toHaveAttribute("data-selected-story", queuedIdentity);
  await expectIntentReviewOpened(intent);
  await files.expectSelected(firstFile);
  const reading = intentDiffReading(intent);
  await expect(reading.name).toHaveText(firstFile);
  await expect(reading.container).toContainText("first by repository order");
  await expectIntentReviewFocused(intent);
  await expect(terminal).toContainText(`attached ${session.slice(0, 8)}`);
  await page.goBack();
  await expect(board).toBeVisible();
  await expectSelected(card, true);
  await expect(terminal).toContainText(`attached ${session.slice(0, 8)}`);
  expect(dashboard.claudeAttaches()).toEqual(attached);

  const review = await openIntentReviewChanges(page, card);
  await review.expectText("Published trunk");
  await review.files.expectChangedFiles(changedFiles);
  await expect(review.files.row(storyFile)).toBeVisible();
  await review.files.choose(storyFile);
  await expect(reading.name).toHaveText(storyFile);

  await development.click();
  await expectSelected(card, true);
  await openIntentReviewChanges(page, card);
  await expectIntentReviewOpened(intent);
  await review.files.expectSelected(storyFile);
  await expect(reading.name).toHaveText(storyFile);

  await chooseStoryTab(intent, "Intent coverage");
  await development.click();
  await openIntentReviewChanges(page, card);
  await expectIntentReviewOpened(intent);
  await review.files.expectSelected(storyFile);
  await expect(reading.name).toHaveText(storyFile);

  await development.click();
  await emptyArea(card).click();
  await expectSelected(card, false);
  await emptyArea(card).click();
  await expectSelected(card, true);
  await intentChoice.click();
  await expectStoryTab(intent, "CI comparison");
  await browseStoryFiles(intent);
  await review.files.expectChangedFiles(changedFiles);
  await expect(review.files.row(storyFile)).toBeVisible();
  await expect(terminal).toContainText(`attached ${session.slice(0, 8)}`);
});
