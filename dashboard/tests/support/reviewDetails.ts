// The review details as a reader meets them: an inline section between the
// review's toolbar and its work area that the toolbar's eye reveals and
// hides. Collapsed, none of the comparison choices, the run picker, the
// context of the comparison shown or the uncommitted check is offered.
import { expect, type Locator } from "@playwright/test";
import { box } from "../pageLayout.ts";
import {
  detailsToggle,
  reviewToolbar,
  toolbarComparison,
  uncommittedCheck,
} from "./reviewControls.ts";
import { contextLine, reviewBody } from "./reviewContextLine.ts";

// The section the eye says it controls, shown or not.
async function controlledSection(review: Locator) {
  const id = await detailsToggle(review).getAttribute("aria-controls");
  if (id === null) throw new Error("The eye controls no section.");
  return review.locator(`[id="${id}"]`);
}

// The details wait behind the eye, which says so in its name and state.
export async function expectDetailsCollapsed(review: Locator) {
  const eye = detailsToggle(review);
  await expect(eye).toHaveAccessibleName("Show review details");
  await expect(eye).toHaveAttribute("aria-expanded", "false");
  const section = await controlledSection(review);
  await expect(section).toHaveCount(1);
  await expect(section).toBeHidden();
  await expect(review.getByRole("radio")).toHaveCount(0);
  await expect(review.getByRole("listbox")).toHaveCount(0);
  await expect(uncommittedCheck(review)).toHaveCount(0);
  await expect(contextLine(review)).toBeHidden();
  await expect(
    review.getByRole("heading", { name: "Landed run", exact: true }),
  ).toHaveCount(0);
}

// No comparison name and no eye: before an answer or after a cleared failure.
export async function expectNoToolbarComparisonOrDetails(review: Locator) {
  await expect(toolbarComparison(review)).toHaveCount(0);
  await expect(detailsToggle(review)).toHaveCount(0);
  await expect(
    review.getByRole("group", { name: "Review details" }),
  ).toHaveCount(0);
}

// The details are revealed in one section between the toolbar and the work
// area, and the eye says so. Answers that section.
export async function expectDetailsRevealed(review: Locator) {
  const eye = detailsToggle(review);
  await expect(eye).toHaveAccessibleName("Hide review details");
  await expect(eye).toHaveAttribute("aria-expanded", "true");
  const section = await controlledSection(review);
  await expect(section).toBeVisible();
  const [barAt, sectionAt, bodyAt] = [
    await box(reviewToolbar(review)),
    await box(section),
    await box(reviewBody(review)),
  ];
  expect(sectionAt.y).toBeGreaterThanOrEqual(barAt.y + barAt.height - 1);
  expect(bodyAt.y).toBeGreaterThanOrEqual(sectionAt.y + sectionAt.height - 1);
  return section;
}

// Activates the eye to reveal the details.
export async function revealDetails(review: Locator) {
  await reviewToolbar(review)
    .getByRole("button", { name: "Show review details", exact: true })
    .click();
  return expectDetailsRevealed(review);
}

// Activates the eye to hide the details again.
export async function hideDetails(review: Locator) {
  await reviewToolbar(review)
    .getByRole("button", { name: "Hide review details", exact: true })
    .click();
  await expectDetailsCollapsed(review);
}

// The eye is an icon beside the comparison's name, after it on the toolbar's
// one row, whose tooltip says its name.
export async function expectEyeBesideComparison(
  review: Locator,
  named: "Show review details" | "Hide review details",
) {
  const bar = reviewToolbar(review);
  const eye = detailsToggle(review);
  await expect(eye).toHaveAccessibleName(named);
  await expect(eye.locator("svg")).toBeVisible();
  await expect(eye).toHaveText("");
  await eye.hover();
  await expect(bar.getByText(named, { exact: true })).toBeVisible();
  const nameAt = await box(toolbarComparison(review));
  const eyeAt = await box(eye);
  const gap = eyeAt.x - (nameAt.x + nameAt.width);
  expect(gap).toBeGreaterThanOrEqual(0);
  expect(gap).toBeLessThan(24);
  expect(
    Math.abs(eyeAt.y + eyeAt.height / 2 - nameAt.y - nameAt.height / 2),
  ).toBeLessThan(eyeAt.height / 2);
}

// Escape, pressed with the keyboard inside the details, hides them and
// returns the keyboard to the eye.
export async function escapeDetailsFrom(review: Locator, inside: Locator) {
  await inside.focus();
  await expect(inside).toBeFocused();
  await review.page().keyboard.press("Escape");
  await expectDetailsCollapsed(review);
  await expect(detailsToggle(review)).toBeFocused();
}
