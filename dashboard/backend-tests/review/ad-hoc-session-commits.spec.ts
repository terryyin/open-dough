// A quiet report marks a Default main session Done and keeps its commits.
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { deliverCompletion } from "../../server/completionDelivery.ts";
import { keptSession } from "../../server/launchRecordStore.ts";
import { localFolder } from "../../server/projectFolders.ts";
import {
  aCheckout,
  minutesAgo,
  review,
  source,
  work,
} from "../support/doneCaptureCase.ts";
import {
  aKeptReportingLaunch,
  marksWithRename,
} from "../support/reportedDoneCase.ts";

test("a quiet completion keeps its Default main session's commits at the receipt time", async () => {
  const checkout = await aCheckout();
  const { record, origin, submission } = await aKeptReportingLaunch(checkout);
  const { typo } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("typo", { at: minutesAgo(30) }),
  );

  const folder = localFolder(checkout.integration);
  const rename = vi.fn(async () => {});
  const marks = marksWithRename(folder, rename);
  onTestFinished(() => marks.close());
  const reported = vi.spyOn(marks, "reported");

  const receipt = await deliverCompletion(submission, origin, marks);
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
