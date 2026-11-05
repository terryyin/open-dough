// Cross-project Sessions sidebar: attention first, closed toggle working then
// attention counts, Done removes entries; wide sits left, narrow overlays.
// Real boundaries, fake Claude, paused time. Order alone:
// ./sessions-sidebar-order.spec.ts.
import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  storyCardSessionOf,
  expectMembership,
  sessionNamedBy,
} from "./dashboardPage.ts";
import { doughnutSharedTitle, sharedStoryIdentity } from "./doughnutProject.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { markDone as markSessionDone } from "./agentLaunchBoundary.ts";
import { launched } from "./agentTerminalBoundary.ts";
import { watchRecordReads } from "./sessionStatePace.ts";
import {
  expectEntries,
  expectSessionsSidebarSessionEntryShown,
  expectSessionsSidebarLayout,
  sessionsSidebarParts,
} from "./sessionsSidebarPage.ts";
import { expectClosedToggleCounts } from "./sessionsTogglePage.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import { briefDoneRenameWait, markDoneAnyway } from "./support/markDone.ts";
import { showColumn } from "./boardPage.ts";

test.use({
  projectFolders: ["open-dough", "doughnut", "pygardon"],
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
    test.setTimeout(120_000);
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("lists every project's open sessions with the ones needing attention first, and sits left of the page or over it", async ({
    page,
    dashboard,
  }) => {
    await pausePageClockAt(page, new Date());
    const { passOnePace } = await watchRecordReads(page);
    // Server time, which a launch record's time is.
    const since = Date.now() - 1_000;
    const { sessionId: doughnut } = await launched(dashboard, "doughnut", {
      identity: sharedStoryIdentity,
      title: doughnutSharedTitle,
    });
    const { sessionId: pygardon } = await launched(dashboard, "pygardon", {
      ...pygardonStory,
      workflow: "refinement",
    });
    const { settled, card, launch } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const {
      sidebar,
      button,
      entries,
      entry,
      badge,
      workingBadge,
      attentionSentence,
    } = sessionsSidebarParts(page);
    const queued = [takenStory, readyStory, notRefinedStory];
    await expectMembership(page, { taken: [], backlog: queued });
    await settled();
    await launch(readyStory, "Execution");
    await launch(notRefinedStory, "Refinement");
    const ready = await sessionNamedBy(
      storyCardSessionOf(card(readyStory), "Execution"),
    );

    await test.step("Sessions in the banner opens the sidebar, closed at first, on every project's sessions newest first", async () => {
      await expect(button).toHaveText("");
      // Four working across projects, none needing attention; no badge before
      // first read is elsewhere.
      await expectClosedToggleCounts(page, 4, 0);
      await expect(button.locator("img.product-mark")).toBeVisible();
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await expect(sidebar).toBeHidden();
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      await expect(sidebar).toBeVisible();
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

      await launch(takenStory, "Execution");
      await expect(entries).toHaveCount(5);
      // Closed: 3 working then 2 attention; open: attention only.
      await button.click();
      await expect(sidebar).toBeHidden();
      await expectClosedToggleCounts(page, 3, 2);

      // One working starts waiting for input → 2 working / 3 attention.
      const taken = await sessionNamedBy(
        storyCardSessionOf(card(takenStory), "Execution"),
      );
      dashboard.claudeSessionBecomes(taken, "blocked");
      await passOnePace();
      await expectClosedToggleCounts(page, 2, 3);

      // Open: attention only; closing restores both.
      await button.click();
      await expect(sidebar).toBeVisible();
      await expect(workingBadge).toHaveCount(0);
      await expect(badge).toHaveText("3");
      await button.click();
      await expect(sidebar).toBeHidden();
      await expectClosedToggleCounts(page, 2, 3);
      await button.click();
      await expect(sidebar).toBeVisible();
      await expectMembership(page, { taken: [], backlog: queued });
    });

    await test.step("a state change moves the entry into the attention group", async () => {
      dashboard.claudeSessionBecomes(ready, "done-live");
      await passOnePace();
      await expect(badge).toHaveText("4");
      // Attention by earliest launch: doughnut, pygardon, ready, taken.
      await expectSessionsSidebarSessionEntryShown(
        entries.nth(2),
        "Ready for review",
        "ready",
      );
      await expect(entries.nth(2).getByRole("heading")).toHaveText(readyStory);
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
      await expect(sidebar).toBeHidden();
      await expectClosedToggleCounts(page, 0, 1);
      await button.click();
      await expect(sidebar).toBeVisible();
    });

    await test.step("wide, the sidebar is a column left of the page and the terminal right of it; narrow, it lies over the page", async () => {
      const panel = page.getByRole("region", { name: "Terminal" });
      await showColumn(page, "Backlog");
      await entry(doughnutSharedTitle).click();
      await expect(panel).toBeVisible();
      await expectSessionsSidebarLayout(page, panel);
    });
  });
});
