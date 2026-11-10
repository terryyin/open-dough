// Settled retained producer observations and a collected selected attempt
// traverse the normal authenticated history read, never a fixture average.
import { shortSha } from "../../src/baseCiWording.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
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
    retained.recording(landing, `run/${run.id}/1`, {
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
    });
  }
  // Settled background history is the starting precondition; only the new
  // selected landing needs collection in this comparison journey.
  keepLandedCiHistory(dashboard.home, retained.please());
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
  readers.push(await restartAsLandedCiReader(dashboard, origin, "preview"));
  const beforeRead = github.calls.length;
  expect(await landedCiHistory(dashboard)).toEqual(collected);
  expect(github.calls).toHaveLength(beforeRead);

  await page.setViewportSize({ width: 390, height: 844 });
  const panel = await openProjectCiStatus(page);
  await expect(
    panel.getByRole("button", { name: "Check again", exact: true }),
  ).toBeEnabled();
  await expect(
    proofOf(panel).getByRole("table", { name: "CI proof by declared entry" }),
  ).toBeVisible();
  const history = historyOf(panel);
  await expect(
    history.getByText("Prior-build average", { exact: true }),
  ).toBeVisible();
  await expect(history).toContainText("1 min 43 s");
  await expect(history).toContainText("+17 s (+17%)");
  await expect(history).toContainText("5 prior builds used · Nov 1–Nov 5");
  await expect(history).toContainText("Median 1 min 40 s");
  await expect(history).toContainText("strictly more than 15%");
  const ciCalls = () =>
    github.calls.filter(({ request }) => request.kind.startsWith("actions-"));
  const calls = ciCalls().length;
  const builds = await evidenceByKeyboard(page, panel);
  await expect(builds.getByRole("listitem")).toHaveCount(7);
  await expect(builds.getByRole("listitem").nth(5)).toContainText("1 min 56 s");
  const evidence = history.getByRole("group", {
    name: "Prior-build reference evidence",
  });
  await expect(evidence.getByText(/✓ Included/)).toHaveCount(5);
  await expect(evidence.getByText(/× Excluded/)).toHaveText(
    /Nov 6.*1 min 56 s.*Slow outlier/,
  );
  await expect(evidence.getByText(/◆ Selected/)).toHaveText(/Nov 7.*2 min/);
  await expect(evidence.getByText(/◆ Selected/)).toContainText(
    `exact revision ${shortSha(selectedLanding.revision)}`,
  );
  await expect(evidence.getByText(/× Excluded/)).toContainText(
    `exact revision ${shortSha(excludedLanding.revision)}`,
  );
  await expect(
    evidence.getByRole("link", { name: "Run 106 · attempt 1" }),
  ).toHaveAttribute("href", "https://ci.invalid/runs/106");
  await expect(
    history.locator(".intent-ci-history-reference line"),
  ).toHaveCount(1);
  await expect(
    history.locator(".intent-ci-history-reference title"),
  ).toHaveText("Prior-build average 1 min 43 s");
  expect(await landedCiHistory(dashboard)).toEqual(collected);
  expect(ciCalls()).toHaveLength(calls);
  await expectNoSidewaysScrollIn(page, history);
  await page.screenshot({ path: "/tmp/seed285-slice1-phone.png" });
  // A second history read/revisit uses the retained evidence only.
  const revisited = await openProjectCiStatus(page);
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
  expect(await landedCiHistory(dashboard)).toEqual(collected);
  expect(ciCalls()).toHaveLength(afterLiveRead);
});
