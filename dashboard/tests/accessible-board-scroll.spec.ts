import { expect, test } from "./dashboardTest.ts";
import {
  publishLargeBacklog,
  queuedCount,
  queuedTitle,
  queuedTitles,
} from "./accessibleBoard.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { scrollYOf } from "./boardPage.ts";
import { enabledStoryCardLaunchActions } from "./storyCardControls.ts";
import { box, expectNoSidewaysScrollAndWholeText } from "./pageLayout.ts";

test("accessible Board reads a backlog longer than one screen by scrolling the Board", async ({
  page,
}) => {
  await publishLargeBacklog(page);
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
    await page.keyboard.press("End");
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
    for (let place = queuedCount - 1; place >= 1; place -= 1) {
      // Each queued card offers its enabled launch actions before its Inspect
      // story, its last control, so Shift+Tab past them reaches the previous
      // card's Inspect story.
      const card = backlog.getByRole("article", {
        name: queuedTitle(place + 1),
        exact: true,
      });
      const launches = await enabledStoryCardLaunchActions(card);
      for (let step = 0; step < launches.length + 1; step += 1) {
        await page.keyboard.press("Shift+Tab");
      }
      const inspect = backlog
        .getByRole("article", { name: queuedTitle(place), exact: true })
        .getByRole("button", { name: "Inspect story" });
      await expect(inspect).toBeFocused();
      await expect(inspect).toBeInViewport({ ratio: 1 });
      const [stuck, focused] = await Promise.all([box(heading), box(inspect)]);
      expect(stuck.y + stuck.height).toBeLessThanOrEqual(focused.y);
    }
  });
});
