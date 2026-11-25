// Owns the Recently done observations of a quiet Codex completion, from a
// composed record that is already retired and reported. Real installed
// closure, retirement and reporting are owned by agent-completion-quiet.spec.ts.
import { readFinalReport } from "../../dashboard/test-support/finalReportPages.ts";
import {
  test,
  expect,
} from "../../dashboard/test-support/support/codexLaunch.ts";
import {
  parts,
  sessionEntryShowing,
  sessionStateOf,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "../../dashboard/test-support/launchJourney.ts";
import { sessionAction } from "../../dashboard/test-support/support/sessionEntryDisclosure.ts";
import {
  keepFinalReport,
  givenRetiredCodexReport,
  save,
} from "../../dashboard/test-support/support/retainedReport.ts";
import { openStoryColumnsJourney } from "../../dashboard/test-support/storyColumnsPage.ts";
import { reloadUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type { FakeCodex } from "../../dashboard/test-support/support/fakeCodex.ts";
import type { DashboardServer } from "../../dashboard/test-support/support/dashboardServer.ts";
import type { Page } from "@playwright/test";

test.use({ projectFolders: ["open-dough"] });
let journey: StoryColumnsJourney;
test.beforeAll(async () => {
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());

// What the quiet completion's native history keeps as its final answer.
const nativeFinalReport = "Done.";

// A retired Codex record quietly reported and marked Done at its receipt.
// The optional problem records a refused native rename.
async function quietlyDone(
  dashboard: DashboardServer,
  native: FakeCodex | undefined,
  problem?: string,
) {
  if (native === undefined) throw new Error("Missing native fixture");
  const { record, workspace } = await givenRetiredCodexReport(
    dashboard,
    native,
  );
  // Received now, so the Done mark stays inside the store's retention window.
  const completion = makeMe.aCompletionReport
    .receivedAt(new Date().toISOString())
    .please();
  save(dashboard.home, [
    {
      ...record,
      completion,
      doneAt: completion.receivedAt,
      ...(problem !== undefined && { doneProblem: problem }),
    },
  ]);
  keepFinalReport(native, workspace, nativeFinalReport);
  return native;
}

// The quietly done record's entry in Recently done, once the page shows the
// completed story.
async function showRecentlyDoneEntry(page: Page, native: FakeCodex) {
  const { show } = await openStoryColumnsJourney(page, journey);
  await show(journey.completed);
  return sessionEntryShowing(
    parts(page).recentlyDone,
    `codex:${native.threadId}`,
  );
}

// Whether the native calls since call `since` include a thread read with its
// turns, the read that carries the final report.
function readTurnsSince(native: FakeCodex, since: number) {
  return native.calls
    .slice(since)
    .some(
      (call) =>
        call.method === "thread/read" && call.params["includeTurns"] === true,
    );
}

test("a quiet Codex completion reads Done in Recently done with its native final report, no attention, and survives a reload", async ({
  page,
  dashboard,
  codexProtocol,
}) => {
  const native =
    await test.step("Given a retired Codex record quietly reported Done", () =>
      quietlyDone(dashboard, codexProtocol));
  const recent = await test.step("When the developer opens Recently done", () =>
    showRecentlyDoneEntry(page, native));
  await test.step("Then its entry reads Done", () =>
    expect(sessionStateOf(recent)).toHaveText("Done"));
  await test.step("And neither Startup recovery nor an attention message shows", async () => {
    await expect(parts(page).startupRecovery).toHaveCount(0);
    await expect(recent.locator(".session-attention-message")).toHaveCount(0);
  });
  const { since, reportText } =
    await test.step("When the developer reads its final report", async () => {
      const since = native.calls.length;
      return { since, ...(await readFinalReport(recent)) };
    });
  await test.step("Then it shows the native final answer, read with the thread's turns", async () => {
    await expect(reportText).toHaveText(nativeFinalReport);
    expect(readTurnsSince(native, since)).toBe(true);
    await expect(sessionStateOf(recent)).toHaveText("Done");
  });
  await test.step("When the page reloads", () => reloadUntilRead(page));
  await test.step("Then the entry still reads Done", () =>
    expect(sessionStateOf(recent)).toHaveText("Done"));
});

test("a refused native rename shows on the Recently done entry, which offers Mark as done", async ({
  page,
  dashboard,
  codexProtocol,
}) => {
  const native =
    await test.step("Given a quietly done Codex record whose native rename was refused", () =>
      quietlyDone(dashboard, codexProtocol, "Native rename refused."));
  const recent = await test.step("When the developer opens Recently done", () =>
    showRecentlyDoneEntry(page, native));
  await test.step("Then its entry shows the refusal and offers Mark as done", async () => {
    await expect(recent).toContainText("Native rename refused.");
    await expect(await sessionAction(recent, "Mark as done")).toBeVisible();
  });
});
