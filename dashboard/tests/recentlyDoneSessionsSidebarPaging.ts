// Fixtures and scroll helpers for Sessions-sidebar Recently done paging:
// forty-five retained Dones and batch-by-batch end reaches. Shared room and
// destination helpers stay in `./recentlyDoneSessionsSidebarPage.ts`.
import type { Page } from "@playwright/test";
import type { LaunchRecord } from "../src/launchRecord.ts";
import {
  doneRecord,
  recentlyDoneParts,
} from "./recentlyDoneSessionsSidebarPage.ts";
import { expect } from "./support/cursorStart.ts";

// Forty-five retained Done sessions across the three configured projects,
// newest completion first as titles Done session 01 … 45. Two mid-list
// completions share a timestamp so identity breaks the tie. `titles[0]` is
// newest; `titles[44]` is oldest.
export function fortyFiveDoneSessions(now: number): {
  readonly titles: readonly string[];
  readonly byProject: Record<string, LaunchRecord[]>;
  readonly records: readonly LaunchRecord[];
} {
  const sources = ["open-dough", "doughnut", "pygardon"] as const;
  const titles = Array.from(
    Array(45).keys(),
    (index) => `Done session ${String(index + 1).padStart(2, "0")}`,
  );
  const records = titles.map((title, index): LaunchRecord => {
    const source = sources[index % sources.length] ?? "open-dough";
    // Indices 4 and 5 (Done session 05 / 06) share a completion time.
    const doneAt =
      index === 5
        ? new Date(now - 5 * 60_000).toISOString()
        : new Date(now - (index + 1) * 60_000).toISOString();
    return doneRecord({
      source,
      title,
      sessionId: `done-${String(index + 1).padStart(2, "0")}`,
      launchedAt: new Date(now - (index + 1) * 120_000).toISOString(),
      doneAt,
    });
  });
  const byProject: Record<string, LaunchRecord[]> = {
    "open-dough": [],
    doughnut: [],
    pygardon: [],
  };
  for (const record of records) {
    const bucket = byProject[record.request.source];
    if (bucket === undefined) {
      throw new Error(`Unexpected project ${record.request.source}`);
    }
    bucket.push(record);
  }
  return { titles, byProject, records };
}

// Reaches the Recently done body's end once per batch until its entry count
// reaches `count`. One scroll-to-end arms one reveal; returning to the top
// between batches re-arms without chaining through continuous wheel motion.
export async function revealRecentlyDoneThrough(
  shown: ReturnType<typeof recentlyDoneParts>,
  count: number,
) {
  for (;;) {
    const before = await shown.entries.count();
    if (before >= count) return;
    await shown.body.evaluate((element) => {
      element.scrollTo(0, 0);
    });
    await expect
      .poll(() => shown.body.evaluate((element) => element.scrollTop === 0))
      .toBe(true);
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
