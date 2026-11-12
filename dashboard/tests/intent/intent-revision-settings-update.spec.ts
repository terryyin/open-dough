import { showLatestRevision, readRetry } from "../intentReadRecoveryPage.ts";
// An unreadable latest settings answer keeps the accepted Project Intent
// source and Retry; successful retry moves the browser to that revision.

import { expect, test } from "../dashboardTest.ts";
import { shortRevision } from "../dashboardParts.ts";
import { authenticatedReadRoute } from "../holdAuthenticatedReads.ts";
import { pygardon } from "../intentCodeBrowseFixtures.ts";
import { featurePath, publishedFeature } from "../intentJobsFeatureFixtures.ts";
import { browserRevision, revisionNotice } from "../intentPerspectivePage.ts";
import {
  jobsFeatures,
  openWithFeatureSelected,
  publishedFiles,
} from "../intentRevisionJourney.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";

test("an unreadable settings answer at the latest revision keeps the shown reading with Retry, which applies the update", async ({
  page,
}) => {
  const files = publishedFiles(jobsFeatures);
  const { moveTrunk, intent, feature, source } = await openWithFeatureSelected(
    page,
    files,
  );
  const c = "ef".repeat(20);
  await moveTrunk(c, {
    ...files,
    [featurePath]: publishedFeature.replace("Archive a job", "Purge a job"),
  });
  let unreadable = true;
  await page.route(authenticatedReadRoute, async (route) => {
    const params = new URL(route.request().url()).searchParams;
    if (
      unreadable &&
      params.get("intent") === "locations" &&
      params.get("revision") === c
    ) {
      await route.fulfill({
        json: {
          revision: c,
          locations: null,
          settingsProblem: "unreadable",
          recovery: "transient",
        },
      });
      return;
    }
    await route.fallback();
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

  unreadable = false;
  await readRetry(notice).click();
  await expect(source).toContainText("Scenario: Purge a job");
  await expect(revisionNotice(intent)).toHaveCount(0);
  await expect(browserRevision(intent)).toContainText(shortRevision(c));
  await untilPageReadsAnswered(page);
});
