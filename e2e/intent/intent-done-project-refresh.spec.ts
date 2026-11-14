import { showLatestRevision } from "../../dashboard/tests/intentReadRecoveryPage.ts";
// A real Done story keeps its historical endpoints and saved assessment
// across all its tabs while Project Intent independently notices a push.
// Historical file/tab/reading-place continuity through project refresh:
// ../../dashboard/tests/intent/intent-done-project-refresh-reading.spec.ts.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { pausePageClock } from "../../dashboard/tests/autoRefreshJourney.ts";
import {
  openProjectIntent,
  returnToStory,
  filesColumn,
} from "../../dashboard/tests/intentModePage.ts";
import {
  browserRevision,
  revisionNotice,
} from "../../dashboard/tests/intentPerspectivePage.ts";
import { selectCompletedStoryInIntent } from "../../dashboard/tests/support/intentCompletedStory.ts";
import {
  advanceDoneProject,
  recordIntentLocations,
} from "../../dashboard/tests/support/intentDoneProjectRefresh.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import {
  chooseStoryTab,
  storyHeaderReading,
} from "../../dashboard/tests/support/intentStoryPage.ts";

test("all Done tabs ignore project freshness while Project Intent notices the later revision", async ({
  page,
  origin,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await pausePageClock(page);
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
    { intentCoverage },
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
  await advanceDoneProject(page, origin, later);
  for (const tab of [
    "CI comparison",
    "Intent coverage",
    "Changed tests",
  ] as const) {
    await chooseStoryTab(intent, tab);
    await expect(revisionNotice(intent)).toHaveCount(0);
    await expect(browserRevision(intent)).toHaveCount(0);
    await expect(showLatestRevision(intent)).toHaveCount(0);
    await expect(revisions).toHaveText(endpoints);
    if (tab === "Intent coverage")
      await expect(intent.locator(".intent-story-coverage-text")).toHaveText(
        report,
      );
  }
  await openProjectIntent(intent);
  await expect(revisionNotice(intent)).toBeVisible();
  await expect(browserRevision(intent)).toContainText(published.slice(0, 7));
});
