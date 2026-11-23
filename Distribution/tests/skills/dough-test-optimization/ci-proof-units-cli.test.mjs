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
import { readCommandProof } from "../../../src/skills/dough-execute-plan/scripts/ci-command-attempt.mjs";
import { summaryProblems } from "../../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import {
  cli,
  fragmentTests,
  summarizeTests,
  temporary,
} from "./ci-proof-cli-fixtures.mjs";
import {
  attemptId,
  locatedRecord,
  revision,
} from "./ci-proof-test-fixtures.mjs";

test("the command line counts case and file outcomes separately and reports a missing part in its declared unit", (t) => {
  const directory = temporary(t);
  const cases = join(directory, "cases.txt");
  const files = join(directory, "files.txt");
  const fragments = join(directory, "fragments");
  writeFileSync(cases, "passed\ttests/a.test.mjs\n".repeat(5));
  writeFileSync(files, "failed\ttests/b.test.mjs\n");
  const attempt = ["--attempt", "2"];
  for (const [source, out] of [
    [["--outcomes", cases, "--unit", "case"], "cases"],
    [["--outcomes", files, "--unit", "file"], "files"],
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

for (const [label, options, diagnosis] of [
  ["omitted", [], /--unit is required with --outcomes/],
  ["invalid", ["--unit", "files"], /--unit names unit files/],
]) {
  test(`fragment refuses ${label} outcomes unit before writing`, (t) => {
    const directory = temporary(t);
    const outcomes = join(directory, "outcomes.txt");
    const out = join(directory, "fragments");
    writeFileSync(outcomes, "passed\ttests/a.sh\n");
    const result = fragmentTests(
      ["--outcomes", outcomes, ...options],
      ["--attempt", "1"],
      out,
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, diagnosis);
    assert.equal(existsSync(out), false);
  });
}

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

test("summarize refuses an omitted expectation unit before writing", (t) => {
  const directory = temporary(t);
  const out = join(directory, "summary.json");
  const result = summarizeTests(
    directory,
    ["--run-id", "7", "--attempt", "2"],
    out,
    "tests=1",
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /--expect tests=1 is not <entry>=<parts>:<unit>/);
  assert.equal(existsSync(out), false);
});
