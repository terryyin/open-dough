import { openWithFeatureSelected } from "../../test-support/support/frontendIntentRevisionJourney.ts";
import { showLatestRevision } from "../../test-support/intentReadRecoveryPage.ts";
// An applied update that does not simply arrive: a failed update keeps the
// shown reading with the failure and Retry after Development → Intent; the
// failures themselves, unreadable and malformed settings and their Retry are
// proven mounted in ./intent-revision-update-failures.mounted.spec.ts
// (../../src/useIntentLocations.ts, ../../src/useIntentFileRead.ts,
// ../../src/IntentRevisionNotice.tsx).
// Held updates across projects: ./intent-revision-update-boundaries.spec.ts.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import { shortRevision } from "../../test-support/dashboardParts.ts";
import {
  browserRevision,
  intentGroupToggle,
  revisionNotice,
} from "../../test-support/intentPerspectivePage.ts";
import { holdAuthenticatedReadsWhere } from "../../test-support/holdAuthenticatedReads.ts";
import { pygardon } from "../../test-support/intentCodeBrowseFixtures.ts";
import {
  featurePath,
  publishedFeature,
} from "../../test-support/intentJobsFeatureFixtures.ts";
import {
  intentReads,
  jobsFeatures,
  publishedFiles,
} from "../../test-support/intentRevisionJourney.ts";

// Holds still released after a journey, so a failed one does not hang.
const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});
test("Development → Intent during a held then failing update keeps the shown reading with its failure and Retry", async ({
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
  const c = "ee".repeat(20);
  await moveTrunk(c, {
    ...files,
    [featurePath]: publishedFeature.replace("Archive a job", "Purge a job"),
  });
  const notice = revisionNotice(intent);
  const latest = await holdAuthenticatedReadsWhere(
    page,
    (params) =>
      params.get("intent") === "locations" && params.get("revision") === c,
    releases,
  );
  await showLatestRevision(notice).click();
  await expect.poll(latest.held).toBe(1);
  latest.fail();
  await expect(notice).toContainText(
    `Revision ${shortRevision(c)} could not be read`,
  );
  await expect(source).toContainText("Scenario: Archive a job");

  const again = await holdAuthenticatedReadsWhere(
    page,
    (params) =>
      params.get("intent") === "locations" && params.get("revision") === c,
    releases,
  );
  const { development, intentChoice } = parts(page);
  await development.click();
  await expect(intent).toHaveCount(0);
  await intentChoice.click();
  await expect.poll(again.held).toBe(1);
  await expect(browserRevision(intent)).toContainText(
    shortRevision(pygardon.revision),
  );
  await expect(source).toContainText("Scenario: Archive a job");
  await expect(feature).toHaveAttribute("aria-pressed", "true");
  again.fail();

  await expect(revisionNotice(intent)).toContainText(
    `New revision available — showing ${shortRevision(pygardon.revision)}`,
  );
  await expect(revisionNotice(intent)).toContainText(
    `Revision ${shortRevision(c)} could not be read: The local authenticated read could not be reached`,
  );
  await expect(revisionNotice(intent).getByRole("button")).toHaveText([
    "Retry",
  ]);
  await expect(browserRevision(intent)).toContainText(
    shortRevision(pygardon.revision),
  );
  await expect(source).toContainText("Scenario: Archive a job");
  await expect(feature).toHaveAttribute("aria-pressed", "true");
  await expect(intentGroupToggle(intent, "e2e_test/features")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  expect(
    reads.filter((each) => each === `locations@${pygardon.revision}`),
  ).toEqual([`locations@${pygardon.revision}`]);
});
