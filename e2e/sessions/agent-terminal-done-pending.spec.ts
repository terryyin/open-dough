// Mark as done from the page's terminal (./agent-terminal-done.spec.ts) whose
// real answer is held past the page's wait bound leaves a recoverable
// unresolved state without claiming the mark failed; the late answer does not
// change that, and recovery reuses the settled mark without a second native
// stop. Held and failed answers' panel controls are
// ../../dashboard/frontend-tests/sessions/agent-terminal-done-pending.spec.ts.

import { markDoneUnresolved } from "../../dashboard/src/pageSessions.ts";
import { markDoneWaitMs } from "../../dashboard/src/sessionRecordRequests.ts";
import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import { storyCardSessions } from "../../dashboard/tests/dashboardPage.ts";
import {
  openTerminalControl,
  terminalPanel,
  terminalScreenParts,
} from "../../dashboard/tests/terminalScreenPage.ts";
import {
  publishStoryColumnsJourney,
  readyStory,
  type StoryColumnsJourney,
} from "../../dashboard/tests/launchJourney.ts";
import { openStoryColumnsJourney } from "../../dashboard/tests/storyColumnsPage.ts";
import { holdDoneRequestRoute } from "../../dashboard/tests/support/holdDoneRequest.ts";
import {
  headerMarkAsDone,
  idleBetweenSteps,
  sendDoneMarkAnyway,
} from "../../dashboard/tests/support/markDone.ts";

test.use({ projectFolders: ["open-dough"] });

test.describe("pending Mark as done from the terminal", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("a held Done past the wait bound leaves a recoverable unresolved state without claiming the mark failed", async ({
    page,
    dashboard,
  }) => {
    await page.clock.install();
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const panel = terminalPanel(page);
    const listed = storyCardSessions(card(readyStory));
    await settled();
    await launch(readyStory, "Execution");
    await openTerminalControl(listed).click();
    await expect(terminalScreenParts(panel).rows).toContainText("attached");
    const [session] = dashboard.claudeListing();
    idleBetweenSteps(dashboard, String(session?.["sessionId"]));
    const { release, held } = await holdDoneRequestRoute(page);
    await sendDoneMarkAnyway(panel);
    await expect(panel.getByRole("status")).toHaveText("Marking as done…");
    await held;

    await page.clock.runFor(markDoneWaitMs);

    const unresolved = panel.getByRole("status").getByText(markDoneUnresolved);
    await expect(unresolved).toBeVisible();
    await expect(
      panel
        .getByRole("status")
        .getByText("The session could not be marked done."),
    ).toHaveCount(0);
    await expect(headerMarkAsDone(panel)).toBeEnabled();
    await expect(panel.getByRole("button", { name: "Maximize" })).toBeEnabled();
    await expect(
      panel.getByRole("button", { name: "Close", exact: true }),
    ).toBeEnabled();
    await expect(listed).toHaveCount(1);
    expect(dashboard.claudeStopCalls()).toEqual([]);

    // A late answer after the bound must not look like a refused persisted
    // intent; recovery reuses the settled mark without a second native stop.
    release();
    await expect(unresolved).toBeVisible();
    await expect(
      panel
        .getByRole("status")
        .getByText("The session could not be marked done."),
    ).toHaveCount(0);
    await sendDoneMarkAnyway(panel);
    await expect(panel).toHaveCount(0);
    await expect(listed).toHaveCount(0);
    expect(dashboard.claudeStopCalls()).toHaveLength(1);
  });
});
