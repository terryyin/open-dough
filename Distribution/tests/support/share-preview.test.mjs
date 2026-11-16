// The preview command as a contributor runs it for a browser test group’s
// spec files.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";
import { durationListText } from "./job-duration-list.mjs";
import { makeMe } from "./makeMe.mjs";

const allocator = fileURLToPath(
  new URL("../../../scripts/test-shares.mjs", import.meta.url),
);
const scratch = mkdtempSync(join(tmpdir(), "share-preview-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

const listText = (seconds) => durationListText(seconds, "# list");
const run = (args) =>
  spawnSync(process.execPath, [allocator, ...args], { encoding: "utf8" });

test("a list the preview cannot read fails naming it, without a stack trace", () => {
  const emptyDir = join(scratch, "no-list");
  mkdirSync(emptyDir);
  const result = run(["preview", "--split-count", "2", "--spec-dir", emptyDir]);
  assert.equal(result.status, 1, result.stderr);
  assert.equal(
    result.stderr,
    `FAIL: ${emptyDir}/longest-first cannot be read (ENOENT).\n`,
  );
  assert.equal(result.stdout, "");
});

test("preview without a spec directory fails naming its usage", () => {
  const result = run(["preview", "--split-count", "2", "--root", "tests"]);
  assert.deepEqual(
    [result.status, result.stderr],
    [
      1,
      "FAIL: preview needs --split-count <n> and --spec-dir <dir>; it takes no positional argument.\n",
    ],
  );
});

test("preview lists a browser group's root of its spec directory as its configuration discovers it", () => {
  const specs = join(scratch, "specs");
  for (const name of [
    "tests/a.spec.ts",
    "frontend-tests/dom.spec.ts",
    "backend-tests/b.spec.ts",
    "tests/c.spec.ts",
    "Distribution/tests/support/helper.ts",
    "src/ignored.spec.ts",
  ]) {
    mkdirSync(join(specs, name, ".."), { recursive: true });
    writeFileSync(join(specs, name), "");
  }
  writeFileSync(
    join(specs, "longest-first"),
    listText(
      makeMe.jobDurations
        .with([
          ["backend-tests/b.spec.ts", 4],
          ["frontend-tests/dom.spec.ts", 3],
          ["tests/a.spec.ts", 2],
        ])
        .please(),
    ),
  );
  const previewRun = run([
    "preview",
    "--split-count",
    "2",
    "--spec-dir",
    specs,
    "--root",
    "tests",
  ]);
  assert.equal(previewRun.status, 0, previewRun.stderr);
  // Only the tests root's spec files: a (2.0) to share 1, c unrecorded at
  // the selected recorded median 2.0 to share 2; the other roots' specs,
  // support/helper.ts and src/ignored.spec.ts are not its specs.
  assert.equal(
    previewRun.stdout,
    `Predicted job-seconds per share from ${specs}/longest-first: 2 jobs, 1 recorded, 1 unrecorded at 2.0 s each (the recorded median).\n` +
      "share 1/2: 2.0 predicted (1 jobs, 0 unrecorded)\n" +
      "share 2/2: 2.0 predicted (1 jobs, 1 unrecorded)\n" +
      `unrecorded jobs (1), each assumed at 2.0 s; a refresh of ${specs}/longest-first records them:\n` +
      "  share 2/2  tests/c.spec.ts\n",
  );
});
