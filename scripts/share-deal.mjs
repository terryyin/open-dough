// scripts/share-deal.mjs deals a test suite's jobs into CI shares by their
// recorded durations: it reads the duration list and the time budget, deals
// the jobs, selects one share as `<i>/<n>` (`OPEN_DOUGH_TEST_SPLIT`,
// `OPEN_DOUGH_DASHBOARD_SPLIT`, the `share` command's `--split`), and writes
// the preview and the times form a refresh merges. scripts/test-shares.mjs is
// its command surface, run by scripts/test-jobs.sh for the Node runner's share
// and by a contributor for the preview and the refresh;
// dashboard/tests/support/testFiles.mjs deals the dashboard's spec files
// through it.
//
// A duration list (`tests/longest-first` for the Node suite) holds one
// `<seconds><TAB><label>` line per recorded job, the form the runner's
// `test-times` artifact prints. duration-list.mjs reads plain lists or indexes
// with named TSV parts; malformed rows fail before any job runs.
//
// The deal itself is stated in tests/test-shares.md ("The deal").

import {
  bytewise,
  collectLongestSeconds,
  formatListText,
  formatSeconds,
  newDurationListHeader,
  readInput,
  TestSharesError,
} from "./duration-list.mjs";
export {
  formatSeconds,
  readInput,
  TestSharesError,
  readDurationList,
  parseDurationList,
  formatTimes,
  mergeTimes,
  writeDurationList,
} from "./duration-list.mjs";

// Below this, two predicted totals are equal; sums of tenths differ from
// their exact value by far less, and durations are never this close apart.
const equalTotals = 1e-9;

