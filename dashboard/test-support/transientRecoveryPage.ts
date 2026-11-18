// What a recovery journey reads of the page's read problem while a failed or
// unanswered read waits to be read again on its own: the snapshot it says is
// still shown and when that was retrieved, and when it says this page reads
// again; and the controlled step of the page's clock to that time. The
// scenario names every expected time, wait and request count.

import type { Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { timeSaid } from "./limitNotice.ts";
import { pathsRead, type ObservedRequest } from "./publishedOrigin.ts";

// What the problem says while no published work is shown: when this page
// reads it again.
export const transientRecovery = "This page reads the published work at";

// What the problem says while detail of the shown snapshot, still unread or
// withheld by the limit, is labeled where it is shown and read again later.
export const detailRecovery = "this page reads it";

// What the problem says while an earlier snapshot stays shown.
const earlierSnapshot = "What is shown is the earlier snapshot, retrieved at";

export function mainReads(origin: {
  readonly requests: readonly ObservedRequest[];
}): number {
  return pathsRead(origin).filter((path) => path === "main").length;
}

// The page time the problem says this page next reads on its own: the
// published work while none is shown, or detail still unread.
export const recoversAt = (page: Page): Promise<number> =>
  timeSaid(page, new RegExp(`${transientRecovery}|${detailRecovery} at`));

// The problem says once that this page reads the published work again
// `waitSeconds` after the attempt that failed at `failedMs`.
export async function expectRecoversAfter(
  page: Page,
  failedMs: number,
  waitSeconds: number,
): Promise<void> {
  expect(await timeSaid(page, transientRecovery)).toBe(
    failedMs + waitSeconds * 1_000,
  );
}

// Moves the page's paused clock to the time the problem says this page reads
// again on its own, firing what is due then.
export async function passTimeToRecovery(page: Page): Promise<void> {
  const due = await recoversAt(page);
  await page.clock.fastForward(due - (await page.evaluate(() => Date.now())));
}

// The problem says the snapshot shown is the earlier one, retrieved at
// `retrieved` (the status's retrieval time from when it was read).
export async function expectEarlierSnapshotKept(
  page: Page,
  retrieved: string,
): Promise<void> {
  const { problem } = parts(page);
  await expect(problem).toContainText(earlierSnapshot);
  await expect(
    problem.locator("p", { hasText: earlierSnapshot }).locator("time").nth(1),
  ).toHaveAttribute("datetime", retrieved);
}
