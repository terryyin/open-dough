// Done identifies other kept sessions that overlapped in the same checkout,
// and the review says so.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  keptSession,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { checkoutSharedMeanwhile } from "../../server/sessionCheckoutShared.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  aCheckout,
  aDefaultLaunch,
  anEstablishedSession,
  type Checkout,
  historyBeforeTheCase,
  keep,
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";
import { aDoneSession, review } from "../support/doneCaptureReview.ts";

// Whether Done of `record` at `doneAt` finds its checkout shared among `kept`.
const sharedAtDone = (
  checkout: Checkout,
  record: LaunchRecord,
  kept: readonly LaunchRecord[],
) =>
  checkoutSharedMeanwhile(
    { ...record, doneAt: minutesAgo(10) },
    { workspace: checkout.integration },
    kept,
  );

test("Done saves the run and shared flag when two sessions overlap in Default main", async () => {
  const checkout = await aCheckout();
  const first = aDefaultLaunch(checkout, { sessionId: "first" }).please();
  const other = aDefaultLaunch(checkout, { sessionId: "other" }).please();
  keep(first, other);
  const { committed } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("committed", { at: minutesAgo(30) }),
  );
  const doneAt = minutesAgo(10);

  await setRecordDoneAt(source, first.session, doneAt);

  const saved = await keptSession(source, first.session);
  expect(saved?.doneAt).toBe(doneAt);
  expect(saved?.sessionCommits).toMatchObject({
    runs: [{ base: checkout.base, revision: committed }],
    shared: true,
  });
});

test("a session done after this one launched still shares the Default main checkout", async () => {
  const checkout = await aCheckout();
  const earlier = aDefaultLaunch(checkout, {
    sessionId: "earlier",
    launchedAt: minutesAgo(70),
  })
    .markedDoneAt(minutesAgo(15))
    .please();
  const record = aDefaultLaunch(checkout).please();

  expect(sharedAtDone(checkout, record, [earlier])).toBe(true);
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

test("Review says the checkout was shared when its kept run has the flag", async () => {
  const checkout = await aCheckout();
  const { committed } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("committed", { at: minutesAgo(30) }),
  );
  const record = aDefaultLaunch(checkout)
    .keptSessionCommits({
      repository: checkout.integration,
      runs: [{ base: checkout.base, revision: committed }],
      shared: true,
    })
    .markedDone()
    .please();

  expect(await review([record], record)).toMatchObject({
    kind: "session-commits",
    session: { shared: true },
  });
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
