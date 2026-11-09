// CI proof summary: the collector's command line, importing only Node and its
// sibling ci-proof-*.mjs modules, that CI jobs run in two steps.
//
//   fragment  converts one job's test report into one fragment per proof
//             entry it ran (ci-proof-fragments.mjs). A Playwright record's
//             results are test cases; `--unit case` or `--unit file` says
//             what each `--outcomes` line's outcome is, and without it they
//             are legacy results, as before units were declared.
//   summarize collects the current attempt's fragments against the
//             declared entries, parts and units
//             (`--expect <entry>=<parts>[:<unit>]`) into the attempt's
//             summary (ci-proof-collect.mjs). A declaration with a unit is
//             filled only by that unit's fragments and keeps its missing
//             parts in that unit; one without takes the entry's other
//             fragments in whichever one unit they report.
//
// `fragment --by-file` also breaks each fragment down by test file
// (ci-proof-figures.mjs, "File breakdown"); without it, fragments carry
// entry totals only, as before.
//
// Both name the attempt: a GitHub Actions run attempt by `--attempt` (and
// `summarize` by `--run-id`), or a CI adapter's attempt by `--attempt-id`.
//
// Their options are read by ci-proof-options.mjs. The versioned schemas are
// in ci-proof-contract.mjs; this module re-exports the collector's whole API.
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describeSummary, summarize } from "./ci-proof-collect.mjs";
import {
  SUMMARY_READ_LIMIT_BYTES,
  entrySlug,
  fragmentProblems,
} from "./ci-proof-contract.mjs";
import {
  fragmentFromPlaywrightRecord,
  fragmentsFromOutcomes,
} from "./ci-proof-fragments.mjs";
import {
  attemptIdentity,
  declaredUnit,
  options,
  parseExpect,
  positive,
} from "./ci-proof-options.mjs";

export * from "./ci-proof-collect.mjs";
export * from "./ci-proof-contract.mjs";
export * from "./ci-proof-fragments.mjs";

function jsonFiles(directory) {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((item) => item.isFile() && item.name.endsWith(".json"))
    .map((item) => join(item.parentPath, item.name))
    .sort();
}

// Every JSON file under DIRECTORY, which may be absent when no job uploaded.
function readFragments(directory) {
  if (!existsSync(directory)) return [];
  return jsonFiles(directory).map((source) => {
    try {
      return { source, value: JSON.parse(readFileSync(source, "utf8")) };
    } catch {
      return { source, value: undefined };
    }
  });
}

function runFragment(argv) {
  const values = options(argv, {
    required: ["entry", "part", "of", "revision", "out"],
    optional: [
      "attempt",
      "attempt-id",
      "playwright-record",
      "outcomes",
      "times",
      "unit",
    ],
    multiple: ["entry"],
    flags: ["by-file"],
  });
  const byFile = { byFile: values["by-file"] === true };
  const identity = {
    entries: values.entry,
    part: positive("part", values.part),
    of: positive("of", values.of),
    ...attemptIdentity("fragment", values, { attempt: "attempt" }),
    revision: values.revision,
  };
  let fragments;
  if (values["playwright-record"] !== undefined) {
    for (const name of ["times", "unit"]) {
      if (values[name] !== undefined) {
        throw new Error(`--${name} applies only with --outcomes`);
      }
    }
    const record = JSON.parse(
      readFileSync(values["playwright-record"], "utf8"),
    );
    fragments = fragmentFromPlaywrightRecord(record, identity, byFile);
  } else if (values.outcomes !== undefined) {
    const text = readFileSync(values.outcomes, "utf8");
    const times =
      values.times === undefined
        ? undefined
        : readFileSync(values.times, "utf8");
    fragments = fragmentsFromOutcomes(text, identity, times, {
      ...byFile,
      ...(values.unit === undefined
        ? {}
        : { unit: declaredUnit("unit", values.unit) }),
    });
  } else {
    throw new Error("--playwright-record or --outcomes is required");
  }
  mkdirSync(values.out, { recursive: true });
  for (const value of fragments) {
    const problems = fragmentProblems(value);
    if (problems.length > 0) throw new Error(problems.join("; "));
    const file = join(
      values.out,
      `${entrySlug(value.entry)}-${value.unit}-${value.part}.json`,
    );
    writeFileSync(file, `${JSON.stringify(value)}\n`);
  }
}

function runSummarize(argv) {
  const values = options(argv, {
    required: ["fragments", "expect", "repository", "revision", "out"],
    optional: ["run-id", "attempt", "attempt-id"],
    multiple: ["expect"],
  });
  const { summary, notes } = summarize({
    fragments: readFragments(values.fragments),
    expect: values.expect.map(parseExpect),
    run: {
      repository: values.repository,
      ...attemptIdentity("summarize", values, {
        "run-id": "runId",
        attempt: "attempt",
      }),
      revision: values.revision,
    },
  });
  const text = `${JSON.stringify(summary)}\n`;
  writeFileSync(values.out, text);
  for (const note of notes) process.stderr.write(`${note}\n`);
  const bytes = Buffer.byteLength(text);
  if (bytes > SUMMARY_READ_LIMIT_BYTES) {
    process.stderr.write(
      `the summary is ${bytes} bytes, more than the ${SUMMARY_READ_LIMIT_BYTES} Intent may read as a CI proof summary; Intent will not show it\n`,
    );
  }
  for (const line of describeSummary(summary))
    process.stdout.write(`${line}\n`);
}

// As dough-execute-plan's isDirectCliEntry, repeated so the copied collector
// needs no installed skill: a symlinked spelling of argv still runs the CLI.
function isDirectEntry() {
  if (!process.argv[1]) return false;
  if (import.meta.url === pathToFileURL(process.argv[1]).href) return true;
  try {
    return (
      realpathSync(fileURLToPath(import.meta.url)) ===
      realpathSync(process.argv[1])
    );
  } catch {
    return false;
  }
}

if (isDirectEntry()) {
  const [command, ...argv] = process.argv.slice(2);
  try {
    if (command === "fragment") runFragment(argv);
    else if (command === "summarize") runSummarize(argv);
    else
      throw new Error(
        "usage: ci-proof-summary.mjs fragment|summarize [options]",
      );
  } catch (error) {
    process.stderr.write(`ci-proof-summary: ${error.message}\n`);
    process.exitCode = 1;
  }
}
