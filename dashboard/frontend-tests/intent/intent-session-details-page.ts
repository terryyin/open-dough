// The Selected session details story Home reads for the ad hoc session chosen
// as Intent's Review scope.
import { expect } from "vitest";
import { page } from "vitest/browser";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

export const selectedSession = () =>
  page
    .getByRole("main", { name: "Intent", exact: true })
    .getByRole("region", { name: "Selected session", exact: true });

export const selectedSessionText = () =>
  selectedSession().query()?.textContent ?? "";

// The chosen session's details lead the CI comparison panel, followed by its
// CI evidence.
export const expectSessionDetailsFirst = () => {
  const panel = intentStoryCompare().viewPanel("CI comparison");
  expect(panel?.firstElementChild).toBe(selectedSession().element());
  expect(panel?.childElementCount).toBeGreaterThan(1);
};
