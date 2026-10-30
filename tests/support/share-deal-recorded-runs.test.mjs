// The duration deal of scripts/share-deal.mjs on retained CI runs under
// tests/support/fixtures/node-suite-ci-runs/: the Node suite's per-job seconds
// from CI runs 39875064344 (before) and 39883782226 (after one 1.0 s test file
// was added), and stale-longest-first, the 84-label positional list at
// 3fba18f9 that let that addition move 47 jobs and push share 3 over its
// budget.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  dealShares,
  formatPreview,
  formatSeconds,
  parseDurationList,
  readTimeBudget,
  shareLabels,
} from "../../scripts/share-deal.mjs";

const fixtures = new URL("fixtures/node-suite-ci-runs/", import.meta.url);
const budgetPath = fileURLToPath(new URL("../time-budget", import.meta.url));
// The ceiling the assertions measure against, as tests/time-budget sets it.
const { totalJobSeconds: ceiling } = readTimeBudget(budgetPath);

// Every job's seconds from one run's three share artifacts.
function runSeconds(run) {
  const seconds = new Map();
  for (const share of [1, 2, 3]) {
    const name = `${run}/test-times-${share}.txt`;
    const text = readFileSync(new URL(name, fixtures), "utf8");
    for (const [label, value] of parseDurationList(text, name).seconds) {
      seconds.set(label, value);
    }
  }
  return seconds;
}

const before = runSeconds("before");
const after = runSeconds("after");
const renamedJob = "tests/git-publication-native.sh";
const renamedTo = "tests/git-publication-native-renamed.sh";

const predicted = (deal) =>
  deal.shares.map((share) => formatSeconds(share.predicted));
// Each share's total from a run's measured seconds, summed to one decimal.
const measured = (deal, seconds) =>
  deal.shares.map((share) =>
    formatSeconds(
      share.jobs.reduce((total, job) => total + seconds.get(job.label), 0),
    ),
  );
const shareOf = (deal) =>
  new Map(
    deal.shares.flatMap((share) =>
      share.jobs.map((job) => [job.label, share.index]),
    ),
  );
const preview = (deal, listName = "before") =>
  formatPreview(deal, {
    listName,
    ceiling,
    budgetName: "tests/time-budget",
  });
const headroom = (seconds) => formatSeconds(ceiling - seconds);
const escaped = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("example 1: the before run's recorded jobs deal into three equal shares", () => {
  assert.equal(before.size, 416);
  const deal = dealShares([...before.keys()], before, 3);
  assert.deepEqual(predicted(deal), ["596.0", "596.0", "596.0"]);
  assert.equal(deal.unrecordedCount, 0);
  assert.equal(deal.recordedMedian, 2);
  for (const share of deal.shares) {
    const seconds = share.jobs.map((job) => job.seconds);
    assert.deepEqual(
      seconds,
      [...seconds].sort((left, right) => right - left),
    );
  }
});

test("example 1: the added 1.0 s file alone changes share membership", () => {
  const added = [...after.keys()].filter((label) => !before.has(label));
  assert.deepEqual(added, [
    "tests/support/product-backlog-identity-evidence.test.mjs",
  ]);
  assert.equal(after.get(added[0]), 1);
  assert.equal(after.size, 417);
  const beforeDeal = dealShares([...before.keys()], before, 3);
  const afterDeal = dealShares([...after.keys()], before, 3);
  const beforeShares = shareOf(beforeDeal);
  const afterShares = shareOf(afterDeal);
  const changed = [...beforeShares].filter(
    ([label, share]) => afterShares.get(label) !== share,
  );
  assert.deepEqual(changed, []);
  // Unrecorded, it is assumed at the median (2.0 s) on the lightest share:
  // all three are 596.0, so share 1.
  assert.equal(afterShares.get(added[0]), 1);
  assert.deepEqual(predicted(afterDeal), ["598.0", "596.0", "596.0"]);
  // The after run's seconds summed per predicted share (the plan's
  // reconstruction, with another order among equal-second jobs, measured
  // 599.2 / 599.5 / 596.6 for the same sum). Every share stays under the
  // budget's total ceiling (heaviest headroom 694 − 602.0 = 92), where the
  // positional deal measured 711.1 on share 3.
  const totals = measured(afterDeal, after);
  assert.deepEqual(totals, ["602.0", "597.1", "596.2"]);
  assert.equal(
    formatSeconds(totals.reduce((sum, total) => sum + Number(total), 0)),
    "1795.3",
  );
  for (const total of totals) {
    assert.ok(Number(total) <= ceiling, total);
  }
});

