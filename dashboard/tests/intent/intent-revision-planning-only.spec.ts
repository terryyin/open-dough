import { showLatestRevision } from "../intentReadRecoveryPage.ts";
// The Project Intent browser names accepted locations even with no selected
// file, and a planning-only refresh leaves identical tests at a newer source.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import { shortRevision } from "../dashboardParts.ts";
import { holdAuthenticatedReadsWhere } from "../holdAuthenticatedReads.ts";
import { activateIntentHome, ciPanel } from "../intentCiStatusPage.ts";
import { pygardon } from "../intentCodeBrowseFixtures.ts";
import { featurePath } from "../intentJobsFeatureFixtures.ts";
import { browserRevision, revisionNotice } from "../intentPerspectivePage.ts";
import {
  intentReads,
  jobsFeatures,
  openWithFeatureSelected,
  publishedFiles,
} from "../intentRevisionJourney.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";

const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

test("a planning-only update keeps a persistent browser revision with no file selected", async ({
  page,
}) => {
  const files = publishedFiles(jobsFeatures);
  const reads = intentReads(page);
  const { moveTrunk, intent, feature, source } = await openWithFeatureSelected(
    page,
    files,
  );
  const originalText = (await source.textContent()) ?? "";
  await activateIntentHome(intent);
  await expect(intent.getByLabel(/ source$/)).toHaveCount(0);
  await expect(browserRevision(intent)).toHaveText(
    `Test browser at ${shortRevision(pygardon.revision)}`,
  );

  const revision = "f0".repeat(20);
  const planning = makeMe.aRepository
    .withRevision("planning-only", {
      backlog: null,
      files: { ".planning/later.md": "Plan the next story.\n" },
    })
    .please().revisions[0];
  await moveTrunk(revision, { ...files, ...planning.files });
  await expect(revisionNotice(intent)).toBeVisible();
  await expect(browserRevision(intent)).toHaveText(
    `Test browser at ${shortRevision(pygardon.revision)}`,
  );
  expect(reads).toHaveLength(2);

  const latest = await holdAuthenticatedReadsWhere(
    page,
    (params) =>
      params.get("intent") === "locations" &&
      params.get("revision") === revision,
    releases,
  );
  await showLatestRevision(revisionNotice(intent)).click();
  await expect.poll(latest.held).toBe(1);
  await expect(revisionNotice(intent)).toContainText("Updating…");
  await expect(browserRevision(intent)).toHaveText(
    `Test browser at ${shortRevision(pygardon.revision)}`,
  );
  await expect(ciPanel(intent)).toBeVisible();
  latest.release();
  await expect(browserRevision(intent)).toHaveText(
    `Test browser at ${shortRevision(revision)}`,
  );
  await expect(revisionNotice(intent)).toHaveCount(0);
  await expect(intent.getByLabel(/ source$/)).toHaveCount(0);
  await feature.click();
  await expect(source).toHaveText(originalText);
  await untilPageReadsAnswered(page);
  expect(reads.slice(2)).toEqual([
    `locations@${revision}`,
    `${featurePath}@${revision}`,
  ]);

  const { development, intentChoice } = parts(page);
  await development.click();
  await intentChoice.click();
  await expect(browserRevision(intent)).toHaveText(
    `Test browser at ${shortRevision(revision)}`,
  );
  await expect(source).toHaveText(originalText);
});
