// A job's test report as CI proof fragments, one per proof entry it ran (an
// entry is a configured Intent location path). Node built-ins only, like the
// rest of the collector (ci-proof-summary.mjs).
import { fragment, zeroCounts } from "./ci-proof-contract.mjs";

// One Playwright test passes when every execution was expected, fails when
// any was unexpected or flaky, and is otherwise other (skipped or unfinished).
function playwrightTestOutcome(executions) {
  const outcomes = executions.map((execution) => execution.outcome);
  if (
    outcomes.some((outcome) => outcome === "unexpected" || outcome === "flaky")
  ) {
    return "failed";
  }
  if (
    outcomes.length > 0 &&
    outcomes.every((outcome) => outcome === "expected")
  ) {
    return "passed";
  }
  return "other";
}

// Sum of every finished attempt's durationMs across the record's tests
// (retries included). Absent when no attempt recorded a duration.
function playwrightDurationMs(tests) {
  let durationMs;
  for (const test of tests) {
    for (const attempt of test.attempts ?? []) {
      if (typeof attempt.durationMs !== "number") continue;
      durationMs = (durationMs ?? 0) + attempt.durationMs;
    }
  }
  return durationMs;
}

// A dashboard proof record (OPEN_DOUGH_DASHBOARD_PROOF_RECORD) as the fragment
// of its one entry; counted unit: tests. A record that did not complete a run
// gives no fragment, so its part stays missing. Optional durationMs is the sum
// of every finished attempt's durationMs when any attempt recorded one.
export function fragmentFromPlaywrightRecord(record, identity) {
  if (record?.schemaVersion !== 1) {
    throw new Error("the Playwright proof record is not schemaVersion 1");
  }
  if (record.phase !== "completed" || !Array.isArray(record.tests)) {
    throw new Error(
      `the Playwright proof record did not complete a run (phase ${record.phase})`,
    );
  }
  if (identity.entries.length !== 1) {
    throw new Error("a Playwright proof record proves exactly one --entry");
  }
  const counts = zeroCounts();
  for (const test of record.tests) {
    counts[playwrightTestOutcome(test.executions ?? [])] += 1;
  }
  const durationMs = playwrightDurationMs(record.tests);
  return [
    fragment(
      identity,
      identity.entries[0],
      "tests",
      counts,
      durationMs === undefined ? {} : { durationMs },
    ),
  ];
}

function owningEntry(entries, check) {
  const owners = entries.filter(
    (entry) => check === entry || check.startsWith(`${entry}/`),
  );
  return owners.sort((left, right) => right.length - left.length)[0];
}

// Walks TEXT's non-empty `<left><TAB><check>` lines. KIND and LEFT name the
// format in parse errors (for example "outcomes" / "<status>").
function forEachTabLine(text, kind, left, visit) {
  for (const [index, line] of text.split("\n").entries()) {
    if (line === "") continue;
    const tab = line.indexOf("\t");
    if (tab <= 0 || tab === line.length - 1) {
      throw new Error(`${kind} line ${index + 1} is not ${left}<TAB><check>`);
    }
    visit(line.slice(0, tab), line.slice(tab + 1), index + 1);
  }
}

// Per-entry summed milliseconds from a times file, one
// `<seconds><TAB><check path>` line per check. Only entries that own at least
// one times line appear; a check in no entry contributes to none.
function durationsFromTimes(text, entries) {
  const durations = new Map();
  forEachTabLine(text, "times", "<seconds>", (secondsText, check, line) => {
    const seconds = Number(secondsText);
    if (!Number.isFinite(seconds) || seconds < 0) {
      throw new Error(
        `times line ${line} is not a non-negative number of seconds`,
      );
    }
    const entry = owningEntry(entries, check);
    if (entry === undefined) return;
    durations.set(entry, (durations.get(entry) ?? 0) + seconds * 1000);
  });
  return durations;
}

// An outcomes file, one `<status><TAB><check path>` line per check, as one
// fragment per entry; counted unit: checks. Each check counts toward the entry
// whose path contains it: status `passed` and `failed` as such, any other as
// other. A check in no entry proves no entry, so it counts toward none.
// Optional TIMES text, same labels as outcomes, sets each matching entry's
// durationMs to the sum of its checks' seconds as milliseconds.
export function fragmentsFromOutcomes(text, identity, timesText) {
  const counts = new Map(
    identity.entries.map((entry) => [entry, zeroCounts()]),
  );
  forEachTabLine(text, "outcomes", "<status>", (status, check) => {
    const entry = owningEntry(identity.entries, check);
    if (entry === undefined) return;
    const field = status === "passed" || status === "failed" ? status : "other";
    counts.get(entry)[field] += 1;
  });
  const durations =
    timesText === undefined
      ? null
      : durationsFromTimes(timesText, identity.entries);
  return identity.entries.map((entry) => {
    const extras =
      durations !== null && durations.has(entry)
        ? { durationMs: durations.get(entry) }
        : {};
    return fragment(identity, entry, "checks", counts.get(entry), extras);
  });
}
