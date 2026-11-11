import { fileSource, sourceFile } from "./intentCodeBrowsePage.ts";
// Intent's revision journeys: Pygardon published with Intent locations and
// its jobs feature selected, on a paused clock, with a trunk that moves on
// demand, and the Intent reads the page makes meanwhile.

import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";
import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead, untilPageReadsAnswered } from "./pageRequestNotes.ts";
import { expandIntentGroup } from "./intentPerspectivePage.ts";
import {
  pausePageClock,
  passTimeUntilCheckedAfterSettled,
} from "./autoRefreshJourney.ts";
import { publishMovingFiles } from "./publishedFiles.ts";
import { pygardon } from "./intentCodeBrowseFixtures.ts";
import {
  featurePath,
  otherFeature,
  otherPath,
  publishedFeature,
  settings,
} from "./intentJobsFeatureFixtures.ts";
import { intentSettingsText } from "./support/intentSettingsFile.ts";

// The jobs feature and another feature under the location.
export const jobsFeatures = {
  [featurePath]: publishedFeature,
  [otherPath]: otherFeature,
};

// Intent's reads of the boundary from here on, as `<what>@<revision>`: the
// locations, the Optimization Candidates record, or a file under the location.
// The CI status homepage's reads follow the observed work, not Intent's
// reading revision, and are not among them.
export function intentReads(page: Page) {
  const reads: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname !== authenticatedReadEndpoint) return;
    const params = url.searchParams;
    const what = params.get("intent") ?? params.get("path") ?? "";
    if (what.startsWith("ci-")) return;
    if (params.has("intent") || what.startsWith("e2e_test/")) {
      reads.push(`${what}@${params.get("revision")}`);
    }
  });
  return reads;
}

// Pygardon's published files with Intent locations and `features`.
export const publishedFiles = (features: Readonly<Record<string, string>>) => ({
  ...pygardon.files,
  ".planning/open-dough.json": intentSettingsText(settings),
  ...features,
});

// Pygardon published at `pygardon.revision` with the jobs feature selected
// and its Purpose read, on a page whose clock is paused; `moveTrunk` publishes
// a newer revision and lets the page observe it.
export async function openWithFeatureSelected(
  page: Page,
  files: Readonly<Record<string, string>>,
) {
  await page.setViewportSize({ width: 1280, height: 600 });
  await pausePageClock(page);
  const origin = publishMovingFiles(page, {
    repository: pygardon.repository,
    ref: pygardon.ref,
    revision: pygardon.revision,
    files,
  });
  await openUntilRead(page, "/?project=pygardon&perspective=intent");
  const { intent } = parts(page);
  await expandIntentGroup(intent, "e2e_test/features");
  const feature = sourceFile(intent, featurePath);
  await feature.click();
  const source = fileSource(intent, featurePath);
  await expect(source).toContainText("Scenario: Archive a job");
  const moveTrunk = async (
    revision: string,
    moved: Readonly<Record<string, string>>,
  ) => {
    origin.moveTrunk({ revision, files: moved });
    await passTimeUntilCheckedAfterSettled(page);
    await untilPageReadsAnswered(page);
  };
  return { moveTrunk, intent, feature, source };
}
