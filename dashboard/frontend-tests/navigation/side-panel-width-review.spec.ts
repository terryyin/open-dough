// A story review in the Side panel keeps its selected file and reads while
// its width is chosen, Maximized and narrowed by the Sessions sidebar; the
// terminal's side of the same width is ./side-panel-width.spec.ts.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  fileDiff,
  listedFile,
} from "../../test-support/support/reviewTreeRows.ts";
import { frontendFileDiff } from "../../test-support/support/frontendStoryReview.ts";
import { box, expectSideBySideInOrder } from "../../test-support/pageLayout.ts";
import { sessionsSidebarParts } from "../../test-support/sessionsSidebarPage.ts";
import {
  recordReviewReads,
  sidePanelWidthPage,
} from "../../test-support/sidePanelWidthPage.ts";
import {
  maximizeSidePanel,
  restoreSidePanel,
} from "../../test-support/sidePanelFrame.ts";
import {
  openReview,
  takenStoryWithReview,
} from "../../test-support/support/frontendSidePanelWidth.ts";

test("a review resized and maximized keeps its reads, and the open sidebar narrows the room without losing the chosen width", async ({
  page,
  frontendServices,
}) => {
  const width = sidePanelWidthPage(page);
  const answers = await takenStoryWithReview(page, frontendServices, {
    files: [
      { kind: "added", path: "story.txt", lines: { added: 1, removed: 0 } },
      {
        kind: "modified",
        path: "unstaged.txt",
        lines: { added: 1, removed: 0 },
      },
    ],
  });
  answers.answerFile(
    frontendFileDiff("unstaged.txt", ["more wide"]),
    "unstaged.txt",
  );
  const reads = recordReviewReads(page);
  const review = await openReview(page);
  const sidebar = sessionsSidebarParts(page);
  const start = await width.split(review);
  const room = start.pageColumn + start.sidePanel;
  const maximum = Math.floor(room - width.usableMinimum);
  await listedFile(review, "Modified unstaged.txt").click();
  const diff = fileDiff(review, "Modified unstaged.txt");
  await expect(diff).toContainText("+more wide");
  expect(reads.length).toBeGreaterThan(1);
  const readsBefore = reads.length;

  await test.step("resizing and maximizing keeps the review's reads and the Sessions toggle available", async () => {
    await width.dragDivider(160);
    await width.expectWidth(review, Math.round(room / 2) - 160);
    await width.focusDivider();
    await width.pressDividerKey("ArrowLeft");
    await width.expectWidth(review, Math.round(room / 2) - 160 + width.keyStep);
    await maximizeSidePanel(review);
    await expect(width.divider).toHaveCount(0);
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeVisible();
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeHidden();
    await expect(listedFile(review, "Modified unstaged.txt")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(diff).toContainText("+more wide");
    await restoreSidePanel(review);
    await width.expectWidth(review, Math.round(room / 2) - 160 + width.keyStep);
    await expect(diff).toContainText("+more wide");
    expect(reads.length).toBe(readsBefore);
  });

  await test.step("the open sidebar narrows the room without losing the chosen width, which is used again when it closes", async () => {
    await width.focusDivider();
    await width.pressDividerKey("ArrowLeft", 40);
    await width.expectWidth(review, maximum);
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeVisible();
    await expectSideBySideInOrder([
      sidebar.sidebar,
      page.locator(".page-column"),
      review,
    ]);
    const roomBeside = room - (await box(sidebar.sidebar)).width;
    const besideMaximum = Math.floor(roomBeside - width.usableMinimum);
    await width.expectWidth(review, besideMaximum);
    const beside = await width.split(review);
    expect(beside.pageColumn + beside.sidePanel).toBeCloseTo(roomBeside, 0);
    expect(beside.pageColumn).toBeGreaterThanOrEqual(width.usableMinimum - 0.5);
    await expect(width.divider).toHaveAttribute(
      "aria-valuemax",
      String(besideMaximum),
    );
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeHidden();
    await width.expectWidth(review, maximum);

    await sidebar.button.click();
    await width.expectWidth(review, besideMaximum);
    await width.dragDivider(2000);
    await width.expectWidth(review, width.usableMinimum);
    await width.focusDivider();
    await width.pressDividerKey("ArrowLeft", 3);
    await width.expectWidth(review, width.usableMinimum + 3 * width.keyStep);
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeHidden();
    await width.expectWidth(review, width.usableMinimum + 3 * width.keyStep);
  });
});
