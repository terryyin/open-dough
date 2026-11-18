// What a Default main session committed in its checkout is kept with its
// launch record at Done and answers its review, over raw HTTP at the boundary
// server: a real bare origin and project checkout
// (../../tests/support/startOrigin.ts), the synthetic `claude`, and plain Git
// in the checkout (../../tests/support/sessionCheckoutWork.ts). Work pulled
// into the checkout is no session commit, and the kept comparison stays
// readable from the saved repository alone after trunk advances and the
// commit leaves every branch. A kept landing answers as
// ./ad-hoc-review.spec.ts states.

import path from "node:path";
import { readFileSync } from "node:fs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  launch,
  markDone,
  recordsOf,
} from "../../tests/agentLaunchBoundary.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { adHocReview } from "../../tests/support/adHocReview.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import {
  commitInCheckout,
  pullPublishedWork,
} from "../../tests/support/sessionCheckoutWork.ts";
import { launchedAdHoc } from "../../tests/support/reportedLaunch.ts";
import { git } from "../../tests/support/storyReviewWorktree.ts";

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
  dashboard.claudeScenario("launched");
  const launched = await launch(
    dashboard,
    makeMe.aLaunchRequest.adHoc({ instruction: "Fix the typo" }).please(),
  );
  expect(launched.status).toBe(200);
  const { record } = JSON.parse(launched.body) as { record: LaunchRecord };
  const { sessionId } = record.session;
  const start = git(origin.project, "rev-parse", "HEAD");
  const pulled = await pullPublishedWork(origin, pulledAt, "pulled.txt");
  const committed = await commitInCheckout(
    origin.project,
    committedAt,
    "typo.txt",
  );
  git(origin.project, "push", "--quiet", "origin", "main");
  dashboard.claudeSessionBecomes(sessionId, "working-idle");

  const done = await markDone(dashboard, {
    source: "open-dough",
    session: sessionId,
  });

  expect(done.status).toBe(200);
  const { doneAt } = (JSON.parse(done.body) as { record: LaunchRecord }).record;
  const kept = {
    kind: "session-commits",
    session: { launchedAt: record.launchedAt, doneAt },
    baseline: pulled,
    tree: committed,
    files: [expect.objectContaining({ path: "typo.txt", kind: "added" })],
  };
  expect(await adHocReview(request, dashboard, sessionId)).toEqual(kept);

  // Trunk advances, then the checkout and its branches leave the commit.
  await pullPublishedWork(origin, laterAt, "later-trunk.txt");
  git(origin.project, "reset", "--quiet", "--hard", start);
  git(origin.project, "update-ref", "refs/remotes/origin/main", start);
  git(origin.project, "reflog", "expire", "--expire=now", "--all");
  git(origin.project, "gc", "--quiet", "--prune=now");
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
  const session = await launchedAdHoc(dashboard, origin, "Fix the typo");
  const { sessionId } = session;
  const start = git(origin.project, "rev-parse", "HEAD");
  const committed = await commitInCheckout(
    origin.project,
    committedAt,
    "typo.txt",
  );
  dashboard.claudeSessionBecomes(sessionId, "working-idle");

  await session.report({ message: "" });

  await expect
    .poll(async () => (await adHocReview(request, dashboard, sessionId)).kind)
    .toBe("session-commits");
  const record = (
    (await recordsOf(dashboard, "open-dough")) as LaunchRecord[]
  ).find((kept) => kept.session.sessionId === sessionId);
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
  const start = git(origin.project, "rev-parse", "HEAD");
  const launchedAt = new Date().toISOString();
  dashboard.claudeScenario("launched");
  const sessionId = "established-default-main";
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .adHoc({ title: "Established in Default main" })
      .inDefaultCheckout({
        workspace: origin.project,
        landing: "review",
        revision: start,
      })
      .inClaudeSession({ sessionId })
      .launchedAt(launchedAt)
      .please(),
  ]);
  const committed = await commitInCheckout(
    origin.project,
    committedAt,
    "typo.txt",
  );

  const done = await markDone(dashboard, {
    source: "open-dough",
    session: sessionId,
  });

  expect(done.status).toBe(200);
  const { doneAt } = (JSON.parse(done.body) as { record: LaunchRecord }).record;
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
  const start = git(origin.project, "rev-parse", "HEAD");
  const landed = await commitInCheckout(origin.project, pulledAt, "landed.txt");
  const committed = await commitInCheckout(
    origin.project,
    committedAt,
    "typo.txt",
  );
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
