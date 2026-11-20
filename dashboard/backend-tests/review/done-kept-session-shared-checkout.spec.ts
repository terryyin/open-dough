// Done identifies other kept sessions that overlapped in the same checkout,
// and the review says so.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { checkoutSharedMeanwhile } from "../../server/sessionCheckoutShared.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  aCheckout,
  aDefaultLaunch,
  anEstablishedSession,
  type Checkout,
  historyBeforeTheCase,
  minutesAgo,
  work,
} from "../support/doneCaptureCase.ts";
import { aDoneSession, review } from "../support/doneCaptureReview.ts";

// Whether Done of `record` at `doneAt` finds its checkout shared among `kept`.
const sharedAtDone = (
  checkout: Checkout,
  record: LaunchRecord,
  kept: readonly LaunchRecord[],
  doneAt = minutesAgo(10),
) =>
  checkoutSharedMeanwhile(
    { ...record, doneAt },
    { workspace: checkout.integration },
    kept,
  );

test("two sessions open together in the Default main checkout share it: either one's Done finds the other", async () => {
  const checkout = await aCheckout();
  const typo = aDefaultLaunch(checkout, {
    sessionId: "fix-typo",
    launchedAt: minutesAgo(70),
  });
  const typoOpen = typo.please();
  const link = aDefaultLaunch(checkout, { sessionId: "fix-link" }).please();

  expect(
    sharedAtDone(checkout, typoOpen, [typoOpen, link], minutesAgo(15)),
  ).toBe(true);
  const typoDone = typo.markedDoneAt(minutesAgo(15)).please();
  expect(sharedAtDone(checkout, link, [typoDone, link])).toBe(true);
});

test("a session open meanwhile in an isolated workspace of the project does not share the Default main checkout", async () => {
  const checkout = await aCheckout({
    history: historyBeforeTheCase().withWorkspace("isolated", { from: "base" }),
  });
  const workspace = checkout.execution;
  if (workspace === undefined) throw new Error("Missing isolated worktree");
  const isolated = makeMe.aLaunchRecord
    .adHoc({ title: "Isolated meanwhile" })
    .inIsolatedWorkspace({ workspace, branch: "isolated" })
    .inClaudeSession({ sessionId: "isolated-meanwhile" })
    .launchedAt(minutesAgo(70))
    .please();

  expect(
    sharedAtDone(checkout, aDefaultLaunch(checkout).please(), [isolated]),
  ).toBe(false);
});

test("a session done in the Default main checkout before this one launched does not share it", async () => {
  const checkout = await aCheckout();
  const earlier = anEstablishedSession(checkout, {
    sessionId: "done-before",
    launchedAt: minutesAgo(90),
  })
    .markedDoneAt(minutesAgo(70))
    .please();

  expect(
    sharedAtDone(checkout, aDefaultLaunch(checkout).please(), [earlier]),
  ).toBe(false);
});

test("two default launches open in one checkout both commit: either one's review holds the commits made while it was open and says the checkout was shared", async () => {
  const checkout = await aCheckout();
  const { last } = await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("typo", { at: minutesAgo(40) })
      .committing("last", { at: minutesAgo(30) }),
  );
  const kept = {
    repository: checkout.integration,
    runs: [{ base: checkout.base, revision: last }],
    shared: true as const,
  };
  const typo = aDefaultLaunch(checkout, {
    sessionId: "fix-typo",
    launchedAt: minutesAgo(70),
  })
    .keptSessionCommits(kept)
    .markedDoneAt(minutesAgo(15))
    .please();
  const link = aDefaultLaunch(checkout, { sessionId: "fix-link" })
    .keptSessionCommits(kept)
    .markedDone()
    .please();
  const sharedReview = {
    commitRuns: [{ commits: 2 }],
    baseline: checkout.base,
    tree: last,
    session: { shared: true },
  };

  expect(await review([typo, link], typo)).toMatchObject(sharedReview);
  expect(await review([typo, link], link)).toMatchObject(sharedReview);
});

test("a session whose checkout was not shared reviews its commits without saying it was shared", async () => {
  const checkout = await aCheckout();
  const { committed } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("committed", { at: minutesAgo(30) }),
  );
  const record = aDoneSession(checkout, [
    { base: checkout.base, revision: committed },
  ]);

  const answer = await review([record], record);
  expect(answer).toMatchObject({ kind: "session-commits", tree: committed });
  expect(answer).not.toHaveProperty("session.shared");
});
