// The Side panel's room limits the review's file sidebar without changing its
// kept width: narrowed, the sidebar is as wide as the diff's 18rem allows;
// widened or maximized, the kept width returns and the Files divider's upper
// bound grows; too narrow, the panes stack with no divider. The divider's own
// resizing is ../review/story-review-files-divider.spec.ts.
import { expect, onTestFinished, test } from "vitest";
import {
  forgetFilesWidth,
  keptFilesWidth,
  rem,
  reviewFilesDivider,
} from "../review/story-review-files-divider-view.ts";
import {
  button,
  drag,
  files,
  mountWidthReview,
  panel,
  withWidthStorage,
} from "./side-panel-width-view.ts";

const filesDivider = reviewFilesDivider(panel);
const upperBound = filesDivider.filesUpperBound;

test("the Side panel's room limits the file sidebar while its chosen width stays kept", async () => {
  withWidthStorage();
  forgetFilesWidth();
  onTestFinished(forgetFilesWidth);
  await mountWidthReview();
  await files.chooseFile("Modified unstaged.txt");
  await filesDivider.dragFilesDivider(1000);
  const chosen = upperBound();
  await filesDivider.expectSidebarWidth(chosen);
  expect(keptFilesWidth()).toBe(String(chosen));

  // Narrowed: the sidebar fits the diff's 18rem; the chosen width is kept.
  await drag(60);
  await filesDivider.expectSidebarWidth(chosen - 60);
  const narrowed = await filesDivider.filesWidths();
  expect(narrowed.sideBySide).toBe(true);
  expect(narrowed.diff).toBeCloseTo(18 * rem, 0);
  expect(keptFilesWidth()).toBe(String(chosen));

  // Widened again, the chosen width returns without choosing again.
  await drag(-60);
  await filesDivider.expectSidebarWidth(chosen);

  // Maximized, the upper bound grows and a wider drag is accepted.
  await button("Maximize").click();
  await filesDivider.expectSidebarWidth(chosen);
  await expect.poll(upperBound).toBeGreaterThan(chosen);
  expect(upperBound()).toBe(
    Math.floor((await filesDivider.filesWidths()).room - 18 * rem),
  );
  await filesDivider.dragFilesDivider(48);
  await filesDivider.expectSidebarWidth(chosen + 48);
  await filesDivider.dragFilesDivider(-48);
  await filesDivider.expectSidebarWidth(chosen);
  await button("Restore").click();
  await filesDivider.expectSidebarWidth(chosen);

  // Narrowed until the panes stack: files above the diff, no divider.
  await drag(400);
  await filesDivider.expectNoFilesDivider();
  await filesDivider.expectFilesAboveDiff();
  expect(keptFilesWidth()).toBe(String(chosen));

  // Widened out of stacking, the divider returns at the chosen width.
  await drag(-400);
  await filesDivider.expectSidebarWidth(chosen);
  expect((await filesDivider.filesWidths()).sideBySide).toBe(true);
});
