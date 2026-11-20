import { act } from "react";
import { expect, onTestFinished, test, vi } from "vitest";
import { commands } from "vitest/browser";
import {
  actSettled,
  settleRounds,
  UnsettledPageError,
} from "../../test-support/mounted-dashboard/mountedActSettled.ts";
import {
  mountAnsweredDashboard,
  mountDefaultDashboard,
} from "../../test-support/mounted-dashboard/mountedDashboard.ts";

test("the next case opens with default answers and no late update", async () => {
  const dashboard = await mountDefaultDashboard();
  expect(dashboard.connection()).toBe("disconnected");
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
  expect(first.connection()).toBe("disconnected");
  first.unmount();
  const again = await mountAnsweredDashboard({
    answers,
    boardPositionKey,
    viewport: { width: 1024, height: 700 },
  });
  expect(again.connection()).toBe("disconnected");
  expect(again.boardRows()).toBeGreaterThan(0);
});

test("a page that changes every frame fails the case by name", async () => {
  const dashboard = await mountDefaultDashboard();
  expect(dashboard.connection()).toBe("disconnected");
  let changing = true;
  const changeEveryFrame = (frame: number) => {
    if (!changing) return;
    document.body.setAttribute("data-frame", String(frame));
    requestAnimationFrame(changeEveryFrame);
  };
  try {
    const settling = actSettled(() => requestAnimationFrame(changeEveryFrame));
    await expect(settling).rejects.toBeInstanceOf(UnsettledPageError);
    await expect(settling).rejects.toThrow(`${settleRounds} rounds`);
  } finally {
    changing = false;
    document.body.removeAttribute("data-frame");
  }
});
