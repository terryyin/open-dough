import { openWithFeatureSelected } from "../../test-support/support/frontendIntentRevisionJourney.ts";
import { activateIntentHome } from "../../test-support/intentCiStatusPage.ts";

// With a newer revision waiting behind its notice, directly activating Project
// Intent's CI status tab (../../src/IntentPage.tsx) returns home, keeping that
// notice and the shown revision and reading nothing newer. Activation within
// a story's or the project's scope: ./intent-home-activation-scope.spec.ts.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { pygardon } from "../../test-support/intentCodeBrowseFixtures.ts";
import { revisionNotice } from "../../test-support/intentPerspectivePage.ts";
import { untilPageReadsAnswered } from "../../test-support/pageRequestNotes.ts";
import { shortRevision } from "../../test-support/dashboardParts.ts";
import {
  intentReads,
  jobsFeatures,
  publishedFiles,
} from "../../test-support/intentRevisionJourney.ts";

test("with a newer revision waiting behind its notice, activating CI status returns home and keeps the notice and the shown revision", async ({
  page,
  frontendServices,
}) => {
  const files = publishedFiles(jobsFeatures);
  const reads = intentReads(page);
  const { moveTrunk, intent, feature } = await openWithFeatureSelected(
    page,
    frontendServices,
    files,
  );
  await moveTrunk("eb".repeat(20), files);
  const waiting = `New revision available — showing ${shortRevision(pygardon.revision)}`;
  const notice = revisionNotice(intent);
  await expect(notice).toContainText(waiting);

  await activateIntentHome(intent);
  await expect(feature).toHaveAttribute("aria-pressed", "false");
  await expect(notice).toHaveCount(1);
  await expect(notice).toContainText(waiting);
  await expect(notice.getByRole("button")).toHaveText(["Show latest"]);
  await untilPageReadsAnswered(page);
  expect(reads.filter((read) => read.startsWith("locations@"))).toEqual([
    `locations@${pygardon.revision}`,
  ]);
});
