import { expect, onTestFinished, test, vi } from "vitest";
import { page } from "vitest/browser";
import { boardReading as board } from "./board-reading-page.ts";
import {
  formerPositionKey,
  mountBoard,
  positionKey,
  withBoardStorage,
} from "./board-mount.ts";
import { boardWork, story } from "./board-work.ts";

const viewport = { width: 864, height: 800 };
const firstOpenDoughStory = story("First Open Dough story", 1);
const firstDoughnutStory = story("First Doughnut story", 3);
const openDough = boardWork([
  firstOpenDoughStory,
  story("Second Open Dough story", 2),
]);
const doughnut = boardWork(
  [firstDoughnutStory, story("Second Doughnut story", 4)],
  {
    id: "doughnut",
    label: "Doughnut",
  },
);
const projects = [openDough, doughnut];
const atBacklog = () =>
  board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
const atTaken = () =>
  board.shows(["Taken", "Recently done"], ["Backlog 2 entries"]);

test("storage refusal starts the Board at Backlog and still keeps a choice for the life of the page", async () => {
  const storage = vi
    .spyOn(window, "localStorage", "get")
    .mockImplementation(() => {
      throw new DOMException("Storage is refused.", "SecurityError");
    });
  onTestFinished(() => {
    storage.mockRestore();
  });
  await mountBoard(projects, viewport, {}, { sessionsSidebar: "kept" });
  await atBacklog();
  await board.control("Recently done").click();
  await atTaken();
  await page.getByRole("radio", { name: "Doughnut" }).click();
  await expect
    .element(
      board
        .column("Backlog")
        .getByRole("article", { name: firstDoughnutStory.title }),
    )
    .toBeInTheDocument();
  await atTaken();
  await board.control("Backlog").click();
  await atBacklog();
});

test("a chosen Board position follows the reader between projects", async () => {
  withBoardStorage("0");
  await mountBoard(projects, viewport);
  await atBacklog();
  await board.control("Recently done").click();
  await atTaken();

  await page.getByRole("radio", { name: "Doughnut" }).click();
  await expect
    .element(
      board
        .column("Backlog")
        .getByRole("article", { name: firstDoughnutStory.title }),
    )
    .toBeInTheDocument();
  await atTaken();
  await board.control("Backlog").click();
  await page.getByRole("radio", { name: "Open Dough" }).click();
  await expect
    .element(
      board
        .column("Backlog")
        .getByRole("article", { name: firstOpenDoughStory.title }),
    )
    .toBeInTheDocument();
  await atBacklog();
});

test("the former Board preference is adopted once and later writes keep the current preference", async () => {
  withBoardStorage();
  localStorage.setItem(formerPositionKey, "1");
  const reading = await mountBoard(projects, viewport);
  await atTaken();
  expect(localStorage.getItem(positionKey)).toBe("1");

  localStorage.setItem(formerPositionKey, "0");
  reading.restart(1);
  await atTaken();
  await board.control("Backlog").click();
  await atBacklog();
  expect(localStorage.getItem(positionKey)).toBe("0");
  reading.restart(2);
  await atBacklog();
});

test("an unusable Board preference falls back to Backlog", async () => {
  withBoardStorage("taken");
  const reading = await mountBoard(projects, viewport);
  await atBacklog();

  for (const [index, value] of ["-1", "1.5"].entries()) {
    await board.control("Recently done").click();
    await atTaken();
    localStorage.setItem(positionKey, value);
    reading.restart(index + 1);
    await atBacklog();
  }
});
