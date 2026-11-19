// What a Default main session committed in its checkout is kept with its
// launch record at Done and answers its review, over raw HTTP at the boundary
// server: a real bare origin and project checkout
// (../../test-support/support/startOrigin.ts), the synthetic `claude`, and plain Git
// in the checkout (../../test-support/support/sessionCheckoutWork.ts). Work pulled
// into the checkout is no session commit, and the kept comparison stays
// readable from the saved repository alone after trunk advances and the
// commit leaves every branch. A kept landing answers as
// ./ad-hoc-review-landed.unit.spec.ts states.

import path from "node:path";
import { readFileSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  adHocReview,
  keptAdHocRecord,
} from "../../test-support/support/adHocReview.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { DefaultMainSessionWork } from "../../test-support/support/sessionCheckoutWork.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

// Git logs each piece of checkout work at its stated time, after any launch
// these cases make.
const pulledAt = "2099-01-02T12:00:00Z";
const committedAt = "2099-01-02T12:05:00Z";
const laterAt = "2099-01-02T12:10:00Z";

test("a default launch's commit is kept at Done and stays reviewable after trunk advances and the commit leaves every branch", async ({
  dashboard,
  origin,
  request,
}) => {
  const work = new DefaultMainSessionWork(dashboard, origin);
  const record = await work.launch("Fix the typo");
  const { sessionId } = record.session;
  const start = git(origin.project, "rev-parse", "HEAD");
  const pulled = await work.pullPublishedWork(pulledAt, "pulled.txt");
  const committed = await work.commit(committedAt, "typo.txt");
  work.pushToTrunk();
  dashboard.claudeSessionBecomes(sessionId, "working-idle");

  const doneAt = await work.markDone(sessionId);

  const kept = {
    kind: "session-commits",
    session: { launchedAt: record.launchedAt, doneAt },
    commitRuns: [
      {
        commits: 1,
        subject: "Add typo.txt",
        committedAt: new Date(committedAt).toISOString(),
        baseline: pulled,
        tree: committed,
      },
    ],
    commitRun: 0,
    baseline: pulled,
    tree: committed,
    files: [expect.objectContaining({ path: "typo.txt", kind: "added" })],
  };
  expect(await adHocReview(request, dashboard, sessionId)).toEqual(kept);

  // Trunk advances, then the checkout and its branches leave the commit.
  await work.pullPublishedWork(laterAt, "later-trunk.txt");
  work.forgetPublishedCommit(start);
  expect(git(origin.project, "branch", "-a", "--contains", committed)).toBe("");
  const indexPath = path.join(origin.project, ".git", "index");
  const index = readFileSync(indexPath);

  expect(await adHocReview(request, dashboard, sessionId)).toEqual(kept);

  expect(git(origin.project, "rev-parse", "HEAD")).toBe(start);
  expect(readFileSync(indexPath)).toEqual(index);
});

test("a default launch marked done automatically by its quiet report keeps its commit the same way", async ({
  dashboard,
  origin,
  request,
}) => {
  const work = new DefaultMainSessionWork(dashboard, origin);
  const session = await work.launchReporting("Fix the typo");
  const { sessionId } = session;
  const start = git(origin.project, "rev-parse", "HEAD");
  const committed = await work.commit(committedAt, "typo.txt");
  dashboard.claudeSessionBecomes(sessionId, "working-idle");

  await session.report({ message: "" });

  await expect
    .poll(async () => (await adHocReview(request, dashboard, sessionId)).kind)
    .toBe("session-commits");
  const record = await keptAdHocRecord(dashboard, sessionId);
  expect(record?.completion?.receivedAt).toEqual(expect.any(String));
  expect(await adHocReview(request, dashboard, sessionId)).toMatchObject({
    kind: "session-commits",
    session: { doneAt: record?.completion?.receivedAt },
    baseline: start,
    tree: committed,
  });
});

test("a session established in the Default main checkout without a landing answers its commit kept at Done", async ({
  dashboard,
  origin,
  request,
}) => {
  const work = new DefaultMainSessionWork(dashboard, origin);
  const start = git(origin.project, "rev-parse", "HEAD");
  const sessionId = "established-default-main";
  const launchedAt = work.establish(sessionId);
  const committed = await work.commit(committedAt, "typo.txt");

  const doneAt = await work.markDone(sessionId);

  expect(await adHocReview(request, dashboard, sessionId)).toMatchObject({
    kind: "session-commits",
    session: { launchedAt, doneAt },
    baseline: start,
    tree: committed,
  });
});

test("a session established in the Default main checkout that holds a landing keeps answering its landing", async ({
  dashboard,
  origin,
  request,
}) => {
  const work = new DefaultMainSessionWork(dashboard, origin);
  const start = git(origin.project, "rev-parse", "HEAD");
  const landed = await work.commit(pulledAt, "landed.txt");
  const committed = await work.commit(committedAt, "typo.txt");
  const sessionId = "established-landed";
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .adHoc({ title: "Established and landed" })
      .inDefaultCheckout({
        workspace: origin.project,
        landing: "auto-land",
        revision: start,
      })
      .inClaudeSession({ sessionId })
      .withLanding(
        makeMe.aLaunchLanding
          .capturedFrom({ repository: origin.project })
          .comparing({ base: start, revision: landed }),
      )
      .keptSessionCommits({
        repository: origin.project,
        runs: [{ base: landed, revision: committed }],
      })
      .markedDone()
      .please(),
  ]);

  expect(await adHocReview(request, dashboard, sessionId)).toMatchObject({
    kind: "landed",
    baseline: start,
    tree: landed,
    files: [expect.objectContaining({ path: "landed.txt", kind: "added" })],
  });
});
