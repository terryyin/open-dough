// Quiet completion cases during a held rename, and a reopened Done: the
// launch, its reporting attempt and the Done sequence from one Done capture
// case.
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { deliverCompletion } from "../../server/completionDelivery.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import type { LaunchHost } from "../../server/launchHosts.ts";
import { keptSession } from "../../server/launchRecordStore.ts";
import { localFolder } from "../../server/projectFolders.ts";
import { markDone, source, undoDone } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { dashboardReporting } from "../support/publisherDashboardOrigin.ts";

async function aSessionWithHeldRename() {
  const {
    checkout,
    records: { "default-launch": record },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withDefaultMainLaunch("default-launch", { launched: 60 }, (launch) =>
      launch.reportingThrough(dashboardReporting),
    )
    .kept()
    .please();
  await keepAttempt(
    makeMe.anAcceptedAttempt
      .withId(dashboardReporting.reference)
      .adHoc()
      .reportingTo(dashboardReporting.origin)
      .capturingLanding({ reporting: dashboardReporting })
      .launched(record.session)
      .please(),
  );
  const submission = makeMe.aCompletionSubmission
    .reportingFor({
      host: record.session.host,
      reference: dashboardReporting.reference,
    })
    .please();
  let entered!: (stopped: AbortSignal) => void;
  const renameEntered = new Promise<AbortSignal>((resolve) => {
    entered = resolve;
  });
  let release!: () => void;
  const renameReleased = new Promise<void>((resolve) => {
    release = resolve;
  });
  const rename = vi.fn<NonNullable<LaunchHost["rename"]>>(
    async (...[, , , , stopped]) => {
      stopped.addEventListener("abort", release, { once: true });
      entered(stopped);
      try {
        await renameReleased;
      } finally {
        stopped.removeEventListener("abort", release);
      }
    },
  );
  const folder = localFolder(checkout.integration);
  const marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: (host) =>
      host === "claude" ? { name: "Claude", rename } : undefined,
    reportingFolder: () => folder,
  });
  onTestFinished(async () => {
    release();
    await marks.close();
  });
  return {
    checkout,
    record,
    folder,
    marks,
    rename,
    renameEntered,
    releaseRename: release,
    submission,
    performWork,
    at,
  };
}

test("a quiet report during an earlier rename wait refreshes the commits", async () => {
  const {
    checkout,
    record,
    folder,
    marks,
    rename,
    renameEntered,
    releaseRename,
    submission,
    performWork,
    at,
  } = await aSessionWithHeldRename();
  const reported = vi.spyOn(marks, "reported");
  const { first } = await performWork(
    makeMe.aCheckoutWork.committing("first", { at: at(40) }),
  );
  vi.setSystemTime(at(30));
  const earlier = await deliverCompletion(
    submission,
    dashboardReporting.origin,
    marks,
  );
  const stopped = await renameEntered;
  expect(reported).toHaveBeenCalledExactlyOnceWith(source, earlier);
  expect(await keptSession(source, record.session)).toMatchObject({
    doneAt: earlier.receivedAt,
    sessionCommits: { runs: [{ base: checkout.base, revision: first }] },
  });

  const { second } = await performWork(
    makeMe.aCheckoutWork.committing("second", { at: at(20) }),
  );
  vi.setSystemTime(at(10));
  const later = await deliverCompletion(
    submission,
    dashboardReporting.origin,
    marks,
  );
  expect(reported).toHaveBeenNthCalledWith(2, source, later);
  await reported.mock.results[1]?.value;

  expect(stopped.aborted).toBe(false);
  expect(rename).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ session: record.session }),
    folder,
    expect.any(Function),
    "reporting",
    stopped,
  );
  releaseRename();
  await expect(reported.mock.results[0]?.value).resolves.toBeUndefined();
  expect(await keptSession(source, record.session)).toMatchObject({
    doneAt: later.receivedAt,
    sessionCommits: { runs: [{ base: checkout.base, revision: second }] },
  });
});

test("closing an in-flight reported rename aborts it and keeps the Done commits", async () => {
  const {
    checkout,
    record,
    marks,
    renameEntered,
    submission,
    performWork,
    at,
  } = await aSessionWithHeldRename();
  const { typo } = await performWork(
    makeMe.aCheckoutWork.committing("typo", { at: at(30) }),
  );
  const receipt = await deliverCompletion(
    submission,
    dashboardReporting.origin,
    marks,
  );
  const stopped = await renameEntered;

  await marks.close();

  expect(stopped.aborted).toBe(true);
  expect(await keptSession(source, record.session)).toMatchObject({
    doneAt: receipt.receivedAt,
    sessionCommits: { runs: [{ base: checkout.base, revision: typo }] },
  });
});

test("reopening keeps the earlier commit run until the next Done", async () => {
  const {
    checkout,
    records: { "default-launch": record },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withDefaultMainLaunch("default-launch", { launched: 60 })
    .kept()
    .please();
  const { first } = await performWork(
    makeMe.aCheckoutWork.committing("first", { at: at(40) }),
  );
  const earlierDone = at(30);
  vi.setSystemTime(earlierDone);
  await markDone(record, earlierDone);
  vi.setSystemTime(at(25));
  await undoDone(record);
  const { second } = await performWork(
    makeMe.aCheckoutWork.committing("second", { at: at(20) }),
  );

  const reopened = await keptSession(source, record.session);
  expect(reopened?.doneAt).toBeUndefined();
  expect(reopened?.sessionCommits?.runs).toEqual([
    { base: checkout.base, revision: first },
  ]);

  const doneAt = at(10);
  vi.setSystemTime(doneAt);
  await markDone(record, doneAt);
  expect(await keptSession(source, record.session)).toMatchObject({
    launchedAt: record.launchedAt,
    doneAt,
    sessionCommits: { runs: [{ base: checkout.base, revision: second }] },
  });
});
