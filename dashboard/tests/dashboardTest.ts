// The test every page journey runs under. Each test gets its own fake GitHub
// (./support/fakeGitHub.ts) and its own built-preview dashboard server whose
// synthetic `gh` answers from it (./support/dashboardServer.ts); `page`
// opens that server at `/`. So a journey decides only what GitHub would
// answer the local `gh`, and the page, its local authenticated read
// boundary, and the `gh` invocation are the production ones. A boundary spec
// (../backend-tests/) built on the same fixtures sets `serverMode` to `boundary`
// and gets the local boundaries alone, without Vite or the build; it opens
// no page.
//
// No request from the page may leave the loopback server. A request to
// GitHub's API from the browser itself would mean the page bypassed the
// local boundary, so it fails the test that made it.
//
// A journey hands its scratch repositories to `afterGitHubStops`, which
// removes them once the page, its dashboard server, and the fake GitHub have
// stopped, so a read still in flight when the journey ends never finds its
// repository gone.

import type { BrowserContext, Page } from "@playwright/test";
import { revisionStreamSlotLockNames } from "../src/revisionStreamSlot.ts";
import { test as base, expect } from "./support/pageTest.ts";
import type { FakeCodex } from "./support/fakeCodex.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardCursorRunner,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  everyRepository,
  startFakeGitHub,
  type FakeGitHub,
} from "./support/fakeGitHub.ts";
import { defaultBaseCiRevision } from "./support/baseCiActions.ts";
import { publishes } from "./support/publishedRepository.ts";

// Hold both capped stream slots before the page's own scripts run, so journey
// pages see a genuine "other tabs hold the slots" condition and keep proving
// check delivery. Stream journeys opt out with `preholdRevisionStreamSlots:
// false`.
function holdRevisionStreamSlots(names: readonly string[]): void {
  for (const name of names) {
    void navigator.locks.request(name, () => new Promise(() => {}));
  }
}

export { expect };

const githubServing = new WeakMap<BrowserContext, FakeGitHub>();
type Removal = () => void | Promise<void>;
const removalsAfterStop = new WeakMap<FakeGitHub, Removal[]>();

// Which server the `dashboard` fixture starts: the built preview a page
// journey opens, or the local boundaries alone for a boundary spec.
export type FixtureServerMode = "preview" | "boundary";

// The start of the fixture's server: a preview serves the run's build; the
// boundary server needs none. A fixture extending this one (for example
// ./support/preparationPage.ts) starts its server the same way.
export function fixtureServerMode(serverMode: FixtureServerMode) {
  return serverMode === "preview"
    ? ({ mode: "preview", prebuilt: sharedDashboardBuild } as const)
    : ({ mode: "boundary" } as const);
}

// The dashboard server's environment from the `extraEnv` and
// `startTimeoutMs` options.
export function fixtureExtraEnv(
  extraEnv: Readonly<Record<string, string>> | undefined,
  startTimeoutMs: number | undefined,
) {
  return {
    ...extraEnv,
    ...(startTimeoutMs === undefined
      ? {}
      : { DOUGH_START_TIMEOUT_MS: String(startTimeoutMs) }),
  };
}

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
  // How long this page's dashboard waits on its `gh` before reporting a
  // stalled read; the server's own bound when unset. A journey that waits
  // the bound out sets a short one with `test.use`.
  readTimeoutMs: number | undefined;
  // Folders under this page's dashboard HOME's `git/`, as catalog projects'
  // folders for its synthetic `claude`; none when unset. A journey that
  // launches an agent names them with `test.use`, and may shorten the
  // server's launch wait the same way.
  projectFolders: readonly string[] | undefined;
  machine: string | undefined;
  codexProtocol: FakeCodex | undefined;
  launchTimeoutMs: number | undefined;
  // How long this page's dashboard waits on a workflow's start before its
  // launch answers uncertain; the server's own bound when unset.
  startTimeoutMs: number | undefined;
  extraEnv: Readonly<Record<string, string>> | undefined;
  pathPrefix: readonly string[] | undefined;
  // Listing reuse ms; harness default and meaning live on `startDashboardServer`.
  revisionCheckReuseMs: number | undefined;
  // Whether the journey runs the server's reuse-window clock itself
  // (`dashboard.advanceObservationClock`); harness meaning on `startDashboardServer`.
  observationClock: boolean;
  // `stand-in` when Cursor operations are outside the proof; default `real`.
  // Same boundary as `startDashboardServer`'s `cursorRunner` option.
  cursorRunner: DashboardCursorRunner;
  serverMode: FixtureServerMode;
  // When true (the default), the context pre-holds both stream slots so
  // existing check journeys keep proving check delivery. Stream journeys set
  // false so pages may take the slots themselves.
  preholdRevisionStreamSlots: boolean;
  afterGitHubStops: (removal: Removal) => void;
  github: FakeGitHub;
  dashboard: DashboardServer;
}>({
  readTimeoutMs: [undefined, { option: true }],
  projectFolders: [undefined, { option: true }],
  machine: [undefined, { option: true }],
  codexProtocol: [undefined, { option: true }],
  launchTimeoutMs: [undefined, { option: true }],
  startTimeoutMs: [undefined, { option: true }],
  extraEnv: [undefined, { option: true }],
  pathPrefix: [undefined, { option: true }],
  revisionCheckReuseMs: [undefined, { option: true }],
  observationClock: [false, { option: true }],
  cursorRunner: ["real", { option: true }],
  serverMode: ["preview", { option: true }],
  preholdRevisionStreamSlots: [true, { option: true }],
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  github: async ({}, use) => {
    const github = await startFakeGitHub();
    github.serve(
      everyRepository,
      publishes({ revision: defaultBaseCiRevision }),
    );
    const removals: Removal[] = [];
    removalsAfterStop.set(github, removals);
    await use(github);
    await github.close();
    for (const removal of removals.reverse()) await removal();
  },
  afterGitHubStops: async ({ github }, use) => {
    const removals = removalsAfterStop.get(github) ?? [];
    await use((removal) => removals.push(removal));
  },
  dashboard: async (
    {
      github,
      readTimeoutMs,
      projectFolders,
      launchTimeoutMs,
      startTimeoutMs,
      machine,
      codexProtocol,
      extraEnv,
      pathPrefix,
      revisionCheckReuseMs,
      observationClock,
      cursorRunner,
      serverMode,
    },
    use,
  ) => {
    const server = await startDashboardServer({
      ...fixtureServerMode(serverMode),
      github,
      readTimeoutMs,
      projectFolders,
      launchTimeoutMs,
      machine,
      codexProtocol,
      revisionCheckReuseMs,
      observationClock,
      cursorRunner,
      ...(pathPrefix === undefined ? {} : { pathPrefix }),
      extraEnv: fixtureExtraEnv(extraEnv, startTimeoutMs),
    });
    await use(server);
    await server.close();
  },
  baseURL: async ({ dashboard }, use) => {
    await use(dashboard.baseURL);
  },
  context: async ({ context, github, preholdRevisionStreamSlots }, use) => {
    githubServing.set(context, github);
    if (preholdRevisionStreamSlots) {
      await context.addInitScript(
        holdRevisionStreamSlots,
        revisionStreamSlotLockNames(),
      );
    }
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
