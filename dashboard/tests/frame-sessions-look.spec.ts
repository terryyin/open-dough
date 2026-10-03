// The Sessions sidebar and the terminal panel's header in the frame's look:
// the open sidebar's Sessions button, its entries' words, and the header's
// title, session row, and icon controls read clearly and keep their names,
// and both fit a narrow and a zoomed window without sideways scrolling. An
// entry's title is cut by design (./session-sidebar-row.spec.ts), and the
// terminal's own screen is its contents, not this look's. The page's own
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
import { sidebarParts } from "./sessionSidebarPage.ts";
import {
  publishStoryStagesJourney,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut"] });

const work = {
  identity: "SEED-901#frame-look",
  title: `A long story title that the narrow sidebar cuts ${"and goes on ".repeat(4)}to its end`,
};
const cutTitles = ".sidebar-title";
const terminalScreen = ".terminal-screen";

test.describe("the Sessions sidebar and terminal panel in the frame's look", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("read clearly, keep their names, and fit a narrow and a zoomed window", async ({
    page,
    dashboard,
  }) => {
    const { sessionId } = await launched(dashboard, "doughnut", work);
    await page.setViewportSize(narrowWindow);
    const { settled } = await openStoryStagesJourney(page, stagesJourney);
    const { sidebar, button, entries, entry } = sidebarParts(page);
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
      await expect(panel.locator(".xterm-rows")).toContainText(
        `attached ${sessionId.slice(0, 8)}`,
      );
      await expectReadableContrast(
        panel.getByRole("heading", { level: 2, name: work.title }),
      );
      await expectReadableContrast(panel.getByText(/^Execution session /));
      await expectFrameIconControl(control("Mark as done"), "Mark as done");
      await expectFrameIconControl(control("Maximize"), "Maximize");
      await expectFrameIconControl(control("Close"), "Close", "Close (⌘⇧Esc)");
      for (const size of [narrowWindow, zoomedWindow]) {
        await page.setViewportSize(size);
        await expect(control("Close")).toBeVisible();
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
          terminalScreen,
        ]);
      }
    });
  });
});
