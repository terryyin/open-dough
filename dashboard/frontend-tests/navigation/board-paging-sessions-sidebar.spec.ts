import { expect, test, vi } from "vitest";
import { mountBoard } from "./board-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import {
  answerTerminal,
  backlogCard,
  machineWorking,
  openRecord,
  openSidebarSession,
  sessions,
  sidebar,
} from "./board-session-view.ts";
import { withWidthStorage } from "./side-panel-width-view.ts";
import { boardWork, story } from "./board-work.ts";

test("a Session sidebar choice pages to a hidden column and brings its card into the Board's reading room", async () => {
  withWidthStorage();
  answerTerminal();
  const ready = story("Read the working session", 12);
  const last = story("Read the last queued story", 13);
  await mountBoard(
    [boardWork([ready, last])],
    { width: 1400, height: 900 },
    machineWorking(openRecord(ready)),
  );
  await sessions.click();
  await expect.element(sidebar).toBeVisible();
  await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
  await board.control("Recently done").click();
  await board.shows(["Taken", "Recently done"], ["Backlog 2 entries"]);
  const card = backlogCard(ready.title);
  expect(board.inReadingRoom(card.element())).toBe(false);

  const reveal = vi.spyOn(card.element(), "scrollIntoView");
  await openSidebarSession(ready.title);
  await board.shows(["Backlog"], ["Taken 1 entry"]);
  await expect.poll(() => board.inReadingRoom(card.element())).toBe(true);
  await expect
    .element(card.getByText("Shown in terminal", { exact: true }))
    .toBeVisible();
  await board.expectStorySelection(card, true);
  expect(reveal).toHaveBeenCalledWith(
    expect.objectContaining({ behavior: "smooth" }),
  );
  const rows = [
    ...document.querySelectorAll(
      ".banner, .sessions-sidebar-title-row, .side-panel-header",
    ),
  ];
  const edges = rows
    .map((row) => row.getBoundingClientRect())
    .filter(({ height }) => height > 0)
    .map(({ top, bottom }) => [top, bottom]);
  expect(edges).toHaveLength(3);
  expect(edges).toEqual(Array.from({ length: 3 }, () => edges[0]));
  await board.endsWith(["Backlog"]);
  expect(board.inReadingRoom(backlogCard(last.title).element())).toBe(true);
});
