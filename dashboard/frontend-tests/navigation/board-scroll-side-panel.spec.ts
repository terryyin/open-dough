// The Board alone scrolls beside an open Side panel: the banner, the panel
// and the Board's region stay put while the Board reads on, by wheel and by
// its own scrollbar, and Maximize, Restore and the Panel divider leave the
// Board's position and the document still. Where the panel covers a
// one-column Board, closing it returns to a Board that scrolls alone.

import type { Locator, Page } from "@playwright/test";
import {
  maximizeSidePanel,
  restoreSidePanel,
} from "../../test-support/sidePanelFrame.ts";
import { reviewChanges } from "../../test-support/storyCardControls.ts";
import { reviewRegion } from "../../test-support/support/reviewControls.ts";
import {
  expect,
  takenStoryCard,
  test,
} from "../../test-support/support/frontendApp.ts";
import {
  takenBacklogMarkdown,
  type FrontendServiceState,
} from "../../test-support/support/frontendServiceState.ts";
import { installFrontendStoryReview } from "../../test-support/support/frontendStoryReview.ts";
import { keepTakenReviewLaunch } from "../../test-support/support/frontendStoryReviewOpen.ts";
import { largeBacklog } from "../../test-support/accessibleBoard.ts";
import {
  boardScroll,
  scrollYOf,
  showColumn,
} from "../../test-support/boardPage.ts";
import {
  expectDocumentStill,
  pressScrollbarTrack,
  untilBoardRests,
  wheelBy,
} from "../../test-support/boardReading.ts";
import { expectSettledPage, parts } from "../../test-support/dashboardPage.ts";
import { box, closeSidePanelToBoard } from "../../test-support/pageLayout.ts";
import { dashboardBrowserArgs } from "../../test-support/support/browserArgs.ts";
import {
  dragDivider,
  expectCoveringFillsWindow,
  panelDivider,
} from "../../test-support/sidePanelWidthPage.ts";

// Exercise the browser's actual scrollbar; Playwright normally hides it.
test.use({
  launchOptions: {
    args: dashboardBrowserArgs,
    ignoreDefaultArgs: ["--hide-scrollbars"],
  },
});

const wideWindow = { width: 1400, height: 420 };
const narrowWindow = { width: 700, height: 800 };

// A long Board whose Taken story offers Review changes, read once settled.
async function openLongBoard(
  page: Page,
  services: FrontendServiceState,
  viewport: typeof wideWindow,
) {
  await page.setViewportSize(viewport);
  keepTakenReviewLaunch(services);
  await installFrontendStoryReview(page);
  Object.assign(services, {
    backlog:
      takenBacklogMarkdown + (largeBacklog.split("## Backlog list")[1] ?? ""),
  });
  await page.goto("/");
  await expectSettledPage(page);
  return takenStoryCard(page);
}

async function reviewStory(page: Page, card: Locator) {
  await reviewChanges(card).click();
  const panel = reviewRegion(page, { exact: true });
  await expect(panel.getByRole("heading", { level: 2 })).toHaveText("Story A");
  return panel;
}

test(`the Board alone scrolls with an open Side panel at ${wideWindow.width}×${wideWindow.height}`, async ({
  page,
  frontendServices,
}, testInfo) => {
  const card = await openLongBoard(page, frontendServices, wideWindow);
  const panel = await reviewStory(page, card);
  const banner = parts(page).banner;
  const region = boardScroll(page);
  const initial = {
    panel: await box(panel),
    banner: await box(banner),
    region: await box(region),
  };
  const firstTop = (await box(card)).y;
  await wheelBy(page, 600);
  expect((await box(card)).y).toBeLessThan(firstTop - 500);
  expect(await box(panel)).toEqual(initial.panel);
  expect(await box(banner)).toEqual(initial.banner);
  expect(await box(region)).toEqual(initial.region);
  await expectDocumentStill(page);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(
    wideWindow.height,
  );
  expect(initial.region.y).toBe(initial.banner.y + initial.banner.height);
  expect(
    await region.evaluate((element) => getComputedStyle(element).overflowY),
  ).toBe("auto");
  const hit = await region.evaluate((element) => {
    const at = element.getBoundingClientRect();
    const target = document.elementFromPoint(
      at.right - 1,
      at.top + at.height / 2,
    );
    return {
      width: at.width,
      clientWidth: element.clientWidth,
      divider: target?.closest(".panel-divider") !== null,
      target: target?.className,
    };
  });
  await testInfo.attach("Board scrollbar hit", {
    body: JSON.stringify(hit),
    contentType: "application/json",
  });
  expect(
    hit,
    "the Board scrollbar edge cannot target the Panel divider",
  ).toMatchObject({ divider: false });
  const beforeTrack = await scrollYOf(page);
  await pressScrollbarTrack(page);
  await expect.poll(() => scrollYOf(page)).toBeGreaterThan(beforeTrack);
  await untilBoardRests(page);
  expect(await box(panel)).toEqual(initial.panel);
  await expectDocumentStill(page);
  const divider = await box(panelDivider(page));
  expect(
    initial.region.x + initial.region.width,
    "the Board region meets the panel without a gap",
  ).toBe(initial.panel.x);
  expect(initial.region.x + initial.region.width).toBeLessThanOrEqual(
    divider.x,
  );
  const position = await scrollYOf(page);
  await maximizeSidePanel(panel, "mouse");
  await expect(banner).toBeHidden();
  await restoreSidePanel(panel, "mouse");
  await expect(banner).toBeVisible();
  expect(await scrollYOf(page)).toBe(position);
  expect(await box(panel)).toEqual(initial.panel);
  await expectDocumentStill(page);
  await dragDivider(page, 60);
  await expect
    .poll(async () => (await box(panel)).width)
    .toBe(initial.panel.width - 60);
  await expectDocumentStill(page);
});

test(`the Board alone scrolls with an open Side panel at ${narrowWindow.width}×${narrowWindow.height}`, async ({
  page,
  frontendServices,
}) => {
  const card = await openLongBoard(page, frontendServices, narrowWindow);
  // A one-column Board shows Taken, whose story has a review, first.
  await showColumn(page, "Taken");
  const panel = await reviewStory(page, card);
  await expectCoveringFillsWindow(panel, parts(page));
  await closeSidePanelToBoard(panel);
  await expect(parts(page).banner).toBeVisible();
  // The long Backlog is what scrolls in a one-column Board.
  await showColumn(page, "Backlog");
  const shown = parts(page).backlog.getByRole("article").first();
  const firstTop = (await box(shown)).y;
  await wheelBy(page, 600);
  expect((await box(shown)).y).toBeLessThan(firstTop - 500);
  await expectDocumentStill(page);
});
