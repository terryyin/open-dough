// The share and refresh command surfaces of scripts/test-shares.mjs.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";
import { durationListText } from "./job-duration-list.mjs";
import { makeMe } from "./makeMe.mjs";

const allocator = fileURLToPath(
  new URL("../../../scripts/test-shares.mjs", import.meta.url),
);
const scratch = mkdtempSync(join(tmpdir(), "test-shares-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

const listText = (seconds) => durationListText(seconds, "# list");
const list = join(scratch, "longest-first");
writeFileSync(
  list,
  listText(
    makeMe.jobDurations
      .with([
        ["long.sh", 9],
        ["short.sh", 1],
      ])
      .please(),
  ),
);
const labels = ["new-b.sh", "short.sh", "long.sh", "new-a.sh"];

const run = (args, options = {}) =>
  spawnSync(process.execPath, [allocator, ...args], {
    encoding: "utf8",
    ...options,
  });
const share = (listPath, split) =>
  run(["share", "--list", listPath, ...(split ? ["--split", split] : [])], {
    input: labels.map((label) => `${label}\0`).join(""),
  });

test("share prints the whole deal, or one split's labels, NUL-terminated in start order", () => {
  const whole = share(list);
  assert.equal(whole.status, 0, whole.stderr);
  assert.equal(whole.stdout, "long.sh\0short.sh\0new-a.sh\0new-b.sh\0");
  // long 9 to share 1; short 1 to share 2; new-a and new-b (5 each, the
  // median) to share 2, the lighter at 1 and then 6.
  assert.equal(share(list, "1/2").stdout, "long.sh\0");
  assert.equal(share(list, "2/2").stdout, "short.sh\0new-a.sh\0new-b.sh\0");
});

test("share refuses a split that is not <i>/<n>", () => {
  const invalid = share(list, "3/2");
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /^FAIL: --split=3\/2 is not <i>\/<n>/);
});

test("a file a share or refresh command cannot read fails naming it, without a stack trace", () => {
  const missing = join(scratch, "missing");
  const refreshed = join(scratch, "refreshed");
  const refresh = run([
    "refresh",
    "--list",
    refreshed,
    "--source",
    "run",
    missing,
  ]);
  for (const result of [share(missing, "1/2"), refresh]) {
    assert.equal(result.status, 1, result.stderr);
    assert.equal(result.stderr, `FAIL: ${missing} cannot be read (ENOENT).\n`);
    assert.equal(result.stdout, "");
  }
});
