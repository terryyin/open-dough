// How a dashboard page notes what it asks of the local boundary: the script
// that notes each request in the page, what it keeps, and how a page or every
// page of a context comes to run it. The waits on what is noted are in
// ./pageRequestNotes.ts.

import type { BrowserContext, Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";
import { agentDoneEndpoint } from "../src/doneMark.ts";
import { projectListEndpoint } from "../src/projectConfiguration.ts";

// A browser request to the local boundary is a revision check when it names
// the revision the page already shows with this search parameter.
const checkParameter = "since";

export function isCheck(url: string): boolean {
  return new URL(url).searchParams.has(checkParameter);
}

// What the page notes about its own requests (see `noteRequestsInPage`):
// the page times at which it asked for revision checks, every request it has
// sent that is not yet answered, of those its reads of the local read
// boundary other than revision checks, and of those reads the ones of the
// published work itself: the source's ref and backlog, or the backlog at a
// revision already resolved, which name a source, at most a revision, and
// nothing else. Every other read names what it reads besides. With them is
// kept the read of the project list, which the page awaits before it reads
// any project's published work. Apart from its reads, it notes the done marks
// it has sent the local launch boundary.
export type RequestsNoted = {
  revisionChecksAskedAt?: number[];
  requestsUnanswered?: Set<Promise<unknown>>;
  readsUnanswered?: Set<Promise<unknown>>;
  publishedWorkReadsUnanswered?: Set<Promise<unknown>>;
  doneMarksUnanswered?: Set<Promise<unknown>>;
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
// script before the page's own scripts (`./support/pageTest.ts`).
function noteRequestsInPage({
  checkParameter: parameter,
  readPath,
  projectListPath,
  doneMarkPath,
}: {
  readonly checkParameter: string;
  readonly readPath: string;
  readonly projectListPath: string;
  readonly doneMarkPath: string;
}): void {
  const noted = window as RequestsNoted & typeof window;
  if (noted.revisionChecksAskedAt !== undefined) {
    return;
  }
  const askedAt: number[] = [];
  const unanswered = new Set<Promise<unknown>>();
  const readsUnanswered = new Set<Promise<unknown>>();
  const publishedWorkReadsUnanswered = new Set<Promise<unknown>>();
  const doneMarksUnanswered = new Set<Promise<unknown>>();
  noted.revisionChecksAskedAt = askedAt;
  noted.requestsUnanswered = unanswered;
  noted.readsUnanswered = readsUnanswered;
  noted.publishedWorkReadsUnanswered = publishedWorkReadsUnanswered;
  noted.doneMarksUnanswered = doneMarksUnanswered;
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
    const projectListRead = url.pathname === projectListPath;
    const publishedWorkRead =
      read &&
      url.searchParams.has("source") &&
      [...url.searchParams.keys()].every(
        (named) => named === "source" || named === "revision",
      );
    const sent = send(input, init);
    const answered = sent
      .then((response) => response.clone().arrayBuffer())
      .catch(() => undefined)
      .finally(() => {
        unanswered.delete(answered);
        readsUnanswered.delete(answered);
        publishedWorkReadsUnanswered.delete(answered);
        doneMarksUnanswered.delete(answered);
      });
    unanswered.add(answered);
    if (read) {
      readsUnanswered.add(answered);
    }
    if (projectListRead || publishedWorkRead) {
      publishedWorkReadsUnanswered.add(answered);
    }
    if (url.pathname === doneMarkPath) {
      doneMarksUnanswered.add(answered);
    }
    return sent;
  };
}

const notedRequests = {
  checkParameter,
  readPath: authenticatedReadEndpoint,
  projectListPath: projectListEndpoint,
  doneMarkPath: agentDoneEndpoint,
};

export async function noteRequestsInOpenPage(page: Page): Promise<void> {
  await page.evaluate(noteRequestsInPage, notedRequests);
}

// Every page of `context` notes its requests from before its own scripts
// run, so a journey can wait for reads it sent on opening.
export async function noteRequestsInEveryPage(
  context: BrowserContext,
): Promise<void> {
  await context.addInitScript(noteRequestsInPage, notedRequests);
}
