// Follow up from a Done story's Intent → Changed tests Purpose diff: the file
// header offers Follow up, which opens the same Start session dialog with the
// story subject and that file's context. Old line 85's menu starts a blank
// follow-up whose terminal opens and whose first input names that line.
// Review changes journey: ../review/story-review-follow-up.spec.ts.
// Line menu interaction: ../../dashboard/tests/review/story-review-diff-line-follow-up.spec.ts.

import { expandIntentGroup } from "../../dashboard/tests/intentPerspectivePage.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import {
  completedChanges as changed,
  selectCompletedStoryInIntent,
} from "../../dashboard/tests/support/intentCompletedStory.ts";
import {
  chooseStoryTab,
  intentFile,
  intentDiffReading,
} from "../../dashboard/tests/support/intentStoryPage.ts";
import {
  expectFileFollowUpDialog,
  fileFollowUp,
  fileFollowUpDialog,
  startSessionField,
} from "../../dashboard/tests/support/fileFollowUpPage.ts";
import { followUpFromLine } from "../../dashboard/tests/support/diffLineFollowUpPage.ts";
import { queuedIdentity } from "../../dashboard/tests/support/startOrigin.ts";
import {
  commitAll,
  lines,
  writeAt,
} from "../../dashboard/tests/support/storyReviewWorktree.ts";
import { push } from "../../dashboard/tests/support/storyReviewTrunkCommits.ts";
import {
  terminalPanel,
  terminalScreenParts,
} from "../../dashboard/tests/terminalScreenPage.ts";
import { sidePanelContents } from "../../dashboard/tests/support/sidePanelContents.ts";
import { launchWaitMs } from "../../dashboard/tests/support/launchWait.ts";

const storyName = `${queuedIdentity} — Story A`;
const assertion = "await intent.expectLatestTests();";
// Old line 85 is the removed assertion; the story drops it and keeps the tails.
const trunkSpec = `${lines("a", 84)}${assertion}\n${lines("tail", 5)}`;
const storySpec = `${lines("a", 84)}${lines("tail", 5)}`;

test("Intent Changed tests Purpose offers file Follow up and opens the existing dialog with the file context", async ({
  page,
  origin,
}) => {
  const { intent } = await selectCompletedStoryInIntent(page, origin);
  await chooseStoryTab(intent, "Changed tests");
  await expandIntentGroup(intent, "dashboard/tests");
  await intentFile(intent, changed.modified).click();
  const reading = intentDiffReading(intent);
  await expect(reading.name).toHaveText(changed.modified);
  const follow = fileFollowUp(intent, storyName);
  await expect(follow).toBeVisible();
  await follow.click();
  const dialog = fileFollowUpDialog(page);
  await expectFileFollowUpDialog(dialog, storyName, [
    "Path: dashboard/tests/a.spec.ts",
    /Comparison: Published completion [a-f0-9]{40} → [a-f0-9]{40}/,
  ]);
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
});

test("Intent Changed tests old line 85 Follow up starts blank and opens the terminal with that line in the first input", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(60_000);
  dashboard.claudeScenario("launched");
  const { intent } = await selectCompletedStoryInIntent(page, origin, {
    beforeStory: (project) => {
      writeAt(project, "dashboard/tests/a.spec.ts", trunkSpec);
      commitAll(project, "assertion at old line 85");
      push(project);
    },
    implementation: {
      message: "remove the assertion at line 85",
      files: {
        "dashboard/tests/a.spec.ts": storySpec,
      },
    },
  });
  await chooseStoryTab(intent, "Changed tests");
  await expandIntentGroup(intent, "dashboard/tests");
  await intentFile(intent, changed.modified).click();
  const reading = intentDiffReading(intent);
  await expect(reading.name).toHaveText(changed.modified);
  await expect(
    reading.container.getByRole("button", {
      name: "Old line 85",
      exact: true,
    }),
  ).toBeVisible();

  const dialog = await followUpFromLine(
    page,
    reading.container,
    "old",
    85,
    storyName,
    [
      "Path: dashboard/tests/a.spec.ts",
      /Comparison: Published completion [a-f0-9]{40} → [a-f0-9]{40}/,
      "Line: 85",
      "Side: old",
    ],
  );
  await expect(startSessionField(dialog)).toHaveValue("");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
  // The context is not typed text: the terminal opens with the keyboard.
  await expect(terminalScreenParts(terminalPanel(page)).input).toBeFocused({
    timeout: launchWaitMs,
  });
  await expect(sidePanelContents(page)).toHaveAccessibleName("Terminal");
  const [call, ...others] = dashboard.claudeLaunchCalls();
  expect(others).toEqual([]);
  const firstInput = call?.argv.at(3) ?? "";
  expect(firstInput).toContain("- Path: dashboard/tests/a.spec.ts");
  expect(firstInput).toMatch(
    /- Comparison: Published completion [a-f0-9]{40} → [a-f0-9]{40}/,
  );
  expect(firstInput).toContain("- Line: 85");
  expect(firstInput).toContain("- Side: old");
});
