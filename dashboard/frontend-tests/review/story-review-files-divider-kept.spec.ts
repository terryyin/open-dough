// The Files divider's chosen width serves every review opened afterwards in
// this browser, also after a reload; until one is chosen the sidebar is 16rem
// and nothing is kept, as it is with an unusable kept width or a browser that
// refuses storage. The divider's own resizing is
// ./story-review-files-divider.spec.ts.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  filesDividerOf,
  keepFilesWidth,
  rem,
} from "../../test-support/filesDividerPage.ts";
import { watchPageErrors } from "../../test-support/pageErrors.ts";
import { reviewRegion } from "../../test-support/support/reviewControls.ts";
import {
  anotherStoryWithReview,
  openAnotherStoryReview,
  openReview,
  reloadAndOpenReview,
  takenStoryWithReview,
} from "../../test-support/support/frontendSidePanelWidth.ts";

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

test("an unusable kept file sidebar width gives 16rem and the next choice is kept", async ({
  page,
  frontendServices,
}) => {
  await takenStoryWithReview(page, frontendServices);
  const errors = watchPageErrors(page);
  for (const malformed of ["wide", "0", "Infinity"]) {
    await test.step(`kept as ${JSON.stringify(malformed)}`, async () => {
      await keepFilesWidth(page, malformed);
      const files = filesDividerOf(await reloadAndOpenReview(page));
      await files.showsSidebarWidth(16 * rem);
    });
  }
  const files = filesDividerOf(reviewRegion(page, { exact: true }));
  await files.press("ArrowRight");
  await files.showsSidebarWidth(17 * rem);
  await filesDividerOf(await reloadAndOpenReview(page)).showsSidebarWidth(
    17 * rem,
  );
  expect(errors).toEqual([]);
});

test("where the browser refuses storage, the sidebar is 16rem and resizes for the page's lifetime without error", async ({
  page,
  frontendServices,
}) => {
  await page.addInitScript(() => {
    const refused = () => {
      throw new DOMException("Storage is refused.", "SecurityError");
    };
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: refused,
    });
  });
  const errors = watchPageErrors(page);
  await takenStoryWithReview(page, frontendServices);
  const files = filesDividerOf(await openReview(page));
  await expect(files.keptWidth()).rejects.toThrow("Storage is refused.");
  await files.showsSidebarWidth(16 * rem);
  await files.drag(48);
  await files.showsSidebarWidth(16 * rem + 48);
  await files.press("ArrowRight");
  await files.showsSidebarWidth(17 * rem + 48);
  await filesDividerOf(await reloadAndOpenReview(page)).showsSidebarWidth(
    16 * rem,
  );
  expect(errors).toEqual([]);
});
