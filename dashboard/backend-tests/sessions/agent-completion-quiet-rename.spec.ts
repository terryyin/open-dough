// A Claude Code session's quiet completion at the server
// (../../server/doneMarks.ts): Mark as done during the rename wait takes it
// over, so one rename runs; a turn that outlasts the wait names that cause
// for Mark as done to retry; a server closed during the wait leaves the
// pending mark and hangs up its attachment. Real start, launch, installed
// reporting command and store; only Claude and GitHub are fakes. The
// receipt's pending mark on the page and its rename once idle:
// ../../../e2e/sessions/agent-completion-quiet-claude.spec.ts.

import { queuedReadyRepository } from "../../../tests/support/queued-repository.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { markDone, recordsOf } from "../../tests/agentLaunchBoundary.ts";
import { expect } from "../../tests/dashboardTest.ts";
import { machineHome } from "../../tests/machineLaunchRecords.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { keptLaunchRecords } from "../../tests/support/launchStore.ts";
import {
  launchedAdHoc,
  shortIdOf,
} from "../../tests/support/reportedLaunch.ts";
import { startOrigin } from "../../tests/support/startOrigin.ts";
import { test } from "../../tests/support/startOriginTest.ts";

const title = "Story A";
const pending = "Local done mark retained. Native done mark is pending.";
const stillWorking =
  "Local done mark retained. Claude Code rename failed: The session was still working when the wait ended.";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 30_000 });

async function recordOf(
  dashboard: DashboardServer,
  sessionId: string,
): Promise<LaunchRecord | undefined> {
  return ((await recordsOf(dashboard, "open-dough")) as LaunchRecord[]).find(
    (record) => record.session.sessionId === sessionId,
  );
}

test.describe("within a wait the session outlasts", () => {
  test.use({ extraEnv: { DOUGH_DONE_RENAME_WAIT_MS: "30000" } });

  test("Mark as done during the wait takes it over: one rename runs and the reported write is dropped", async ({
    dashboard,
    origin,
  }) => {
    const story = await launchedAdHoc(dashboard, origin, title);
    const { sessionId } = story;
    const shortId = shortIdOf(dashboard, sessionId);
    await story.report({ message: "" });
    const reported = await recordOf(dashboard, sessionId);
    expect(reported?.doneProblem).toBe(pending);
    const doneName = `done-${String(reported?.session.name)}`;

    const marking = markDone(dashboard, {
      source: "open-dough",
      session: sessionId,
    });
    // The developer's mark is written once the reported rename is abandoned.
    await expect
      .poll(async () => (await recordOf(dashboard, sessionId))?.doneAt)
      .not.toBe(reported?.doneAt);
    dashboard.claudeSessionBecomes(sessionId, "done-live");
    const marked = await marking;
    expect(marked.status).toBe(200);
    expect(JSON.parse(marked.body)).toMatchObject({
      record: { doneAt: expect.any(String) },
    });
    expect(
      (JSON.parse(marked.body) as { record: LaunchRecord }).record.doneProblem,
    ).toBeUndefined();
    expect(dashboard.claudeAttaches()).toEqual([
      expect.objectContaining({
        id: shortId,
        lines: [`/rename ${doneName}`],
        endedBy: "SIGHUP",
      }),
    ]);
    expect(dashboard.claudeStopCalls()).toEqual([
      expect.objectContaining({ argv: ["stop", shortId] }),
    ]);
    const record = await recordOf(dashboard, sessionId);
    expect(record?.doneAt).toBe(
      (JSON.parse(marked.body) as { record: LaunchRecord }).record.doneAt,
    );
    expect(record?.doneProblem).toBeUndefined();
  });
});

test.describe("within a short wait", () => {
  test.use({ extraEnv: { DOUGH_DONE_RENAME_WAIT_MS: "2000" } });

  test("a turn that outlasts the wait keeps the local mark and names that cause; Mark as done renames it once idle", async ({
    dashboard,
    origin,
  }) => {
    const story = await launchedAdHoc(dashboard, origin, title);
    const { sessionId } = story;
    const shortId = shortIdOf(dashboard, sessionId);
    await story.report({ message: "" });
    const reported = await recordOf(dashboard, sessionId);
    const doneName = `done-${String(reported?.session.name)}`;
    await expect
      .poll(async () => (await recordOf(dashboard, sessionId))?.doneProblem)
      .toBe(stillWorking);
    expect((await recordOf(dashboard, sessionId))?.doneAt).toBe(
      reported?.doneAt,
    );
    expect(dashboard.claudeAttaches()).toEqual([]);

    dashboard.claudeSessionBecomes(sessionId, "done-live");
    const marked = await markDone(dashboard, {
      source: "open-dough",
      session: sessionId,
    });
    expect(marked.status).toBe(200);
    expect(
      (JSON.parse(marked.body) as { record: LaunchRecord }).record.doneProblem,
    ).toBeUndefined();
    expect(
      dashboard.claudeListing().find((each) => each["id"] === shortId)?.[
        "name"
      ],
    ).toBe(doneName);
    expect(dashboard.claudeAttaches()).toEqual([
      expect.objectContaining({ lines: [`/rename ${doneName}`] }),
    ]);
  });
});

test("a server closed during the wait leaves the pending mark and hangs up its attachment", async () => {
  const origin = await startOrigin(queuedReadyRepository().please());
  const server = await startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    machine: origin.machine,
    projectFolders: ["open-dough"],
    launchTimeoutMs: 30_000,
    doneRenameWaitMs: 30_000,
  });
  let closed = false;
  try {
    const story = await launchedAdHoc(server, origin, title);
    const { sessionId } = story;
    // Idle, but its attachment never shows a screen, so the rename waits.
    server.claudeSessionBecomes(sessionId, "done-live");
    server.claudeAttachesSilent(true);
    await story.report({ message: "" });
    await expect.poll(() => server.claudeAttaches().length).toBe(1);

    await server.close();
    closed = true;
    const [record] = keptLaunchRecords(machineHome(origin.machine));
    if (record && !("session" in record))
      throw new Error("Expected a kept launch");
    expect(record?.doneProblem).toBe(pending);
    await expect
      .poll(() => server.claudeAttaches())
      .toEqual([expect.objectContaining({ endedBy: "SIGHUP" })]);
  } finally {
    if (!closed) await server.close();
    origin.cleanup();
  }
});
