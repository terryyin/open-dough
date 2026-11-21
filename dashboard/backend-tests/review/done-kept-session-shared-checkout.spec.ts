// Done identifies other kept sessions that overlapped in the same checkout,
// and the review says so.
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  keptSession,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { checkoutSharedMeanwhile } from "../../server/sessionCheckoutShared.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { type Checkout, keep, source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { aDoneSession } from "../support/doneCaptureReview.ts";

// Whether Done of `record`, at its stated Done time, finds its checkout shared
// among `kept`.
const sharedAtDone = (
  checkout: Checkout,
  record: LaunchRecord,
  kept: readonly LaunchRecord[],
) => checkoutSharedMeanwhile(record, { workspace: checkout.integration }, kept);

test("Done saves the run and shared flag when two sessions overlap in Default main", async () => {
  const {
    checkout,
    records: { first, other },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withDefaultMainLaunch("first", { launched: 60 })
    .withDefaultMainLaunch("other", { launched: 60 })
    .please();
  keep(first, other);
  const { committed } = await performWork(
    makeMe.aCheckoutWork.committing("committed", { at: at(30) }),
  );
  const doneAt = at(10);

  await setRecordDoneAt(source, first.session, doneAt);

  const saved = await keptSession(source, first.session);
  expect(saved?.doneAt).toBe(doneAt);
  expect(saved?.sessionCommits).toMatchObject({
    runs: [{ base: checkout.base, revision: committed }],
    shared: true,
  });
});

test("a session done after this one launched still shares the Default main checkout", async () => {
  const {
    checkout,
    records: { earlier, session },
  } = await aDoneCaptureCase()
    .withDefaultMainLaunch("earlier", { launched: 70, done: 15 })
    .withDefaultMainLaunch("session", { launched: 60, done: 10 })
    .please();

  expect(sharedAtDone(checkout, session, [earlier])).toBe(true);
});

test("a session open meanwhile in an isolated workspace of the project does not share the Default main checkout", async () => {
  const {
    checkout,
    records: { session },
    at,
  } = await aDoneCaptureCase()
    .withWorkspace("isolated")
    .withDefaultMainLaunch("session", { launched: 60, done: 10 })
    .please();
  const workspace = checkout.execution;
  if (workspace === undefined) throw new Error("Missing isolated worktree");
  const isolated = makeMe.aLaunchRecord
    .adHoc({ title: "Isolated meanwhile" })
    .inIsolatedWorkspace({ workspace, branch: "isolated" })
    .inClaudeSession({ sessionId: "isolated-meanwhile" })
    .launchedAt(at(70))
    .please();

  expect(sharedAtDone(checkout, session, [isolated])).toBe(false);
});

test("a session done in the Default main checkout before this one launched does not share it", async () => {
  const {
    checkout,
    records: { earlier, session },
  } = await aDoneCaptureCase()
    .withEstablishedSession("earlier", { launched: 90, done: 70 })
    .withDefaultMainLaunch("session", { launched: 60, done: 10 })
    .please();

  expect(sharedAtDone(checkout, session, [earlier])).toBe(false);
});

test("Review says the checkout was shared when its kept run has the flag", async () => {
  const { checkout, performWork, at } = await aDoneCaptureCase().please();
  const { committed } = await performWork(
    makeMe.aCheckoutWork.committing("committed", { at: at(30) }),
  );
  const record = makeMe.aLaunchRecord
    .ofDefaultMainLaunch("default-launch", checkout)
    .launchedAt(at(60))
    .keptSessionCommits({
      repository: checkout.integration,
      runs: [{ base: checkout.base, revision: committed }],
      shared: true,
    })
    .markedDone()
    .please();

  expect(
    await storyReview({ record, read: {} }, new AbortController().signal),
  ).toMatchObject({
    kind: "session-commits",
    session: { shared: true },
  });
});

test("a session whose checkout was not shared reviews its commits without saying it was shared", async () => {
  const { checkout, performWork, at } = await aDoneCaptureCase().please();
  const { committed } = await performWork(
    makeMe.aCheckoutWork.committing("committed", { at: at(30) }),
  );
  const record = aDoneSession(checkout, [
    { base: checkout.base, revision: committed },
  ]);

  const answer = await storyReview(
    { record, read: {} },
    new AbortController().signal,
  );
  expect(answer).toMatchObject({ kind: "session-commits", tree: committed });
  expect(answer).not.toHaveProperty("session.shared");
});
