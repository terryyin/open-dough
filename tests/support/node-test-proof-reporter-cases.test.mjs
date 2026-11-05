// Case identity and keep/clear rules for the node:test proof recorder.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  git,
  passedObservation,
  readLatest,
  runNodeDirect,
  runTestSh,
  scratchCheckout,
  seedObservations,
  writeTest,
} from "./node-test-proof-reporter-fixture.mjs";

test("a describe path records the suite name list", () => {
  const fixture = scratchCheckout();
  writeTest(
    fixture,
    "covered/describe.test.mjs",
    `import { describe, it } from "node:test";
describe("guidance", () => {
  it("rejects a missing path", () => {});
});
`,
  );
  git(fixture, ["add", "."]);
  git(fixture, ["commit", "-m", "add describe"]);

  const result = runTestSh(fixture, ["covered/describe.test.mjs"], {
    record: true,
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const latest = readLatest(fixture);
  assert.ok(latest);
  assert.equal(latest.version, 1);
  assert.equal(latest.observations.length, 1);
  assert.deepEqual(latest.observations[0].test, [
    "guidance",
    "rejects a missing path",
  ]);
  assert.equal(latest.observations[0].file, "covered/describe.test.mjs");
  assert.equal(latest.observations[0].attempts, 1);
  assert.equal(latest.observations[0].outcome, "passed");
  assert.equal(
    latest.observations[0].commit,
    git(fixture, ["rev-parse", "HEAD"]),
  );
  assert.equal(
    latest.observations[0].fileBlob,
    git(fixture, ["hash-object", "covered/describe.test.mjs"]),
  );
  assert.equal(typeof latest.observations[0].durationMs, "number");
});

test("parent with passing subtests records one observation; no subtest rows", () => {
  const fixture = scratchCheckout();
  writeTest(
    fixture,
    "covered/subtests-pass.test.mjs",
    `import { test } from "node:test";
test("parent", async (t) => {
  await t.test("child a", () => {});
  await t.test("child b", () => {});
});
`,
  );
  git(fixture, ["add", "."]);
  git(fixture, ["commit", "-m", "subtests pass"]);

  const result = runTestSh(fixture, ["covered/subtests-pass.test.mjs"], {
    record: true,
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const latest = readLatest(fixture);
  assert.equal(latest.observations.length, 1);
  assert.deepEqual(latest.observations[0].test, ["parent"]);
  assert.ok(latest.observations[0].durationMs >= 0);
});

test("parent with one failing subtest clears the parent observation", () => {
  const fixture = scratchCheckout();
  writeTest(
    fixture,
    "covered/subtests-fail.test.mjs",
    `import assert from "node:assert/strict";
import { test } from "node:test";
test("parent", async (t) => {
  await t.test("child ok", () => {});
  await t.test("child fail", () => {
    assert.equal(1, 2);
  });
});
`,
  );
  git(fixture, ["add", "."]);
  git(fixture, ["commit", "-m", "subtests fail"]);
  const commit = git(fixture, ["rev-parse", "HEAD"]);
  const blob = git(fixture, ["hash-object", "covered/subtests-fail.test.mjs"]);
  seedObservations(fixture, [
    passedObservation(
      "covered/subtests-fail.test.mjs",
      ["parent"],
      commit,
      blob,
    ),
  ]);

  const result = runTestSh(fixture, ["covered/subtests-fail.test.mjs"], {
    record: true,
  });
  assert.notEqual(result.status, 0);
  assert.equal(readLatest(fixture), undefined);
});

test("skip and todo keep earlier proof", () => {
  const fixture = scratchCheckout();
  writeTest(
    fixture,
    "covered/skip-todo.test.mjs",
    `import { test } from "node:test";
test("kept skip", { skip: true }, () => {});
test("kept todo", { todo: true }, () => {});
test("kept failing todo", { todo: true }, () => {
  throw new Error("todo failure");
});
`,
  );
  git(fixture, ["add", "."]);
  git(fixture, ["commit", "-m", "skip todo"]);
  const commit = git(fixture, ["rev-parse", "HEAD"]);
  const blob = git(fixture, ["hash-object", "covered/skip-todo.test.mjs"]);
  const proofFile = `${fixture}/tests/proof/latest.json`;
  seedObservations(
    fixture,
    ["kept skip", "kept todo", "kept failing todo"].map((name) =>
      passedObservation("covered/skip-todo.test.mjs", [name], commit, blob),
    ),
  );
  const before = readFileSync(proofFile, "utf8");

  // A failing todo exits 0 but the failures reporter prints it; drive Node
  // directly so this case judges proof keep, not the quiet-pass rule.
  const result = runNodeDirect(fixture, ["covered/skip-todo.test.mjs"], {
    record: true,
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(readFileSync(proofFile, "utf8"), before);
});

test("name-pattern exclusion keeps proof for the unexecuted case", () => {
  const fixture = scratchCheckout();
  writeTest(
    fixture,
    "covered/pattern.test.mjs",
    `import { test } from "node:test";
test("selected", () => {});
test("excluded", () => {});
`,
  );
  git(fixture, ["add", "."]);
  git(fixture, ["commit", "-m", "pattern"]);
  const commit = git(fixture, ["rev-parse", "HEAD"]);
  const blob = git(fixture, ["hash-object", "covered/pattern.test.mjs"]);
  seedObservations(fixture, [
    passedObservation("covered/pattern.test.mjs", ["excluded"], commit, blob),
  ]);

  const result = runNodeDirect(fixture, ["covered/pattern.test.mjs"], {
    record: true,
    extraArgs: ["--test-name-pattern", "^selected$"],
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const latest = readLatest(fixture);
  assert.deepEqual(
    latest.observations.map((row) => row.test),
    [["excluded"], ["selected"]],
  );
});

test("timeout and assertion failure clear only themselves", () => {
  const fixture = scratchCheckout();
  writeTest(
    fixture,
    "covered/clear-self.test.mjs",
    `import assert from "node:assert/strict";
import { test } from "node:test";
test("stays", () => {});
test("times out", { timeout: 50 }, async () => {
  await new Promise((resolve) => setTimeout(resolve, 200));
});
test("asserts", () => {
  assert.equal(1, 2);
});
`,
  );
  git(fixture, ["add", "."]);
  git(fixture, ["commit", "-m", "clear self"]);
  const commit = git(fixture, ["rev-parse", "HEAD"]);
  const blob = git(fixture, ["hash-object", "covered/clear-self.test.mjs"]);
  seedObservations(
    fixture,
    ["stays", "times out", "asserts"].map((name) =>
      passedObservation("covered/clear-self.test.mjs", [name], commit, blob),
    ),
  );

  const result = runTestSh(fixture, ["covered/clear-self.test.mjs"], {
    record: true,
  });
  assert.notEqual(result.status, 0);
  const latest = readLatest(fixture);
  assert.deepEqual(
    latest.observations.map((row) => row.test),
    [["stays"]],
  );
});
