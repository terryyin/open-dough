// Page owner of a Codex attention completion already stored on Story B.
// This spec launches nothing, runs no installed closure and no installed
// reporting, and does not restart the dashboard.
// Overlap: session-unread-report.spec.ts shows "Unfinished work" for a
// Claude session. session-workspace-retirement*.spec.ts and
// agent-completion-identity.spec.ts do not prove an unfinished label, a
// Taken-column move, workspace removal, this final-report panel, or Mark as
// read keeping the session open for a Codex attention completion.
import { rmSync } from "node:fs";
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
  const workspace =
    await test.step("Given a Codex record for Story B already carries the completed attention message", () =>
      keepComposedAttentionCompletion(
        dashboard,
        codexProtocol,
        attentionMessage,
      ));
  await test.step("And the saved conversation keeps its native final report", () => {
    if (codexProtocol === undefined) throw new Error("Missing native fixture");
    keepFinalReport(codexProtocol, workspace, nativeReport);
  });
  await test.step("And the composed workspace path is already gone", () => {
    rmSync(workspace, { recursive: true, force: true });
  });
  const card =
    await test.step("When the story-columns page opens on the queued revision", async () => {
      const opened = await openStoryColumnsJourney(page, journey);
      return opened.card(readyStory);
    });
  const report =
    await test.step("And the final report is read from that Story B card", () =>
      readFinalReport(card));
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
  const workspace =
    await test.step("Given a Codex record for Story B already carries the completed attention message", () =>
      keepComposedAttentionCompletion(
        dashboard,
        codexProtocol,
        attentionMessage,
      ));
  await test.step("And the saved conversation keeps its native final report", () => {
    if (codexProtocol === undefined) throw new Error("Missing native fixture");
    keepFinalReport(codexProtocol, workspace, nativeReport);
  });
  const receipt =
    await test.step("And the stored launch record keeps its completion receipt", () => {
      const kept = stored(dashboard.home)[0]?.completion?.receipt;
      if (kept === undefined) throw new Error("Missing completion receipt");
      return kept;
    });
  await test.step("And the composed workspace path is already gone", () => {
    rmSync(workspace, { recursive: true, force: true });
  });
  const card =
    await test.step("When the story-columns page opens on the queued revision", async () => {
      const opened = await openStoryColumnsJourney(page, journey);
      return opened.card(readyStory);
    });
  const report =
    await test.step("And the final report is read from that Story B card", () =>
      readFinalReport(card));
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
