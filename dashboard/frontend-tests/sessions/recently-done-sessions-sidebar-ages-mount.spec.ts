// Recently done's completion ages in the mounted Sessions sidebar advance
// with the clock on the sidebar's 30 second tick, while the open list keeps
// counting from launch.
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  ageShown,
  mountSessions,
  openSessionRow,
} from "./recently-done-sidebar-mount-page.ts";

test("the clock advances completion ages in Recently done and launch ages in the open list", async () => {
  const at = Date.parse("2026-11-20T12:00:00.000Z");
  const minutesAgo = (minutes: number) =>
    new Date(at - minutes * 60_000).toISOString();
  vi.useFakeTimers({
    now: at,
    toFake: ["setInterval", "clearInterval", "Date"],
  });
  onTestFinished(() => {
    vi.useRealTimers();
  });
  const completed = makeMe.aLaunchRecord
    .adHoc({ instruction: "Just completed", title: "Just completed" })
    .inClaudeSession({ sessionId: "just-completed" })
    .launchedAt(minutesAgo(24 * 60))
    .markedDoneAt(minutesAgo(0))
    .please();
  const stillOpen = makeMe.aLaunchRecord
    .adHoc({ instruction: "Still open", title: "Still open" })
    .inClaudeSession({ sessionId: "still-open" })
    .launchedAt(minutesAgo(4))
    .please();
  const shown = await mountSessions(
    makeMe.aMachineAnswer
      .observingDone(completed)
      .observingOpen(stillOpen)
      .please(),
  );
  const ageOf = (row: Element | undefined) => ageShown(row)?.textContent;
  await shown.header.click();
  await expect.poll(shown.titles).toEqual(["Just completed"]);
  expect(ageOf(shown.row("Just completed"))).toBe("<1m");
  const tickAt = async (afterCompletionMs: number) => {
    vi.setSystemTime(at + afterCompletionMs);
    await vi.advanceTimersByTimeAsync(30_000);
  };

  expect(ageOf(openSessionRow())).toBe("4m");
  await tickAt(2 * 60_000);
  expect(ageOf(shown.row("Just completed"))).toBe("2m");
  expect(ageOf(openSessionRow())).toBe("6m");
});
