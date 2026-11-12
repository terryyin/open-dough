import { attemptLink } from "../ciEvidenceLabelsPage.ts";
import { storySummary } from "../intentModePage.ts";
import { priorBuildReferenceReading } from "../priorBuildReferencePage.ts";
import { comparisonReading } from "../intentCiComparisonPage.ts";
// The published execution endpoint, actual selected collection and retained
// raw ancestors flow through the normal authenticated history reader.
import { readFileSync, writeFileSync } from "node:fs";
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
import {
  retainedHistory,
  historyFile,
} from "../support/collectedScopeHistory.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";

test.use({ serverMode: "boundary", extraEnv: recheckingLandedCi });
const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});

test("Done wall time keeps the execution publication reference through restart, later same-story publications, eviction and independent local retry", async ({
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
  const { panel, intent } = await selectDoneStoryForCiComparison(
    page,
    reader.origin,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(comparisonReading(panel).entryTable).toBeVisible();
  const history = panel.getByRole("region", {
    name: "Done CI wall time reference",
    exact: true,
  });
  await expect(history).toContainText(
    `Selected landing ${shortSha(setup.completion)}`,
  );
  await expect(history).toContainText("Prior-build average · 1 min 43 s");
  await expect(history).toContainText("+17 s (+17%)");
  await expect(history).toContainText("5 prior builds used · Nov 1–Nov 5");
  await expect(panel.getByRole("rowheader")).toContainText([
    "Baseline",
    "Branch",
    "Landed",
  ]);
  await expect(comparisonReading(panel).wallTimes.nth(2)).toHaveText("2 min");
  await expect(history.getByRole("img")).toHaveCount(0);
  const samples = priorBuildReferenceReading(history);
  const evidence = samples.evidence;
  await expect(samples.included).toHaveCount(5);
  await expect(samples.excluded).toContainText("Slow outlier");
  await expect(samples.selected).toContainText(
    `exact revision ${shortSha(setup.completion)}`,
  );
  await history.locator("summary").focus();
  await page.keyboard.press("Tab");
  await expect(attemptLink(evidence, "Run 201 · attempt 1")).toBeFocused();
  await expectNoSidewaysScrollIn(page, history);
  const ciCalls = () =>
    github.calls.filter(({ request }) => request.kind.startsWith("actions-"));
  const before = ciCalls().length;
  await keepLandedCiHistory(
    dashboard.home,
    doneWallReferenceHistory(origin, setup, { selected, later: true }),
  );
  await history
    .getByRole("button", { name: "Refresh history", exact: true })
    .click();
  await expect(samples.excluded).toContainText([
    "Slow outlier",
    "No represented landing before the selected endpoint",
  ]);
  await expect(history).toContainText("Prior-build average · 1 min 43 s");
  await expect(history).toContainText("+17 s (+17%)");
  await keepLandedCiHistory(
    dashboard.home,
    doneWallReferenceHistory(origin, setup, { selected, later: true, drop: 1 }),
  );
  await history
    .getByRole("button", { name: "Refresh history", exact: true })
    .click();
  await expect(history).toContainText("Insufficient comparable history");
  await expect(history).toContainText("4 prior builds used · Nov 2–Nov 5");
  const file = historyFile(dashboard.home);
  const retained = readFileSync(file, "utf8");
  try {
    writeFileSync(file, "{broken collected history");
    await history
      .getByRole("button", { name: "Refresh history", exact: true })
      .click();
    await expect(history.getByRole("alert")).toContainText(
      "The collected CI history could not be read",
    );
    await expect(history).toContainText("4 prior builds used");
    await expect(comparisonReading(panel).wallTimes.nth(2)).toHaveText("2 min");
    await expect(
      storySummary(intent).getByRole("heading", {
        name: "Story A",
        exact: true,
      }),
    ).toBeVisible();
    writeFileSync(file, retained);
    await history
      .getByRole("button", { name: "Retry history", exact: true })
      .click();
    await expect(history.getByRole("alert")).toHaveCount(0);
    await expect(history).toContainText("4 prior builds used");
  } finally {
    writeFileSync(file, retained);
  }
  expect(ciCalls()).toHaveLength(before);
  await selectDoneStoryForCiComparison(page, reader.origin);
  await expect(history).toContainText("4 prior builds used");
  await expect(comparisonReading(panel).entryTable).toBeVisible();
  const settled = ciCalls().length;
  await history
    .getByRole("button", { name: "Refresh history", exact: true })
    .click();
  await expect(history).toContainText("4 prior builds used");
  expect(ciCalls()).toHaveLength(settled);
});
