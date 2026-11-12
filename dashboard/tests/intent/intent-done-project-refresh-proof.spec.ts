import { showLatestRevision } from "../intentReadRecoveryPage.ts";
// After project refresh restores a real Done file's ready Purpose, choosing
// Proof survives a roundtrip to refreshed Project Intent and retains its report.

import { makeMe } from "../../../tests/support/makeMe.mjs";
import { pausePageClock } from "../autoRefreshJourney.ts";
import {
  backToStory,
  openProjectIntent,
  projectIntentLink,
  returnToStory,
  filesColumn,
} from "../intentModePage.ts";
import {
  browserRevision,
  expandIntentGroup,
  expandIntentFolders,
  fileReadingTab,
  proofRegion,
  revisionNotice,
} from "../intentPerspectivePage.ts";
import { selectCompletedStoryInIntent } from "../support/intentCompletedStory.ts";
import {
  advanceDoneProject,
  recordIntentLocations,
} from "../support/intentDoneProjectRefresh.ts";
import { expect, test } from "../support/preparationPage.ts";
import {
  chooseStoryTab,
  intentFile,
  storyHeaderReading,
  intentDiffReading,
} from "../support/intentStoryPage.ts";
import { lines } from "../support/storyReviewWorktree.ts";

test("project refresh restores Done historical Purpose before Proof survives a later Project Intent visit", async ({
  page,
  origin,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await pausePageClock(page);
  const longFile = "dashboard/tests/boundary/deep/long.spec.ts";
  const implementation = makeMe.aRepository
    .withRevision("story", {
      backlog: null,
      files: { [longFile]: lines("historical", 120) },
    })
    .please().revisions[0];
  const report =
    "Outcome: Caught\nEvidence: The saved historical assessment.\n";
  const intentCoverage = makeMe.aDoneRecord
    .withIntentCoverage({ report })
    .please().intentCoverage;
  if (intentCoverage === undefined)
    throw new Error("The completed story fixture needs its saved assessment.");
  const { locations, firstRequested } = recordIntentLocations(page);
  const { intent, completion, published } = await selectCompletedStoryInIntent(
    page,
    origin,
    { implementation, intentCoverage, interleaved: false },
  );
  await firstRequested;
  expect(locations).toEqual([completion]);
  await chooseStoryTab(intent, "Changed tests");
  await expect(filesColumn(intent)).toBeVisible();
  expect(locations).toEqual([completion]);
  await openProjectIntent(intent);
  await expect(filesColumn(intent)).toBeVisible();
  expect(locations).toEqual([completion, published]);
  await expect(browserRevision(intent)).toContainText(published.slice(0, 7));
  await returnToStory(intent);
  await chooseStoryTab(intent, "Changed tests");
  await expandIntentGroup(intent, "dashboard/tests");
  await expandIntentFolders(intent, "dashboard/tests");
  const selected = `Added ${longFile}`;
  await intentFile(intent, selected).click();
  await expect(intentDiffReading(intent).code).toHaveAttribute(
    "aria-busy",
    "false",
  );
  const revisions = storyHeaderReading(intent).revisions;
  const endpoints = await revisions.innerText();
  expect(endpoints).toContain(completion.slice(0, 7));
  const later = makeMe.aRepository
    .withRevision("planning-only", {
      backlog: null,
      files: {
        ".planning/later-planning.md": "A later project planning update.\n",
      },
    })
    .please().revisions[0];
  const laterRevision = await advanceDoneProject(page, origin, later);
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
