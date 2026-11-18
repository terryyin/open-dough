import path from "node:path";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { sessionBranchEntrySchema } from "../../src/sessionBranchResult.ts";
import {
  adHocReview,
  adHocSessionFileDiff,
  adHocSessionFileText,
  launchIsolatedReview,
  markAdHocDone,
  retireAdHocBranch,
} from "../../test-support/support/adHocReview.ts";
import { reportingChild } from "../../test-support/support/completionRecovery.ts";
import type { DashboardServer } from "../../test-support/support/dashboardServer.ts";
import { commit } from "../../test-support/support/launchLanding.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { branchEntryCommand } from "../../test-support/support/reportingInputAssertions.ts";
import { launched } from "../../test-support/support/startSessionLandingCapture.ts";
import type { StartOrigin } from "../../test-support/support/startOrigin.ts";
import {
  commitAll,
  git,
  writeAt,
} from "../../test-support/support/storyReviewWorktree.ts";

test.use({
  serverMode: "boundary",
  originRepository: queuedReadyRepository()
    .withRevision("shared-files", { files: { "shared.txt": "original\n" } })
    .please(),
});

function topic(origin: StartOrigin, branch: string) {
  const workspace = path.join(origin.machine, branch);
  git(origin.project, "worktree", "add", "--quiet", "-b", branch, workspace);
  return workspace;
}

async function identifyBranch(dashboard: DashboardServer, workspace: string) {
  const { record, sent } = await launched(dashboard, {
    instruction: "Continue the prepared branch",
  });
  const command = branchEntryCommand(sent);
  if (command === undefined) throw new Error("Missing branch entry command.");
  const response = await reportingChild(command, workspace);
  expect(response.ok, response.stderr).toBe(true);
  const { branchEntry } = JSON.parse(response.stdout) as {
    branchEntry: unknown;
  };
  return {
    session: record.session.sessionId,
    entry: sessionBranchEntrySchema.parse(branchEntry),
  };
}

test("a declared branch's saved comparison shows only its new work and its edit to imported text", async ({
  dashboard,
  origin,
  request,
}) => {
  const branch = "entry-with-earlier-work";
  const workspace = topic(origin, branch);
  commit(workspace, "earlier-commit.txt");
  writeAt(workspace, "earlier-draft.txt", "left here before entry\n");
  const { session } = await identifyBranch(dashboard, workspace);
  const imported = await origin.publishRevision({
    files: {
      "import-only.txt": "trunk addition\n",
      "shared.txt": "imported line\n",
    },
  });
  git(workspace, "merge", "--quiet", "--no-edit", imported);
  commit(workspace, "session-only.txt");
  writeAt(workspace, "shared.txt", "session edit of imported line\n");

  await markAdHocDone(dashboard, session);
  retireAdHocBranch(origin.project, workspace, branch, {
    discardWorkingChanges: true,
  });

  const review = await adHocReview(request, dashboard, session);
  if (review.kind !== "branch-result") throw new Error(JSON.stringify(review));
  expect(review.files.map(({ path }) => path)).toEqual([
    "session-only.txt",
    "shared.txt",
  ]);
  const { baseline, tree } = review;
  const naming = { baseline, tree, path: "shared.txt" };
  const diff = await adHocSessionFileDiff(request, dashboard, session, naming);
  expect(await diff.json()).toMatchObject({
    kind: "diff",
    printed: expect.stringContaining(
      "-imported line\n+session edit of imported line",
    ),
  });
  const file = await adHocSessionFileText(request, dashboard, session, naming);
  expect(await file.json()).toEqual({
    kind: "text",
    baseline: "imported line\n",
    tree: "session edit of imported line\n",
  });
  expect(
    (
      await adHocSessionFileDiff(request, dashboard, session, {
        baseline,
        tree,
        path: "import-only.txt",
      })
    ).status(),
  ).toBe(409);
});

