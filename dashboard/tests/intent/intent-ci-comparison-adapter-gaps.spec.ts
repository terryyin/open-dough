// Adapter comparison gaps are named by endpoint. Real published history
// supplies the endpoint bounds; adapter fixtures only supply CI attempts.
import { shortSha } from "../../src/baseCiWording.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { adapterProject, passed } from "../intentCiAdapterProofProject.ts";
import { completedPublishedStory } from "../support/completedPublishedStory.ts";
import { expect, test } from "../support/preparationPage.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { publishFastForwardLandedStory } from "../support/storyCiComparisonFastForward.ts";
import { push } from "../support/storyReviewTrunkCommits.ts";
import { git } from "../support/storyReviewWorktree.ts";

test("an expired adapter baseline leaves the newest Branch and Landed retry visible", async ({
  page,
  origin,
  dashboard,
}) => {
  const beyondBound = git(origin.project, "rev-parse", "HEAD");
  for (let commit = 0; commit <= 30; commit += 1) {
    git(
      origin.project,
      "commit",
      "--allow-empty",
      "--quiet",
      "-m",
      "age the baseline",
    );
  }
  push(origin.project);
  const story = await publishFastForwardLandedStory(page, origin);
  const adapter = adapterProject(dashboard.home);
  const first = {
    ...passed("landing", "failed-first", story.branchSide, story.branch),
    outcome: "failure",
    time: "2026-11-05T09:00:00Z",
  };
  const retry = {
    ...passed("landing", "passed-retry", story.branchSide, story.branch),
    time: "2026-11-05T09:20:00Z",
  };
  adapter.answer({
    discover: {
      main: [passed("old", "beyond-bound", beyondBound, "main")],
      [story.branch]: [retry, first],
    },
    proof: { unavailable: "no proof kept" },
  });
  const { panel } = await selectDoneStoryForCiComparison(page);
  const builds = panel.locator(".intent-ci-comparison-identity");
  await expect(builds.first()).toContainText("No build at");
  await expect(builds.first()).toContainText(
    "no ancestor build was found to compare against",
  );
  for (const index of [1, 2]) {
    await expect(builds.nth(index)).toContainText(shortSha(story.branchSide));
    await expect(builds.nth(index)).toContainText(
      "attempt passed-retry · passed · exact revision",
    );
    await expect(
      panel.locator(".intent-ci-comparison-wall").nth(index),
    ).toHaveText("Not recorded");
  }
});

test("a Done Trunk Mode adapter story walks back from its completion to Landed", async ({
  page,
  origin,
  dashboard,
}) => {
  const story = await completedPublishedStory(origin, "trunk");
  const implementation = git(
    origin.project,
    "log",
    "--format=%H",
    "--grep=^story implementation$",
    "-1",
    story.completion,
  );
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: story.completion,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  const adapter = adapterProject(dashboard.home);
  adapter.answer({
    discover: {
      main: [passed("trunk", "implemented", implementation, "main")],
    },
    proof: { unavailable: "no proof kept" },
  });
  const { panel } = await selectDoneStoryForCiComparison(page);
  const builds = panel.locator(".intent-ci-comparison-identity");
  await expect(builds.nth(1)).toContainText("not applicable");
  await expect(builds.nth(2)).toContainText(shortSha(implementation));
  await expect(builds.nth(2)).toContainText("ancestor:");
});

// The adapter limit is lowered for the timed-out case only, so the request
// it ends is observed at that limit instead of waited out at 20 seconds.
const adapterLimitMs = 2_000;
for (const [caseName, failure, reason, extraEnv] of [
  [
    "fails",
    { discoverStderr: "adapter CI service has no discovery access" },
    "adapter CI service has no discovery access",
    undefined,
  ],
  [
    "times out",
    { discoverHeld: true },
    `The CI adapter did not answer discovery within ${String(adapterLimitMs / 1000)} seconds.`,
    { DOUGH_CI_ADAPTER_TIMEOUT_MS: String(adapterLimitMs) },
  ],
] as const) {
  test.describe(`discovery that ${caseName}`, () => {
    test.use({ extraEnv });
    test(`a Done adapter comparison keeps the endpoint reason when discovery ${caseName}`, async ({
      page,
      origin,
      dashboard,
    }) => {
      await publishFastForwardLandedStory(page, origin);
      const adapter = adapterProject(dashboard.home);
      adapter.answer({ discover: {}, proof: {}, ...failure });
      const { panel } = await selectDoneStoryForCiComparison(page);
      const builds = panel.locator(".intent-ci-comparison-identity");
      await expect(builds).toHaveCount(3);
      for (const index of [0, 1, 2]) {
        await expect(builds.nth(index)).toContainText(reason);
      }
      expect(adapter.proofRequests()).toEqual([]);
    });
  });
}
