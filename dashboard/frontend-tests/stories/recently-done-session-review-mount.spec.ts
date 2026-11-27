// One session's review state on its Recently done entry: Mark as reviewed or
// Reviewed, asking "Unreview this session?", an explicit mark winning over
// the story's `reviewedAt`, and the story's own Mark as reviewed marking every
// current session. A retained session and its published record share one
// mark, and the Sessions sidebar's Needs review cue agrees with the card.
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import type { StoryReviewStatesReadSource } from "../../src/storyReviewStatesReadSource.ts";
import { useTouchScreen } from "../navigation/board-touch-page.ts";
import {
  catalogs,
  followUp,
  mountKeptCounterpart,
  source,
} from "../sessions/recently-done-card-membership-mount-page.ts";
import {
  cueOf,
  onTheBoard,
} from "../sessions/recently-done-review-cue-mount-page.ts";
import { mountSessions } from "../sessions/recently-done-sidebar-mount-page.ts";
import {
  isSelected,
  reviewCard,
  reviewStateStore,
} from "./recently-done-review-state-mount-page.ts";

const first = "First session";
const second = "Second session";

// One session entry's review control on the source story's card.
function sessionReview(name: string) {
  const entry = reviewCard(source.title)
    .article.getByRole("listitem")
    .filter({ hasText: name });
  const question = entry.getByRole("group", {
    name: "Unreview this session?",
    exact: true,
  });
  return {
    markAsReviewed: entry.getByRole("button", {
      name: "Mark as reviewed",
      exact: true,
    }),
    reviewedButton: entry.getByRole("button", {
      name: "Reviewed",
      exact: true,
    }),
    question,
    cancel: question.getByRole("button", { name: "Cancel", exact: true }),
    confirm: question.getByRole("button", { name: "Unreview", exact: true }),
    notSaved: entry.getByText("The review state could not be saved."),
  };
}

// The source story with two sessions Done 10 and 8 minutes ago, the story
// marked reviewed `markedAt` when given.
async function mountTwoSessions(
  markedAt?: string,
  wrap: (read: StoryReviewStatesReadSource) => StoryReviewStatesReadSource = (
    read,
  ) => read,
) {
  const store = reviewStateStore(
    markedAt === undefined ? {} : { "open-dough": [source.identity] },
    markedAt === undefined ? {} : { [source.identity]: markedAt },
  );
  const { done, doneBodies } = catalogs({ "open-dough": [source] });
  const shown = await mountSessions(
    makeMe.aMachineAnswer
      .observingDone(
        followUp(first, minutesAgo(10)),
        followUp(second, minutesAgo(8)),
      )
      .please(),
    { done, doneBodies, reviewStates: wrap(store.read) },
  );
  await shown.header.click();
  return { store, shown, card: reviewCard(source.title) };
}

// Opens the Sessions sidebar's Recently done sessions over a mounted Board.
async function recentlyDoneRow(title: string) {
  await page.getByRole("button", { name: /^Sessions/ }).click();
  await page.getByRole("button", { name: "Recently done sessions" }).click();
  const region = page.getByRole("region", { name: "Recently done sessions" });
  return () =>
    [...region.element().querySelectorAll("li")].find((row) =>
      row.textContent.includes(title),
    );
}

test("marking and unreviewing one session moves the story between partial and full, keeping focus and selection", async () => {
  const { card } = await mountTwoSessions();
  const one = sessionReview(first);
  const two = sessionReview(second);
  await onTheBoard(async () => {
    await one.markAsReviewed.click();
    await expect.element(one.reviewedButton).toHaveFocus();
    await expect.element(two.markAsReviewed).toBeVisible();
    await expect.element(card.partiallyReviewed).toBeVisible();
    await two.markAsReviewed.click();
    await expect.element(card.reviewedButton).toBeVisible();
    await two.reviewedButton.click();
    await expect.element(two.question).toBeVisible();
    await two.cancel.click();
    await expect.element(two.reviewedButton).toHaveFocus();
    await two.reviewedButton.click();
    await two.confirm.click();
    await expect.element(two.markAsReviewed).toHaveFocus();
    await expect.element(card.partiallyReviewed).toBeVisible();
    await expect.element(one.reviewedButton).toBeVisible();
    expect(isSelected(card.article)).toBe(false);
  });
});

