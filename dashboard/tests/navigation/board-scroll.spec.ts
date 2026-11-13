import { maximizeSidePanel, restoreSidePanel } from "../sidePanelFrame.ts";
import { reviewChanges } from "../storyCardControls.ts";
import { reviewRegion } from "../support/storyReviewMark.ts";
import { appendFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../support/preparationPage.ts";
import { largeBacklog, publishLargeBacklog } from "../accessibleBoard.ts";
import { boardScroll, expectView, scrollYOf } from "../boardPage.ts";
import {
  expectDocumentStill,
  pressScrollbarTrack,
  untilBoardRests,
  wheelBy,
} from "../boardReading.ts";
import { expectSettledPage, parts, rosterParts } from "../dashboardPage.ts";
import { box, closeSidePanel } from "../pageLayout.ts";
import { publishRosterOrigins } from "../agentRosterRecords.ts";
import {
  dragDivider,
  expectCoveringFillsWindow,
  panelDivider,
} from "../sidePanelWidthPage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { dashboardBrowserArgs } from "../support/browserArgs.ts";
import { openBacklog } from "../support/sessionDialog.ts";
import { keepLaunchRecord } from "../support/storyLaunchRecord.ts";
import {
  commitAll,
  git,
  storyWorktree,
} from "../support/storyReviewWorktree.ts";

// Exercise the browser's actual scrollbar; Playwright normally hides it.
test.use({
  launchOptions: {
    args: dashboardBrowserArgs,
    ignoreDefaultArgs: ["--hide-scrollbars"],
  },
});

for (const viewport of [
  { width: 1400, height: 420 },
  { width: 700, height: 800 },
]) {
  test(`the Board alone scrolls with an open Side panel at ${viewport.width}×${viewport.height}`, async ({
    page,
    dashboard,
    origin,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    const { workspace } = storyWorktree(origin);
    keepLaunchRecord(dashboard, workspace);
    git(origin.project, "pull", "--quiet", "--ff-only", "origin", "main");
    appendFileSync(
      path.join(origin.project, ".planning/PRODUCT-BACKLOG.md"),
      largeBacklog.split("## Backlog list")[1] ?? "",
    );
    commitAll(origin.project, "long Board");
    git(origin.project, "push", "--quiet", "origin", "main");
    const card = await openBacklog(page, origin);
    await expectSettledPage(page);
    await reviewChanges(card).click();
    const panel = reviewRegion(page, { exact: true });
    await expect(panel.getByRole("heading", { level: 2 })).toHaveText(
      "Story A",
    );
    const banner = parts(page).banner;
    const region = boardScroll(page);
    if (viewport.width === 700) {
      await expectCoveringFillsWindow(panel, parts(page));
      await closeSidePanel(panel);
      await expect(banner).toBeVisible();
      const firstTop = (await box(card)).y;
      await wheelBy(page, 600);
      expect((await box(card)).y).toBeLessThan(firstTop - 500);
      await expectDocumentStill(page);
      return;
    }
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
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight),
    ).toBe(viewport.height);
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
}

test("the agent roster scrolls below its stationary banner without scrolling the document", async ({
  page,
}) => {
  await page.setViewportSize({ width: 700, height: 800 });
  await publishRosterOrigins(page);
  await openUntilRead(page, "/?project=open-dough&view=roster");
  const { banner } = parts(page);
  const { members } = rosterParts(page);
  const region = page.locator(".roster-scroll");
  const before = await box(banner);
  const at = await box(region);
  await page.mouse.move(at.x + at.width / 2, at.y + at.height / 2);
  await page.mouse.wheel(0, 600);
  await expect
    .poll(() => region.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  expect(await box(banner)).toEqual(before);
  await expectDocumentStill(page);
  await members.last().scrollIntoViewIfNeeded();
  await expect(members.last()).toBeInViewport({ ratio: 1 });
  await expectDocumentStill(page);
});

test("a classic Board scrollbar's width owns the Column boundary and keeps a saved position", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1152, height: 800 });
  await page.addInitScript(() => {
    // A classic track, as on hosts without overlay scrollbars, whatever
    // this host's own scrollbar style.
    document.addEventListener("DOMContentLoaded", () => {
      const track = document.createElement("style");
      track.textContent = ".board-scroll::-webkit-scrollbar { width: 15px; }";
      document.head.append(track);
    });
    if (localStorage.getItem("open-dough.board.position") === null)
      localStorage.setItem("open-dough.board.position", "1");
  });
  await publishLargeBacklog(page);
  await page.goto("/");
  await expectSettledPage(page);
  const room = await boardScroll(page).evaluate((element) => {
    const board = element.querySelector(".board");
    if (!board) throw new Error("No Board in its scroll region");
    return {
      board: element.clientWidth,
      page: element.closest(".page-column")?.clientWidth,
      shown: getComputedStyle(board).getPropertyValue("--columns-shown"),
    };
  });
  await testInfo.attach("native Board room", {
    body: JSON.stringify(room),
    contentType: "application/json",
  });
  expect(room.board).toBeLessThan(1152);
  await expectView(page, ["Taken", "Recently done"], ["Backlog 16 entries"]);
  expect(
    await page.evaluate(() =>
      localStorage.getItem("open-dough.board.position"),
    ),
  ).toBe("1");
  await page.reload();
  await expectView(page, ["Taken", "Recently done"], ["Backlog 16 entries"]);
});
