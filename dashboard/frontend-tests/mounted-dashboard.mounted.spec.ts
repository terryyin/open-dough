import { act } from "react";
import { expect, test, vi } from "vitest";
import { storyNotesEndpoint } from "../src/storyNote.ts";
import { mountDefaultDashboard } from "../test-support/mounted-dashboard/mountedDashboard.ts";

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
