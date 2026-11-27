import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { closeSidePanel } from "../../dashboard/test-support/sidePanelFrame.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  closeTerminal,
  terminalPanel,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  chooseProject,
  expectMembership,
  parts,
  sessionEntriesIn,
  standaloneSessionName,
} from "../../dashboard/test-support/dashboardPage.ts";
import { doughnutSharedTitle } from "../../dashboard/test-support/doughnutProject.ts";
import { composeSession } from "../../dashboard/test-support/agentTerminalBoundary.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../../dashboard/test-support/launchJourney.ts";
import {
  expectCurrentEntry,
  expectSessionsSidebar,
  expectSessionsSidebarSessionEntryShown,
  sessionsSidebarParts,
} from "../../dashboard/test-support/sessionsSidebarPage.ts";
import {
  attachesOf,
  expectRevealsSince,
  expectWhollyInView,
  keyboardInside,
  openNavigationJourney,
  removedStory,
  revealsAtClick,
  revealsOf,
} from "../../dashboard/test-support/sessionNavigationJourney.ts";
import { pygardonStory } from "../../dashboard/test-support/pygardonProject.ts";
import { expectCovering } from "../../dashboard/test-support/sidePanelWidthPage.ts";
import { scrollYOf } from "../../dashboard/test-support/boardPage.ts";

