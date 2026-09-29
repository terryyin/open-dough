// How the session state specs watch the page read the machine's sessions
// again on its own: the records reads it asks, one steady pace of page time
// at a time, and a marker set on this document only, so a reload would lose
// it.
// Each spec pauses the page clock (`pausePageClockAt`) before the page opens.
// What an entry shows of its session is `expectSessionShown`: its state's
// words and whether its solid edge says the developer is needed there.

import type { Locator, Page, Request } from "@playwright/test";
import { agentLaunchEndpoint } from "../src/agentLaunch.ts";
import { checkIntervalMs } from "../src/revisionCheckSchedule.ts";
import { expect } from "./dashboardTest.ts";
import { sessionStateOf } from "./dashboardPage.ts";
import { givePageItsTurns } from "./pageRequestNotes.ts";

const isRecordsRead = (request: Request) =>
  request.method() === "GET" &&
  new URL(request.url()).pathname === agentLaunchEndpoint;

// Counts the page's records reads from now on, and lets exactly one steady
// pace of page time pass: no records read is asked a moment before it, and
// one is asked and answered once it has passed.
export function watchRecordReads(page: Page) {
  let reads = 0;
  page.on("request", (request) => {
    if (isRecordsRead(request)) reads += 1;
  });
  return {
    passOnePace: async () => {
      await givePageItsTurns(page);
      const before = reads;
      await page.clock.runFor(checkIntervalMs - 1);
      await givePageItsTurns(page);
      expect(reads).toBe(before);
      const answered = page.waitForResponse((response) =>
        isRecordsRead(response.request()),
      );
      await page.clock.runFor(1);
      await answered;
      expect(reads).toBe(before + 1);
    },
  };
}

export async function markNotReloaded(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.documentElement.dataset["notReloaded"] = "yes";
  });
}

export async function expectNotReloaded(page: Page): Promise<void> {
  expect(
    await page.evaluate(() => document.documentElement.dataset["notReloaded"]),
  ).toBe("yes");
}

// The entry shows these state words, and its attention edge only when the
// developer is needed there: solid and heavier than a quiet entry's dashed
// one, so it does not rest on color.
export async function expectSessionShown(
  entry: Locator,
  words: string,
  needsAttention: boolean,
): Promise<void> {
  await expect(sessionStateOf(entry)).toHaveText(words);
  await expect(entry).toHaveCSS(
    "border-top-style",
    needsAttention ? "solid" : "dashed",
  );
  await expect(entry).toHaveCSS(
    "border-left-width",
    needsAttention ? "4px" : "1px",
  );
}
