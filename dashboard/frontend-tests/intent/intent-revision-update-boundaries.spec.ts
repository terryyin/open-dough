import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { openWithFeatureSelected } from "../../test-support/support/frontendIntentRevisionJourney.ts";
// A held update of a project left behind never shows in another's reading
// (../../src/useIntentLocations.ts, ../../src/IntentRevisionNotice.tsx).
// Malformed latest settings, and failed and unreadable updates that keep the
// shown reading: ./intent-revision-update-failures.mounted.spec.ts and
// ./intent-revision-update-outcomes.spec.ts.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { chooseProject } from "../../test-support/dashboardPage.ts";
import { shortRevision } from "../../test-support/dashboardParts.ts";
import { untilPageReadsAnswered } from "../../test-support/pageRequestNotes.ts";
import { ciPanel } from "../../test-support/intentCiStatusPage.ts";
import {
  browserRevision,
  intentGroupToggle,
  purposeRegion,
  revisionNotice,
} from "../../test-support/intentPerspectivePage.ts";
import { holdAuthenticatedReadsWhere } from "../../test-support/holdAuthenticatedReads.ts";
import {
  doughnut,
  pygardon,
} from "../../test-support/intentCodeBrowseFixtures.ts";
import {
  locationFiles,
  showLatestRevision,
} from "../../test-support/intentReadRecoveryPage.ts";
import {
  featurePath,
  publishedFeature,
} from "../../test-support/intentJobsFeatureFixtures.ts";
import {
  jobsFeatures,
  publishedFiles,
} from "../../test-support/intentRevisionJourney.ts";

// Holds still released after a journey, so a failed one does not hang.
const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

test("choosing another project while an update is held shows only that project's reading when it is answered", async ({
  page,
  frontendServices,
}) => {
  const files = publishedFiles(jobsFeatures);
  const { moveTrunk, intent } = await openWithFeatureSelected(
    page,
    frontendServices,
    files,
    {
      project: doughnut,
      locations: [
        makeMe.anIntentLocation
          .at("scripts")
          .ofKind("javascript", ["**/*.test.mjs"])
          .selecting(...Object.keys(locationFiles))
          .please(),
      ],
      files: locationFiles,
    },
  );
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
  await showLatestRevision(revisionNotice(intent)).click();
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
