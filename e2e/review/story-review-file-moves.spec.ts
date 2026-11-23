// The Intent Changes reader moves through changed rows while keeping the
// keyboard on its file controls and revealing the destination in the tree.
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  longA,
  longB,
} from "../../dashboard/test-support/support/largeReviewFiles.ts";
import {
  largeReviewRepository,
  scrollPane,
  scrollTopOf,
  shownInPane,
} from "../../dashboard/test-support/support/reviewPanes.ts";
import {
  openIntentReviewChanges,
  type IntentReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import {
  nestedRepository,
  storyWorktree,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";

// The nested worktree's files in the browser's order.
const nestedOrder = [
  "Deleted dashboard/server/c.ts",
  "Added dashboard/src/a.tsx",
  "Modified dashboard/src/b.ts",
  "Added docs/adrs/drafts/0009-tree.md",
  "Renamed old/a.ts → new/a.ts",
  "Modified README.md",
] as const;

async function expectSelected(review: IntentReviewChanges, name: string) {
  await review.files.expectSelected(name);
  await expect(review.diffs.toRead(name)).toBeVisible();
  expect(await scrollTopOf(review.readingToMeasure())).toBe(0);
  return review.files.row(name);
}

test.describe("from nested changes", () => {
  test.use({ originRepository: nestedRepository });
  test("Previous file and Next file move through the browser's order", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    keepLaunchRecord(dashboard, workspace);
    const card = await openBacklog(page, origin);
    const review = await openIntentReviewChanges(page, card);
    const { files } = review;
    const browser = files.outsideToMeasure();
    const previous = files.moveControl("Previous file");
    const next = files.moveControl("Next file");
    await files.choose(nestedOrder[0]);
    await expectSelected(review, nestedOrder[0]);

    await test.step("Previous file is unavailable on the first file, yet focusable", async () => {
      await expect(previous).toHaveAttribute("aria-disabled", "true");
      await expect(next).toHaveAttribute("aria-disabled", "false");
      await previous.focus();
      await expect(previous).toBeFocused();
      await page.keyboard.press("Enter");
      await expectSelected(review, nestedOrder[0]);
    });

    await test.step("Next file walks the files in the browser's order to the last", async () => {
      for (const name of nestedOrder.slice(1)) {
        await files.move("Next file", "keyboard");
        await expectSelected(review, name);
        await expect(next).toBeFocused();
      }
      await expect(previous).toHaveAttribute("aria-disabled", "false");
    });

    await test.step("Next file is unavailable on the last file, yet focusable", async () => {
      await expect(next).toHaveAttribute("aria-disabled", "true");
      await next.focus();
      await expect(next).toBeFocused();
      await page.keyboard.press("Enter");
      await expectSelected(review, nestedOrder.at(-1) ?? "");
    });

    await test.step("Next file into a collapsed folder expands it and brings its first file into view", async () => {
      await files.choose("Modified dashboard/src/b.ts");
      await files.folder("docs/adrs/drafts").click();
      const folder = files.folder("docs/adrs/drafts");
      await expect(folder).toHaveAttribute("aria-expanded", "false");
      await next.click();
      const row = await expectSelected(review, nestedOrder[3]);
      await expect(files.folder("docs/adrs/drafts")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      await expect.poll(() => shownInPane(browser, row)).toBe(true);
    });

    await test.step("Previous file into a folder collapsed inside another expands both", async () => {
      await files.folder("src").click();
      await files.folder("dashboard").click();
      await expect(files.folder("dashboard")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await previous.click();
      const row = await expectSelected(review, nestedOrder[2]);
      for (const name of ["dashboard", "src"])
        await expect(files.folder(name)).toHaveAttribute(
          "aria-expanded",
          "true",
        );
      await expect.poll(() => shownInPane(browser, row)).toBe(true);
    });
  });
});

test.describe("from a large comparison", () => {
  test.use({ originRepository: largeReviewRepository });
  test("Next file to a file below the browser's fold scrolls the browser to it", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    keepLaunchRecord(dashboard, workspace);
    const review = await openIntentReviewChanges(
      page,
      await openBacklog(page, origin),
    );
    const { files } = review;
    const browser = files.outsideToMeasure();
    const reading = review.readingToMeasure();
    const next = files.moveControl("Next file");
    const nameA = `Added ${longA}`;
    const nameB = `Added ${longB}`;

    await test.step("each move shows the diff from the top", async () => {
      await files.choose(nameA);
      await review.diffs.expectLine(nameA, "+first 1");
      expect(await scrollPane(reading, 1500)).toBe(1500);
      await files.move("Next file", "keyboard");
      await expectSelected(review, nameB);
      await review.diffs.expectLine(nameB, "+second 1");
      expect(await scrollPane(reading, 1500)).toBe(1500);
      await files.move("Previous file", "keyboard");
      await expectSelected(review, nameA);
    });

    await test.step("Next file brings a row below the fold into view, the page unscrolled", async () => {
      await files.choose("Added more/file-29.txt");
      expect(await scrollPane(browser, 0)).toBe(0);
      // Opening the review from its card may have scrolled the page; the move
      // must leave it where it is.
      const target = `Added a-file-named-${"at-length-".repeat(6)}.txt`;
      expect(await shownInPane(browser, files.row(target))).toBe(false);
      const pageAt = await page.evaluate(() => window.scrollY);
      await next.click();
      const row = await expectSelected(review, target);
      await expect.poll(() => scrollTopOf(browser)).toBeGreaterThan(0);
      await expect(next).toBeFocused();
      await expect.poll(() => shownInPane(browser, row)).toBe(true);
      expect(await page.evaluate(() => window.scrollY)).toBe(pageAt);
    });
  });
});
