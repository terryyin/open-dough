// Story review controls, without a read or snapshot wait. The caller owns
// whether it needs the answer or is deliberately leaving it pending.
import { expect, type Locator } from "@playwright/test";

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

// The comparison switch says the one comparison shown.
export async function expectShown(review: Locator, shown: string) {
  const choices = comparison(review);
  await expect(comparisonChoice(review, shown)).toBeChecked();
  await expect(choices.getByRole("radio", { checked: true })).toHaveCount(1);
}

// Refresh can be pressed without waiting for the read it starts.
export const reviewRefresh = (
  review: Locator,
  { exact = false }: { exact?: boolean } = {},
) => review.getByRole("button", { name: "Refresh", exact });
