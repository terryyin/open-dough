import { openWithFeatureSelected } from "../../test-support/support/frontendIntentRevisionJourney.ts";
import { filesColumn } from "../../test-support/intentModePage.ts";
import { sourceFile } from "../../test-support/intentCodeBrowsePage.ts";
import { showLatestRevision } from "../../test-support/intentReadRecoveryPage.ts";
// Development follows newer revisions while Intent keeps its reading behind
// the notice; a deleted selected feature is explained, with nothing else
// selected (../../src/IntentRevisionNotice.tsx, ../../src/pageIntentReading.tsx).
// Show latest keeping the reading: ./intent-revision-apply.mounted.spec.ts.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import { shortRevision } from "../../test-support/dashboardParts.ts";
import { untilPageReadsAnswered } from "../../test-support/pageRequestNotes.ts";
import {
  browserRevision,
  purposeRegion,
  revisionNotice,
} from "../../test-support/intentPerspectivePage.ts";
import { intentReadingPane } from "../../test-support/intentReadingPlacePage.ts";
import { pygardon } from "../../test-support/intentCodeBrowseFixtures.ts";
import {
  featurePath,
  otherPath,
  publishedFeature,
} from "../../test-support/intentJobsFeatureFixtures.ts";
import {
  intentReads,
  jobsFeatures,
  publishedFiles,
} from "../../test-support/intentRevisionJourney.ts";

test("Development follows a new revision while Intent, opened again, keeps its reading behind the notice", async ({
  page,
  frontendServices,
}) => {
  const files = publishedFiles(jobsFeatures);
  const reads = intentReads(page);
  const { moveTrunk, intent, feature, source } = await openWithFeatureSelected(
    page,
    frontendServices,
    files,
  );
  const { development, intentChoice, status } = parts(page);
  await development.click();
  await expect(intent).toBeHidden();

  const revision = "ea".repeat(20);
  await moveTrunk(revision, {
    ...files,
    [featurePath]: publishedFeature.replace("Archive a job", "Purge a job"),
  });
  await expect(status).toContainText(
    `Published work read at revision ${shortRevision(revision)}`,
  );

  await intentChoice.click();
  await expect(source).toContainText("Scenario: Archive a job");
  await expect(revisionNotice(intent)).toContainText(
    `New revision available — showing ${shortRevision(pygardon.revision)}`,
  );
  await expect(feature).toHaveAttribute("aria-pressed", "true");
  await untilPageReadsAnswered(page);
  await expect(browserRevision(intent)).toContainText(
    shortRevision(pygardon.revision),
  );
  expect(reads).toEqual([
    `locations@${pygardon.revision}`,
    `${featurePath}@${pygardon.revision}`,
  ]);
});

test("a selected feature the latest revision deleted is explained, with nothing else selected", async ({
  page,
  frontendServices,
}) => {
  const files = publishedFiles(jobsFeatures);
  const reads = intentReads(page);
  const { moveTrunk, intent } = await openWithFeatureSelected(
    page,
    frontendServices,
    files,
  );

  const revision = "e9".repeat(20);
  const remaining = Object.fromEntries(
    Object.entries(files).filter(([path]) => path !== featurePath),
  );
  await moveTrunk(revision, remaining);
  await showLatestRevision(revisionNotice(intent)).click();

  await expect(purposeRegion(intent)).toContainText(
    `${featurePath} is not in revision ${shortRevision(revision)}`,
  );
  await untilPageReadsAnswered(page);
  await expect(sourceFile(intent, otherPath)).toBeVisible();
  await expect(
    filesColumn(intent).locator('[aria-pressed="true"]'),
  ).toHaveCount(0);
  await expect(intent.getByLabel(/ source$/)).toHaveCount(0);
  await expect(intentReadingPane(intent)).toBeFocused();
  await expect(browserRevision(intent)).toContainText(shortRevision(revision));
  expect(reads.slice(2)).toEqual([`locations@${revision}`]);
});
