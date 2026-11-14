import { comparisonReading } from "../intentCiComparisonPage.ts";
// Real controls and displayed source for a push run that did not exist on
// first selection. Both routes use the same production server and memory.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import {
  capturedComparisonLanding,
  missingLandedRun,
} from "../support/missingLandedRun.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";
import { trunkActions, trunkRun } from "../support/landedCiTrunk.ts";
import { git } from "../support/storyReviewWorktree.ts";
import {
  checkComparisonAgain,
  watchComparisonReads,
} from "../support/storyCiComparisonRetry.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { expectExactSourceCue } from "../support/expectCiComparisonSourceCue.ts";
import type { CiRunAnswer } from "../support/baseCiActions.ts";

for (const control of ["Check again", "reselection"] as const) {
  test(`${control} recovers a captured missing push run through queued to its measured exact Landed source`, async ({
    page,
    origin,
    dashboard,
  }) => {
    const setup = await missingLandedRun(origin);
    const landing = capturedComparisonLanding(setup, new Date().toISOString());
    keepLaunchRecords(dashboard.home, [
      makeMe.aLaunchRecord
        .executing({ identity: setup.identity, title: "Story A" })
        .withCapturedLanding(landing)
        .please(),
    ]);
    const published = git(origin.origin, "rev-parse", "main");
    const committed = await publishCommittedOrigin(page, {
      repoDir: origin.origin,
      revision: published,
      repository: "terryyin/open-dough",
      follows: true,
      realHistory: true,
    });
    let runs: readonly CiRunAnswer[] = setup.runs;
    let requests = 0;
    committed.serveActions((argv) => {
      requests += 1;
      return trunkActions(runs, setup.proofs)(argv);
    });
    const reads = watchComparisonReads(page);
    let { panel } = await selectDoneStoryForCiComparison(page);
    await expect(comparisonReading(panel).activeComparison).toHaveText(
      "Baseline compared with Branch",
    );
    await expect(comparisonReading(panel).identities.nth(2)).toContainText(
      "No build",
    );
    await expect(comparisonReading(panel).wallTimes.nth(2)).toHaveText("—");
    const refresh = async () => {
      if (control === "Check again") await checkComparisonAgain(page, panel);
      else ({ panel } = await selectDoneStoryForCiComparison(page));
    };
    runs = [
      ...setup.runs,
      trunkRun(setup.landingMerge, 103, {
        status: "queued",
        createdAt: "2026-11-05T14:00:00Z",
      }),
    ];
    await refresh();
    await expect(comparisonReading(panel).identities.nth(2)).toContainText(
      "still running",
    );
    await expect(comparisonReading(panel).activeComparison).toHaveText(
      "Baseline compared with Branch",
    );
    runs = [...setup.runs, setup.exact];
    await refresh();
    await expect(comparisonReading(panel).activeComparison).toHaveText(
      "Baseline compared with Landed",
    );
    const source = comparisonReading(panel).identities.nth(2);
    await expect(source).toContainText(shortSha(setup.landingMerge));
    await expect(source).not.toContainText(shortSha(setup.completion));
    await expectExactSourceCue(source);
    await expect(comparisonReading(panel).wallTimes.nth(2)).toHaveText("4 min");
    await expect.poll(() => reads.finished.proof).toBe(7);
    const finalRequests = requests;
    await refresh();
    await expect(comparisonReading(panel).activeComparison).toHaveText(
      "Baseline compared with Landed",
    );
    await expect.poll(() => reads.finished.proof).toBe(10);
    expect(requests).toBe(finalRequests);
  });
}
