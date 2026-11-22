// A Done comparison's compact CI wall time readout in each history state: a
// brief status where the landing's history is missing, pending, outside
// retention or insufficient; the prior average without a change when the
// selected timing is unusable; a change without a percentage over a zero
// average; and the build that stands in for the landing.
import { expect, test } from "vitest";
import type { DoneWallTimeHistoryBuilder } from "../../../Distribution/tests/support/doneWallTimeHistoryTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { DoneWallTimeHistory } from "../../src/ciDoneWallTimeHistory.ts";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import { doneWallTimeHistory } from "./intent-ci-done-history-page.ts";
import {
  openDoneStoryComparison,
  publishedCompletion,
} from "./intent-story-compare-stories.ts";

type History = DoneWallTimeHistoryBuilder;

// The Done story's comparison, each history read at the published landing
// answered from `answer()`: the history view, the landing's words and the
// history reads.
async function openDoneHistory(
  answer: () => History | Error | Promise<History>,
) {
  let landing = "";
  let reads = 0;
  const read: IntentCiReadSource["readDoneWallTimeHistory"] = async (
    ...[, endpoint]
  ): Promise<DoneWallTimeHistory> => {
    reads += 1;
    landing = `Selected landing ${endpoint.revision.slice(0, 7)}`;
    const shown = await answer();
    if (shown instanceof Error) throw shown;
    return shown.through(endpoint.revision).please();
  };
  await openDoneStoryComparison({
    review: () => Promise.resolve(publishedCompletion()),
    ci: { readDoneWallTimeHistory: read },
  });
  const history = await doneWallTimeHistory();
  return {
    history,
    landing: () => landing,
    reads: () => reads,
  };
}

const done = () => makeMe.aDoneWallTimeHistory;
const usableAverage = "Prior-build average · 1 min 43 s · 5 prior builds used";
const noAverage = (builds: number) =>
  `Prior-build average · Insufficient history · ${String(builds)} prior builds used`;

test("brief statuses name a pending, missing, out-of-retention or insufficient history and keep any usable prior average without a change", async () => {
  const steps: readonly {
    readonly history: History;
    readonly status?: string;
    readonly selected: string;
    readonly average: string;
  }[] = [
    {
      history: done().pending(),
      selected: "No timing · Pending · CI queued or running",
      average: usableAverage,
    },
    {
      history: done().failed(),
      selected: "Failed build",
      average: usableAverage,
    },
    {
      history: done().proofNotRetained(),
      selected: "No timing · Validated CI proof summary is not retained",
      average: usableAverage,
    },
    {
      history: done(),
      status: "Selected landing not collected",
      selected: "No timing",
      average: usableAverage,
    },
    {
      history: done()
        .priors([100000, 100000, 100000, 100000])
        .tooFewToAverage(4)
        .measured(120000),
      selected: "2 min",
      average: noAverage(4),
    },
    {
      history: done().outsideRetention(),
      status: "Outside retained history",
      selected: "No timing",
      average: noAverage(0),
    },
    {
      history: done().noCollectedHistory(),
      status: "No collected history",
      selected: "No timing",
      average: noAverage(0),
    },
  ];
  let shown = done();
  const opened = await openDoneHistory(() => shown);
  const { history } = opened;
  await expect.poll(history.status).toBe("Selected landing not collected");
  for (const [index, expected] of steps.entries()) {
    shown = expected.history;
    await history.refresh.click();
    await expect.poll(opened.reads).toBe(index + 2);
    await expect
      .poll(history.selected)
      .toBe(`${opened.landing()} · ${expected.selected}`);
    expect(history.average()).toBe(expected.average);
    expect(history.change()).toBeUndefined();
    expect(history.status()).toBe(expected.status);
  }
  // Without a measured build there is no chart.
  expect(history.chartMarks()).toBe(0);
  // Four comparable observations and the selected landing stay charted.
  shown = steps[4]?.history ?? done();
  await history.refresh.click();
  await expect.poll(history.chartMarks).toBe(5);
  expect(history.chartReadout()).toBe("Nov 5 · Selected landing · 2 min");
});

test("a zero prior average keeps the elapsed change without a percentage, and a stand-in build names how it stands for the landing", async () => {
  let shown: History = done()
    .priors([0, 0, 0, 0, 0])
    .averaging(0, 5)
    .measured(1000);
  const opened = await openDoneHistory(() => shown);
  const { history } = opened;
  await expect
    .poll(history.average)
    .toBe("Prior-build average · 0 s · 5 prior builds used");
  expect(history.change()).toBe(
    "vs. prior average · +1 s (percentage unavailable: average is zero)",
  );
  expect(history.changeCue()).toBe("slower");
  for (const [standIn, revision, words] of [
    ["later", "9".repeat(40), "Later trunk build, includes later changes"],
    ["equivalent", "8".repeat(40), "Reused equivalent first-parent build"],
  ] as const) {
    shown = done().standIn(standIn, revision, 120000);
    await history.refresh.click();
    await expect
      .poll(history.selected)
      .toBe(`${opened.landing()} · 2 min · ${words}`);
    expect(history.change()).toBe("vs. prior average · +17 s (+17%)");
    expect(history.changeCue()).toBe("slower");
  }
});

test("a failed history read keeps the last history beside its alert, and its short retry reads again", async () => {
  const retained = done().measured(120000);
  let reply: History | Error = retained;
  const opened = await openDoneHistory(() => reply);
  const { history } = opened;
  await expect.poll(history.change).toBe("vs. prior average · +17 s (+17%)");
  await expect.element(history.retry).not.toBeInTheDocument();
  reply = new Error("The collected CI history could not be read.");
  await history.refresh.click();
  await expect
    .poll(history.alert)
    .toBe("The collected CI history could not be read.");
  expect(history.change()).toBe("vs. prior average · +17 s (+17%)");
  await expect.element(history.refresh).toBeVisible();
  reply = retained;
  await history.retry.click();
  await expect.poll(history.alert).toBeUndefined();
  await expect.element(history.retry).not.toBeInTheDocument();
  expect(opened.reads()).toBe(3);
});
