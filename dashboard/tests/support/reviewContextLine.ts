// A story review's fixed top as the developer meets it: the context line,
// activated by its values and read by its name, and the review's feedback,
// both kept in place while the review's body scrolls beneath them.

import { expect, type Locator, type Page } from "@playwright/test";

// The context line's values, the control that shows them in full and
// returns them to one line.
export const contextValues = (review: Locator) =>
  review.getByRole("button", { name: /^Branch / });

// The whole context line, values and file browser control.
export const contextLine = (review: Locator) =>
  review.locator(".story-review-context-line");

// The review's body, which scrolls beneath its fixed top.
export const reviewBody = (review: Locator) =>
  review.locator(".story-review-body");

// The review's feedback, announced from its fixed top: reading, refreshing,
// refreshed, and problem messages. A file's diff has its own.
export const reviewFeedback = (review: Locator) =>
  review.locator(".story-review-top").getByRole("status");

// What the context line's values read aloud in either state: every value in
// full.
export const contextWords = ({
  branch,
  baseline,
  workspace,
}: {
  readonly branch: string;
  readonly baseline: string;
  readonly workspace: string;
}) =>
  `Branch ${branch} Baseline ${baseline} where ${branch} meets origin/main Worktree ${workspace}`;

// Shortens the window until the review's body holds less than its content,
// scrolls the body to its end, and expects each fixed element to keep its
// box; the window then takes its earlier size again.
export async function expectFixedWhileBodyScrolls(
  page: Page,
  review: Locator,
  fixed: readonly Locator[],
) {
  const size = page.viewportSize();
  if (size === null) throw new Error("The page has no viewport size.");
  const body = reviewBody(review);
  const bodyTop = (await body.boundingBox())?.y ?? 0;
  await page.setViewportSize({
    width: size.width,
    height: Math.ceil(bodyTop) + 24,
  });
  try {
    const before = await Promise.all(fixed.map((each) => each.boundingBox()));
    const scrolled = await body.evaluate((element) => {
      element.scrollTo(0, element.scrollHeight);
      return element.scrollTop;
    });
    expect(scrolled).toBeGreaterThan(0);
    expect(await Promise.all(fixed.map((each) => each.boundingBox()))).toEqual(
      before,
    );
    for (const each of fixed) await expect(each).toBeInViewport();
  } finally {
    await page.setViewportSize(size);
  }
}
