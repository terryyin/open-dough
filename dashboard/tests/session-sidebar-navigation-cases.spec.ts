// Opening a Sessions sidebar entry whose story is on no card reveals and
// marks its Recently done entry instead, inside its done story's card when
// the story is done; a Session unavailable entry
// reveals its card and opens no terminal; on a narrow window, opening an
// entry also closes the sidebar lying over the page; and under reduced
// motion the page moves to the story at once; closing the terminal then
// returns the keyboard to Sessions; and a pick left behind for another
// project's stories never scrolls the page later. The page's own dashboard
// server launches and attaches the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

import { expect, test } from "./dashboardTest.ts";
import {
  expectMembership,
  parts,
  recentlyDoneSessionName,
} from "./dashboardPage.ts";
import { doughnutSharedTitle } from "./doughnutProject.ts";
import { launched } from "./agentTerminalBoundary.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  takenStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import {
  expectSidebarSessionShown,
  sidebarParts,
} from "./sessionSidebarPage.ts";
import {
  attachesOf,
  expectRevealsSince,
  expectWhollyInView,
  openNavigationJourney,
  pygardonStory,
  removedStory,
  revealsOf,
} from "./sessionNavigationJourney.ts";

test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });

test.describe("opening a Sessions sidebar entry, in its other cases", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("a story on no card reveals and marks its Recently done entry, and a Session unavailable entry reveals its card and opens no terminal", async ({
    page,
    dashboard,
  }) => {
    const { card } = await openNavigationJourney(
      page,
      dashboard,
      stagesJourney,
    );
    const { sidebar, button, entry } = sidebarParts(page);
    const { recentlyDone, backlog } = parts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    await button.click();

    await test.step("the story on no card opens its session and reveals and marks its Recently done entry", async () => {
      const recentName = recentlyDoneSessionName(
        "Execution",
        removedStory.title,
      );
      const recent = recentlyDone.getByRole("article", { name: recentName });
      await expect(recent).not.toBeInViewport();
      await entry(removedStory.title).click();
      await expect(panel.getByRole("heading")).toHaveText(removedStory.title);
      // The page beside the sidebar and terminal shows one column, which
      // moves to Recently done.
      await expect(recent).toBeInViewport();
      await expectRevealsSince(page, 0, recentName, "smooth");
      await expect(recent.getByText("Shown in terminal")).toBeVisible();
      await expect(recent).toHaveCSS("outline-style", "solid");
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
      await expectSidebarSessionShown(
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

  test("a done story's session opens from the sidebar and reveals and marks its entry inside the done story's card", async ({
    page,
    dashboard,
  }) => {
    const { show } = await openNavigationJourney(
      page,
      dashboard,
      stagesJourney,
    );
    const doneStorySession = (
      await launched(dashboard, "open-dough", {
        identity: notRefinedIdentity,
        title: notRefinedStory,
        workflow: "refinement",
      })
    ).sessionId;
    // Story C is done: its card is gone from the stages and Recently done
    // holds its session inside its done card.
    await show(stagesJourney.completed);
    const { button, entry } = sidebarParts(page);
    const { recentlyDone, stages } = parts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    const recentName = recentlyDoneSessionName("Refinement", notRefinedStory);
    const inDoneCard = recentlyDone
      .getByRole("article", { name: notRefinedStory, exact: true })
      .getByRole("article", { name: recentName });
    await expect(
      stages.getByRole("article", { name: notRefinedStory, exact: true }),
    ).toHaveCount(0);
    await expect(inDoneCard).toBeVisible();
    await expect(inDoneCard).not.toBeInViewport();
    await button.click();
    const revealed = (await revealsOf(page)).length;

    await entry(notRefinedStory).click();

    await expect(panel.getByRole("heading")).toHaveText(notRefinedStory);
    await expect
      .poll(() => attachesOf(dashboard, doneStorySession))
      .toHaveLength(1);
    await expect(inDoneCard).toBeInViewport();
    await expectRevealsSince(page, revealed, recentName, "smooth");
    await expect(inDoneCard.getByText("Shown in terminal")).toBeVisible();
    await expect(inDoneCard).toHaveCSS("outline-style", "solid");
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
      stagesJourney,
    );
    const { sidebar, button, entry } = sidebarParts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    // Tall enough that the centered card, with the room it keeps above for the
    // stage's pinned heading, fits below the banner in any font's metrics.
    await page.setViewportSize({ width: 700, height: 900 });
    await button.click();
    await expect(sidebar).toBeVisible();

    await entry(pygardonStory.title).click();
    await expect(sidebar).toBeHidden();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(panel.getByRole("heading")).toHaveText(pygardonStory.title);
    await expect
      .poll(() => attachesOf(dashboard, sessions.pygardon))
      .toHaveLength(1);
    const pygardonCard = parts(page).backlog.getByRole("article", {
      name: pygardonStory.title,
    });
    await expect(pygardonCard.getByText("Shown in terminal")).toBeVisible();
    await expect.poll(async () => (await revealsOf(page)).length).not.toBe(0);
    // At once: the card is in view once the page settles, and every reveal,
    // the first and any keeping it in view as cards changed size, scrolled
    // without animation, so no scrolling is still to come.
    await expectWhollyInView(page, pygardonStory.title);
    await expectRevealsSince(page, 0, pygardonStory.title, "auto");
    await expect(
      panel.evaluate((element) => element.contains(document.activeElement)),
    ).resolves.toBe(true);

    // The entry is out of sight with the sidebar closed, so closing the
    // terminal returns the keyboard to Sessions.
    await panel.getByRole("button", { name: "Close" }).click();
    await expect(panel).toHaveCount(0);
    await expect(button).toBeFocused();
  });
  test("a pick whose project's stories are left before they are read never scrolls the page to its card", async ({
    page,
    dashboard,
  }) => {
    const { holdPygardonStories } = await openNavigationJourney(
      page,
      dashboard,
      stagesJourney,
    );
    const { button, entry } = sidebarParts(page);
    const { project, backlog } = parts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    const showProject = (name: string) =>
      project.getByRole("radio", { name, exact: true }).check();
    await button.click();

    const release = holdPygardonStories();
    await entry(pygardonStory.title).click();
    await expect(panel.getByRole("heading")).toHaveText(pygardonStory.title);
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
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});
