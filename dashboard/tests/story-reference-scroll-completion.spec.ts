import { expect } from "./dashboardTest.ts";
import { test } from "./storyDependencyFixture.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { expectEntries } from "./recentlyDoneColumn.ts";
import {
  doneEntries,
  farDone,
  publishDoneReferences,
} from "./storyReferenceDone.ts";

test.setTimeout(120_000);
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
  const revision = await publishDoneReferences(origin);
  await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
  });
  await openUntilRead(page);
  const { backlog, recentlyDone: recent } = parts(page);
  await expectEntries(
    recent,
    doneEntries.slice(0, 10).map(({ title }) => title),
  );
  const consumer = backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await consumer.locator(".story-dependencies summary").click();
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
  await consumer
    .getByRole("link", { name: farDone.identity, exact: true })
    .click();
  const destination = recent.getByRole("article", {
    name: farDone.title,
    exact: true,
  });
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
