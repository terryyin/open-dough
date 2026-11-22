// Page owner of a Codex attention completion already stored on Story B.
// This spec launches nothing, runs no installed closure and no installed
// reporting, and does not restart the dashboard.
// Overlap: session-unread-report.spec.ts is a Claude session.
// session-workspace-retirement*.spec.ts and
// agent-completion-identity.spec.ts do not prove these card observations
// for a Codex attention completion.
import {
  test,
  expect,
} from "../../dashboard/test-support/support/codexLaunch.ts";
import {
  sessionStateOf,
  sessionUnreadReportOf,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  publishStoryColumnsJourney,
  readyStory,
  type StoryColumnsJourney,
} from "../../dashboard/test-support/launchJourney.ts";
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
