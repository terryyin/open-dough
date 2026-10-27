// The test every dashboard spec runs under, directly or through a fixture
// module built on it (../dashboardTest.ts and the modules extending that).
//
// A spec waits for the event it depends on and never waits out a deadline
// (../README.md, "Synchronization"); when the state it needs leaves no trace
// the test can see, it adds an observation of its own, such as a test-side
// loader in the server, rather than a sleep.
//
// One such event is shared by every page spec: the page's intercepted reads
// finishing. A route handler may still be reading its fetched answer when the
// test's last assertion passes, and Playwright disposes those answers with the
// context. So the `page` fixture finishes every handler of the page before it
// is torn down, and no spec needs a teardown of its own for it. Another is
// the answer to a read the page sent on opening: every page of the test's
// context notes its requests from before its own scripts run
// (../pageRequestNotes.ts), whichever server the spec opens it at, so a first
// check after an open can wait for that answer. Specs import `test` from
// here; the lint configuration rejects a direct import of `test` from
// `@playwright/test` under `dashboard/tests/`.
//
// Every worker-scoped fixture of the suite is declared here, whichever specs
// take it. Playwright runs a test only in a worker whose fixture pool
// declares the same worker-scoped fixtures (the worker hash is the set of
// those registrations, not the fixtures a test uses), so a worker-scoped
// fixture declared in one fixture module but not another splits the specs
// into worker populations that cannot share a worker, and each switch
// between them stops a worker and starts a fresh one. A `test.use` of a
// worker-scoped option (`launchOptions`) has the same effect, with one
// population per distinct value object.

import { test as base } from "@playwright/test";
import type { LaunchJourney } from "../launchJourney.ts";
import { noteRequestsInEveryPage } from "../pageRequestNotes.ts";
import { endDescendantsAtExit } from "./processGroup.ts";

export { expect } from "@playwright/test";

// No process a test started outlives its worker (./processGroup.ts).
endDescendantsAtExit();

// Playwright's worker-only extension takes an empty test-fixture type.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const test = base.extend<{}, { launchJourney: LaunchJourney }>({
  // The launch journeys' origin (../launchJourney.ts says what it publishes),
  // published once per worker and read, never written, by every journey the
  // worker runs from it (../launchStoryCardPage.ts serves it as GitHub would).
  // Publishing runs real git and the backlog CLI; its own bound keeps a busy
  // machine from starving it, and only a worker that takes the fixture loads
  // the publishing code.
  launchJourney: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { publishLaunchJourney } = await import("../launchJourney.ts");
      const journey = await publishLaunchJourney();
      await use(journey);
      await journey.cleanup();
    },
    { scope: "worker", timeout: 120_000 },
  ],
  context: async ({ context }, use) => {
    await noteRequestsInEveryPage(context);
    await use(context);
  },
  page: async ({ page }, use) => {
    await use(page);
    // A spec that closed its page has no handler left to finish.
    if (!page.isClosed()) await page.unrouteAll({ behavior: "wait" });
  },
});
