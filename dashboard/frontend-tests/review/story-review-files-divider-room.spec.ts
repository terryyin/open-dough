// The Side panel's room limits the review's file sidebar without changing its
// kept width: narrowed, the sidebar is as wide as the diff's 18rem allows;
// widened or maximized, the kept width returns and the Files divider's upper
// bound grows; too narrow, the panes stack with no divider. Reaching that
// upper bound is an explicit page-object step. The divider's own resizing is
// ./story-review-files-divider.spec.ts.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { filesDividerOf, rem } from "../../test-support/filesDividerPage.ts";
import { dragDivider } from "../../test-support/sidePanelWidthPage.ts";
import {
  maximizeSidePanel,
  restoreSidePanel,
} from "../../test-support/sidePanelFrame.ts";
import { openSessionReviewForWidth } from "../../test-support/support/frontendSidePanelWidth.ts";

test("the Side panel's room limits the file sidebar while its chosen width stays kept", async ({
  page,
  frontendServices,
}) => {
  const opened = await openSessionReviewForWidth(page, frontendServices);
  await opened.expectComparisonNamed("Session commits");
  const review = opened.frame.partsToMeasure().panel;
  const files = filesDividerOf(review);
  const chosen = await files.dragToUpperBound();
  await files.showsSidebarWidth(chosen);
  expect(await files.keptWidth()).toBe(String(chosen));

  await test.step("a narrowed Side panel fits the sidebar to the diff's 18rem and keeps the chosen width", async () => {
    await dragDivider(page, 60);
    await files.showsSidebarWidth(chosen - 60);
    const narrowed = await files.widths();
    expect(narrowed.sideBySide).toBe(true);
    expect(narrowed.diff).toBeCloseTo(18 * rem, 0);
    expect(await files.keptWidth()).toBe(String(chosen));
  });

  await test.step("widened again, the chosen width returns without choosing again", async () => {
    await dragDivider(page, -60);
    await files.showsSidebarWidth(chosen);
    expect(await files.keptWidth()).toBe(String(chosen));
  });

  await test.step("maximized, the divider's upper bound grows and a wider drag is accepted", async () => {
    await maximizeSidePanel(review);
    await files.showsSidebarWidth(chosen);
    await expect.poll(() => files.upperBound()).toBeGreaterThan(chosen);
    const grown = await files.upperBound();
    expect(grown).toBe(Math.floor((await files.widths()).room - 18 * rem));
    await files.drag(48);
    await files.showsSidebarWidth(chosen + 48);
    await files.drag(-48);
    await files.showsSidebarWidth(chosen);
    await restoreSidePanel(review);
    await files.showsSidebarWidth(chosen);
  });

  await test.step("narrowed until the panes stack, the files sit above the diff with no divider", async () => {
    await dragDivider(page, 400);
    await files.isStackedAboveTheDiff();
    expect(await files.keptWidth()).toBe(String(chosen));
  });

  await test.step("widened out of stacking, the divider returns at the chosen width", async () => {
    await dragDivider(page, -400);
    await expect(files.divider).toBeVisible();
    await files.showsSidebarWidth(chosen);
    expect((await files.widths()).sideBySide).toBe(true);
  });
});
