// scripts/share-deal.mjs deals a test suite's jobs into CI shares by their
// recorded durations: it reads the duration list, deals the jobs, selects
// one share as `<i>/<n>` (`OPEN_DOUGH_TEST_SPLIT`, a
// browser test group's `<prefix>_SPLIT`, the `share` command's `--split`),
// and writes the times form a refresh merges. Preview input and text live
// in scripts/share-preview.mjs.
// scripts/test-shares.mjs is its command surface, run by scripts/test-jobs.sh
// for the Node runner's share and by a contributor for the preview and the
// refresh; dashboard/tests/support/testFiles.mjs deals each browser test
// group's spec files through it.
//
// A duration list (`Distribution/tests/longest-first` for the Node suite) holds one
// `<seconds><TAB><label>` line per recorded job, the form the runner's
// `test-times` artifact prints. duration-list.mjs reads plain lists or indexes
// with named TSV parts; malformed rows fail before any job runs.
//
// The deal itself is stated in Distribution/tests/test-shares.md ("The deal").

import {
  bytewise,
  collectLongestSeconds,
  formatListText,
  newDurationListHeader,
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

// Labels NUL-separated, or one per line when the text holds no NUL; empty
// entries are dropped.
export function parseLabels(text) {
  const separator = text.includes("\0") ? "\0" : /\r?\n/;
  return text.split(separator).filter((label) => label !== "");
}

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

// Formats a runner factor for a list's source note: at least one decimal, up
// to three.
export function formatFactor(value) {
  const rounded = Math.round(value * 1000) / 1000;
  if (Number.isInteger(rounded)) {
    return rounded.toFixed(1);
  }
  return String(rounded);
}

// A share's runner factor: the median, over jobs recorded with measurable
// time, of observed/recorded seconds. With no such job, the factor is 1 and
// available is false (the source note says unavailable).
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

// Refresh text at the existing list's speed so a refresh keeps the list's
// recorded speed; a new list or no measurable common job stays observed.
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
