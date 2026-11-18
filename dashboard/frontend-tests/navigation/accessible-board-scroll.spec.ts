import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  publishLargeBacklog,
  queuedCount,
  queuedTitle,
  queuedTitles,
} from "../../test-support/accessibleBoard.ts";
import { expectMembership, parts } from "../../test-support/dashboardPage.ts";
import { scrollYOf } from "../../test-support/boardPage.ts";
import { readWithKey } from "../../test-support/boardReading.ts";
import {
  box,
  expectNoSidewaysScrollAndWholeText,
} from "../../test-support/pageLayout.ts";

test("accessible Board reads a backlog longer than one screen by scrolling the Board", async ({
  page,
  frontendServices,
}) => {
  publishLargeBacklog(frontendServices);
  await page.goto("/");
  const { backlog } = parts(page);
  await expectMembership(page, {
    taken: ["Repair the installer's update report"],
    backlog: queuedTitles,
  });
  // Canonical reads can grow the cards after membership first appears.
  await expect(backlog.locator(".dependency-problem")).toHaveCount(queuedCount);
  const heading = backlog.getByRole("heading", { level: 2 });
  const lastCard = backlog.getByRole("article", {
    name: queuedTitle(queuedCount),
  });
  const lastInspect = lastCard.getByRole("button", { name: "Inspect story" });
  await expect(lastInspect).not.toBeInViewport();

  await test.step("the Board scrolls to the last queued work", async () => {
    await readWithKey(page, "End");
    await expect(lastInspect).toBeInViewport({ ratio: 1 });
    expect(await scrollYOf(page)).toBeGreaterThan(0);
    await expectNoSidewaysScrollAndWholeText(page);
    await expect(lastCard).toContainText(`Priority ${queuedCount}`);
  });

  await test.step("the column still says which column this is and how much it holds", async () => {
    await expect(heading).toBeInViewport({ ratio: 1 });
    await expect(backlog.getByText(`${queuedCount} entries`)).toBeInViewport({
      ratio: 1,
    });
  });

  await test.step("keyboard focus moving back up is never hidden under that heading", async () => {
    await lastInspect.focus();
    const firstInspect = backlog
      .getByRole("article", { name: queuedTitle(1), exact: true })
      .getByRole("button", { name: "Inspect story" });
    const focused = page.locator(":focus");
    // Every stop on the way back to the first card, whichever controls a card holds.
    while (
      !(await firstInspect.evaluate((e) => e === document.activeElement))
    ) {
      await page.keyboard.press("Shift+Tab");
      await expect(focused).toBeInViewport({ ratio: 1 });
      const [stuck, stop] = await Promise.all([box(heading), box(focused)]);
      expect(stuck.y + stuck.height).toBeLessThanOrEqual(stop.y);
    }
  });
});
