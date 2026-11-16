// The command surface of scripts/test-shares.mjs: `preview` and `refresh`.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";

const allocator = fileURLToPath(
  new URL("../../../scripts/test-shares.mjs", import.meta.url),
);
const scratch = mkdtempSync(join(tmpdir(), "test-shares-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

const run = (args) =>
  spawnSync(process.execPath, [allocator, ...args], { encoding: "utf8" });

test("a command other than preview or refresh is refused naming it", () => {
  const share = run(["share"]);
  assert.equal(share.status, 1);
  assert.equal(
    share.stderr,
    "FAIL: the command must be one of preview, refresh, not share.\n",
  );
});

test("a file the refresh command cannot read fails naming it, without a stack trace", () => {
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
  assert.equal(refresh.status, 1, refresh.stderr);
  assert.equal(refresh.stderr, `FAIL: ${missing} cannot be read (ENOENT).\n`);
  assert.equal(refresh.stdout, "");
});
