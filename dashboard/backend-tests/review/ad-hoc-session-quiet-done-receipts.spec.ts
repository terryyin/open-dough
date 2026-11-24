// Quiet completions after a recorded receipt: the launch, its accepted
// reporting attempt and receipt, and the Done sequence from one Done capture
// case.
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { deliverCompletion } from "../../server/completionDelivery.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { HostOperationFailure } from "../../server/hostLaunch.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import type { LaunchHost } from "../../server/launchHosts.ts";
import { keptSession } from "../../server/launchRecordStore.ts";
import { localFolder } from "../../server/localFolder.ts";
import type { CompletionReceipt } from "../../src/completionReport.ts";
import { nativeDoneMarkPending } from "../../src/doneMark.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { minutesAgo, source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { dashboardReporting } from "../support/publisherDashboardOrigin.ts";

const delivery = "55555555-5555-4555-8555-555555555555";
const submissionFor = (record: LaunchRecord) =>
  makeMe.aCompletionSubmission.reportingFor({
    host: record.session.host,
    reference: dashboardReporting.reference,
  });
const marksRenamingWith = (
  folder: ReturnType<typeof localFolder>,
  rename: NonNullable<LaunchHost["rename"]>,
) =>
  new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: (host) =>
      host === "claude" ? { name: "Claude", rename } : undefined,
    reportingFolder: () => folder,
  });

// The completion reported at `doneAt`.
const aReceivedCompletion = (doneAt: string) =>
  makeMe.aCompletionReport
    .reportedFor({ reference: dashboardReporting.reference, delivery })
    .receivedAt(doneAt)
    .please();

// Keeps the launch's accepted reporting attempt with the completion's recorded
// receipt, and answers the receipt.
async function keepRecordedAttempt(
  record: LaunchRecord,
  completion: ReturnType<typeof aReceivedCompletion>,
) {
  const { host, sessionId } = record.session;
  const receipt: CompletionReceipt = {
    ...completion,
    state: "recorded",
    session: { host, sessionId },
  };
  await keepAttempt(
    makeMe.anAcceptedAttempt
      .reportingFor(record)
      .withCompletion(completion, [receipt])
      .please(),
  );
  return receipt;
}

test("a quiet report after confirmed native Done keeps the Done mark without pinning unpublished commits", async () => {
  const times = { launched: 60, done: 30 };
  const completion = aReceivedCompletion(minutesAgo(times.done));
  const {
    checkout,
    records: { "default-launch": record },
    at,
  } = await aDoneCaptureCase()
    .withWork((at) =>
      makeMe.aCheckoutWork
        .committing("first", { at: at(40) })
        .committing("second", { at: at(20) }),
    )
    .withCheckoutLaunch("default-launch", times, (launch) =>
      launch.reportingThrough(dashboardReporting).completedWith(completion),
    )
    .kept()
    .please();
  await keepRecordedAttempt(record, completion);
  const rename = vi.fn(async () => {});
  const marks = marksRenamingWith(localFolder(checkout.integration), rename);
  onTestFinished(() => marks.close());
  const reported = vi.spyOn(marks, "reported");

  vi.setSystemTime(at(10));
  const received = await deliverCompletion(
    submissionFor(record).please(),
    dashboardReporting.origin,
    marks,
  );
  await reported.mock.results[0]?.value;

  expect(received.receivedAt).not.toBe(completion.receivedAt);
  expect(rename).not.toHaveBeenCalled();
  expect(await keptSession(source, record.session)).toMatchObject({
    doneAt: received.receivedAt,
  });
  expect(
    (
      await git(
        checkout.integration,
        "for-each-ref",
        "refs/open-dough/session-commits",
      )
    ).stdout,
  ).toBe("");
});

test("retrying the same quiet delivery resumes native Done from the recorded receipt", async () => {
  const times = { launched: 60, done: 10 };
  const doneAt = minutesAgo(times.done);
  const completion = aReceivedCompletion(doneAt);
  const {
    checkout,
    records: { "default-launch": record },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withCheckoutLaunch("default-launch", times, (launch) =>
      launch
        .markedDoneAt(doneAt, { problem: nativeDoneMarkPending })
        .reportingThrough(dashboardReporting)
        .completedWith(completion),
    )
    .kept()
    .please();
  const receipt = await keepRecordedAttempt(record, completion);
  await performWork(makeMe.aCheckoutWork.committing("typo", { at: at(30) }));
  const rename = vi.fn(async () => {});
  const marks = marksRenamingWith(localFolder(checkout.integration), rename);
  onTestFinished(() => marks.close());
  const reported = vi.spyOn(marks, "reported");

  expect(
    await deliverCompletion(
      submissionFor(record).retrying(delivery).please(),
      dashboardReporting.origin,
      marks,
    ),
  ).toEqual(receipt);
  await reported.mock.results[0]?.value;

  expect(rename).toHaveBeenCalledTimes(1);
  const kept = await keptSession(source, record.session);
  expect(kept).toMatchObject({ doneAt });
  expect(kept?.doneProblem).toBeUndefined();
  expect(kept?.sessionCommits).toBeUndefined();
});

test("a retry during a failing native Done resumes it once that Done settles", async () => {
  const times = { launched: 60, done: 10 };
  const doneAt = minutesAgo(times.done);
  const completion = aReceivedCompletion(doneAt);
  const {
    checkout,
    records: { "default-launch": record },
  } = await aDoneCaptureCase()
    .withCheckoutLaunch("default-launch", times, (launch) =>
      launch
        .markedDoneAt(doneAt, { problem: nativeDoneMarkPending })
        .reportingThrough(dashboardReporting)
        .completedWith(completion),
    )
    .kept()
    .please();
  await keepRecordedAttempt(record, completion);
  let refuse!: (failure: Error) => void;
  let renamed!: () => void;
  const renaming = new Promise<void>((resolve) => {
    renamed = resolve;
  });
  const rename = vi
    .fn<NonNullable<LaunchHost["rename"]>>(async () => {})
    .mockImplementationOnce(() => {
      renamed();
      return new Promise<void>((...[, reject]) => {
        refuse = reject;
      });
    });
  const marks = marksRenamingWith(localFolder(checkout.integration), rename);
  onTestFinished(() => marks.close());
  const reported = vi.spyOn(marks, "reported");
  const retry = () =>
    deliverCompletion(
      submissionFor(record).retrying(delivery).please(),
      dashboardReporting.origin,
      marks,
    );

  await retry();
  await renaming;
  await retry();
  refuse(new HostOperationFailure("Native rename refused."));
  await vi.waitFor(() => {
    expect(rename).toHaveBeenCalledTimes(2);
  });
  await Promise.all(
    reported.mock.results.map((result): unknown => result.value),
  );

  expect(
    (await keptSession(source, record.session))?.doneProblem,
  ).toBeUndefined();
});
