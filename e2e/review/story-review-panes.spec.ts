import {
  maximizeSidePanel,
  restoreSidePanel,
} from "../../dashboard/test-support/sidePanelFrame.ts";
// A published session review whose fixed pair changes more files than the
// file browser holds and files longer than the diff shows
// (../../dashboard/test-support/support/storyReviewWorktree.ts). Beneath the review's
// status above the work area the file browser and the selected file's diff
// fill the panel, and the body never scrolls as a whole. Each pane scrolls on
// its own, down and sideways, leaving the other, what is above them, and the
// diff's heading in place; the code scrolls by keyboard. Selecting another
// file shows its diff from the top and leaves the browser where it was;
// Refresh, Maximize/Restore, and using the Panel divider keep both panes'
// places. In a narrow panel the browser sits above the diff with a bounded
// share of the height, and Hide files gives the diff the whole work area.

import { sidePanelPages } from "../../dashboard/test-support/sidePanelPages.ts";
import { expectCovering } from "../../dashboard/test-support/sidePanelFrame.ts";
import { narrowWindow } from "../../dashboard/test-support/accessibleReading.ts";
import {
  box,
  expectTopBarsShareHeight,
} from "../../dashboard/test-support/pageLayout.ts";
import {
  control,
  focusDivider,
  pressDividerKey,
  keyStep,
  expectWidth,
} from "../../dashboard/test-support/sidePanelWidthPage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  boxes,
  largeReviewRepository,
  openLargeReview,
  pageFits,
  overflows,
  scrollPane,
  scrollTopOf,
  diffHeading,
} from "../../dashboard/test-support/support/reviewPanes.ts";
import {
  longA,
  longB,
} from "../../dashboard/test-support/support/largeReviewFiles.ts";

test.use({ originRepository: largeReviewRepository });

test("a large review's browser and diff fill the panel and each scrolls on its own", async ({
  page,
  origin,
}) => {
  const {
    browser,
    diffOf,
    codeOf,
    select,
    opened: review,
  } = await openLargeReview(page, origin);
  const {
    panel: shownPanel,
    header,
    top,
    details,
    feedback,
    body,
  } = review.frame.partsToMeasure();
  const nameA = `Added ${longA}`;
  const nameB = `Added ${longB}`;
  const headingOf = (name: string) => diffHeading(diffOf(name), { name });
  // What stays in place while either pane scrolls.
  await review.frame.expectDescription(
    "Read-only: this session's published changes from its close record, from the recorded baseline to its published tree.",
  );
  await review.frame.expectUnshown(/^Read-only/);
  const toolbarAt = await review.expectFilesToggleLeads("Published changes");
  await review.status.refreshAndRead();
  await review.status.expectFeedback(
    "Review refreshed: 63 changed files in the published changes.",
  );
  const [contextAt, statusAt, bodyAt] = await Promise.all([
    box(details),
    box(feedback),
    box(body),
  ]);
  expect(contextAt.y).toBeGreaterThan(toolbarAt.y);
  expect(statusAt.y).toBeGreaterThanOrEqual(contextAt.y + contextAt.height);
  expect(bodyAt.y).toBeGreaterThanOrEqual(statusAt.y + statusAt.height);
  const fixed = [header, top, details, feedback, headingOf(nameA)];

  await test.step("the browser and the diff fill the panel beneath its status, and the body does not scroll", async () => {
    const [panel, bodyBox, shownBrowser, shownDiff, shownTop] =
      await Promise.all([
        box(shownPanel),
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
    await expectTopBarsShareHeight(page, 2);
    expect((await overflows(body)).down).toBe(false);
    expect((await overflows(browser)).down).toBe(true);
    expect((await overflows(codeOf(nameA))).down).toBe(true);
  });

  await test.step("long names and long code lines scroll sideways in their own pane, never the page", async () => {
    expect((await overflows(browser)).sideways).toBe(true);
    expect((await overflows(codeOf(nameA))).sideways).toBe(true);
    expect(await pageFits(page)).toBe(true);
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
    await expect(feedback).toBeInViewport();
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
  const more = /^more\b/;
  await review.files.toggleFolder(more);
  await review.files.expectFolderExpanded(more, false);
  const browserAt = await scrollPane(browser, 120);
  const codeAt = await scrollPane(codeOf(nameB), 1500);
  expect([browserAt, codeAt]).toEqual([120, 1500]);
  const expectPanesKept = async () => {
    await review.files.expectChosen("63 changed files", nameB);
    await expect.poll(() => scrollTopOf(browser)).toBe(browserAt);
    await expect.poll(() => scrollTopOf(codeOf(nameB))).toBe(codeAt);
  };

  await test.step("Refresh keeps the browser's place, its collapsed folder, and the diff's place", async () => {
    await review.status.refreshAndRead();
    await review.status.expectFeedback(
      "Review refreshed: 63 changed files in the published changes.",
    );
    await review.files.expectFolderExpanded(more, false);
    await expectPanesKept();
  });

  await test.step("Maximize and Restore keep the selection and both panes' places", async () => {
    await maximizeSidePanel(shownPanel);
    await expect(control(shownPanel, "Restore")).toBeVisible();
    await expectPanesKept();
    await restoreSidePanel(shownPanel);
    await expect(control(shownPanel, "Maximize")).toBeVisible();
    await expectPanesKept();
  });

  await test.step("using the Panel divider keeps the selection and both panes' places", async () => {
    const width = (await box(shownPanel)).width;
    await focusDivider(page);
    await pressDividerKey(page, "ArrowLeft");
    await expectWidth(shownPanel, Math.round(width + keyStep));
    await expectPanesKept();
  });
});

test("in a narrow panel the browser sits above the diff, each scrolling, and Hide files gives the diff the work area", async ({
  page,
  origin,
}) => {
  const {
    browser,
    diffOf,
    codeOf,
    opened: review,
    session,
  } = await openLargeReview(page, origin);
  await page.setViewportSize(narrowWindow);
  const { body, workarea, panel } = review.frame.partsToMeasure();
  await expectCovering(panel);
  const nameA = `Added ${longA}`;
  const diff = diffOf(nameA);
  const code = codeOf(nameA);

  await test.step("the browser sits above the diff with a bounded share of the height", async () => {
    // The panel lays itself out anew once it observes the narrower window.
    const stacked = async () => {
      const [shownBrowser, shownDiff] = await Promise.all([
        box(browser),
        box(diff),
      ]);
      return shownBrowser.y + shownBrowser.height <= shownDiff.y;
    };
    await expect.poll(stacked).toBe(true);
    const [area, shownBrowser, shownDiff] = await Promise.all([
      box(workarea),
      box(browser),
      box(diff),
    ]);
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
    await review.hideFiles();
    await review.expectFilesShown(false);
    const [area, alone] = await Promise.all([box(workarea), box(diff)]);
    expect(alone.y).toBeCloseTo(area.y, 0);
    expect(alone.height).toBeCloseTo(area.height, 0);
    expect(alone.height).toBeGreaterThan(shownDiff.height);
    expect((await overflows(code)).down).toBe(true);
  });
  await review.close("keyboard");
  await sidePanelPages(page).phase(
    "keyboard Close returns focus to the session entry",
    ({ board }) => board.expectPublishedReviewFocused(session),
  );
});
