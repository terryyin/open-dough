import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  takenIdentity,
  takenStory,
} from "../../dashboard/test-support/launchJourney.ts";
import { openTakenBacklog } from "../../dashboard/test-support/launchStoryCardPage.ts";
import { stored } from "../../dashboard/test-support/support/codexLaunch.ts";
import { launchWaitMs } from "../../dashboard/test-support/support/launchWait.ts";
import { sessionFollowUpPage } from "../../dashboard/test-support/support/sessionFollowUpPage.ts";

test.use({ projectFolders: ["open-dough"] });

test("the Taken card starts a new session under its published story", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  await openTakenBacklog(page, launchJourney);
  const board = sessionFollowUpPage(page);
  const card = board.taken(takenStory);
  const source = `${takenIdentity} — ${takenStory}`;
  dashboard.claudeScenario("launched");

  await test.step("Follow up names the Taken story", async () => {
    await board.followUp(card, source).click();
    await expect(board.context).toHaveText(["Status: Taken"]);
  });

  await test.step("the new session is listed on the same card", async () => {
    await board.submit("Check the cache");
    await expect(board.openedSessions(card)).toHaveCount(1, {
      timeout: launchWaitMs,
    });
    const [record] = stored(dashboard.home);
    expect(record?.request).toMatchObject({ storyIdentity: takenIdentity });
    expect(dashboard.claudeListing()).toContainEqual(
      expect.objectContaining({ sessionId: record?.session.sessionId }),
    );
    expect(dashboard.claudeLaunches()[0]?.instruction).toContain(
      "- Status: Taken",
    );
  });
});
