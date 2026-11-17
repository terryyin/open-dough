// Built app with explicit Intent and notes substitutes: notes taken from Intent
// → Changed tests keep that view, and Story notes leaves Intent's reading as
// it was (../../src/IntentSelectionReading.tsx).
import { expect, test } from "../../tests/support/frontendApp.ts";
import { selectTakenStoryInIntent } from "../../tests/support/frontendIntentVisits.ts";
import { installFrontendStoryNotes } from "../../tests/support/frontendStoryNotes.ts";
import { storyNotesPage } from "../../tests/support/storyNotesPage.ts";
import {
  intentDiffReading,
  intentFile,
} from "../../tests/support/intentStoryPage.ts";
import {
  intentReadingScroll,
  scrollIntentReadingHalfway,
} from "../../tests/intentReadingPlacePage.ts";
import { storySummary } from "../../tests/intentModePage.ts";
import { deepSpec } from "../../tests/support/intentStoryWorktree.ts";
import { storyA } from "../../../Distribution/tests/support/queued-repository.mjs";

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
