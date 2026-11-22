import type { Page } from "@playwright/test";
import { watchPageErrors } from "../../dashboard/test-support/pageErrors.ts";
import { sidePanelPages } from "../../dashboard/test-support/sidePanelPages.ts";
import {
  sidePanelWidthPage,
  usableMinimum,
  wideWindow,
} from "../../dashboard/test-support/sidePanelWidthPage.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { sidePanelContents } from "../../dashboard/test-support/support/sidePanelContents.ts";
import { expect, test } from "./side-panel-width-fixture.ts";

const preference = "open-dough.sidePanel.width";

function reviewWidth(page: Page, title: string) {
  const view = sidePanelPages(page);
  const width = sidePanelWidthPage(page);
  const panel = sidePanelContents(page);
  const open = () =>
    view.phase("Open the published story's review", ({ board }) =>
      board.storyCard(title).reviewChanges().expectStory(title),
    );
  return { view, width, panel, open };
}

function keptWidth(page: Page) {
  return page.evaluate((key) => localStorage.getItem(key), preference);
}

async function openPublishedReview(
  page: Page,
  origin: Parameters<typeof openBacklog>[1],
  title: string,
) {
  const review = reviewWidth(page, title);
  await openBacklog(page, origin);
  await review.open();
  return review;
}

test("reload restores the preferred review width within the room available", async ({
  browser,
  page,
  storyA: { title },
  origin,
}) => {
  const { view, width, panel, open } =
    await test.step("Given Story A's Review is open", () =>
      openPublishedReview(page, origin, title));
  const room =
    await test.step("And the Review takes half the room", async () => {
      const { pageColumn, sidePanel } = await width.split(panel);
      await width.expectWidth(panel, Math.round((pageColumn + sidePanel) / 2));
      return pageColumn + sidePanel;
    });
  const chosen =
    await test.step("When I drag the divider 200 pixels wider", async () => {
      const chosen = Math.round(room / 2) + 200;
      await view.phase(
        "The divider sets the preferred width",
        ({ panelDivider }) =>
          panelDivider.drag(-200).expectSidePanelWidth(chosen),
      );
      return chosen;
    });
  await test.step("And I reload and reopen the Review", async () => {
    await page.reload();
    await open();
  });
  await test.step("Then the Review restores the chosen split", async () => {
    await width.expectWidth(panel, chosen);
    await width.expectDividerSays(chosen);
    expect((await width.split(panel)).pageColumn).toBeCloseTo(room - chosen, 0);
  });
  await test.step("And a fresh browser still opens the Review at half width", async () => {
    const fresh = await browser.newContext({ viewport: wideWindow });
    try {
      const other = await fresh.newPage();
      await other.goto(page.url());
      await sidePanelPages(other).phase(
        "Open the Review in a fresh browser",
        ({ board, panelDivider }) => {
          board.storyCard(title).reviewChanges().expectStory(title);
          panelDivider.expectSidePanelWidth(Math.round(room / 2));
        },
      );
    } finally {
      await fresh.close();
    }
  });
  await test.step("When I reload and reopen the Review in a 1000-pixel window", async () => {
    await page.setViewportSize({ width: 1000, height: wideWindow.height });
    await page.reload();
    await open();
  });
  const fitted =
    await test.step("Then the smaller room constrains the width", async () => {
      const fitted = 1000 - usableMinimum;
      await view.phase(
        "The Review fits the smaller room",
        ({ panelDivider }) => {
          expect(fitted).toBeLessThan(chosen);
          panelDivider.expectSidePanelWidth(fitted);
        },
      );
      return fitted;
    });
  await test.step("When I maximize and restore the Review", () =>
    view.phase("Maximize and Restore", ({ sidePanel }) =>
      sidePanel.maximize().expectMaximized().restore(),
    ));
  await test.step("Then the Review returns to the smaller split and keeps the saved preference", async () => {
    await view.phase("The divider fits the smaller room", ({ panelDivider }) =>
      panelDivider.expectSidePanelWidth(fitted),
    );
    expect(await keptWidth(page)).toBe(String(chosen));
  });

  await test.step("When I reload and reopen the Review in a 760-pixel window", async () => {
    await page.setViewportSize({ width: 760, height: wideWindow.height });
    await page.reload();
    await open();
  });
  await test.step("Then it covers the page and keeps the saved preference", async () => {
    await width.expectCovering(panel);
    expect(await keptWidth(page)).toBe(String(chosen));
  });
  await test.step("When I widen the window again", () =>
    page.setViewportSize(wideWindow));
  await test.step("Then the chosen split returns", () =>
    view.phase("The preferred split returns", ({ panelDivider }) =>
      panelDivider.expectSidePanelWidth(chosen),
    ));
  await test.step("When I maximize the Review", async () => {
    await view.phase("Maximize the Review", ({ sidePanel }) =>
      sidePanel.maximize().expectMaximized(),
    );
    await expect(width.divider).toHaveCount(0);
  });
  await test.step("And I reload and reopen the Review while maximized", async () => {
    await page.reload();
    await open();
  });
  await test.step("Then the new page opens in the preferred split", async () => {
    await width.expectWidth(panel, chosen);
    await width.expectDividerSays(chosen);
  });
});

test("reload starts at half the room when the browser refuses the preference", async ({
  page,
  storyA: { title },
  origin,
}) => {
  const errors =
    await test.step("Given the browser refuses storage", async () => {
      const errors = watchPageErrors(page);
      await page.addInitScript(() => {
        Object.defineProperty(window, "localStorage", {
          get() {
            throw new DOMException("Storage is refused.", "SecurityError");
          },
        });
      });
      return errors;
    });
  const { view, open } = await test.step("And Story A's Review is open", () =>
    openPublishedReview(page, origin, title));
  const starting =
    await test.step("Then the Review starts at half the room", async () => {
      const starting = await view.shownWidth();
      expect(starting).toBe(wideWindow.width / 2);
      return starting;
    });
  await test.step("When I drag the divider 200 pixels wider", () =>
    view.phase("The wider split holds for this page", ({ panelDivider }) =>
      panelDivider.drag(-200).expectSidePanelWidth(starting + 200),
    ));
  await test.step("And I reload and reopen the Review", async () => {
    await page.reload();
    await open();
  });
  await test.step("Then the new page opens at half the room without a script error", async () => {
    await view.phase("The original split returns", ({ panelDivider }) =>
      panelDivider.expectSidePanelWidth(starting),
    );
    expect(errors).toEqual([]);
  });
});
