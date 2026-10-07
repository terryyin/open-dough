// A Sessions sidebar choice whose story card lies in a hidden dashboard
// column shows that column, then brings the card into view as it does in a
// shown one, and the page reaches the column's whole length again. That a
// choice shows a local Taken entry hidden the same way
// is ./session-sidebar-navigation-cases.spec.ts and
// ./agent-launch-ad-hoc-sessions.spec.ts; how focus shows a hidden column is
// ./dashboard-columns-paging.spec.ts.

import { expect, test } from "./dashboardTest.ts";
import { expectMembership } from "./dashboardPage.ts";
import {
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  takenStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import {
  expectRevealsSince,
  openNavigationJourney,
  revealsOf,
} from "./sessionNavigationJourney.ts";
import {
  expectEndsWithShown,
  expectView,
  showColumn,
} from "./dashboardColumnsPage.ts";
import { box } from "./pageLayout.ts";
import { scrollsOnItsOwn } from "./sidePanelWidthPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });

test.describe("a Sessions sidebar choice in a hidden column", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("a session whose story card is hidden shows its column and brings the card into view", async ({
    page,
    dashboard,
  }) => {
    const { card } = await openNavigationJourney(
      page,
      dashboard,
      stagesJourney,
    );
    await expectMembership(page, {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    });
    const { button, entry } = sidebarParts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    await button.click();

    await test.step("beside the sidebar, the developer shows Recently done, hiding Backlog", async () => {
      await showColumn(page, "Recently done");
      await expect(card(readyStory)).not.toBeInViewport();
    });

    await test.step("choosing the story's session shows Backlog, the one column beside the terminal, with its card in view", async () => {
      const revealed = (await revealsOf(page)).length;
      await entry(readyStory).click();
      await expect(panel.getByRole("heading")).toHaveText(readyStory);
      // The sidebar's entries are cut by design, read whole by their tooltip.
      await expectView(
        page,
        ["Backlog"],
        ["Taken 1 entry"],
        [...scrollsOnItsOwn, ".sidebar-title"],
      );
      await expect(card(readyStory)).toBeInViewport();
      await expectRevealsSince(page, revealed, readyStory, "smooth");
      await expect(
        card(readyStory).getByText("Shown in terminal"),
      ).toBeVisible();
    });

    await test.step("Backlog has its whole length back: read to the page's end, its last card ends the page", async () => {
      const { x, y, width } = await box(card(readyStory));
      await page.mouse.move(x + width / 2, y + 1);
      await expectEndsWithShown(page, ["Backlog"]);
      await expect(card(notRefinedStory)).toBeInViewport({ ratio: 1 });
    });
  });
});