test("the sidebar's Needs review cue follows one session's mark", async () => {
  const { shown } = await mountTwoSessions();
  await onTheBoard(() => sessionReview(first).markAsReviewed.click());
  await expect.poll(() => cueOf(shown.row(first))).toBe(false);
  await expect.poll(() => cueOf(shown.row(second))).toBe(true);
});

test("an explicit unreview of a session the story's mark covers stays, and the story's Mark as reviewed then marks every session", async () => {
  const { store, card } = await mountTwoSessions(minutesAgo(5));
  const one = sessionReview(first);
  const two = sessionReview(second);
  await onTheBoard(async () => {
    await one.reviewedButton.click();
    await one.confirm.click();
    await expect.element(one.markAsReviewed).toBeVisible();
    await expect.element(two.reviewedButton).toBeVisible();
    await expect.element(card.partiallyReviewed).toBeVisible();
    await card.markAsReviewed.click();
    await expect.element(card.reviewedButton).toBeVisible();
    await expect.element(one.reviewedButton).toBeVisible();
    await expect.element(two.reviewedButton).toBeVisible();
  });
  expect(store.changes).toEqual([
    `open-dough ${source.identity} claude:${first.replaceAll(" ", "-")} false`,
    `open-dough ${source.identity} true`,
  ]);
});

test("a session change that cannot be saved leaves its last saved status and keeps the keyboard on it", async () => {
  await mountTwoSessions(
    undefined,
    (read) => (project, change) =>
      change === undefined
        ? read(project)
        : Promise.reject(new Error("not saved")),
  );
  const one = sessionReview(first);
  await onTheBoard(async () => {
    await one.markAsReviewed.click();
    await expect.element(one.notSaved).toBeVisible();
    await expect.element(one.markAsReviewed).toHaveFocus();
  });
});

test("a kept session and its published record share one mark, and the sidebar cue compares the published closing time", async () => {
  // Marked between the kept `doneAt` (6 minutes ago) and the published
  // `closedAt` (5 minutes ago): neither card nor sidebar counts it reviewed.
  const store = reviewStateStore(
    { "open-dough": [source.identity] },
    { [source.identity]: minutesAgo(5.5) },
  );
  const published = await mountKeptCounterpart(store.read);
  const kept = sessionReview("Counterpart here");
  await expect.element(kept.markAsReviewed).toBeVisible();
  const row = await recentlyDoneRow("Counterpart here");
  await expect.poll(() => cueOf(row())).toBe(true);
  await onTheBoard(() => kept.markAsReviewed.click());
  await expect.poll(() => cueOf(row())).toBe(false);
  await expect.element(kept.reviewedButton).toBeVisible();
  expect(store.changes).toEqual([
    `open-dough ${source.identity} ${published} true`,
  ]);
});

test("a published-only entry offers the same control, at the shared 44px touch height", async () => {
  await useTouchScreen();
  const store = reviewStateStore();
  const published = await mountKeptCounterpart(store.read, { kept: false });
  const entry = reviewCard(source.title).article.getByRole("article", {
    name: `Published session ${published}`,
  });
  const mark = entry.getByRole("button", { name: "Mark as reviewed" });
  await expect.element(mark).toBeVisible();
  expect(mark.element().getBoundingClientRect().height).toBeGreaterThanOrEqual(
    44,
  );
  mark.element().focus();
  await userEvent.keyboard("{Enter}");
  await expect
    .element(entry.getByRole("button", { name: "Reviewed", exact: true }))
    .toHaveFocus();
  expect(store.changes).toEqual([
    `open-dough ${source.identity} ${published} true`,
  ]);
});
