// The Files divider's chosen width serves every review opened afterwards in
// this browser, also after a reload; until one is chosen the sidebar is 16rem
// and nothing is kept. The divider's own resizing is
// ./story-review-files-divider.spec.ts.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { filesDividerOf, rem } from "../../tests/filesDividerPage.ts";
import {
  anotherStoryWithReview,
  openAnotherStoryReview,
  openReview,
  reloadAndOpenReview,
  takenStoryWithReview,
} from "../../tests/support/frontendSidePanelWidth.ts";

test("the chosen file sidebar width serves another story's review and a reload", async ({
  page,
  frontendServices,
}) => {
  anotherStoryWithReview(frontendServices);
  await takenStoryWithReview(page, frontendServices);
  const review = await openReview(page);
  const files = filesDividerOf(review);
  // A browser with no choice: 16rem, and opening the review keeps nothing.
  await files.showsSidebarWidth(16 * rem);
  expect(await files.keptWidth()).toBeNull();
  await files.press("ArrowRight", 3);
  await files.showsSidebarWidth(19 * rem);
  expect(await files.keptWidth()).toBe(String(19 * rem));

  await test.step("another story's review opens at the chosen width", async () => {
    const other = filesDividerOf(await openAnotherStoryReview(page, review));
    await other.showsSidebarWidth(19 * rem);
  });

  await test.step("a reload keeps the chosen width", async () => {
    await filesDividerOf(await reloadAndOpenReview(page)).showsSidebarWidth(
      19 * rem,
    );
  });
});
