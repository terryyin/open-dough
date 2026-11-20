import path from "node:path";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import {
  reviewedFileDiffSchema,
  reviewedFileTextSchema,
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
} from "../../src/storyReviewContract.ts";
import { markDone } from "../../test-support/agentLaunchBoundary.ts";
import {
  adHocReview,
  keptAdHocRecord,
  launchIsolatedReview,
  retireAdHocBranch,
} from "../../test-support/support/adHocReview.ts";
import { getReview } from "../../test-support/support/completedReviewRequests.ts";
import { resolveStoryConflict } from "../../test-support/support/completedStoryPublication.ts";
import { restartBoundary } from "../../test-support/support/launchDashboard.ts";
import { commit, git } from "../../test-support/support/launchLanding.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { serveOriginBaseCi } from "../../test-support/support/serveOriginBaseCi.ts";
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

test("the first Board read after restart discovers a delivery while preserving the fixed branch comparison", async ({
  dashboard,
  origin,
  request,
}) => {
  const { workspace, branch, session, baseline } = await launchIsolatedReview(
    dashboard,
    "Keep a working draft for review",
  );
  writeAt(workspace, "draft.txt", "Committed draft\n");
  commitAll(workspace, "Commit the branch draft");
  writeAt(workspace, "draft.txt", "Working draft\n");
  dashboard.claudeSessionBecomes(session, "done-live");
  const response = await markDone(dashboard, { source: "open-dough", session });
  expect(response.status, response.body).toBe(200);
  const done = (await keptAdHocRecord(dashboard, session))?.doneAt;
  const branchAtDone = await adHocReview(request, dashboard, session);
  expect(branchAtDone.kind).toBe("branch-result");

  await dashboard.close();
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
  git(origin.project, "push", "--quiet", "origin", "main");
  const latest = await origin.publishRevision({
    files: { "later.txt": "Unrelated advance\n" },
  });
  retireAdHocBranch(origin.project, workspace, branch, {
    discardWorkingChanges: true,
  });

  const restarted = await restartBoundary(origin, dashboard.origin);
  try {
    serveOriginBaseCi(restarted.github, origin);
    expect(await adHocReview(request, restarted, session)).toEqual(
      branchAtDone,
    );
    const board = await getReview(
      request,
      restarted,
      authenticatedReadEndpoint,
      {
        source: "open-dough",
      },
    );
    expect(board.status()).toBe(200);
    expect(await board.json()).toMatchObject({ revision: latest });

    await expect
      .poll(() => adHocReview(request, restarted, session))
      .toMatchObject({
        kind: "landed",
        baseline: trunkParent,
        tree: merge,
        sessionComparisonKeys: ["delivered", "branch-result"],
        files: [{ path: "draft.txt" }],
      });
    const delivered = await adHocReview(request, restarted, session);
    const savedBranch = await adHocReview(
      request,
      restarted,
      session,
      "branch-result",
    );
    expect(savedBranch).toMatchObject({
      kind: "branch-result",
      baseline,
      files: [{ path: "draft.txt" }],
    });
    if (delivered.kind !== "landed" || savedBranch.kind !== "branch-result")
      throw new Error("Missing the saved branch and delivered comparisons.");
    expect(branchAtDone).toMatchObject({ tree: savedBranch.tree });
    expect((await keptAdHocRecord(restarted, session))?.doneAt).toBe(done);

    git(
      origin.project,
      "remote",
      "set-url",
      "origin",
      path.join(origin.machine, "offline"),
    );
    expect(await adHocReview(request, restarted, session)).toEqual(delivered);
    expect(
      await adHocReview(request, restarted, session, "branch-result"),
    ).toEqual(savedBranch);
    for (const [comparison, before, after, reference] of [
      [
        delivered,
        "Trunk draft",
        "Resolution on trunk",
        delivered.landing.reference,
      ],
      [savedBranch, "Original draft", "Working draft", undefined],
    ] as const) {
      const query = {
        source: "open-dough",
        host: "claude",
        session,
        baseline: comparison.baseline,
        tree: comparison.tree,
        path: "draft.txt",
        ...(reference === undefined ? {} : { reference }),
      };
      const diff = await getReview(
        request,
        restarted,
        storyReviewFileEndpoint,
        query,
      );
      expect(diff.status()).toBe(200);
      const parsed = reviewedFileDiffSchema.parse(await diff.json());
      expect(parsed).toMatchObject({
        kind: "diff",
        printed: expect.stringContaining(`-${before}\n+${after}`),
      });
      const file = await getReview(
        request,
        restarted,
        storyReviewFileTextEndpoint,
        query,
      );
      expect(file.status()).toBe(200);
      expect(reviewedFileTextSchema.parse(await file.json())).toEqual({
        kind: "text",
        baseline: `${before}\n`,
        tree: `${after}\n`,
      });
    }
  } finally {
    await restarted.close();
  }
});

test("an unchanged target can discover delivery for a newly retained Done", async ({
  request,
  dashboard,
  origin,
}) => {
  const { workspace, session, baseline } = await launchIsolatedReview(
    dashboard,
    "Keep a branch while the Board already sees its delivery",
  );
  const tip = commit(workspace, "newly-done.txt");
  git(origin.project, "merge", "--quiet", "--no-ff", "--no-edit", tip);
  const merge = git(origin.project, "rev-parse", "HEAD");
  git(origin.project, "push", "--quiet", "origin", "main");
  const query = { source: "open-dough", since: baseline };
  const first = await getReview(
    request,
    dashboard,
    authenticatedReadEndpoint,
    query,
  );
  expect(await first.json()).toMatchObject({ revision: merge });

  const remote = git(origin.project, "remote", "get-url", "origin");
  git(
    origin.project,
    "remote",
    "set-url",
    "origin",
    path.join(origin.machine, "offline"),
  );
  try {
    dashboard.claudeSessionBecomes(session, "done-live");
    const response = await markDone(dashboard, {
      source: "open-dough",
      session,
    });
    expect(response.status, response.body).toBe(200);
    const record = await keptAdHocRecord(dashboard, session);
    expect(record?.branchResult?.manualDeliveryChecked).toBe(true);
    expect(record?.landing).toBeUndefined();
  } finally {
    git(origin.project, "remote", "set-url", "origin", remote);
  }

  await expect
    .poll(async () => {
      const repeated = await getReview(
        request,
        dashboard,
        authenticatedReadEndpoint,
        query,
      );
      expect(await repeated.json()).toMatchObject({ revision: merge });
      return adHocReview(request, dashboard, session);
    })
    .toMatchObject({
      kind: "landed",
      baseline,
      tree: merge,
      files: [{ path: "newly-done.txt" }],
    });
});
