// A large story's review, of Story A's worktree changing more files than the
// file browser holds and files longer than the diff shows
// (./support/storyReviewWorktree.ts). Beneath the review's fixed top the
// file browser and the selected file's diff fill the panel, and the body
// never scrolls as a whole. Each pane scrolls on its own, down and sideways,
// leaving the other, the top, and the diff's heading in place; the code
// scrolls by keyboard. Selecting another file shows its diff from the top
// and leaves the browser where it was; Refresh, Maximize/Restore, and
// resizing the panel by its edge keep both panes' places. In a narrow panel
// the browser sits above the diff with a bounded share of the height, and
// Hide files gives the diff the whole work area.

import { narrowWindow } from "./accessibleReading.ts";
import { box, pressWhereShown } from "./pageLayout.ts";
import { control, dragEdge, expectWidth } from "./sidePanelWidthPage.ts";
import { expect, test } from "./support/preparationPage.ts";
import {
  contextLine,
  reviewBody,
  reviewFeedback,
} from "./support/reviewContextLine.ts";
import {
  boxes,
  openLargeReview,
  overflows,
  scrollPane,
  scrollTopOf,
} from "./support/reviewPanes.ts";
import { longA, longB } from "./support/storyReviewWorktree.ts";

test("a large review's browser and diff fill the panel and each scrolls on its own", async ({
  page,
  dashboard,
  origin,
}) => {
  const { review, browser, diffOf, codeOf, select } = await openLargeReview(
    page,
    dashboard,
    origin,
  );
  const body = reviewBody(review);
  const top = review.locator(".story-review-top");
  const header = review.locator(".side-panel-header");
  const nameA = `Added ${longA}`;
  const nameB = `Added ${longB}`;
  const headingOf = (name: string) =>
    diffOf(name).getByRole("heading", { name });
  // What stays in place while either pane scrolls.
  const fixed = [header, top, contextLine(review), headingOf(nameA)];

  await test.step("the browser and the diff fill the panel beneath its fixed top, and the body does not scroll", async () => {
    const [panel, bodyBox, shownBrowser, shownDiff, shownTop] =
      await Promise.all([
        box(review),
        box(body),
        box(browser),
        box(diffOf(nameA)),
        box(top),
      ]);
    // Both panes start beneath the top and reach the panel's bottom, less
    // the body's padding.
    for (const pane of [shownBrowser, shownDiff]) {
      expect(pane.y).toBeGreaterThanOrEqual(shownTop.y + shownTop.height);
      expect(pane.y + pane.height).toBeGreaterThan(panel.y + panel.height - 20);
    }
    expect(bodyBox.y + bodyBox.height).toBeCloseTo(panel.y + panel.height, 0);
    expect((await overflows(body)).down).toBe(false);
    expect((await overflows(browser)).down).toBe(true);
    expect((await overflows(codeOf(nameA))).down).toBe(true);
  });

  await test.step("long names and long code lines scroll sideways in their own pane, never the page", async () => {
    expect((await overflows(browser)).sideways).toBe(true);
    expect((await overflows(codeOf(nameA))).sideways).toBe(true);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
  });

  await test.step("scrolling the browser leaves the diff, the top, and the diff's heading", async () => {
    const before = await boxes(fixed);
    const code = await scrollTopOf(codeOf(nameA));
    expect(await scrollPane(browser, 150)).toBe(150);
    expect(await scrollTopOf(codeOf(nameA))).toBe(code);
    expect(await boxes(fixed)).toEqual(before);
  });

  await test.step("the keyboard scrolls the code, which leaves the browser, the top, and the diff's heading", async () => {
    const before = await boxes(fixed);
    const code = codeOf(nameA);
    await code.focus();
    await page.keyboard.press("PageDown");
    await expect.poll(() => scrollTopOf(code)).toBeGreaterThan(0);
    expect(await scrollPane(code, 2000)).toBe(2000);
    expect(await scrollTopOf(browser)).toBe(150);
    expect(await boxes(fixed)).toEqual(before);
    await expect(headingOf(nameA)).toBeInViewport();
    await expect(contextLine(review)).toBeInViewport();
  });

  await test.step("selecting another file shows its diff from the top and leaves the browser", async () => {
    const scrolled = await scrollPane(browser, 100_000);
    expect(scrolled).toBeGreaterThan(150);
    await select(nameB);
    await expect(headingOf(nameB)).toBeVisible();
    expect(await scrollTopOf(codeOf(nameB))).toBe(0);
    expect(await scrollTopOf(browser)).toBe(scrolled);
  });

  // Both panes scrolled partway, one folder collapsed.
  const more = browser.getByRole("button", { name: /^more\b/ });
  await more.click();
  await expect(more).toHaveAttribute("aria-expanded", "false");
  const browserAt = await scrollPane(browser, 120);
  const codeAt = await scrollPane(codeOf(nameB), 1500);
  expect([browserAt, codeAt]).toEqual([120, 1500]);
  const expectPanesKept = async () => {
    await expect(browser.getByRole("button", { name: nameB })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect.poll(() => scrollTopOf(browser)).toBe(browserAt);
    await expect.poll(() => scrollTopOf(codeOf(nameB))).toBe(codeAt);
  };

  await test.step("Refresh keeps the browser's place, its collapsed folder, and the diff's place", async () => {
    await control(review, "Refresh").click();
    await expect(reviewFeedback(review)).toHaveText(
      /^Review refreshed: 63 changed files against baseline [0-9a-f]{7}\.$/,
    );
    await expect(more).toHaveAttribute("aria-expanded", "false");
    await expectPanesKept();
  });

  await test.step("Maximize and Restore keep the selection and both panes' places", async () => {
    await pressWhereShown(control(review, "Maximize"));
    await expect(control(review, "Restore")).toBeVisible();
    await expectPanesKept();
    await pressWhereShown(control(review, "Restore"));
    await expect(control(review, "Maximize")).toBeVisible();
    await expectPanesKept();
  });

  await test.step("resizing the panel by its edge keeps the selection and both panes' places", async () => {
    const width = (await box(review)).width;
    await dragEdge(page, -200);
    await expectWidth(review, Math.round(width + 200));
    await expectPanesKept();
  });
});

test("in a narrow panel the browser sits above the diff, each scrolling, and Hide files gives the diff the work area", async ({
  page,
  dashboard,
  origin,
}) => {
  const { review, browser, diffOf, codeOf } = await openLargeReview(
    page,
    dashboard,
    origin,
  );
  await page.setViewportSize(narrowWindow);
  const body = reviewBody(review);
  const workarea = review.locator(".story-review-workarea");
  const nameA = `Added ${longA}`;
  const diff = diffOf(nameA);
  const code = codeOf(nameA);

  await test.step("the browser sits above the diff with a bounded share of the height", async () => {
    const [area, shownBrowser, shownDiff] = await Promise.all([
      box(workarea),
      box(browser),
      box(diff),
    ]);
    expect(shownBrowser.y + shownBrowser.height).toBeLessThanOrEqual(
      shownDiff.y,
    );
    expect(shownBrowser.height).toBeLessThanOrEqual(area.height * 0.4 + 1);
    expect(shownDiff.y + shownDiff.height).toBeCloseTo(area.y + area.height, 0);
    expect((await overflows(body)).down).toBe(false);
  });

  await test.step("each pane scrolls on its own", async () => {
    expect((await overflows(browser)).down).toBe(true);
    expect((await overflows(code)).down).toBe(true);
    const browserAt = await scrollPane(browser, 80);
    expect(browserAt).toBe(80);
    const codeAt = await scrollPane(code, 600);
    expect(codeAt).toBe(600);
    expect(await scrollTopOf(browser)).toBe(browserAt);
    await scrollPane(browser, 0);
    expect(await scrollTopOf(code)).toBe(codeAt);
  });

  await test.step("Hide files gives the diff the whole work area", async () => {
    const shownDiff = await box(diff);
    await contextLine(review)
      .getByRole("button", { name: "Hide files" })
      .click();
    await expect(browser).toBeHidden();
    const [area, alone] = await Promise.all([box(workarea), box(diff)]);
    expect(alone.y).toBeCloseTo(area.y, 0);
    expect(alone.height).toBeCloseTo(area.height, 0);
    expect(alone.height).toBeGreaterThan(shownDiff.height);
    expect((await overflows(code)).down).toBe(true);
  });
});
