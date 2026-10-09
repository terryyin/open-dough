import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("./story-obligations.mjs", import.meta.url));
export function check(plan, ...args) {
  const command = spawnSync(
    process.execPath,
    [cli, "check", "--plan", plan, ...args],
    { encoding: "utf8" },
  );
  assert.equal(command.stderr, "");
  const lines = command.stdout.trim().split("\n");
  assert.equal(lines.length, 1, "one machine-readable result");
  const result = JSON.parse(lines[0]);
  assert.equal(command.status, result.ok ? 0 : 1);
  return result;
}
export function refuses(result, reason, entry = "G1", field) {
  assert.equal(result.ok, false);
  assert.ok(
    result.problems.some(
      (item) =>
        item.reason === reason &&
        item.entry === entry &&
        (field === undefined || item.field === field),
    ),
    JSON.stringify(result),
  );
}
