// A story review in the Side panel keeps its selected file and reads while
// its width is chosen, Maximized and narrowed by the Sessions sidebar; the
// terminal's side of the same width is ./side-panel-width.spec.ts.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { fileDiff, listedFile } from "../../tests/support/reviewTreeRows.ts";
import { frontendFileDiff } from "../../tests/support/frontendStoryReview.ts";
import { box, expectSideBySideInOrder } from "../../tests/pageLayout.ts";
import { sessionsSidebarParts } from "../../tests/sessionsSidebarPage.ts";
import {
  dragDivider,
  expectWidth,
  focusDivider,
  keyStep,
  panelDivider,
  pressDividerKey,
  recordReviewReads,
  split,
  usableMinimum,
} from "../../tests/sidePanelWidthPage.ts";
import {
  maximizeSidePanel,
  restoreSidePanel,
} from "../../tests/sidePanelFrame.ts";
import {
  openReview,
  takenStoryWithReview,
} from "../../tests/support/frontendSidePanelWidth.ts";

test("a review resized and maximized keeps its reads, and the open sidebar narrows the room without losing the chosen width", async ({
  page,
  frontendServices,
}) => {
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
  const start = await split(page, review);
  const room = start.pageColumn + start.sidePanel;
  const maximum = Math.floor(room - usableMinimum);
  await listedFile(review, "Modified unstaged.txt").click();
  const diff = fileDiff(review, "Modified unstaged.txt");
  await expect(diff).toContainText("+more wide");
  expect(reads.length).toBeGreaterThan(1);
  const readsBefore = reads.length;

  await test.step("resizing and maximizing keeps the review's reads and the Sessions toggle available", async () => {
    await dragDivider(page, 160);
    await expectWidth(review, Math.round(room / 2) - 160);
    await focusDivider(page);
    await pressDividerKey(page, "ArrowLeft");
    await expectWidth(review, Math.round(room / 2) - 160 + keyStep);
    await maximizeSidePanel(review);
    await expect(panelDivider(page)).toHaveCount(0);
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
    await expectWidth(review, Math.round(room / 2) - 160 + keyStep);
    await expect(diff).toContainText("+more wide");
    expect(reads.length).toBe(readsBefore);
  });

  await test.step("the open sidebar narrows the room without losing the chosen width, which is used again when it closes", async () => {
    await focusDivider(page);
    await pressDividerKey(page, "ArrowLeft", 40);
    await expectWidth(review, maximum);
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeVisible();
    await expectSideBySideInOrder([
      sidebar.sidebar,
      page.locator(".page-column"),
      review,
    ]);
    const roomBeside = room - (await box(sidebar.sidebar)).width;
    const besideMaximum = Math.floor(roomBeside - usableMinimum);
    await expectWidth(review, besideMaximum);
    const beside = await split(page, review);
    expect(beside.pageColumn + beside.sidePanel).toBeCloseTo(roomBeside, 0);
    expect(beside.pageColumn).toBeGreaterThanOrEqual(usableMinimum - 0.5);
    await expect(panelDivider(page)).toHaveAttribute(
      "aria-valuemax",
      String(besideMaximum),
    );
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeHidden();
    await expectWidth(review, maximum);

    await sidebar.button.click();
    await expectWidth(review, besideMaximum);
    await dragDivider(page, 2000);
    await expectWidth(review, usableMinimum);
    await focusDivider(page);
    await pressDividerKey(page, "ArrowLeft", 3);
    await expectWidth(review, usableMinimum + 3 * keyStep);
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeHidden();
    await expectWidth(review, usableMinimum + 3 * keyStep);
  });
});
