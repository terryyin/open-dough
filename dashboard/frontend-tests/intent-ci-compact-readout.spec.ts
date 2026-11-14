// A Done comparison's compact CI wall time readout in each history state: a
// brief status where the landing's history is missing, pending, outside
// retention or insufficient; the prior average without a change when the
// selected timing is unusable; a change without a percentage over a zero
// average; and the build that stands in for the landing. Retained landings
// are projected by the server's own read; the integrated journeys collect.
import type { Page } from "@playwright/test";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type { ProjectHistory } from "../server/landedCiHistoryStore.ts";
import {
  doneWallTimeHistory,
  expectChangeCue,
} from "../tests/priorBuildReferencePage.ts";
import {
  expect,
  mountComparison,
  test,
  type ComparisonReply,
  type ComparisonServices,
} from "../tests/support/comparisonMountPage.ts";
import { doneHistoryBuilder } from "../tests/support/doneWallReferenceHistory.ts";
import type { FrontendAppServer } from "../tests/support/frontendAppServer.ts";
import {
  laterTrunkRevision,
  mountedDoneTrunk,
  preparedDoneComparison,
  serveDoneWallTimeHistory,
} from "../tests/support/mountedDoneWallTime.ts";

const landing = "Selected landing ccccccc";
const { endpoint } = mountedDoneTrunk;

async function openDoneHistory(
  page: Page,
  server: FrontendAppServer,
  services: ComparisonServices,
  answer: () => ProjectHistory | ComparisonReply,
) {
  const facts = preparedDoneComparison();
  Object.assign(services, {
    comparison: () => ({ json: facts.answer }),
    proof: (params: URLSearchParams) => ({
      json: facts.proof(Number(params.get("run"))),
    }),
  });
  const reads = await serveDoneWallTimeHistory(page, answer);
  const panel = await mountComparison(page, server, facts);
  return { history: doneWallTimeHistory(panel), reads };
}

const keptBuild = (state: "pass" | "failed") =>
  makeMe.aKeptBuild
    .with({
      revision: endpoint,
      state,
      runId: 103,
      runAttempt: 1,
      startedAt: "2026-11-07T10:00:00Z",
      completedAt: "2026-11-07T10:02:00Z",
    })
    .please();

test("brief statuses name a pending, missing, out-of-retention or insufficient history and keep any usable prior average without a change", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const pending = doneHistoryBuilder(mountedDoneTrunk)
    .pendingLanding({
      receipt: "selected",
      revision: endpoint,
      receivedAt: "2026-11-07T10:10:00Z",
      waitsFor: "build",
      runId: 103,
    })
    .please();
  const steps: readonly {
    readonly history: ProjectHistory;
    readonly status?: string;
    readonly selected: string;
    readonly average: string;
  }[] = [
    {
      history: pending,
      selected: `${landing} · No timing · Pending · CI queued or running`,
      average: "Prior-build average · 1 min 43 s · 5 prior builds used",
    },
    {
      history: doneHistoryBuilder(mountedDoneTrunk, {
        selected: keptBuild("failed"),
      }).please(),
      selected: `${landing} · Failed build`,
      average: "Prior-build average · 1 min 43 s · 5 prior builds used",
    },
    {
      history: doneHistoryBuilder(mountedDoneTrunk, {
        selected: keptBuild("pass"),
      }).please(),
      selected: `${landing} · No timing · Validated CI proof summary is not retained`,
      average: "Prior-build average · 1 min 43 s · 5 prior builds used",
    },
    {
      history: doneHistoryBuilder(mountedDoneTrunk).please(),
      status: "Selected landing not collected",
      selected: `${landing} · No timing`,
      average: "Prior-build average · 1 min 43 s · 5 prior builds used",
    },
    {
      history: doneHistoryBuilder(mountedDoneTrunk, {
        priors: [100000, 100000, 100000, 100000],
        selectedMs: 120000,
      }).please(),
      selected: `${landing} · 2 min`,
      average:
        "Prior-build average · Insufficient history · 4 prior builds used",
    },
    {
      history: doneHistoryBuilder(mountedDoneTrunk, {
        priors: [],
        later: true,
      }).please(),
      status: "Outside retained history",
      selected: `${landing} · No timing`,
      average:
        "Prior-build average · Insufficient history · 0 prior builds used",
    },
    {
      history: makeMe.aLandedCiHistory
        .inTrunkOrder([...mountedDoneTrunk.order])
        .please(),
      status: "No collected history",
      selected: `${landing} · No timing`,
      average:
        "Prior-build average · Insufficient history · 0 prior builds used",
    },
  ];
  let step = 0;
  const { history, reads } = await openDoneHistory(
    page,
    comparisonServer,
    comparisonServices,
    () => steps[step]?.history ?? pending,
  );
  for (const [index, expected] of steps.entries()) {
    if (index > 0) {
      step = index;
      await history.refresh.click();
      await expect.poll(() => reads.count).toBe(index + 1);
    }
    await expect(history.selected).toHaveText(expected.selected);
    await expect(history.average).toHaveText(expected.average);
    await expect(history.change).toHaveCount(0);
    if (expected.status === undefined)
      await expect(history.status).toHaveCount(0);
    else await expect(history.status).toHaveText(expected.status);
  }
  // Without a measured build there is no chart.
  await expect(history.chart.box).toHaveCount(0);
  // Four comparable observations and the selected landing stay charted.
  step = 4;
  await history.refresh.click();
  await expect(history.chart.marks).toHaveCount(5);
  await expect(history.chart.readout).toHaveText(
    "Nov 5 · Selected landing · 2 min",
  );
});

