import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { summarize } from "./ci-proof-collect.mjs";
import { fragmentProblems, summaryProblems } from "./ci-proof-contract.mjs";
import {
  fragment,
  fragmentsRead as read,
  playwrightRecord,
  revision,
  run,
} from "./ci-proof-test-fixtures.mjs";

const script = fileURLToPath(
  new URL("./ci-proof-summary.mjs", import.meta.url),
);

function temporary(t) {
  const directory = mkdtempSync(join(tmpdir(), "ci-proof-duration-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

const cli = (...args) =>
  spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });

test("a summary sums present parts' durationMs onto each entry, and a part without one carries none", () => {
  const { summary } = summarize({
    fragments: read(
      fragment("dashboard/tests", 1, 2, { passed: 12 }, { durationMs: 240000 }),
      fragment(
        "dashboard/tests",
        2,
        2,
        { passed: 7, failed: 1 },
        { durationMs: 180000 },
      ),
      fragment("tests", 1, 2, { passed: 5 }, { durationMs: 90000 }),
      fragment("tests", 2, 2, { passed: 3 }),
    ),
    expect: [
      { entry: "dashboard/tests", parts: 2 },
      { entry: "tests", parts: 2 },
    ],
    run,
  });
  assert.deepEqual(summaryProblems(summary), []);
  const [[dashboard], [tests]] = summary.entries.map((entry) => entry.evidence);
  assert.equal(dashboard.durationMs, 420000);
  assert.deepEqual(
    dashboard.parts.map((part) => part.durationMs),
    [240000, 180000],
  );
  assert.equal(tests.durationMs, 90000);
  assert.equal(tests.parts[0].durationMs, 90000);
  assert.equal("durationMs" in tests.parts[1], false);
});

test("durationMs on a fragment, present part or entry must be a non-negative number when present", () => {
  assert.deepEqual(
    fragmentProblems(fragment("tests", 1, 1, {}, { durationMs: -1 })),
    ["durationMs is not a non-negative number"],
  );
  assert.deepEqual(
    fragmentProblems(fragment("tests", 1, 1, {}, { durationMs: "1" })),
    ["durationMs is not a non-negative number"],
  );
  assert.deepEqual(
    fragmentProblems(fragment("tests", 1, 1, {}, { durationMs: 0 })),
    [],
  );
  const { summary } = summarize({
    fragments: read(fragment("tests", 1, 1, { passed: 1 }, { durationMs: 10 })),
    expect: [{ entry: "tests", parts: 1 }],
    run,
  });
  assert.deepEqual(summaryProblems(summary), []);
  const [
    {
      path,
      evidence: [evidence],
    },
  ] = summary.entries;
  assert.deepEqual(
    summaryProblems({
      ...summary,
      entries: [
        {
          path,
          evidence: [
            {
              ...evidence,
              durationMs: Number.NaN,
              parts: [{ ...evidence.parts[0], durationMs: -0.5 }],
            },
          ],
        },
      ],
    }),
    [
      "entries[0].evidence[0].durationMs is not a non-negative number",
      "entries[0].evidence[0].parts[0].durationMs is not a non-negative number",
    ],
  );
});

test("the command line writes durationMs from --times with --outcomes, and from Playwright attempt durations", (t) => {
  const directory = temporary(t);
  const outcomes = join(directory, "outcomes.txt");
  const times = join(directory, "times.txt");
  const record = join(directory, "proof.json");
  const out = join(directory, "fragments");
  writeFileSync(outcomes, "passed\ttests/a.sh\nfailed\ttests/b.sh\n");
  writeFileSync(times, "0.4\ttests/a.sh\n1.1\ttests/b.sh\n");
  writeFileSync(
    record,
    JSON.stringify(
      playwrightRecord(["expected", "unexpected"], "completed", [50, [20, 30]]),
    ),
  );
  const identity = [
    "--part",
    "1",
    "--of",
    "1",
    "--attempt",
    "2",
    "--revision",
    revision,
    "--out",
    out,
  ];
  const checks = cli(
    "fragment",
    "--outcomes",
    outcomes,
    "--times",
    times,
    "--entry",
    "tests",
    ...identity,
  );
  assert.deepEqual([checks.status, checks.stderr], [0, ""]);
  assert.equal(
    JSON.parse(readFileSync(join(out, "tests-legacy-1.json"), "utf8"))
      .durationMs,
    1500,
  );
  const dashboard = cli(
    "fragment",
    "--playwright-record",
    record,
    "--entry",
    "dashboard/tests",
    "--part",
    "1",
    "--of",
    "1",
    "--attempt",
    "2",
    "--revision",
    revision,
    "--out",
    out,
  );
  assert.deepEqual([dashboard.status, dashboard.stderr], [0, ""]);
  assert.equal(
    JSON.parse(readFileSync(join(out, "dashboard-tests-case-1.json"), "utf8"))
      .durationMs,
    100,
  );
  const refused = cli(
    "fragment",
    "--playwright-record",
    record,
    "--times",
    times,
    "--entry",
    "dashboard/tests",
    ...identity,
  );
  assert.deepEqual(
    [refused.status, refused.stderr],
    [1, "ci-proof-summary: --times applies only with --outcomes\n"],
  );
});
