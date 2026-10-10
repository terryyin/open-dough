// How the progressive Recently done journeys
// (./recently-done-progressive-loading.spec.ts) open the page over a
// published list (./recentlyDoneProgressive.ts) and observe it: which done
// records' reads reached the fake GitHub, the reveal action, and where the
// shown entries stand, and the open terminal. Nothing here decides what the page shows or reads.

import type { Locator, Page } from "@playwright/test";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { githubFor } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { shownEntries } from "./recentlyDoneColumn.ts";
import { queuedTitle } from "./recentlyDoneRecords.ts";
import { publishes, type FakeGitHub } from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
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
  await keepProgressiveSessions(dashboard, now, list, nestedIn, {
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
export const terminalOf = (page: Page) =>
  page.getByRole("region", { name: "Terminal" });

export const revealAction = (recent: Locator) =>
  recent.getByRole("button", { name: /older entr(y|ies)$|^Reading done/ });

// Where the shown entries stand on the page.
export const standing = async (page: Page, recent: Locator, count: number) => {
  const shown = shownEntries(recent);
  const tops: number[] = [];
  for (let index = 0; index < count; index += 1) {
    tops.push((await shown.nth(index).boundingBox())?.y ?? Number.NaN);
  }
  return { tops, scrolled: await page.evaluate(() => window.scrollY) };
};

// Lets the page settle after a movement that must ask for nothing.
export const settle = (page: Page) =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => setTimeout(resolve, 500));
      }),
  );
