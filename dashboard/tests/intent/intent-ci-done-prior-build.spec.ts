import { comparisonReading } from "../intentCiComparisonPage.ts";
import {
  doneHistoryRead,
  doneWallTimeHistory,
  expectChangeCue,
} from "../priorBuildReferencePage.ts";
// The published execution endpoint, actual selected collection and retained
// raw ancestors flow through the normal authenticated history reader. A
// failed history refresh and its retry are the lifecycle journey's
// (./intent-ci-done-reference-lifecycle.spec.ts); each history state's
// readout is the mounted one's (../../frontend-tests/intent-ci-compact-readout.spec.ts).
import { shortSha } from "../../src/baseCiWording.ts";
import {
  expect,
  queuedClaudePreviewTest as test,
} from "../support/preparationPage.ts";
import { publishComparedStoryBranch } from "../support/storyCiComparisonDoneFixture.ts";
import { defaultMixedProofs } from "../support/storyCiComparisonEntryProofs.ts";
import { wall } from "../support/storyCiComparisonFixture.ts";
import {
  recordScopeHistoryLandings,
  retainedProofs,
} from "../support/scopeHistoryCollection.ts";
import { doneWallReferenceHistory } from "../support/doneWallReferenceHistory.ts";
import {
  keepLandedCiHistory,
  recheckingLandedCi,
  restartAsLandedCiReader,
} from "../support/landedCiHistory.ts";
import { retainedHistory } from "../support/collectedScopeHistory.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";

test.use({ serverMode: "boundary", extraEnv: recheckingLandedCi });
const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});

test("Done wall time reads the collected execution publication through restart, and later same-story publications leave its readout and chart unchanged", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const setup = await publishComparedStoryBranch(page, origin);
  await keepLandedCiHistory(
    dashboard.home,
    doneWallReferenceHistory(origin, setup),
  );
  setup.serveRuns({
    [setup.baseline]: [
      wall(setup.baseline, 101, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
    ],
    [setup.branchSide]: [
      wall(
        setup.branchSide,
        102,
        "2026-11-06T10:00:00Z",
        "2026-11-06T10:03:20Z",
      ),
    ],
    [setup.completion]: [
      wall(
        setup.completion,
        103,
        "2026-11-07T10:00:00Z",
        "2026-11-07T10:02:00Z",
      ),
    ],
  });
  setup.serveProofs(defaultMixedProofs(setup));
  recordScopeHistoryLandings(dashboard, origin, setup.identity, [
    {
      revision: setup.completion,
      at: "2026-11-07T10:10:00Z",
      workflow: "execution",
      receipt: "10000000-0000-4000-8000-000000000002",
      title: "Story A execution",
    },
  ]);
  await expect
    .poll(() => retainedProofs(dashboard.home)["run/103/1"])
    .toMatchObject({ kind: "summary" });
  const selected = retainedHistory(dashboard.home)?.builds["run/103/1"];
  if (selected === undefined)
    throw new Error("Actual selected attempt was not collected");
  const reader = await restartAsLandedCiReader(dashboard, origin, "preview");
  readers.push(reader);
  await page.setViewportSize({ width: 390, height: 844 });
  const { panel } = await selectDoneStoryForCiComparison(page, reader.origin);
  const history = doneWallTimeHistory(panel);
  await expect(history.selected).toHaveText(
    `Selected landing ${shortSha(setup.completion)} · 2 min`,
  );
  await expect(history.average).toHaveText(
    "Prior-build average · 1 min 43 s · 5 prior builds used",
  );
  await expect(history.change).toHaveText("vs. prior average · +17 s (+17%)");
  await expectChangeCue(page, history.region, "slower");
  // Six priors, the 116 s outlier among them, and the selected landing.
  await expect(history.chart.marks).toHaveCount(7);
  await expect(history.chart.readout).toHaveText(
    "Nov 7 · Selected landing · 2 min",
  );
  await expectNoSidewaysScrollIn(page, history.region);
  const ciCalls = () =>
    github.calls.filter(({ request }) => request.kind.startsWith("actions-"));
  await expect(comparisonReading(panel).wallTimes.nth(2)).toHaveText("2 min");
  const before = ciCalls().length;
  await keepLandedCiHistory(
    dashboard.home,
    doneWallReferenceHistory(origin, setup, { selected, later: true }),
  );
  const refreshed = doneHistoryRead(page);
  await history.refresh.click();
  await refreshed;
  await expect(history.alert).toHaveCount(0);
  await expect(history.average).toHaveText(
    "Prior-build average · 1 min 43 s · 5 prior builds used",
  );
  await expect(history.change).toHaveText("vs. prior average · +17 s (+17%)");
  await expect(history.chart.marks).toHaveCount(7);
  await expect(history.chart.mark("Nov 8 · 1 min 40 s")).toHaveCount(0);
  expect(ciCalls()).toHaveLength(before);
});
