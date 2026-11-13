import { sessionActions } from "../../dashboard/tests/support/sessionEntryDisclosure.ts";
// A Claude Code session's quiet completion renames it once its receipt is
// sent (../../dashboard/server/doneMarks.ts): the receipt answers at once with the local
// Done mark pending, shown as ordinary text, and the rename waits for Claude
// Code to list the session idle, then runs through one private attachment.
// Mark as done during the wait, a turn that outlasts it and a server closed
// during it: ../../dashboard/backend-tests/sessions/agent-completion-quiet-rename.spec.ts.
// Real start, launch, installed reporting command, store and
// page; only Claude and GitHub are fakes. Early reports bound later are
// ../../dashboard/backend-tests/sessions/agent-completion-binding.spec.ts; Codex's is
// ./agent-completion-quiet.spec.ts.

import { recordsOf } from "../../dashboard/tests/agentLaunchBoundary.ts";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import { showColumn } from "../../dashboard/tests/boardPage.ts";
import type { DashboardServer } from "../../dashboard/tests/support/dashboardServer.ts";
import {
  launchedAdHoc,
  shortIdOf,
} from "../../dashboard/tests/support/reportedLaunch.ts";
import {
  publishOrigin,
  test,
} from "../../dashboard/tests/support/startOriginTest.ts";
import { expect } from "../../dashboard/tests/dashboardTest.ts";
import type { LaunchRecord } from "../../dashboard/src/launchRecord.ts";
import {
  openUntilRead,
  reloadUntilRead,
} from "../../dashboard/tests/pageRequestNotes.ts";

const title = "Story A";
const pending = "Local done mark retained. Native done mark is pending.";

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
    const story = await launchedAdHoc(dashboard, origin, title);
    const { sessionId } = story;
    const shortId = shortIdOf(dashboard, sessionId);
    await story.report({ message: "" });
    const reported = await recordOf(dashboard, sessionId);
    expect(reported?.doneAt).toBe(reported?.completion?.receivedAt);
    expect(reported?.doneProblem).toBe(pending);
    const doneName = `done-${String(reported?.session.name)}`;

    await publishOrigin(page, origin);
    await openUntilRead(page);
    await showColumn(page, "Recently done");
    const recent = parts(page)
      .recentlyDone.getByRole("article")
      .filter({ hasText: sessionId });
    await expect(recent).toContainText(`Intended name ${doneName}`);
    await expect(recent.getByText(pending)).toBeVisible();
    await expect(recent.locator(".launch-problem")).not.toContainText(pending);
    await expect(
      (await sessionActions(recent)).getByRole("button", {
        name: "Mark as done",
        exact: true,
      }),
    ).toBeVisible();
    expect(dashboard.claudeAttaches()).toEqual([]);

    // Its banner precedes the composer; even quiet Done waits for that prompt.
    dashboard.claudeAttachPromptDelay(800);
    // The sender's turn ends; the session idles and is renamed.
    dashboard.claudeSessionBecomes(sessionId, "done-live");
    await expect
      .poll(async () => (await recordOf(dashboard, sessionId))?.doneProblem, {
        timeout: 30_000,
      })
      .toBeUndefined();
    await reloadUntilRead(page);
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
});
