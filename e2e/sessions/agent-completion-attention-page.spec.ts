// Page owner of a Codex attention completion already stored on Story B.
// This spec launches nothing, runs no installed closure and no installed
// reporting, and does not restart the dashboard.
// Overlap: session-unread-report.spec.ts shows "Unfinished work" for a
// Claude session. session-workspace-retirement*.spec.ts and
// agent-completion-identity.spec.ts do not prove an unfinished label, a
// Taken-column move, or workspace removal for a Codex attention completion.
import { rmSync } from "node:fs";
import {
  test,
  expect,
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
import { openStoryColumnsJourney } from "../../dashboard/test-support/storyColumnsPage.ts";
import { messagePartOf } from "../../dashboard/test-support/support/sessionMessagePart.ts";
import { keepComposedAttentionCompletion } from "../../dashboard/test-support/support/composedAttentionRecord.ts";

test.use({ projectFolders: ["open-dough"] });
let journey: StoryColumnsJourney;
test.beforeAll(async () => {
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());

const attentionMessage =
  "Publication finished. Reminder: inspect the migration before release.\n<script>must remain text</script>";

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
