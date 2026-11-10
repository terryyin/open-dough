// Touch review journeys: opening story A's large comparison by touch, then
// tap-sized controls and pane reading. Kept context through rotation and
// panel controls is ./storyReviewTouchContext.ts; uncommitted comparison
// ownership stays with story-review-uncommitted-check.spec.ts.
import { writeFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { expectSettledPage } from "../dashboardPage.ts";
import { box, tapWhereShown } from "../pageLayout.ts";
import { scrollByTouch } from "../touchGestures.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { expect } from "./preparationPage.ts";
import { contextValues, fileBrowser, reviewBody } from "./reviewContextLine.ts";
import {
  boxes,
  overflows,
  pageFits,
  scrollLeftOf,
  scrollTopOf,
} from "./reviewPanes.ts";
import { expectReviewRead } from "./reviewRead.ts";
import {
  chooseLargeChangesCommitByTouch,
  codePartGeometry,
  readCodePartByTouch,
  readContextByTouch,
  reachReviewControl,
  selectAddedFileByTouch,
  visibleShortCodeLine,
} from "./reviewTouchReading.ts";
import { openBacklog } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { keepLaunchRecord } from "./storyLaunchRecord.ts";
import { uncommittedLabel } from "./storyReviewMark.ts";
import { largeWorktree, longA } from "./storyReviewWorktree.ts";

// Opens story A's large real comparison by touch, its review focused.
export async function openReviewByTouch(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
  firstWideLine?: string,
) {
  const { workspace } = largeWorktree(origin, firstWideLine);
  writeFileSync(path.join(workspace, "touch-uncommitted.txt"), "uncommitted\n");
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await expectSettledPage(page);
  const action = card.getByRole("button", { name: "Review changes" });
  await action.scrollIntoViewIfNeeded();
  await tapWhereShown(action);
  const review = page.getByRole("region", { name: "Story review" });
  await expect(reviewBody(review)).toBeFocused();
  await expectReviewRead(review);
  const browser = fileBrowser(review);
  await expect(
    browser.getByRole("list", { name: "64 changed files" }),
  ).toBeVisible();
  const comparison = review.getByRole("radiogroup", { name: "Comparison" });
  const all = comparison.locator("label", { hasText: "All changes" });
  return { action, review, browser, comparison, all };
}

export type TouchReview = Awaited<ReturnType<typeof openReviewByTouch>>;

// After the large-changes commit, All changes by touch, then the long file.
export async function chooseAllChangesFileByTouch({
  review,
  browser,
  comparison,
  all,
}: TouchReview) {
  await chooseLargeChangesCommitByTouch(review, browser);
  await reachReviewControl(review, all);
  await tapWhereShown(all);
  await expect(
    comparison.getByRole("radio", { name: "All changes" }),
  ).toBeChecked();
  return selectAddedFileByTouch(review, longA);
}

export async function chooseComparisonAndReadByTouch(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  // Still wider than either touch pane, with distinct ends to identify the
  // text reached by native scrolling without a needlessly long round trip.
  const wideLine = `beginning: ${"wide ".repeat(20)}actual line end`;
  const opened = await openReviewByTouch(page, dashboard, origin, wideLine);
  const { review, browser, comparison, all } = opened;
  const commits = comparison.locator("label", { hasText: "Commits" });
  const folder = browser.getByRole("button", { name: /^many\b/ });
  const label = uncommittedLabel(review);
  for (const target of [contextValues(review), all, commits, folder, label]) {
    expect(
      (await box(target)).height,
      await target.innerText(),
    ).toBeGreaterThanOrEqual(44);
  }
  await readContextByTouch(review, "~/git/open-dough/.worktrees/story-a");
  await reachReviewControl(review, folder);
  await tapWhereShown(folder);
  await expect(folder).toHaveAttribute("aria-expanded", "false");
  await reachReviewControl(review, folder);
  await tapWhereShown(folder);
  await expect(folder).toHaveAttribute("aria-expanded", "true");
  const diff = await chooseAllChangesFileByTouch(opened);
  const code = diff.locator(".story-review-code");
  await expect(code).toContainText("+first 0");
  await expect(code).toContainText(`+${wideLine}`);
  expect((await box(code)).height).toBeGreaterThanOrEqual(44);
  expect((await overflows(code)).sideways).toBe(true);
  const fixed = [
    review.locator(".side-panel-header"),
    review.locator(".story-review-top"),
    diff.getByRole("heading"),
  ];
  const before = await boxes(fixed);
  const browserAt = await scrollTopOf(browser);
  const wide = code.locator(".story-review-line", { hasText: wideLine });
  await readCodePartByTouch(page, code, wide, 0, 11, "vertical");
  const beginning = await codePartGeometry(wide, 0, 11);
  expect(beginning.text).toBe(`+${wideLine}`.slice(0, 11));
  expect(
    beginning.visible,
    "the long line's beginning is read within the diff",
  ).toBe(true);
  await expect.poll(() => scrollTopOf(code)).toBeGreaterThan(0);
  const renderedLine = await wide.innerText();
  expect(renderedLine).toBe(`+${wideLine}`);
  const length = renderedLine.length;
  expect((await codePartGeometry(wide, length - 15, length)).visible).toBe(
    false,
  );
  await readCodePartByTouch(
    page,
    code,
    wide,
    length - 15,
    length,
    "horizontal",
  );
  const ending = await codePartGeometry(wide, length - 15, length);
  expect(ending.text).toBe(wideLine.slice(-15));
  expect(ending.visible, "the long line's ending is read within the diff").toBe(
    true,
  );
  await expect.poll(() => scrollLeftOf(code)).toBeGreaterThan(0);
  expect(await scrollTopOf(browser)).toBe(browserAt);
  expect(await boxes(fixed)).toEqual(before);
  expect(await pageFits(page)).toBe(true);
  await readCodePartByTouch(page, code, wide, 0, 11, "horizontal");
  expect((await codePartGeometry(wide, 0, 11)).visible).toBe(true);
  await scrollByTouch(page, code, 1000, "vertical", undefined, code);
  const readLine = await visibleShortCodeLine(code);
  const readText = readLine.text ?? "";
  expect(readText).toMatch(/^\+first [0-9]+$/);
  expect(
    (
      await codePartGeometry(
        code.locator(`[data-new="${readLine.number}"]`),
        0,
        readText.length,
      )
    ).visible,
  ).toBe(true);
  const codeBeforeBrowserScroll = await scrollTopOf(code);
  await scrollByTouch(page, browser, 100);
  await expect.poll(() => scrollTopOf(browser)).toBeLessThan(browserAt);
  expect(await scrollTopOf(code)).toBe(codeBeforeBrowserScroll);
  expect(await boxes(fixed)).toEqual(before);
}
