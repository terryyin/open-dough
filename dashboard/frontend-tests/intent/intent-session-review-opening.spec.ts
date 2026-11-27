// Review session changes on a Done card, in the mounted Board frame, selects
// the story and opens Intent with that session chosen in Review scope: a
// session published from another machine and one this machine retained.
// The Review scope dropdown names that session, keeps it through a dismissal
// and switches label and comparison together on a choice, also by touch on a
// phone. While the session's review is still read, Proof measures nothing
// rather than the story. The session applies to that opening only: the story
// selected again starts at Whole story.
// The session's review is read by its UUID; the review answers, keyed by
// `published`, own the Git judgment.
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import {
  portrait,
  tapWhereShown,
  useTouchScreen,
} from "../navigation/board-touch-page.ts";
import { selectCard } from "../navigation/recent-stories-frame.ts";
import {
  other,
  source,
} from "../sessions/recently-done-card-membership-mount-page.ts";
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
import type { CiComparisonRange } from "../../src/selectedCiComparison.ts";
import { unanswered } from "../../test-support/support/waitUntil.ts";
import { heldReply } from "./intent-ci-evidence-page.tsx";
import { inertCiReads, openDoughSource } from "./intent-ci-status-fixtures.ts";
import { intentRecentStories } from "./intent-recent-stories-page.ts";
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

test("Review session changes at a session still being read measures nothing until its range arrives", async () => {
  const sessionsHeld = heldReply<undefined>();
  const asked: CiComparisonRange[] = [];
  await mountDoneStory({
    sessionsHeld: sessionsHeld.promise,
    ci: inertCiReads({
      readSelectedComparison: (...[, , range]) => {
        asked.push(range);
        return unanswered();
      },
    }),
  });
  await reviewSessionChanges(publishedEntry()).click();
  const story = intentStoryCompare();
  await story.chooseTab("CI comparison");
  await expect
    .poll(() => story.viewText("CI comparison"))
    .toContain("Reading the story's changes…");
  expect(story.viewText("CI comparison")).not.toContain(
    "no published completion record",
  );
  expect(asked).toEqual([]);

  sessionsHeld.resolve(undefined);
  await expect
    .poll(() => asked.at(-1))
    .toEqual({ start: "3".repeat(40), end: "4".repeat(40) });
  expect(story.viewText("CI comparison")).not.toContain(
    "no published completion record",
  );
});

test("a story selected again after Review session changes starts at Whole story", async () => {
  await mountDoneStory({ others: [other] });
  await selectCard(other.title);
  await reviewSessionChanges(heldSessions(source.title).first()).click();
  await expectIntentAt(retainedName, "1 changed file");

  const recent = intentRecentStories(openDoughSource);
  await recent.chooseRow(other.identity);
  await recent.selects(other.identity);
  await recent.chooseRow(source.identity);

  await expectIntentAt(
    "Whole story",
    "2 changed files",
    "Published completion",
  );
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
