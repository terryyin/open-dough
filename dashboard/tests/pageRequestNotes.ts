// What a dashboard page asks of the local boundary, as the page itself notes
// it (./pageRequestNoting.ts): the page times of its revision checks, the
// requests, reads and done marks still unanswered, and the message turns on
// which it acts. See ./autoRefreshJourney.ts and ./dashboardPage.ts.

import type { Page } from "@playwright/test";
import {
  noteRequestsInOpenPage,
  type RequestsNoted,
} from "./pageRequestNoting.ts";

export { isCheck, noteRequestsInEveryPage } from "./pageRequestNoting.ts";

// Gives the page its message turns: the page's own work runs on them, and
// the paused page clock does not hold them back, so a few of them let it act
// on what just happened -- commit a change, or send the request a step or an
// answer led to.
export async function givePageItsTurns(page: Page): Promise<void> {
  await page.evaluate(async () => {
    for (let turn = 0; turn < 3; turn += 1) {
      await new Promise<void>((done) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = () => {
          done();
        };
        channel.port2.postMessage(undefined);
      });
    }
  });
}

// Waits, with page time standing still, until the page has sent every
// request it is going to send without more page time passing, and every
// request it has sent is answered: the local boundary asks `gh` only while
// it answers the page, so after this no `gh` call is on its way.
export async function untilPageRequestsAnswered(page: Page): Promise<void> {
  await untilNotedAnswered(page, "requestsUnanswered");
}

// Waits until every read the page has sent the local read boundary, its
// revision checks aside, is answered, and the answers have led to no further
// read: what the page shows can then come from nothing still on its way. A
// revision check is left alone, so a journey holding GitHub's listing can
// still wait here. A page whose requests are not noted has nothing to wait
// for.
export async function untilPageReadsAnswered(page: Page): Promise<void> {
  await untilNotedAnswered(page, "readsUnanswered");
}

// Waits until every read of the published work the page has sent is answered
// or has failed: the stages, or the problem shown in their place, then come
// from nothing still on its way, so an expectation about a card is bounded by
// the page's rendering, not by how long GitHub took. A journey's first card
// check after an open waits here first (`expectMembership` and
// `expectSettledPage` in ./dashboardPage.ts). Reads of a card's detail are
// left alone, so a journey holding one still returns from here; one holding
// the published-work read itself returns once it lets that go.
//
// A page just opened has first to show something and read the project list
// before it sends that read, and its load does not wait for either. So the
// wait begins once the dashboard has put its first content on the page, after
// which its turns send the project list's read; that read is awaited with the
// published work's, and its answer leads to theirs. A page that notes no
// requests, or is not the dashboard's, has nothing to wait for.
export async function untilPublishedWorkRead(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const root = document.getElementById("root");
    if (
      (window as RequestsNoted & typeof window).publishedWorkReadsUnanswered ===
        undefined ||
      root === null ||
      root.hasChildNodes()
    ) {
      return;
    }
    await new Promise<void>((shown) => {
      const observer = new MutationObserver(() => {
        if (root.hasChildNodes()) {
          observer.disconnect();
          shown();
        }
      });
      observer.observe(root, { childList: true });
    });
  });
  await untilNotedAnswered(page, "publishedWorkReadsUnanswered");
}

// Waits until every done mark the page has sent the local launch boundary is
// answered or has failed, and the page has had its turns to act on the
// answer: a session leaving its card, or a panel closing, is then bounded by
// the page's rendering, not by how long the rename and the stop took. A
// press sends its mark before the page's next turn, so a wait begun after the
// press finds it. Reads on their way are left alone, so a journey holding one
// still returns from here; one holding the mark itself does not wait here.
export async function untilDoneMarkAnswered(page: Page): Promise<void> {
  await untilNotedAnswered(page, "doneMarksUnanswered");
}

// Opens the page at `address`, or opens it again by a reload, and waits
// there: for a journey whose next step looks at what the page read and is
// none of those checks. One holding the published-work read opens it itself.
export async function openUntilRead(page: Page, address = "/"): Promise<void> {
  await page.goto(address);
  await untilPublishedWorkRead(page);
}

export async function reloadUntilRead(page: Page): Promise<void> {
  await page.reload();
  await untilPublishedWorkRead(page);
}

async function untilNotedAnswered(
  page: Page,
  unansweredNote: Exclude<keyof RequestsNoted, "revisionChecksAskedAt">,
): Promise<void> {
  for (;;) {
    await givePageItsTurns(page);
    const waited = await page.evaluate(async (note) => {
      const unanswered = [
        ...((window as RequestsNoted & typeof window)[note] ?? []),
      ];
      await Promise.all(unanswered);
      return unanswered.length > 0;
    }, unansweredNote);
    if (!waited) {
      return;
    }
  }
}

// The page times of the revision checks the page has asked for so far.
async function checksAskedAt(page: Page): Promise<readonly number[]> {
  return page.evaluate(() => [
    ...((window as RequestsNoted & typeof window).revisionChecksAskedAt ?? []),
  ]);
}

// Runs `passing` from the current page time while noting the revision checks
// the page asks for; it can ask at which page times, since that start, they
// have been asked so far.
export async function whileNotingChecks<T>(
  page: Page,
  passing: (askedAfter: () => Promise<readonly number[]>) => Promise<T>,
): Promise<T> {
  await noteRequestsInOpenPage(page);
  const alreadyAsked = (await checksAskedAt(page)).length;
  const startedAt = await page.evaluate(() => Date.now());
  return passing(async () =>
    (await checksAskedAt(page))
      .slice(alreadyAsked)
      .map((askedAt) => askedAt - startedAt),
  );
}
