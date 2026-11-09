// Taken-story provisional CI timing comparison
// (../../src/IntentCiComparison.tsx, ../../server/intentCiComparisonRead.ts): a
// Taken Story Branch story keeps its live CI status and adds a provisional
// comparison against the pre-story baseline with Landed not yet landed; a
// new branch head re-reads. A Taken Trunk Mode story shows its provisional
// trunk result beside Branch N/A. Done-story journeys stay in
// ./intent-ci-comparison.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { notLandedYetWords } from "../../src/storyCiComparisonWording.ts";
import { wall } from "../support/storyCiComparisonFixture.ts";
import { listedAttemptJobPages } from "../support/storyCiComparisonRequests.ts";
import { observedRerunJobs } from "../support/storyCiObservedJobs.ts";
import {
  publishTakenComparedStoryBranch,
  publishTakenComparedTrunk,
} from "../support/storyCiComparisonTakenFixture.ts";
import { selectTakenStoryForCiComparison } from "../support/selectTakenStoryForCiComparison.ts";
import { passTimeUntilCheckedAfterSettled } from "../autoRefreshJourney.ts";
import { githubFor, pausePageClockAt } from "../dashboardTest.ts";
import { commitAll, git, writeAt } from "../support/storyReviewWorktree.ts";
import path from "node:path";
import { parts } from "../dashboardPage.ts";
import { storyTitle } from "../support/intentStoryPage.ts";

test("a Taken Story Branch story keeps live CI status and shows a provisional comparison; a new branch head re-reads", async ({
  page,
  origin,
}) => {
  await pausePageClockAt(page, new Date());
  const setup = await publishTakenComparedStoryBranch(page, origin);
  const { status, panel } = await selectTakenStoryForCiComparison(page);

  await expect(
    status.getByRole("heading", {
      name: `CI status of ${setup.branch}`,
      exact: true,
    }),
  ).toBeVisible();
  await expect(status.locator(".intent-ci-story")).toHaveText("Story branch.");
  await expect(status).not.toContainText(setup.title);
  await expect(storyTitle(parts(page).intent)).toHaveText(setup.title);
  await expect(status.locator(".intent-ci-state")).toContainText(
    shortSha(setup.branchTip),
  );

  await expect(panel.getByRole("heading")).toHaveText([
    /^Baseline compared with /,
    "CI entry timing comparison",
  ]);
  await expect(panel.locator(".intent-ci-comparison-active")).toHaveText(
    "Baseline compared with Branch",
  );
  await expect(panel.locator(".intent-ci-comparison-active-reason")).toHaveText(
    `Landed is not used: ${notLandedYetWords}`,
  );
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(0),
  ).toContainText(shortSha(setup.baseline));
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(1),
  ).toContainText(shortSha(setup.branchTip));
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(1),
  ).toContainText("provisional");
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toHaveText(notLandedYetWords);
  await expect(panel.locator(".intent-ci-comparison-wall")).toHaveText([
    "4 min 59 s",
    "13 min 27 s",
    "—",
  ]);
  await expect(panel.locator(".intent-ci-comparison-without-waits")).toHaveText(
    ["4 min 55 s", "4 min 47 s", "—"],
  );
  // The provisional comparison's summary shows one signed change each.
  await expect(
    panel.locator(".intent-ci-comparison-overall-timing"),
  ).toHaveText("−8 s");
  await expect(panel.locator(".intent-ci-comparison-overall-wall")).toHaveText(
    "+8 min 28 s",
  );
  expect(listedAttemptJobPages(githubFor(page).calls)).toEqual([
    "101/1/1",
    "102/1/1",
  ]);

  await test.step("a new branch head reads only the newly shown attempt's jobs", async () => {
    const workspace = path.join(origin.machine, "another-agent-workspace");
    writeAt(workspace, "src/story.ts", "taken story work\nnext tip\n");
    commitAll(workspace, "advance the story branch");
    git(
      workspace,
      "push",
      "--quiet",
      "origin",
      `HEAD:refs/heads/${setup.branch}`,
    );
    const nextTip = git(workspace, "rev-parse", "HEAD");
    setup.serveRuns({
      ...setup.initialRuns,
      [nextTip]: [
        {
          ...wall(nextTip, 103, "2026-11-06T10:05:19Z", "2026-11-06T10:10:38Z"),
          attempt: 2,
        },
      ],
    });
    setup.serveJobs({ "103/2": observedRerunJobs });
    await passTimeUntilCheckedAfterSettled(page);
    await expect(
      panel.locator(".intent-ci-comparison-identity").nth(1),
    ).toContainText(shortSha(nextTip), { timeout: 60_000 });
    await expect(
      panel.locator(".intent-ci-comparison-identity").nth(1),
    ).toContainText("provisional");
    await expect(panel.locator(".intent-ci-comparison-wall").nth(1)).toHaveText(
      "5 min 19 s",
    );
    await expect(
      panel.locator(".intent-ci-comparison-without-waits"),
    ).toHaveText(["4 min 55 s", "5 min 12 s", "—"]);
    expect(listedAttemptJobPages(githubFor(page).calls)).toEqual([
      "101/1/1",
      "102/1/1",
      "103/2/1",
    ]);
    await expect(status.locator(".intent-ci-state")).toContainText(
      shortSha(nextTip),
      { timeout: 60_000 },
    );
  });
});

test("a Taken Trunk Mode story shows a provisional trunk result beside Branch N/A and Landed not yet", async ({
  page,
  origin,
}) => {
  const setup = await publishTakenComparedTrunk(page, origin);
  const { panel } = await selectTakenStoryForCiComparison(page);

  await expect(panel.getByRole("heading")).toHaveText([
    /^Baseline compared with /,
    "CI entry timing comparison",
  ]);
  await expect(panel.locator(".intent-ci-comparison-active")).toHaveText(
    "Baseline compared with Provisional",
  );
  await expect(panel.locator(".intent-ci-comparison-active-reason")).toHaveText(
    `Landed is not used: ${notLandedYetWords}`,
  );
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(1),
  ).toContainText("not applicable");
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText(shortSha(setup.trunkTip));
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(2),
  ).toContainText("provisional");
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(3),
  ).toHaveText(notLandedYetWords);
  await expect(panel.locator(".intent-ci-comparison-wall")).toHaveText([
    "4 min 59 s",
    "—",
    "13 min 27 s",
    "—",
  ]);
  await expect(panel.locator(".intent-ci-comparison-without-waits")).toHaveText(
    ["4 min 55 s", "—", "4 min 47 s", "—"],
  );
});
