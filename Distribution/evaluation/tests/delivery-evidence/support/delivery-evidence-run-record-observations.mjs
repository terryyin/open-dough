import fs from "node:fs";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const record = JSON.parse(fs.readFileSync(process.argv[2]));
assert.ok(record.command.length > 1);
assert.ok(["node", "python3", "bash"].includes(record.command[0]));
assert.equal(record.exitStatus, 0);
assert.equal(fs.readFileSync(record.exitFile, "utf8"), "0\n");
assert.ok(fs.readFileSync(record.log, "utf8").length > 0);
assert.ok(record.startedAt <= record.endedAt);
assert.equal(record.uncommittedChanges, true);
const git = (...args) =>
  execFileSync("git", ["-C", process.argv[3], ...args], {
    encoding: "utf8",
  }).trim();
const head = git("rev-parse", "HEAD");
if (process.argv[2].endsWith("/status-proof.log.run.json")) {
  assert.notEqual(record.revision, head);
  for (const path of ["lib/statusBadge.mjs", "tests/status-badge.test.mjs"])
    assert.equal(
      git("show", `${record.revision}:${path}`),
      fs.readFileSync(`${process.argv[3]}/${path}`, "utf8").trim(),
    );
} else {
  assert.equal(record.revision, head);
}
