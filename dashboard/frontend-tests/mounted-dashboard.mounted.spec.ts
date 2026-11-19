import { act } from "react";
import { expect, onTestFinished, test, vi } from "vitest";
import { commands } from "vitest/browser";
import { storyNotesEndpoint } from "../src/storyNote.ts";
import {
  mountAnsweredDashboard,
  mountDefaultDashboard,
} from "../test-support/mounted-dashboard/mountedDashboard.ts";

test("a case may end while a notes answer is still held", async () => {
  const dashboard = await mountDefaultDashboard([storyNotesEndpoint]);
  expect(dashboard.boardRows()).toBeGreaterThan(0);
  expect(dashboard.answersStillHeld()).toEqual([storyNotesEndpoint]);
});

test("the next case opens with default answers and no late update", async () => {
  const dashboard = await mountDefaultDashboard();
  expect(dashboard.answersStillHeld()).toEqual([]);
  const opened = dashboard.container.innerHTML;
  expect(dashboard.boardRows()).toBeGreaterThan(0);
  await act(() => vi.advanceTimersByTimeAsync(0));
  expect(dashboard.container.innerHTML).toBe(opened);
});

test("a case that mounts the board twice leaves the page as it found it", async () => {
  const page = () => ({
    storage: Object.fromEntries(Object.entries<string>(localStorage)),
    url: location.href,
    viewport: [window.innerWidth, window.innerHeight],
  });
  const found = page();
  // Registered before the mounts, so the runner calls it after their cleanup.
  onTestFinished(() => {
    expect(page()).toEqual(found);
  });
  const { answers, boardPositionKey } =
    await commands.dashboardServiceAnswers();
  const first = await mountAnsweredDashboard({
    answers,
    boardPositionKey,
    viewport: { width: 1280, height: 720 },
  });
  first.unmount();
  const again = await mountAnsweredDashboard({
    answers,
    boardPositionKey,
    viewport: { width: 1024, height: 700 },
  });
  expect(again.boardRows()).toBeGreaterThan(0);
});
