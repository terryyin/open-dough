// Follow up from a Done story's Intent → Changed tests Purpose diff: the file
// header offers Follow up, which opens the same Start session dialog with the
// story subject and that file's context. Line-level Follow up:
// owned by slice 4. Review changes journey: ../review/story-review-follow-up.spec.ts.

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
} from "../../dashboard/tests/support/fileFollowUpPage.ts";
import { queuedIdentity } from "../../dashboard/tests/support/startOrigin.ts";

const storyName = `${queuedIdentity} — Story A`;

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
