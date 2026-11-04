import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { summaryProblems } from "./ci-proof-summary.mjs";
import { playwrightRecord, revision } from "./ci-proof-test-fixtures.mjs";

const script = fileURLToPath(
  new URL("./ci-proof-summary.mjs", import.meta.url),
);

function temporary(t) {
  const directory = mkdtempSync(join(tmpdir(), "ci-proof-summary-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

const cli = (...args) =>
  spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });

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
    "passed\ttests/a.sh\npassed\tsrc/skills/x/scripts/b.test.mjs\n",
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
      "dashboard/tests: 1 passed, 1 failed, 0 other tests; part 2 of 2 missing",
      "tests: 1 passed, 0 failed, 0 other checks",
      "src/skills: 1 passed, 0 failed, 0 other checks",
      "",
    ].join("\n"),
  );
  const written = JSON.parse(readFileSync(out, "utf8"));
  assert.deepEqual(summaryProblems(written), []);
  assert.deepEqual(
    written.entries.map((entry) => [entry.path, entry.passed, entry.failed]),
    [
      ["dashboard/tests", 1, 1],
      ["tests", 1, 0],
      ["src/skills", 1, 0],
    ],
  );
});

test("the command line refuses an incomplete record or a malformed declaration without writing", (t) => {
  const directory = temporary(t);
  const record = join(directory, "proof.json");
  writeFileSync(record, JSON.stringify(playwrightRecord([], "running")));
  const refused = cli(
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
    "1",
    "--revision",
    revision,
    "--out",
    join(directory, "out"),
  );
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /did not complete a run/);
  const declaration = cli(
    "summarize",
    "--fragments",
    directory,
    "--expect",
    "tests",
    "--repository",
    "owner/repo",
    "--run-id",
    "7",
    "--attempt",
    "1",
    "--revision",
    revision,
    "--out",
    join(directory, "summary.json"),
  );
  assert.equal(declaration.status, 1);
  assert.match(declaration.stderr, /--expect tests is not <entry>=<parts>/);
});
