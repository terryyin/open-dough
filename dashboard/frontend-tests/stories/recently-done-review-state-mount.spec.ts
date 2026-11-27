// A done story card in Recently done carries its project's review state: an
// unreviewed card offers Mark as reviewed; a reviewed card offers Reviewed,
// which asks before undoing review. A saved change keeps the card, the order,
// the count, the selection and the card's sessions, keeps the keyboard on the
// card and is announced once. A card whose record failed or is still being
// read offers the action from its catalogued identity. On a phone's touch
// screen each review control offers the shared 44px height. Persistence across
// reload and restart: ../../../e2e/stories/recently-done-review-state-persistence.spec.ts.
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import {
  heldSessions,
  recentlyDone,
  topLevelEntries,
} from "../sessions/recently-done-column-page.ts";
import {
  isSelected,
  reviewBoard,
  reviewCard,
  storyA,
  storyB,
  storyC,
} from "./recently-done-review-state-mount-page.ts";
import { reducedBoardMotion } from "../navigation/board-mount.ts";
import { boardReading } from "../navigation/board-reading-page.ts";
import {
  portrait,
  tapWhereShown,
  useTouchScreen,
} from "../navigation/board-touch-page.ts";

type Card = ReturnType<typeof reviewCard>;

const sidePanel = () =>
  page.getByRole("region", {
    name: /^(Terminal|Final report)$/,
  });

test("Mark as reviewed, Cancel and Escape keep the card, its order, count and selection, and announce once", async () => {
  const board = reviewBoard();
  await board.mount();
  const [a, b, c] = [storyA, storyB, storyC].map((story) =>
    reviewCard(story.title),
  ) as [Card, Card, Card];
  await expect.element(c.markAsReviewed).toBeVisible();
  for (const card of [a, b])
    await expect.element(card.markAsReviewed).toBeVisible();
  const order = () => topLevelEntries();
  const before = order();
  await c.article.getByRole("heading", { level: 3 }).first().click();
  await expect.poll(() => isSelected(c.article)).toBe(true);
  const actionsOfA = a.actions
    .getByRole("button")
    .all()
    .map((button) => button.element().textContent);

  a.markAsReviewed.element().focus();
  await userEvent.keyboard("{Enter}");
  await expect.element(a.reviewedButton).toHaveFocus();
  await expect
    .element(a.actions.getByRole("status").getByText("Marked as reviewed."))
    .toBeVisible();
  expect(page.getByText("Marked as reviewed.").all()).toHaveLength(1);
  expect(
    a.actions
      .getByRole("button")
      .all()
      .map((button) => button.element().textContent),
  ).toEqual(
    actionsOfA.map((name) => (name === "Mark as reviewed" ? "Reviewed" : name)),
  );
  await expect.element(b.markAsReviewed).toBeVisible();
  await expect.element(c.markAsReviewed).toBeVisible();
  expect(order()).toEqual(before);
  await expect
    .element(recentlyDone().getByText("3 entries", { exact: true }))
    .toBeVisible();
  expect(isSelected(c.article)).toBe(true);
  expect(isSelected(a.article)).toBe(false);
  expect(sidePanel().all()).toHaveLength(0);
  expect(board.reviewed()).toEqual([storyA.identity]);

  await a.reviewedButton.click();
  await expect.element(a.cancel).toHaveFocus();
  await a.cancel.click();
  await expect.element(a.question).not.toBeInTheDocument();
  await expect.element(a.reviewedButton).toHaveFocus();
  expect(isSelected(c.article)).toBe(true);
  expect(board.reviewed()).toEqual([storyA.identity]);

  await userEvent.keyboard("{Enter}");
  await expect.element(a.cancel).toHaveFocus();
  await userEvent.keyboard("{Escape}");
  await expect.element(a.question).not.toBeInTheDocument();
  await expect.element(a.reviewedButton).toHaveFocus();
  expect(board.reviewed()).toEqual([storyA.identity]);
});

