// One touch review journey: tap-sized controls, pane reading, kept context
// through rotation. Uncommitted comparison ownership stays with
// story-review-uncommitted-check.spec.ts.
import { writeFileSync } from "node:fs";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { expectSettledPage } from "../dashboardPage.ts";
import { box, tapWhereShown } from "../pageLayout.ts";
import { expectCovering, resizeUntilArranged } from "../sidePanelWidthPage.ts";
import { scrollByTouch } from "../touchGestures.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { expect } from "./preparationPage.ts";
import {
  contextValues,
  fileBrowser,
  reviewBody,
  reviewFeedback,
} from "./reviewContextLine.ts";
import {
  boxes,
  overflows,
  pageFits,
  scrollLeftOf,
  scrollTopOf,
} from "./reviewPanes.ts";
import {
  codePartGeometry,
  leaveUncommittedOutByTouchLabel,
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
import {
  largeWorktree,
  longA,
  longB,
  wideLine,
} from "./storyReviewWorktree.ts";

const control = (review: Locator, name: string) =>
  review.getByRole("button", { name, exact: true });
export async function chooseComparisonAndKeepContextThroughTouch(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
  portrait: { width: number; height: number },
  landscape: { width: number; height: number },
) {
  const { workspace } = largeWorktree(origin);
  writeFileSync(path.join(workspace, "touch-uncommitted.txt"), "uncommitted\n");
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await expectSettledPage(page);
  const action = card.getByRole("button", { name: "Review changes" });
  await action.scrollIntoViewIfNeeded();
  await tapWhereShown(action);
  const review = page.getByRole("region", { name: "Story review" });
  await expect(reviewBody(review)).toBeFocused();
  const browser = fileBrowser(review);
  await expect(
    browser.getByRole("list", { name: "64 changed files" }),
  ).toBeVisible();
  const comparison = review.getByRole("radiogroup", { name: "Comparison" });
  const all = comparison.locator("label", { hasText: "All changes" });
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
  await reachReviewControl(review, commits);
  await tapWhereShown(commits);
  await expect(
    comparison.getByRole("radio", { name: "Commits", exact: true }),
  ).toBeChecked();
  await expect(
    review.getByRole("region", { name: "Story commits" }),
  ).toBeVisible();
  const commit = review
    .getByRole("region", { name: "Story commits" })
    .getByRole("button", { name: /large changes/ });
  await commit.scrollIntoViewIfNeeded();
  await tapWhereShown(commit);
  await reachReviewControl(review, all);
  await tapWhereShown(all);
  await expect(
    comparison.getByRole("radio", { name: "All changes" }),
  ).toBeChecked();
  const diff = await selectAddedFileByTouch(review, longA);
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
  const length = wideLine.length + 1;
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
  await scrollByTouch(page, code, 1000);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => {
          resolve();
        }),
      ),
  );
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
  const selected = browser.getByRole("button", { name: `Added ${longA}` });
  const codeAt = await scrollTopOf(code);
  let reads = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === storyReviewEndpoint) reads += 1;
  });
  for (const viewport of [landscape, portrait]) {
    await resizeUntilArranged(review, viewport);
    await expect(selected).toHaveAttribute("aria-pressed", "true");
    await expect(
      comparison.getByRole("radio", { name: "All changes" }),
    ).toBeChecked();
    expect(await scrollTopOf(code)).toBe(codeAt);
    expect((await box(code)).height).toBeGreaterThanOrEqual(40);
    expect(await pageFits(page)).toBe(true);
    if (viewport.width <= 800) await expectCovering(review);
    else {
      await tapWhereShown(control(review, "Maximize"));
      await expect(control(review, "Restore")).toBeVisible();
      expect(await scrollTopOf(code)).toBe(codeAt);
      await tapWhereShown(control(review, "Restore"));
      await expect(control(review, "Maximize")).toBeVisible();
      expect(await scrollTopOf(code)).toBe(codeAt);
    }
  }
  expect(reads).toBe(0);
  const browserBeforeHide = await scrollTopOf(browser);
  await tapWhereShown(control(review, "Hide files"));
  await expect(browser).toBeHidden();
  expect(await scrollTopOf(code)).toBe(codeAt);
  await tapWhereShown(control(review, "Show files"));
  await expect(selected).toHaveAttribute("aria-pressed", "true");
  expect(await scrollTopOf(browser)).toBe(browserBeforeHide);
  expect(await scrollTopOf(code)).toBe(codeAt);
  await tapWhereShown(control(review, "Next file"));
  const next = review.getByRole("region", { name: `Added ${longB}` });
  await expect(next.locator(".story-review-code")).toContainText("+second 0");
  expect(await scrollTopOf(next.locator(".story-review-code"))).toBe(0);
  await tapWhereShown(control(review, "Refresh"));
  await expect(reviewFeedback(review)).toHaveText(
    /^Review refreshed: 64 changed files against baseline [0-9a-f]{7}\.$/,
  );
  await expect(
    browser.getByRole("button", { name: `Added ${longB}` }),
  ).toHaveAttribute("aria-pressed", "true");
  // Hidden files: explicit Commits and its reading place survive rotation.
  await reachReviewControl(review, commits);
  await tapWhereShown(commits);
  await expect(
    comparison.getByRole("radio", { name: "Commits", exact: true }),
  ).toBeChecked();
  await expect(reviewFeedback(review)).toHaveText(
    "Review refreshed: 64 changed files in the chosen range.",
  );
  await selectAddedFileByTouch(review, longB);
  await tapWhereShown(control(review, "Hide files"));
  const nextCode = next.locator(".story-review-code");
  await scrollByTouch(page, nextCode, -180);
  await expect.poll(() => scrollTopOf(nextCode)).toBeGreaterThan(0);
  const nextAt = await scrollTopOf(nextCode);
  await resizeUntilArranged(review, landscape);
  await expect(
    comparison.getByRole("radio", { name: "Commits", exact: true }),
  ).toBeChecked();
  await expect(next.getByRole("heading")).toHaveText(`Added ${longB}`);
  expect(await scrollTopOf(nextCode)).toBe(nextAt);
  expect((await box(nextCode)).height).toBeGreaterThanOrEqual(44);
  expect(await pageFits(page)).toBe(true);
  await leaveUncommittedOutByTouchLabel(page, review, browser, portrait);
  await tapWhereShown(control(review, "Close"));
  await expect(review).toHaveCount(0);
  await expect(action).toBeFocused();
  expect(await pageFits(page)).toBe(true);
}
