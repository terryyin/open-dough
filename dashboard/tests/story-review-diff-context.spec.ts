// Directional gutter controls in Side panel story review reveal omitted
// unchanged lines around a change (./support/storyReviewWorktree.ts
// expandContextWorktree) in 20-line steps from the comparison's file text,
// without whole-gap/whole-file shortcuts, keeping markers, numbers, scroll
// place, and a readable printed diff when the text read fails until Retry.

import { expect, test } from "./support/preparationPage.ts";
import {
  expandFirstHunk,
  expandFirstHunkPrinted,
  expandSecondHunk,
  openExpandDiff,
} from "./support/expandContextDiff.ts";
import { shownLineNumbers } from "./support/reviewLineNumbers.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { storyReviewFileTextEndpoint } from "../src/storyReviewContract.ts";
import { expandContextWorktree } from "./support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";

test.describe("diff context expansion", () => {
  // Touch activation needs a touch-capable page; pointer and keyboard still apply.
  test.use({ hasTouch: true });

  test("directional gutter controls reveal twenty-line omitted context", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = expandContextWorktree(origin);
    await keepLaunchRecord(dashboard, workspace);
    const card = await openBacklog(page, origin);
    const {
      review,
      fileName,
      diff,
      beforeGap,
      betweenGap,
      afterGap,
      hunkLines,
    } = await openExpandDiff(page, card);
    await expect(
      review.getByRole("button", { name: fileName }),
    ).toHaveAttribute("aria-pressed", "true");

    // First paint keeps Git's default printed hunks (no raised -U).
    await expect(hunkLines(expandFirstHunk)).toHaveText(expandFirstHunkPrinted);
    await expect(hunkLines(expandSecondHunk)).toContainText([
      "-line 127",
      "+changed one-twenty-seven",
    ]);
    await expect(
      beforeGap.getByRole("button", { name: /preceding/ }),
    ).toBeVisible();
    await expect(
      beforeGap.getByRole("button", { name: /following/ }),
    ).toHaveCount(0);
    await expect(
      afterGap.getByRole("button", { name: /following/ }),
    ).toBeVisible();
    await expect(
      afterGap.getByRole("button", { name: /preceding/ }),
    ).toHaveCount(0);
    await expect(
      betweenGap.getByRole("button", { name: /preceding/ }),
    ).toBeVisible();
    await expect(
      betweenGap.getByRole("button", { name: /following/ }),
    ).toBeVisible();
    await expect(
      diff.getByRole("button", {
        name: /entire|whole|all remaining|whole file/i,
      }),
    ).toHaveCount(0);

    await test.step("upward before the first hunk reveals up to 20 preceding lines", async () => {
      await beforeGap
        .getByRole("button", { name: /Show 20 preceding/ })
        .click();
      const shown = beforeGap.locator("li.story-review-line");
      await expect(shown).toHaveCount(20);
      expect(await shown.first().textContent()).toBe(" line 31");
      expect(await shown.last().textContent()).toBe(" line 50");
      expect(await shownLineNumbers(shown)).toEqual(
        [...Array(20).keys()].map((at) => [String(31 + at), String(31 + at)]),
      );
    });

    await test.step("down after earlier and up before later close the inter-hunk gap without duplicates", async () => {
      await betweenGap
        .getByRole("button", { name: /Show 20 following/ })
        .press("Enter");
      await expect(
        betweenGap.locator("li.story-review-line", { hasText: " line 58" }),
      ).toHaveCount(1);
      await expect(
        betweenGap.locator("li.story-review-line", { hasText: " line 77" }),
      ).toHaveCount(1);
      await betweenGap.getByRole("button", { name: /Show 20 preceding/ }).tap();
      await expect(
        betweenGap.locator("li.story-review-line", { hasText: " line 104" }),
      ).toHaveCount(1);
      await expect(
        betweenGap.locator("li.story-review-line", { hasText: " line 123" }),
      ).toHaveCount(1);
      const texts = await betweenGap
        .locator("li.story-review-line")
        .allTextContents();
      expect(texts).toEqual([...new Set(texts)]);
      expect(texts).toHaveLength(40);
      await betweenGap
        .getByRole("button", { name: /Show 20 following/ })
        .click();
      await betweenGap
        .getByRole("button", { name: /Show 6 following/ })
        .click();
      await expect(betweenGap.getByRole("button")).toHaveCount(0);
      const closed = await betweenGap
        .locator("li.story-review-line")
        .allTextContents();
      expect(closed).toHaveLength(66);
      expect(closed).toEqual([...new Set(closed)]);
      expect(closed[0]).toBe(" line 58");
      expect(closed.at(-1)).toBe(" line 123");
    });

    await test.step("downward after the final hunk reveals following lines and stops at EOF", async () => {
      await afterGap.getByRole("button", { name: /Show 20 following/ }).click();
      await expect(
        afterGap.locator("li.story-review-line", { hasText: " line 131" }),
      ).toHaveCount(1);
      await expect(
        afterGap.locator("li.story-review-line", { hasText: " line 150" }),
      ).toHaveCount(1);
      await afterGap.getByRole("button", { name: /Show 10 following/ }).click();
      await expect(afterGap.getByRole("button")).toHaveCount(0);
      const trailing = await afterGap
        .locator("li.story-review-line")
        .allTextContents();
      expect(trailing.at(-1)).toBe(" line 160");
      expect(trailing).toHaveLength(30);
    });

    await test.step("expanded context keeps addition and removal markers and numbering", async () => {
      const lines = hunkLines(expandFirstHunk);
      await expect(lines.filter({ hasText: "-line 54" })).toHaveClass(
        /story-review-removed/,
      );
      await expect(
        lines.filter({ hasText: "+changed fifty-four" }),
      ).toHaveClass(/story-review-added/);
      expect(await shownLineNumbers(lines)).toEqual([
        ["51", "51"],
        ["52", "52"],
        ["53", "53"],
        ["54", ""],
        ["", "54"],
        ["55", "55"],
        ["56", "56"],
        ["57", "57"],
      ]);
    });

    await test.step("upward expansion above a mid-viewport hunk keeps that hunk in view", async () => {
      await page.keyboard.press("Meta+Shift+Escape");
      const again = await openExpandDiff(page, card);
      const code = again.diff.locator(".story-review-code");
      const hunk = again.diff.getByRole("list", { name: expandFirstHunk });
      const expandUp = again.beforeGap.getByRole("button", {
        name: /Show 20 preceding/,
      });
      await hunk.evaluate((el) => {
        const scroller = el.closest(".story-review-code");
        if (!(scroller instanceof HTMLElement)) return;
        const top =
          el.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top +
          scroller.scrollTop;
        scroller.scrollTop = Math.max(0, top - scroller.clientHeight / 2);
      });
      // Control already in view: a normal click would scrollIntoView (≈ button
      // height) before expand and make the place look lost for the wrong reason.
      await expect(expandUp).toBeInViewport();
      const focused = hunk.locator("li.story-review-line", {
        hasText: "+changed fifty-four",
      });
      const beforeTop = await focused.evaluate(
        (el) => el.getBoundingClientRect().top,
      );
      await expandUp.click({ force: true });
      const afterTop = await focused.evaluate(
        (el) => el.getBoundingClientRect().top,
      );
      expect(Math.abs(afterTop - beforeTop)).toBeLessThan(4);
      expect(await code.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    });

    await test.step("a failed context read leaves the printed diff and offers retry", async () => {
      await page.keyboard.press("Meta+Shift+Escape");
      let failures = 0;
      await page.route(`**${storyReviewFileTextEndpoint}?*`, async (route) => {
        if (failures < 1) {
          failures += 1;
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({ error: "context unavailable for proof" }),
          });
          return;
        }
        await route.continue();
      });
      const failed = await openExpandDiff(page, card);
      await expect(failed.hunkLines(expandFirstHunk)).toHaveText(
        expandFirstHunkPrinted,
      );
      const alert = failed.diff.getByRole("alert");
      await expect(alert).toContainText("Additional context could not be read");
      await expect(
        failed.diff.getByRole("button", { name: /preceding|following/ }),
      ).toHaveCount(0);
      await alert.getByRole("button", { name: "Retry" }).click();
      await expect(
        failed.betweenGap.getByRole("button", { name: /following/ }),
      ).toBeVisible();
      await page.unroute(`**${storyReviewFileTextEndpoint}?*`);
    });
  });
});
