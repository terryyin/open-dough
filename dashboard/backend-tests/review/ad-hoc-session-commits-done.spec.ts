import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { deliverCompletion } from "../../server/completionDelivery.ts";
import type { LaunchHost } from "../../server/launchHosts.ts";
import { keptSession } from "../../server/launchRecordStore.ts";
import { localFolder } from "../../server/projectFolders.ts";
import { nativeDoneMarkPending } from "../../src/doneMark.ts";
import {
  aCheckout,
  aDefaultLaunch,
  keep,
  markDone,
  minutesAgo,
  notCaptured,
  review,
  source,
  undoDone,
  work,
} from "../support/doneCaptureCase.ts";
import {
  aKeptReportingLaunch,
  keepReportedDone,
  marksWithRename,
} from "../support/reportedDoneCase.ts";

async function aSessionWithHeldRename() {
  const checkout = await aCheckout();
  const { record, origin, submission } = await aKeptReportingLaunch(checkout);

  let entered!: (stopped: AbortSignal) => void;
  const renameEntered = new Promise<AbortSignal>((resolve) => {
    entered = resolve;
  });
  let release!: () => void;
  const renameReleased = new Promise<void>((resolve) => {
    release = resolve;
  });
  const rename: NonNullable<LaunchHost["rename"]> = async (
    ...[, , , , stopped]
  ) => {
    stopped.addEventListener("abort", release, { once: true });
    entered(stopped);
    try {
      await renameReleased;
    } finally {
      stopped.removeEventListener("abort", release);
    }
  };
  const marks = marksWithRename(localFolder(checkout.integration), rename);
  onTestFinished(async () => {
    release();
    await marks.close();
  });
  return { checkout, record, marks, renameEntered, origin, submission };
}

test("a quiet report during an earlier rename wait refreshes the commits", async () => {
  const { checkout, record, marks, renameEntered, origin, submission } =
    await aSessionWithHeldRename();
  const reported = vi.spyOn(marks, "reported");
  const { first } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("first", { at: minutesAgo(40) }),
  );
  vi.setSystemTime(minutesAgo(30));
  const earlier = await deliverCompletion(submission, origin, marks);
  const stopped = await renameEntered;
  expect(await review(record)).toMatchObject({
    kind: "session-commits",
    session: { doneAt: earlier.receivedAt },
    tree: first,
  });

  const { second } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("second", { at: minutesAgo(20) }),
  );
  vi.setSystemTime(minutesAgo(10));
  const later = await deliverCompletion(submission, origin, marks);
  await reported.mock.results[1]?.value;

  expect(stopped.aborted).toBe(false);
  expect(await review(record)).toMatchObject({
    kind: "session-commits",
    session: { doneAt: later.receivedAt },
    commitRuns: [{ commits: 2, subject: "Add second.txt" }],
    tree: second,
  });
});

test("closing an in-flight reported rename aborts it and keeps the Done commits", async () => {
  const { checkout, record, marks, renameEntered, origin, submission } =
    await aSessionWithHeldRename();
  const { typo } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("typo", { at: minutesAgo(30) }),
  );
  const receipt = await deliverCompletion(submission, origin, marks);
  const stopped = await renameEntered;

  await marks.close();

  expect(stopped.aborted).toBe(true);
  expect(await keptSession(source, record.session)).toMatchObject({
    doneAt: receipt.receivedAt,
    sessionCommits: { runs: [{ base: checkout.base, revision: typo }] },
  });
});

test("reopening keeps the earlier commit run until the next Done", async () => {
  const checkout = await aCheckout();
  const record = aDefaultLaunch(checkout).please();
  keep(record);
  const { first } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("first", { at: minutesAgo(40) }),
  );
  const earlierDone = minutesAgo(30);
  vi.setSystemTime(earlierDone);
  await markDone(record, earlierDone);
  vi.setSystemTime(minutesAgo(25));
  await undoDone(record);
  const { second } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("second", { at: minutesAgo(20) }),
  );

  const reopened = await keptSession(source, record.session);
  expect(reopened?.doneAt).toBeUndefined();
  expect(reopened?.sessionCommits?.runs).toEqual([
    { base: checkout.base, revision: first },
  ]);

  const doneAt = minutesAgo(10);
  vi.setSystemTime(doneAt);
  await markDone(record, doneAt);
  expect(await review(record)).toMatchObject({
    kind: "session-commits",
    session: { launchedAt: record.launchedAt, doneAt },
    baseline: checkout.base,
    tree: second,
    commitRuns: [{ commits: 2, subject: "Add second.txt" }],
  });
});

test("a quiet report after confirmed native Done keeps the additional commit", async () => {
  const checkout = await aCheckout();
  const { first, second } = await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("first", { at: minutesAgo(40) })
      .committing("second", { at: minutesAgo(20) }),
  );
  const earlierDone = minutesAgo(30);
  const launch = aDefaultLaunch(checkout)
    .markedDoneAt(earlierDone)
    .keptSessionCommits({
      repository: path.join(checkout.integration, ".git"),
      runs: [{ base: checkout.base, revision: first }],
    });
  const { record, origin, submission } = await keepReportedDone(
    launch,
    earlierDone,
  );
  const rename = vi.fn(async () => {});
  const marks = marksWithRename(localFolder(checkout.integration), rename);
  onTestFinished(() => marks.close());
  const reported = vi.spyOn(marks, "reported");

  vi.setSystemTime(minutesAgo(10));
  const receipt = await deliverCompletion(submission.please(), origin, marks);
  await reported.mock.results[0]?.value;

  expect(receipt.receivedAt).not.toBe(earlierDone);
  expect(rename).not.toHaveBeenCalled();
  expect(await review(record)).toMatchObject({
    kind: "session-commits",
    session: { doneAt: receipt.receivedAt },
    baseline: checkout.base,
    tree: second,
    commitRuns: [{ commits: 2, subject: "Add second.txt" }],
  });
});

test("retrying the same quiet delivery resumes native Done without repeating its failed capture", async () => {
  const checkout = await aCheckout();
  const doneAt = minutesAgo(10);
  const launch = aDefaultLaunch(checkout)
    .markedDoneAt(doneAt, { problem: nativeDoneMarkPending })
    .sessionCommitsFailedAt(doneAt);
  const { record, receipt, delivery, origin, submission } =
    await keepReportedDone(launch, doneAt);
  await work(
    checkout,
    makeMe.aCheckoutWork.committing("typo", { at: minutesAgo(30) }),
  );
  const rename = vi.fn(async () => {});
  const marks = marksWithRename(localFolder(checkout.integration), rename);
  onTestFinished(() => marks.close());
  const reported = vi.spyOn(marks, "reported");

  expect(
    await deliverCompletion(
      submission.retrying(delivery).please(),
      origin,
      marks,
    ),
  ).toEqual(receipt);
  await reported.mock.results[0]?.value;

  expect(rename).toHaveBeenCalledTimes(1);
  const kept = await keptSession(source, record.session);
  expect(kept?.doneProblem).toBeUndefined();
  expect(kept?.sessionCommits).toEqual(record.sessionCommits);
  expect(kept?.sessionCommitsFailedAt).toBe(doneAt);
  expect(await review(record)).toEqual(notCaptured);
});
