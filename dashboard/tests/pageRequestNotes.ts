// What the auto-refresh journey's page asks of the local boundary, as the
// page itself notes it: the page times of its revision checks, the requests
// still unanswered, and the message turns on which it acts. See
// ./autoRefreshJourney.ts.

import { expect, type Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";

// A browser request to the local boundary is a revision check when it names
// the revision the page already shows with this search parameter.
const checkParameter = "since";

export function isCheck(url: string): boolean {
  return new URL(url).searchParams.has(checkParameter);
}

// What the page notes about its own requests (see `noteChecksInPage`): the
// page times at which it asked for revision checks, and every request it has
// sent that is not yet answered.
type ChecksNoted = {
  revisionChecksAskedAt?: number[];
  requestsUnanswered?: Set<Promise<unknown>>;
};

// From now on, the page notes the page time at which it asks for each
// revision check, at the moment it calls `fetch`. Noting it there, rather
// than from Playwright's `request` event, keeps the note in step with page
// time: the event may arrive only after later steps have already passed.
// It also keeps each request it sends -- to the local boundary, the only
// place this page sends any -- until that request's answer has been read
// whole, or the request has failed or been abandoned. The page's requests
// and the answers it reads are left exactly as they are; only a copy of each
// answer is read here.
async function noteChecksInPage(page: Page): Promise<void> {
  await page.evaluate((parameter) => {
    const noted = window as ChecksNoted & typeof window;
    if (noted.revisionChecksAskedAt !== undefined) {
      return;
    }
    const askedAt: number[] = [];
    const unanswered = new Set<Promise<unknown>>();
    noted.revisionChecksAskedAt = askedAt;
    noted.requestsUnanswered = unanswered;
    const send = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url =
        input instanceof Request
          ? input.url
          : new URL(input, window.location.href).href;
      if (new URL(url).searchParams.has(parameter)) {
        askedAt.push(Date.now());
      }
      const sent = send(input, init);
      const answered = sent
        .then((response) => response.clone().arrayBuffer())
        .catch(() => undefined)
        .finally(() => {
          unanswered.delete(answered);
        });
      unanswered.add(answered);
      return sent;
    };
  }, checkParameter);
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
  for (;;) {
    await givePageItsTurns(page);
    const waited = await page.evaluate(async () => {
      const unanswered = [
        ...((window as ChecksNoted & typeof window).requestsUnanswered ?? []),
      ];
      await Promise.all(unanswered);
      return unanswered.length > 0;
    });
    if (!waited) {
      return;
    }
  }
}

// The page times of the revision checks the page has asked for so far.
async function checksAskedAt(page: Page): Promise<readonly number[]> {
  return page.evaluate(() => [
    ...((window as ChecksNoted & typeof window).revisionChecksAskedAt ?? []),
  ]);
}

// Runs `passing` from the current page time while noting the revision checks
// the page asks for; it can ask at which page times, since that start, they
// have been asked so far.
export async function whileNotingChecks<T>(
  page: Page,
  passing: (askedAfter: () => Promise<readonly number[]>) => Promise<T>,
): Promise<T> {
  await noteChecksInPage(page);
  const alreadyAsked = (await checksAskedAt(page)).length;
  const startedAt = await page.evaluate(() => Date.now());
  return passing(async () =>
    (await checksAskedAt(page))
      .slice(alreadyAsked)
      .map((askedAt) => askedAt - startedAt),
  );
}

// The reads beside preparation of one project at one revision, each by the
// search parameter that asks it: its agent profiles, with the project setting
// file, and its done records.
const readsBesidePreparation = { agents: "profiles", done: "records" };

// From now on, notes the page's answers to the reads beside preparation of
// one project at one revision. A settled page (`expectSettledPage`) shows
// neither while the project has no Taken work or done story, and preparation
// alone can finish before either has reached `gh`; the returned wait ends once
// both are answered, so a count of what was asked taken after it includes
// them. Start noting before the page asks them.
export function noteReadsBesidePreparation(
  page: Page,
  sourceId: string,
  revision: string,
): () => Promise<void> {
  const answered = new Map<string, boolean>();
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (
      url.pathname !== authenticatedReadEndpoint ||
      url.searchParams.get("source") !== sourceId ||
      url.searchParams.get("revision") !== revision
    ) {
      return;
    }
    for (const [group, asked] of Object.entries(readsBesidePreparation)) {
      if (url.searchParams.get(group) === asked) {
        answered.set(group, response.ok());
      }
    }
  });
  return async () => {
    await expect
      .poll(() => Object.fromEntries(answered))
      .toEqual({ agents: true, done: true });
  };
}
