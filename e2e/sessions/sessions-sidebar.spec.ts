// Cross-project ordering, counts, Done and layout in the Sessions sidebar.
import {
  expect,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import { terminalPanel } from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  storyCardSessionOf,
  expectMembership,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  doughnutSharedTitle,
  sharedStoryIdentity,
} from "../../dashboard/test-support/doughnutProject.ts";
import {
  notRefinedStory,
  notRefinedIdentity,
  publishStoryColumnsJourney,
  readyIdentity,
  readyStory,
  takenIdentity,
  takenStory,
  type StoryColumnsJourney,
} from "../../dashboard/test-support/launchJourney.ts";
import { markDone as markSessionDone } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import { composeSession } from "../../dashboard/test-support/agentTerminalBoundary.ts";
import { watchRecordReads } from "../../dashboard/test-support/sessionStatePace.ts";
import {
  expectEntries,
  expectSessionsSidebar,
  expectSessionsSidebarSessionEntryShown,
  sessionsSidebarParts,
} from "../../dashboard/test-support/sessionsSidebarPage.ts";
import { expectSessionsSidebarLayout } from "../../dashboard/test-support/sessionsSidebarLayout.ts";
import { expectClosedToggleCounts } from "../../dashboard/test-support/sessionsTogglePage.ts";
import { openStoryColumnsJourney } from "../../dashboard/test-support/storyColumnsPage.ts";
import {
  briefDoneRenameWait,
  markDoneAnyway,
} from "../../dashboard/test-support/support/markDone.ts";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";

test.use({
  extraEnv: briefDoneRenameWait,
});

const pygardonStory = {
  identity: "SEED-031#telegram-qr-diagnosis",
  title: "Correct the Telegram IBKR QR login's diagnosis and representations",
};
const pygardonTitle = pygardonStory.title;

