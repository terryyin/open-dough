import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { MachineSessions } from "../../src/agentLaunches.ts";
import {
  mountBoard,
  reducedBoardMotion,
  withBoardStorage,
} from "./board-mount.ts";
import { boardReading as board, columns } from "./board-reading-page.ts";
import {
  answerTerminal,
  backlogCard,
  closeTerminal,
  machineWorking,
  openRecord,
  terminal,
} from "./board-session-view.ts";
import { withWidthStorage } from "./side-panel-width-view.ts";
import { boardWork, longBacklog, story } from "./board-work.ts";

const wide = { width: 1728, height: 900 };
const taken = story("Read the running story", 59);
const ready = story("Run the ready story", 8, {
  preparation: {
    status: "recorded",
    refinement: "refined",
    approach: { kind: "planless" },
    assessment: { status: "ready", changedSinceReview: false, reasons: [] },
  },
  dependencies: { status: "not-recorded", entries: [], blocking: [] },
});
const running = openRecord(taken);

async function openTaken() {
  const action = board
    .column("Taken")
    .getByRole("button", { name: "Open terminal", exact: true });
  await expect.element(action).toBeInTheDocument();
  const control = action.element();
  if (!(control instanceof HTMLElement))
    throw new Error("Expected a terminal control.");
  control.focus();
  await userEvent.keyboard("{Enter}");
  await expect
    .element(terminal.getByRole("heading", { name: taken.title, exact: true }))
    .toBeVisible();
}

test("the Side panel leaves two whole columns, hands off paging focus, and restores the wider Board's choice", async () => {
  withBoardStorage("0");
  withWidthStorage();
  answerTerminal();
  await mountBoard(
    [boardWork(longBacklog, { taken: [taken] })],
    wide,
    machineWorking(running),
  );
  await board.shows(columns, []);
  const slides = board.observeSlides();
  await openTaken();
  await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
  expect(board.room().width).toBeCloseTo(wide.width / 2, 0);

  const first = board.column("Backlog").getByRole("article").first().element();
  const splitWidth = board.width();
  const unpagedShare = (splitWidth - 2 * 24 - 16) / 2 - 2 * (16 + 1);
  expect(first.getBoundingClientRect().width).toBeGreaterThanOrEqual(
    unpagedShare - 0.5,
  );
  const right = board.control("Recently done").element();
  if (!(right instanceof HTMLElement))
    throw new Error("Expected a paging button.");
  right.focus();
  await userEvent.keyboard("{Enter}");
  await board.shows(
    ["Taken", "Recently done"],
    [`Backlog ${longBacklog.length} entries`],
  );
  await expect.element(board.control("Backlog")).toHaveFocus();
  expect(board.inReadingRoom(board.control("Backlog").element())).toBe(true);
  expect(slides).toHaveLength(1);
  const last = board.column("Backlog").getByRole("article").last().element();
  await expect
    .poll(() => board.endOf(last) - board.extent())
    .toBeGreaterThan(48);
  await board.endsWith(["Taken", "Recently done"]);

  const opened = terminal.element();
  await page.viewport(2400, wide.height);
  await board.shows(columns, []);
  expect(board.width()).toBeGreaterThan(splitWidth);
  expect(terminal.element()).toBe(opened);
  await page.viewport(wide.width, wide.height);
  await board.shows(
    ["Taken", "Recently done"],
    [`Backlog ${longBacklog.length} entries`],
  );
  expect(terminal.element()).toBe(opened);

  await closeTerminal();
  await board.shows(columns, []);
  await openTaken();
  await board.shows(
    ["Taken", "Recently done"],
    [`Backlog ${longBacklog.length} entries`],
  );
});

test("starting a ready Backlog story beside the terminal keeps the view and its session on the card", async () => {
  withBoardStorage("0");
  withWidthStorage();
  await reducedBoardMotion();
  answerTerminal();
  const accept = vi.fn<MachineSessions["start"]>().mockResolvedValue(true);
  const mounted = await mountBoard(
    [
      boardWork([ready, story("Read another backlog card", 15)], {
        taken: [taken],
      }),
    ],
    wide,
    {
      ...machineWorking(running),
      start: accept,
      sessionPolicyOffer: () => "unavailable",
    },
  );
  await openTaken();
  await board.control("Recently done").click();
  await board.shows(["Taken", "Recently done"], ["Backlog 2 entries"]);
  await board.control("Backlog").click();
  await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);

  const card = backlogCard(ready.title);
  await card
    .getByRole("button", { name: "Start execution", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Start execution in Claude Code" })
    .getByRole("button", { name: "Start", exact: true })
    .click();
  expect(accept).toHaveBeenCalledWith(
    "open-dough",
    expect.objectContaining({ identity: ready.identity }),
    "execution",
    expect.anything(),
    expect.any(Function),
  );
  const started = machineWorking(running, openRecord(ready));
  mounted.supplySessions(started.records);
  await expect
    .element(card.getByRole("list", { name: "Sessions" }).getByRole("article"))
    .toBeVisible();
  await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
  await expect
    .element(terminal.getByRole("heading", { name: taken.title, exact: true }))
    .toBeVisible();
});
