// The test every dashboard spec runs under, directly or through a fixture
// module built on it (../dashboardTest.ts and the modules extending that).
//
// A spec waits for the event it depends on: a shown fact, a recorded state,
// a held request reaching its handler. It never waits out a deadline, sleeps,
// or retries in the hope that the event has happened by then. When the state
// it needs leaves no trace the test can see, it adds an observation of its
// own, such as a test-side loader in the server, rather than a sleep. Only a
// check that something does not happen waits out a window, because no event
// marks that absence.
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

import { test as base } from "@playwright/test";
import { noteRequestsInEveryPage } from "../pageRequestNotes.ts";
import { endDescendantsAtExit } from "./processGroup.ts";

export { expect } from "@playwright/test";

// No process a test started outlives its worker (./processGroup.ts).
endDescendantsAtExit();

export const test = base.extend({
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
