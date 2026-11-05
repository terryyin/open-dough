// An applied update that does not simply arrive: a failed update keeps the
// shown reading with the failure and Retry, an unusable latest settings file
// takes the reading's focus into its explanation, and a held update of a
// project left behind never shows in another's reading
// (../src/useIntentLocations.ts, ../src/useIntentFileRead.ts,
// ../src/IntentRevisionNotice.tsx).

import { expect, test } from "./dashboardTest.ts";
import { chooseProject } from "./projectChoice.ts";
import { shortRevision } from "./dashboardParts.ts";
import { untilPageReadsAnswered } from "./pageRequestNotes.ts";
import { ciPanel } from "./intentCiStatusPage.ts";
import {
  intentGroupToggle,
  purposeRegion,
  revisionNotice,
} from "./intentPerspectivePage.ts";
import { holdAuthenticatedReadsWhere } from "./holdAuthenticatedReads.ts";
import {
  doughnut,
  doughnutSettings,
  publishIntentProject,
  pygardon,
} from "./intentCodeBrowseFixtures.ts";
import { locationFiles } from "./intentReadRecoveryPage.ts";
import {
  featurePath,
  otherPath,
  publishedFeature,
} from "./intentJobsFeatureFixtures.ts";
import {
  intentReads,
  jobsFeatures,
  openWithFeatureSelected,
  publishedFiles,
} from "./intentRevisionJourney.ts";

// Holds still released after a journey, so a failed one does not hang.
const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

test("a failed update keeps the shown reading with its failure and Retry, which applies the update", async ({
  page,
}) => {
  const files = publishedFiles(jobsFeatures);
  const reads = intentReads(page);
  const { moveTrunk, intent, feature, source } = await openWithFeatureSelected(
    page,
    files,
  );
  const c = "eb".repeat(20);
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
  await notice.getByRole("button", { name: "Show latest" }).click();
  await expect.poll(latest.held).toBe(1);
  latest.fail();

  // The locations at the shown revision stay browsable, with the selection,
  // its text and the focus; the failure and Retry stand beside the notice.
  await expect(notice).toContainText(
    `New revision available — showing ${shortRevision(pygardon.revision)}`,
  );
  await expect(notice).toContainText(
    `Revision ${shortRevision(c)} could not be read: The local authenticated read could not be reached`,
  );
  await expect(notice).not.toContainText("Updating…");
  await expect(notice.getByRole("button")).toHaveText(["Retry"]);
  await expect(source).toContainText("Scenario: Archive a job");
  await expect(feature).toHaveAttribute("aria-pressed", "true");
  await expect(feature).toBeFocused();
  await expect(intentGroupToggle(intent, "e2e_test/features")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await intent.getByRole("button", { name: otherPath, exact: true }).click();
  await expect(intent.getByLabel(`${otherPath} source`)).toContainText(
    "Report free space",
  );
  await feature.click();
  await expect(source).toContainText("Scenario: Archive a job");

  // The selected file's read at the latest revision fails too: its earlier
  // text stays under the failure, and its own Retry reads it.
  const latestText = await holdAuthenticatedReadsWhere(
    page,
    (params) =>
      params.get("path") === featurePath && params.get("revision") === c,
    releases,
  );
  await notice.getByRole("button", { name: "Retry" }).click();
  await expect.poll(latestText.held).toBe(1);
  await expect(notice).toHaveCount(0);
  await expect(feature).toBeFocused();
  latestText.fail();
  const purpose = purposeRegion(intent);
  await expect(purpose.getByRole("alert")).toHaveText(
    `${featurePath} could not be read at revision ${shortRevision(c)}; showing ${shortRevision(pygardon.revision)}. Retry`,
  );
  await expect(source).toContainText("Scenario: Archive a job");
  await purpose.getByRole("button", { name: "Retry" }).click();
  await expect(source).toContainText("Scenario: Purge a job");
  await expect(purpose.getByRole("alert")).toHaveCount(0);
  await untilPageReadsAnswered(page);
  expect(reads.slice(2)).toEqual([
    `locations@${c}`,
    `${otherPath}@${pygardon.revision}`,
    `locations@${c}`,
    `${featurePath}@${c}`,
    `${featurePath}@${c}`,
  ]);
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
});
