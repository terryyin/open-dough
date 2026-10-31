// The Sessions sidebar and the terminal's header in the frame's look:
// the open sidebar's Sessions button, its entries' words, and the header's
// title, session row, and icon controls read clearly and keep their names,
// and both fit a narrow and a zoomed window without sideways scrolling. An
// entry's title is cut by design (./sessions-sidebar-row.spec.ts), the panel
// header title truncates by design with disclosure (./SidePanelTitle.tsx), and
// the terminal's own screen is its contents, not this look's. The page's own
// dashboard server attaches the synthetic `claude` (./fixtures/fake-claude).

import { expect, test } from "./dashboardTest.ts";
import { launched } from "./agentTerminalBoundary.ts";
import {
  expectReadableContrast,
  narrowWindow,
  zoomedWindow,
} from "./accessibleReading.ts";
import { expectFrameIconControl } from "./frameIconControl.ts";
import { box, expectNoSidewaysScrollAndWholeText } from "./pageLayout.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut"] });

const work = {
  identity: "SEED-901#frame-look",
  title: `A long story title that the narrow sidebar cuts ${"and goes on ".repeat(4)}to its end`,
};
const cutTitles = ".sessions-sidebar-session-entry-title";
const panelTitle = ".side-panel-title-toggle";
const terminalScreen = ".terminal-screen";

test.describe("the Sessions sidebar and terminal in the frame's look", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("read clearly, keep their names, and fit a narrow and a zoomed window", async ({
    page,
    dashboard,
  }) => {
    const { sessionId } = await launched(dashboard, "doughnut", work);
    await page.setViewportSize(narrowWindow);
    const { settled } = await openStoryColumnsJourney(page, columnsJourney);
    const { sidebar, button, entries, entry } = sessionsSidebarParts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    const control = (name: string) =>
      panel.getByRole("button", { name, exact: true });
    await settled();
    await button.click();
    await expect(entries).toHaveCount(1);

    await test.step("the open sidebar's button, heading, and entry read clearly", async () => {
      await expectFrameIconControl(button, "Sessions", "Sessions (⌘B)");
      await expectReadableContrast(
        sidebar.getByRole("heading", { level: 2, name: "Sessions" }),
      );
      await expectReadableContrast(entries.first().getByRole("heading"));
      await expectReadableContrast(entries.first().locator("time"));
      for (const size of [narrowWindow, zoomedWindow]) {
        await page.setViewportSize(size);
        await expect(sidebar).toBeVisible();
        await expectNoSidewaysScrollAndWholeText(page, [cutTitles]);
      }
      await page.setViewportSize(narrowWindow);
    });

    await test.step("the terminal header's words and icon controls read clearly and keep their names", async () => {
      await entry(work.title).click();
      // Covering hides the Board; do not wait on Board settlement here.
      await expect(panel.locator(".xterm-rows")).toContainText(
        `attached ${sessionId.slice(0, 8)}`,
      );
      await expectReadableContrast(
        panel.getByRole("heading", { level: 2, name: work.title }),
      );
      await expectReadableContrast(panel.getByText(/^Execution session$/));
      await expectFrameIconControl(control("Mark as done"), "Mark as done");
      await expectFrameIconControl(control("Close"), "Close", "Close (⌘⇧Esc)");
      // Narrow covering offers no Maximize; Close remains the route back.
      await expect(control("Maximize")).toHaveCount(0);
      await expect(control("Restore")).toHaveCount(0);
      for (const size of [narrowWindow, zoomedWindow]) {
        await page.setViewportSize(size);
        await expect(control("Close")).toBeVisible();
        await expect(control("Maximize")).toHaveCount(0);
        // The terminal refits its own screen to the narrower window shortly
        // after the window narrows; the frame is checked once it has.
        await expect
          .poll(async () => {
            const [screen, rows] = await Promise.all([
              box(panel.locator(terminalScreen)),
              box(panel.locator(".xterm-screen")),
            ]);
            return rows.x + rows.width <= screen.x + screen.width + 0.5;
          })
          .toBe(true);
        await expectNoSidewaysScrollAndWholeText(page, [
          cutTitles,
          panelTitle,
          terminalScreen,
        ]);
      }
    });
  });
});
