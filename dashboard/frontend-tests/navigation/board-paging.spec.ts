import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { boardReading as board, columns } from "./board-reading-page.ts";
import {
  mountBoard,
  reducedBoardMotion,
  withBoardStorage,
} from "./board-mount.ts";
import { boardWork, longBacklog } from "./board-work.ts";

const narrow = { width: 640, height: 800 };
const twoColumns = { width: 864, height: 700 };
const backlogControl = `Backlog ${longBacklog.length} entries`;

test("one whole Board column follows each page move and the chosen column returns after widening", async () => {
  withBoardStorage("0");
  await mountBoard([boardWork(longBacklog)], narrow);
  await board.shows(["Backlog"], ["Taken 1 entry"]);
  const cards = board.column("Backlog").getByRole("article");
  expect(
    cards.elements().map((card) => card.getAttribute("aria-label")),
  ).toEqual(longBacklog.map(({ title }) => title));
  const firstCard = cards.first().element();
  const margin = Math.min(24, Math.max(12, 0.04 * narrow.width));
  const unpagedShare = board.room().width - 2 * margin - 2 * 17;
  expect(firstCard.getBoundingClientRect().width).toBeGreaterThanOrEqual(
    unpagedShare - 0.5,
  );

  await board.control("Taken").click();
  await board.shows(["Taken"], [backlogControl, "Recently done 0 entries"]);
  await board.control("Recently done").click();
  await board.shows(["Recently done"], ["Taken 1 entry"]);
  await page.viewport(twoColumns.width, narrow.height);
  await board.shows(["Taken", "Recently done"], [backlogControl]);
  await page.viewport(narrow.width, narrow.height);
  await board.shows(["Recently done"], ["Taken 1 entry"]);
});

test("the keyboard stays on the paging control and hands off when it disappears", async () => {
  withBoardStorage("0");
  await mountBoard([boardWork(longBacklog)], narrow);
  await board.shows(["Backlog"], ["Taken 1 entry"]);

  (board.control("Taken").element() as HTMLButtonElement).focus();
  await userEvent.keyboard("{Enter}");
  await board.shows(["Taken"], [backlogControl, "Recently done 0 entries"]);
  await expect.element(board.control("Recently done")).toHaveFocus();

  await userEvent.keyboard("{Enter}");
  await board.shows(["Recently done"], ["Taken 1 entry"]);
  await expect.element(board.control("Taken")).toHaveFocus();
});

test("the heading and paging control stay in reach below the banner while reading the long Backlog", async () => {
  withBoardStorage("0");
  await reducedBoardMotion();
  await mountBoard([boardWork(longBacklog)], twoColumns);
  await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
  const heading = board
    .column("Backlog")
    .getByRole("heading", { name: "Backlog" })
    .element();
  const banner = page.getByRole("banner").element();
  const bannerBottom = banner.getBoundingClientRect().bottom;

  await board.wheelTo(1000);
  const stuck = heading.getBoundingClientRect().top;
  expect(stuck).toBeGreaterThanOrEqual(bannerBottom);
  expect(stuck).toBeLessThan(bannerBottom + 16);
  await board.wheelTo(1500);
  expect(banner.getBoundingClientRect().bottom).toBe(bannerBottom);
  expect(heading.getBoundingClientRect().top).toBe(stuck);
  expect(board.inReadingRoom(board.control("Recently done").element())).toBe(
    true,
  );

  await board.control("Recently done").click();
  await board.shows(["Taken", "Recently done"], [backlogControl]);
  await expect.poll(board.position).toBe(board.bottom());
  const clamped = board.position();
  expect(clamped).toBeLessThan(1500);
  expect(board.inReadingRoom(board.control("Backlog").element())).toBe(true);
  expect(
    board.inReadingRoom(
      board.column("Taken").getByRole("heading", { name: "Taken" }).element(),
    ),
  ).toBe(true);

  await board.control("Backlog").click();
  await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
  expect(board.position()).toBe(clamped);
  await board.wheelTo(1500);
  expect(banner.getBoundingClientRect().bottom).toBe(bannerBottom);
  expect(heading.getBoundingClientRect().top).toBe(stuck);
  expect(board.inReadingRoom(board.control("Recently done").element())).toBe(
    true,
  );
});

test("reducing motion pages the Board immediately without a slide", async () => {
  withBoardStorage("0");
  await reducedBoardMotion();
  await mountBoard([boardWork(longBacklog)], narrow);
  await board.shows(["Backlog"], ["Taken 1 entry"]);
  const slides = board.observeSlides();
  await board.control("Taken").click();
  const at = board.column("Taken").element().getBoundingClientRect().left;
  expect(at).toBeGreaterThanOrEqual(board.room().left);
  expect(at).toBeLessThanOrEqual(board.room().left + 28.5);
  await board.shows(["Taken"], [backlogControl, "Recently done 0 entries"]);
  expect(slides).toEqual([]);
});

test("reverse Tab from Taken reveals the final Backlog card without taking its focus", async () => {
  withBoardStorage("0");
  await mountBoard([boardWork(longBacklog)], twoColumns);
  await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
  await board.control("Recently done").click();
  await board.shows(["Taken", "Recently done"], [backlogControl]);

  const regions = page.getByRole("region", {
    name: /^(Backlog|Taken|Recently done)$/,
  });
  expect(regions.elements()).toEqual(
    columns.map((name) => board.column(name).element()),
  );
  const last = board.column("Backlog").getByRole("article").last().element();
  (
    board
      .column("Taken")
      .getByRole("button")
      .first()
      .element() as HTMLButtonElement
  ).focus();
  await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
  await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
  await expect.poll(() => last.contains(document.activeElement)).toBe(true);
  await expect
    .poll(() => {
      const active = document.activeElement;
      return active !== null && board.inReadingRoom(active);
    })
    .toBe(true);

  await board.endsWith(["Backlog", "Taken"]);
  expect(board.inReadingRoom(last)).toBe(true);
  expect(last.contains(document.activeElement)).toBe(true);
});
