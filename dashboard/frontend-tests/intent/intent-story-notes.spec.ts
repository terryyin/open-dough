// Built app with explicit Intent and notes substitutes: notes taken from Intent
// → Changed tests keep that view, and Story notes leaves Intent's reading as
// it was (../../src/IntentSelectionReading.tsx).
import { expect, test } from "../../tests/support/frontendApp.ts";
import { selectTakenStoryInIntent } from "../../tests/support/frontendIntentVisits.ts";
import { installFrontendStoryNotes } from "../../tests/support/frontendStoryNotes.ts";
import { storyNotesPage } from "../../tests/support/storyNotesPage.ts";
import {
  answerFrontendIntentChanges,
  putFrontendIntentStory,
} from "../../tests/support/frontendIntentStory.ts";
import {
  chooseStoryTab,
  expectOutsideCount,
  intentDiffReading,
  intentFile,
  outsideCount,
} from "../../tests/support/intentStoryPage.ts";
import {
  intentReadingScroll,
  scrollIntentReadingHalfway,
} from "../../tests/intentReadingPlacePage.ts";
import { openStoryIntent, storySummary } from "../../tests/intentModePage.ts";
import { deepSpec } from "../../tests/support/intentStoryWorktree.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyA } from "../../../Distribution/tests/support/queued-repository.mjs";

test("the Intent story title shows matching Notes and Review changes icons side by side", async ({
  page,
  frontendServices,
}) => {
  const { intent } = await selectTakenStoryInIntent(page, frontendServices);
  await storyNotesPage(page).expectIconBeside(
    storySummary(intent),
    outsideCount(intent),
  );
});

test("the unreadable Notes warning leaves both icons beside a long Intent story title", async ({
  page,
  frontendServices,
}) => {
  const title = "Story A shows a long title beside its review and notes";
  putFrontendIntentStory(frontendServices, {
    story: makeMe.aBacklogEntry.with({ ...storyA, title }).please(),
  });
  await answerFrontendIntentChanges(page);
  const service = await installFrontendStoryNotes(page);
  service.unreadable("open-dough");
  const { intent } = await openStoryIntent(page, title);
  await chooseStoryTab(intent, "Changed tests");
  await page.setViewportSize({ width: 420, height: 720 });
  const summary = storySummary(intent);
  const notes = storyNotesPage(page);
  await notes.expectUnreadable(summary, "The notes could not be read.");
  await expectOutsideCount(intent, 2);
  await notes.expectIconBeside(summary, outsideCount(intent));
});

test("a line note from Intent Changed tests records the Intent view", async ({
  page,
  frontendServices,
}) => {
  const service = await installFrontendStoryNotes(page);
  const { intent } = await selectTakenStoryInIntent(page, frontendServices);
  await intentFile(intent, deepSpec).click();
  const reading = intentDiffReading(intent);
  await expect(reading.name).toHaveText(deepSpec);
  const notes = storyNotesPage(page);
  await notes.fromLine(reading.container, "new", 13);
  await notes.expectComposerContext([
    "Intent → Changed tests",
    "Line 13 · new",
  ]);
  await notes.saveDiffNote("Intent observation");
  expect(service.changes()[0]).toMatchObject({
    action: "add",
    context: {
      view: "Intent → Changed tests",
      path: deepSpec.replace(/^Added /, ""),
      line: { number: 13, side: "new" },
    },
  });
});

test("Notes from Intent keeps the selected file's reading and returns focus", async ({
  page,
  frontendServices,
}) => {
  await installFrontendStoryNotes(page);
  const { intent } = await selectTakenStoryInIntent(page, frontendServices);
  await intentFile(intent, deepSpec).click();
  const reading = intentDiffReading(intent);
  await expect(reading.name).toHaveText(deepSpec);
  await expect(reading.code).toHaveAttribute("aria-busy", "false");
  const offset = await scrollIntentReadingHalfway(intent);
  expect(offset).toBeGreaterThan(0);
  const summary = storySummary(intent);
  const notes = storyNotesPage(page);
  await notes.open(summary, "keyboard");
  await notes.expectContext(storyA.title, storyA.identity);
  await notes.close();
  await notes.expectOpenerFocused(summary);
  await expect(reading.name).toHaveText(deepSpec);
  expect(await intentReadingScroll(intent)).toBe(offset);
});
