// A retained automatic run from active Intent must yield to the completed
// result when published work marks the same selected identity Done.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { writeRevisionFiles } from "../../Distribution/tests/support/repository-revision-files.mjs";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../dashboard/src/storyReviewContract.ts";
import {
  pausePageClock,
  passTimeUntilChecked,
} from "../../dashboard/tests/autoRefreshJourney.ts";
import { publishCommittedOrigin } from "../../dashboard/tests/committedOrigin.ts";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import {
  completedPublishedStory,
  keepUnusableCompletedCapture,
} from "../../dashboard/tests/support/completedPublishedStory.ts";
import {
  chooseStoryTab,
  intentDiff,
  storySummary,
  storyHeaderReading,
} from "../../dashboard/tests/support/intentStoryPage.ts";
import { publishIntentTrunk } from "../../dashboard/tests/support/intentStoryWorktree.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import { claimOf } from "../../dashboard/tests/support/storyCiComparisonHistory.ts";

const modified = "Modified dashboard/tests/a.spec.ts";

test("a selected active story's obsolete automatic run cannot mask its recovered published comparison when it becomes Done", async ({
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
  const story = await completedPublishedStory(
    origin,
    "trunk",
    undefined,
    (workspace) => {
      writeRevisionFiles(workspace, implementation);
    },
  );
  keepUnusableCompletedCapture(dashboard, origin, story);
  // Show the actual earlier claim first, then advance that same publication
  // to its actual completed result without navigating or reselecting.
  const active = claimOf(origin.project, story.agent);
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: active,
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
  const unavailable = storyReviewSchema.parse(await (await first).json());
  expect(unavailable).toMatchObject({
    kind: "landing-unavailable",
    selectedRun: expect.any(String),
  });
  await expect(storySummary(intent)).toContainText(
    "The captured landing repository is missing or unreadable.",
  );
  const explicitRuns: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === storyReviewEndpoint && url.searchParams.has("run"))
      explicitRuns.push(url.searchParams.get("run") ?? "");
  });
  const completed = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname === storyReviewEndpoint &&
      url.searchParams.get("historical") === "true"
    );
  });
  published.advanceTo(story.completion);
  await passTimeUntilChecked(page);
  expect(storyReviewSchema.parse(await (await completed).json())).toMatchObject(
    { kind: "published", completion: story.completion },
  );
  await expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a");
  await expect(storyHeaderReading(intent).done).toHaveText("Done");
  await expect(storySummary(intent)).toHaveAttribute("data-state", "compared");
  await chooseStoryTab(intent, "Changed tests");
  expect(await intentDiff(intent, modified)).toContain(
    "published completion after active selection",
  );
  expect(explicitRuns).toEqual([]);
});
