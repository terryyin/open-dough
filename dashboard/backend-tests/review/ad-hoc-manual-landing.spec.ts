import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import {
  reviewedFileTextSchema,
  storyReviewFileTextEndpoint,
} from "../../src/storyReviewContract.ts";
import { markDone } from "../../test-support/agentLaunchBoundary.ts";
import {
  adHocReview,
  adHocSessionFileText,
  launchIsolatedReview,
  retireAdHocBranch,
} from "../../test-support/support/adHocReview.ts";
import { resolveStoryConflict } from "../../test-support/support/completedStoryPublication.ts";
import { getReview } from "../../test-support/support/completedReviewRequests.ts";
import { commit, git } from "../../test-support/support/launchLanding.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { reportingThrough } from "../../test-support/support/reportedLaunch.ts";
import {
  commitAll,
  writeAt,
} from "../../test-support/support/storyReviewWorktree.ts";

test.use({
  serverMode: "boundary",
  originRepository: queuedReadyRepository()
    .withRevision("shared-file", { files: { "draft.txt": "Original draft\n" } })
    .please(),
});

test("a verified manual merge retains its trunk parent and actual resolution", async ({
  dashboard,
  origin,
  request,
}) => {
  const { workspace, branch, session, sent } = await launchIsolatedReview(
    dashboard,
    "Keep the draft",
  );
  writeAt(workspace, "draft.txt", "Branch draft\n");
  commitAll(workspace, "Commit the branch draft");
  writeAt(workspace, "draft.txt", "Working draft\n");
  const trunkParent = await origin.publishRevision({
    files: { "draft.txt": "Trunk draft\n" },
  });
  resolveStoryConflict(
    origin.project,
    ["merge", "--no-ff", "--no-edit", branch],
    "draft.txt",
    "Resolution on trunk\n",
    "Resolve the draft manually",
  );
  const merge = git(origin.project, "rev-parse", "HEAD");
  const report = reportingThrough(origin, sent);
  await report({ message: "" });
  expect(await adHocReview(request, dashboard, session)).toMatchObject({
    kind: "branch-result",
    deliveryGap: expect.stringContaining("Delivery to trunk is unverified"),
  });
  await report({ outcome: "unfinished", message: "Continuing after review" });

  git(origin.project, "push", "--quiet", "origin", "main");
  await origin.publishRevision({
    files: { "before-done.txt": "Advance before Done\n" },
  });
  dashboard.claudeSessionBecomes(session, "done-live");
  const response = await markDone(dashboard, { source: "open-dough", session });
  expect(response.status, response.body).toBe(200);
  await origin.publishRevision({
    files: { "later.txt": "Unrelated advance\n" },
  });
  retireAdHocBranch(origin.project, workspace, branch, {
    discardWorkingChanges: true,
  });

  const delivered = await adHocReview(request, dashboard, session);
  expect(delivered).toMatchObject({
    kind: "landed",
    baseline: trunkParent,
    tree: merge,
    landing: { remote: "origin", target: "refs/heads/main" },
    files: [{ path: "draft.txt" }],
  });
  if (delivered.kind !== "landed")
    throw new Error("Missing delivered comparison.");
  const deliveryText = await getReview(
    request,
    dashboard,
    storyReviewFileTextEndpoint,
    {
      source: "open-dough",
      host: "claude",
      session,
      reference: delivered.landing.reference,
      baseline: trunkParent,
      tree: merge,
      path: "draft.txt",
    },
  );
  expect(deliveryText.status()).toBe(200);
  expect(reviewedFileTextSchema.parse(await deliveryText.json())).toEqual({
    kind: "text",
    baseline: "Trunk draft\n",
    tree: "Resolution on trunk\n",
  });

  const branchResult = await adHocReview(
    request,
    dashboard,
    session,
    "branch-result",
  );
  if (branchResult.kind !== "branch-result")
    throw new Error("Missing branch result.");
  const branchText = await adHocSessionFileText(request, dashboard, session, {
    baseline: branchResult.baseline,
    tree: branchResult.tree,
    path: "draft.txt",
  });
  expect(reviewedFileTextSchema.parse(await branchText.json())).toEqual({
    kind: "text",
    baseline: "Original draft\n",
    tree: "Working draft\n",
  });
});

