// A review's Files divider resizes its file sidebar against the diff, within
// both panes' minimums, by drag and by Left and Right; hiding the files removes
// it. The kept width across reviews and reloads is
// ./story-review-files-divider-kept.spec.ts.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { filesDividerOf, rem } from "../../tests/filesDividerPage.ts";
import {
  openReview,
  takenStoryWithReview,
} from "../../tests/support/frontendSidePanelWidth.ts";

test("the Files divider resizes the file sidebar against the diff within both minimums", async ({
  page,
  frontendServices,
}) => {
  await takenStoryWithReview(page, frontendServices);
  const files = filesDividerOf(await openReview(page));
  const start = await files.widths();
  expect(start.sideBySide).toBe(true);
  const maximum = Math.floor(start.room - 18 * rem);

  await test.step("it says the sidebar's 16rem width and bounds and how to use it", async () => {
    await files.showsSidebarWidth(16 * rem);
    await expect(files.divider).toHaveAttribute(
      "aria-valuemin",
      String(12 * rem),
    );
    await expect(files.divider).toHaveAttribute(
      "aria-valuemax",
      String(maximum),
    );
    await expect(files.divider).toHaveAttribute(
      "title",
      "Drag, or use Left and Right, to resize the file sidebar",
    );
    await files.isTheOnlyFilesDivider();
    expect(await files.keptWidth()).toBeNull();
  });

  await test.step("dragging rightward widens the sidebar and narrows the diff by the same width", async () => {
    await files.drag(48);
    await files.showsSidebarWidth(16 * rem + 48);
    const dragged = await files.widths();
    expect(dragged.diff).toBeCloseTo(start.diff - 48, 0);
  });

  await test.step("Right widens it one step and Left narrows it back", async () => {
    await files.press("ArrowRight");
    await files.showsSidebarWidth(17 * rem + 48);
    await files.press("ArrowLeft");
    await files.showsSidebarWidth(16 * rem + 48);
  });

  await test.step("neither pane goes below its minimum", async () => {
    await files.drag(4000);
    await files.showsSidebarWidth(maximum);
    expect((await files.widths()).diff).toBeCloseTo(start.room - maximum, 0);
    await files.press("ArrowRight");
    await files.showsSidebarWidth(maximum);
    await files.drag(-4000);
    await files.showsSidebarWidth(12 * rem);
    await files.press("ArrowLeft");
    await files.showsSidebarWidth(12 * rem);
  });

  await test.step("hiding the files removes the divider and showing returns both at the chosen width", async () => {
    await files.press("ArrowRight", 2);
    await files.setFilesShown(false);
    await expect(files.divider).toHaveCount(0);
    const hidden = await files.hiddenSidebarWidths();
    expect(hidden.diff).toBeCloseTo(hidden.workarea, 0);
    await files.setFilesShown(true);
    await files.showsSidebarWidth(14 * rem);
  });
});
