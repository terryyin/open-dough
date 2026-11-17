// Story review controls, without a read or snapshot wait. The caller owns
// whether it needs the answer or is deliberately leaving it pending.
import { expect, type Locator, type Page } from "@playwright/test";

export const reviewRegion = (
  page: Page,
  { exact = false }: { exact?: boolean } = {},
) =>
  page.getByRole("region", {
    name: exact ? /^(?:Story|Session) review$/ : /(?:Story|Session) review/,
  });

// The story review's comparison switch.
export const comparison = (review: Locator) =>
  review.getByRole("radiogroup", { name: "Comparison" });

// One comparison choice, without pressing it or waiting for a read.
export const comparisonChoice = (
  review: Locator,
  name: string,
  { exact = false }: { exact?: boolean } = {},
) => comparison(review).getByRole("radio", { name, exact });

// A comparison's label is its touch target.
export const comparisonLabel = (review: Locator, name: string) =>
  comparison(review).locator("label", { hasText: name });

// The retained run chooser, whose keyboard protocol belongs to the scenario.
export const landedRunChoice = (review: Locator) =>
  review.getByRole("listbox", { name: "Landed run" });

// The comparison switch says the one comparison shown.
export async function expectShown(review: Locator, shown: string) {
  const choices = comparison(review);
  await expect(comparisonChoice(review, shown)).toBeChecked();
  await expect(choices.getByRole("radio", { checked: true })).toHaveCount(1);
}

// The check that controls whether All changes includes uncommitted changes.
export const uncommittedCheck = (review: Locator) =>
  review.getByRole("checkbox", { name: "Include uncommitted changes" });

// The visible label is the touch tap target for that check.
export const uncommittedLabel = (review: Locator) =>
  review.locator("label", { hasText: "Include uncommitted changes" });

export const reviewHeaderActions = (review: Locator) =>
  review.locator(".side-panel-actions");

// Refresh can be pressed without waiting for the read it starts.
export const reviewRefresh = (
  review: Locator,
  { exact = false }: { exact?: boolean } = {},
) => review.getByRole("button", { name: "Refresh", exact });
