import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { deliverCompletion } from "../../server/completionDelivery.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import type { LaunchHost } from "../../server/launchHosts.ts";
import { keptSession } from "../../server/launchRecordStore.ts";
import { localFolder } from "../../server/projectFolders.ts";
import {
  aCheckout,
  aKeptReportingLaunch,
  minutesAgo,
  review,
  source,
  work,
} from "../support/doneCaptureCase.ts";

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
  const marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: (host) =>
      host === "claude" ? { name: "Claude", rename } : undefined,
    reportingFolder: () => localFolder(checkout.integration),
  });
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
