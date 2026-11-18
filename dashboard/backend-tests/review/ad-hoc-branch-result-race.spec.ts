import {
  deleteRecord,
  markDone,
} from "../../test-support/agentLaunchBoundary.ts";
import {
  adHocReview,
  adHocSessionFileText,
  launchIsolatedReview,
  sessionBranchPins,
} from "../../test-support/support/adHocReview.ts";
import {
  expect,
  test,
} from "../../test-support/support/branchResultValidation.ts";
import { commit } from "../../test-support/support/launchLanding.ts";
import { reportingThrough } from "../../test-support/support/reportedLaunch.ts";

test.use({ serverMode: "boundary" });

test("reopening preserves branch evidence and a superseded capture cannot replace the newer Done", async ({
  request,
  dashboard,
  origin,
  validation,
}) => {
  const { workspace, baseline, session, sent } = await launchIsolatedReview(
    dashboard,
    "Update the branch",
  );
  const report = reportingThrough(origin, sent);
  const first = commit(workspace, "first.txt");
  await report({ message: "" });
  await expect
    .poll(() => adHocReview(request, dashboard, session))
    .toMatchObject({ kind: "branch-result", tree: first });
  const originalPins = sessionBranchPins(origin.project, session);

  await report({ outcome: "unfinished", message: "Continuing the update" });
  expect(sessionBranchPins(origin.project, session)).toEqual(originalPins);
  const oldFile = { baseline, tree: first, path: "first.txt" };
  expect(
    (await adHocSessionFileText(request, dashboard, session, oldFile)).status(),
  ).toBe(409);

  validation.hold();
  const stale = commit(workspace, "stale.txt");
  const staleMark = report({ message: "" });
  let latest: string;
  try {
    await expect.poll(validation.held).toBe(true);
    expect(await adHocReview(request, dashboard, session)).toMatchObject({
      kind: "unavailable",
    });
    latest = commit(workspace, "latest.txt");
    await report({ message: "" });
  } finally {
    validation.release();
    await staleMark;
  }
  await expect
    .poll(() => adHocReview(request, dashboard, session))
    .toMatchObject({ kind: "branch-result", tree: latest });
  await expect
    .poll(() => sessionBranchPins(origin.project, session))
    .toEqual([baseline, latest]);
  expect(sessionBranchPins(origin.project, session)).not.toContain(stale);
});

test("deleting a record while its Done capture is reading leaves no evidence pins", async ({
  dashboard,
  origin,
  validation,
}) => {
  const { workspace, session } = await launchIsolatedReview(
    dashboard,
    "Update the branch",
  );
  commit(workspace, "abandoned.txt");
  validation.hold();
  const marking = markDone(dashboard, { source: "open-dough", session });
  try {
    await expect.poll(validation.held).toBe(true);
    dashboard.claudeListingFails(true);
    const response = await deleteRecord(dashboard, {
      source: "open-dough",
      session,
    });
    expect(JSON.parse(response.body)).toEqual({ kind: "deleted" });
  } finally {
    validation.release();
    await marking;
  }
  expect(sessionBranchPins(origin.project, session)).toEqual([]);
});

test("a newer quiet Done takes precedence over a manual mark still capturing its branch", async ({
  request,
  dashboard,
  origin,
  validation,
}) => {
  const { workspace, baseline, session, sent } = await launchIsolatedReview(
    dashboard,
    "Save the latest update",
  );
  const earlier = commit(workspace, "earlier.txt");
  validation.hold();
  const marking = markDone(dashboard, { source: "open-dough", session });
  let later: string;
  try {
    await expect.poll(validation.held).toBe(true);
    later = commit(workspace, "later.txt");
    await reportingThrough(origin, sent)({ message: "" });
  } finally {
    validation.release();
    await marking;
  }
  expect(await adHocReview(request, dashboard, session)).toMatchObject({
    kind: "branch-result",
    tree: later,
  });
  expect(sessionBranchPins(origin.project, session)).toEqual([baseline, later]);
  expect(sessionBranchPins(origin.project, session)).not.toContain(earlier);
  expect(dashboard.claudeStopCalls()).toEqual([]);
});