test("acceptance on another remote branch leaves trunk delivery unverified", async ({
  dashboard,
  origin,
  request,
}) => {
  const { workspace, branch, session } = await launchIsolatedReview(
    dashboard,
    "Keep a branch edit",
  );
  const tip = commit(workspace, "branch-edit.txt");
  git(origin.project, "merge", "--quiet", "--no-ff", "--no-edit", branch);
  git(origin.project, "push", "--quiet", "origin", "HEAD:refs/heads/elsewhere");

  dashboard.claudeSessionBecomes(session, "done-live");
  const response = await markDone(dashboard, { source: "open-dough", session });
  expect(response.status, response.body).toBe(200);

  expect(await adHocReview(request, dashboard, session)).toMatchObject({
    kind: "branch-result",
    tree: tip,
    files: [{ path: "branch-edit.txt" }],
    deliveryGap: expect.stringContaining("Delivery to trunk is unverified"),
  });
});

test("a continuous fast-forward from the witnessed parent retains both comparisons", async ({
  dashboard,
  origin,
  request,
}) => {
  const { workspace, session, baseline } = await launchIsolatedReview(
    dashboard,
    "Fast-forward a branch edit",
  );
  const tip = commit(workspace, "fast-forward.txt");
  git(origin.project, "merge", "--quiet", "--ff-only", tip);
  git(origin.project, "push", "--quiet", "origin", "main");

  dashboard.claudeSessionBecomes(session, "done-live");
  const response = await markDone(dashboard, { source: "open-dough", session });
  expect(response.status, response.body).toBe(200);

  expect(await adHocReview(request, dashboard, session)).toMatchObject({
    kind: "landed",
    baseline,
    tree: tip,
    sessionComparisonKeys: ["delivered", "branch-result"],
  });
  expect(
    await adHocReview(request, dashboard, session, "branch-result"),
  ).toMatchObject({
    kind: "branch-result",
    baseline,
    tree: tip,
    files: [{ path: "fast-forward.txt" }],
  });
});

test("a fast-forward with an unwitnessed previous tip leaves delivery unverified", async ({
  dashboard,
  origin,
  request,
}) => {
  const { workspace, session } = await launchIsolatedReview(
    dashboard,
    "Keep a branch with two commits",
  );
  commit(workspace, "first.txt");
  const tip = commit(workspace, "second.txt");
  git(origin.project, "merge", "--quiet", "--ff-only", tip);
  git(origin.project, "push", "--quiet", "origin", "main");

  dashboard.claudeSessionBecomes(session, "done-live");
  const response = await markDone(dashboard, { source: "open-dough", session });
  expect(response.status, response.body).toBe(200);

  expect(await adHocReview(request, dashboard, session)).toMatchObject({
    kind: "unavailable",
    deliveryGap: expect.stringContaining("exact fast-forward"),
  });
});

test("a same-content squash leaves the saved branch readable and delivery unverified", async ({
  dashboard,
  origin,
  request,
}) => {
  const { workspace, branch, session, baseline } = await launchIsolatedReview(
    dashboard,
    "Keep an identifiable branch",
  );
  const tip = commit(workspace, "branch-edit.txt");
  git(origin.project, "merge", "--quiet", "--squash", tip);
  commitAll(origin.project, "Squash without the branch parent");
  git(origin.project, "push", "--quiet", "origin", "main");

  dashboard.claudeSessionBecomes(session, "done-live");
  const response = await markDone(dashboard, { source: "open-dough", session });
  expect(response.status, response.body).toBe(200);
  retireAdHocBranch(origin.project, workspace, branch);

  expect(await adHocReview(request, dashboard, session)).toMatchObject({
    kind: "branch-result",
    tree: tip,
    files: [{ path: "branch-edit.txt" }],
    deliveryGap: expect.stringContaining("Delivery to trunk is unverified"),
  });
  const text = await adHocSessionFileText(request, dashboard, session, {
    baseline,
    tree: tip,
    path: "branch-edit.txt",
  });
  expect(reviewedFileTextSchema.parse(await text.json())).toMatchObject({
    kind: "text",
    tree: "branch-edit.txt\n",
  });
});
