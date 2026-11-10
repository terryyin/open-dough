// The collector's command line (ci-proof-summary.mjs) with declared units:
// `fragment --unit` counts an outcomes report in that unit, and `summarize`
// with `--expect <entry>=<parts>:<unit>` collects each declared unit of a
// location apart, a declared unit no fragment reached missing in that unit,
// the same for a CI adapter's attempt as for a GitHub Actions run; its usage
// names both. Collector rules: ci-proof-units.test.mjs.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { readCommandProof } from "../../dough-execute-plan/scripts/ci-command-adapter.mjs";
import { summaryProblems } from "./ci-proof-summary.mjs";
import { cli, fragmentTests, temporary } from "./ci-proof-cli-fixtures.mjs";
import {
  attemptId,
  locatedRecord,
  playwrightRecord,
  revision,
} from "./ci-proof-test-fixtures.mjs";

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

test("a CI adapter's attempt collects one path's test cases and test files apart in its own job, and its adapter answers that summary unchanged", async (t) => {
  const directory = temporary(t);
  const record = join(directory, "proof.json");
  const outcomes = join(directory, "outcomes.txt");
  const fragments = join(directory, "fragments");
  const cwd = "/ci/checkout";
  // Five Playwright cases of one path, that path's own file outcome, and a
  // failed file job that reported no cases.
  writeFileSync(
    record,
    JSON.stringify(
      locatedRecord(
        cwd,
        [10, 20, 30, 40, 50].map((ms) => [
          `${cwd}/tests/check.test.mjs`,
          "expected",
          [ms],
        ]),
      ),
    ),
  );
  writeFileSync(
    outcomes,
    "passed\ttests/check.test.mjs\nfailed\ttests/broken.test.mjs\n",
  );
  const attempt = ["--attempt-id", attemptId];
  for (const source of [
    ["--playwright-record", record],
    ["--outcomes", outcomes, "--unit", "file"],
  ]) {
    const result = fragmentTests([...source, "--by-file"], attempt, fragments);
    assert.deepEqual(
      [result.status, result.stdout, result.stderr],
      [0, "", ""],
    );
  }
  const summary = cli(
    "summarize",
    "--fragments",
    fragments,
    "--expect",
    "tests=1:case",
    "--expect",
    "tests=1:file",
    "--repository",
    "O/P",
    ...attempt,
    "--revision",
    revision,
    "--out",
    join(directory, "summary.json"),
  );
  assert.deepEqual(
    [summary.status, summary.stdout, summary.stderr],
    [
      0,
      "tests: 5 passed, 0 failed, 0 other test cases\ntests: 1 passed, 1 failed, 0 other test files\n",
      "",
    ],
  );
  // The attempt's adapter answers `proof` with the summary its job kept.
  writeFileSync(
    join(directory, "adapter.mjs"),
    `import { readFileSync } from "node:fs";
for await (const chunk of process.stdin) void chunk;
process.stdout.write(\`{"summary":\${readFileSync("summary.json", "utf8")}}\`);
`,
  );
  const answer = await readCommandProof(
    [process.execPath, "adapter.mjs"],
    { repo: "O/P", branch: "main" },
    { runId: "pipeline", attemptId, sha: revision },
    { signal: new AbortController().signal, cwd: directory },
  );
  const kept = JSON.parse(
    readFileSync(join(directory, "summary.json"), "utf8"),
  );
  assert.deepEqual(answer, { summary: kept });
  assert.deepEqual(summaryProblems(kept), []);
  assert.deepEqual(
    [kept.schemaVersion, kept.repository, kept.attemptId, kept.revision],
    [2, "O/P", attemptId, revision],
  );
  assert.deepEqual(
    kept.entries[0].evidence.map(({ unit, durationMs, untimed, files }) => [
      unit,
      durationMs,
      untimed,
      files.map((file) => [file.path, file.passed, file.failed]),
    ]),
    [
      ["case", 150, 0, [["tests/check.test.mjs", 5, 0]]],
      [
        "file",
        undefined,
        2,
        [
          ["tests/broken.test.mjs", 0, 1],
          ["tests/check.test.mjs", 1, 0],
        ],
      ],
    ],
  );
});

test("the command line's usage names the unit of each report and declaration", () => {
  const result = cli();
  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /^ci-proof-summary: usage: ci-proof-summary\.mjs fragment\n/,
  );
  // What the usage names, wherever its lines wrap.
  const usage = result.stderr.replace(/\s+/g, " ");
  for (const named of [
    "--outcomes <report> --unit case|file",
    "--expect <entry>=<parts>:case|file",
    "A Playwright record's tests are test cases.",
    "Outcomes without --unit are legacy test results",
  ]) {
    assert.ok(usage.includes(named), named);
  }
});
