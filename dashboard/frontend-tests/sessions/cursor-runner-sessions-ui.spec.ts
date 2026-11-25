import { expect, onTestFinished, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  askGapMs,
  type RunningCursorSessions,
} from "../../src/cursorRunnerSessions.ts";
import type { SessionServices } from "../../src/sessionServices.ts";
import { defaultTakenStory } from "../navigation/board-work.ts";
import { mountSessionCards, revealPage } from "./session-card-mount.ts";
import {
  sidebar,
  sidebarButton,
  sidebarSession,
  takenSession,
} from "./session-card-page.ts";
import { terminal } from "./session-terminal-page.ts";

const instruction = "hold this session";
const record = makeMe.aLaunchRecord
  .adHoc({
    instruction,
    title: instruction,
    storyIdentity: defaultTakenStory.identity,
  })
  .inCursorSession({
    sessionId: "12345678-1234-4123-8123-123456789abc",
    continuation: { workspace: "/Users/test/git/open-dough" },
  })
  .please();
const heldSessions = makeMe.aRunningCursorSessions
  .holding({ record, label: "working" })
  .please();
const unreachable = makeMe.aRunningCursorSessions.unreachable().please();
const empty = makeMe.aRunningCursorSessions.please();

const running = sidebar.getByRole("region", {
  name: "Running Cursor sessions",
});
const toggle = running.getByRole("button", {
  name: "Running Cursor sessions",
  exact: true,
});
const listed = running.getByRole("list");
const row = listed.getByRole("button", { name: /Open Dough.*working/i });
const openEntry = sidebarSession(instruction);
const runningWords = "The Cursor runner is running.";

async function openRunningCursorSessions() {
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
  const pending: ((answer: RunningCursorSessions) => void)[] = [];
  let peak = 0;
  let askedAt = 0;
  const read = vi.fn<SessionServices["readRunningCursorSessions"]>(() => {
    askedAt = Date.now();
    return new Promise<RunningCursorSessions>((resolve) => {
      pending.push(resolve);
      peak = Math.max(peak, pending.length);
    });
  });
  onTestFinished(() => {
    for (const resolve of pending.splice(0)) resolve(empty);
    vi.useRealTimers();
  });
  await mountSessionCards({
    reading: makeMe.aMachineAnswer.observingOpen(record).please(),
    readRunningCursorSessions: read,
  });
  await expect
    .element(takenSession(defaultTakenStory.title, record.session))
    .toBeVisible();
  await userEvent.click(sidebarButton);
  expect(read).not.toHaveBeenCalled();
  await userEvent.click(toggle);
  await expect.poll(() => read.mock.calls).toHaveLength(1);
  return {
    read,
    outstanding: () => pending.length,
    peak: () => peak,
    askedAt: () => askedAt,
    answer: async (value: RunningCursorSessions) => {
      const settle = pending.shift();
      if (settle === undefined)
        throw new Error("No Cursor sessions read is pending.");
      const settledAt = Date.now();
      settle(value);
      await vi.advanceTimersByTimeAsync(0);
      return settledAt;
    },
  };
}

test("slow Cursor sessions answers still publish under at most one owned read, and collapse or a hidden page ends or pauses that demand", async () => {
  const cursor = await openRunningCursorSessions();
  await vi.advanceTimersByTimeAsync(askGapMs + 200);
  expect(cursor.read).toHaveBeenCalledTimes(1);
  expect(cursor.outstanding()).toBe(1);

  const settledAt = await cursor.answer(heldSessions);
  await expect.element(running.getByText(runningWords)).toBeVisible();
  await expect.element(row).toBeVisible();
  expect(cursor.peak()).toBe(1);

  await vi.advanceTimersByTimeAsync(settledAt + askGapMs - Date.now() - 1);
  expect(cursor.read).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1);
  expect(cursor.read).toHaveBeenCalledTimes(2);
  expect(cursor.askedAt()).toBe(settledAt + askGapMs);

  const seePage = revealPage();
  await cursor.answer(heldSessions);
  await vi.advanceTimersByTimeAsync(askGapMs * 3);
  expect(cursor.read).toHaveBeenCalledTimes(2);
  const visibleAt = Date.now();
  seePage();
  await expect.poll(() => cursor.read.mock.calls).toHaveLength(3);
  expect(cursor.askedAt()).toBe(visibleAt);
  await cursor.answer(heldSessions);
  await expect.element(row).toBeVisible();
  expect(cursor.peak()).toBe(1);

  await userEvent.click(toggle);
  await expect.element(toggle).toHaveAttribute("aria-expanded", "false");
  await vi.advanceTimersByTimeAsync(askGapMs * 3);
  expect(cursor.read).toHaveBeenCalledTimes(3);
  expect(cursor.outstanding()).toBe(0);
  await expect.element(openEntry).toBeVisible();
  await expect.element(terminal).not.toBeInTheDocument();
});

test("while expanded, the list says it is reading, then follows each later read: unreachable, restored, and running with no held sessions", async () => {
  const cursor = await openRunningCursorSessions();
  await expect
    .element(running.getByText("Reading the Cursor runner…"))
    .toBeVisible();
  await expect.element(listed).not.toBeInTheDocument();

  await cursor.answer(heldSessions);
  await expect.element(running.getByText(runningWords)).toBeVisible();
  await expect.element(row).toBeVisible();
  await vi.advanceTimersByTimeAsync(askGapMs);

  await cursor.answer(unreachable);
  await expect
    .element(running.getByText("The Cursor runner cannot be reached."))
    .toBeVisible();
  await expect.element(listed).not.toBeInTheDocument();
  await expect.element(openEntry).toBeVisible();
  await vi.advanceTimersByTimeAsync(askGapMs);

  await cursor.answer(heldSessions);
  await expect.element(running.getByText(runningWords)).toBeVisible();
  await expect.element(row).toBeVisible();
  await vi.advanceTimersByTimeAsync(askGapMs);

  await cursor.answer(empty);
  await expect.element(listed).not.toBeInTheDocument();
  await expect.element(running.getByText(runningWords)).toBeVisible();
  await expect
    .element(running.getByText(/cannot be reached/))
    .not.toBeInTheDocument();
  expect(cursor.read).toHaveBeenCalledTimes(4);
  await expect.element(terminal).not.toBeInTheDocument();
});
