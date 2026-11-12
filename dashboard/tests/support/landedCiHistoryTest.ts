// The test of the landed CI wall-time history's boundary specs
// (../../backend-tests/intent/landed-ci-history-*.spec.ts): a real start
// origin and its GitHub (./preparationPage.ts), and `startServer`, which
// starts a boundary dashboard server on the origin's machine that collects
// recorded landings' CI and checks pending ones again at a test's pace
// (`recheckingLandedCi`, ./landedCiHistory.ts), as a production dashboard
// does, closing each such server once its test ends.

import {
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import { recheckingLandedCi } from "./landedCiHistory.ts";
import { test as base } from "./preparationPage.ts";

export { expect } from "./preparationPage.ts";

// How a test's server differs from a production dashboard asking the test's
// GitHub: it asks another, it runs in the development environment, or its
// observation clock moves only as the test advances it.
type ServerFacts = {
  readonly github?: FakeGitHub;
  readonly environment?: "development";
  readonly observationClock?: true;
  readonly adapterTimeoutMs?: number;
};

export const test = base.extend<{
  startServer: (facts?: ServerFacts) => Promise<DashboardServer>;
}>({
  // These specs open no page, and Playwright resolves `baseURL` for every
  // test, so the page fixture's `baseURL` (../dashboardTest.ts) would start
  // its `dashboard` server in each case. With no page address here, a case
  // runs only the servers it starts and the `dashboard` it asks for by name.
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  baseURL: async ({}, use) => {
    await use(undefined);
  },
  startServer: async ({ origin, github }, use) => {
    const started: DashboardServer[] = [];
    await use(
      async ({
        github: answering = github,
        adapterTimeoutMs,
        ...facts
      } = {}) => {
        const server = await startDashboardServer({
          mode: "boundary",
          ...facts,
          github: answering,
          machine: origin.machine,
          projectFolders: ["open-dough"],
          extraEnv: {
            ...recheckingLandedCi,
            ...(adapterTimeoutMs === undefined
              ? {}
              : { DOUGH_CI_ADAPTER_TIMEOUT_MS: String(adapterTimeoutMs) }),
          },
        });
        started.push(server);
        return server;
      },
    );
    await Promise.all(started.map((server) => server.close()));
  },
});

// Cases whose worker prepares the queued Claude origin and the server bundle
// before they start (./pageTest.ts), so none waits for them in its own time.
export const queuedClaudeBoundaryTest = test.extend({
  originRepository: async (
    { queuedClaudeBoundaryReady, originRepository },
    use,
  ) => {
    await Promise.resolve(queuedClaudeBoundaryReady);
    await use(originRepository);
  },
});
