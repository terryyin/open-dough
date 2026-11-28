// The test every dashboard spec runs under, directly or through a fixture
// module built on it (../dashboardTest.ts and the modules extending that).
//
// A spec waits for the event it depends on and never waits out a deadline;
// when the state it needs leaves no trace the test can see, it adds an
// observation of its own, such as a test-side loader in the server, rather
// than a sleep.
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
// `@playwright/test` under `dashboard/test-support/`.
//
// Every worker-scoped fixture of the suite is registered here, whichever
// specs take it, from ./workerPreparationFixtures.ts.
// Playwright runs a test only in a worker whose fixture pool
// declares the same worker-scoped fixtures (the worker hash is the set of
// those registrations, not the fixtures a test uses), so a worker-scoped
// fixture declared in one fixture module but not another splits the specs
// into worker populations that cannot share a worker, and each switch
// between them stops a worker and starts a fresh one. A `test.use` of a
// worker-scoped option (`launchOptions`) has the same effect, with one
// population per distinct value object; that value also replaces the
// configured browser arguments, so it spreads them in (./browserArgs.ts).
// A fixture module declares its option defaults on its fixtures, not with a
// module-level `test.use`, which applies only to the first spec file that
// loads the module in a worker.

import { test as base } from "@playwright/test";
import { noteRequestsInEveryPage } from "../pageRequestNotes.ts";
import { endDescendantsAtExit } from "./processGroup.ts";
import { finishRouteHandlers } from "./routeHandlerTeardown.ts";
import {
  workerPreparationFixtures,
  type WorkerPreparationFixtures,
} from "./workerPreparationFixtures.ts";

export { expect } from "@playwright/test";
export type { FixtureServerMode } from "./serverInputWorkerFixtures.ts";

// No process a test started outlives its worker (./processGroup.ts).
endDescendantsAtExit();

// Playwright's worker-only extension takes an empty test-fixture type.
export const test = base.extend<object, WorkerPreparationFixtures>({
  ...workerPreparationFixtures,
  context: async ({ context }, use) => {
    await noteRequestsInEveryPage(context);
    await use(context);
  },
  page: async ({ page }, use) => {
    await use(page);
    await finishRouteHandlers(page);
  },
});