test.describe("opening a Sessions sidebar Session entry, in its other cases", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("a retained session without a published card opens no Board row, and a Session unavailable entry reveals its card", async ({
    page,
    dashboard,
    afterGitHubStops,
  }) => {
    const { card } = await openNavigationJourney(
      page,
      dashboard,
      columnsJourney,
      afterGitHubStops,
    );
    const { button, entry, row } = sessionsSidebarParts(page);
    const { taken, backlog } = parts(page);
    const panel = terminalPanel(page);
    await button.click();

    await test.step("a retained session without a card can open from the sidebar without a Board row", async () => {
      const sessionName = standaloneSessionName(
        "Execution",
        removedStory.title,
      );
      const local = taken.getByRole("article", { name: sessionName });
      await page.setViewportSize({ width: 1000, height: 900 });
      await expect(local).toHaveCount(0);
      await entry(removedStory.title).click();
      await expect(panel.getByRole("heading")).toHaveText(removedStory.title);
      await expect(local).toHaveCount(0);
      expect(await revealsOf(page)).toEqual([]);
      await expectCurrentEntry(page, removedStory.title);
      for (const title of [takenStory, readyStory, notRefinedStory]) {
        await expect(card(title)).toHaveCSS("outline-style", "none");
      }
      await closeSidePanel(panel, { using: "mouse" });
      await expect(panel).toHaveCount(0);
    });

    await test.step("the Session unavailable entry shows Doughnut's stories and reveals its card, opening no terminal and marking nothing", async () => {
      const attaches = dashboard.claudeAttaches().length;
      await expectSessionsSidebarSessionEntryShown(
        row(doughnutSharedTitle),
        "Session unavailable",
        "unsettled",
      );
      const revealed = await revealsAtClick(page, entry(doughnutSharedTitle));
      await expectMembership(page, {
        taken: [],
        backlog: [doughnutSharedTitle],
      });
      await expect(
        backlog.getByRole("article", { name: doughnutSharedTitle }),
      ).toBeInViewport();
      await expectRevealsSince(page, revealed, doughnutSharedTitle, "smooth");
      await expect(panel).toHaveCount(0);
      expect(dashboard.claudeAttaches()).toHaveLength(attaches);
      await expect(page.getByText("Shown in terminal")).toHaveCount(0);
      await expectCurrentEntry(page);
    });
  });

  test("a Done story's session opens from the sidebar and reveals its nested entry", async ({
    page,
    dashboard,
    afterGitHubStops,
  }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    const { show } = await openNavigationJourney(
      page,
      dashboard,
      columnsJourney,
      afterGitHubStops,
    );
    const routedTrunk = () =>
      remoteBranchHead(
        gitHubRepositoryUrl(defaultRepository),
        "refs/heads/main",
        {
          cwd: dashboard.home,
          env: { HOME: dashboard.home },
          maxBuffer: 4096,
        },
      );
    expect(await routedTrunk()).toBe(columnsJourney.queued);
    const { sessionId } = await composeSession(dashboard, "open-dough", {
      identity: notRefinedIdentity,
      title: notRefinedStory,
      workflow: "refinement",
    });
    await show(columnsJourney.completed);
    expect(await routedTrunk()).toBe(columnsJourney.completed);
    const { button, entry } = sessionsSidebarParts(page);
    const { recentlyDone, board } = parts(page);
    const panel = terminalPanel(page);
    const sessionName = standaloneSessionName("Refinement", notRefinedStory);
    const local = recentlyDone.getByRole("article", { name: sessionName });
    await expect(sessionEntriesIn(recentlyDone)).toHaveCount(1);
    await expect(
      board.locator("[data-story-card]").filter({
        has: page.getByRole("heading", {
          name: notRefinedStory,
          exact: true,
        }),
      }),
    ).toHaveCount(0);
    await expect(local).toBeVisible();
    await button.click();
    const revealed = (await revealsOf(page)).length;

    await entry(notRefinedStory).click();
    await expect(panel.getByRole("heading")).toHaveText(notRefinedStory);
    await expect.poll(() => attachesOf(dashboard, sessionId)).toHaveLength(1);
    await expect(local).toBeInViewport();
    await expectRevealsSince(page, revealed, sessionName, "smooth");
    await expect(local.getByText("Shown in terminal")).toBeVisible();
    await expect(local).toHaveCSS("outline-style", "solid");
    await expectCurrentEntry(page, notRefinedStory);
  });

  test("on a narrow window, under reduced motion, opening an entry closes the sidebar over the page and moves to the story at once", async ({
    page,
    dashboard,
    afterGitHubStops,
  }) => {
    const { sessions } = await openNavigationJourney(
      page,
      dashboard,
      columnsJourney,
      afterGitHubStops,
    );
    const { sidebar, button, entry } = sessionsSidebarParts(page);
    const panel = terminalPanel(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 700, height: 900 });
    await button.click();
    await expectSessionsSidebar(page, "open");

    await entry(pygardonStory.title).click();
    await expect(sidebar).toBeHidden();
    await expect(panel.getByRole("heading")).toHaveText(pygardonStory.title);
    await expect
      .poll(() => attachesOf(dashboard, sessions.pygardon))
      .toHaveLength(1);
    await expectCovering(panel);
    expect(await keyboardInside(page, "Terminal")).toBe(true);
    await expect.poll(async () => (await revealsOf(page)).length).not.toBe(0);
    await expectRevealsSince(page, 0, pygardonStory.title, "auto");
    await closeTerminal(panel);
    await expectSessionsSidebar(page, "closed");
    await expect(button).toBeFocused();
    await expectWhollyInView(page, pygardonStory.title);
    await page.setViewportSize({ width: 700, height: 1600 });
    await expectWhollyInView(page, pygardonStory.title);
  });
  test("a pick whose project's stories are left before they are read never scrolls the page to its card", async ({
    page,
    dashboard,
    afterGitHubStops,
  }) => {
    const { holdPygardonOpen } = await openNavigationJourney(
      page,
      dashboard,
      columnsJourney,
      afterGitHubStops,
    );
    const { sidebar, button, entry } = sessionsSidebarParts(page);
    const { backlog } = parts(page);
    const panel = terminalPanel(page);
    await button.click();

    const pygardonOpen = holdPygardonOpen();
    await entry(pygardonStory.title).click();
    await expect(panel.getByRole("heading")).toHaveText(pygardonStory.title);
    if (await sidebar.isVisible()) await button.click();
    await expectSessionsSidebar(page, "closed");
    await chooseProject(page, "Doughnut");
    await expectMembership(page, {
      taken: [],
      backlog: [doughnutSharedTitle],
    });
    await pygardonOpen.release();

    await chooseProject(page, "Pygardon");
    await expect(
      backlog.getByRole("article", { name: pygardonStory.title }),
    ).toBeVisible();
    await expect(panel.getByRole("heading")).toHaveText(pygardonStory.title);
    expect(await revealsOf(page)).toEqual([]);
    expect(await scrollYOf(page)).toBe(0);
  });
});
