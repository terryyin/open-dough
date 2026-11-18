// Done owns what a Default main session's record keeps of its commits, over
// raw HTTP at the boundary server with a real bare origin and project
// checkout (../../tests/support/startOrigin.ts), the synthetic `claude`, and
// plain Git in the checkout (../../tests/support/sessionCheckoutWork.ts):
// reopening leaves the earlier capture until the next Done, which replaces
// it, and a reported Done keeps its commits before its native rename wait,
// which a closing server abandons. A single Done's capture answers as
// ./ad-hoc-session-commits.spec.ts states.

import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { openTerminal } from "../../tests/agentTerminalBoundary.ts";
import { machineHome } from "../../tests/machineLaunchRecords.ts";
import {
  adHocReview,
  keptAdHocRecord,
  launchDefaultMainSession,
  markAdHocDone,
} from "../../tests/support/adHocReview.ts";
import { startDashboardServer } from "../../tests/support/dashboardServer.ts";
import { keptLaunchRecords } from "../../tests/support/launchStore.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { launchedAdHoc } from "../../tests/support/reportedLaunch.ts";
import { commitInCheckout } from "../../tests/support/sessionCheckoutWork.ts";
import { startOrigin } from "../../tests/support/startOrigin.ts";
import { git } from "../../tests/support/storyReviewWorktree.ts";

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
  const record = await launchDefaultMainSession(dashboard, "Fix the typo");
  const { sessionId } = record.session;
  const kept = () => keptAdHocRecord(dashboard, sessionId);
  const start = git(origin.project, "rev-parse", "HEAD");
  const first = await commitInCheckout(origin.project, firstAt, "first.txt");
  dashboard.claudeSessionBecomes(sessionId, "working-idle");
  await markAdHocDone(dashboard, sessionId);

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

  const second = await commitInCheckout(origin.project, secondAt, "second.txt");
  const doneAt = await markAdHocDone(dashboard, sessionId);

  expect(await adHocReview(request, dashboard, sessionId)).toMatchObject({
    kind: "session-commits",
    session: { launchedAt: record.launchedAt, doneAt },
    commitRuns: [{ commits: 2, subject: "Add second.txt" }],
    baseline: start,
    tree: second,
  });
});

test("a reported Done whose rename wait a closing server abandons has kept its commits", async () => {
  const origin = await startOrigin(queuedReadyRepository().please());
  const server = await startDashboardServer({
    mode: "boundary",
    machine: origin.machine,
    projectFolders: ["open-dough"],
    launchTimeoutMs: 30_000,
    doneRenameWaitMs: 30_000,
  });
  let closed = false;
  try {
    const session = await launchedAdHoc(server, origin, "Fix the typo");
    const start = git(origin.project, "rev-parse", "HEAD");
    const committed = await commitInCheckout(
      origin.project,
      firstAt,
      "typo.txt",
    );
    // Idle, but its attachment never shows a screen, so the rename waits.
    server.claudeSessionBecomes(session.sessionId, "done-live");
    server.claudeAttachesSilent(true);
    await session.report({ message: "" });
    await expect.poll(() => server.claudeAttaches().length).toBe(1);

    await server.close();
    closed = true;

    const [record] = keptLaunchRecords(machineHome(origin.machine));
    if (record && !("session" in record))
      throw new Error("Expected a kept launch");
    expect(record).toMatchObject({
      doneAt: expect.any(String),
      doneProblem: "Local done mark retained. Native done mark is pending.",
      sessionCommits: { runs: [{ base: start, revision: committed }] },
    });
  } finally {
    if (!closed) await server.close();
    origin.cleanup();
  }
});
