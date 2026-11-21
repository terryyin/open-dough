import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { boardReading as board } from "./board-reading-page.ts";
import {
  mountBoard,
  reducedBoardMotion,
  withBoardStorage,
} from "./board-mount.ts";
import { boardWork, longBacklog, story } from "./board-work.ts";

test("paging down a long Backlog clamps at the shorter columns' end and restores the Backlog's length", async () => {
  withBoardStorage("0");
  await reducedBoardMotion();
  const taken = [
    story("Repair installation", 50),
    story("Complete update reporting", 51),
    story("Document recovery", 52),
  ];
  await mountBoard([boardWork(longBacklog, { taken })], {
    width: 864,
    height: 480,
  });
  await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
  const last = board.column("Backlog").getByRole("article").last();
  const lastControl = last.getByRole("button", { name: "Inspect story" });

  await board.wheelTo(1500);
  await board.control("Recently done").click();
  await board.shows(
    ["Taken", "Recently done"],
    [`Backlog ${longBacklog.length} entries`],
  );
  await expect.poll(board.position).toBe(board.bottom());
  const clamped = board.position();
  expect(clamped).toBeGreaterThan(0);
  expect(clamped).toBeLessThan(1500);
  expect(board.endOf(last.element())).toBeGreaterThan(board.extent() + 48);
  expect(board.inReadingRoom(board.control("Backlog").element())).toBe(true);
  await board.endsWith(["Taken", "Recently done"]);

  await board.pressWhereShown("Backlog");
  await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
  expect(board.position()).toBe(clamped);
  await board.endsWith(["Backlog", "Taken"]);
  expect(board.inReadingRoom(lastControl.element())).toBe(true);

  await page.viewport(1280, 480);
  await board.shows(["Backlog", "Taken", "Recently done"], []);
  await board.endsWith(["Backlog", "Taken", "Recently done"]);
  expect(board.inReadingRoom(lastControl.element())).toBe(true);

  await page.viewport(640, 480);
  await board.shows(["Backlog"], ["Taken 3 entries"]);
  await board.endsWith(["Backlog"]);
  await board.control("Taken").click();
  await board.shows(
    ["Taken"],
    [`Backlog ${longBacklog.length} entries`, "Recently done 0 entries"],
  );
  await board.control("Recently done").click();
  await board.shows(["Recently done"], ["Taken 3 entries"]);
  expect(board.endOf(last.element())).toBeGreaterThan(board.extent() + 48);
  await board.endsWith(["Recently done"]);
});
