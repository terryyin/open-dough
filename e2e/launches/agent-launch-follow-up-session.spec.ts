// The Follow up journey on a Taken card: a Done session that still opens its
// terminal offers no Follow up until its conversation is confirmed
// unavailable; the card's Follow up then starts a new session under the
// published story. Which sessions offer Follow up and the context each names
// are mounted in
// ../../dashboard/frontend-tests/launches/follow-up-availability.spec.ts.
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { openTerminalControl } from "../../dashboard/test-support/terminalScreenPage.ts";
import { sessionStateOf } from "../../dashboard/test-support/dashboardPage.ts";
import { openTakenBacklog } from "../../dashboard/test-support/launchStoryCardPage.ts";
import { listed } from "../../dashboard/test-support/recentlyDoneColumn.ts";
import { stored } from "../../dashboard/test-support/support/codexLaunch.ts";
import {
  quietSession,
  quietTitle,
} from "../../dashboard/test-support/support/followUpSources.ts";
import {
  takenIdentity,
  takenStory,
} from "../../dashboard/test-support/launchJourney.ts";
import { sessionFollowUpPage } from "../../dashboard/test-support/support/sessionFollowUpPage.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import { launchWaitMs } from "../../dashboard/test-support/support/launchWait.ts";

test.use({ projectFolders: ["open-dough"] });

test("a Done session offers Follow up once its conversation is confirmed unavailable, and the Taken card's Follow up starts a new session under its published story", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  const sessionId = listed(dashboard, Date.now(), quietTitle, 10 * 60_000);
  keepLaunchRecords(dashboard, [
    quietSession(sessionId, new Date(Date.now() - 120_000), takenIdentity),
  ]);
  await openTakenBacklog(page, launchJourney);
  const board = sessionFollowUpPage(page);
  const card = board.taken(takenStory);
  const source = `${takenIdentity} — ${takenStory}`;
  const entry = board.session(
    await board.showDoneHistory(card),
    "Ad hoc session",
  );

  await test.step("the session that still opens its terminal offers no Follow up", async () => {
    await expect(openTerminalControl(entry)).toBeVisible();
    await expect(board.followUp(entry, quietTitle)).toHaveCount(0);
  });

  await test.step("once its conversation is confirmed unavailable, Follow up replaces Open terminal", async () => {
    dashboard.claudeSessionBecomes(sessionId, "forgotten");
    await page.reload();
    await board.showDoneHistory(card);
    await expect(board.followUp(entry, quietTitle)).toBeVisible();
    await expect(openTerminalControl(entry)).toHaveCount(0);
  });

  await test.step("the Taken card's Follow up starts a new session listed on the same card", async () => {
    dashboard.claudeScenario("launched");
    await board.followUp(card, source).click();
    await expect(board.context).toHaveText(["Status: Taken"]);
    await board.submit("Check the cache");
    await expect(board.openedSessions(card)).toHaveCount(1, {
      timeout: launchWaitMs,
    });
    const started = stored(dashboard.home).find(
      (record) => record.session.sessionId !== sessionId,
    );
    expect(started?.request).toMatchObject({ storyIdentity: takenIdentity });
    expect(dashboard.claudeListing()).toContainEqual(
      expect.objectContaining({ sessionId: started?.session.sessionId }),
    );
    expect(dashboard.claudeLaunches()[0]?.instruction).toContain(
      "- Status: Taken",
    );
    await expect(sessionStateOf(entry)).toHaveText("Done");
  });
});
