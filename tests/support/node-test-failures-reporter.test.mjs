// Proof for the failures-only `node --test` reporter: substitute test files run
// in a child `node --test` through it.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

const reporter = fileURLToPath(
  new URL("./node-test-failures-reporter.mjs", import.meta.url),
);
const scratch = realpathSync(
  mkdtempSync(join(tmpdir(), "node-test-failures-reporter-")),
);
after(() => rmSync(scratch, { recursive: true, force: true }));

// The child must run as its own top-level test run, not as a file of this one.
const childEnv = { ...process.env };
delete childEnv.NODE_TEST_CONTEXT;

function runSubstitute(name, source) {
  const file = join(scratch, name);
  writeFileSync(file, source);
  const result = spawnSync(
    process.execPath,
    ["--test", `--test-reporter=${reporter}`, file],
    { cwd: scratch, encoding: "utf8", env: childEnv },
  );
  return { file, ...result };
}

test("a silent passing substitute prints nothing and exits 0", () => {
  const result = runSubstitute(
    "silent.test.mjs",
    `import { test } from "node:test";
test("passes", () => {});
`,
  );

  assert.equal(result.status, 0);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
});

test("a passing substitute that prints shows its output, naming the file", () => {
  const result = runSubstitute(
    "printing.test.mjs",
    `import { test } from "node:test";
test("passes", () => { console.log("passing-test-output"); });
`,
  );

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /^output from passing printing\.test\.mjs:$/m);
  assert.match(result.stdout, /^ {2}passing-test-output$/m);
  assert.doesNotMatch(result.stdout, /not ok/);
});

test("a failing substitute shows its name, error, location, and captured output", () => {
  const result = runSubstitute(
    "failing.test.mjs",
    `import assert from "node:assert/strict";
import { describe, test } from "node:test";
test("passes beside it", () => {});
describe("substitute suite", () => {
  test("fails on purpose", () => {
    console.log("captured-stdout-line");
    console.error("captured-stderr-line");
    assert.equal("actual-value", "expected-value");
  });
});
`,
  );

  assert.equal(result.status, 1);
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /^not ok: substitute suite > fails on purpose$/m);
  assert.ok(result.stdout.includes(`at ${result.file}:5:3`), result.stdout);
  assert.match(result.stdout, /AssertionError/);
  assert.match(result.stdout, /actual-value/);
  assert.match(result.stdout, /expected-value/);
  assert.match(result.stdout, /captured-stdout-line/);
  assert.match(result.stdout, /captured-stderr-line/);
  assert.doesNotMatch(result.stdout, /passes beside it|^# (tests|pass) /m);
});

test("a substitute file that exits non-zero after passing tests is reported", () => {
  const result = runSubstitute(
    "exiting.test.mjs",
    `import { test } from "node:test";
test("passes", () => {});
setTimeout(() => process.exit(3), 20);
`,
  );

  assert.equal(result.status, 1);
  assert.ok(result.stdout.includes(`not ok: ${result.file}`), result.stdout);
  assert.match(result.stdout, /exit code 3/);
});
