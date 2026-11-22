import { frontendFileDiff } from "../../test-support/support/frontendStoryReview.ts";
import { showLatestRevision } from "../../test-support/intentReadRecoveryPage.ts";
// Project refresh preserves a real Done story's selected historical Purpose
// file and reading place, including its preceding cycle through all Done tabs;
// choosing Proof then survives a later Project Intent visit and the story keeps
// its Intent coverage report.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { pausePageClock } from "../../test-support/autoRefreshJourney.ts";
import {
  backToStory,
  openProjectIntent,
  projectIntentLink,
  returnToStory,
  filesColumn,
} from "../../test-support/intentModePage.ts";
import {
  browserRevision,
  expandIntentGroup,
  expandIntentFolders,
  fileReadingTab,
  proofRegion,
  revisionNotice,
} from "../../test-support/intentPerspectivePage.ts";
import {
  intentReadingScroll,
  scrollIntentReadingHalfway,
} from "../../test-support/intentReadingPlacePage.ts";
import { prepareFrontendDoneIntent } from "../../test-support/support/frontendIntentDoneStory.ts";
import { selectDoneStoryInIntent } from "../../test-support/support/selectDoneStoryInIntent.ts";
import { advanceFrontendDoneProject } from "../../test-support/support/frontendDoneProjectRefresh.ts";
import { preholdRevisionStreamSlots } from "../../test-support/support/revisionStreamSlots.ts";
import { recordIntentLocations } from "../../test-support/support/intentDoneProjectRefresh.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  chooseStoryTab,
  intentFile,
  storyHeaderReading,
  intentDiffReading,
  readIntentDiff,
} from "../../test-support/support/intentStoryPage.ts";
import { lines } from "../../test-support/support/storyReviewWorktree.ts";

test("project refresh returns the same Done historical Purpose file and reading place after cycling all Done tabs, then Proof survives a later Project Intent visit", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await pausePageClock(page);
  const longFile = "dashboard/tests/boundary/deep/long.spec.ts";
  const report =
    "Outcome: Caught\nEvidence: The saved historical assessment.\n";
  const intentCoverage = makeMe.aDoneRecord
    .withIntentCoverage({ report })
    .please().intentCoverage;
  if (intentCoverage === undefined)
    throw new Error("The completed story fixture needs its saved assessment.");
  const { locations, firstRequested } = recordIntentLocations(page);
  await preholdRevisionStreamSlots(page);
  const { completion, review } = await prepareFrontendDoneIntent(
    page,
    frontendServices,
    intentCoverage,
    {
      files: { [longFile]: lines("historical", 120) },
      changed: [
        makeMe.aReviewedFile.with({ kind: "added", path: longFile }).please(),
      ],
      locations: [
        makeMe.anIntentLocation
          .at("dashboard/tests")
          .ofKind("typescript", ["**/*.spec.ts"])
          .selecting(longFile)
          .please(),
      ],
    },
  );
  review.answerFile(
    frontendFileDiff(longFile, lines("historical", 120).trimEnd().split("\n")),
    longFile,
  );
  const published = frontendServices.revision;
  const { intent } = await selectDoneStoryInIntent(page);
  await firstRequested;
  expect(locations).toEqual([completion]);
  await chooseStoryTab(intent, "Changes");
  await expect(filesColumn(intent)).toBeVisible();
  expect(locations).toEqual([completion]);
  await openProjectIntent(intent);
  await expect(filesColumn(intent)).toBeVisible();
  expect(locations).toEqual([completion, published]);
  await expect(browserRevision(intent)).toContainText(published.slice(0, 7));
  await returnToStory(intent);
  await chooseStoryTab(intent, "Changes");
  await expandIntentGroup(intent, "dashboard/tests");
  await expandIntentFolders(intent, "dashboard/tests");
  const selected = `Added ${longFile}`;
  await intentFile(intent, selected).click();
  await expect(intentDiffReading(intent).code).toHaveAttribute(
    "aria-busy",
    "false",
  );
  const offset = await scrollIntentReadingHalfway(intent);
  const originalDiff = await readIntentDiff(intent);
  const revisions = storyHeaderReading(intent).revisions;
  const endpoints = await revisions.innerText();
  expect(endpoints).toContain(completion.slice(0, 7));
  const laterRevision = await advanceFrontendDoneProject(
    page,
    frontendServices,
  );
  for (const tab of ["CI comparison", "Intent coverage", "Changes"] as const)
    await chooseStoryTab(intent, tab);
  await openProjectIntent(intent);
  await expect(revisionNotice(intent)).toBeVisible();
  await expect(browserRevision(intent)).toContainText(published.slice(0, 7));
  await showLatestRevision(revisionNotice(intent)).click();
  await expect(revisionNotice(intent)).toHaveCount(0);
  await expect(browserRevision(intent)).toContainText(
    laterRevision.slice(0, 7),
  );
  expect(locations).toEqual([completion, published, laterRevision]);
  await backToStory(intent).focus();
  await page.keyboard.press("Enter");
  await expect(projectIntentLink(intent)).toBeFocused();
  await expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a");
  await expect(intentFile(intent, selected)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(fileReadingTab(intent, "Purpose")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(intentDiffReading(intent).code).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await expect.poll(() => intentReadingScroll(intent)).toBe(offset);
  expect(await readIntentDiff(intent)).toBe(originalDiff);
  await expect(revisions).toHaveText(endpoints);
  await fileReadingTab(intent, "Proof").click();
  await expect(proofRegion(intent)).toBeVisible();
  await openProjectIntent(intent);
  await expect(browserRevision(intent)).toContainText(
    laterRevision.slice(0, 7),
  );
  await returnToStory(intent);
  await expect(intentFile(intent, selected)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(fileReadingTab(intent, "Proof")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(proofRegion(intent)).toBeVisible();
  await chooseStoryTab(intent, "Intent coverage");
  await expect(intent.locator(".intent-story-coverage-text")).toHaveText(
    report,
  );
});
