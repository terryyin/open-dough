// Directional gutter controls in Side panel story review reveal omitted
// unchanged lines around a change (../support/storyReviewWorktree.ts
// expandContextWorktree) in 20-line steps from the comparison's file text,
// without whole-gap/whole-file shortcuts, keeping markers, numbers, scroll
// place, and a readable printed diff when the text read fails until Retry.

import { listedFile } from "../support/reviewTreeRows.ts";
import { diffLines, codePane, scrollTopOf } from "../support/reviewPanes.ts";
import { expect, test } from "../support/preparationPage.ts";
import {
  contextExpansion,
  diffHunk,
  expandFirstHunk,
  expandFirstHunkPrinted,
  expandSecondHunk,
  openExpandDiff,
} from "../support/expandContextDiff.ts";
import { shownLineNumbers } from "../support/reviewLineNumbers.ts";
import { openBacklog } from "../support/sessionDialog.ts";
import { storyReviewFileTextEndpoint } from "../../src/storyReviewContract.ts";
import { expandContextWorktree } from "../support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "../support/storyLaunchRecord.ts";

test.describe("diff context expansion", () => {
  // Touch activation needs a touch-capable page; pointer and keyboard still apply.
  test.use({ hasTouch: true });

  test("directional gutter controls reveal twenty-line omitted context", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = expandContextWorktree(origin);
    keepLaunchRecord(dashboard, workspace);
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
    await expect(listedFile(review, fileName)).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // First paint keeps Git's default printed hunks (no raised -U).
    await expect(hunkLines(expandFirstHunk)).toHaveText(expandFirstHunkPrinted);
    await expect(hunkLines(expandSecondHunk)).toContainText([
      "-line 127",
      "+changed one-twenty-seven",
    ]);
    await expect(contextExpansion(beforeGap, /preceding/)).toBeVisible();
    await expect(contextExpansion(beforeGap, /following/)).toHaveCount(0);
    await expect(contextExpansion(afterGap, /following/)).toBeVisible();
    await expect(contextExpansion(afterGap, /preceding/)).toHaveCount(0);
    await expect(contextExpansion(betweenGap, /preceding/)).toBeVisible();
    await expect(contextExpansion(betweenGap, /following/)).toBeVisible();
    await expect(
      diff.getByRole("button", {
        name: /entire|whole|all remaining|whole file/i,
      }),
    ).toHaveCount(0);

    await test.step("upward before the first hunk reveals up to 20 preceding lines", async () => {
      await contextExpansion(beforeGap, /Show 20 preceding/).click();
      const shown = diffLines(beforeGap);
      await expect(shown).toHaveCount(20);
      expect(await shown.first().textContent()).toBe(" line 31");
      expect(await shown.last().textContent()).toBe(" line 50");
      expect(await shownLineNumbers(shown)).toEqual(
        [...Array(20).keys()].map((at) => [String(31 + at), String(31 + at)]),
      );
    });

    await test.step("down after earlier and up before later close the inter-hunk gap without duplicates", async () => {
      await contextExpansion(betweenGap, /Show 20 following/).press("Enter");
      await expect(diffLines(betweenGap, { hasText: " line 58" })).toHaveCount(
        1,
      );
      await expect(diffLines(betweenGap, { hasText: " line 77" })).toHaveCount(
        1,
      );
      await contextExpansion(betweenGap, /Show 20 preceding/).tap();
      await expect(diffLines(betweenGap, { hasText: " line 104" })).toHaveCount(
        1,
      );
      await expect(diffLines(betweenGap, { hasText: " line 123" })).toHaveCount(
        1,
      );
      const texts = await diffLines(betweenGap).allTextContents();
      expect(texts).toEqual([...new Set(texts)]);
      expect(texts).toHaveLength(40);
      await contextExpansion(betweenGap, /Show 20 following/).click();
      await contextExpansion(betweenGap, /Show 6 following/).click();
      await expect(betweenGap.getByRole("button")).toHaveCount(0);
      const closed = await diffLines(betweenGap).allTextContents();
      expect(closed).toHaveLength(66);
      expect(closed).toEqual([...new Set(closed)]);
      expect(closed[0]).toBe(" line 58");
      expect(closed.at(-1)).toBe(" line 123");
    });

    await test.step("downward after the final hunk reveals following lines and stops at EOF", async () => {
      await contextExpansion(afterGap, /Show 20 following/).click();
      await expect(diffLines(afterGap, { hasText: " line 131" })).toHaveCount(
        1,
      );
      await expect(diffLines(afterGap, { hasText: " line 150" })).toHaveCount(
        1,
      );
      await contextExpansion(afterGap, /Show 10 following/).click();
      await expect(afterGap.getByRole("button")).toHaveCount(0);
      const trailing = await diffLines(afterGap).allTextContents();
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
      const code = codePane(again.diff);
      const hunk = diffHunk(again.diff, expandFirstHunk);
      const expandUp = contextExpansion(again.beforeGap, /Show 20 preceding/);
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
      const focused = diffLines(hunk, {
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
      expect(await scrollTopOf(code)).toBeGreaterThan(0);
    });

    await test.step("a failed context read leaves the printed diff and offers retry", async () => {
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
      // A fresh page: the page keeps the comparison's text once read.
      const failed = await openExpandDiff(
        page,
        await openBacklog(page, origin),
      );
      await expect(failed.hunkLines(expandFirstHunk)).toHaveText(
        expandFirstHunkPrinted,
      );
      const alert = failed.diff.getByRole("alert");
      await expect(alert).toContainText("Additional context could not be read");
      await expect(
        contextExpansion(failed.diff, /preceding|following/),
      ).toHaveCount(0);
      await alert.getByRole("button", { name: "Retry" }).click();
      await expect(
        contextExpansion(failed.betweenGap, /following/),
      ).toBeVisible();
      await page.unroute(`**${storyReviewFileTextEndpoint}?*`);
    });
  });
});
