// In a window up to 800 CSS pixels wide (../src/sidePanelWidth.ts,
// ../src/side-panel.css) the side panel stacks above the page with no resize
// divider, whether it shows the terminal or a review, is read whole without
// sideways scrolling, and keeps the width chosen on a wide window for when
// the window is wide again. A narrow desktop window is that side of the
// query with the least room; a 200% zoomed window lies on the same side. The
// split beside the page, on the wide side, is ./side-panel-width.spec.ts.

import {
  narrowWindow,
  expectFocusedAndIndicated,
} from "./accessibleReading.ts";
import { storyCardSessions } from "./dashboardPage.ts";
import {
  box,
  expectEveryControlReachable,
  expectNoSidewaysScrollAndWholeText,
  expectStackedInOrder,
} from "./pageLayout.ts";
import {
  control,
  dragDivider,
  expectWidth,
  scrollsOnItsOwn,
  split,
  storyAWithSession,
  usableMinimum,
  wideWindow,
} from "./sidePanelWidthPage.ts";
import { expect, test } from "./support/preparationPage.ts";

test("at a narrow window the panel stacks above the page with no divider, and a wide window recovers the chosen width", async ({
  page,
  dashboard,
  origin,
}) => {
  const { card, terminal, review, divider } = await storyAWithSession(
    page,
    dashboard,
    origin,
  );

  await storyCardSessions(card)
    .getByRole("button", { name: "Open terminal" })
    .click();
  await expect(terminal.locator(".xterm-rows")).toContainText("attached");
  const room = await split(page, terminal);
  const chosen = Math.floor(room.dashboard + room.panel - usableMinimum);
  await dragDivider(page, -2000);
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
    await page.setViewportSize(narrowWindow);
    await expect(divider).toHaveCount(0);
    await expectStackedInOrder([panel, page.locator(".page-column")]);
    expect((await box(panel)).width).toBeCloseTo(
      await page.evaluate(() => document.documentElement.clientWidth),
      0,
    );
    await expectNoSidewaysScrollAndWholeText(page, [
      ...scrollsOnItsOwn,
      // The sidebar's entries are cut by design, read whole by their tooltip.
      ".sessions-sidebar-session-entry-title",
      // The review's context line is shortened by design, read whole by
      // its name and once activated.
      ".story-review-context-values",
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
    await expect(divider).toBeVisible();
  }
});
