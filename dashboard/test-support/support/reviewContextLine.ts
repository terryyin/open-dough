// A story review's context and feedback as the developer meets them: the
// context line in the review details, activated by its values and read by
// its name, and the feedback in the review's top above the work area, both
// kept in place while the panes beneath them scroll.

import { expect, type Locator, type Page } from "@playwright/test";

// The context line's values, the control that shows them in full and
// returns them to one line.
export const contextValues = (review: Locator) =>
  review.getByRole("button", { name: /^Branch / });

// The whole context line.
export const contextLine = (review: Locator) =>
  review.locator(".story-review-context-line");

// The review's body beneath details and status, which holds the file browser
// and the diff, or the review's explanation.
export const reviewBody = (review: Locator) =>
  review.locator(".story-review-body");

// The review's feedback, announced from its top above the work area: reading,
// refreshing, refreshed, and problem messages. A file's diff has its own.
export const reviewFeedback = (review: Locator) =>
  review.locator(".story-review-top").getByRole("status");

// What the context line's values read aloud in either state: every value in
// full, the baseline less the story's published commits when it says how
// many were taken out.
export const contextWords = ({
  branch,
  baseline,
  published,
  workspace,
}: {
  readonly branch: string;
  readonly baseline: string;
  readonly published?: number;
  readonly workspace: string;
}) =>
  `Branch ${branch} Baseline ${baseline} where ${branch} meets origin/main${published === undefined ? "" : `, less the story's ${String(published)} published ${published === 1 ? "commit" : "commits"}`} Worktree ${workspace}`;

// The review's file browser, which scrolls on its own.
export const fileBrowser = (review: Locator) =>
  review.locator(".story-review-files");

// Shortens the window until a part beneath the review's top holds less than
// its content, scrolls that part to its end, and expects each fixed element
// to keep its box; the window then takes its earlier size again.
export async function expectFixedWhileScrolled(
  page: Page,
  scrolled: Locator,
  fixed: readonly Locator[],
) {
  const size = page.viewportSize();
  if (size === null) throw new Error("The page has no viewport size.");
  // The part keeps a few lines' height, less than its content.
  const height = (await scrolled.boundingBox())?.height ?? 0;
  await page.setViewportSize({
    width: size.width,
    height: size.height - Math.floor(height) + 32,
  });
  try {
    const before = await Promise.all(fixed.map((each) => each.boundingBox()));
    const scrollTop = await scrolled.evaluate((element) => {
      element.scrollTo(0, element.scrollHeight);
      return element.scrollTop;
    });
    expect(scrollTop).toBeGreaterThan(0);
    expect(await Promise.all(fixed.map((each) => each.boundingBox()))).toEqual(
      before,
    );
    for (const each of fixed) await expect(each).toBeInViewport();
  } finally {
    await page.setViewportSize(size);
  }
}
