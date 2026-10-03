// At a narrow or zoomed window the side panel stacks above the page with no
// resize edge (./sidePanelWidthPage.ts), whether it shows the terminal or a
// review, is read whole without sideways scrolling, and keeps the width chosen
// on a wide window for when the window is wide again.

import {
  narrowWindow,
  twiceZoomedWindow,
  expectFocusedAndIndicated,
} from "./accessibleReading.ts";
import { cardSessions } from "./dashboardPage.ts";
import {
  box,
  expectEveryControlReachable,
  expectNoSidewaysScrollAndWholeText,
  expectStackedInOrder,
} from "./pageLayout.ts";
import {
  control,
  dragEdge,
  expectWidth,
  scrollsOnItsOwn,
  split,
  storyAWithSession,
  usableMinimum,
  wideWindow,
} from "./sidePanelWidthPage.ts";
import { expect, test } from "./support/preparationPage.ts";

for (const { name, viewport } of [
  { name: "a narrow window", viewport: narrowWindow },
  { name: "a 200% zoomed window", viewport: twiceZoomedWindow },
]) {
  test(`at ${name} the panel stacks above the page with no edge, and a wide window recovers the chosen width`, async ({
    page,
    dashboard,
    origin,
  }) => {
    const { card, terminal, review, edge } = await storyAWithSession(
      page,
      dashboard,
      origin,
    );

    await cardSessions(card)
      .getByRole("button", { name: "Open terminal" })
      .click();
    await expect(terminal.locator(".xterm-rows")).toContainText("attached");
    const room = await split(page, terminal);
    const chosen = Math.floor(room.dashboard + room.panel - usableMinimum);
    await dragEdge(page, -2000);
    await expectWidth(terminal, chosen);

    for (const [panel, open] of [
      [terminal, async () => {}],
      [
        review,
        async () => {
          await card.getByRole("button", { name: "Review changes" }).click();
          await review
            .getByRole("button", { name: "Modified unstaged.txt" })
            .click();
          await expect(
            review.getByRole("region", { name: "Modified unstaged.txt" }),
          ).toContainText("+more wide");
        },
      ],
    ] as const) {
      await page.setViewportSize(wideWindow);
      await open();
      await expectWidth(panel, chosen);
      await page.setViewportSize(viewport);
      await expect(edge).toHaveCount(0);
      await expectStackedInOrder([panel, page.locator(".page-column")]);
      expect((await box(panel)).width).toBeCloseTo(
        await page.evaluate(() => document.documentElement.clientWidth),
        0,
      );
      await expectNoSidewaysScrollAndWholeText(page, [
        ...scrollsOnItsOwn,
        // The sidebar's entries are cut by design, read whole by their tooltip.
        ".sidebar-title",
      ]);
      await expectEveryControlReachable(panel);
      await expect(panel.getByRole("heading", { level: 2 })).toBeInViewport();
      const close = control(panel, "Close");
      await close.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expectFocusedAndIndicated(page, close);
      await page.setViewportSize(wideWindow);
      await expectWidth(panel, chosen);
      await expect(edge).toBeVisible();
    }
  });
}
