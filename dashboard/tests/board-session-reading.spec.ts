import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { closeSidePanel } from "./pageLayout.ts";
import { expectReadingTop } from "./readingPlace.ts";
import {
  expectWhollyInView,
  openNavigationJourney,
  pygardonStory,
} from "./sessionNavigationJourney.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import { expectCovering } from "./sidePanelWidthPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });
let journey: StoryColumnsJourney | undefined;
test.beforeAll(async () => {
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => journey?.cleanup());

for (const height of [800, 900, 1600]) {
  test(`the Session entry reveals the same story on the Board after Close at 700×${height}`, async ({
    page,
    dashboard,
  }, testInfo) => {
    if (!journey) throw new Error("Missing navigation fixture");
    await openNavigationJourney(page, dashboard, journey);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 700, height });
    const sidebar = sessionsSidebarParts(page);
    await sidebar.button.click();
    await sidebar.entry(pygardonStory.title).click();
    await expect(sidebar.sidebar).toBeHidden();
    const panel = page.getByRole("region", { name: "Terminal", exact: true });
    await expect(panel.locator("textarea")).toBeFocused();
    await expectCovering(panel);
    // Covering aria-hides the Board (preparation text too); Close first, wait
    // for preparation to finish in the restored tree, then read the Board.
    await closeSidePanel(panel);
    await expect(page.getByText("Reading preparation…")).toHaveCount(0);
    const card = parts(page).backlog.getByRole("article", {
      name: pygardonStory.title,
      exact: true,
    });
    const bounds = await card.evaluate((element) => {
      const region = element.closest(".board-scroll");
      const at = element.getBoundingClientRect();
      const room = region?.getBoundingClientRect();
      return {
        card: { top: at.top, bottom: at.bottom, height: at.height },
        region: { top: room?.top, bottom: room?.bottom, height: room?.height },
      };
    });
    await testInfo.attach("reading-bounds", {
      body: JSON.stringify(bounds),
      contentType: "application/json",
    });
    // Full Board after Close: a card taller than the region keeps the reading
    // edge; one that fits stays wholly in view (stacked half-Board used to
    // force the reading-edge case at 800/900).
    const regionHeight = bounds.region.height;
    if (regionHeight === undefined) {
      throw new Error("Board scroll region missing after Close");
    }
    if (bounds.card.height > regionHeight) {
      await expectReadingTop(card);
    } else {
      await expectWhollyInView(page, pygardonStory.title);
    }
    expect(await page.evaluate(() => scrollY)).toBe(0);
  });
}
