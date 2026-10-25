import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("./story-obligations.mjs", import.meta.url));
function run(operation, plan, ...args) {
  const command = spawnSync(
    process.execPath,
    [cli, operation, "--plan", plan, ...args],
    { encoding: "utf8" },
  );
  assert.equal(command.stderr, "");
  const lines = command.stdout.trim().split("\n");
  assert.equal(lines.length, 1, "one machine-readable result");
  const result = JSON.parse(lines[0]);
  assert.equal(command.status, result.ok ? 0 : 1);
  return result;
}
export function check(plan, ...args) {
  return run("check", plan, ...args);
}
export function list(plan, ...args) {
  return run("list", plan, ...args);
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
export function refusesCommitment(result, reason, commitment, fields = {}) {
  assert.equal(result.ok, false);
  assert.ok(
    result.problems.some(
      (item) =>
        item.reason === reason &&
        item.commitment === commitment &&
        Object.entries(fields).every(([key, value]) => item[key] === value),
    ),
    JSON.stringify(result),
  );
}
// The source-review ids an obligation's first problem with this reason names.
export function problemCommitments(result, reason) {
  return result.problems.find((item) => item.reason === reason).commitments;
}
// The commitment ids refused with this reason, sorted.
export function refusedCommitmentIds(result, reason) {
  return (result.problems ?? [])
    .filter((item) => item.reason === reason)
    .map((item) => item.commitment)
    .sort();
}
