import type { Locator } from "@playwright/test";
import { showLatestRevision } from "../../dashboard/test-support/intentReadRecoveryPage.ts";
// A real Done story keeps its historical endpoints and saved assessment
// across all its tabs while Project Intent independently notices a push.
// Historical file/tab/reading-place continuity through project refresh:
// ../../dashboard/frontend-tests/intent/intent-done-project-refresh.spec.ts.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { pausePageClock } from "../../dashboard/test-support/autoRefreshJourney.ts";
import { filesColumn } from "../../dashboard/test-support/intentModePage.ts";
import {
  chooseRecentStory,
  chooseWholeProject,
} from "../../dashboard/test-support/recentStoriesPage.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import {
  browserRevision,
  revisionNotice,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import { selectCompletedStoryInIntent } from "../../dashboard/test-support/support/intentCompletedStory.ts";
import {
  advanceDoneProject,
  recordIntentLocations,
} from "../../dashboard/test-support/support/intentDoneProjectRefresh.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  browseStoryFiles,
  chooseStoryTab,
  expectStoryTab,
  storyHeaderReading,
} from "../../dashboard/test-support/support/intentStoryPage.ts";

test("all Done tabs ignore project freshness while Whole project notices the later revision", async ({
  page,
  origin,
}) => {
  const report =
    await test.step("Given a Done story with a saved assessment", async () => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await pausePageClock(page);
      return "Outcome: Caught\nEvidence: The saved historical assessment.\n";
    });
  const intentCoverage =
    await test.step("And the published record keeps that assessment", () => {
      const { intentCoverage } = makeMe.aDoneRecord
        .withIntentCoverage({ report })
        .please();
      if (intentCoverage === undefined)
        throw new Error("The Done fixture needs its saved assessment.");
      return intentCoverage;
    });
  const { locations, firstRequested, intent, completion, published } =
    await test.step("When I select the completed story and open Intent", async () => ({
      ...recordIntentLocations(page),
      ...(await selectCompletedStoryInIntent(page, origin, { intentCoverage })),
    }));
  await test.step("Then Changes reads the published Done revision", async () => {
    await firstRequested;
    await browseStoryFiles(intent);
    await expect(filesColumn(intent)).toBeVisible();
  });
  await test.step("And that is the only file-browser revision read", () => {
    expect(locations).toEqual([completion]);
  });
  await test.step("When I choose Whole project at the bookmark", () =>
    chooseWholeProject(page));
  await test.step("Then the project file browser reads and names its own revision", async () => {
    await expect(filesColumn(intent)).toBeVisible();
    expect(locations).toEqual([completion, published]);
    await expect(browserRevision(intent)).toContainText(published.slice(0, 7));
  });
  await test.step("When I reselect the Done story from the bookmark", () =>
    chooseRecentStory(page, {
      project: "Open Dough",
      identity: queuedIdentity,
    }));
  await test.step("Then its fresh review opens CI comparison", () =>
    expectStoryTab(intent, "CI comparison"));
  const { revisions, endpoints } =
    await test.step("When I read Changes in the fresh review", async () => {
      await browseStoryFiles(intent);
      return readDoneEndpoints(intent);
    });
  await test.step("Then the story comparison stays pinned to completion", () => {
    expect(endpoints).toContain(completion.slice(0, 7));
  });

  await test.step("When trunk publishes a newer planning revision", () =>
    advanceDoneProject(
      page,
      origin,
      makeMe.aRepository
        .withRevision("planning-only", {
          backlog: null,
          files: {
            ".planning/later-planning.md": "A later project planning update.\n",
          },
        })
        .please().revisions[0],
    ));
  await test.step("Then each Done tab keeps the historical comparison", async () => {
    for (const tab of [
      "CI comparison",
      "Intent coverage",
      "Changes",
    ] as const) {
      await chooseStoryTab(intent, tab);
      await expect(revisions).toHaveText(endpoints, { useInnerText: true });
      await expectNoProjectFreshness(intent);
    }
  });
  await test.step("And Intent coverage shows the stored assessment", async () => {
    await chooseStoryTab(intent, "Intent coverage");
    await expect(intent.locator(".intent-story-coverage-text")).toHaveText(
      report,
    );
  });
  await test.step("When I clear the story through Whole project", () =>
    chooseWholeProject(page));
  await test.step("Then only Whole project notices the newer revision", async () => {
    await expect(revisionNotice(intent)).toBeVisible();
    await expect(browserRevision(intent)).toContainText(published.slice(0, 7));
  });
});

async function readDoneEndpoints(intent: Locator) {
  const { revisions } = storyHeaderReading(intent);
  return { revisions, endpoints: await revisions.innerText() };
}

async function expectNoProjectFreshness(intent: Locator) {
  await expect(revisionNotice(intent)).toHaveCount(0);
  await expect(browserRevision(intent)).toHaveCount(0);
  await expect(showLatestRevision(intent)).toHaveCount(0);
}
