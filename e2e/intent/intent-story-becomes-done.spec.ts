// A selected Taken story's published comparison gives way to its permanent
// completion when the project advances, even with an unreadable old capture.
import path from "node:path";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../dashboard/src/storyReviewContract.ts";
import { waitForHistoricalReview } from "../../dashboard/test-support/support/completedReviewRequests.ts";
import {
  pausePageClock,
  passTimeUntilChecked,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { expandIntentGroup } from "../../dashboard/test-support/intentPerspectivePage.ts";
import { keepUnusableCompletedCapture } from "../../dashboard/test-support/support/completedStoryVisibleActions.ts";
import { intentTrunkCompletionOntoTip } from "../../dashboard/test-support/support/intentCompletedHistory.ts";
import {
  browseStoryFiles,
  intentDiff,
  storySummary,
  storyHeaderReading,
} from "../../dashboard/test-support/support/intentStoryPage.ts";
import { publishIntentTrunk } from "../../dashboard/test-support/support/intentStoryWorktree.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { publishDeclaredTrunk } from "../../dashboard/test-support/support/storyCiComparisonBaseline.ts";

const modified = "Modified dashboard/tests/a.spec.ts";

test("a selected Taken story moves from published trunk to its published completion despite an unreadable legacy capture", async ({
  page,
  dashboard,
  origin,
}) => {
  await pausePageClock(page);
  publishIntentTrunk(origin.project);
  const implementation = makeMe.aRepository
    .withRevision("completed", {
      backlog: null,
      files: {
        "dashboard/tests/a.spec.ts":
          "published completion after active selection\n",
      },
    })
    .please().revisions[0];
  const story = await publishDeclaredTrunk(
    origin,
    intentTrunkCompletionOntoTip({ implementation }),
  );
  keepUnusableCompletedCapture(dashboard, origin, {
    workspace: path.join(origin.machine, "retired-becomes-done"),
    completion: story.completion,
    baseline: story.interleaving,
  });
  // Show the actual earlier claim first, then advance that same publication
  // to its actual completed result without navigating or reselecting.
  await origin.originGit(
    "update-ref",
    "refs/heads/main",
    story.claim,
    story.completion,
  );
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: story.claim,
    repository: "terryyin/open-dough",
    realHistory: true,
  });
  await page.goto("/");
  const { taken, intentChoice, intent } = parts(page);
  await taken
    .getByRole("article", { name: "Story A", exact: true })
    .getByRole("heading", { name: "Story A", exact: true })
    .click();
  const first = page.waitForResponse(
    (response) => new URL(response.url()).pathname === storyReviewEndpoint,
  );
  await intentChoice.click();
  const active = storyReviewSchema.parse(await (await first).json());
  expect(active).toMatchObject({
    kind: "published-taken",
    mode: "trunk",
    head: story.claim,
  });
  await expect(storySummary(intent)).toContainText("Published trunk");
  const explicitRuns: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === storyReviewEndpoint && url.searchParams.has("run"))
      explicitRuns.push(url.searchParams.get("run") ?? "");
  });
  const completed = waitForHistoricalReview(page);
  await origin.originGit(
    "update-ref",
    "refs/heads/main",
    story.completion,
    story.claim,
  );
  published.advanceTo(story.completion);
  await passTimeUntilChecked(page);
  expect(await completed).toMatchObject({
    kind: "published",
    completion: story.completion,
  });
  await expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a");
  await expect(storyHeaderReading(intent).done).toHaveText("Done");
  await expect(storySummary(intent)).toHaveAttribute("data-state", "compared");
  await browseStoryFiles(intent);
  await expandIntentGroup(intent, "dashboard/tests");
  expect(await intentDiff(intent, modified)).toContain(
    "published completion after active selection",
  );
  expect(explicitRuns).toEqual([]);
});
