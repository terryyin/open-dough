import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import type { MachineSessions } from "../../src/agentLaunches.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import {
  mountBoard,
  reducedBoardMotion,
  withBoardStorage,
  withClosedSessionsSidebar,
} from "./board-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import { sessions } from "./board-session-view.ts";
import {
  landscape,
  portrait,
  readByTouch,
  swipe,
  tapWhereShown,
  useTouchScreen,
} from "./board-touch-page.ts";
import { boardWork, longBacklog, story } from "./board-work.ts";

const readyStory = story("Record the ready interaction", 81, {
  preparation: {
    status: "recorded",
    refinement: "refined",
    approach: { kind: "planless" },
    assessment: { status: "ready", changedSinceReview: false, reasons: [] },
  },
  dependencies: { status: "not-recorded", entries: [], blocking: [] },
});
const otherStory = story("Plan the other interaction", 82);
const work = boardWork([readyStory, otherStory]);

const atBacklog = () => board.shows(["Backlog"], ["Taken 1 entry"]);
const atTaken = () =>
  board.shows(["Taken"], ["Backlog 2 entries", "Recently done 0 entries"]);
const atDone = () => board.shows(["Recently done"], ["Taken 1 entry"]);
const card = () =>
  board
    .column("Backlog")
    .getByRole("article", { name: readyStory.title, exact: true });
const detail = () =>
  card().getByRole("region", { name: `Detail for ${readyStory.title}` });
const tapIndicator = (name: Parameters<typeof board.control>[0]) =>
  tapWhereShown(board.control(name).element());

test.beforeEach(async () => {
  withBoardStorage("0");
  withClosedSessionsSidebar();
  await useTouchScreen();
});

async function mountPhoneBoard(
  work: PublishedWork,
  observed?: Parameters<typeof mountBoard>[2],
) {
  await mountBoard([work], portrait, observed);
  await expect.element(sessions).toHaveAttribute("aria-expanded", "false");
}

test("completed swipes traverse one whole column and stop at both ends", async () => {
  await mountPhoneBoard(work);
  await atBacklog();
  const titles = (name: "Backlog" | "Taken") =>
    board
      .column(name)
      .getByRole("article")
      .elements()
      .map((element) => element.getAttribute("aria-label"));
  expect(titles("Backlog")).toEqual(work.backlog.map(({ title }) => title));
  expect(titles("Taken")).toEqual(work.taken.map(({ title }) => title));

  await swipe("right");
  await atBacklog();
  const slides = board.observeSlides();
  await swipe("left");
  await expect.poll(() => slides.length).toBeGreaterThan(0);
  await atTaken();
  await swipe("left");
  await atDone();
  await swipe("left");
  await atDone();
  await swipe("right");
  await atTaken();
  await swipe("right");
  await atBacklog();
});

test("short and cancelled gestures leave the view alone, and the next swipe works", async () => {
  await mountPhoneBoard(work);
  await atBacklog();
  await swipe("left", { distance: 24 });
  await atBacklog();
  await swipe("left", { cancel: true });
  await atBacklog();
  await swipe("left");
  await atTaken();
});

test("swiping from a card or action does not select, inspect or launch it; taps still work", async () => {
  const startLaunch = vi.fn<MachineSessions["start"]>();
  await reducedBoardMotion();
  await mountPhoneBoard(work, { start: startLaunch });
  await atBacklog();

  const title = card().getByRole("heading", { name: readyStory.title });
  const start = card().getByRole("button", { name: "Start execution" });
  const inspect = card().getByRole("button", { name: "Inspect story" });
  await expect.element(start).toBeEnabled();
  for (const target of [title, start]) {
    const touched = target.element();
    touched.scrollIntoView({ block: "nearest" });
    await swipe("left", { target: touched });
    // A browser may follow the gesture with a compatibility click on its
    // original target. Inject that click explicitly even when Chromium omits it.
    touched.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 }),
    );
    await atTaken();
    await board.expectStorySelection(card(), false);
    await expect.element(detail()).not.toBeInTheDocument();
    await expect.element(inspect).toHaveAttribute("aria-expanded", "false");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    expect(startLaunch).not.toHaveBeenCalled();
    await tapIndicator("Backlog");
    await atBacklog();
  }
  const disclosure = inspect.element();
  disclosure.scrollIntoView({ block: "nearest" });
  await tapWhereShown(disclosure);
  await expect.element(detail()).toBeVisible();
  await expect
    .element(card().getByRole("button", { name: "Hide detail" }))
    .toHaveAttribute("aria-expanded", "true");
  const heading = title.element();
  heading.scrollIntoView({ block: "nearest" });
  await tapWhereShown(heading);
  await board.expectStoryHighlight(card());
});

test("a native vertical drag reads down the same column without paging", async () => {
  await mountPhoneBoard(boardWork(longBacklog));
  await atBacklog();
  expect(getComputedStyle(board.view()).touchAction).toContain("pan-y");
  const before = board.position();
  await readByTouch();
  await expect.poll(board.position).toBeGreaterThan(before);
  await atBacklog();
});

test("swipes and indicators share a chosen column while rotation keeps inspection and selection", async () => {
  await reducedBoardMotion();
  await mountPhoneBoard(work);
  await atBacklog();
  expect(matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
  await tapWhereShown(
    card().getByRole("button", { name: "Inspect story" }).element(),
  );
  await expect.element(detail()).toBeVisible();
  await board.expectStorySelection(card(), false);
  await tapWhereShown(
    card().getByRole("heading", { name: readyStory.title }).element(),
  );
  await board.expectStorySelection(card(), true);

  const slides = board.observeSlides();
  await swipe("left");
  await atTaken();
  expect(slides).toEqual([]);
  await tapIndicator("Backlog");
  await atBacklog();
  await expect.element(detail()).toBeVisible();
  await swipe("left");
  await atTaken();
  await page.viewport(landscape.width, landscape.height);
  await board.shows(["Taken", "Recently done"], ["Backlog 2 entries"]);
  await page.viewport(portrait.width, portrait.height);
  await atTaken();
  await tapIndicator("Backlog");
  await atBacklog();
  await expect.element(detail()).toBeVisible();
  await board.expectStorySelection(card(), true);
});
