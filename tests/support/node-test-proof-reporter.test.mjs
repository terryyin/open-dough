// Option and quiet-pass contract for the node:test proof recorder through
// scripts/test.sh: recording off leaves proof untouched; on/off I/O matches.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import {
  git,
  maskTiming,
  readLatest,
  runTestSh,
  scratchCheckout,
  writeTest,
} from "./node-test-proof-reporter-fixture.mjs";

test("option off leaves no proof file", () => {
  const fixture = scratchCheckout();
  writeTest(
    fixture,
    "covered/silent.test.mjs",
    `import { test } from "node:test";
test("passes", () => {});
`,
  );
  git(fixture, ["add", "covered/silent.test.mjs"]);
  git(fixture, ["commit", "-m", "add test"]);

  const result = runTestSh(fixture, ["covered/silent.test.mjs"], {
    record: false,
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
  assert.equal(readLatest(fixture), undefined);
  assert.equal(existsSync(path.join(fixture, "tests/proof")), false);
});

test("stdout stderr and exit are identical with and without the option", () => {
  const fixture = scratchCheckout();
  writeTest(
    fixture,
    "covered/identical.test.mjs",
    `import { test } from "node:test";
test("passes", () => {});
`,
  );
  writeTest(
    fixture,
    "covered/identical-fail.test.mjs",
    `import assert from "node:assert/strict";
import { test } from "node:test";
test("fails", () => {
  assert.equal("actual", "expected");
});
`,
  );
  git(fixture, ["add", "."]);
  git(fixture, ["commit", "-m", "identical"]);

  for (const file of [
    "covered/identical.test.mjs",
    "covered/identical-fail.test.mjs",
  ]) {
    const off = runTestSh(fixture, [file], { record: false });
    const on = runTestSh(fixture, [file], { record: true });
    assert.equal(on.status, off.status, file);
    assert.equal(maskTiming(on.stdout), maskTiming(off.stdout), file);
    assert.equal(maskTiming(on.stderr), maskTiming(off.stderr), file);
  }
});

test("a normal run after recording leaves the snapshot unchanged", () => {
  const fixture = scratchCheckout();
  writeTest(
    fixture,
    "covered/unchanged.test.mjs",
    `import { test } from "node:test";
test("recorded", () => {});
`,
  );
  git(fixture, ["add", "."]);
  git(fixture, ["commit", "-m", "unchanged"]);

  assert.equal(
    runTestSh(fixture, ["covered/unchanged.test.mjs"], { record: true }).status,
    0,
  );
  const before = readFileSync(
    path.join(fixture, "tests/proof/latest.json"),
    "utf8",
  );
  assert.equal(
    runTestSh(fixture, ["covered/unchanged.test.mjs"], { record: false })
      .status,
    0,
  );
  assert.equal(
    readFileSync(path.join(fixture, "tests/proof/latest.json"), "utf8"),
    before,
  );
});
