// Page owner of a Codex attention completion already stored on Story B.
// This spec launches nothing, runs no installed closure and no installed
// reporting, and does not restart the dashboard.
// Overlap: session-unread-report.spec.ts shows "Unfinished work" for a
// Claude session. session-workspace-retirement*.spec.ts and
// agent-completion-identity.spec.ts do not prove an unfinished label, a
// Taken-column move, workspace removal, this final-report panel, Mark as
// read keeping the session open, or Mark as done closing that panel,
// clearing the card message, and steering the native session for a Codex
// attention completion.
import { rmSync } from "node:fs";
import type { Page } from "@playwright/test";
import {
  test,
  expect,
  stored,
} from "../../dashboard/test-support/support/codexLaunch.ts";
import { pausePageClockAt } from "../../dashboard/test-support/dashboardTest.ts";
import {
  parts,
  sessionStateOf,
  sessionUnreadReportOf,
  storyCardSessions,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  publishStoryColumnsJourney,
  readyStory,
  type StoryColumnsJourney,
} from "../../dashboard/test-support/launchJourney.ts";
import { watchRecordReads } from "../../dashboard/test-support/sessionStatePace.ts";
import { storyCard } from "../../dashboard/test-support/storyCardControls.ts";
import { readFinalReport } from "../../dashboard/test-support/finalReportPages.ts";
import { openStoryColumnsJourney } from "../../dashboard/test-support/storyColumnsPage.ts";
import {
  buttonsAddedSince,
  messagePartOf,
  rememberButtons,
} from "../../dashboard/test-support/support/sessionMessagePart.ts";
import { keepComposedAttentionCompletion } from "../../dashboard/test-support/support/composedAttentionRecord.ts";
import type { DashboardServer } from "../../dashboard/test-support/support/dashboardServer.ts";
import type { FakeCodex } from "../../dashboard/test-support/support/fakeCodex.ts";
import { markDoneAnyway } from "../../dashboard/test-support/support/markDone.ts";
import { keepFinalReport } from "../../dashboard/test-support/support/retainedReport.ts";

