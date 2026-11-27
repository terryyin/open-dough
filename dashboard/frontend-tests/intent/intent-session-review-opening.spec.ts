// Review session changes on a Done card, in the mounted Board frame, selects
// the story and opens Intent with that session chosen in Review scope: a
// session published from another machine and one this machine retained.
// The Review scope dropdown names that session, keeps it through a dismissal
// and switches label and comparison together on a choice, also by touch on a
// phone.
// The session's review is read by its UUID; the review answers, keyed by
// `published`, own the Git judgment.
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import {
  portrait,
  tapWhereShown,
  useTouchScreen,
} from "../navigation/board-touch-page.ts";
import { source } from "../sessions/recently-done-card-membership-mount-page.ts";
import { heldSessions } from "../sessions/recently-done-column-page.ts";
import {
  adHocOption,
  expectIntentAt,
  fitsWithin,
  mountDoneStory,
  published,
  publishedEntry,
  publishedName,
  retainedName,
  retainedRecord,
  reviewSessionChanges,
} from "./intent-session-review-mount.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

test("Review session changes on a session published from another machine opens Intent at that session", async () => {
  const reads = await mountDoneStory();
  await reviewSessionChanges(publishedEntry()).click();

  await expectIntentAt(publishedName);
  expect(reads).toContain(published.sessionId);
  expect(reads).not.toContain(retainedRecord.sessionId);
});

test("Review session changes on a session retained here opens Intent at its key", async () => {
  const reads = await mountDoneStory();
  await reviewSessionChanges(heldSessions(source.title).first()).click();

  await expectIntentAt(retainedName);
  expect(reads).toContain(retainedRecord.sessionId);
  expect(reads).not.toContain(published.sessionId);
});

test("Escape keeps the opened session and its comparison; choosing Whole story switches both", async () => {
  await mountDoneStory();
  await reviewSessionChanges(publishedEntry()).click();
  await expectIntentAt(publishedName, "1 changed file");
  const story = intentStoryCompare();

  (story.scope.element() as HTMLElement).focus();
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(story.scopeList).toBeVisible();
  await userEvent.keyboard("{ArrowUp}{Escape}");
  await expect.element(story.scope).toHaveFocus();
  expect(story.scopeList.query()).toBeNull();
  await expectIntentAt(publishedName, "1 changed file");

  await userEvent.keyboard("{ArrowDown}{Home}{Enter}");
  await expectIntentAt(
    "Whole story",
    "2 changed files",
    "Published completion",
  );
  await expect.element(story.scope).toHaveFocus();
});

test("on a phone width the scope dropdown and its list fit and a tapped session shows its comparison", async () => {
  await useTouchScreen();
  await mountDoneStory();
  await reviewSessionChanges(publishedEntry()).click();
  await page.viewport(portrait.width, portrait.height);
  const story = intentStoryCompare();
  await expectIntentAt(publishedName, "1 changed file");
  expect(fitsWithin(story.scope.element(), portrait.width)).toBe(true);

  await tapWhereShown(story.scope.element());
  const option = story.scopeOption(adHocOption(retainedName));
  await expect.element(option).toBeInViewport({ ratio: 1 });
  expect(fitsWithin(story.scopeList.element(), portrait.width)).toBe(true);
  await tapWhereShown(option.element());

  await expectIntentAt(retainedName, "1 changed file");
  expect(story.scopeList.query()).toBeNull();
  expect(fitsWithin(story.scope.element(), portrait.width)).toBe(true);
});
