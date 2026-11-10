import type { Locator, Page } from "@playwright/test";
import { expect } from "./preparationPage.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";

export async function expectScopePriorReference(
  page: Page,
  scope: Locator,
  values: {
    readonly average: string;
    readonly selected: string;
    readonly difference: string;
  },
  expectLocalOnly: () => void,
) {
  const history = scope.getByRole("region", {
    name: "Test execution time history",
    exact: true,
  });
  const cases = history.getByRole("region", {
    name: "Test cases",
    exact: true,
  });
  await expect(cases).toContainText(`Prior-build average · ${values.average}`);
  await expect(cases).toContainText(values.selected);
  await expect(cases).toContainText(values.difference);
  await expect(cases).toContainText("5 prior builds used · Nov 1–Nov 5");
  await expect(cases).toContainText("reference for normal timing");
  await expect(cases).toContainText(
    "exclude values strictly more than 15% above that median, once",
  );
  await expect(cases.locator(".intent-ci-history-reference")).toHaveCount(1);
  await expect(cases.locator(".intent-ci-history-point")).toHaveCount(7);
  const evidence = cases.getByRole("group", {
    name: "Prior-build reference evidence",
  });
  await expect(evidence.getByText(/✓ Included/)).toHaveCount(5);
  await expect(evidence.getByText(/× Excluded/)).toContainText("Slow outlier");
  await expect(evidence.getByText(/◆ Selected/)).toContainText("Exact build");
  const link = evidence.getByRole("link", { name: "Run 201 · attempt 1" });
  await link.focus();
  await expect(link).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    evidence.getByRole("link", { name: "Run 202 · attempt 1" }),
  ).toBeFocused();
  await expect(link).toHaveAttribute("href", "https://ci.invalid/runs/201");
  await expectNoSidewaysScrollIn(page, history);
  expectLocalOnly();
  return history;
}
