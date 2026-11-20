// Done identifies other kept sessions that overlapped in the same checkout.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  aCheckout,
  aDefaultLaunch,
  anEstablishedSession,
  historyBeforeTheCase,
  keep,
  markDone,
  minutesAgo,
  review,
  work,
} from "../support/doneCaptureCase.ts";

test("two default launches open in one checkout both commit: either one's review holds the commits made while it was open and says the checkout was shared", async () => {
  const checkout = await aCheckout();
  const typo = aDefaultLaunch(checkout, {
    sessionId: "fix-typo",
    launchedAt: minutesAgo(70),
  }).please();
  const link = aDefaultLaunch(checkout, { sessionId: "fix-link" }).please();
  keep(typo, link);
  const { last } = await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("typo", { at: minutesAgo(40) })
      .committing("last", { at: minutesAgo(30) }),
  );
  const sharedReview = {
    commitRuns: [{ commits: 2 }],
    baseline: checkout.base,
    tree: last,
    session: { shared: true },
  };

  await markDone(typo, minutesAgo(15));
  expect(await review(typo)).toMatchObject(sharedReview);

  await markDone(link);
  expect(await review(link)).toMatchObject(sharedReview);
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
  const record = aDefaultLaunch(checkout).please();
  keep(isolated, record);
  const { committed } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("committed", { at: minutesAgo(30) }),
  );

  await markDone(record);

  const answer = await review(record);
  expect(answer).toMatchObject({ kind: "session-commits", tree: committed });
  expect(answer).not.toHaveProperty("session.shared");
});

test("a session done in the Default main checkout before this one launched does not share it", async () => {
  const checkout = await aCheckout();
  const earlier = anEstablishedSession(checkout, {
    sessionId: "done-before",
    launchedAt: minutesAgo(90),
  })
    .markedDoneAt(minutesAgo(70))
    .please();
  const record = aDefaultLaunch(checkout).please();
  keep(earlier, record);
  const { committed } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("committed", { at: minutesAgo(30) }),
  );

  await markDone(record);

  const answer = await review(record);
  expect(answer).toMatchObject({ kind: "session-commits", tree: committed });
  expect(answer).not.toHaveProperty("session.shared");
});
