// Scroll helpers for Sessions-sidebar Recently done paging: batch-by-batch end
// reaches. The forty-five retained Dones are in `./retainedDoneSessions.ts`;
// shared room and destination helpers stay in
// `./recentlyDoneSessionsSidebarPage.ts`.
import type { Page } from "@playwright/test";
import type { RecentlyDoneParts } from "./recentlyDoneSessionsSidebarPage.ts";
import { expect } from "./support/cursorStart.ts";

// Reaches the Recently done body's end once per batch until its entry count
// reaches `count`. One scroll-to-end arms one reveal; returning to the top
// between batches re-arms without chaining through continuous wheel motion.
export async function revealRecentlyDoneThrough(
  shown: RecentlyDoneParts,
  count: number,
) {
  for (;;) {
    const before = await shown.entries.count();
    if (before >= count) return;
    // The page re-arms in its scroll handler, which runs on the next rendered
    // frame; resolve only after that top-position scroll event is delivered so
    // the end scroll below is not coalesced with it.
    await shown.body.evaluate(
      (element) =>
        new Promise<void>((resolve) => {
          if (element.scrollTop === 0) {
            resolve();
            return;
          }
          element.addEventListener(
            "scroll",
            () => {
              resolve();
            },
            { once: true },
          );
          element.scrollTo(0, 0);
        }),
    );
    await shown.body.evaluate((element) => {
      element.scrollTo(0, element.scrollHeight);
    });
    try {
      await expect.poll(async () => shown.entries.count()).not.toBe(before);
    } catch {
      throw new Error(
        `Recently done stayed at ${String(before)} after scrolling; wanted ${String(count)}.`,
      );
    }
    const after = await shown.entries.count();
    if (after > count) {
      throw new Error(
        `Recently done jumped from ${String(before)} to ${String(after)}; wanted stop at ${String(count)}.`,
      );
    }
  }
}

// Prefers a short Recently done body so twenty entries overflow and scroll.
export async function preferShortRecentlyDoneBody(
  page: Page,
  heightKey: string,
) {
  await page.addInitScript(
    ([key, height]) => {
      window.localStorage.setItem(key, height);
    },
    [heightKey, "220"] as const,
  );
}
