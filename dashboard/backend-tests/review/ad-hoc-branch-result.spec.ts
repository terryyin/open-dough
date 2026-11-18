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
  sessionBranchPins,
} from "../../test-support/support/adHocReview.ts";
import {
  quote,
  reportingChild,
} from "../../test-support/support/completionRecovery.ts";
import type { DashboardServer } from "../../test-support/support/dashboardServer.ts";
import { commit } from "../../test-support/support/launchLanding.ts";
import {
  keepLaunchRecords,
  keptLaunchRecords,
} from "../../test-support/support/launchStore.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { reportingThrough } from "../../test-support/support/reportedLaunch.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";

test.use({ serverMode: "boundary" });

async function done(dashboard: DashboardServer, session: string) {
  const response = await markDone(dashboard, { source: "open-dough", session });
  expect(response.status, response.body).toBe(200);
}

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
  await done(dashboard, session);

  git(origin.project, "worktree", "remove", workspace);
  git(origin.project, "branch", "-D", branch);
  git(origin.project, "reflog", "expire", "--expire=now", "--all");
  git(origin.project, "gc", "--quiet", "--prune=now");

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

  await done(dashboard, empty.session);
  await done(dashboard, missing.session);

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
    await done(dashboard, leaving.session);
    await done(dashboard, staying.session);
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
