// Sessions sidebar selection reveals the actual card or Taken entry; unavailable
// sessions open no terminal. Narrow selection closes the overlay, reduced motion
// reveals at once, and stale picks never scroll. Only synthetic Claude runs.

import { expect, test } from "./dashboardTest.ts";
import {
  expectMembership,
  parts,
  standaloneSessionName,
} from "./dashboardPage.ts";
import { doughnutSharedTitle } from "./doughnutProject.ts";
import { launched } from "./agentTerminalBoundary.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import {
  expectSessionsSidebarSessionEntryShown,
  sessionsSidebarParts,
} from "./sessionsSidebarPage.ts";
import {
  attachesOf,
  expectRevealsSince,
  expectWhollyInView,
  openNavigationJourney,
  pygardonStory,
  removedStory,
  revealsOf,
} from "./sessionNavigationJourney.ts";
import { closeSidePanel } from "./pageLayout.ts";
import { expectCovering } from "./sidePanelWidthPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });

test.describe("opening a Sessions sidebar Session entry, in its other cases", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("a story on no card reveals and marks its Taken entry, and a Session unavailable entry reveals its card and opens no terminal", async ({
    page,
    dashboard,
  }) => {
    const { card } = await openNavigationJourney(
      page,
      dashboard,
      columnsJourney,
    );
    const { sidebar, button, entry } = sessionsSidebarParts(page);
    const { taken, backlog } = parts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    await button.click();

    await test.step("the story on no card opens its session and reveals and marks its Taken entry", async () => {
      const sessionName = standaloneSessionName(
        "Execution",
        removedStory.title,
      );
      const local = taken.getByRole("article", { name: sessionName });
      await page.setViewportSize({ width: 1000, height: 900 });
      await expect(local).not.toBeInViewport();
      await entry(removedStory.title).click();
      await expect(panel.getByRole("heading")).toHaveText(removedStory.title);
      await expect(local).toBeInViewport();
      await expectRevealsSince(page, 0, sessionName, "smooth");
      await expect(local.getByText("Shown in terminal")).toBeVisible();
      await expect(local).toHaveCSS("outline-style", "solid");
      await expect(entry(removedStory.title)).toHaveAttribute(
        "aria-current",
        "true",
      );
      for (const title of [takenStory, readyStory, notRefinedStory]) {
        await expect(card(title)).toHaveCSS("outline-style", "none");
      }
      await panel.getByRole("button", { name: "Close" }).click();
      await expect(panel).toHaveCount(0);
    });

    await test.step("the Session unavailable entry shows Doughnut's stories and reveals its card, opening no terminal and marking nothing", async () => {
      const attaches = dashboard.claudeAttaches().length;
      const unavailable = sidebar
        .getByRole("listitem")
        .filter({ hasText: doughnutSharedTitle });
      await expectSessionsSidebarSessionEntryShown(
        unavailable,
        "Session unavailable",
        "unsettled",
      );
      const revealed = (await revealsOf(page)).length;
      await entry(doughnutSharedTitle).click();
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
      await expect(sidebar.locator("[aria-current]")).toHaveCount(0);
    });
  });

  test("a done story's session opens from the sidebar and reveals and marks its entry as a local Taken entry", async ({
    page,
    dashboard,
  }) => {
    // A short desktop window keeps this entry below the fold with compact sessions.
    await page.setViewportSize({ width: 1280, height: 600 });
    const { show } = await openNavigationJourney(
      page,
      dashboard,
      columnsJourney,
    );
    const doneStorySession = (
      await launched(dashboard, "open-dough", {
        identity: notRefinedIdentity,
        title: notRefinedStory,
        workflow: "refinement",
      })
    ).sessionId;
    await show(columnsJourney.completed);
    const { button, entry } = sessionsSidebarParts(page);
    const { recentlyDone, board } = parts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    const sessionName = standaloneSessionName("Refinement", notRefinedStory);
    const local = parts(page).taken.getByRole("article", { name: sessionName });
    await expect(recentlyDone.locator(".session-entry")).toHaveCount(0);
    await expect(
      board.locator("[data-story-card]").filter({
        has: page.getByRole("heading", {
          name: notRefinedStory,
          exact: true,
        }),
      }),
    ).toHaveCount(0);
    await expect(local).toBeVisible();
    await expect(local).not.toBeInViewport();
    await button.click();
    const revealed = (await revealsOf(page)).length;

    await entry(notRefinedStory).click();
    await expect(panel.getByRole("heading")).toHaveText(notRefinedStory);
    await expect
      .poll(() => attachesOf(dashboard, doneStorySession))
      .toHaveLength(1);
    await expect(local).toBeInViewport();
    await expectRevealsSince(page, revealed, sessionName, "smooth");
    await expect(local.getByText("Shown in terminal")).toBeVisible();
    await expect(local).toHaveCSS("outline-style", "solid");
    await expect(entry(notRefinedStory)).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  test("on a narrow window, under reduced motion, opening an entry closes the sidebar over the page and moves to the story at once", async ({
    page,
    dashboard,
  }) => {
    const { sessions } = await openNavigationJourney(
      page,
      dashboard,
      columnsJourney,
    );
    const { sidebar, button, entry } = sessionsSidebarParts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    // Narrow covering: Close restores the full Board before Board assertions.
    await page.setViewportSize({ width: 700, height: 900 });
    await button.click();
    await expect(sidebar).toBeVisible();

    await entry(pygardonStory.title).click();
    await expect(sidebar).toBeHidden();
    await expect(panel.getByRole("heading")).toHaveText(pygardonStory.title);
    await expect
      .poll(() => attachesOf(dashboard, sessions.pygardon))
      .toHaveLength(1);
    await expectCovering(panel);
    await expect(
      panel.evaluate((element) => element.contains(document.activeElement)),
    ).resolves.toBe(true);
    await expect.poll(async () => (await revealsOf(page)).length).not.toBe(0);
    await expectRevealsSince(page, 0, pygardonStory.title, "auto");
    // Covering hides the Board; Close, then the restored full Board shows the
    // card (wholly — it fits once the half-height stack is gone).
    await closeSidePanel(panel);
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
    await expectWhollyInView(page, pygardonStory.title);
    // With enough Board room for the same card, it still shows whole.
    await page.setViewportSize({ width: 700, height: 1600 });
    await expectWhollyInView(page, pygardonStory.title);
  });
  test("a pick whose project's stories are left before they are read never scrolls the page to its card", async ({
    page,
    dashboard,
  }) => {
    const { holdPygardonStories } = await openNavigationJourney(
      page,
      dashboard,
      columnsJourney,
    );
    const { sidebar, button, entry } = sessionsSidebarParts(page);
    const { project, backlog } = parts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    const showProject = (name: string) =>
      project.getByRole("radio", { name, exact: true }).check();
    await button.click();

    const release = holdPygardonStories();
    await entry(pygardonStory.title).click();
    await expect(panel.getByRole("heading")).toHaveText(pygardonStory.title);
    // Sidebar still open beside the panel can cover the page column; close it
    // so project radios stay reachable while the session stays open.
    if (await sidebar.isVisible()) await button.click();
    await expect(sidebar).toBeHidden();
    await showProject("Doughnut");
    await expectMembership(page, {
      taken: [],
      backlog: [doughnutSharedTitle],
    });
    release();

    await showProject("Pygardon");
    await expect(
      backlog.getByRole("article", { name: pygardonStory.title }),
    ).toBeVisible();
    await expect(panel.getByRole("heading")).toHaveText(pygardonStory.title);
    expect(await revealsOf(page)).toEqual([]);
    expect(
      await page
        .locator(".board-scroll")
        .evaluate((region) => region.scrollTop),
    ).toBe(0);
  });
});