// Parses `<i>/<n>` with i from 1 to n into the share and the share count,
// failing with the setting that carried it (as scripts/test-jobs.sh fails on
// its own `OPEN_DOUGH_TEST_SPLIT`).
export function parseSplit(value, setting) {
  const match = /^([1-9][0-9]*)\/([1-9][0-9]*)$/.exec(value);
  const share = Number(match?.[1]);
  const count = Number(match?.[2]);
  if (
    !Number.isSafeInteger(share) ||
    !Number.isSafeInteger(count) ||
    share > count
  ) {
    throw new TestSharesError(
      `FAIL: ${setting}=${value} is not <i>/<n> with i from 1 to n.`,
    );
  }
  return { share, count };
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  if (sorted.length === 0) {
    return undefined;
  }
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

// Recorded seconds at or above this count toward the runner-factor median;
// shorter jobs are noise against timer resolution.
export const measurableRecordedSeconds = 2;

// Formats a runner factor for breach lines: at least one decimal, up to three.
export function formatFactor(value) {
  const rounded = Math.round(value * 1000) / 1000;
  if (Number.isInteger(rounded)) {
    return rounded.toFixed(1);
  }
  return String(rounded);
}

// A share's runner factor: the median, over jobs recorded with measurable
// time, of observed/recorded seconds. With no such job, the factor is 1 and
// available is false (the breach line says unavailable).
export function runnerFactor(recorded, observed) {
  const ratios = [];
  for (const [label, observedSeconds] of observed) {
    const recordedSeconds = recorded.get(label);
    if (
      recordedSeconds !== undefined &&
      recordedSeconds >= measurableRecordedSeconds
    ) {
      ratios.push(observedSeconds / recordedSeconds);
    }
  }
  const factor = median(ratios);
  if (factor === undefined) {
    return { factor: 1, available: false };
  }
  return { factor, available: true };
}

// `<factor><TAB><label>` for scripts/test-budget.sh: label is `unavailable`
// or the formatted factor.
export function formatRunnerFactorLine(recorded, observed) {
  const { factor, available } = runnerFactor(recorded, observed);
  const label = available ? formatFactor(factor) : "unavailable";
  return `${factor}\t${label}\n`;
}

// Refresh text at the existing list's speed so a refresh neither tightens nor
// loosens the budget; a new list or no measurable common job stays observed.
export function refreshListText(existing, times, source) {
  const observed = collectLongestSeconds(times);
  const { factor, available } = existing
    ? runnerFactor(existing.seconds, observed)
    : { factor: 1, available: false };
  const seconds = available
    ? new Map([...observed].map(([label, value]) => [label, value / factor]))
    : observed;
  const note = available
    ? `runner factor ${formatFactor(factor)}`
    : "runner factor unavailable";
  return formatListText(
    existing?.header ?? newDurationListHeader,
    `${source} (${note})`,
    seconds,
  );
}

// Deals the labels into shareCount shares by the recorded seconds. Returns
// the shares in index order, each with its jobs in start order and its
// predicted total, beside the recorded and unrecorded counts and the
// assumed seconds of an unrecorded job.
export function dealShares(labels, seconds, shareCount) {
  if (!Number.isInteger(shareCount) || shareCount < 1) {
    throw new TestSharesError(
      `FAIL: the share count must be a whole number of 1 or more, not ${shareCount}.`,
    );
  }
  const unique = [...new Set(labels)].sort(bytewise);
  const recorded = unique
    .filter((label) => seconds.has(label))
    .map((label) => ({ label, seconds: seconds.get(label), recorded: true }))
    .sort((left, right) => right.seconds - left.seconds);
  // The median of an even count is the mean of the two middle values; with
  // no recorded jobs, or a median of 0, an unrecorded job is assumed at 1 s so
  // unrecorded jobs still spread across the shares.
  const recordedMedian = median(recorded.map((job) => job.seconds));
  const assumedSeconds =
    recordedMedian === undefined || recordedMedian === 0 ? 1 : recordedMedian;
  const unrecorded = unique
    .filter((label) => !seconds.has(label))
    .map((label) => ({ label, seconds: assumedSeconds, recorded: false }));
  const shares = [...Array(shareCount).keys()].map((index) => ({
    index: index + 1,
    jobs: [],
    predicted: 0,
  }));
  for (const job of [...recorded, ...unrecorded]) {
    const lightest = shares.reduce((best, share) =>
      share.predicted < best.predicted - equalTotals ? share : best,
    );
    lightest.jobs.push(job);
    lightest.predicted += job.seconds;
  }
  return {
    shareCount,
    shares,
    recordedCount: recorded.length,
    unrecordedCount: unrecorded.length,
    recordedMedian,
    assumedSeconds,
  };
}

// The labels of share `index` (1-based) in start order.
export function shareLabels(allocation, index) {
  return allocation.shares[index - 1].jobs.map((job) => job.label);
}

// The preview text: the list and job counts, each share's predicted total
// with its headroom to `ceiling` (the budget's total-job-seconds, when
// given), then each unrecorded job with its share and assumed seconds.
export function formatPreview(allocation, { listName, ceiling, budgetName }) {
  const jobCount = allocation.recordedCount + allocation.unrecordedCount;
  const assumption =
    allocation.recordedMedian === allocation.assumedSeconds
      ? "the recorded median"
      : "no usable recorded median";
  const lines = [
    `Predicted job-seconds per share from ${listName}: ${jobCount} jobs, ${allocation.recordedCount} recorded, ${allocation.unrecordedCount} unrecorded at ${formatSeconds(allocation.assumedSeconds)} s each (${assumption}).`,
  ];
  for (const share of allocation.shares) {
    const unrecorded = share.jobs.filter((job) => !job.recorded).length;
    let line = `share ${share.index}/${allocation.shareCount}: ${formatSeconds(share.predicted)} predicted (${share.jobs.length} jobs, ${unrecorded} unrecorded)`;
    if (ceiling !== undefined) {
      line += `; headroom ${formatSeconds(ceiling - share.predicted)} to the total ceiling ${ceiling} (${budgetName})`;
    }
    lines.push(line);
  }
  if (allocation.unrecordedCount > 0) {
    lines.push(
      `unrecorded jobs (${allocation.unrecordedCount}), each assumed at ${formatSeconds(allocation.assumedSeconds)} s; a refresh of ${listName} records them:`,
    );
    for (const share of allocation.shares) {
      for (const job of share.jobs) {
        if (!job.recorded) {
          lines.push(
            `  share ${share.index}/${allocation.shareCount}  ${job.label}`,
          );
        }
      }
    }
  }
  return `${lines.join("\n")}\n`;
}

// Reads `per-job-seconds=<n>` and `total-job-seconds=<n>` as
// scripts/time-budget.bash, the runner's reader of the same file, does: any
// other non-comment line, or a missing number, fails.
export function readTimeBudget(path) {
  const settings = readInput(path)
    .split(/\r?\n/)
    .filter((line) => line !== "" && !line.startsWith("#"))
    .map((line) =>
      /^(per-job-seconds|total-job-seconds)=([0-9]+(\.[0-9]+)?)$/.exec(line),
    );
  const values = Object.fromEntries(
    settings
      .filter((match) => match !== null)
      .map((match) => [match[1], Number(match[2])]),
  );
  if (
    settings.includes(null) ||
    values["per-job-seconds"] === undefined ||
    values["total-job-seconds"] === undefined
  ) {
    throw new TestSharesError(
      `FAIL: ${path} must set only per-job-seconds=<n> and total-job-seconds=<n>.`,
    );
  }
  return {
    perJobSeconds: values["per-job-seconds"],
    totalJobSeconds: values["total-job-seconds"],
  };
}
