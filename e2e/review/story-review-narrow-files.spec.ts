// A published session review whose fixed pair changes more files than the
// file browser holds and files longer than the diff shows
// (../../dashboard/test-support/support/storyReviewWorktree.ts), in a panel
// narrowed to cover the page. The diff keeps the whole work area and Files
// lies over it as a drawer that scrolls on its own; closing the drawer
// returns the same diff. The wide panes: ./story-review-panes.spec.ts.

import { sidePanelPages } from "../../dashboard/test-support/sidePanelPages.ts";
import { expectCovering } from "../../dashboard/test-support/sidePanelFrame.ts";
import { narrowWindow } from "../../dashboard/test-support/accessibleReading.ts";
import { box } from "../../dashboard/test-support/pageLayout.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  expectDrawerOver,
  expectSpansWorkarea,
  largeReviewRepository,
  openLargeReview,
  overflows,
  scrollPane,
  scrollTopOf,
} from "../../dashboard/test-support/support/reviewPanes.ts";
import { longA } from "../../dashboard/test-support/support/largeReviewFiles.ts";

test.use({ originRepository: largeReviewRepository });

test("in a narrow panel Files opens over the whole diff as a drawer, scrolls on its own, and closing it returns the same diff", async ({
  page,
  origin,
}) => {
  const {
    browser,
    diffOf,
    codeOf,
    opened: review,
    session,
  } = await openLargeReview(page, origin);
  await page.setViewportSize(narrowWindow);
  const { body, workarea, panel } = review.frame.partsToMeasure();
  await expectCovering(panel);
  const nameA = `Added ${longA}`;
  const diff = diffOf(nameA);
  const code = codeOf(nameA);

  const under =
    await test.step("a newly narrow review starts with the diff in the whole work area", async () => {
      await review.expectFilesShown(false);
      expect((await overflows(body)).down).toBe(false);
      return expectSpansWorkarea(diff, workarea);
    });

  await test.step("Files lies over the diff, leaving room beside it, and the diff keeps its bounds", async () => {
    await (await review.showFiles()).expectFilesShown(true);
    await expectDrawerOver(browser, workarea);
    expect(await box(diff)).toEqual(under);
  });

  await test.step("the drawer and the code each scroll on their own", async () => {
    expect(await scrollPane(browser, 80)).toBe(80);
    expect(await scrollPane(code, 600)).toBe(600);
    expect(await scrollTopOf(browser)).toBe(80);
  });

  await test.step("Hide files returns the same diff", async () => {
    await review.hideFiles();
    await review.expectFilesShown(false);
    await expect(diff).toBeVisible();
  });
  await review.close("keyboard");
  await sidePanelPages(page).phase(
    "keyboard Close returns focus to the session entry",
    ({ board }) => board.expectPublishedReviewFocused(session),
  );
});
