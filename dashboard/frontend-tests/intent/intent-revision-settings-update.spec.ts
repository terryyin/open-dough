import { openWithFeatureSelected } from "../../test-support/support/frontendIntentRevisionJourney.ts";
import {
  showLatestRevision,
  readRetry,
} from "../../test-support/intentReadRecoveryPage.ts";
// An unreadable latest settings answer keeps the accepted Project Intent
// source and Retry; successful retry moves the browser to that revision.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { shortRevision } from "../../test-support/dashboardParts.ts";
import { controlFrontendAuthenticatedRead } from "../../test-support/support/frontendAuthenticatedReadControl.ts";
import { pygardon } from "../../test-support/intentCodeBrowseFixtures.ts";
import {
  featurePath,
  publishedFeature,
} from "../../test-support/intentJobsFeatureFixtures.ts";
import {
  browserRevision,
  revisionNotice,
} from "../../test-support/intentPerspectivePage.ts";
import {
  jobsFeatures,
  publishedFiles,
} from "../../test-support/intentRevisionJourney.ts";
import { untilPageReadsAnswered } from "../../test-support/pageRequestNotes.ts";

test("an unreadable settings answer at the latest revision keeps the shown reading with Retry, which applies the update", async ({
  page,
  frontendServices,
}) => {
  const files = publishedFiles(jobsFeatures);
  const { moveTrunk, intent, feature, source } = await openWithFeatureSelected(
    page,
    frontendServices,
    files,
  );
  const c = "ef".repeat(20);
  await moveTrunk(c, {
    ...files,
    [featurePath]: publishedFeature.replace("Archive a job", "Purge a job"),
  });
  const locations = await controlFrontendAuthenticatedRead(
    page,
    (params) =>
      params.get("intent") === "locations" && params.get("revision") === c,
  );
  locations.respond({
    revision: c,
    locations: null,
    settingsProblem: "unreadable",
    recovery: "transient",
  });
  const notice = revisionNotice(intent);
  await showLatestRevision(notice).click();
  await expect(notice).toContainText(
    `New revision available — showing ${shortRevision(pygardon.revision)}`,
  );
  await expect(notice).toContainText(
    `Revision ${shortRevision(c)} could not be read: .planning/open-dough.json could not be read.`,
  );
  await expect(notice.getByRole("button")).toHaveText(["Retry"]);
  await expect(source).toContainText("Scenario: Archive a job");
  await expect(feature).toHaveAttribute("aria-pressed", "true");
  await expect(intent.locator(".intent-settings-problem")).toHaveCount(0);
  await expect(browserRevision(intent)).toContainText(
    shortRevision(pygardon.revision),
  );

  locations.pass();
  await readRetry(notice).click();
  await expect(source).toContainText("Scenario: Purge a job");
  await expect(revisionNotice(intent)).toHaveCount(0);
  await expect(browserRevision(intent)).toContainText(shortRevision(c));
  await untilPageReadsAnswered(page);
});
