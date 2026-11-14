import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { summaryProblems } from "./ci-proof-summary.mjs";
import {
  cli,
  fragmentTests,
  summarizeTests,
  temporary,
} from "./ci-proof-cli-fixtures.mjs";
import {
  attemptId,
  playwrightRecord,
  revision,
} from "./ci-proof-test-fixtures.mjs";

test("the command line writes fragments per entry and one summary from them", (t) => {
  const directory = temporary(t);
  const record = join(directory, "proof.json");
  const outcomes = join(directory, "outcomes.txt");
  const fragments = join(directory, "fragments");
  writeFileSync(
    record,
    JSON.stringify(playwrightRecord(["expected", "unexpected"])),
  );
  writeFileSync(
    outcomes,
    "passed\ttests/a.sh\npassed\tsrc/skills/x/scripts/b.test.mjs\npassed\tscripts/c.sh\n",
  );
  const identity = (of) => [
    "--part",
    "1",
    "--of",
    of,
    "--attempt",
    "2",
    "--revision",
    revision,
  ];
  const shard = join(fragments, "ci-proof-fragments-dashboard-1-attempt-2");
  const share = join(fragments, "ci-proof-fragments-test-1-attempt-2");
  mkdirSync(shard, { recursive: true });
  for (const result of [
    cli(
      "fragment",
      "--playwright-record",
      record,
      "--entry",
      "dashboard/tests",
      ...identity("2"),
      "--out",
      shard,
    ),
    cli(
      "fragment",
      "--outcomes",
      outcomes,
      "--entry",
      "tests",
      "--entry",
      "src/skills",
      ...identity("1"),
      "--out",
      share,
    ),
  ]) {
    assert.deepEqual(
      [result.status, result.stdout, result.stderr],
      [0, "", ""],
    );
  }
  const out = join(directory, "summary.json");
  const summary = cli(
    "summarize",
    "--fragments",
    fragments,
    "--expect",
    "dashboard/tests=2",
    "--expect",
    "tests=1",
    "--expect",
    "src/skills=1",
    "--repository",
    "owner/repo",
    "--run-id",
    "7",
    "--attempt",
    "2",
    "--revision",
    revision,
    "--out",
    out,
  );
  assert.deepEqual([summary.status, summary.stderr], [0, ""]);
  assert.equal(
    summary.stdout,
    [
      "dashboard/tests: 1 passed, 1 failed, 0 other test cases; part 2 of 2 missing",
      "tests: 1 passed, 0 failed, 0 other legacy test results (checks)",
      "src/skills: 1 passed, 0 failed, 0 other legacy test results (checks)",
      "",
    ].join("\n"),
  );
  const written = JSON.parse(readFileSync(out, "utf8"));
  assert.deepEqual(summaryProblems(written), []);
  assert.deepEqual(
    written.entries.map(({ path, evidence: [only] }) => [
      path,
      only.unit,
      only.passed,
      only.failed,
    ]),
    [
      ["dashboard/tests", "case", 1, 1],
      ["tests", "legacy", 1, 0],
      ["src/skills", "legacy", 1, 0],
    ],
  );
});

test("the command line writes an adapter attempt's fragment and summary, excluding another attempt's fragments", (t) => {
  const directory = temporary(t);
  const outcomes = join(directory, "outcomes.txt");
  const fragments = join(directory, "fragments");
  writeFileSync(outcomes, "passed\ttests/a.sh\n");
  for (const [attempt, out] of [
    [["--attempt-id", attemptId], "this"],
    [["--attempt-id", "another"], "another"],
    [["--attempt", "1"], "github"],
  ]) {
    const result = fragmentTests(
      ["--outcomes", outcomes],
      attempt,
      join(fragments, out),
    );
    assert.deepEqual(
      [result.status, result.stdout, result.stderr],
      [0, "", ""],
    );
  }
  const out = join(directory, "summary.json");
  const summary = summarizeTests(fragments, ["--attempt-id", attemptId], out);
  assert.equal(summary.status, 0);
  assert.equal(
    summary.stdout,
    "tests: 1 passed, 0 failed, 0 other legacy test results (checks)\n",
  );
  assert.equal(
    summary.stderr,
    [
      `excluded ${join(fragments, "another", "tests-legacy-1.json")}: attemptId another, not attemptId ${attemptId}`,
      `excluded ${join(fragments, "github", "tests-legacy-1.json")}: attempt 1, not attemptId ${attemptId}`,
      "",
    ].join("\n"),
  );
  const written = JSON.parse(readFileSync(out, "utf8"));
  assert.deepEqual(summaryProblems(written), []);
  assert.deepEqual(
    [written.repository, written.attemptId, written.revision, written.runId],
    ["O/P", attemptId, revision, undefined],
  );
});

test("the command line refuses an incomplete record, a malformed declaration, an unknown unit or one a Playwright record already says, or naming both attempt identities or neither, without writing", (t) => {
  const directory = temporary(t);
  const outcomes = join(directory, "outcomes.txt");
  const record = join(directory, "proof.json");
  writeFileSync(outcomes, "passed\ttests/a.sh\n");
  writeFileSync(record, JSON.stringify(playwrightRecord([], "running")));
  const out = join(directory, "out");
  const fragment = (...attempt) =>
    fragmentTests(["--outcomes", outcomes], attempt, out);
  const summarize = (...attempt) => summarizeTests(directory, attempt, out);
  for (const [result, message] of [
    [
      fragmentTests(["--playwright-record", record], ["--attempt", "1"], out),
      "the Playwright proof record did not complete a run (phase running)",
    ],
    [
      summarizeTests(
        directory,
        ["--run-id", "7", "--attempt", "1"],
        out,
        "tests",
      ),
      "--expect tests is not <entry>=<parts>[:<unit>]",
    ],
    [
      summarizeTests(
        directory,
        ["--run-id", "7", "--attempt", "1"],
        out,
        "tests=1:cases",
      ),
      "--expect tests=1:cases names unit cases, not case or file",
    ],
    [
      fragmentTests(
        ["--outcomes", outcomes, "--unit", "files"],
        ["--attempt", "1"],
        out,
      ),
      "--unit names unit files, not case or file",
    ],
    [
      fragmentTests(
        ["--playwright-record", record, "--unit", "case"],
        ["--attempt", "1"],
        out,
      ),
      "--unit applies only with --outcomes",
    ],
    [
      fragment("--attempt", "1", "--attempt-id", attemptId),
      "fragment names both attempt and attemptId",
    ],
    [fragment(), "fragment names neither attempt nor attemptId"],
    [
      summarize("--run-id", "7", "--attempt", "1", "--attempt-id", attemptId),
      "summarize names both runId and attempt and attemptId",
    ],
    [summarize(), "summarize names neither runId and attempt nor attemptId"],
    [summarize("--attempt", "1"), "summarize runId is not a positive integer"],
  ]) {
    assert.deepEqual(
      [result.status, result.stderr],
      [1, `ci-proof-summary: ${message}\n`],
    );
  }
  assert.equal(existsSync(out), false);
});