test("a zero prior average keeps the elapsed change without a percentage, and a stand-in build names how it stands for the landing", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  let shown = doneHistoryBuilder(mountedDoneTrunk, {
    priors: [0, 0, 0, 0, 0],
    selectedMs: 1000,
  }).please();
  const { history } = await openDoneHistory(
    page,
    comparisonServer,
    comparisonServices,
    () => shown,
  );
  await expect(history.average).toHaveText(
    "Prior-build average · 0 s · 5 prior builds used",
  );
  await expect(history.change).toHaveText(
    "vs. prior average · +1 s (percentage unavailable: average is zero)",
  );
  await expectChangeCue(page, history.region, "slower");
  for (const [provenance, revision, words] of [
    ["later", laterTrunkRevision, "Later trunk build, includes later changes"],
    ["equivalent", "8".repeat(40), "Reused equivalent first-parent build"],
  ] as const) {
    shown = doneHistoryBuilder(mountedDoneTrunk, {
      selectedMs: 120000,
      standIn: { provenance, revision },
    }).please();
    await history.refresh.click();
    await expect(history.selected).toHaveText(`${landing} · 2 min · ${words}`);
    await expect(history.change).toHaveText("vs. prior average · +17 s (+17%)");
    await expectChangeCue(page, history.region, "slower");
  }
});

test("a failed history read keeps the last history beside its alert, and its short retry reads again", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const retained = doneHistoryBuilder(mountedDoneTrunk, {
    selectedMs: 120000,
  }).please();
  let reply: ProjectHistory | ComparisonReply = retained;
  const { history, reads } = await openDoneHistory(
    page,
    comparisonServer,
    comparisonServices,
    () => reply,
  );
  await expect(history.change).toHaveText("vs. prior average · +17 s (+17%)");
  await expect(history.retry).toHaveCount(0);
  reply = {
    status: 503,
    json: { error: "The collected CI history could not be read." },
  };
  await history.refresh.click();
  await expect(history.alert).toHaveText(
    "The collected CI history could not be read.",
  );
  await expect(history.change).toHaveText("vs. prior average · +17 s (+17%)");
  await expect(history.refresh).toBeVisible();
  reply = retained;
  await history.retry.click();
  await expect(history.alert).toHaveCount(0);
  await expect(history.retry).toHaveCount(0);
  expect(reads.count).toBe(3);
});
