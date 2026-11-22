import { prepareOpenDoughCandidates } from "../../test-support/support/frontendIntentCandidates.ts";
// Intent asks the read boundary once for each answer fixed at the revision
// shown (../../src/answerMemo.ts): leaving for Development and returning reads
// neither the locations nor the Test Optimization Candidates record again.
// Feature reads: ./intent-cached-reads.spec.ts.
// With a selected story: ./intent-read-reuse-story.spec.ts.

import type { Page } from "@playwright/test";
import { countAuthenticatedReads } from "../../test-support/support/frontendAuthenticatedReadControl.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import { openUntilRead } from "../../test-support/pageRequestNotes.ts";
import {
  candidatesRecord,
  chooseOptimizationCandidates,
  expectIntentModeChosen,
} from "../../test-support/intentModePage.ts";

const intentReads = (page: Page, intent: string) =>
  countAuthenticatedReads(page, (params) => params.get("intent") === intent);

test("the Test Optimization Candidates record is read once across leaving Intent and returning", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const recordReads = intentReads(page, "test-optimization-candidates");
  const locationsReads = intentReads(page, "locations");
  await prepareOpenDoughCandidates(page, frontendServices);
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent, development, intentChoice } = parts(page);
  const entry = candidatesRecord(intent).getByRole("article", {
    name: "launch-records-poll-waits",
  });
  await chooseOptimizationCandidates(intent);
  await expect(entry).toBeVisible();

  await development.click();
  await expect(intent).toBeHidden();
  await intentChoice.click();
  await expectIntentModeChosen(intent, "Optimization Candidates");
  await expect(entry).toBeVisible();
  expect(recordReads()).toBe(1);
  expect(locationsReads()).toBe(1);
});
