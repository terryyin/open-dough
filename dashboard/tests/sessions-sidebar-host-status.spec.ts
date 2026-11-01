// The Sessions sidebar's title row status: beside the Sessions heading, while
// the sidebar is open, display-only figures say how many open sessions are
// active and how many need attention (waiting), by the same reading the list
// groups by; each is an icon and its number, with its wording as its name and
// tooltip; zeros stay; the next sessions reading updates them without a
// reload. The page's own dashboard server launches the synthetic `claude`
// (./fixtures/fake-claude).

import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import { launched } from "./agentTerminalBoundary.ts";
import { expectReadableContrast } from "./accessibleReading.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { watchRecordReads } from "./sessionStatePace.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import type { Locator, Page } from "@playwright/test";

test.use({ projectFolders: ["open-dough", "doughnut"] });

const story = (index: number) => ({
  identity: `SEED-902#status-${index}`,
  title: `Status story ${index}`,
});

// The title row's figures, inside the open Sessions sidebar.
function statusParts(page: Page) {
  const { sidebar } = sessionsSidebarParts(page);
  const titleRow = sidebar.locator(".sessions-sidebar-title-row");
  return {
    heading: sidebar.getByRole("heading", { level: 2, name: "Sessions" }),
    figures: titleRow.getByRole("img"),
    active: titleRow.getByRole("img", { name: /^\d+ active sessions?$/ }),
    waiting: titleRow.getByRole("img", {
      name: /^\d+ sessions? needs? attention$/,
    }),
  };
}

// The figure is display-only: an icon and its number, with this wording as
// its accessible name and tooltip, and no other visible words.
async function expectFigure(
  figure: Locator,
  count: number,
  words: string,
): Promise<void> {
  await expect(figure).toHaveAccessibleName(words);
  await expect(figure).toHaveAttribute("title", words);
  await expect(figure).toHaveText(String(count));
  await expect(figure.locator("svg")).toBeVisible();
  await expect(figure.getByRole("button")).toHaveCount(0);
  await expect(figure.getByRole("link")).toHaveCount(0);
}

test.describe("the Sessions sidebar's title row status", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("counts active and waiting open sessions by the attention grouping, and follows the next sessions reading", async ({
    page,
    dashboard,
  }) => {
    await pausePageClockAt(page, new Date());
    const { passOnePace } = await watchRecordReads(page);
    const sessions: string[] = [];
    for (const [index, change] of (
      ["working", "blocked", "done-live"] as const
    ).entries()) {
      const { sessionId } = await launched(dashboard, "doughnut", story(index));
      dashboard.claudeSessionBecomes(sessionId, change);
      sessions.push(sessionId);
    }
    const { settled } = await openStoryColumnsJourney(page, columnsJourney);
    const { button, entries } = sessionsSidebarParts(page);
    const { heading, figures, active, waiting } = statusParts(page);
    await settled();
    await button.click();
    await expect(entries).toHaveCount(3);
    await passOnePace();

    await test.step("Working, Needs input, and Ready for review: one active, two waiting, beside the Sessions heading", async () => {
      await expect(heading).toHaveText("Sessions");
      await expect(figures).toHaveCount(2);
      await expectFigure(active, 1, "1 active session");
      await expectFigure(waiting, 2, "2 sessions need attention");
      await expectReadableContrast(active);
      await expectReadableContrast(waiting);
    });

    await test.step("a working session that needs input moves to waiting at the next reading, without a reload", async () => {
      dashboard.claudeSessionBecomes(sessions[0] ?? "?", "blocked");
      await passOnePace();
      await expectFigure(active, 0, "0 active sessions");
      await expectFigure(waiting, 3, "3 sessions need attention");
    });

    await test.step("a new working session adds to active at the next reading", async () => {
      await launched(dashboard, "doughnut", story(3));
      await passOnePace();
      await expect(entries).toHaveCount(4);
      await expectFigure(active, 1, "1 active session");
      await expectFigure(waiting, 3, "3 sessions need attention");
    });
  });

  test("keeps a zero waiting count visible, and shows the figures only while the sidebar is open", async ({
    page,
    dashboard,
  }) => {
    await pausePageClockAt(page, new Date());
    for (const index of [4, 5]) {
      const { sessionId } = await launched(dashboard, "doughnut", story(index));
      dashboard.claudeSessionBecomes(sessionId, "working");
    }
    const { settled } = await openStoryColumnsJourney(page, columnsJourney);
    const { button, entries } = sessionsSidebarParts(page);
    const { figures, active, waiting } = statusParts(page);
    // Any status figure the page offers, inside the sidebar or not; with no
    // session needing attention, the banner's badge offers none either.
    const shownAnywhere = page.getByRole("img", {
      name: /^\d+ (active sessions?|sessions? needs? attention)$/,
    });
    await settled();

    await test.step("closed, the sidebar shows no figures", async () => {
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await expect(shownAnywhere).toHaveCount(0);
    });

    await test.step("opened, two Working sessions read two active and zero waiting", async () => {
      await button.click();
      await expect(entries).toHaveCount(2);
      await expect(figures).toHaveCount(2);
      await expectFigure(active, 2, "2 active sessions");
      await expectFigure(waiting, 0, "0 sessions need attention");
    });

    await test.step("closed again, the figures leave", async () => {
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await expect(shownAnywhere).toHaveCount(0);
    });
  });
});
