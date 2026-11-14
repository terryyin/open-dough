// The dashboard `test` for a page case that kills the GitHub request owner
// its dashboard asks through: an owner of the case's own
// (../../../src/skills/dough-execute-plan/scripts/github-request-owner-test-fixtures.mjs),
// with every read the dashboard hands that owner's connection noted
// (./ownerSends.ts), so the case can wait until a read is queued at the owner,
// then kill the owner standing there and see the one started in its place.

import { privateRequestOwner } from "../../../src/skills/dough-execute-plan/scripts/github-request-owner-test-fixtures.mjs";
import { expect, test as base } from "../dashboardTest.ts";
import { ownerSends, type OwnerSends } from "./ownerSends.ts";

type RequestOwner = ReturnType<typeof privateRequestOwner>;

export const test = base.extend<{
  requestOwner: RequestOwner;
  sent: OwnerSends;
}>({
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  requestOwner: async ({}, use) => {
    const owner = privateRequestOwner();
    await use(owner);
    await owner.end();
  },
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  sent: async ({}, use, testInfo) => {
    await use(ownerSends(testInfo.outputPath("owner-sends")));
  },
  extraEnv: async ({ requestOwner, sent }, use) => {
    await use({ ...requestOwner.env, ...sent.env });
  },
});

// The one owner standing for the case's dashboard: its process and its
// record file, whose name carries its generation.
export type StandingOwner = { readonly pid: number; readonly file: string };

export function standingOwner(requestOwner: RequestOwner): StandingOwner {
  const [owner, ...others] = requestOwner.records() as StandingOwner[];
  expect(others).toEqual([]);
  if (owner === undefined) throw new Error("no request owner stood");
  return owner;
}

// A read naming `part` waits on its call once this dashboard has handed it
// to the owner's connection. Were it handed on only after the kill, the next
// owner would answer it and the record would not name the killed owner.
export async function waitingOnItsCall(sent: OwnerSends, part: string) {
  await expect.poll(() => sent.asked(part), { timeout: 10_000 }).toBe(1);
}
