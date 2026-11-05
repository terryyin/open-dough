// Concurrent refresh, interruption, and coverage scope for the recorder.
import assert from "node:assert/strict";
import { existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import {
  git,
  readLatest,
  runNodeDirect,
  runTestSh,
  scratchCheckout,
  spawnNodeDirect,
  writeTest,
} from "./node-test-proof-reporter-fixture.mjs";

test("killed run keeps completed proof updates", async () => {
  const fixture = scratchCheckout();
  writeTest(
    fixture,
    "covered/interrupted.test.mjs",
    `import { test } from "node:test";
test("first finishes", () => {});
test("second sleeps", async () => {
  await new Promise(() => {});
});
`,
  );
  git(fixture, ["add", "."]);
  git(fixture, ["commit", "-m", "interrupted"]);

  const child = spawnNodeDirect(fixture, "covered/interrupted.test.mjs", {
    record: true,
  });

  const deadline = Date.now() + 5_000;
  let latest;
  while (Date.now() < deadline) {
    latest = readLatest(fixture);
    if (latest?.observations?.some((row) => row.test[0] === "first finishes")) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  assert.ok(
    latest?.observations?.some((row) => row.test[0] === "first finishes"),
    "first case should record before kill",
  );
  child.kill("SIGKILL");
  await new Promise((resolve) => child.once("exit", resolve));

  const after = readLatest(fixture);
  assert.ok(
    after?.observations?.some((row) => row.test[0] === "first finishes"),
  );
  assert.equal(
    after.observations.some((row) => row.test[0] === "second sleeps"),
    false,
  );
});

test("four files at once land every pass in one latest.json with no json lock", () => {
  const fixture = scratchCheckout();
  for (const letter of ["a", "b", "c", "d"]) {
    writeTest(
      fixture,
      `covered/${letter}.test.mjs`,
      `import { test } from "node:test";
test("case ${letter}", () => {});
`,
    );
  }
  git(fixture, ["add", "."]);
  git(fixture, ["commit", "-m", "four files"]);

  const result = runTestSh(
    fixture,
    [
      "covered/a.test.mjs",
      "covered/b.test.mjs",
      "covered/c.test.mjs",
      "covered/d.test.mjs",
    ],
    { record: true, jobs: 4 },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const latest = readLatest(fixture);
  assert.deepEqual(
    latest.observations.map((row) => [row.file, row.test]),
    [
      ["covered/a.test.mjs", ["case a"]],
      ["covered/b.test.mjs", ["case b"]],
      ["covered/c.test.mjs", ["case c"]],
      ["covered/d.test.mjs", ["case d"]],
    ],
  );
  const proofDir = path.join(fixture, "tests/proof");
  assert.deepEqual(readdirSync(proofDir), ["latest.json"]);
  assert.equal(existsSync(`${proofDir}.lock`), false);
  assert.equal(existsSync(path.join(proofDir, "latest.json.lock")), false);
});

test("outside Git the recorder is a no-op", () => {
  const fixture = scratchCheckout();
  writeTest(
    fixture,
    "covered/nongit.test.mjs",
    `import { test } from "node:test";
test("passes", () => {});
`,
  );
  rmSync(path.join(fixture, ".git"), { recursive: true, force: true });

  const result = runNodeDirect(fixture, ["covered/nongit.test.mjs"], {
    record: true,
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(readLatest(fixture), undefined);
  assert.equal(existsSync(path.join(fixture, "tests/proof")), false);
});

test("a file outside the covered location is not recorded", () => {
  const fixture = scratchCheckout();
  writeTest(
    fixture,
    "covered/inside.test.mjs",
    `import { test } from "node:test";
test("inside", () => {});
`,
  );
  writeTest(
    fixture,
    "other/outside.test.mjs",
    `import { test } from "node:test";
test("outside", () => {});
`,
  );
  git(fixture, ["add", "."]);
  git(fixture, ["commit", "-m", "outside"]);

  const result = runTestSh(
    fixture,
    ["covered/inside.test.mjs", "other/outside.test.mjs"],
    { record: true, jobs: 2 },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const latest = readLatest(fixture);
  assert.deepEqual(
    latest.observations.map((row) => row.file),
    ["covered/inside.test.mjs"],
  );
});
