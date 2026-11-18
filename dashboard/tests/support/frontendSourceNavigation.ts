// A published backlog with each recorded-link shape and the page objects
// the Frontend journeys use to inspect and follow its source links.

import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  expectProjectChoice,
  expectSettledPage,
  parts,
} from "../dashboardPage.ts";
import { describedBacklog } from "../describedRevisions.ts";
import { hideDetail, inspectedDetail } from "../storyCardControls.ts";
import {
  putFrontendBacklog,
  type FrontendServiceState,
} from "./frontendServiceState.ts";

export const revision = "9b1d4e6a2c8f0735be19d4c6a7f8e9d0c1b2a3f4";
export const snapshotRoot = `/terryyin/open-dough/blob/${revision}`;

// Sessions decorative .product-mark (alt="") is not injected content.
export const injectedMarkup =
  "img:not([alt='Open Dough']):not(.product-mark), script:not([src])";

// An entry recording `href` as its canonical link, identified by `identity`
// when it records one and else by that link, and taken with `plan` if given.
const linked = (
  title: string,
  href: string,
  { identity = href, plan }: { identity?: string; plan?: string } = {},
) =>
  makeMe.aBacklogEntry
    .with({
      identity,
      title,
      href,
      ...(plan === undefined ? {} : { plan: { label: "plan", target: plan } }),
    })
    .please();

// Every entry follows the one recorded-link rule: a canonical link, and
// optionally the plan the entry is taken with. Targets avoid ")" because the
// published entry syntax ends a target there.
const linkedBacklog = describedBacklog(
  makeMe.aRepository
    .withRevision("linked", {
      backlog: {
        direction: `Trace each entry to its <img src=x onerror="document.title='direction ran'"> published source.`,
        taken: [
          linked(
            "Repair the installer's update report",
            "slice-plans/059-installer-update-report/PLAN.md",
          ),
          linked(
            "See the project's published work in a story dashboard",
            "seeds/SEED-021-observe-published-story-progress.md#see-published-work",
            {
              identity: "SEED-021#see-published-work",
              plan: "./slice-plans/061-published-story-dashboard/PLAN.md#ordered-slices",
            },
          ),
        ],
        queued: [
          linked(
            "Follow a record kept outside the planning directory",
            "./seeds/../../docs/adrs/0001-ubiquitous-language-accepted.md#decision",
          ),
          linked(
            "Follow a record named from the repository root",
            "/docs/release%20notes/2026.md",
          ),
          linked(
            "Read the hosting provider's note",
            "https://status.example.com/notes/2026-09?view=full#api",
            { identity: "NOTE-7#api", plan: "http://plans.example.org/note-7" },
          ),
          linked(
            "Reach outside the repository",
            "../../elsewhere/secret.md#top",
          ),
          linked(
            `<img src=x onerror="document.title='title ran'">Run a script from a link`,
            "javascript:document.title='canonical-ran'",
            {
              identity: "HOSTILE-1#x",
              plan: "data:text/html,<script>document.title='plan-ran'</script>",
            },
          ),
          linked("Point at an anchor and no file", "#see-published-work"),
          linked("Walk back to the planning directory", "seeds/..#top"),
          linked("Name a web address without a host", "https://"),
          linked("Spell a path that cannot be decoded", "seeds/%E0%A4%A.md"),
        ],
      },
    })
    .please(),
);

export async function openDashboard(
  page: Page,
  services: FrontendServiceState,
) {
  const requested: URL[] = [];
  page.on("request", (request) => {
    requested.push(new URL(request.url()));
  });
  putFrontendBacklog(services, { revision, backlog: linkedBacklog });
  await page.goto("/");
  await expectSettledPage(page);
  const origin = new URL(page.url()).origin;
  const { board } = parts(page);
  await expect(board.getByRole("article")).toHaveCount(11);
  return {
    board,
    requestedPaths: () =>
      requested.flatMap((url) => url.searchParams.getAll("path")),
    outsideDashboard: () =>
      requested.filter((url) => url.origin !== origin).map((url) => url.href),
  };
}

export function card(board: Locator, title: string | RegExp): Locator {
  return board.getByRole("article", { name: title });
}

// A card's source links are secondary detail: none is on its scan view, and
// Inspect story reveals them, from the snapshot already read, in its detail,
// read from the closed card even when its detail is already open.
export async function inspectedSources(story: Locator): Promise<Locator> {
  if ((await story.getByRole("button", { name: "Hide detail" }).count()) > 0) {
    await hideDetail(story);
  }
  await expect(story.getByRole("link")).toHaveCount(0);
  return (await inspectedDetail(story)).getByRole("list", {
    name: "Pinned source links",
  });
}

// Each card's source links in turn, each read in its own detail, which is
// closed again after reading.
export async function forEachStoryCardsSources(
  board: Locator,
  read: (sources: Locator) => Promise<void>,
) {
  for (const each of await board.getByRole("article").all()) {
    await read(await inspectedSources(each));
    await hideDetail(each);
  }
}

export async function destination(link: Locator): Promise<URL> {
  return new URL((await link.getAttribute("href")) ?? "");
}

// Click an outbound link: destination opens in a new tab; this page keeps its
// URL and stays on the `selected` project.
export async function followLeavingDashboard(
  page: Page,
  link: Locator,
  selected: string,
): Promise<URL> {
  const dashboardUrl = page.url();
  const [popup, leaving] = await Promise.all([
    page.waitForEvent("popup"),
    page
      .context()
      .waitForEvent("request", (request) => request.isNavigationRequest()),
    link.click(),
  ]);
  const dest = new URL(leaving.url());
  await popup.close();
  expect(page.url()).toBe(dashboardUrl);
  await expectProjectChoice(page, selected);
  return dest;
}