test("an isolated Done retains its committed and working changes across a trunk import", async ({
  dashboard,
  origin,
  request,
}) => {
  const { workspace, branch, session } = await launchIsolatedReview(
    dashboard,
    "Keep a draft",
  );
  commit(workspace, "draft.txt");
  const imported = await origin.publishRevision({
    files: { "import-only.txt": "trunk addition\n" },
  });
  git(workspace, "merge", "--quiet", "--no-edit", imported);
  writeAt(workspace, "draft.txt", "draft.txt\nworking change\n");

  await markAdHocDone(dashboard, session);
  retireAdHocBranch(origin.project, workspace, branch, {
    discardWorkingChanges: true,
  });

  const review = await adHocReview(request, dashboard, session);
  if (review.kind !== "branch-result") throw new Error(JSON.stringify(review));
  expect(review.files.map(({ path }) => path)).toEqual(["draft.txt"]);
  const diff = await adHocSessionFileDiff(request, dashboard, session, {
    baseline: review.baseline,
    tree: review.tree,
    path: "draft.txt",
  });
  expect(await diff.json()).toMatchObject({
    kind: "diff",
    printed: expect.stringContaining("+draft.txt\n+working change"),
  });
});

test("conflicting baseline evidence explains why the branch changes cannot be attributed", async ({
  dashboard,
  origin,
  request,
}) => {
  const branch = "entry-with-conflict";
  const workspace = topic(origin, branch);
  writeAt(workspace, "shared.txt", "branch line from before entry\n");
  commitAll(workspace, "Earlier topic changes");
  const { session, entry } = await identifyBranch(dashboard, workspace);
  const imported = await origin.publishRevision({
    files: { "shared.txt": "trunk line\n" },
  });
  git(workspace, "merge", "--quiet", "--no-edit", "-X", "ours", imported);
  const tip = commit(workspace, "session-only.txt");

  await markAdHocDone(dashboard, session);
  retireAdHocBranch(origin.project, workspace, branch);

  expect(await adHocReview(request, dashboard, session)).toMatchObject({
    kind: "unavailable",
    explanation: expect.stringContaining(
      "Earlier branch changes conflict with imported trunk",
    ),
  });
  expect(
    (
      await adHocSessionFileDiff(request, dashboard, session, {
        baseline: entry.tree,
        tree: tip,
        path: "session-only.txt",
      })
    ).status(),
  ).toBe(409);
});

test("a branch merged into trunk still retains its own Done comparison", async ({
  dashboard,
  origin,
  request,
}) => {
  const { workspace, branch, session } = await launchIsolatedReview(
    dashboard,
    "Keep the branch after delivery",
  );
  commit(workspace, "session-only.txt");
  const imported = await origin.publishRevision({
    files: { "import-only.txt": "trunk addition\n" },
  });
  git(workspace, "merge", "--quiet", "--no-edit", imported);
  git(origin.project, "merge", "--quiet", "--no-edit", "--no-ff", branch);
  git(origin.project, "push", "--quiet", "origin", "main");
  const later = path.join(origin.machine, "separate-publisher");
  git(origin.project, "clone", "--quiet", "--local", origin.origin, later);
  git(later, "config", "user.name", "Separate publisher");
  git(later, "config", "user.email", "publisher@example.com");
  git(later, "config", "commit.gpgsign", "false");
  writeAt(later, "later-trunk.txt", "A later change on trunk\n");
  commitAll(later, "Advance published trunk");
  git(later, "push", "--quiet", "origin", "main");

  await markAdHocDone(dashboard, session);
  retireAdHocBranch(origin.project, workspace, branch);

  expect(
    await adHocReview(request, dashboard, session, "branch-result"),
  ).toMatchObject({
    kind: "branch-result",
    files: [{ path: "session-only.txt" }],
  });
});

test("new shared first-parent history can leave branch attribution ambiguous", async ({
  dashboard,
  origin,
  request,
}) => {
  const { workspace, branch, session } = await launchIsolatedReview(
    dashboard,
    "Keep a directly delivered branch",
  );
  const direct = commit(workspace, "direct.txt");
  git(origin.project, "merge", "--quiet", "--ff-only", direct);
  git(origin.project, "push", "--quiet", "origin", "main");
  commit(workspace, "after-direct.txt");

  await markAdHocDone(dashboard, session);
  retireAdHocBranch(origin.project, workspace, branch);

  expect(await adHocReview(request, dashboard, session)).toMatchObject({
    kind: "unavailable",
    explanation:
      "The saved branch changes could not be separated from trunk history.",
  });
});
