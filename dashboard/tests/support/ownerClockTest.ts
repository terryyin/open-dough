// The dashboard `test` for a page case that passes GitHub's directed waits on
// the request owner's time: its dashboard asks GitHub through an owner of its
// own, the released one started with a time the case advances
// (./listingReuseWithOwnerClock.ts). The owner serves only the case that asks
// for this `test`; every other case keeps the shared owner and its real clock.

import { requestOwnerEnvironmentAt } from "../../../src/skills/dough-execute-plan/scripts/github-request-owner-test-fixtures.mjs";
import { test as base } from "../dashboardTest.ts";
import { requestOwnerWithClock } from "./listingReuseWithOwnerClock.ts";

export const test = base.extend<{
  owner: Awaited<ReturnType<typeof requestOwnerWithClock>>;
}>({
  owner: async ({ github }, use) => {
    const owner = await requestOwnerWithClock(github);
    await use(owner);
    await owner.close();
  },
  extraEnv: async ({ owner }, use) => {
    await use(requestOwnerEnvironmentAt(owner.wiring.requestOwnerRoot));
  },
  pathPrefix: async ({ owner }, use) => {
    await use(owner.wiring.pathPrefix);
  },
});
