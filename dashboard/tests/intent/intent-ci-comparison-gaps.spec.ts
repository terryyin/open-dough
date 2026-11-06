// Gap and selection variants for Intent's CI timing comparison
// (../../src/IntentCiComparison.tsx): Trunk Mode not-applicable Branch, running
// Landed beside a readable Branch comparison with an added entry, a missing
// Landed explanation without inventing zero, and SEED-248 no-build gaps at a
// fast-forward tip with Baseline retained
// (SEED-244#compare-story-ci-timing-changes examples 5 and Trunk Mode).
// Failed and cancelled landing-merge gaps live in
// ./intent-ci-comparison-landing-gaps.spec.ts; the happy-path, SEED-236 and
// unrecoverable journeys live in ./intent-ci-comparison.spec.ts;
// fast-forward tip happy paths in ./intent-ci-comparison-fast-forward.spec.ts;
// entry-proof expiry and missing durations live in
// ./intent-ci-comparison-entries.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { wall } from "../support/storyCiComparisonFixture.ts";
import { publishComparedStoryBranch } from "../support/storyCiComparisonDoneFixture.ts";
import { publishFastForwardLandedStory } from "../support/storyCiComparisonFastForward.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import {
  advanceCompletedTrunk,
  completedPublishedStory,
} from "../support/completedPublishedStory.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { commitAll, git, writeAt } from "../support/storyReviewWorktree.ts";
import { push } from "../support/storyReviewTrunkCommits.ts";
import {
  actionsRunsAnswer,
  actionsWorkflowAnswer,
} from "../support/baseCiActions.ts";

test.setTimeout(240_000);

test("a Trunk Mode done story marks Branch not applicable and Landed as an ancestor when needed", async ({
  page,
  origin,
}) => {
  test.slow();
  // Baseline before the claim; implementation during the story has the only
  // post-start build; completion touches .planning/ only and has none.
  writeAt(origin.project, "src/built.ts", "built before claim\n");
  commitAll(origin.project, "ship a built revision");
  const baseline = git(origin.project, "rev-parse", "HEAD");
  push(origin.project);
  const story = await completedPublishedStory(origin, "trunk");
  const implementation = git(
    origin.project,
    "log",
    "--format=%H",
    "--grep=^story implementation$",
    "-1",
    story.completion,
  );
  advanceCompletedTrunk(origin);
  const published = git(origin.origin, "rev-parse", "main");
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  committed.serveActions((argv) => {
    const route = argv.find((a) => a.startsWith("repos/")) ?? "";
    if (/\/actions\/workflows\/[^/?]+$/.test(route))
      return actionsWorkflowAnswer();
    const runs = /\/actions\/workflows\/[^/]+\/runs\?(.*)$/.exec(route);
    if (runs?.[1] !== undefined) {
      const headSha = new URLSearchParams(runs[1]).get("head_sha") ?? "";
      if (headSha === baseline)
        return actionsRunsAnswer([
          wall(baseline, 200, "2026-11-05T11:00:00Z", "2026-11-05T11:03:00Z"),
        ]);
      if (headSha === implementation)
        return actionsRunsAnswer([
          wall(
            implementation,
            201,
            "2026-11-05T12:00:00Z",
            "2026-11-05T12:03:00Z",
          ),
        ]);
      return actionsRunsAnswer([]);
    }
    return undefined;
  });
  const { panel } = await selectDoneStoryForCiComparison(page);
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(1),
  ).toContainText("not applicable");
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText(shortSha(implementation));
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText("ancestor:");
});

test("a running landed build leaves the branch comparison readable and marks an added entry", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishComparedStoryBranch(page, origin);
  setup.serveRuns({
    [setup.baseline]: [
      wall(setup.baseline, 101, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
    ],
    [setup.branchSide]: [
      wall(
        setup.branchSide,
        102,
        "2026-11-05T13:00:00Z",
        "2026-11-05T13:03:20Z",
      ),
    ],
    [setup.completion]: [
      wall(
        setup.completion,
        103,
        "2026-11-05T14:00:00Z",
        "2026-11-05T14:04:00Z",
        undefined,
        "in_progress",
      ),
    ],
  });
  const { panel } = await selectDoneStoryForCiComparison(page);
  await expect(
    panel.locator(".intent-ci-comparison-wall").nth(1),
  ).toContainText("+20 s");
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText("running");
  const table = panel.getByRole("table", {
    name: "CI entry timing comparison",
  });
  const added = table.locator("tbody tr").filter({ hasText: "src/skills" });
  await expect(added.getByRole("cell").nth(1)).toHaveText("added");
  await expect(added.getByRole("cell").nth(2)).toHaveText("30 s");
  await expect(added.getByRole("cell").nth(3)).toHaveText(
    "Build is still running.",
  );
});

test("a missing landed build explains itself without inventing zero", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishComparedStoryBranch(page, origin);
  setup.serveRuns({
    [setup.baseline]: [
      wall(setup.baseline, 101, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
    ],
    [setup.branchSide]: [
      wall(
        setup.branchSide,
        102,
        "2026-11-05T13:00:00Z",
        "2026-11-05T13:03:20Z",
      ),
    ],
    [setup.completion]: [],
  });
  const { panel } = await selectDoneStoryForCiComparison(page);
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText("No completed CI build");
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "—",
  );
});

test("without builds at a fast-forward tip Branch and Landed explain gaps while Baseline stays readable", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishFastForwardLandedStory(page, origin);
  setup.serveRuns({
    [setup.baseline]: [
      wall(setup.baseline, 401, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
    ],
    [setup.mainSide]: [
      wall(setup.mainSide, 498, "2026-11-05T13:30:00Z", "2026-11-05T13:40:00Z"),
    ],
    [setup.branchSide]: [],
  });
  const { panel } = await selectDoneStoryForCiComparison(page);
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(0),
  ).toContainText(shortSha(setup.baseline));
  await expect(panel.locator(".intent-ci-comparison-wall").nth(0)).toHaveText(
    "3 min",
  );
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(1),
  ).toContainText("No completed CI build");
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText("No completed CI build");
  await expect(panel.locator(".intent-ci-comparison-wall").nth(1)).toHaveText(
    "—",
  );
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "—",
  );
  await expect(panel).not.toContainText("run 498");
  await expect(panel).not.toContainText("10 min");
});
