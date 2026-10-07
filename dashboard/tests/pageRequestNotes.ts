// What a dashboard page asks of the local boundary, as the page itself notes
// it: the page times of its revision checks, the requests and reads still
// unanswered, and the message turns on which it acts. See
// ./autoRefreshJourney.ts and ./dashboardPage.ts.

import type { BrowserContext, Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";

// A browser request to the local boundary is a revision check when it names
// the revision the page already shows with this search parameter.
const checkParameter = "since";

export function isCheck(url: string): boolean {
  return new URL(url).searchParams.has(checkParameter);
}

// What the page notes about its own requests (see `noteRequestsInPage`):
// the page times at which it asked for revision checks, every request it has
// sent that is not yet answered, and of those its reads of the local read
// boundary other than revision checks.
type RequestsNoted = {
  revisionChecksAskedAt?: number[];
  requestsUnanswered?: Set<Promise<unknown>>;
  readsUnanswered?: Set<Promise<unknown>>;
};

// From now on, the page notes the page time at which it asks for each
// revision check, at the moment it calls `fetch`. Noting it there, rather
// than from Playwright's `request` event, keeps the note in step with page
// time: the event may arrive only after later steps have already passed.
// It also keeps each request it sends -- to the local boundary, the only
// place this page sends any -- until that request's answer has been read
// whole, or the request has failed or been abandoned. The page's requests
// and the answers it reads are left exactly as they are; only a copy of each
// answer is read here. Runs in the page, as a page script or as an init
// script before the page's own scripts (`./dashboardTest.ts`).
function noteRequestsInPage({
  checkParameter: parameter,
  readPath,
}: {
  readonly checkParameter: string;
  readonly readPath: string;
}): void {
  const noted = window as RequestsNoted & typeof window;
  if (noted.revisionChecksAskedAt !== undefined) {
    return;
  }
  const askedAt: number[] = [];
  const unanswered = new Set<Promise<unknown>>();
  const readsUnanswered = new Set<Promise<unknown>>();
  noted.revisionChecksAskedAt = askedAt;
  noted.requestsUnanswered = unanswered;
  noted.readsUnanswered = readsUnanswered;
  const send = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = new URL(
      input instanceof Request ? input.url : input,
      window.location.href,
    );
    const check = url.searchParams.has(parameter);
    if (check) {
      askedAt.push(Date.now());
    }
    const read = !check && url.pathname === readPath;
    const sent = send(input, init);
    const answered = sent
      .then((response) => response.clone().arrayBuffer())
      .catch(() => undefined)
      .finally(() => {
        unanswered.delete(answered);
        readsUnanswered.delete(answered);
      });
    unanswered.add(answered);
    if (read) {
      readsUnanswered.add(answered);
    }
    return sent;
  };
}

const notedRequests = {
  checkParameter,
  readPath: authenticatedReadEndpoint,
};

async function noteRequestsInOpenPage(page: Page): Promise<void> {
  await page.evaluate(noteRequestsInPage, notedRequests);
}

// Every page of `context` notes its requests from before its own scripts
// run, so a journey can wait for reads it sent on opening.
export async function noteRequestsInEveryPage(
  context: BrowserContext,
): Promise<void> {
  await context.addInitScript(noteRequestsInPage, notedRequests);
}

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

async function untilNotedAnswered(
  page: Page,
  unansweredNote: "requestsUnanswered" | "readsUnanswered",
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
