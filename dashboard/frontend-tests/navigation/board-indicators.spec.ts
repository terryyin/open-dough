import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import {
  mountBoard,
  reducedBoardMotion,
  withBoardStorage,
} from "./board-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import {
  portrait,
  swipe,
  tapWhereShown,
  useTouchScreen,
} from "./board-touch-page.ts";
import { boardWork, longBacklog, story } from "./board-work.ts";

const work = boardWork([story("Read a story", 71), story("Read another", 72)]);
const backlog = () => board.shows(["Backlog"], ["Taken 1 entry"]);
const taken = () =>
  board.shows(["Taken"], ["Backlog 2 entries", "Recently done 0 entries"]);
const done = () => board.shows(["Recently done"], ["Taken 1 entry"]);

test.beforeEach(async () => {
  withBoardStorage("0");
  await useTouchScreen();
  await reducedBoardMotion();
});

test("thin phone indicators give stories more room and taps share the swipe destinations", async () => {
  await mountBoard([work], portrait);
  await backlog();
  await swipe("left");
  await taken();
  for (const name of ["Backlog", "Recently done"] as const)
    expect(
      board.control(name).element().getBoundingClientRect().width,
    ).toBeLessThanOrEqual(16);
  const previousView = board.width() - 2 * 44;
  expect(
    board.view().getBoundingClientRect().width - previousView,
  ).toBeGreaterThan(44);
  expect(
    board.column("Taken").getByRole("article").element().getBoundingClientRect()
      .width - previousView,
  ).toBeGreaterThan(44);
  await tapWhereShown(board.control("Recently done").element());
  await done();
  await swipe("right");
  await taken();
  await tapWhereShown(board.control("Backlog").element());
  await backlog();
});

test("thin indicators retain complete destination names, keyboard activation and focus handoff", async () => {
  await mountBoard([work], portrait);
  await backlog();
  const forward = board.control("Taken");
  forward.element().focus();
  await expect.element(forward).toHaveFocus();
  await expect.element(forward).toBeEnabled();
  await userEvent.keyboard("{Enter}");
  await taken();
  await expect.element(board.control("Recently done")).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await done();
  await expect.element(board.control("Taken")).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await taken();
});

test("phone and tablet indicators remain reachable far down the Board and retain its position", async () => {
  await mountBoard([boardWork(longBacklog)], portrait);
  await backlog();
  await board.wheelTo(1000);
  await tapWhereShown(board.control("Taken").element());
  await board.shows(
    ["Taken"],
    [`Backlog ${longBacklog.length} entries`, "Recently done 0 entries"],
  );
  await page.viewport(1024, 768);
  await board.shows(
    ["Taken", "Recently done"],
    [`Backlog ${longBacklog.length} entries`],
  );
  await tapWhereShown(board.control("Backlog").element());
  await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
  await page.viewport(portrait.width, portrait.height);
  await backlog();
});
