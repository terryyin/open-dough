import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { expectDocumentStill } from "./board-accessibility.ts";
import { mountBoardFrame } from "./board-frame-mount.ts";
import { reducedBoardMotion } from "./board-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import { boardWork, longBacklog } from "./board-work.ts";

test("accessible Board reads a backlog longer than one screen by scrolling the Board", async () => {
  await reducedBoardMotion();
  await mountBoardFrame(boardWork(longBacklog), { width: 1440, height: 700 });
  await board.shows(["Backlog", "Taken", "Recently done"], []);
  const backlog = board.column("Backlog");
  const cards = backlog.getByRole("article");
  expect(
    cards.elements().map((card) => card.getAttribute("aria-label")),
  ).toEqual(longBacklog.map(({ title }) => title));
  const heading = backlog.getByRole("heading", {
    name: "Backlog",
    exact: true,
  });
  const last = cards.last();
  const inspect = last.getByRole("button", { name: "Inspect story" });
  expect(board.inReadingRoom(inspect.element())).toBe(false);
  await userEvent.keyboard("{End}");
  await expect.poll(() => board.inReadingRoom(inspect.element())).toBe(true);
  expect(board.position()).toBeGreaterThan(0);
  await expect
    .element(last.getByText(`Priority ${longBacklog.length}`, { exact: true }))
    .toBeVisible();
  expect(board.inReadingRoom(heading.element())).toBe(true);
  expect(
    board.inReadingRoom(
      backlog
        .getByText(`${longBacklog.length} entries`, { exact: true })
        .element(),
    ),
  ).toBe(true);
  expectDocumentStill();

  const start = inspect.element();
  if (!(start instanceof HTMLElement)) throw new Error("Inspect is missing.");
  start.focus();
  const first = cards
    .first()
    .getByRole("button", { name: "Inspect story" })
    .element();
  for (let step = 0; step < 60 && document.activeElement !== first; step += 1) {
    await userEvent.tab({ shift: true });
    const stop = document.activeElement;
    if (stop === null) throw new Error("Reading focus left the Board.");
    await expect.poll(() => board.inReadingRoom(stop)).toBe(true);
    expect(
      heading.element().getBoundingClientRect().bottom,
    ).toBeLessThanOrEqual(stop.getBoundingClientRect().top);
  }
  expect(document.activeElement).toBe(first);
});
