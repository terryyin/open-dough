// The first exposed Intent diff action must already save the correct view.
import { parts } from "../../dashboard/tests/dashboardParts.ts";
import { showColumn } from "../../dashboard/tests/boardPage.ts";
import { expandIntentGroup } from "../../dashboard/tests/intentPerspectivePage.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import {
  completedChanges,
  selectCompletedStoryInIntent,
} from "../../dashboard/tests/support/intentCompletedStory.ts";
import {
  chooseStoryTab,
  intentFile,
  intentDiffReading,
} from "../../dashboard/tests/support/intentStoryPage.ts";
import { storyNotesPage } from "../../dashboard/tests/support/storyNotesPage.ts";

test("Intent Changed tests line note keeps its Intent view", async ({
  page,
  origin,
}) => {
  const { intent, card } = await selectCompletedStoryInIntent(page, origin);
  await chooseStoryTab(intent, "Changed tests");
  await expandIntentGroup(intent, "dashboard/tests");
  await intentFile(intent, completedChanges.modified).click();
  const reading = intentDiffReading(intent);
  await expect(reading.name).toHaveText(completedChanges.modified);
  const notes = storyNotesPage(page);
  await notes.fromLine(reading.container, "new", 13);
  await notes.expectComposerContext([
    "Intent → Changed tests",
    "dashboard/tests/a.spec.ts",
    "Published completion",
    "completed",
  ]);
  await notes.type("Intent observation");
  await notes.save();
  await notes.expectDiffSaved();
  await parts(page).development.click();
  await showColumn(page, "Recently done");
  await notes.open(card);
  await notes.expectNotes(["Intent observation"]);
  await notes.expectEntryContext(0, "Intent → Changed tests");
  await notes.expectEntryContext(0, "completed");
});
