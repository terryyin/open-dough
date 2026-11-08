// Select a Recently done Story A, open Intent at its CI comparison, wait for
// its CI timing comparison proofs, then choose Changed tests and open an
// entry or folder Summary for the Summary comparison journeys in
// ../intent-summary-story-comparison*.spec.ts.

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
  type ComparisonScopeRows,
} from "../intentScopeProofPage.ts";
import { openSummary } from "../intentSummaryCiProofFixtures.ts";
import { anyComparisonLabels } from "../ciEvidenceLabelsPage.ts";
import { chooseStoryTab, expectStoryTab } from "./intentStoryPage.ts";

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
  await expectStoryTab(intent, "CI comparison");
  await chooseStoryTab(intent, "Changed tests");
  return { intent, panel, card };
}

export async function openSummaryComparison(intent: Locator, location: string) {
  const summary = await openSummary(intent, location);
  await expect(anyComparisonLabels(summary)).toBeVisible({
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
  rows: ComparisonScopeRows,
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
  await expectStoryTab(intent, "CI comparison");
  await chooseStoryTab(intent, "Changed tests");
  return { intent, panel, card };
}

export { intentLocationName, summaryRegion };
