// On coarse input a Recently done sessions row's Select and its Open are
// separate touch controls (../../src/recentlyDoneSelection.ts).

import type { Locator } from "@playwright/test";
import { expect, test } from "../dashboardTest.ts";
import { closeSidePanel, tapWhereShown } from "../pageLayout.ts";
import {
  adHoc,
  openSelectionPage,
  report,
} from "../recentlyDoneSelectionJourney.ts";
import { phoneLaunchTouchViewport } from "../touchLaunchPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });

test.describe("on coarse input", () => {
  test.use({ viewport: phoneLaunchTouchViewport.portrait, hasTouch: true });

  test("a row's Select and its Open are separate touch controls: Select keeps the sidebar and opens nothing, Open reads the final report", async ({
    page,
    dashboard,
  }) => {
    const { shown } = await openSelectionPage(page, dashboard, tapWhereShown);
    const atLeastTouchSize = async (control: Locator) => {
      const box = await control.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    };
    await atLeastTouchSize(shown.entry(adHoc.title));
    await atLeastTouchSize(shown.open(report.title));

    // The section's own scrolling brings an older row in reach.
    await shown.entry(adHoc.title).scrollIntoViewIfNeeded();
    await tapWhereShown(shown.entry(adHoc.title));
    await expect(shown.entry(adHoc.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(shown.sidebar).toBeVisible();
    await expect(
      page.getByRole("region", { name: /^(Terminal|Final report)$/ }),
    ).toHaveCount(0);

    await shown.entry(report.title).scrollIntoViewIfNeeded();
    await tapWhereShown(shown.entry(report.title));
    await expect(shown.entry(report.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(
      page.getByRole("region", { name: "Final report" }),
    ).toHaveCount(0);

    await shown.open(report.title).scrollIntoViewIfNeeded();
    await tapWhereShown(shown.open(report.title));
    const panel = page.getByRole("region", { name: "Final report" });
    await expect(panel.locator(".final-report-text")).toHaveText(
      report.message,
    );
    await expect(shown.sidebar).toBeHidden();
    await closeSidePanel(panel);
    await expect(shown.button).toBeFocused();
  });
});
