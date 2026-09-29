// Opening a Sessions sidebar entry goes to its story and its session: the
// page shows the session's project's stories, from the agent roster too, as
// one history entry; the terminal opens the session as Open terminal does,
// with the keyboard in it; once that project's stories are read, the story's
// card scrolls into view, outlined and saying "Shown in terminal", and the
// entry is current. Another entry moves both marks, the entry already shown
// is not attached again, and closing the terminal clears the marks and
// returns the keyboard to the entry. Nothing it does changes a story or a
// session. The page's own dashboard server launches and attaches the
// synthetic `claude` (./fixtures/fake-claude); the real one is never reached.

import type { Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts, rosterParts } from "./dashboardPage.ts";
import {
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  takenStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { expectRoute } from "./agentRosterRecords.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import {
  attachesOf,
  openNavigationJourney,
  pygardonBacklogTitles,
  pygardonStory,
  expectRevealsSince,
  revealsOf,
} from "./sessionNavigationJourney.ts";

test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });

const openDoughStories = {
  taken: [],
  backlog: [takenStory, readyStory, notRefinedStory],
};

const historyLength = (page: Page) => page.evaluate(() => history.length);

const keyboardInside = (page: Page, name: string) =>
  page
    .getByRole("region", { name })
    .evaluate((element) => element.contains(document.activeElement));

test.describe("opening a Sessions sidebar entry", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("goes to its story and its session across projects, moves the marks, and gives the keyboard back to the entry once the terminal closes", async ({
    page,
    dashboard,
  }) => {
    const { card, sessions, holdPygardonStories } = await openNavigationJourney(
      page,
      dashboard,
      stagesJourney,
    );
    const { sidebar, button, entries, entry } = sidebarParts(page);
    const { roster } = rosterParts(page);
    const { project, backlog } = parts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    const shownMark = page.getByText("Shown in terminal", { exact: true });
    const pygardonCard = backlog.getByRole("article", {
      name: pygardonStory.title,
    });
    await expectMembership(page, openDoughStories);
    await page.goto("/?project=open-dough&view=roster");
    await expect(roster).toBeVisible();
    await button.click();
    await expect(entries).toHaveCount(4);

    await test.step("from Open Dough's roster, the Pygardon entry shows Pygardon's stories as one history entry, opens its session with the keyboard in it, and once those stories are read reveals and marks its card", async () => {
      const before = await historyLength(page);
      const release = holdPygardonStories();
      await entry(pygardonStory.title).click();
      await expect(
        project.getByRole("radio", { name: "Pygardon", exact: true }),
      ).toBeChecked();
      expectRoute(page, { project: "pygardon", view: null });
      expect(await historyLength(page)).toBe(before + 1);
      await expect(panel.getByRole("heading")).toHaveText(pygardonStory.title);
      await expect
        .poll(() => attachesOf(dashboard, sessions.pygardon).length)
        .toBe(1);
      await expect(panel.locator(".xterm-rows")).toContainText(
        `attached ${sessions.pygardon.slice(0, 8)}`,
      );
      expect(await keyboardInside(page, "Terminal")).toBe(true);
      await expect(entry(pygardonStory.title)).toHaveAttribute(
        "aria-current",
        "true",
      );
      // Nothing is brought into view while Pygardon's stories are unread.
      expect(await revealsOf(page)).toEqual([]);

      release();
      await expectMembership(page, {
        taken: [],
        backlog: pygardonBacklogTitles,
      });
      await expect(pygardonCard).toBeInViewport();
      // Brought into view smoothly, and kept there as the page settled.
      await expectRevealsSince(page, 0, pygardonStory.title, "smooth");
      await expect(pygardonCard).toHaveCSS("outline-style", "solid");
      await expect(pygardonCard).toHaveCSS("outline-color", "rgb(27, 95, 168)");
      await expect(pygardonCard.getByText("Shown in terminal")).toBeVisible();
      await expect(entries.and(page.locator(".in-terminal"))).toHaveCount(1);
      await expect(sidebar).toBeVisible();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      expect(await keyboardInside(page, "Terminal")).toBe(true);
    });

    await test.step("browser Back returns to Open Dough's roster, the terminal still showing the session", async () => {
      await page.goBack();
      await expect(roster).toBeVisible();
      expectRoute(page, { project: "open-dough", view: "roster" });
      await expect(panel.getByRole("heading")).toHaveText(pygardonStory.title);
      await expect(entry(pygardonStory.title)).toHaveAttribute(
        "aria-current",
        "true",
      );
    });

    await test.step("an Open Dough entry replaces the terminal's session and moves both marks there", async () => {
      await entry(readyStory).click();
      await expect(roster).toBeHidden();
      expect(new URL(page.url()).search).toBe("");
      await expectMembership(page, openDoughStories);
      await expect(panel.getByRole("heading")).toHaveText(readyStory);
      await expect
        .poll(() => attachesOf(dashboard, sessions.storyB).length)
        .toBe(1);
      await expect(card(readyStory)).toHaveCSS("outline-style", "solid");
      await expect(
        card(readyStory).getByText("Shown in terminal"),
      ).toBeVisible();
      await expect(entry(readyStory)).toHaveAttribute("aria-current", "true");
      await expect(entry(pygardonStory.title)).not.toHaveAttribute(
        "aria-current",
      );
      for (const other of [takenStory, notRefinedStory]) {
        await expect(card(other)).toHaveCSS("outline-style", "none");
      }
      expect(await keyboardInside(page, "Terminal")).toBe(true);
    });

    await test.step("the entry already shown brings its card into view again without attaching its session again or adding history", async () => {
      const before = await historyLength(page);
      const revealed = (await revealsOf(page)).length;
      await entry(readyStory).click();
      await expect
        .poll(async () => (await revealsOf(page)).length)
        .toBeGreaterThan(revealed);
      expect((await revealsOf(page)).at(-1)?.name).toBe(readyStory);
      expect(attachesOf(dashboard, sessions.storyB)).toHaveLength(1);
      expect(await historyLength(page)).toBe(before);
      await expect(panel.getByRole("heading")).toHaveText(readyStory);
    });

    await test.step("closing the terminal clears both marks and returns the keyboard to the entry", async () => {
      await panel.getByRole("button", { name: "Close" }).click();
      await expect(panel).toHaveCount(0);
      await expect(shownMark).toHaveCount(0);
      await expect(page.locator(".in-terminal")).toHaveCount(0);
      await expect(sidebar.locator("[aria-current]")).toHaveCount(0);
      await expect(entry(readyStory)).toBeFocused();
    });

    await test.step("with the keyboard on an entry, Command+B closes the sidebar and the keyboard lands on Sessions", async () => {
      await page.keyboard.press("Meta+b");
      await expect(sidebar).toBeHidden();
      await expect(button).toBeFocused();
    });

    // Going to sessions changed no story, stage, or position, and marked no
    // session done.
    await expectMembership(page, openDoughStories);
    await button.click();
    await expect(entries).toHaveCount(4);
    await expect(page.getByText(/^Named done-/)).toHaveCount(0);
  });
});
