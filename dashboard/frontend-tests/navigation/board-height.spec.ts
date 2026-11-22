import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { boardReading as board } from "./board-reading-page.ts";
import {
  mountBoard,
  reducedBoardMotion,
  withBoardStorage,
} from "./board-mount.ts";
import { boardWork, longBacklog, story } from "./board-work.ts";

function publishedDone(count: number) {
  const now = Date.now();
  const stories = Array.from(new Array<undefined>(count).keys(), (index) =>
    makeMe.aDoneRecord
      .completed({
        identity: `SEED-${200 + index}#closed`,
        title: `Done work number ${index + 1} is closed`,
        completedAt: new Date(now - (index + 1) * 3600000).toISOString(),
      })
      .please(),
  );
  return makeMe.aDoneCatalog.holding(stories).please();
}

const showOlder = () =>
  board
    .column("Recently done")
    .getByRole("button", { name: /^Show .*older entries$/ });
const doneCard = (index: number) =>
  board.column("Recently done").getByRole("article", {
    name: `Done work number ${index} is closed`,
    exact: true,
  });

test("a hidden long Recently done contributes no blank tail and its oldest story is reachable when shown", async () => {
  withBoardStorage("0");
  await reducedBoardMotion();
  const { done, doneReads } = publishedDone(40);
  await mountBoard(
    [boardWork([story("Prepare worktrees", 8)], { done })],
    { width: 864, height: 480 },
    {},
    { done: doneReads },
  );
  await board.shows(["Backlog", "Taken"], ["Recently done 40 entries"]);

  await board.control("Recently done").click();
  await board.shows(["Taken", "Recently done"], ["Backlog 1 entry"]);
  for (const offered of [
    "Show 10 of 30 older entries",
    "Show 10 of 20 older entries",
    "Show the 10 older entries",
  ]) {
    await expect
      .poll(() => showOlder().element().textContent.trim())
      .toBe(offered);
    await showOlder().click();
  }
  await expect.element(showOlder()).not.toBeInTheDocument();
  await expect.element(doneCard(40)).toBeInTheDocument();
  await board.endsWith(["Taken", "Recently done"]);
  expect(board.inReadingRoom(doneCard(40).element())).toBe(true);

  await board.pressWhereShown("Backlog");
  await board.shows(["Backlog", "Taken"], ["Recently done 40 entries"]);
  await expect.poll(board.position).toBe(board.bottom());
  expect(board.endOf(doneCard(40).element())).toBeGreaterThan(
    board.extent() + 48,
  );
  await board.endsWith(["Backlog", "Taken"]);
  expect(board.inReadingRoom(board.control("Recently done").element())).toBe(
    true,
  );
});

test("opening an inspection adds its full purpose to the reading room and closing it restores the Board's length", async () => {
  withBoardStorage("0");
  await reducedBoardMotion();
  const end = "The purpose ends here.";
  const inspected = story("Prepare worktrees", 8, {
    purpose: {
      status: "recorded",
      purpose: `Keep the purpose readable. ${"The purpose must be proposed clearly, leaving enough room to explain the available work. ".repeat(22)}${end}`,
    },
  });
  const { done, doneReads } = publishedDone(40);
  await mountBoard(
    [boardWork([inspected], { done })],
    { width: 864, height: 480 },
    {},
    { done: doneReads },
  );
  await board.shows(["Backlog", "Taken"], ["Recently done 40 entries"]);
  const card = board
    .column("Backlog")
    .getByRole("article", { name: inspected.title });
  const before = board.extent();
  await card.getByRole("button", { name: "Inspect story" }).click();
  const detail = card.getByRole("region", {
    name: `Detail for ${inspected.title}`,
  });
  const purposeEnd = detail.getByText(/The purpose ends here\.$/);
  await expect.element(purposeEnd).toBeInTheDocument();
  await expect.poll(board.extent).toBeGreaterThan(before + 480);
  await board.endsWith(["Backlog", "Taken"]);
  await expect.element(doneCard(10)).toBeInTheDocument();
  expect(board.endOf(doneCard(10).element())).toBeGreaterThan(
    board.extent() + 48,
  );
  const purpose = purposeEnd.element();
  const paragraph = purpose.firstChild;
  if (!(paragraph instanceof Text))
    throw new Error("Expected the purpose text.");
  const lastWords = new Range();
  lastWords.setStart(paragraph, paragraph.length - end.length);
  lastWords.setEndAfter(paragraph);
  const lines = lastWords.getBoundingClientRect();
  expect(lines.top).toBeGreaterThanOrEqual(board.room().top);
  expect(lines.bottom).toBeLessThanOrEqual(board.room().bottom);

  await board.wheelTo(0);
  await card.getByRole("button", { name: "Hide detail" }).click();
  await expect.element(detail).not.toBeInTheDocument();
  await expect.poll(board.extent).toBe(before);
  await board.endsWith(["Backlog", "Taken"]);
});

test("Done stories arriving in the hidden column leave the shown Board's length unchanged", async () => {
  withBoardStorage("0");
  await reducedBoardMotion();
  const viewport = { width: 864, height: 600 };
  const backlog = longBacklog.slice(0, 4);
  const arriving = publishedDone(41);
  const reading = await mountBoard(
    [boardWork(backlog, { done: { status: "loading" } })],
    viewport,
    {},
    { done: arriving.doneReads },
  );
  await board.shows(
    ["Backlog", "Taken"],
    ["Recently done Entry count incomplete"],
  );
  await expect.element(doneCard(1)).not.toBeInTheDocument();
  const before = board.extent();
  await board.endsWith(["Backlog", "Taken"]);

  reading.supply([boardWork(backlog, { done: arriving.done })]);
  await expect.element(doneCard(1)).toBeInTheDocument();
  await expect.element(doneCard(10)).toBeInTheDocument();
  await expect
    .poll(() => showOlder().element().textContent.trim())
    .toBe("Show 10 of 31 older entries");
  await board.shows(["Backlog", "Taken"], ["Recently done 41 entries"]);
  expect(board.endOf(showOlder().element())).toBeGreaterThan(
    board.extent() + 48,
  );
  expect(board.extent()).toBe(before);
  await board.endsWith(["Backlog", "Taken"]);
});
