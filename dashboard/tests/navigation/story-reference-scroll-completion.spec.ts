import { expect } from "../dashboardTest.ts";
import { test } from "../storyDependencyFixture.ts";
import { parts } from "../dashboardPage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { expectEntries } from "../recentlyDoneColumn.ts";
import { storyCard } from "../storyCardControls.ts";
import { followReference, openDependencies } from "../storyReference.ts";
import {
  doneTitlesThrough,
  farDone,
  serveDoneReferences,
} from "../storyReferenceDone.ts";

test.use({ hasTouch: true });

type NativeCompletion = {
  readonly y: number;
  readonly height: number;
  readonly top: number;
  readonly focused: string | null | undefined;
};

test("a late native scroll completion cannot strand a pending referenced story outside the viewport", async ({
  page,
  origin,
}) => {
  await serveDoneReferences(page, origin);
  await openUntilRead(page);
  const { backlog, recentlyDone: recent } = parts(page);
  await expectEntries(recent, doneTitlesThrough(10));
  const consumer = storyCard(backlog, "Story A");
  await openDependencies(consumer);
  // Complete a native scroll at its source only after the reveal has made
  // real progress and while its focused destination is still out of view.
  // Observing and completing in one browser event keeps that starting state.
  await page.evaluate((identity) => {
    const observed = window as unknown as {
      lateNativeCompletion?: NativeCompletion;
    };
    const board = document.querySelector(".board-scroll");
    if (!board) throw new Error("No Board scroll region");
    const finish = () => {
      const card = document.querySelector(
        `[data-done-story="${CSS.escape(identity)}"]`,
      );
      if (card === null || board.scrollTop <= board.clientHeight) return;
      const at = card.getBoundingClientRect();
      if (at.top < innerHeight) return;
      board.removeEventListener("scroll", finish);
      observed.lateNativeCompletion = {
        y: board.scrollTop,
        height: board.clientHeight,
        top: at.top,
        focused: document.activeElement?.getAttribute("data-done-story"),
      };
      board.scrollTo({ top: 0, behavior: "instant" });
    };
    board.addEventListener("scroll", finish);
  }, farDone.identity);
  await followReference(consumer, farDone.identity);
  const destination = storyCard(recent, farDone.title);
  await expect(destination).toBeFocused();
  const completion = () =>
    page.evaluate(
      () =>
        (window as unknown as { lateNativeCompletion?: NativeCompletion })
          .lateNativeCompletion,
    );
  await expect.poll(completion).toBeDefined();
  const observed = await completion();
  if (observed === undefined)
    throw new Error("The native scroll did not complete while pending.");
  expect(observed.y).toBeGreaterThan(observed.height);
  expect(observed.top).toBeGreaterThanOrEqual(observed.height);
  expect(observed.focused).toBe(farDone.identity);
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
});
