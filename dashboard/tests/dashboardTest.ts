// The test every page journey runs under. Each test gets its own fake GitHub
// (./support/fakeGitHub.ts) and its own built-preview dashboard server whose
// synthetic `gh` answers from it (./support/dashboardServer.ts); `page`
// opens that server at `/`. So a journey decides only what GitHub would
// answer the local `gh`, and the page, its local authenticated read
// boundary, and the `gh` invocation are the production ones.
//
// No request from the page may leave the loopback server. A request to
// GitHub's API from the browser itself would mean the page bypassed the
// local boundary, so it fails the test that made it.

import {
  test as base,
  expect,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { startFakeGitHub, type FakeGitHub } from "./support/fakeGitHub.ts";

export { expect };

const githubServing = new WeakMap<BrowserContext, FakeGitHub>();

// Page time stands still at `at` until a journey lets it pass. The clock is
// installed an hour earlier because it runs until paused, and Playwright
// refuses to pause it in the past; no page is open yet, so that hour fires
// nothing.
export async function pausePageClockAt(page: Page, at: Date): Promise<void> {
  await page.clock.install({ time: new Date(at.getTime() - 60 * 60_000) });
  await page.clock.pauseAt(at);
}

// The fake GitHub answering the `gh` behind this page's dashboard.
export function githubFor(page: Page): FakeGitHub {
  const github = githubServing.get(page.context());
  if (github === undefined) {
    throw new Error("This page was not opened by the dashboard test fixture.");
  }
  return github;
}

export const test = base.extend<{
  github: FakeGitHub;
  dashboard: DashboardServer;
}>({
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  github: async ({}, use) => {
    const github = await startFakeGitHub();
    await use(github);
    await github.close();
  },
  dashboard: async ({ github }, use) => {
    const server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      github,
    });
    await use(server);
    await server.close();
  },
  baseURL: async ({ dashboard }, use) => {
    await use(dashboard.baseURL);
  },
  context: async ({ context, github }, use) => {
    githubServing.set(context, github);
    const directGitHubReads: string[] = [];
    await context.route(
      /^https?:\/\/(?!(localhost|127\.0\.0\.1)[:/])/,
      (route) => {
        const url = route.request().url();
        if (new URL(url).hostname === "api.github.com") {
          directGitHubReads.push(url);
        }
        return route.abort();
      },
    );
    await use(context);
    expect(
      directGitHubReads,
      "the page read GitHub directly instead of through the local boundary",
    ).toEqual([]);
  },
});
