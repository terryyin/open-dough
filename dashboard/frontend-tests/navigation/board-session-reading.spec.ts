import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { expectDocumentStill } from "./board-accessibility.ts";
import {
  mountBoard,
  reducedBoardMotion,
  withBoardStorage,
} from "./board-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import {
  answerTerminal,
  backlogCard,
  closeTerminal,
  machineWorking,
  openRecord,
  openSidebarSession,
  readingTop,
  scroller,
  sessions,
  sidebar,
  terminal,
} from "./board-session-view.ts";
import { boardWork, longBacklog, story } from "./board-work.ts";
import { withWidthStorage } from "./side-panel-width-view.ts";

const longRead = story("Read the retained working story", 18, {
  purpose: {
    status: "recorded",
    purpose: "Read the published goal without losing its beginning. ".repeat(
      67,
    ),
  },
});

async function prepareReading(
  viewport: { width: number; height: number },
  inspect = true,
) {
  withBoardStorage("0");
  withWidthStorage();
  await reducedBoardMotion();
  answerTerminal();
  await mountBoard(
    [
      boardWork([
        ...longBacklog.slice(0, 7),
        longRead,
        ...longBacklog.slice(7),
      ]),
    ],
    viewport,
    machineWorking(openRecord(longRead)),
  );
  const card = backlogCard(longRead.title);
  await expect.element(card).toBeInTheDocument();
  if (inspect) {
    await card.getByRole("button", { name: "Inspect story" }).click();
    await expect
      .element(
        card.getByRole("region", { name: `Detail for ${longRead.title}` }),
      )
      .toBeInTheDocument();
  }
  await board.wheelTo(0);
  expect(board.inReadingRoom(card.element())).toBe(false);
  await sessions.click();
  await openSidebarSession(longRead.title);
  return card;
}

test("a sidebar session reveals the tall card's sticky reading edge beside a terminal through height changes", async () => {
  const card = await prepareReading({ width: 1400, height: 360 });
  await readingTop(card.element());
  const region = scroller(card.element());
  expect(card.element().getBoundingClientRect().height).toBeGreaterThan(
    region.clientHeight,
  );
  await page.viewport(1400, 560);
  await readingTop(card.element());
  await page.viewport(1400, 360);
  await readingTop(card.element());
  await board.expectStorySelection(card, true);
  expectDocumentStill();
});

async function readsAfterCover(height: number) {
  const card = await prepareReading({ width: 700, height });
  await expect
    .poll(() => terminal.element().closest(".page-covering"))
    .not.toBeNull();
  await expect.element(sidebar).not.toBeInTheDocument();
  await closeTerminal();
  await expect.element(sessions).toHaveFocus();
  await board.expectStorySelection(card, true);
  expect(card.element().getBoundingClientRect().height).toBeGreaterThan(
    scroller(card.element()).clientHeight,
  );
  await readingTop(card.element());
  expectDocumentStill();
}

test("closing a covering terminal reveals the same tall story at 700×800", () =>
  readsAfterCover(800));
test("closing a covering terminal reveals the same tall story at 700×900", () =>
  readsAfterCover(900));

test("closing a covering terminal reveals the same whole card where it fits at 700×1600", async () => {
  const card = await prepareReading({ width: 700, height: 1600 }, false);
  await expect
    .poll(() => terminal.element().closest(".page-covering"))
    .not.toBeNull();
  await expect.element(sidebar).not.toBeInTheDocument();
  await closeTerminal();
  await expect.element(sessions).toHaveFocus();
  await board.expectStorySelection(card, true);
  expect(card.element().getBoundingClientRect().height).toBeLessThan(
    scroller(card.element()).clientHeight,
  );
  await expect.poll(() => board.inReadingRoom(card.element())).toBe(true);
  expectDocumentStill();
});
