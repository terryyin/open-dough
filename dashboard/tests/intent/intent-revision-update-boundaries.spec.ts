// An applied update that replaces the reading or must not cross projects:
// an unusable latest settings file takes the reading's focus into its
// explanation, and a held update of a project left behind never shows in
// another's reading (../../src/useIntentLocations.ts,
// ../../src/IntentRevisionNotice.tsx). Failed and unreadable updates that keep
// the shown reading: ./intent-revision-update-outcomes.spec.ts.

import { expect, test } from "../dashboardTest.ts";
import { chooseProject } from "../dashboardPage.ts";
import { shortRevision } from "../dashboardParts.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";
import { ciPanel } from "../intentCiStatusPage.ts";
import {
  browserRevision,
  intentGroupToggle,
  purposeRegion,
  revisionNotice,
} from "../intentPerspectivePage.ts";
import { holdAuthenticatedReadsWhere } from "../holdAuthenticatedReads.ts";
import {
  doughnut,
  doughnutSettings,
  pygardon,
  publishIntentProject,
} from "../intentCodeBrowseFixtures.ts";
import { locationFiles } from "../intentReadRecoveryPage.ts";
import { featurePath, publishedFeature } from "../intentJobsFeatureFixtures.ts";
import {
  jobsFeatures,
  openWithFeatureSelected,
  publishedFiles,
} from "../intentRevisionJourney.ts";

// Holds still released after a journey, so a failed one does not hang.
const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

test("an unusable settings file at the latest revision takes the reading's focus into its explanation", async ({
  page,
}) => {
  const files = publishedFiles(jobsFeatures);
  const { moveTrunk, intent } = await openWithFeatureSelected(page, files);
  await moveTrunk("ec".repeat(20), {
    ...files,
    ".planning/open-dough.json": "{\n",
  });
  await revisionNotice(intent)
    .getByRole("button", { name: "Show latest" })
    .click();
  const explanation = intent.locator(
    '[role="tabpanel"]:has(.intent-settings-problem)',
  );
  await expect(explanation).toContainText("is not valid JSON");
  await expect(explanation).toBeFocused();
  await expect(browserRevision(intent)).toContainText(
    shortRevision("ec".repeat(20)),
  );
});

test("choosing another project while an update is held shows only that project's reading when it is answered", async ({
  page,
}) => {
  await publishIntentProject(page, doughnut, doughnutSettings, locationFiles);
  const files = publishedFiles(jobsFeatures);
  const { moveTrunk, intent } = await openWithFeatureSelected(page, files);
  const c = "ed".repeat(20);
  await moveTrunk(c, {
    ...files,
    [featurePath]: publishedFeature.replace("Archive a job", "Purge a job"),
  });
  const latest = await holdAuthenticatedReadsWhere(
    page,
    (params) =>
      params.get("source") === "pygardon" &&
      params.get("intent") === "locations" &&
      params.get("revision") === c,
    releases,
  );
  await revisionNotice(intent)
    .getByRole("button", { name: "Show latest" })
    .click();
  await expect.poll(latest.held).toBe(1);
  await expect(browserRevision(intent)).toContainText(
    shortRevision(pygardon.revision),
  );

  await chooseProject(page, "Doughnut");
  await expect(intentGroupToggle(intent, "scripts")).toBeVisible();
  latest.release();
  await untilPageReadsAnswered(page);
  await expect(intentGroupToggle(intent, "scripts")).toBeVisible();
  await expect(intentGroupToggle(intent, "e2e_test/features")).toHaveCount(0);
  await expect(intent.getByText(featurePath)).toHaveCount(0);
  await expect(intent).not.toContainText("Purge a job");
  await expect(revisionNotice(intent)).toHaveCount(0);
  await expect(ciPanel(intent)).toBeVisible();
  await expect(purposeRegion(intent)).toHaveCount(0);
  await expect(browserRevision(intent)).toContainText(
    shortRevision(doughnut.revision),
  );
});
