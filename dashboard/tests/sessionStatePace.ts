// How the session state specs watch the page read the machine's sessions
// again on its own: the records reads it asks, one steady pace of page time
// at a time, and a marker set on this document only, so a reload would lose
// it; or hold its first read unanswered (`holdSessionReads`), or a read the
// server has already answered (`holdSessionAnswers`).
// Each spec pauses the page clock (`pausePageClockAt`) before the page opens.
// What an entry shows of its session is `expectSessionShown`: its state's
// words and whether its solid edge says the developer is needed there.

import type { Locator, Page } from "@playwright/test";
import { agentLaunchEndpoint } from "../src/agentLaunch.ts";
import { checkIntervalMs } from "../src/revisionCheckSchedule.ts";
import { expect } from "./dashboardTest.ts";
import { sessionStateOf } from "./dashboardPage.ts";
import { givePageItsTurns } from "./pageRequestNotes.ts";

// What the page notes about its own records reads (see `watchRecordReads`):
// how many it has asked, and those whose answer it has not yet read whole.
type RecordReadsNoted = {
  recordReadsAsked?: number;
  recordReadsUnanswered?: Set<Promise<unknown>>;
};

// From the page's first document on, the page notes each records read at the
// moment it calls `fetch`, and keeps it until its answer has been read whole
// or the read has failed. Noting it in the page, rather than from
// Playwright's `request` and `response` events, keeps the count in step with
// page time: those events may arrive only after later steps have passed, and
// a read asked before a pace began may be answered inside it.
async function noteRecordReadsInPage(page: Page): Promise<void> {
  await page.addInitScript((endpoint) => {
    const noted = window as RecordReadsNoted & typeof window;
    const unanswered = new Set<Promise<unknown>>();
    noted.recordReadsAsked = 0;
    noted.recordReadsUnanswered = unanswered;
    const send = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = new URL(
        input instanceof Request ? input.url : String(input),
        window.location.href,
      );
      const method = (
        init?.method ?? (input instanceof Request ? input.method : "GET")
      ).toUpperCase();
      const sent = send(input, init);
      if (url.pathname === endpoint && method === "GET") {
        noted.recordReadsAsked = (noted.recordReadsAsked ?? 0) + 1;
        const answered = sent
          .then((response) => response.clone().arrayBuffer())
          .catch(() => undefined)
          .finally(() => {
            unanswered.delete(answered);
          });
        unanswered.add(answered);
      }
      return sent;
    };
  }, agentLaunchEndpoint);
}

const recordReadsAsked = (page: Page) =>
  page.evaluate(
    () => (window as RecordReadsNoted & typeof window).recordReadsAsked ?? 0,
  );

// Waits, with page time standing still, until every records read the page
// has asked is answered and the page has acted on its answer, so its next
// read waits one steady pace from page time now.
async function untilRecordReadsAnswered(page: Page): Promise<void> {
  for (;;) {
    await givePageItsTurns(page);
    const waited = await page.evaluate(async () => {
      const unanswered = [
        ...((window as RecordReadsNoted & typeof window)
          .recordReadsUnanswered ?? []),
      ];
      await Promise.all(unanswered);
      return unanswered.length > 0;
    });
    if (!waited) return;
  }
}

// Counts the page's records reads, and lets exactly one steady pace of page
// time pass once every earlier read is answered: no records read is asked a
// moment before it, and one is asked and answered once it has passed. Call
// it before the page opens.
export async function watchRecordReads(page: Page) {
  await noteRecordReadsInPage(page);
  return {
    passOnePace: async () => {
      await untilRecordReadsAnswered(page);
      const before = await recordReadsAsked(page);
      await page.clock.runFor(checkIntervalMs - 1);
      await givePageItsTurns(page);
      expect(await recordReadsAsked(page)).toBe(before);
      await page.clock.runFor(1);
      await givePageItsTurns(page);
      expect(await recordReadsAsked(page)).toBe(before + 1);
      await untilRecordReadsAnswered(page);
    },
  };
}

// Holds the page's reads of the machine's sessions unanswered until
// `answer` is called; later reads are answered at once.
export async function holdSessionReads(
  page: Page,
): Promise<{ answer: () => void }> {
  let answer = () => {};
  const held = new Promise<void>((resolve) => {
    answer = resolve;
  });
  await page.route(
    (url) => url.pathname === agentLaunchEndpoint,
    async (route) => {
      if (route.request().method() === "GET") await held;
      await route.continue();
    },
  );
  return { answer };
}

// Lets the page's next read of the machine's sessions reach the server at
// once, and holds its answer from the page until `answer` is called, so
// what the server answered is older than anything the page does meanwhile.
// `reachedServer` settles once the server has answered the held read.
export async function holdSessionAnswers(page: Page): Promise<{
  reachedServer: Promise<void>;
  answer: () => void;
}> {
  let answer = () => {};
  const held = new Promise<void>((resolve) => {
    answer = resolve;
  });
  let reached = () => {};
  const reachedServer = new Promise<void>((resolve) => {
    reached = resolve;
  });
  await page.route(
    (url) => url.pathname === agentLaunchEndpoint,
    async (route) => {
      if (route.request().method() !== "GET") return route.continue();
      const response = await route.fetch();
      reached();
      await held;
      return route.fulfill({ response });
    },
  );
  return { reachedServer, answer };
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
