import { prepareFrontendReuseJobs } from "../../test-support/support/frontendIntentReuseAnswers.ts";
import {
  fileSource,
  sourceFile,
} from "../../test-support/intentCodeBrowsePage.ts";
// Intent's selection outlives reads of the same revision
// (../../src/IntentBrowser.tsx, ../../src/IntentPerspective.tsx): the
// published work's detail completing during startup, at the same revision,
// neither reads the locations again nor clears the expanded group, the
// selected feature or its Purpose. A feature still being read:
// ./intent-cached-reads.spec.ts. Newer revisions:
// ./intent-revision-notice.spec.ts.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import { untilPageReadsAnswered } from "../../test-support/pageRequestNotes.ts";
import {
  countLocationsReads,
  expandIntentGroup,
  intentGroupToggle,
} from "../../test-support/intentPerspectivePage.ts";
import { holdAuthenticatedReadsOf } from "../../test-support/holdAuthenticatedReads.ts";
import { featurePath } from "../../test-support/intentJobsFeatureFixtures.ts";

// Holds still released after a journey, so a failed one does not hang.
const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

test("a feature selected while startup detail completes stays selected with its Purpose", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const locationsReads = countLocationsReads(page);
  await prepareFrontendReuseJobs(page, frontendServices);
  // The queued story's Goal is part of the published work's detail; holding
  // it keeps startup unfinished while the developer picks a feature.
  const detail = await holdAuthenticatedReadsOf(
    page,
    ".planning/seeds/SEED-303-queued.md",
    releases,
  );
  await page.goto("/?project=pygardon&perspective=intent");
  const { intent } = parts(page);
  await expandIntentGroup(intent, "e2e_test/features");
  await sourceFile(intent, featurePath).click();
  const source = fileSource(intent, featurePath);
  await expect(source).toContainText("Scenario: Archive a job");
  await expect.poll(detail.held).toBeGreaterThan(0);
  expect(locationsReads()).toBe(1);

  detail.release();
  await untilPageReadsAnswered(page);
  await expect(intentGroupToggle(intent, "e2e_test/features")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(sourceFile(intent, featurePath)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(source).toContainText("Scenario: Archive a job");
  expect(locationsReads()).toBe(1);
});
