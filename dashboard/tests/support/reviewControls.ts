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

// The review's toolbar under the panel header.
export const reviewToolbar = (review: Locator) =>
  review.getByRole("group", { name: "Review toolbar", exact: true });

// The toolbar's name of the comparison shown, and nothing else.
export const toolbarComparison = (review: Locator) =>
  reviewToolbar(review).locator(".story-review-toolbar-name");

// The toolbar's file sidebar toggle, by the name it has now.
export const filesToggle = (
  review: Locator,
  name: "Hide files" | "Show files" = "Hide files",
) => reviewToolbar(review).getByRole("button", { name, exact: true });

// The sidebar toggle, an icon whose tooltip says its name, sits at the
// toolbar's far left, before the comparison's name. Answers the toggle's box.
export async function expectToggleLeadsToolbar(
  review: Locator,
  comparisonShown: string,
) {
  const bar = reviewToolbar(review);
  const toggle = bar.getByRole("button", { name: /^(Hide|Show) files$/ });
  const name = toolbarComparison(review);
  await expect(name).toHaveText(comparisonShown);
  await expect(toggle.locator("svg")).toBeVisible();
  await expect(toggle).toHaveText("");
  await toggle.hover();
  await expect(
    bar.getByText((await toggle.getAttribute("aria-label")) ?? "", {
      exact: true,
    }),
  ).toBeVisible();
  const [barAt, toggleAt, nameAt] = await Promise.all(
    [bar, toggle, name].map((each) => each.boundingBox()),
  );
  if (!barAt || !toggleAt || !nameAt) throw new Error("Toolbar not laid out.");
  expect(toggleAt.x - barAt.x).toBeLessThan(24);
  expect(nameAt.x).toBeGreaterThanOrEqual(toggleAt.x + toggleAt.width);
  return toggleAt;
}

// The open review with its details readable: the comparison choices, the run
// picker, the context of the comparison shown and the uncommitted check.
// Safe to take again; a later opening of the panel takes it anew.
export async function showReviewDetails(review: Locator) {
  const eye = detailsToggle(review);
  await expect(eye).toBeVisible();
  if ((await eye.getAttribute("aria-expanded")) !== "true") await eye.click();
  await expect(eye).toHaveAttribute("aria-expanded", "true");
  return review;
}

// The toolbar's eye, whichever of its two names it has now.
export const detailsToggle = (review: Locator) =>
  reviewToolbar(review).getByRole("button", {
    name: /^(Show|Hide) review details$/,
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
// includeHidden reaches a picker still mounted behind a collapsed details
// section or cleared from the panel entirely.
export const landedRunChoice = (
  review: Locator,
  { includeHidden = false }: { includeHidden?: boolean } = {},
) => review.getByRole("listbox", { name: "Landed run", includeHidden });

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
