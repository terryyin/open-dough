import { closeSidePanel } from "../sidePanelFrame.ts";
// Opening a Sessions sidebar Session entry goes to its story and its session: the
// page shows the session's project's stories, from the agent roster too, as
// one history entry; the terminal opens the session as Open terminal does,
// with the keyboard in it; once that project's stories are read, the story's
// card scrolls into view, highlighted as the selected story, its session entry
// saying "Shown in terminal", and the sidebar entry is current. Another entry
// moves the selection and both marks, the entry already shown is not attached
// again, and closing the terminal clears the marks, keeps the story selected
// (ADR 0008), and returns the keyboard to the entry. Nothing it does changes a story or a
// session. The page's own dashboard server launches and attaches the
// synthetic `claude` (./fixtures/fake-claude); the real one is never reached.

import { expect, test } from "../dashboardTest.ts";
import { terminalPanel, terminalScreenParts } from "../terminalScreenPage.ts";
import {
  expectProjectChoice,
  expectMembership,
  parts,
  rosterParts,
} from "../dashboardPage.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../launchJourney.ts";
import { expectRoute } from "../agentRosterRecords.ts";
import {
  expectCurrentEntry,
  expectSessionsSidebar,
  sessionsSidebarParts,
} from "../sessionsSidebarPage.ts";
import { expectSelected } from "../storyCardSelection.ts";
import {
  attachesOf,
  expectRevealsSince,
  historyLength,
  keyboardInside,
  openDoughStories,
  openNavigationJourney,
  revealsOf,
} from "../sessionNavigationJourney.ts";
import { pygardonBacklogTitles, pygardonStory } from "../pygardonProject.ts";

test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });

test.describe("opening a Sessions sidebar Session entry", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("goes to its story and its session across projects, moves the marks, and gives the keyboard back to the entry once the terminal closes", async ({
    page,
    dashboard,
  }) => {
    const { card, sessions, holdPygardonStories } = await openNavigationJourney(
      page,
      dashboard,
      columnsJourney,
    );
    const { button, entries, entry } = sessionsSidebarParts(page);
    const { roster } = rosterParts(page);
    const { backlog } = parts(page);
    const panel = terminalPanel(page);
    const shownMark = page.getByText("Shown in terminal", { exact: true });
    const pygardonStoryCard = backlog.getByRole("article", {
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
      await expectProjectChoice(page, "Pygardon");
      expectRoute(page, { project: "pygardon", view: null });
      expect(await historyLength(page)).toBe(before + 1);
      await expect(panel.getByRole("heading")).toHaveText(pygardonStory.title);
      await expect
        .poll(() => attachesOf(dashboard, sessions.pygardon).length)
        .toBe(1);
      await expect(terminalScreenParts(panel).rows).toContainText(
        `attached ${sessions.pygardon.slice(0, 8)}`,
      );
      expect(await keyboardInside(page, "Terminal")).toBe(true);
      await expectCurrentEntry(page, pygardonStory.title);
      // Nothing is brought into view while Pygardon's stories are unread.
      expect(await revealsOf(page)).toEqual([]);

      release();
      await expectMembership(page, {
        taken: [],
        backlog: pygardonBacklogTitles,
      });
      await expect(pygardonStoryCard).toBeInViewport();
      // Brought into view smoothly, and kept there as the page settled.
      await expectRevealsSince(page, 0, pygardonStory.title, "smooth");
      await expectSelected(pygardonStoryCard, true);
      await expect(
        pygardonStoryCard.getByText("Shown in terminal"),
      ).toBeVisible();
      await expect(entries.and(page.locator(".in-side-panel"))).toHaveCount(1);
      await expectSessionsSidebar(page, "open");
      expect(await keyboardInside(page, "Terminal")).toBe(true);
    });

    await test.step("browser Back returns to Open Dough's roster, the terminal still showing the session", async () => {
      await page.goBack();
      await expect(roster).toBeVisible();
      expectRoute(page, { project: "open-dough", view: "roster" });
      await expect(panel.getByRole("heading")).toHaveText(pygardonStory.title);
      await expectCurrentEntry(page, pygardonStory.title);
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
      await expectSelected(card(readyStory), true);
      await expect(
        card(readyStory).getByText("Shown in terminal"),
      ).toBeVisible();
      await expectCurrentEntry(page, readyStory);
      await expect(entry(pygardonStory.title)).not.toHaveAttribute(
        "aria-current",
      );
      for (const other of [takenStory, notRefinedStory]) {
        await expectSelected(card(other), false);
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

    await test.step("closing the terminal clears both marks, keeps the story selected, and returns the keyboard to the entry", async () => {
      await closeSidePanel(panel, { using: "mouse" });
      await expect(panel).toHaveCount(0);
      await expect(shownMark).toHaveCount(0);
      await expect(page.locator(".in-side-panel")).toHaveCount(0);
      await expectSelected(card(readyStory), true);
      for (const other of [takenStory, notRefinedStory]) {
        await expectSelected(card(other), false);
      }
      await expectCurrentEntry(page);
      await expect(entry(readyStory)).toBeFocused();
    });

    await test.step("with the keyboard on an entry, Command+B closes the sidebar and the keyboard lands on Sessions", async () => {
      await page.keyboard.press("Meta+b");
      await expectSessionsSidebar(page, "closed");
      await expect(button).toBeFocused();
    });

    // Going to sessions changed no story, column, or position, and marked no
    // session done.
    await expectMembership(page, openDoughStories);
    await button.click();
    await expect(entries).toHaveCount(4);
    await expect(page.getByText(/^Named done-/)).toHaveCount(0);
  });
});
