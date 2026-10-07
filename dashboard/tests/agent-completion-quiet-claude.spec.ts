// A Claude Code session's quiet completion renames it once its receipt is
// sent (../server/doneMarks.ts): the receipt answers at once with the local
// Done mark pending, shown as ordinary text, and the rename waits for Claude
// Code to list the session idle, then runs through one private attachment.
// A turn that outlasts the wait names that cause for Mark as done to retry;
// Mark as done during the wait takes it over, so one rename runs; a server
// closed during the wait leaves the pending mark and hangs up its
// attachment. Real start, launch, installed reporting command, store and
// page; only Claude and GitHub are fakes. Early reports bound later are
// ./agent-completion-binding.spec.ts; Codex's is
// ./agent-completion-quiet.spec.ts.

import { markDone, recordsOf } from "./agentLaunchBoundary.ts";
import { parts } from "./dashboardPage.ts";
import { showColumn } from "./dashboardColumnsPage.ts";
import { storedRecords } from "./machineLaunchRecords.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { launchedStory, shortIdOf } from "./support/reportedLaunch.ts";
import { queuedIdentity, startOrigin } from "./support/startOrigin.ts";
import { publishOrigin, test } from "./support/startOriginTest.ts";
import { expect } from "./dashboardTest.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";

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

  test("a quiet report's receipt keeps the mark pending, not a problem, until the idle session is renamed through one private attachment", async ({
    page,
    dashboard,
    origin,
  }) => {
    test.setTimeout(120_000);
    const story = await launchedStory(dashboard, origin, queuedIdentity, title);
    const { sessionId } = story;
    const shortId = shortIdOf(dashboard, sessionId);
    await story.report({ message: "" });
    const reported = await recordOf(dashboard, sessionId);
    expect(reported?.doneAt).toBe(reported?.completion?.receivedAt);
    expect(reported?.doneProblem).toBe(pending);
    const doneName = `done-${String(reported?.session.name)}`;

    await publishOrigin(page, origin);
    await page.goto("/");
    await showColumn(page, "Recently done");
    const recent = parts(page)
      .recentlyDone.getByRole("article")
      .filter({ hasText: title });
    await expect(recent).toContainText(`Intended name ${doneName}`);
    await expect(recent.getByText(pending)).toBeVisible();
    await expect(recent.locator(".launch-problem")).not.toContainText(pending);
    await expect(
      recent.getByRole("button", { name: "Mark as done", exact: true }),
    ).toBeVisible();
    expect(dashboard.claudeAttaches()).toEqual([]);

    // The sender's turn ends; the session idles and is renamed.
    dashboard.claudeSessionBecomes(sessionId, "done-live");
    await expect
      .poll(async () => (await recordOf(dashboard, sessionId))?.doneProblem, {
        timeout: 30_000,
      })
      .toBeUndefined();
    await page.reload();
    await showColumn(page, "Recently done");
    await expect(recent).toContainText(`Named ${doneName}`);
    await expect(recent).not.toContainText(pending);
    expect(
      dashboard.claudeListing().find((each) => each["id"] === shortId)?.[
        "name"
      ],
    ).toBe(doneName);
    expect(dashboard.claudeAttaches()).toEqual([
      expect.objectContaining({
        id: shortId,
        lines: [`/rename ${doneName}`],
        endedBy: "SIGHUP",
      }),
    ]);
    expect(dashboard.claudeStopCalls()).toEqual([]);
  });

  test("Mark as done during the wait takes it over: one rename runs and the reported write is dropped", async ({
    dashboard,
    origin,
  }) => {
    test.setTimeout(120_000);
    const story = await launchedStory(dashboard, origin, queuedIdentity, title);
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
    test.setTimeout(120_000);
    const story = await launchedStory(dashboard, origin, queuedIdentity, title);
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
  test.setTimeout(120_000);
  const origin = await startOrigin();
  const server = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine: origin.machine,
    projectFolders: ["open-dough"],
    launchTimeoutMs: 30_000,
    doneRenameWaitMs: 30_000,
  });
  let closed = false;
  try {
    const story = await launchedStory(server, origin, queuedIdentity, title);
    const { sessionId } = story;
    // Idle, but its attachment never shows a screen, so the rename waits.
    server.claudeSessionBecomes(sessionId, "done-live");
    server.claudeAttachesSilent(true);
    await story.report({ message: "" });
    await expect.poll(() => server.claudeAttaches().length).toBe(1);

    await server.close();
    closed = true;
    const [record] = storedRecords(origin.machine) as LaunchRecord[];
    expect(record?.doneProblem).toBe(pending);
    await expect
      .poll(() => server.claudeAttaches())
      .toEqual([expect.objectContaining({ endedBy: "SIGHUP" })]);
  } finally {
    if (!closed) await server.close();
    origin.cleanup();
  }
});
