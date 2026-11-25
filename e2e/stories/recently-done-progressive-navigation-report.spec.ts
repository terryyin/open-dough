import { readFinalReport } from "../../dashboard/test-support/finalReportPages.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { rem } from "../../dashboard/test-support/boardPage.ts";
import { expectEntries } from "../../dashboard/test-support/recentlyDoneColumn.ts";
import {
  recordsAsked,
  untilPageRests,
} from "../../dashboard/test-support/recentlyDoneProgressivePage.ts";
import {
  openedWithTakenNativeSession,
  publishedNames,
  publishedPaths,
} from "../../dashboard/test-support/recentlyDoneProgressiveJourney.ts";

test.use({ projectFolders: ["open-dough"] });

test("Mark as done in a retired-workspace report returns to the published Taken story", async ({
  afterGitHubStops,
  page,
  dashboard,
}) => {
  const view =
    await test.step("Given ten published Done stories and a Taken story with a retired workspace", async () => {
      await page.setViewportSize({ width: 80 * rem, height: 900 });
      return openedWithTakenNativeSession(
        page,
        dashboard,
        afterGitHubStops,
        true,
      );
    });
  await test.step("And Recently done shows its first ten stories", () =>
    expectEntries(view.recent, publishedNames(10)));
  await test.step("And the Taken session says its workspace is missing", () =>
    expect(view.activeSession).toContainText(
      "The saved workspace is missing.",
    ));
  const { panel } =
    await test.step("When I open Done history and the Final report", async () => {
      await view.showDoneHistory();
      return readFinalReport(view.activeSession);
    });
  await test.step("Then the Final report is visible", () =>
    expect(panel).toBeVisible());
  await test.step("When I mark the session Done in the report", () =>
    view.markDone(panel));
  await test.step("Then the report closes and focus returns to Done history", async () => {
    await expect(panel).toHaveCount(0);
    await view.showsFocusedDoneSession();
  });
  await test.step("And Recently done reads only the first ten stories", async () => {
    await expectEntries(view.recent, publishedNames(10));
    await untilPageRests(page);
    expect(recordsAsked(view.github).toSorted()).toEqual(
      publishedPaths(10).toSorted(),
    );
  });
});
