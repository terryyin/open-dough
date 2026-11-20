import { writeFileSync } from "node:fs";
import path from "node:path";
import {
  deleteRecord,
  markDone,
} from "../../test-support/agentLaunchBoundary.ts";
import { daysAgo } from "../../test-support/machineLaunchRecords.ts";
import {
  adHocReview,
  adHocSessionFileDiff,
  adHocSessionFileText,
  launchIsolatedReview,
  retireAdHocBranch,
  sessionBranchPins,
} from "../../test-support/support/adHocReview.ts";
import {
  quote,
  reportingChild,
} from "../../test-support/support/completionRecovery.ts";
import { commit } from "../../test-support/support/launchLanding.ts";
import {
  keepLaunchRecords,
  keptLaunchRecords,
} from "../../test-support/support/launchStore.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { reportingThrough } from "../../test-support/support/reportedLaunch.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";

test.use({ serverMode: "boundary" });

test("the branch comparison at Done and its files survive worktree and branch removal and pruning", async ({
  dashboard,
  origin,
  request,
}) => {
  const { workspace, branch, baseline, session } = await launchIsolatedReview(
    dashboard,
    "Save the draft",
  );
  const file = "draft.txt";
  const tree = commit(workspace, file);
  dashboard.claudeSessionBecomes(session, "done-live");
  const response = await markDone(dashboard, { source: "open-dough", session });
  expect(response.status, response.body).toBe(200);
  retireAdHocBranch(origin.project, workspace, branch);

  expect(await adHocReview(request, dashboard, session)).toMatchObject({
    kind: "branch-result",
    baseline,
    tree,
    files: [expect.objectContaining({ path: file, kind: "added" })],
  });
  const named = { baseline, tree, path: file };
  const diff = await adHocSessionFileDiff(request, dashboard, session, named);
  expect(await diff.json()).toMatchObject({
    kind: "diff",
    printed: expect.stringContaining("+draft.txt"),
  });
  const text = await adHocSessionFileText(request, dashboard, session, named);
  expect(await text.json()).toEqual({
    kind: "text",
    baseline: null,
    tree: "draft.txt\n",
  });
  expect(
    (
      await adHocSessionFileText(request, dashboard, session, {
        ...named,
        baseline: tree,
      })
    ).status(),
  ).toBe(409);
});

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

test("Done distinguishes an empty branch result from a missing checkout", async ({
  dashboard,
  origin,
  request,
}) => {
  const empty = await launchIsolatedReview(dashboard, "An empty branch");
  const missing = await launchIsolatedReview(dashboard, "A missing workspace");
  git(origin.project, "worktree", "remove", missing.workspace);

  dashboard.claudeSessionBecomes(empty.session, "done-live");
  const emptyDone = await markDone(dashboard, {
    source: "open-dough",
    session: empty.session,
  });
  expect(emptyDone.status, emptyDone.body).toBe(200);
  dashboard.claudeSessionBecomes(missing.session, "done-live");
  const missingDone = await markDone(dashboard, {
    source: "open-dough",
    session: missing.session,
  });
  expect(missingDone.status, missingDone.body).toBe(200);

  expect(await adHocReview(request, dashboard, empty.session)).toMatchObject({
    kind: "branch-result",
    baseline: empty.baseline,
    tree: empty.baseline,
    files: [],
  });
  expect(await adHocReview(request, dashboard, missing.session)).toMatchObject({
    kind: "unavailable",
    explanation: "This session's branch changes at Done were not captured.",
  });
});

for (const reason of ["deletion", "expiry"]) {
  test(`${reason} releases only that launch's retained branch evidence`, async ({
    dashboard,
    origin,
  }) => {
    const leaving = await launchIsolatedReview(dashboard, "First task");
    const staying = await launchIsolatedReview(dashboard, "Second task");
    const first = commit(leaving.workspace, "first.txt");
    const second = commit(staying.workspace, "second.txt");
    writeFileSync(
      path.join(leaving.workspace, "draft.txt"),
      "A draft to keep.\n",
    );
    dashboard.claudeSessionBecomes(leaving.session, "done-live");
    const leavingDone = await markDone(dashboard, {
      source: "open-dough",
      session: leaving.session,
    });
    expect(leavingDone.status, leavingDone.body).toBe(200);
    dashboard.claudeSessionBecomes(staying.session, "done-live");
    const stayingDone = await markDone(dashboard, {
      source: "open-dough",
      session: staying.session,
    });
    expect(stayingDone.status, stayingDone.body).toBe(200);
    expect(sessionBranchPins(origin.project, leaving.session)).toContain(first);
    expect(sessionBranchPins(origin.project, leaving.session)).toHaveLength(3);
    const stayingPins = sessionBranchPins(origin.project, staying.session);
    expect(stayingPins).toContain(second);

    if (reason === "deletion") {
      dashboard.claudeListingFails(true);
      const response = await deleteRecord(dashboard, {
        source: "open-dough",
        session: leaving.session,
      });
      expect(JSON.parse(response.body)).toEqual({ kind: "deleted" });
    } else {
      keepLaunchRecords(
        dashboard,
        keptLaunchRecords(dashboard).map((record) =>
          "session" in record && record.session.sessionId === leaving.session
            ? { ...record, doneAt: daysAgo(31) }
            : record,
        ),
      );
      await launchIsolatedReview(dashboard, "Trigger normal retention");
    }

    expect(sessionBranchPins(origin.project, leaving.session)).toEqual([]);
    expect(sessionBranchPins(origin.project, staying.session)).toEqual(
      stayingPins,
    );
  });
}
