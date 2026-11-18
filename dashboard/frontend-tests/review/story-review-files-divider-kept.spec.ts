// The Files divider's chosen width serves every review opened afterwards in
// this browser, also after a reload. An unusable kept value and refused
// storage each leave the sidebar at 16rem (shared parsing and refusal:
// ../navigation/side-panel-width-kept.spec.ts). Until a choice is kept, the
// sidebar is 16rem and nothing is kept
// (./story-review-files-divider.spec.ts first step). The divider's own
// resizing is ./story-review-files-divider.spec.ts.

import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  filesDividerOf,
  keepFilesWidth,
  rem,
} from "../../tests/filesDividerPage.ts";
import { watchPageErrors } from "../../tests/pageErrors.ts";
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

test("an unusable kept file sidebar width gives 16rem", async ({
  page,
  frontendServices,
}) => {
  await takenStoryWithReview(page, frontendServices);
  const errors = watchPageErrors(page);
  await keepFilesWidth(page, "wide");
  const files = filesDividerOf(await reloadAndOpenReview(page));
  await files.showsSidebarWidth(16 * rem);
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
  await files.showsSidebarWidth(16 * rem);
  await files.drag(48);
  await files.showsSidebarWidth(16 * rem + 48);
  expect(errors).toEqual([]);
});
