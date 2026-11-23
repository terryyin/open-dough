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
import { intentSettingsText } from "../../dashboard/test-support/support/intentSettingsFile.ts";
import { intentReviewFiles } from "../../dashboard/test-support/intentReviewFiles.ts";
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
  writeAt,
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
const firstFile = "Added z-tests/nested/first.spec.ts";

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
  writeAt(
    workspace,
    "z-tests/nested/first.spec.ts",
    "first in the displayed tree\n",
  );
  writeAt(
    workspace,
    "a-tests/second.spec.ts",
    "second in the displayed tree\n",
  );
  await page.setViewportSize({ width: 1920, height: 900 });
  await openBacklog(page, origin);
  await showColumn(page, "Taken");
  const { intent, board, taken, development, intentChoice } = parts(page);
  const card = taken.getByRole("article", { name: "Story A", exact: true });
  const files = intentReviewFiles(intent);
  await emptyArea(card).click();
  await intentChoice.click();
  await expectStoryTab(intent, "CI comparison");
  await chooseStoryTab(intent, "Changes");
  await files.expectNoSelection();
  await files.collapseFolder("nested");
  await files.collapseLocation("z-tests");
  await development.click();

  await openTerminalControl(card).click();
  const terminal = terminalPanel(page);
  await expect(terminal).toContainText(`attached ${session.slice(0, 8)}`);
  const attached = dashboard.claudeAttaches();

  await reviewChanges(card).press("Enter");
  await expect(intent).toBeVisible();
  await expect(intent).toHaveAttribute("data-selected-story", queuedIdentity);
  await expectStoryTab(intent, "Changes");
  await expect(storyTab(intent, "Changes")).toBeFocused();
  await files.expectSelected(firstFile);
  const reading = intentDiffReading(intent);
  await expect(reading.name).toHaveText(firstFile);
  await expect(reading.container).toContainText("first in the displayed tree");
  await expect(storyTab(intent, "Changes")).toBeFocused();
  await expect(terminal).toContainText(`attached ${session.slice(0, 8)}`);
  await page.goBack();
  await expect(board).toBeVisible();
  await expectSelected(card, true);
  await expect(terminal).toContainText(`attached ${session.slice(0, 8)}`);
  expect(dashboard.claudeAttaches()).toEqual(attached);

  const review = await openIntentReviewChanges(page, card);
  const inputPaths = review.snapshot.files.map(({ path }) => path);
  expect(
    inputPaths.filter((path) =>
      [
        "a-tests/second.spec.ts",
        "story.txt",
        "z-tests/nested/first.spec.ts",
      ].includes(path),
    ),
  ).toEqual([
    "a-tests/second.spec.ts",
    "story.txt",
    "z-tests/nested/first.spec.ts",
  ]);
  await review.comparison.expectChosen("All changes");
  await review.files.expectOutsideFiles(fileNames.length, fileNames);
  await review.files.choose("Added story.txt");
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
  await review.files.expectSelected("Added story.txt");
  await review.comparison.expectChosen("All changes");
  await expect(reading.name).toHaveText("Added story.txt");

  await chooseStoryTab(intent, "Intent coverage");
  await development.click();
  await openIntentReviewChanges(page, card);
  await expectStoryTab(intent, "Changes");
  await review.files.expectSelected("Added story.txt");
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
