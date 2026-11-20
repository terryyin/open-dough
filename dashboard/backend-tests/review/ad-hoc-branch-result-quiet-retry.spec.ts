import path from "node:path";
import {
  adHocReview,
  launchIsolatedReview,
} from "../../test-support/support/adHocReview.ts";
import {
  quote,
  reportingChild,
} from "../../test-support/support/completionRecovery.ts";
import { commit } from "../../test-support/support/launchLanding.ts";
import { keptLaunchRecords } from "../../test-support/support/launchStore.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { reportingThrough } from "../../test-support/support/reportedLaunch.ts";

test.use({ serverMode: "boundary" });

test("an exact quiet completion retry keeps the revision captured by its Done", async ({
  dashboard,
  origin,
  request,
}) => {
  const { workspace, baseline, session, sent } = await launchIsolatedReview(
    dashboard,
    "Write the update",
  );
  const tree = commit(workspace, "done.txt");
  await reportingThrough(origin, sent)({ message: "" });
  await expect
    .poll(() => adHocReview(request, dashboard, session))
    .toMatchObject({ kind: "branch-result", baseline, tree });
  const record = keptLaunchRecords(dashboard).find(
    (entry) => "session" in entry && entry.session.sessionId === session,
  );
  if (record === undefined || !("session" in record))
    throw new Error("Missing the retained session.");
  const receipt = record.completion;
  const command = record.request.reporting?.command;
  if (receipt?.delivery === undefined || command === undefined)
    throw new Error("Missing the quiet completion submission.");
  const submission = path.join(
    dashboard.home,
    ".open-dough/dashboard/reporting",
    receipt.reference,
    `completion-${receipt.delivery}.json`,
  );

  commit(workspace, "after-done.txt");
  const retry = await reportingChild(
    `${command} --retry ${quote(submission)}`,
    origin.machine,
  );

  expect(retry.ok, retry.stderr).toBe(true);
  expect(await adHocReview(request, dashboard, session)).toMatchObject({
    kind: "branch-result",
    baseline,
    tree,
    files: [expect.objectContaining({ path: "done.txt" })],
  });
});
