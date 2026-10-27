import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { expectReadingTop } from "./readingPlace.ts";
import {
  expectWhollyInView,
  openNavigationJourney,
  pygardonStory,
} from "./sessionNavigationJourney.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });
let journey: StoryColumnsJourney | undefined;
test.beforeAll(async () => {
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => journey?.cleanup());

for (const height of [800, 900, 1600]) {
  test(`the Session entry reveals the same story within the stacked Board at 700×${height}`, async ({
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
    const card = parts(page).backlog.getByRole("article", {
      name: pygardonStory.title,
      exact: true,
    });
    await expect(page.getByText("Reading preparation…")).toHaveCount(0);
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
    if (height < 1600) {
      expect(bounds.card.height).toBeGreaterThan(bounds.region.height ?? 0);
      await expectReadingTop(card);
    } else {
      expect(bounds.card.height + 96).toBeLessThan(bounds.region.height ?? 0);
      await expectWhollyInView(page, pygardonStory.title);
    }
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await expect(
      page
        .getByRole("region", { name: "Terminal", exact: true })
        .locator("textarea"),
    ).toBeFocused();
  });
}
