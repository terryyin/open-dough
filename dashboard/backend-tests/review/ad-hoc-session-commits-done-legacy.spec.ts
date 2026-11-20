// Done capture cases still exercised through the running dashboard boundary.
import { renameSync } from "node:fs";
import path from "node:path";
import { openTerminal } from "../../test-support/agentTerminalBoundary.ts";
import {
  adHocReview,
  keptAdHocRecord,
} from "../../test-support/support/adHocReview.ts";
import {
  quote,
  reportingChild,
} from "../../test-support/support/completionRecovery.ts";
import { startDashboardServer } from "../../test-support/support/dashboardServer.ts";
import { keptLaunchRecords } from "../../test-support/support/launchStore.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { DefaultMainSessionWork } from "../../test-support/support/sessionCheckoutWork.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

// Git logs each piece of checkout work at its stated time, after any launch
// these cases make.
const firstAt = "2099-01-02T12:00:00Z";
const secondAt = "2099-01-02T12:05:00Z";

test("a reopened session keeps its earlier capture until its next Done, which answers its commits from launch to that Done", async ({
  dashboard,
  origin,
  request,
}) => {
  const work = new DefaultMainSessionWork(dashboard, origin);
  const record = await work.launch("Fix the typo");
  const { sessionId } = record.session;
  const kept = () => keptAdHocRecord(dashboard, sessionId);
  const start = git(origin.project, "rev-parse", "HEAD");
  const first = await work.commit(firstAt, "first.txt");
  dashboard.claudeSessionBecomes(sessionId, "working-idle");
  await work.markDone(sessionId);

  // Attaching reopens the session.
  const terminal = await openTerminal(dashboard, {
    sessionId,
    shortId: sessionId,
  });
  await expect.poll(async () => (await kept())?.doneAt).toBeUndefined();
  terminal.socket.close();
  expect((await kept())?.sessionCommits?.runs).toEqual([
    { base: start, revision: first },
  ]);

  const second = await work.commit(secondAt, "second.txt");
  const doneAt = await work.markDone(sessionId);

  expect(await adHocReview(request, dashboard, sessionId)).toMatchObject({
    kind: "session-commits",
    session: { launchedAt: record.launchedAt, doneAt },
    commitRuns: [{ commits: 2, subject: "Add second.txt" }],
    baseline: start,
    tree: second,
  });
});

test("a quiet report after a confirmed native Done keeps the additional commit", async ({
  dashboard,
  origin,
  request,
}) => {
  const work = new DefaultMainSessionWork(dashboard, origin);
  const session = await work.launchReporting("Fix the typo");
  const { sessionId } = session;
  const start = git(origin.project, "rev-parse", "HEAD");
  await work.commit(firstAt, "first.txt");
  dashboard.claudeSessionBecomes(sessionId, "done-live");
  await session.report({ message: "" });
  const firstDone = (await keptAdHocRecord(dashboard, sessionId))?.doneAt;
  expect(firstDone).toEqual(expect.any(String));
  await expect
    .poll(
      async () => (await keptAdHocRecord(dashboard, sessionId))?.doneProblem,
    )
    .toBeUndefined();

  const second = await work.commit(secondAt, "second.txt");
  await session.report({ message: "" });
  const secondDone = (await keptAdHocRecord(dashboard, sessionId))?.doneAt;
  expect(secondDone).toEqual(expect.any(String));
  expect(secondDone).not.toBe(firstDone);

  await expect
    .poll(() => adHocReview(request, dashboard, sessionId))
    .toMatchObject({
      kind: "session-commits",
      session: { doneAt: secondDone },
      commitRuns: [{ commits: 2, subject: "Add second.txt" }],
      baseline: start,
      tree: second,
    });
});

test("retrying the same quiet delivery resumes native Done without repeating its failed capture", async ({
  dashboard,
  origin,
  request,
}) => {
  const work = new DefaultMainSessionWork(dashboard, origin);
  const session = await work.launchReporting("Fix the typo");
  const { sessionId } = session;
  await work.commit(firstAt, "typo.txt");
  const log = path.resolve(
    origin.project,
    git(origin.project, "rev-parse", "--git-path", "logs"),
  );
  const hiddenLog = `${log}.hidden`;
  dashboard.claudeSessionBecomes(sessionId, "done-live");
  dashboard.claudeAttachesSilent(true);
  renameSync(log, hiddenLog);
  try {
    await session.report({ message: "" });
    await expect.poll(() => dashboard.claudeAttaches().length).toBe(1);
    await dashboard.close();
  } finally {
    renameSync(hiddenLog, log);
  }

  const receiver = await startDashboardServer({
    mode: "boundary",
    machine: origin.machine,
    projectFolders: ["open-dough"],
    port: Number(new URL(dashboard.origin).port),
  });
  try {
    const [record] = keptLaunchRecords(receiver);
    if (record === undefined || !("session" in record))
      throw new Error("Expected a retained launch");
    const { completion: receipt } = record;
    const command = record.request.reporting?.command;
    if (command === undefined || receipt?.delivery === undefined)
      throw new Error("Expected a retained reporting delivery");
    const submission = path.join(
      receiver.home,
      ".open-dough/dashboard/reporting",
      receipt.reference,
      `completion-${receipt.delivery}.json`,
    );
    const retry = await reportingChild(
      `${command} --retry ${quote(submission)}`,
      origin.machine,
    );
    expect(retry.ok).toBe(true);
    await expect.poll(() => receiver.claudeAttaches().length).toBe(2);
    expect(await adHocReview(request, receiver, sessionId)).toMatchObject({
      kind: "landing-unavailable",
      explanation: "This session's changes were not captured.",
    });
  } finally {
    await receiver.close();
  }
});
