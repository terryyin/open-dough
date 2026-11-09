// The collector's command line (ci-proof-summary.mjs) with declared units:
// `fragment --unit` counts an outcomes report in that unit, and `summarize`
// with `--expect <entry>=<parts>:<unit>` collects each declared unit of a
// location apart, a declared unit no fragment reached missing in that unit.
// Collector rules: ci-proof-units.test.mjs.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { summaryProblems } from "./ci-proof-summary.mjs";
import { cli, fragmentTests, temporary } from "./ci-proof-cli-fixtures.mjs";
import { playwrightRecord, revision } from "./ci-proof-test-fixtures.mjs";

test("the command line counts an outcomes report in its declared unit and collects each declared unit of a location apart, a declared unit without fragments missing in that unit", (t) => {
  const directory = temporary(t);
  const record = join(directory, "proof.json");
  const outcomes = join(directory, "outcomes.txt");
  const fragments = join(directory, "fragments");
  writeFileSync(
    record,
    JSON.stringify(playwrightRecord(Array(5).fill("expected"))),
  );
  // The same location's own file outcome: failed, without a case report.
  writeFileSync(outcomes, "failed\ttests/b.test.mjs\n");
  const attempt = ["--attempt", "2"];
  for (const [source, out] of [
    [["--playwright-record", record], "cases"],
    [["--outcomes", outcomes, "--unit", "file"], "files"],
  ]) {
    const result = fragmentTests(source, attempt, join(fragments, out));
    assert.deepEqual(
      [result.status, result.stdout, result.stderr],
      [0, "", ""],
    );
  }
  assert.deepEqual(
    [
      existsSync(join(fragments, "cases", "tests-case-1.json")),
      existsSync(join(fragments, "files", "tests-file-1.json")),
    ],
    [true, true],
  );
  const out = join(directory, "summary.json");
  const summary = cli(
    "summarize",
    "--fragments",
    fragments,
    "--expect",
    "tests=1:case",
    "--expect",
    "tests=1:file",
    "--expect",
    "src/skills=1:file",
    "--repository",
    "O/P",
    "--run-id",
    "7",
    ...attempt,
    "--revision",
    revision,
    "--out",
    out,
  );
  assert.deepEqual([summary.status, summary.stderr], [0, ""]);
  assert.equal(
    summary.stdout,
    [
      "tests: 5 passed, 0 failed, 0 other test cases",
      "tests: 0 passed, 1 failed, 0 other test files",
      "src/skills: 0 passed, 0 failed, 0 other test files; part 1 of 1 missing",
      "",
    ].join("\n"),
  );
  const written = JSON.parse(readFileSync(out, "utf8"));
  assert.deepEqual(summaryProblems(written), []);
  assert.deepEqual(
    written.entries.map(({ path, evidence }) => [
      path,
      evidence.map(({ unit, passed, failed, parts }) => [
        unit,
        passed,
        failed,
        parts.map((part) => part.status),
      ]),
    ]),
    [
      [
        "tests",
        [
          ["case", 5, 0, ["present"]],
          ["file", 0, 1, ["present"]],
        ],
      ],
      ["src/skills", [["file", 0, 0, ["missing"]]]],
    ],
  );
});
