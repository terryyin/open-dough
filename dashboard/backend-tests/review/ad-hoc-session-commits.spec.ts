// A quiet report marks a Default main session Done and keeps its commits.
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { deliverCompletion } from "../../server/completionDelivery.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { keptSession } from "../../server/launchRecordStore.ts";
import { localFolder } from "../../server/projectFolders.ts";
import {
  aCheckout,
  aDefaultLaunch,
  keep,
  minutesAgo,
  review,
  source,
  work,
} from "../support/doneCaptureCase.ts";

test("a quiet completion keeps its Default main session's commits at the receipt time", async () => {
  const checkout = await aCheckout();
  const reporting = {
    origin: "http://127.0.0.1:4173",
    reference: "22222222-2222-4222-8222-222222222222",
    command: "dashboard-completion",
  };
  const record = aDefaultLaunch(checkout).reportingThrough(reporting).please();
  keep(record);
  await keepAttempt(
    makeMe.anAcceptedAttempt
      .withId(reporting.reference)
      .adHoc()
      .reportingTo(reporting.origin)
      .capturingLanding({ reporting })
      .launched(record.session)
      .please(),
  );
  const { typo } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("typo", { at: minutesAgo(30) }),
  );

  const folder = localFolder(checkout.integration);
  const rename = vi.fn(async () => {});
  const marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: (host) =>
      host === "claude" ? { name: "Claude", rename } : undefined,
    reportingFolder: () => folder,
  });
  onTestFinished(() => marks.close());
  const reported = vi.spyOn(marks, "reported");
  const submission = makeMe.aCompletionSubmission
    .reportingFor({ host: record.session.host, reference: reporting.reference })
    .please();

  const receipt = await deliverCompletion(submission, reporting.origin, marks);
  expect(reported).toHaveBeenCalledExactlyOnceWith(source, receipt);
  await expect(reported.mock.results[0]?.value).resolves.toBeUndefined();

  expect((await keptSession(source, record.session))?.doneAt).toBe(
    receipt.receivedAt,
  );
  expect(await review(record)).toMatchObject({
    kind: "session-commits",
    session: { doneAt: receipt.receivedAt },
    baseline: checkout.base,
    tree: typo,
    commitRuns: [{ commits: 1, subject: "Add typo.txt" }],
  });
  expect(rename).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ session: record.session }),
    folder,
    expect.any(Function),
    "reporting",
    expect.any(AbortSignal),
  );
});
