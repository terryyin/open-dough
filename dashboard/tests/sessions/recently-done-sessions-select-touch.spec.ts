// On coarse input a Recently done sessions row's Select and its Open are
// separate touch controls (../../src/recentlyDoneSelection.ts). At phone
// width the sidebar overlays the page and stays on Select; once it is closed,
// Development's Board shows the selected done card in view, even when its
// own catalog read finishes after. Board reveal and range extension of both
// kinds of row live in ./recently-done-sessions-select-development.spec.ts.

import type { Locator } from "@playwright/test";
import { expect, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import { closeSidePanelToBoard, tapWhereShown } from "../pageLayout.ts";
import { expectProjectChoice } from "../projectChoice.ts";
import {
  adHoc,
  linked,
  openSelectionPage,
  report,
} from "../recentlyDoneSelectionJourney.ts";
import { expectDevelopmentKept } from "../recentlyDoneSelectionReport.ts";
import { holdPygardonCatalog } from "../pygardonCatalogReads.ts";
import { expectSelected } from "../storyCardSelection.ts";
import { phoneLaunchTouchViewport } from "../touchLaunchPage.ts";
import { finalReportParts } from "../finalReportPages.ts";

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
    await atLeastTouchSize(shown.select(adHoc.title));
    await atLeastTouchSize(shown.open(report.title));

    // The section's own scrolling brings an older row in reach.
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
    dashboard,
  }) => {
    const { shown } = await openSelectionPage(page, dashboard, tapWhereShown, {
      // Its done card stands behind six newer Pygardon sessions.
      newer: { pygardon: 6 },
    });
    // The row's check reads the catalog; the Board's own read of it is still
    // under way when the overlay is closed.
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
    await expectDevelopmentKept(page, dashboard);
  });
});
