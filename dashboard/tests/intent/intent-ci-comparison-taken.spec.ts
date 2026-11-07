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
import {
  publishTakenComparedStoryBranch,
  publishTakenComparedTrunk,
} from "../support/storyCiComparisonTakenFixture.ts";
import { selectTakenStoryForCiComparison } from "../support/selectTakenStoryForCiComparison.ts";
import { passTimeUntilCheckedAfterSettled } from "../autoRefreshJourney.ts";
import { pausePageClockAt } from "../dashboardTest.ts";
import { commitAll, git, writeAt } from "../support/storyReviewWorktree.ts";
import path from "node:path";

test.setTimeout(240_000);

test("a Taken Story Branch story keeps live CI status and shows a provisional comparison; a new branch head re-reads", async ({
  page,
  origin,
}) => {
  test.slow();
  await pausePageClockAt(page, new Date());
  const setup = await publishTakenComparedStoryBranch(page, origin);
  const { status, panel } = await selectTakenStoryForCiComparison(page);

  await expect(
    status.getByRole("heading", {
      name: `CI status of ${setup.branch}`,
      exact: true,
    }),
  ).toBeVisible();
  await expect(status).toContainText(`Story branch of ${setup.title}`);
  await expect(status.locator(".intent-ci-state")).toContainText(
    shortSha(setup.branchTip),
  );

  await expect(panel.getByRole("heading")).toHaveText(
    `CI timing changes for ${setup.title}`,
  );
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
  await expect(panel.locator(".intent-ci-comparison-wall").nth(0)).toHaveText(
    "3 min",
  );
  await expect(
    panel.locator(".intent-ci-comparison-wall").nth(1),
  ).toContainText("3 min 20 s");
  await expect(
    panel.locator(".intent-ci-comparison-wall").nth(1),
  ).toContainText("+20 s");

  await test.step("a new branch head re-reads the provisional comparison", async () => {
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
      [setup.baseline]: [
        wall(
          setup.baseline,
          101,
          "2026-11-05T12:00:00Z",
          "2026-11-05T12:03:00Z",
        ),
      ],
      [setup.branchTip]: [
        wall(
          setup.branchTip,
          102,
          "2026-11-05T13:00:00Z",
          "2026-11-05T13:03:20Z",
        ),
      ],
      [nextTip]: [
        wall(nextTip, 103, "2026-11-05T14:00:00Z", "2026-11-05T14:04:00Z"),
      ],
    });
    await passTimeUntilCheckedAfterSettled(page);
    await expect(
      panel.locator(".intent-ci-comparison-identity").nth(1),
    ).toContainText(shortSha(nextTip), { timeout: 60_000 });
    await expect(
      panel.locator(".intent-ci-comparison-identity").nth(1),
    ).toContainText("provisional");
    await expect(
      panel.locator(".intent-ci-comparison-wall").nth(1),
    ).toContainText("4 min");
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
  test.slow();
  const setup = await publishTakenComparedTrunk(page, origin);
  const { panel } = await selectTakenStoryForCiComparison(page);

  await expect(panel.getByRole("heading")).toHaveText(
    `CI timing changes for ${setup.title}`,
  );
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
  await expect(panel.locator(".intent-ci-comparison-wall").nth(0)).toHaveText(
    "3 min",
  );
  await expect(
    panel.locator(".intent-ci-comparison-wall").nth(2),
  ).toContainText("3 min 40 s");
  await expect(
    panel.locator(".intent-ci-comparison-wall").nth(2),
  ).toContainText("+40 s");
});
