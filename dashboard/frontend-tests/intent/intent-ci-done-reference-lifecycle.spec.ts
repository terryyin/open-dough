// CI state transitions move the independent local history between the gap
// and the shown comparison; they cannot own, reread or discard it. The
// history's own refresh and retry leave the live comparison proof as it was.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { DoneWallTimeHistory } from "../../src/ciDoneWallTimeHistory.ts";
import type { StoryCiComparisonAnswer } from "../../src/storyCiComparison.ts";
import { doneWallTimeHistory } from "./intent-ci-done-history-page.ts";
import {
  doneComparison,
  doneIdentity,
  openDoneStoryComparison,
  publishedCompletion,
} from "./intent-story-compare-stories.ts";

const average = "Prior-build average · 1 min 43 s · 5 prior builds used";
const unavailable: StoryCiComparisonAnswer = makeMe.aStoryCiComparison
  .with({
    kind: "unavailable",
    identity: doneIdentity,
    explanation: "Comparison evidence incomplete",
    checkedAt: "2026-11-07T12:00:00Z",
  })
  .please();

// The comparison read fails until `failing()` says otherwise, then answers
// `recovered`.
const comparisonAnswering =
  (failing: () => boolean, recovered: StoryCiComparisonAnswer) => () => {
    if (failing()) throw new Error("CI comparison read failed");
    return recovered;
  };

// The Done story's comparison, each history read answered by `answer()` and
// each comparison read by `comparison()`: how many history, comparison and
// proof reads were asked.
async function openDoneLifecycle(
  answer: (revision: string) => Promise<DoneWallTimeHistory>,
  comparison: () => StoryCiComparisonAnswer,
) {
  let historyReads = 0;
  const opened = await openDoneStoryComparison(
    { review: () => Promise.resolve(publishedCompletion()) },
    (...[, endpoint]) => {
      historyReads += 1;
      return answer(endpoint.revision);
    },
    comparison,
  );
  return {
    historyReads: () => historyReads,
    proofReads: () =>
      opened.comparisonReads.comparisons.length +
      opened.comparisonReads.proofs.length,
  };
}

const retained = (revision: string) =>
  Promise.resolve(makeMe.aDoneWallTimeHistory.through(revision).please());
const measured = (revision: string) =>
  makeMe.aDoneWallTimeHistory.measured(120000).through(revision).please();
const change = "vs. prior average · +17 s (+17%)";

test("failed and unavailable CI comparisons keep the local history after their gap, and its failed refresh and retry leave the comparison as it was", async () => {
  let reply: (revision: string) => Promise<DoneWallTimeHistory> = retained;
  let comparisonFails = true;
  const shown = await openDoneLifecycle(
    (revision) => reply(revision),
    comparisonAnswering(() => comparisonFails, unavailable),
  );
  const history = await doneWallTimeHistory();
  await expect.poll(history.gap).toContain("CI comparison read failed");
  await expect.poll(history.average).toBe(average);
  expect(history.standsAfterGap()).toBe(true);

  comparisonFails = false;
  await history.checkAgain.click();
  await expect.poll(history.gap).toBe("Comparison evidence incomplete");
  expect(history.average()).toBe(average);

  // The history's own failed refresh and retry ask the comparison nothing,
  // and the retry keeps the last history until its new answer arrives.
  const proofReads = shown.proofReads();
  reply = () =>
    Promise.reject(new Error("The collected CI history could not be read."));
  await history.refresh.click();
  await expect
    .poll(history.alert)
    .toBe("The collected CI history could not be read.");
  expect(history.average()).toBe(average);
  let arrive: () => void = () => undefined;
  reply = (revision) =>
    new Promise((resolve) => {
      arrive = () => {
        resolve(measured(revision));
      };
    });
  const reads = shown.historyReads();
  await history.retry.click();
  await expect.poll(shown.historyReads).toBe(reads + 1);
  expect(history.average()).toBe(average);
  expect(history.change()).toBeUndefined();
  arrive();
  await expect.poll(history.change).toBe(change);
  expect(history.alert()).toBeUndefined();
  await expect.element(history.retry).not.toBeInTheDocument();
  expect(history.gap()).toBe("Comparison evidence incomplete");
  expect(shown.proofReads()).toBe(proofReads);
});

test("a held history read resolves beside the live comparison proof, the comparison's later failure moves it without rereading or discarding it, and the recovered comparison reads it afresh", async () => {
  let release: () => void = () => undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let reply = async (revision: string) => {
    await held;
    return retained(revision);
  };
  let comparisonFails = false;
  const shown = await openDoneLifecycle(
    (revision) => reply(revision),
    comparisonAnswering(() => comparisonFails, doneComparison),
  );
  const history = await doneWallTimeHistory();
  await expect.poll(shown.proofReads).toBeGreaterThan(0);
  const proofReads = shown.proofReads();
  expect(history.average()).toBeUndefined();
  release();
  await expect.poll(history.average).toBe(average);
  expect(history.standsBetweenTables()).toBe(true);
  expect(shown.historyReads()).toBe(1);
  expect(shown.proofReads()).toBe(proofReads);

  comparisonFails = true;
  await history.checkAgain.click();
  await expect.poll(history.gap).toContain("CI comparison read failed");
  expect(history.average()).toBe(average);
  expect(history.alert()).toBeUndefined();
  expect(shown.historyReads()).toBe(1);

  comparisonFails = false;
  reply = (revision) => Promise.resolve(measured(revision));
  await history.checkAgain.click();
  await expect.poll(history.change).toBe(change);
  expect(history.standsBetweenTables()).toBe(true);
});
