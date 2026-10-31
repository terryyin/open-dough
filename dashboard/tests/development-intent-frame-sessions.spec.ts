// Changing perspective keeps sessions as they are (./intentPerspectivePage.ts):
// a Sessions sidebar entry chosen from Intent opens its project's Development
// stories and its session, and the terminal, a covering one too, stays shown
// and attached once while the perspective changes beneath it. The page's own
// dashboard server launches and attaches the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import {
  expectAddress,
  expectForthcomingIntent,
} from "./intentPerspectivePage.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { expectRoute } from "./agentRosterRecords.ts";
import { launched } from "./agentTerminalBoundary.ts";
import { closeSidePanel } from "./pageLayout.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { publishCatalogProjects } from "./projectKeyboardNavigationJourney.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import {
  attachesOf,
  historyLength,
  keyboardInside,
  openDoughStories,
  openNavigationJourney,
  pygardonBacklogTitles,
  pygardonStory,
  revealsOf,
} from "./sessionNavigationJourney.ts";
import { expectCovering } from "./sidePanelWidthPage.ts";
import { phoneLaunchTouchViewport } from "./touchLaunchPage.ts";

test.describe("with the three catalog projects' sessions", () => {
  test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("a Sessions sidebar entry from Intent goes to its project's Development stories and session, and the terminal stays attached across perspectives", async ({
    page,
    dashboard,
  }) => {
    const { card, sessions } = await openNavigationJourney(
      page,
      dashboard,
      columnsJourney,
    );
    const { button, entries, entry } = sessionsSidebarParts(page);
    const { development, intent, intentChoice, project, backlog } = parts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    const rows = panel.locator(".xterm-rows");
    await expectMembership(page, openDoughStories);
    await intentChoice.click();
    await expect(intent).toBeVisible();
    await button.click();
    await expect(entries).toHaveCount(4);

    await test.step("from Open Dough's Intent, the Pygardon entry shows Pygardon's Development stories as one history entry and opens its session there", async () => {
      const before = await historyLength(page);
      await entry(pygardonStory.title).click();
      await expect(
        project.getByRole("radio", { name: "Pygardon", exact: true }),
      ).toBeChecked();
      await expect(development).toBeChecked();
      await expect(intent).toHaveCount(0);
      expect(new URL(page.url()).searchParams.get("perspective")).toBeNull();
      expectRoute(page, { project: "pygardon", view: null });
      expect(await historyLength(page)).toBe(before + 1);
      await expect(panel.getByRole("heading")).toHaveText(pygardonStory.title);
      await expect(rows).toContainText(
        `attached ${sessions.pygardon.slice(0, 8)}`,
      );
      expect(await keyboardInside(page, "Terminal")).toBe(true);
      await expect(entry(pygardonStory.title)).toHaveAttribute(
        "aria-current",
        "true",
      );
      await expectMembership(page, {
        taken: [],
        backlog: pygardonBacklogTitles,
      });
      const pygardonCard = backlog.getByRole("article", {
        name: pygardonStory.title,
      });
      await expect(pygardonCard).toBeInViewport();
      await expect(pygardonCard.getByText("Shown in terminal")).toBeVisible();
    });

    await test.step("Intent and back keep the terminal shown and attached once, with what was typed", async () => {
      await panel.locator(".xterm-helper-textarea").focus();
      await page.keyboard.type("before intent");
      await page.keyboard.press("Enter");
      await expect(rows).toContainText("echo before intent");
      await intentChoice.click();
      await expect(intent).toContainText("Intent for Pygardon is forthcoming.");
      await expect(panel.getByRole("heading")).toHaveText(pygardonStory.title);
      await expect(rows).toContainText("echo before intent");
      await panel.locator(".xterm-helper-textarea").focus();
      await page.keyboard.type("during intent");
      await page.keyboard.press("Enter");
      await expect(rows).toContainText("echo during intent");
      await development.click();
      await expect(intent).toHaveCount(0);
      await expect(rows).toContainText("echo during intent");
      expect(attachesOf(dashboard, sessions.pygardon)).toHaveLength(1);
      expect(attachesOf(dashboard, sessions.pygardon)[0]?.endedBy).toBe(
        undefined,
      );
    });

    await test.step("the entry already shown, chosen from the same project's Intent, still returns to Development and reveals its card without attaching again", async () => {
      await intentChoice.click();
      await expect(intent).toBeVisible();
      const before = await historyLength(page);
      const revealed = (await revealsOf(page)).length;
      await entry(pygardonStory.title).click();
      await expect(development).toBeChecked();
      await expect(intent).toHaveCount(0);
      expect(await historyLength(page)).toBe(before + 1);
      await expect
        .poll(async () => (await revealsOf(page)).length)
        .toBeGreaterThan(revealed);
      expect((await revealsOf(page)).at(-1)?.name).toBe(pygardonStory.title);
      await expect(card(pygardonStory.title)).toBeInViewport();
      expect(attachesOf(dashboard, sessions.pygardon)).toHaveLength(1);
      await expect(entry(pygardonStory.title)).toHaveAttribute(
        "aria-current",
        "true",
      );
    });
  });
});

