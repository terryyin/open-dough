// Select a Recently done Story A, open Intent, wait for its CI timing
// comparison proofs, and open an entry or folder Summary for the Summary
// comparison journeys in ../intent-summary-story-comparison*.spec.ts.

import type { Locator, Page } from "@playwright/test";
import { expect } from "./preparationPage.ts";
import { parts } from "../dashboardPage.ts";
import { showColumn } from "../boardPage.ts";
import { readWaitLimitMs } from "../../src/authenticatedReadRules.ts";
import { expectSelected } from "../storyCardSelection.ts";
import { intentLocationName } from "../intentPerspectivePage.ts";
import {
  childName,
  expectComparisonScopeRows,
  summaryRegion,
  type ComparisonScopeRow,
} from "../intentScopeProofPage.ts";
import { openSummary } from "../intentSummaryCiProofFixtures.ts";

export async function selectDoneStoryForSummaryComparison(
  page: Page,
  title = "Story A",
) {
  await page.goto("/");
  await showColumn(page, "Recently done");
  const { recentlyDone, intentChoice, intent } = parts(page);
  const card = recentlyDone.getByRole("article", {
    name: title,
    exact: true,
  });
  await card.getByRole("heading", { level: 3 }).click();
  await expectSelected(card, true);
  await intentChoice.click();
  await expect(intent).toBeVisible();
  const panel = intent.getByRole("region", {
    name: "CI timing comparison",
    exact: true,
  });
  await expect(panel).toBeVisible({ timeout: readWaitLimitMs + 15_000 });
  await expect(panel.locator(".intent-ci-reading")).toHaveCount(0, {
    timeout: readWaitLimitMs + 15_000,
  });
  await expect(
    panel.getByRole("table", { name: "CI entry timing comparison" }),
  ).toBeVisible({ timeout: readWaitLimitMs + 15_000 });
  return { intent, panel, card };
}

export async function openSummaryComparison(intent: Locator, location: string) {
  const summary = await openSummary(intent, location);
  await expect(summary.locator(".intent-summary-evidence")).toBeVisible({
    timeout: readWaitLimitMs + 15_000,
  });
  await expect(summary.locator(".intent-ci-reading")).toHaveCount(0, {
    timeout: readWaitLimitMs + 15_000,
  });
  return summary;
}

export async function drillComparisonChild(
  summary: Locator,
  name: string,
  path: string,
  rows: readonly ComparisonScopeRow[],
) {
  await childName(summary, name).click();
  await expect(summary.locator(".intent-summary-path")).toHaveText(path);
  await expectComparisonScopeRows(summary, path, rows);
}

export async function selectTakenStoryForSummaryComparison(
  page: Page,
  title = "Story A",
) {
  await page.goto("/");
  await showColumn(page, "Taken");
  const { taken, intentChoice, intent } = parts(page);
  const card = taken.getByRole("article", { name: title, exact: true });
  await card.getByRole("heading", { level: 3 }).click();
  await expectSelected(card, true);
  await intentChoice.click();
  await expect(intent).toBeVisible();
  const panel = intent.getByRole("region", {
    name: "CI timing comparison",
    exact: true,
  });
  await expect(panel).toBeVisible({ timeout: readWaitLimitMs + 15_000 });
  await expect(panel.locator(".intent-ci-reading")).toHaveCount(0, {
    timeout: readWaitLimitMs + 15_000,
  });
  await expect(panel.locator(".intent-ci-comparison")).toBeVisible({
    timeout: readWaitLimitMs + 15_000,
  });
  return { intent, panel, card };
}

export { intentLocationName, summaryRegion };
