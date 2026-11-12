import { comparisonReading } from "../intentCiComparisonPage.ts";
// Select a Recently done Story A and choose Changed tests. Source journeys
// proceed while CI reads in parallel; comparison journeys first wait for
// their CI timing proofs before opening an entry or folder Summary.

import type { Locator, Page } from "@playwright/test";
import { expect } from "./preparationPage.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";
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
import { selectDoneStoryInIntent } from "./selectDoneStoryInIntent.ts";

export async function selectDoneStoryForChangedTests(
  page: Page,
  title = "Story A",
) {
  const selected = await selectDoneStoryInIntent(page, title);
  await expectStoryTab(selected.intent, "CI comparison");
  await chooseStoryTab(selected.intent, "Changed tests");
  return selected;
}

export async function selectDoneStoryForSummaryComparison(
  page: Page,
  title = "Story A",
) {
  const selected = await selectDoneStoryInIntent(page, title);
  const { intent, panel } = selected;
  await untilPageReadsAnswered(page);
  await expect(panel).toBeVisible();
  await expect(panel.locator(".intent-ci-reading")).toHaveCount(0);
  await expect(comparisonReading(panel).entryTable).toBeVisible();
  await expectStoryTab(intent, "CI comparison");
  await chooseStoryTab(intent, "Changed tests");
  return selected;
}

export async function openSummaryComparison(intent: Locator, location: string) {
  const summary = await openSummary(intent, location);
  await untilPageReadsAnswered(intent.page());
  await expect(anyComparisonLabels(summary)).toBeVisible();
  await expect(summary.locator(".intent-ci-reading")).toHaveCount(0);
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

export { intentLocationName, summaryRegion };