test("example 2: the preview lists an added unrecorded file at the median on the lightest share", () => {
  const added = "tests/support/zz-new-check.test.mjs";
  const baseline = dealShares([...before.keys()], before, 3);
  const deal = dealShares([added, ...before.keys()], before, 3);
  assert.equal(deal.unrecordedCount, 1);
  assert.equal(deal.assumedSeconds, 2);
  const text = preview(deal);
  assert.match(
    text,
    /^Predicted job-seconds per share from before: 417 jobs, 416 recorded, 1 unrecorded at 2\.0 s each \(the recorded median\)\.$/m,
  );
  assert.match(
    text,
    /^share 1\/3: 598\.0 predicted \(\d+ jobs, 1 unrecorded\)/m,
  );
  assert.match(
    text,
    /^unrecorded jobs \(1\), each assumed at 2\.0 s; a refresh of before records them:\n {2}share 1\/3 {2}tests\/support\/zz-new-check\.test\.mjs$/m,
  );
  assert.deepEqual(predicted(deal).slice(1), predicted(baseline).slice(1));
  assert.deepEqual(shareLabels(deal, 2), shareLabels(baseline, 2));
  assert.deepEqual(shareLabels(deal, 3), shareLabels(baseline, 3));
});

test("example 3: a renamed 54.4 s job raises the heaviest share by at most its seconds and shows as unrecorded", () => {
  assert.equal(before.get(renamedJob), 54.4);
  const labels = [...before.keys()].map((label) =>
    label === renamedJob ? renamedTo : label,
  );
  const baseline = dealShares([...before.keys()], before, 3);
  const deal = dealShares(labels, before, 3);
  assert.equal(deal.unrecordedCount, 1);
  const heaviestBefore = Math.max(
    ...baseline.shares.map((share) => share.predicted),
  );
  // Predicted at the median, the renamed job lowers the predictions; with
  // its real seconds the heaviest share measures 632.2, a rise of 36.2 from
  // 596.0, within the renamed job's 54.4.
  assert.deepEqual(predicted(deal), ["577.9", "577.9", "579.8"]);
  const real = new Map(before);
  real.set(renamedTo, 54.4);
  const totals = measured(deal, real);
  assert.deepEqual(totals, ["577.9", "577.9", "632.2"]);
  const heaviest = Math.max(...totals.map(Number));
  assert.ok(heaviest <= heaviestBefore + 54.4, `${heaviest}`);
  assert.ok(heaviest > heaviestBefore);
  assert.match(
    preview(deal),
    /^unrecorded jobs \(1\), each assumed at 2\.0 s;.*\n {2}share 3\/3 {2}tests\/git-publication-native-renamed\.sh$/m,
  );
});

test("example 4: the preview on the stale 84-label list counts 333 unrecorded of 417 against the budget's ceiling", () => {
  const staleLabels = readFileSync(
    new URL("stale-longest-first", fixtures),
    "utf8",
  )
    .split("\n")
    .filter((line) => line !== "" && !line.startsWith("#"));
  assert.equal(staleLabels.length, 84);
  // The positional list carried no seconds; the before run supplies them.
  const stale = new Map(staleLabels.map((label) => [label, before.get(label)]));
  const deal = dealShares([...after.keys()], stale, 3);
  const text = preview(deal, "stale-longest-first");
  assert.match(
    text,
    /^Predicted job-seconds per share from stale-longest-first: 417 jobs, 84 recorded, 333 unrecorded at 6\.3 s each \(the recorded median\)\.$/m,
  );
  assert.match(
    text,
    new RegExp(
      `^share 1/3: 997\\.5 predicted \\(\\d+ jobs, \\d+ unrecorded\\); headroom ${escaped(headroom(997.5))} to the total ceiling ${ceiling} \\(tests/time-budget\\)$`,
      "m",
    ),
  );
  assert.equal(
    text.match(new RegExp(`^share \\d/3: .*headroom .* ${ceiling} `, "gm"))
      .length,
    3,
  );
  assert.match(text, /^unrecorded jobs \(333\), each assumed at 6\.3 s;/m);
  assert.equal(text.match(/^ {2}share \d\/3 {2}/gm).length, 333);
});

test("the deal is deterministic across input order and keeps every job in one share", () => {
  const labels = [...after.keys()];
  const forward = dealShares(labels, before, 3);
  const reversed = dealShares([...labels].reverse(), before, 3);
  const shuffled = dealShares(
    [...labels].sort(() => Math.random() - 0.5),
    before,
    3,
  );
  for (const other of [reversed, shuffled]) {
    for (const index of [1, 2, 3]) {
      assert.deepEqual(shareLabels(other, index), shareLabels(forward, index));
    }
  }
  const all = [1, 2, 3].flatMap((index) => shareLabels(forward, index));
  assert.deepEqual([...all].sort(), [...labels].sort());
});
