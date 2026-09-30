// The Sessions sidebar lists every session this dashboard launched and has
// not marked done, from every catalog project whichever is selected, those
// that need the developer first, earliest launch first, then the others
// newest launch first, each a line with its story's title and the state's edge
// (its project, workflow, launch time, and state words are its tooltip), with a
// badge on the banner's Sessions icon button counting those that need the
// developer, open or closed. A state change moves an entry between the two
// groups, and a session marked done leaves. It sits left of the page, beside
// the terminal on the right, or over the page on a narrow window; the page
// column beside them lays its stages out as narrow as it is. Doughnut's and
// Pygardon's sessions are launched through the boundary, Open Dough's from
// their cards; the page's own dashboard server launches the synthetic
// `claude` (./fixtures/fake-claude). The page clock stands still unless the
// journey lets it pass.

import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  cardSessionOf,
  expectMembership,
  sessionNamedBy,
} from "./dashboardPage.ts";
import { doughnutSharedTitle, sharedStoryIdentity } from "./doughnutProject.ts";
import {
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  takenStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { launched } from "./agentTerminalBoundary.ts";
import { box, expectSideBySideInOrder } from "./pageLayout.ts";
import { watchRecordReads } from "./sessionStatePace.ts";
import {
  expectEntries,
  expectSidebarSessionShown,
  expectStagesStacked,
  sidebarParts,
} from "./sessionSidebarPage.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });

const pygardonStory = {
  identity: "SEED-031#telegram-qr-diagnosis",
  title: "Correct the Telegram IBKR QR login's diagnosis and representations",
};
const pygardonTitle = pygardonStory.title;

test.describe("the Sessions sidebar", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("leads with the sessions that need the developer, earliest launch first, then the others newest first", async ({
    page,
    dashboard,
  }) => {
    await pausePageClockAt(page, new Date());
    const { passOnePace } = watchRecordReads(page);
    // Launched in this order, so this is their launch order, earliest first.
    const story = (letter: string) => ({
      identity: `SEED-900#story-${letter}`,
      title: `Story ${letter}`,
    });
    const working08 = story("A");
    const blocked09 = story("B");
    const failed10 = story("C");
    const working11 = story("D");
    const working12 = story("E");
    let toBlock = "";
    for (const work of [working08, blocked09, failed10, working11, working12]) {
      const { sessionId } = await launched(dashboard, "doughnut", work);
      if (work === blocked09)
        dashboard.claudeSessionBecomes(sessionId, "blocked");
      if (work === failed10)
        dashboard.claudeSessionBecomes(sessionId, "failed");
      if (work === working11) toBlock = sessionId;
    }
    const { settled } = await openStoryStagesJourney(page, stagesJourney);
    const { button, entries, badge } = sidebarParts(page);
    await settled();
    await button.click();
    const titles = () => entries.getByRole("heading", { level: 3 });

    await test.step("a needs-input and a failed session lead, earliest first, then the working ones newest first", async () => {
      await expect(titles()).toHaveText([
        blocked09.title,
        failed10.title,
        working12.title,
        working11.title,
        working08.title,
      ]);
      await expect(badge).toHaveText("2");
    });

    await test.step("a working session that needs input joins the attention group at its launch place, and the count rises", async () => {
      dashboard.claudeSessionBecomes(toBlock, "blocked");
      await passOnePace();
      await expect(badge).toHaveText("3");
      await expect(titles()).toHaveText([
        blocked09.title,
        failed10.title,
        working11.title,
        working12.title,
        working08.title,
      ]);
      await expectSidebarSessionShown(
        entries.nth(2),
        "Needs input",
        "needs-input",
      );
    });
  });

  test("lists every project's open sessions with the ones needing attention first, and sits left of the page or over it", async ({
    page,
    dashboard,
  }) => {
    await pausePageClockAt(page, new Date());
    const { passOnePace } = watchRecordReads(page);
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
    const { settled, card, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { sidebar, button, entries, badge, attentionSentence } =
      sidebarParts(page);
    const queued = [takenStory, readyStory, notRefinedStory];
    await expectMembership(page, { taken: [], backlog: queued });
    await settled();
    await launch(readyStory, "Execution");
    await launch(notRefinedStory, "Refinement");
    const ready = await sessionNamedBy(
      cardSessionOf(card(readyStory), "Execution"),
    );

    await test.step("Sessions in the banner opens the sidebar, closed at first, on every project's sessions newest first", async () => {
      await expect(button).toHaveText("");
      await expect(badge).toHaveCount(0);
      await expect(button.locator("svg")).toBeVisible();
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await expect(sidebar).toBeHidden();
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      await expect(sidebar).toBeVisible();
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
      await expect(badge).toHaveCount(0);
    });

    await test.step("sessions that need the developer have the heavier edge and are counted across projects, on the button too once closed", async () => {
      dashboard.claudeSessionBecomes(doughnut, "blocked", "input needed");
      dashboard.claudeSessionBecomes(pygardon, "done-live");
      await passOnePace();
      await expect(badge).toHaveText("2");
      await expect(badge).toHaveAccessibleName("2 sessions need attention");
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

      await button.click();
      await expect(sidebar).toBeHidden();
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await expect(badge).toHaveText("2");
      await button.click();
      await expect(sidebar).toBeVisible();
      await expectMembership(page, { taken: [], backlog: queued });
    });

    await test.step("a state change moves the entry into the attention group, and a new launch leads the others", async () => {
      dashboard.claudeSessionBecomes(ready, "done-live");
      await passOnePace();
      await expect(badge).toHaveText("3");
      await expectSidebarSessionShown(
        entries.nth(2),
        "Ready for review",
        "ready",
      );
      await expect(entries.nth(2).getByRole("heading")).toHaveText(readyStory);

      await launch(takenStory, "Execution");
      await expect(entries).toHaveCount(5);
      await expect(entries.nth(3).getByRole("heading")).toHaveText(takenStory);
      await expectSidebarSessionShown(entries.nth(3), "Working", "working");
    });

    await test.step("a session marked done leaves the sidebar, and its count", async () => {
      await cardSessionOf(card(readyStory), "Execution")
        .getByRole("button", { name: "Mark as done" })
        .click();
      await expect(entries).toHaveCount(4);
      await expect(badge).toHaveText("2");
      await expect(
        entries.getByRole("heading", { name: readyStory }),
      ).toHaveCount(0);
    });

    await test.step("wide, the sidebar is a column left of the page and the terminal right of it; narrow, it lies over the page", async () => {
      const panel = page.getByRole("region", { name: "Terminal" });
      await cardSessionOf(card(notRefinedStory), "Refinement")
        .getByRole("button", { name: "Open terminal" })
        .click();
      await expect(panel).toBeVisible();
      const main = page.getByRole("main");
      await expectSideBySideInOrder([sidebar, main, panel]);
      const view = page.viewportSize() ?? { width: 0, height: 0 };
      const column = await box(sidebar);
      expect(column.x).toBe(0);
      expect(column.y).toBe(0);
      expect(column.height).toBe(view.height);
      await expect(sidebar).toHaveCSS("overflow-y", "auto");
      // The page column, sharing the window with both, lays out as narrow,
      // as it does beside the terminal alone.
      await expectStagesStacked(page);
      await button.click();
      await expect(sidebar).toBeHidden();
      await expectStagesStacked(page);
      await button.click();
      await expect(sidebar).toBeVisible();

      await page.setViewportSize({ width: 700, height: view.height });
      const overlay = await box(sidebar);
      const beside = await box(main);
      expect(overlay.x).toBe(0);
      expect(beside.x).toBeLessThan(overlay.x + overlay.width);
      const center = {
        x: overlay.x + overlay.width / 2,
        y: overlay.y + overlay.height / 2,
      };
      expect(
        await page.evaluate(
          ({ x, y }) =>
            document.elementFromPoint(x, y)?.closest("aside")?.id ?? "",
          center,
        ),
      ).toBe(await sidebar.evaluate((element) => element.id));
    });
  });
});
