// On coarse input a Recently done sessions row's Select and its Open are
// separate touch controls. At phone width the sidebar overlays; once closed,
// Development shows the selected done card while its catalog read finishes.
import type { Locator } from "@playwright/test";
import { expect, test } from "../../tests/support/frontendApp.ts";
import { pausePageClockAt } from "../../tests/dashboardTest.ts";
import { parts } from "../../tests/dashboardPage.ts";
import {
  closeSidePanelToBoard,
  tapWhereShown,
} from "../../tests/pageLayout.ts";
import { expectProjectChoice } from "../../tests/projectChoice.ts";
import { holdPygardonCatalog } from "../../tests/pygardonCatalogReads.ts";
import { expectSelected } from "../../tests/storyCardSelection.ts";
import { phoneLaunchTouchViewport } from "../../tests/touchLaunchPage.ts";
import { finalReportParts } from "../../tests/finalReportPages.ts";
import {
  adHoc,
  linked,
  openFrontendSelectionPage,
  report,
} from "../../tests/support/frontendRecentlyDoneSelection.ts";

test.describe("on coarse input", () => {
  test.use({ viewport: phoneLaunchTouchViewport.portrait, hasTouch: true });

  test("a row's Select and its Open are separate touch controls: Select keeps the sidebar and opens nothing, Open reads the final report", async ({
    page,
    frontendServices,
  }) => {
    const { shown } = await openFrontendSelectionPage(page, frontendServices, {
      tap: tapWhereShown,
    });
    const atLeastTouchSize = async (control: Locator) => {
      const box = await control.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    };
    await atLeastTouchSize(shown.select(adHoc.title));
    await atLeastTouchSize(shown.open(report.title));

    await shown.select(adHoc.title).scrollIntoViewIfNeeded();
    await tapWhereShown(shown.select(adHoc.title));
    await expect(shown.select(adHoc.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(shown.sidebar).toBeVisible();
    await expect(
      page.getByRole("region", { name: /^(Terminal|Final report)$/ }),
    ).toHaveCount(0);

    await shown.select(report.title).scrollIntoViewIfNeeded();
    await tapWhereShown(shown.select(report.title));
    await expect(shown.select(report.title)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const { panel, reportText } = finalReportParts(page);
    await expect(panel).toHaveCount(0);

    await shown.open(report.title).scrollIntoViewIfNeeded();
    await tapWhereShown(shown.open(report.title));
    await expect(reportText).toHaveText(report.message);
    await expect(shown.sidebar).toBeHidden();
    await closeSidePanelToBoard(panel);
    await expect(shown.button).toBeFocused();
  });

  test("at phone width a linked selection in Development is in view, selected, once the Sessions overlay closes, while the Board still reads its catalog", async ({
    page,
    frontendServices,
  }) => {
    await pausePageClockAt(page, new Date());
    const { shown } = await openFrontendSelectionPage(page, frontendServices, {
      newer: { pygardon: 6 },
      tap: tapWhereShown,
    });
    const boardRead = await holdPygardonCatalog(page, 1);
    await shown.select(linked.title).scrollIntoViewIfNeeded();
    await tapWhereShown(shown.select(linked.title));
    await boardRead.asked;
    await expectProjectChoice(page, "Pygardon");
    await expect(shown.sidebar).toBeVisible();
    await tapWhereShown(shown.button);
    await expect(shown.sidebar).toBeHidden();
    boardRead.release();
    const card = parts(page).recentlyDone.getByRole("article", {
      name: linked.title,
      exact: true,
    });
    await expectSelected(card, true);
    await expect(card).toBeInViewport();
    await expect(parts(page).development).toBeChecked();
    await expect(parts(page).intent).toHaveCount(0);
  });
});