test.describe("with a session to open", () => {
  test.use({ projectFolders: ["open-dough"] });

  test("a covering terminal at a phone width stays shown and attached while Back and Forward change the perspective beneath it, and Close shows the perspective the address names", async ({
    page,
    dashboard,
  }) => {
    const { portrait } = phoneLaunchTouchViewport;
    await page.setViewportSize(portrait);
    const story = { identity: "SEED-404#covered", title: "A covered session" };
    const { sessionId } = await launched(dashboard, "open-dough", story);
    await publishCatalogProjects(page);
    await openUntilRead(page);
    const { development, intentChoice } = parts(page);
    const attaches = () =>
      dashboard
        .claudeAttaches()
        .filter(({ id }) => id === sessionId.slice(0, 8));
    // Development, Intent, then Development again, as history entries.
    await intentChoice.click();
    await expectForthcomingIntent(page, "Open Dough");
    await development.click();
    await expect(parts(page).intent).toHaveCount(0);

    const panel = page.getByRole("region", { name: "Terminal", exact: true });
    const rows = panel.locator(".xterm-rows");
    const { button, entry } = sessionsSidebarParts(page);
    await button.click();
    await entry(story.title).click();
    await expectCovering(panel);
    await expect(rows).toContainText(`attached ${sessionId.slice(0, 8)}`);
    await panel.locator(".xterm-helper-textarea").focus();
    await page.keyboard.type("while covering");
    await page.keyboard.press("Enter");
    await expect(rows).toContainText("echo while covering");
    // The page beneath is hidden from roles while covered; its classes say
    // which perspective it shows.
    const intentBeneath = page.locator(".page-column .intent-perspective");

    await test.step("Back shows Intent beneath the covering terminal, which stays shown with its content", async () => {
      await page.goBack();
      expectAddress(page, { project: null, perspective: "intent" });
      await expect(intentBeneath).toHaveCount(1);
      await expectCovering(panel);
      await expect(panel.getByRole("heading")).toHaveText(story.title);
      await expect(rows).toContainText("echo while covering");
    });

    await test.step("Forward and Back again keep the terminal covering and attached once", async () => {
      await page.goForward();
      expectAddress(page, { project: null, perspective: null });
      await expect(intentBeneath).toHaveCount(0);
      await expectCovering(panel);
      await page.goBack();
      await expect(intentBeneath).toHaveCount(1);
      await expectCovering(panel);
      await expect(rows).toContainText("echo while covering");
      expect(attaches()).toHaveLength(1);
      expect(attaches()[0]?.endedBy).toBeUndefined();
    });

    await test.step("Close shows Open Dough's Intent, as the address names", async () => {
      await closeSidePanel(panel);
      await expectForthcomingIntent(page, "Open Dough");
      expectAddress(page, { project: null, perspective: "intent" });
      expect(attaches()).toHaveLength(1);
    });
  });
});
