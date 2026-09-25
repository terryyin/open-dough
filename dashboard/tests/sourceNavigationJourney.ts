// The published backlog the source-navigation journey opens: one entry for
// each recorded-link shape (./source-navigation.spec.ts), and how the journey
// finds its cards, their link destinations, and what the page and the local
// `gh` were asked for.

import type { Locator, Page } from "@playwright/test";
import { parts } from "./dashboardPage.ts";
import { expect, githubFor } from "./dashboardTest.ts";
import {
  commitAnswer,
  publishOrigin,
  rawFileAnswer,
} from "./publishedOrigin.ts";

export const revision = "9b1d4e6a2c8f0735be19d4c6a7f8e9d0c1b2a3f4";
export const snapshotRoot = `/terryyin/open-dough/blob/${revision}`;

// Every entry follows the one recorded-link rule: a canonical link, and
// optionally the plan the entry is taken with. Targets avoid ")" because the
// published entry syntax ends a target there.
const linkedBacklog = `# Product backlog

## Near-future direction

Trace each entry to its <img src=x onerror="document.title='direction ran'"> published source.

## Taken

- [Repair the installer's update report](quick/059-installer-update-report/PLAN.md)
- [See the project's published work in a story dashboard](seeds/SEED-021-observe-published-story-progress.md#see-published-work) — SEED-021#see-published-work ([plan](./quick/061-published-story-dashboard/PLAN.md#ordered-slices))

## Backlog list

- [Follow a record kept outside the planning directory](./seeds/../../docs/adrs/0001-ubiquitous-language-accepted.md#decision)
- [Follow a record named from the repository root](/docs/release%20notes/2026.md)
- [Read the hosting provider's note](https://status.example.com/notes/2026-09?view=full#api) — NOTE-7#api ([plan](http://plans.example.org/note-7))
- [Reach outside the repository](../../elsewhere/secret.md#top)
- [<img src=x onerror="document.title='title ran'">Run a script from a link](javascript:document.title='canonical-ran') — HOSTILE-1#x ([plan](data:text/html,<script>document.title='plan-ran'</script>))
- [Point at an anchor and no file](#see-published-work)
- [Walk back to the planning directory](seeds/..#top)
- [Name a web address without a host](https://)
- [Spell a path that cannot be decoded](seeds/%E0%A4%A.md)
`;

export async function openDashboard(page: Page) {
  const requested: string[] = [];
  page.on("request", (request) => {
    requested.push(request.url());
  });
  // What the page asked of anywhere but its own dashboard server.
  const leftTheServer = () =>
    requested.filter(
      (url) => new URL(url).origin !== new URL(page.url()).origin,
    );
  await publishOrigin(page, {
    ref: commitAnswer(revision),
    backlog: { revision, answer: rawFileAnswer(linkedBacklog) },
  });
  await page.goto("/");
  const { stages } = parts(page);
  await expect(stages.getByRole("article")).toHaveCount(11);
  // Every GitHub endpoint the local `gh` was asked for, as GitHub sees it.
  const github = githubFor(page);
  const askedOfGitHub = () =>
    github.calls.map(
      ({ argv }) => `/${argv.find((arg) => arg.startsWith("repos/")) ?? ""}`,
    );
  return { stages, leftTheServer, askedOfGitHub };
}

export function card(stages: Locator, title: string | RegExp): Locator {
  return stages.getByRole("article", { name: title });
}

export async function destination(link: Locator): Promise<URL> {
  return new URL((await link.getAttribute("href")) ?? "");
}
