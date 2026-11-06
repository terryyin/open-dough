// An applied update that does not simply arrive: a failed update keeps the
// shown reading with the failure and Retry, including after Development →
// Intent and when the latest settings are unreadable
// (../../src/useIntentLocations.ts, ../../src/useIntentFileRead.ts,
// ../../src/IntentRevisionNotice.tsx). Malformed settings and held updates
// across projects: ./intent-revision-update-boundaries.spec.ts.

import { expect, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import { shortRevision } from "../dashboardParts.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";
import {
  intentGroupToggle,
  purposeRegion,
  revisionNotice,
} from "../intentPerspectivePage.ts";
import {
  authenticatedReadRoute,
  holdAuthenticatedReadsWhere,
} from "../holdAuthenticatedReads.ts";
import { pygardon } from "../intentCodeBrowseFixtures.ts";
import {
  featurePath,
  otherPath,
  publishedFeature,
} from "../intentJobsFeatureFixtures.ts";
import {
  intentReads,
  jobsFeatures,
  openWithFeatureSelected,
  publishedFiles,
} from "../intentRevisionJourney.ts";

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

test("Development → Intent during a held then failing update keeps the shown reading with its failure and Retry", async ({
  page,
}) => {
  const files = publishedFiles(jobsFeatures);
  const reads = intentReads(page);
  const { moveTrunk, intent, feature, source } = await openWithFeatureSelected(
    page,
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
  await notice.getByRole("button", { name: "Show latest" }).click();
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
  await notice.getByRole("button", { name: "Show latest" }).click();
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

  unreadable = false;
  await notice.getByRole("button", { name: "Retry" }).click();
  await expect(source).toContainText("Scenario: Purge a job");
  await expect(revisionNotice(intent)).toHaveCount(0);
  await untilPageReadsAnswered(page);
});
