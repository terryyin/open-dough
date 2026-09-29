// Opening a Sessions sidebar entry whose story is on no card reveals and
// marks its Recent sessions entry instead; a Session unavailable entry
// reveals its card and opens no terminal; on a narrow window, opening an
// entry also closes the sidebar lying over the page; and under reduced
// motion the page moves to the story at once; closing the terminal then
// returns the keyboard to Sessions. The page's own dashboard
// server launches and attaches the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts, recentSessionName } from "./dashboardPage.ts";
import { doughnutSharedTitle } from "./doughnutProject.ts";
import {
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  takenStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { expectSessionShown } from "./sessionStatePace.ts";
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

  test("a story on no card reveals and marks its Recent sessions entry, and a Session unavailable entry reveals its card and opens no terminal", async ({
    page,
    dashboard,
  }) => {
    const { card } = await openNavigationJourney(
      page,
      dashboard,
      stagesJourney,
    );
    const { sidebar, button, entry } = sidebarParts(page);
    const { recentSessions, backlog } = parts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    await button.click();

    await test.step("the story on no card opens its session and reveals and marks its Recent sessions entry", async () => {
      const recentName = recentSessionName("Execution", removedStory.title);
      const recent = recentSessions.getByRole("article", { name: recentName });
      await expect(recent).not.toBeInViewport();
      await entry(removedStory.title).click();
      await expect(panel.getByRole("heading")).toHaveText(removedStory.title);
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
      await expectSessionShown(unavailable, "Session unavailable", false);
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
    const view = page.viewportSize() ?? { width: 0, height: 0 };
    await page.setViewportSize({ width: 700, height: view.height });
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
    await expectRevealsSince(page, 0, pygardonStory.title, "auto");
    // At once: in view as soon as it was brought there, with no scrolling
    // still to come.
    await expectWhollyInView(page, pygardonStory.title);
    await expect(
      panel.evaluate((element) => element.contains(document.activeElement)),
    ).resolves.toBe(true);

    // The entry is out of sight with the sidebar closed, so closing the
    // terminal returns the keyboard to Sessions.
    await panel.getByRole("button", { name: "Close" }).click();
    await expect(panel).toHaveCount(0);
    await expect(button).toBeFocused();
  });
});
