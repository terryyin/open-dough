import {
  prepareDoughnutCandidates,
  prepareOpenDoughCandidates,
  preparePygardonCandidates,
} from "../../test-support/support/frontendIntentCandidates.ts";
import {
  fileSource,
  sourceFile,
} from "../../test-support/intentCodeBrowsePage.ts";
// Project Intent's Optimization Candidates entries whose recorded paths
// cannot simply open: an ambiguous name lists its full paths, a moved path
// opens nothing, a path outside configured locations is explained, and prose
// naming no path leaves no gap (SEED-192 examples 3, 4 and 6).

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import {
  candidatesRecord,
  chooseOptimizationCandidates,
  expectCandidatesRevision,
  intentModeTab,
} from "../../test-support/intentModePage.ts";
import { openUntilRead } from "../../test-support/pageRequestNotes.ts";
import {
  doughnutFeaturePath,
  openDoughSpecPaths,
  pygardonClipPath,
} from "../../test-support/intentCandidatesFixtures.ts";
import {
  doughnut,
  openDough,
  pygardon,
} from "../../test-support/intentCodeBrowseFixtures.ts";

test("Intent lists an ambiguous bare name's full paths and opens nothing for a moved path", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await prepareOpenDoughCandidates(page, frontendServices);

  await openUntilRead(page, "/?project=open-dough");
  const { intent } = parts(page);
  await parts(page).intentChoice.click();
  await chooseOptimizationCandidates(intent);
  await expectCandidatesRevision(intent, openDough.revision);
  const candidatesTab = intentModeTab(intent, "Optimization Candidates");

  await test.step("Ex 3: ambiguous bare name lists two full paths; neither opens alone", async () => {
    const ambiguous = candidatesRecord(intent).getByRole("article", {
      name: "story-review-completed-journey-landed-runs-tail",
    });
    await expect(ambiguous).toContainText("names several files");
    await expect(
      sourceFile(ambiguous, openDoughSpecPaths.storyReview),
    ).toBeVisible();
    await expect(
      sourceFile(ambiguous, openDoughSpecPaths.storyReviewBoundary),
    ).toBeVisible();
    await expect(intent.getByLabel(/source$/)).toBeHidden();
    await sourceFile(ambiguous, openDoughSpecPaths.storyReview).click();
    await expect(
      fileSource(intent, openDoughSpecPaths.storyReview),
    ).toBeVisible();
  });

  await test.step("Ex 6: moved path is not published; opens nothing", async () => {
    await chooseOptimizationCandidates(intent);
    const moved = candidatesRecord(intent).getByRole("article", {
      name: "moved-test-after-record",
    });
    await expect(moved).toContainText("not published at this revision");
    await expect(sourceFile(moved, openDoughSpecPaths.movedAway)).toHaveCount(
      0,
    );
    await expect(candidatesTab).toHaveAttribute("aria-selected", "true");
  });
});

test("Intent explains outside configured locations for a Pygardon-shaped python path", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await preparePygardonCandidates(page, frontendServices, "gherkin only");

  await openUntilRead(page, "/?project=pygardon");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await chooseOptimizationCandidates(intent);
  await expectCandidatesRevision(intent, pygardon.revision);

  const entry = candidatesRecord(intent).getByRole("article", {
    name: "real-h264-codec-roundtrip",
  });
  await expect(entry).toContainText(pygardonClipPath);
  await expect(entry).toContainText("outside configured Intent locations");
  await expect(sourceFile(entry, pygardonClipPath)).toHaveCount(0);
  await expect(intent.getByLabel(/source$/)).toHaveCount(0);
});

test("Intent leaves Doughnut prose without a gap and opens a unique bare feature name", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await prepareDoughnutCandidates(page, frontendServices);

  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await chooseOptimizationCandidates(intent);
  await expectCandidatesRevision(intent, doughnut.revision);

  const prose = candidatesRecord(intent).getByRole("article", {
    name: "frontend-browser-file-isolation",
  });
  await expect(prose).toContainText("no path named here");
  await expect(prose).not.toContainText("not published");
  await expect(prose).not.toContainText("outside configured");
  await expect(prose).not.toContainText("names several files");

  const bare = candidatesRecord(intent).getByRole("article", {
    name: "e2e-batch-cold-start",
  });
  await sourceFile(bare, "cli_notebook_lfs.feature").click();
  await expect(fileSource(intent, doughnutFeaturePath)).toContainText(
    "Feature: notebook LFS",
  );
});