test("marking and unreviewing a story keep the card's sessions as they were", async () => {
  const closed = (sessionId: string, launched: number) =>
    makeMe.aLaunchRecord
      .executing(storyA)
      .inClaudeSession({ sessionId })
      .launchedAt(minutesAgo(launched))
      .markedDoneAt(minutesAgo(launched - 1))
      .please();
  const board = reviewBoard({
    answer: makeMe.aMachineAnswer
      .observingUnavailable(closed("refined", 40), closed("executed", 30))
      .please(),
  });
  await board.mount();
  const a = reviewCard(storyA.title);
  const sessions = () =>
    heldSessions(storyA.title)
      .all()
      .map((entry) => entry.element().getAttribute("data-shows-session"));
  const held = ["claude:executed", "claude:refined"];
  await expect.poll(sessions).toEqual(held);
  await a.markAsReviewed.click();
  await expect.element(a.reviewedButton).toBeVisible();
  expect(sessions()).toEqual(held);
  await a.reviewedButton.click();
  await a.confirm.click();
  await expect.element(a.markAsReviewed).toBeVisible();
  expect(sessions()).toEqual(held);
  expect(board.changes).toEqual([
    `open-dough ${storyA.identity} true`,
    `open-dough ${storyA.identity} false`,
  ]);
});

test("a card whose record could not be read offers Mark as reviewed", async () => {
  const board = reviewBoard();
  board.failBody(storyC);
  await board.mount();
  const failed = reviewCard(storyC.identity);
  await expect
    .element(failed.article.getByText("This done story could not be read."))
    .toBeVisible();
  await expect.element(failed.markAsReviewed).toBeVisible();
});

test("a card whose record is still being read offers Mark as reviewed and keeps Reviewed once its facts appear", async () => {
  const board = reviewBoard();
  const release = board.holdBody(storyB);
  await board.mount();
  const held = reviewCard(storyB.identity);
  await expect
    .element(held.article.getByText("Reading done story…"))
    .toBeVisible();
  await held.markAsReviewed.click();
  await expect.element(held.reviewedButton).toBeVisible();
  await expect
    .element(held.article.getByText("Reading done story…"))
    .toBeVisible();
  release();
  const read = reviewCard(storyB.title);
  await expect.element(read.article.getByText(storyB.identity)).toBeVisible();
  await expect.element(read.reviewedButton).toBeVisible();
});

// Taps `control` once its centre shows it.
async function tapOnceShown(control: Card["markAsReviewed"]) {
  const shownAtItsCenter = () => {
    const element = control.query();
    if (element === null) return false;
    const { x, y, width, height } = element.getBoundingClientRect();
    return element.contains(
      document.elementFromPoint(x + width / 2, y + height / 2),
    );
  };
  await expect.poll(shownAtItsCenter).toBe(true);
  await tapWhereShown(control.element());
}

test("on a phone's touch screen Review actions and both confirmation choices offer the shared 44px control height", async () => {
  await useTouchScreen();
  // Columns switch without sliding, so a tap lands where the control rests.
  await reducedBoardMotion();
  await reviewBoard({ viewport: portrait }).mount();
  // The phone Board shows one column; its column controls step to the next.
  for (const column of ["Taken", "Recently done"] as const)
    await tapOnceShown(boardReading.control(column));
  const card = reviewCard(storyA.title);
  const tapAtTouchSize = async (control: Card["markAsReviewed"]) => {
    await expect.element(control).toBeVisible();
    control.element().scrollIntoView({ block: "center", behavior: "instant" });
    expect(
      control.element().getBoundingClientRect().height,
    ).toBeGreaterThanOrEqual(44);
    await tapOnceShown(control);
  };
  await tapAtTouchSize(card.markAsReviewed);
  await tapAtTouchSize(card.reviewedButton);
  await expect.element(card.question).toBeVisible();
  expect(
    card.confirm.element().getBoundingClientRect().height,
  ).toBeGreaterThanOrEqual(44);
  await tapAtTouchSize(card.cancel);
  await expect.element(card.reviewedButton).toBeVisible();
});
