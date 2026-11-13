import { attemptLink } from "../ciEvidenceLabelsPage.ts";
import {
  compactReadout,
  priorBuildReferenceReading,
} from "../priorBuildReferencePage.ts";
// Settled retained producer observations and a collected selected attempt
// traverse the normal authenticated history read, never a fixture average.
import { shortSha } from "../../src/baseCiWording.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  buildEvidenceRows,
  buildHistoryReading,
  chartOf,
  evidenceByKeyboard,
  historyOf,
  openProjectCiStatus,
  publishTrunk,
} from "../intentCiHistoryPage.ts";
import { proofOf } from "../intentCiProofPage.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import { commonGitDir } from "../support/launchLanding.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";
import {
  keepLandedCiHistory,
  landedCiHistory,
  recheckingLandedCi,
  restartAsLandedCiReader,
  storyLandingRecord,
} from "../support/landedCiHistory.ts";
import { landedTrunk, passedFrom, trunkRun } from "../support/landedCiTrunk.ts";
import { retainedProofs } from "../support/scopeHistoryCollection.ts";
import { expect, test } from "../support/preparationPage.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";

test.use({ extraEnv: recheckingLandedCi });
const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});

test("project history explains its five-build average, strict slow exclusion and selected difference locally on a phone, including after restart", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const seconds = [100, 100, 100, 100, 115, 116, 120];
  const names = Array.from(seconds.keys(), (n) => `average-${n}`);
  const trunk = landedTrunk(
    origin,
    names.map((title) => ({ title, kind: "code" })),
    names,
  );
  const selectedLanding = trunk.landing("average-6");
  const excludedLanding = trunk.landing("average-5");
  const observations = seconds.map((value, n) => {
    const facts = trunk.landing(`average-${n}`);
    const run = trunkRun(
      facts.revision,
      n + 101,
      passedFrom(`2026-11-0${n + 1}T10:00:00Z`, value * 1000),
    );
    const { id, url, startedAt, completedAt } = run;
    if (
      id === undefined ||
      url === undefined ||
      startedAt === undefined ||
      completedAt === undefined
    )
      throw new Error(
        "Average fixture requires identified runs with complete wall-time bounds",
      );
    return { facts, run: { ...run, id, url, startedAt, completedAt } };
  });
  const runs = observations.map(({ run }) => run);
  const proofs = Object.fromEntries(
    runs.map((run) => [
      run.id,
      {
        kind: "summary" as const,
        artifactId: run.id * 10,
        // Entry-only proof deliberately omits all cumulative test durations.
        summary: makeMe.aCiProofSummary
          .inRepository("terryyin/open-dough")
          .ofRun({ runId: run.id, runAttempt: 1, revision: run.headSha })
          .withEntries(makeMe.aCiProofEntry.at("tests").counting(2).please())
          .please(),
      },
    ]),
  );
  const retained = makeMe.aLandedCiHistory.inTrunkOrder(
    observations.slice(0, 6).map(({ facts }) => facts.revision),
  );
  for (const { facts, run } of observations.slice(0, 6)) {
    const landing = makeMe.aLaunchLanding
      .capturedFrom({ repository: commonGitDir(origin.project) })
      .comparing({ base: facts.revision, revision: facts.revision })
      .deliveredAs({ delivery: facts.receipt, receipt: facts.receipt })
      .receivedAt(facts.at)
      .please();
    retained.recording(
      landing,
      `run/${run.id}/1`,
      makeMe.aKeptBuild
        .with({
          revision: facts.revision,
          state: "pass",
          runId: run.id,
          runAttempt: 1,
          runUrl: run.url,
          startedAt: run.startedAt,
          completedAt: run.completedAt,
          proof: makeMe.aCiProof
            .forRun({ revision: facts.revision, runId: run.id })
            .entries([makeMe.aCiProofEntry.at("tests").counting(2).please()])
            .please(),
        })
        .please(),
    );
  }
  // Settled background history is the starting precondition; only the new
  // selected landing needs collection in this comparison journey.
  await keepLandedCiHistory(dashboard.home, retained.please());
  await publishTrunk(
    page,
    origin,
    () => runs,
    () => proofs,
  );
  keepLaunchRecords(dashboard.home, [
    storyLandingRecord(selectedLanding, "execution"),
  ]);
  await expect
    .poll(() => Object.keys(retainedProofs(dashboard.home)))
    .toHaveLength(7);
  const collected = await landedCiHistory(dashboard);
  expect(collected.body).toMatchObject({
    reference: {
      endpoint: selectedLanding.revision,
      selected: { key: "run/107/1", date: "2026-11-07T10:00:00Z", ms: 120000 },
      evidence: seconds.map((value, n) => ({
        key: `run/${n + 101}/1`,
        date: `2026-11-0${n + 1}T10:00:00Z`,
        ms: value * 1000,
        status: n === 6 ? "selected" : n === 5 ? "excluded" : "included",
        ...(n === 5
          ? { reason: "Slow outlier: more than 15% above the median" }
          : {}),
      })),
      sampleCount: 5,
      medianMs: 100000,
      averageMs: 103000,
      from: "2026-11-01T10:00:00Z",
      to: "2026-11-05T10:00:00Z",
      difference: { changeMs: 17000, relative: 17 / 103 },
    },
  });
  const reader = await restartAsLandedCiReader(dashboard, origin, "preview");
  readers.push(reader);
  const beforeRead = github.calls.length;
  expect(await landedCiHistory(reader)).toEqual(collected);
  expect(github.calls).toHaveLength(beforeRead);

  await page.setViewportSize({ width: 390, height: 844 });
  const panel = await openProjectCiStatus(page, reader.origin);
  await expect(
    panel.getByRole("button", { name: "Check again", exact: true }),
  ).toBeEnabled();
  await expect(
    proofOf(panel).getByRole("table", { name: "CI proof by declared entry" }),
  ).toBeVisible();
  const history = historyOf(panel);
  const readout = compactReadout(history);
  await expect(readout.average).toHaveText(
    "Prior-build average · 1 min 43 s · 5 prior builds used",
  );
  await expect(readout.change).toHaveText("vs. prior average · +17 s (+17%)");
  await expect(history).toContainText("Median 1 min 40 s");
  await expect(history).toContainText("strictly more than 15%");
  const ciCalls = () =>
    github.calls.filter(({ request }) => request.kind.startsWith("actions-"));
  const calls = ciCalls().length;
  const builds = await evidenceByKeyboard(page, panel);
  await expect(buildEvidenceRows(builds)).toHaveCount(7);
  await expect(buildEvidenceRows(builds).nth(5)).toContainText("1 min 56 s");
  const samples = priorBuildReferenceReading(history);
  await expect(samples.included).toHaveCount(5);
  await expect(samples.excluded).toHaveText(/Nov 6.*1 min 56 s.*Slow outlier/);
  await expect(samples.selected).toHaveText(/Nov 7.*2 min/);
  await expect(samples.selected).toContainText(
    `exact revision ${shortSha(selectedLanding.revision)}`,
  );
  await expect(samples.excluded).toContainText(
    `exact revision ${shortSha(excludedLanding.revision)}`,
  );
  await expect(
    attemptLink(samples.evidence, "Run 106 · attempt 1"),
  ).toHaveAttribute("href", "https://ci.invalid/runs/106");
  await expect(buildHistoryReading(history).referenceLine).toHaveCount(1);
  await expect(buildHistoryReading(history).referenceTitle).toHaveText(
    "Prior-build average 1 min 43 s",
  );
  // The 103 s average is 3/15 of the way from the 100 s to the 115 s point.
  // These raw coordinates independently check the displayed reference's placement.
  const chart = await chartOf(history);
  expect(chart.points).toHaveLength(7);
  const hundred = chart.points[0];
  const oneFifteen = chart.points[4];
  if (hundred === undefined || oneFifteen === undefined)
    throw new Error("The chart must retain the 100 s and 115 s measurements.");
  const referenceY = Number(
    await buildHistoryReading(history).referenceLine.getAttribute("y1"),
  );
  expect(referenceY).toBeCloseTo(
    hundred.y + (oneFifteen.y - hundred.y) * (3 / 15),
    6,
  );
  expect(
    Number(await buildHistoryReading(history).referenceLine.getAttribute("y2")),
  ).toBe(referenceY);
  expect(await landedCiHistory(reader)).toEqual(collected);
  expect(ciCalls()).toHaveLength(calls);
  await expectNoSidewaysScrollIn(page, history);
  await page.screenshot({ path: "/tmp/seed285-slice1-phone.png" });
  // A second history read/revisit uses the retained evidence only.
  const revisited = await openProjectCiStatus(page, reader.origin);
  await expect(
    revisited.getByRole("button", { name: "Check again", exact: true }),
  ).toBeEnabled();
  await expect(
    proofOf(revisited).getByRole("table", {
      name: "CI proof by declared entry",
    }),
  ).toBeVisible();
  await expect(history).toContainText("+17 s (+17%)");
  const afterLiveRead = ciCalls().length;
  expect(await landedCiHistory(reader)).toEqual(collected);
  expect(ciCalls()).toHaveLength(afterLiveRead);
});
