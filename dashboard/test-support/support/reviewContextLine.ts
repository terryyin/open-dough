// The review's independently scrolling panes and announced status.

import type { Locator } from "@playwright/test";

// The review's body beneath details and status, which holds the file browser
// and the diff, or the review's explanation.
export const reviewBody = (review: Locator) =>
  review.locator(".story-review-body");

// The review's feedback, announced from its top above the work area: reading,
// refreshing, refreshed, and problem messages. A file's diff has its own.
export const reviewFeedback = (review: Locator) =>
  review.locator(".story-review-top").getByRole("status");

// The review's file browser, which scrolls on its own.
export const fileBrowser = (review: Locator) =>
  review.locator(".story-review-files");