test.describe("the Sessions sidebar", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("lists every project's open sessions with the ones needing attention first, and sits left of the page or over it", async ({
    page,
    dashboard,
    afterGitHubStops,
  }) => {
    await pausePageClockAt(page, new Date());
    const { passOnePace } = await watchRecordReads(page);
    const since = Date.now() - 1_000;
    const { sessionId: doughnut } = await composeSession(
      dashboard,
      "doughnut",
      {
        identity: sharedStoryIdentity,
        title: doughnutSharedTitle,
        startedAt: since + 1,
      },
    );
    const { sessionId: pygardon } = await composeSession(
      dashboard,
      "pygardon",
      {
        ...pygardonStory,
        workflow: "refinement",
        startedAt: since + 2,
      },
    );
    const ready = await composeSession(dashboard, "open-dough", {
      identity: readyIdentity,
      title: readyStory,
      startedAt: since + 3,
    });
    await composeSession(dashboard, "open-dough", {
      identity: notRefinedIdentity,
      title: notRefinedStory,
      workflow: "refinement",
      startedAt: since + 4,
    });
    const { settled, card } = await openStoryColumnsJourney(
      page,
      columnsJourney,
      { home: dashboard.home, afterGitHubStops },
    );
    const {
      sidebar,
      button,
      entries,
      titles,
      entry,
      badge,
      workingBadge,
      attentionSentence,
    } = sessionsSidebarParts(page);
    const queued = [takenStory, readyStory, notRefinedStory];
    await expectMembership(page, { taken: [], backlog: queued });
    await settled();

    await test.step("Sessions in the banner opens the sidebar, closed at first, on every project's sessions newest first", async () => {
      await expect(button).toHaveText("");
      await expectClosedToggleCounts(page, 4, 0);
      await expect(button.locator("img.product-mark")).toBeVisible();
      await expectSessionsSidebar(page, "closed");
      await button.click();
      await expectSessionsSidebar(page, "open");
      await expect(sidebar).toHaveAccessibleName("Sessions sidebar");
      await expect(button).toHaveAttribute(
        "aria-controls",
        (await sidebar.evaluate((element) => element.id)) || "?",
      );
      await expect(sidebar.getByRole("heading", { level: 2 })).toHaveText(
        "Sessions",
      );
      await expectEntries(
        entries,
        [
          [notRefinedStory, "Open Dough", "Refinement", "Working", "working"],
          [readyStory, "Open Dough", "Execution", "Working", "working"],
          [pygardonTitle, "Pygardon", "Refinement", "Working", "working"],
          [doughnutSharedTitle, "Doughnut", "Execution", "Working", "working"],
        ],
        since,
      );
      await expect(workingBadge).toHaveCount(0);
      await expect(badge).toHaveCount(0);
    });

    await test.step("sessions that need the developer have the heavier edge and are counted across projects, on the button too once closed", async () => {
      dashboard.claudeSessionBecomes(doughnut, "blocked", "input needed");
      dashboard.claudeSessionBecomes(pygardon, "done-live");
      await passOnePace();
      await expect(badge).toHaveText("2");
      await expect(badge).toHaveAccessibleName("2 sessions need attention");
      await expect(workingBadge).toHaveCount(0);
      await expect(attentionSentence).toHaveCount(0);
      await expectEntries(
        entries,
        [
          [
            doughnutSharedTitle,
            "Doughnut",
            "Execution",
            "Needs input: input needed",
            "needs-input",
          ],
          [
            pygardonTitle,
            "Pygardon",
            "Refinement",
            "Ready for review",
            "ready",
          ],
          [notRefinedStory, "Open Dough", "Refinement", "Working", "working"],
          [readyStory, "Open Dough", "Execution", "Working", "working"],
        ],
        since,
      );

      const taken = await composeSession(dashboard, "open-dough", {
        identity: takenIdentity,
        title: takenStory,
      });
      await passOnePace();
      await expect(entries).toHaveCount(5);
      await button.click();
      await expectSessionsSidebar(page, "closed");
      await expectClosedToggleCounts(page, 3, 2);

      dashboard.claudeSessionBecomes(taken.sessionId, "blocked");
      await passOnePace();
      await expectClosedToggleCounts(page, 2, 3);

      await button.click();
      await expectSessionsSidebar(page, "open");
      await expect(workingBadge).toHaveCount(0);
      await expect(badge).toHaveText("3");
      await button.click();
      await expectSessionsSidebar(page, "closed");
      await expectClosedToggleCounts(page, 2, 3);
      await button.click();
      await expectSessionsSidebar(page, "open");
      await expectMembership(page, { taken: [], backlog: queued });
    });

    await test.step("a state change moves the entry into the attention group", async () => {
      dashboard.claudeSessionBecomes(ready.sessionId, "done-live");
      await passOnePace();
      await expect(badge).toHaveText("4");
      // Attention by earliest launch: doughnut, pygardon, ready, taken.
      await expectSessionsSidebarSessionEntryShown(
        entries.nth(2),
        "Ready for review",
        "ready",
      );
      await expect(titles.nth(2)).toHaveText(readyStory);
    });

    await test.step("sessions marked done leave the sidebar; closed with only attention shows that count alone", async () => {
      await markDoneAnyway(storyCardSessionOf(card(readyStory), "Execution"));
      await markDoneAnyway(storyCardSessionOf(card(takenStory), "Execution"));
      await markDoneAnyway(
        storyCardSessionOf(card(notRefinedStory), "Refinement"),
      );
      await markSessionDone(dashboard, {
        source: "pygardon",
        session: pygardon,
      });
      await passOnePace();
      await expect(entries).toHaveCount(1);
      await expect(badge).toHaveText("1");
      await expect(
        entries.getByRole("heading", { name: readyStory }),
      ).toHaveCount(0);
      await button.click();
      await expectSessionsSidebar(page, "closed");
      await expectClosedToggleCounts(page, 0, 1);
      await button.click();
      await expectSessionsSidebar(page, "open");
    });

    await test.step("wide, the sidebar is a column left of the page and the terminal right of it; narrow, it lies over the page", async () => {
      const panel = terminalPanel(page);
      await showColumn(page, "Backlog");
      await entry(doughnutSharedTitle).click();
      await expect(panel).toBeVisible();
      await expectSessionsSidebarLayout(page, panel);
    });
  });
});
