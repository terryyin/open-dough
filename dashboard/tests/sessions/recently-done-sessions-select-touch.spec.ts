// On coarse input a Recently done sessions row's Select and its Open are
// separate touch controls (../../src/recentlyDoneSelection.ts). At phone
// width the sidebar overlays the page and stays on Select; once it is closed,
// Development's Board shows what was selected, in view.

import type { Locator } from "@playwright/test";
import { expect, test } from "../dashboardTest.ts";
import { parts, standaloneSessionName } from "../dashboardPage.ts";
import { closeSidePanel, tapWhereShown } from "../pageLayout.ts";
import { expectProjectChoice } from "../projectChoice.ts";
import {
  adHoc,
  expectDevelopmentKept,
  linked,
  openSelectionPage,
  report,
} from "../recentlyDoneSelectionJourney.ts";
import { pygardonCatalogRead } from "../pygardonCatalogReads.ts";
import { expectSelected } from "../storyCardSelection.ts";
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

  test("at phone width a selection in Development is in view, selected, once the Sessions overlay closes", async ({
    page,
    dashboard,
  }) => {
    const { shown } = await openSelectionPage(page, dashboard, tapWhereShown, {
      // Twenty rows, the sidebar's first batch.
      newer: { doughnut: 10, pygardon: 6 },
    });
    const { recentlyDone } = parts(page);
    const reopenSection = async () => {
      await tapWhereShown(shown.button);
      if ((await shown.header.getAttribute("aria-expanded")) !== "true")
        await shown.header.click();
    };

    await test.step("a standalone session beyond Doughnut's first ten", async () => {
      await shown.entry(adHoc.title).scrollIntoViewIfNeeded();
      await tapWhereShown(shown.entry(adHoc.title));
      await expectProjectChoice(page, "Doughnut");
      await expect(shown.sidebar).toBeVisible();
      await tapWhereShown(shown.button);
      await expect(shown.sidebar).toBeHidden();
      const entry = recentlyDone.getByRole("article", {
        name: standaloneSessionName("Ad hoc", adHoc.title),
      });
      await expect(entry).toBeInViewport();
      await expect(entry).toHaveClass(/\bselected-session\b/);
      await expectDevelopmentKept(page, dashboard);
    });

    await test.step("a linked done story behind six newer Pygardon sessions", async () => {
      await reopenSection();
      const read = pygardonCatalogRead(page);
      await shown.entry(linked.title).scrollIntoViewIfNeeded();
      await tapWhereShown(shown.entry(linked.title));
      await read;
      await expectProjectChoice(page, "Pygardon");
      await tapWhereShown(shown.button);
      await expect(shown.sidebar).toBeHidden();
      const card = recentlyDone.getByRole("article", {
        name: linked.title,
        exact: true,
      });
      await expectSelected(card, true);
      await expect(card).toBeInViewport();
      await expectDevelopmentKept(page, dashboard);
    });
  });
});
