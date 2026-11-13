// How the progressive Recently done journeys
// (./stories/recently-done-progressive-loading.spec.ts) open the page over a
// published list (./recentlyDoneProgressive.ts) and observe it: which done
// records' reads reached the fake GitHub, where the shown entries stand, when
// the page has done what a move or an answer led it to, and the open
// terminal. The column's range actions are ./recentlyDoneColumn.ts's. Nothing
// here decides what the page shows or reads.

import type { Locator, Page } from "@playwright/test";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { scrollYOf } from "./boardPage.ts";
import { untilBoardRests } from "./boardReading.ts";
import { githubFor } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { shownEntries } from "./recentlyDoneColumn.ts";
import { queuedTitle } from "./recentlyDoneRecords.ts";
import { untilPageAnsweredButChangeWaits } from "./pageRequestNotes.ts";
import { publishes, type FakeGitHub } from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import { terminalPanel } from "./terminalScreenPage.ts";
import {
  doneDirectory,
  keepProgressiveSessions,
  publishedWithCatalog,
  repository,
  revision,
  type ProgressiveEntry,
} from "./recentlyDoneProgressive.ts";

// The done records whose content reads reached GitHub, by path, in order;
// the catalog is not a record. Those of `repository` only, when given.
export const recordsAsked = (github: FakeGitHub, repository?: string) =>
  github.calls.flatMap(({ request }) =>
    request.kind === "content" &&
    (repository === undefined || request.repository === repository) &&
    request.path.startsWith(`${doneDirectory}/`) &&
    !request.path.endsWith("/.catalog.json")
      ? [request.path]
      : [],
  );

export const isRecord = (path: string) => (request: GhRequest) =>
  request.kind === "content" && request.path === path;

type Answering = (
  published: ReturnType<typeof publishes>,
) => ReturnType<typeof publishes>;

// Opens the page over the list published at `at`, the story at `nestedIn`
// holding three sessions, GitHub answering through `answering`. The boundary
// keeps what it read at a revision, so each publication has a revision of
// its own.
export async function opened(
  page: Page,
  dashboard: Parameters<typeof keepProgressiveSessions>[0],
  list: readonly ProgressiveEntry[],
  {
    nestedIn,
    answering = (published) => published,
    at = revision,
    open,
    also,
    beside,
  }: {
    readonly nestedIn?: number;
    readonly answering?: Answering;
    readonly at?: string;
    // The ad hoc entries' places kept open, and other sessions kept
    // (`keepProgressiveSessions`).
    readonly open?: readonly number[];
    readonly also?: (now: number) => readonly LaunchRecord[];
    // Files published beside the list's (`publishedWithCatalog`).
    readonly beside?: Readonly<Record<string, string>>;
  } = {},
) {
  const now = Date.now();
  keepProgressiveSessions(dashboard, now, list, nestedIn, {
    ...(open === undefined ? {} : { open }),
    ...(also === undefined ? {} : { also: also(now) }),
  });
  const github = githubFor(page);
  github.serve(
    repository,
    answering(
      publishes({
        revision: at,
        files: publishedWithCatalog(now, list, beside),
      }),
    ),
  );
  await page.goto("/");
  await expectMembership(page, { taken: [], backlog: [queuedTitle] });
  return { github, recent: parts(page).recentlyDone, now };
}

// The side panel's open terminal.
export const terminalOf = (page: Page) => terminalPanel(page);

// Where the shown entries stand on the page.
export const standing = async (page: Page, recent: Locator, count: number) => {
  const shown = shownEntries(recent);
  const tops: number[] = [];
  for (let index = 0; index < count; index += 1) {
    tops.push((await shown.nth(index).boundingBox())?.y ?? Number.NaN);
  }
  return {
    tops,
    scrolled: await scrollYOf(page),
  };
};

// Waits until the page has done all that a move or an answer led it to: the
// Board has come to rest, and every request the page sent, but its waits on
// a launch attempt's next change, is answered, with nothing more asked on
// those answers. Which records were read can then be counted at once: a read
// the move or answer was to send has been sent and answered. A journey still
// holding a read waits for the Board alone (`untilBoardRests`), or for the
// reads it does not hold (`untilPageReadsAnswered`).
export async function untilPageRests(page: Page) {
  await untilBoardRests(page);
  await untilPageAnsweredButChangeWaits(page);
}
