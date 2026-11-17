import { prepareFrontendReuseJobs } from "../../tests/support/frontendIntentReuseAnswers.ts";
import { prepareOpenDoughCandidates } from "../../tests/support/frontendIntentCandidates.ts";
import { fileSource, sourceFile } from "../../tests/intentCodeBrowsePage.ts";
// Intent asks the read boundary once for each answer fixed at the revision
// shown (../../src/answerMemo.ts, ../../src/repositoryFileReads.ts): reopening a
// feature reads its text no more, and leaving for Development and returning
// reads neither the locations nor the Test Optimization Candidates record
// again. What was read before shows at once, without a reading moment.
// With a selected story: ./intent-read-reuse-story.spec.ts.

import type { Page, Request } from "@playwright/test";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import { parts } from "../../tests/dashboardPage.ts";
import { openUntilRead } from "../../tests/pageRequestNotes.ts";
import {
  candidatesRecord,
  chooseOptimizationCandidates,
  expectIntentModeChosen,
} from "../../tests/intentModePage.ts";
import { expandIntentGroup } from "../../tests/intentPerspectivePage.ts";
import {
  featurePath,
  otherPath,
} from "../../tests/intentJobsFeatureFixtures.ts";

// The page's reads of the authenticated read boundary matching `which`.
function boundaryReads(
  page: Page,
  which: (params: URLSearchParams) => boolean,
) {
  const reads: Request[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === authenticatedReadEndpoint && which(url.searchParams))
      reads.push(request);
  });
  return () => reads.length;
}

const pathReads = (page: Page, path: string) =>
  boundaryReads(page, (params) => params.get("path") === path);
const intentReads = (page: Page, intent: string) =>
  boundaryReads(page, (params) => params.get("intent") === intent);

// Every "Reading …" text Intent shows from now on, however briefly: a
// mutation observer sees each change React commits before anything else runs.
async function readingMoments(page: Page) {
  await page.evaluate(() => {
    const seen: string[] = [];
    (window as unknown as { readingMoments: string[] }).readingMoments = seen;
    new MutationObserver(() => {
      for (const quiet of document.querySelectorAll(
        'main[aria-label="Intent"] .quiet',
      )) {
        const text = quiet.textContent;
        if (text.startsWith("Reading ")) seen.push(text);
      }
    }).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  });
  return () =>
    page.evaluate(
      () => (window as unknown as { readingMoments: string[] }).readingMoments,
    );
}

test("reopening a feature and returning from Development ask nothing more and show without a reading moment", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const featureReads = pathReads(page, featurePath);
  const locationsReads = intentReads(page, "locations");
  await prepareFrontendReuseJobs(page, frontendServices);
  await openUntilRead(page, "/?project=pygardon&perspective=intent");
  const { intent, development, intentChoice } = parts(page);
  await expandIntentGroup(intent, "e2e_test/features");
  const open = async (path: string, text: string) => {
    await sourceFile(intent, path).click();
    await expect(fileSource(intent, path)).toContainText(text);
  };
  await open(featurePath, "Scenario: Archive a job");
  await open(otherPath, "Report free space");

  const moments = await readingMoments(page);
  await open(featurePath, "Scenario: Archive a job");
  await open(otherPath, "Report free space");
  expect(featureReads()).toBe(1);

  await development.click();
  await expect(intent).toBeHidden();
  await intentChoice.click();
  await expect(fileSource(intent, otherPath)).toContainText(
    "Report free space",
  );
  expect(locationsReads()).toBe(1);
  expect(featureReads()).toBe(1);
  expect(await moments()).toEqual([]);
});

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
