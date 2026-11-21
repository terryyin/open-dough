// Built app with explicit Intent and notes substitutes: notes taken from Intent
// → Changes keep that view, saved ones naming Intent → Changed tests still
// read it, and Story notes leaves Intent's reading as it was
// (../../src/IntentSelectionReading.tsx).
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { selectTakenStoryInIntent } from "../../test-support/support/frontendIntentVisits.ts";
import { installFrontendStoryNotes } from "../../test-support/support/frontendStoryNotes.ts";
import { storyNotesPage } from "../../test-support/support/storyNotesPage.ts";
import { frontendFileDiff } from "../../test-support/support/frontendStoryReview.ts";
import {
  answerFrontendIntentChanges,
  putFrontendIntentStory,
} from "../../test-support/support/frontendIntentStory.ts";
import {
  chooseStoryTab,
  intentDiffReading,
  intentStory,
  intentFile,
  storyTitle,
} from "../../test-support/support/intentStoryPage.ts";
import {
  intentReadingScroll,
  scrollIntentReadingHalfway,
} from "../../test-support/intentReadingPlacePage.ts";
import {
  openStoryIntent,
  storySummary,
} from "../../test-support/intentModePage.ts";
import { deepSpec } from "../../test-support/support/intentStoryWorktree.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyA } from "../../../Distribution/tests/support/queued-repository.mjs";

test("the unreadable Notes warning leaves the Notes icon beside a long Intent story title", async ({
  page,
  frontendServices,
}) => {
  const title = "Story A shows a long title beside its notes";
  putFrontendIntentStory(frontendServices, {
    story: makeMe.aBacklogEntry.with({ ...storyA, title }).please(),
  });
  await answerFrontendIntentChanges(page);
  const service = await installFrontendStoryNotes(page);
  service.unreadable("open-dough");
  const { intent } = await openStoryIntent(page, title);
  await chooseStoryTab(intent, "Changes");
  await page.setViewportSize({ width: 420, height: 720 });
  const summary = storySummary(intent);
  const notes = storyNotesPage(page);
  await notes.expectUnreadable(summary, "The notes could not be read.");
  await notes.expectIconBeside(summary, storyTitle(intent));
});

test("a line note from Intent Changes records the Intent view", async ({
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
  await notes.expectComposerContext(["Intent → Changes", "Line 13 · new"]);
  await notes.saveDiffNote("Intent observation");
  expect(service.changes()[0]).toMatchObject({
    action: "add",
    context: {
      view: "Intent → Changes",
      path: deepSpec.replace(/^Added /, ""),
      line: { number: 13, side: "new" },
    },
  });
});

test("a note saved from Intent → Changed tests still reads its view", async ({
  page,
  frontendServices,
}) => {
  const service = await installFrontendStoryNotes(page);
  service.answer("open-dough", {
    [storyA.identity]: [
      makeMe.aStoryNote
        .withText("Older observation")
        .withContext({
          view: "Intent → Changed tests",
          path: "dashboard/src/App.tsx",
          comparison: { name: "Story branch", baseline: "abc", tree: "def" },
        })
        .please(),
    ],
  });
  const { intent } = await selectTakenStoryInIntent(page, frontendServices);
  const notes = storyNotesPage(page);
  await notes.open(storySummary(intent));
  await notes.expectNoteContext("Older observation", "Intent → Changed tests");
});

test("a line note can start from the diff of a file outside Intent locations", async ({
  page,
  frontendServices,
}) => {
  await installFrontendStoryNotes(page);
  putFrontendIntentStory(frontendServices);
  const review = await answerFrontendIntentChanges(page);
  review.answerFile(
    frontendFileDiff("dashboard/src/App.tsx", ["+app change"]),
    "dashboard/src/App.tsx",
  );
  const { intent } = await openStoryIntent(page, "Story A");
  await chooseStoryTab(intent, "Changes");
  const app = "Modified dashboard/src/App.tsx";
  await intentStory(intent).outsideFile(app).click();
  const reading = intentDiffReading(intent);
  await expect(reading.name).toHaveText(app);
  const notes = storyNotesPage(page);
  await notes.fromLine(reading.container, "new", 1);
  await notes.expectComposerContext([
    "Intent → Changes",
    "dashboard/src/App.tsx",
    "Line 1 · new",
  ]);
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