test.use({ projectFolders: ["open-dough"] });
let journey: StoryColumnsJourney;
test.beforeAll(async () => {
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());

const attentionMessage =
  "Publication finished. Reminder: inspect the migration before release.\n<script>must remain text</script>";
const nativeReport = "The saved conversation's final report.";
const doneSteering = ["turn/interrupt", "thread/name/set", "turn/start"];

// Story B's queued card with the saved native report already open. The
// workspace path is gone first, or the card offers Open terminal instead.
async function openQueuedNativeReport(
  page: Page,
  dashboard: DashboardServer,
  native: FakeCodex | undefined,
) {
  const workspace = keepComposedAttentionCompletion(
    dashboard,
    native,
    attentionMessage,
  );
  if (native === undefined) throw new Error("Missing native fixture");
  keepFinalReport(native, workspace, nativeReport);
  rmSync(workspace, { recursive: true, force: true });
  const opened = await openStoryColumnsJourney(page, journey);
  const card = opened.card(readyStory);
  return { native, card, report: await readFinalReport(card) };
}

function steeringSince(native: FakeCodex, from: number) {
  return native.calls
    .slice(from)
    .filter((call) => doneSteering.includes(call.method));
}

test("the backlog card shows a composed Codex attention completion", async ({
  page,
  dashboard,
  codexProtocol,
}) => {
  await test.step("Given a Codex record for Story B already carries the completed attention message", () =>
    keepComposedAttentionCompletion(
      dashboard,
      codexProtocol,
      attentionMessage,
    ));
  const card =
    await test.step("When the story-columns page opens on the queued revision", async () => {
      const opened = await openStoryColumnsJourney(page, journey);
      return opened.card(readyStory);
    });
  await test.step("Then the backlog card shows that message as text", async () => {
    await expect(messagePartOf(card).text).toHaveText(attentionMessage);
    await expect(messagePartOf(card).part.locator("script")).toHaveCount(0);
  });
  await test.step("And it shows Working", () =>
    expect(sessionStateOf(card)).toHaveText("Working"));
  await test.step('And it shows "Unread report: Completed with attention"', () =>
    expect(sessionUnreadReportOf(card)).toHaveText(
      "Unread report: Completed with attention",
    ));
  await test.step("And it shows Mark as read", () =>
    expect(messagePartOf(card).markRead).toBeVisible());
});

test("the card follows an unfinished completion and the published column", async ({
  page,
  dashboard,
  codexProtocol,
}) => {
  const workspace =
    await test.step("Given a Codex record for Story B already carries the completed attention message", () =>
      keepComposedAttentionCompletion(
        dashboard,
        codexProtocol,
        attentionMessage,
      ));
  const pace =
    await test.step("When the page clock is paused and record reads are watched", async () => {
      await pausePageClockAt(page, new Date());
      return watchRecordReads(page);
    });
  const opened =
    await test.step("And the story-columns page opens on the queued revision", () =>
      openStoryColumnsJourney(page, journey));
  await test.step("When the stored completion is rewritten unfinished and one pace passes", async () => {
    keepComposedAttentionCompletion(
      dashboard,
      codexProtocol,
      attentionMessage,
      "unfinished",
    );
    await pace.passOnePace();
  });
  await test.step('Then the open card shows "Unfinished work"', () =>
    expect(opened.card(readyStory)).toContainText("Unfinished work"));
  const taken =
    await test.step("When the published backlog takes Story B", async () => {
      await opened.show(journey.taken);
      return storyCard(parts(page).taken, readyStory);
    });
  await test.step("Then the message is on the Taken card", () =>
    expect(messagePartOf(taken).text).toHaveText(attentionMessage));
  await test.step("When the composed workspace path is removed", () => {
    rmSync(workspace, { recursive: true, force: true });
  });
  await test.step("Then removing the workspace path does not clear that message", () =>
    expect(messagePartOf(taken).text).toHaveText(attentionMessage));
});

test("the final report panel shows the native report", async ({
  page,
  dashboard,
  codexProtocol,
}) => {
  const { report } =
    await test.step("Given Story B's queued card shows the saved native final report", () =>
      openQueuedNativeReport(page, dashboard, codexProtocol));
  await test.step("Then the final report panel shows the native report", () =>
    expect(report.reportText).toHaveText(nativeReport));
  await test.step("And the final report panel does not show the reminder", () =>
    expect(report.panel).not.toContainText("Reminder: inspect the migration"));
  await test.step("And the final report panel offers no Mark as read", () =>
    expect(
      report.panel.getByRole("button", { name: "Mark as read" }),
    ).toHaveCount(0));
});

test("Mark as read keeps the session open", async ({
  page,
  dashboard,
  codexProtocol,
}) => {
  const { card, report } =
    await test.step("Given Story B's queued card shows the saved native final report", () =>
      openQueuedNativeReport(page, dashboard, codexProtocol));
  const receipt =
    await test.step("And the stored launch record keeps its completion receipt", () => {
      const kept = stored(dashboard.home)[0]?.completion?.receipt;
      if (kept === undefined) throw new Error("Missing completion receipt");
      return kept;
    });
  await test.step("And the final report panel's buttons are remembered", () =>
    rememberButtons(report.panel));
  await test.step("When Mark as read is chosen on that Story B card", () =>
    messagePartOf(card).markRead.click());
  await test.step("Then Mark as read clears the button", () =>
    expect(messagePartOf(card).markRead).toHaveCount(0));
  await test.step("And the stored record's reportRead is that completion receipt", () =>
    expect.poll(() => stored(dashboard.home)[0]?.reportRead).toBe(receipt));
  await test.step("And the stored record leaves doneAt unset", () => {
    expect(stored(dashboard.home)[0]?.doneAt).toBeUndefined();
  });
  await test.step("And Mark as read adds no panel button", async () => {
    expect(await buttonsAddedSince(report.panel)).toEqual([]);
  });
});

test("Mark as done renames and interrupts the native session", async ({
  page,
  dashboard,
  codexProtocol,
}) => {
  const { card, report, native } =
    await test.step("Given Story B's queued card shows the saved native final report", () =>
      openQueuedNativeReport(page, dashboard, codexProtocol));
  await test.step("And the native session is observing an in-progress turn", () => {
    native.observations.set(native.threadId, {
      status: { type: "active", activeFlags: [] },
      turns: [{ id: "observed-turn", status: "inProgress" }],
    });
  });
  const before =
    await test.step("When Mark as done is chosen on that final report", async () => {
      const marked = native.calls.length;
      await markDoneAnyway(report.panel);
      return marked;
    });
  await test.step("Then Mark as done closes the panel", () =>
    expect(report.panel).toHaveCount(0));
  await test.step("And Mark as done removes the message from the story card", () =>
    expect(messagePartOf(storyCardSessions(card)).part).toHaveCount(0));
  await test.step("And Mark as done sets doneAt", () => {
    expect(stored(dashboard.home)[0]?.doneAt).toBeDefined();
  });
  await test.step("And Mark as done sets that with no done problem", () => {
    expect(stored(dashboard.home)[0]?.doneProblem).toBeUndefined();
  });
  await test.step("And the native calls since the mark rename the session and interrupt its turn", () => {
    const doneName = `done-${stored(dashboard.home)[0]?.session.name ?? ""}`;
    expect(steeringSince(native, before)).toEqual([
      {
        method: "thread/name/set",
        params: { threadId: native.threadId, name: doneName },
      },
      {
        method: "turn/interrupt",
        params: { threadId: native.threadId, turnId: "observed-turn" },
      },
    ]);
  });
});
