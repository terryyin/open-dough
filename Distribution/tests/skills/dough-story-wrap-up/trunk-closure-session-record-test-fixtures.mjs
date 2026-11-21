// Readers of what Trunk Mode `finish`'s record stage leaves on the bare
// remote: the published session record commit, and the remote's pushes apart
// from such commits, so a closure test observes its own pushes while the
// record stage's tests observe the record.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { sessionRecordDirectory } from "../../../src/skills/dough-execute-plan/scripts/session-record.mjs";
import { countPushes } from "../dough-execute-plan/execution-increment-managed-delivery-owner-test-fixtures.mjs";
import { git } from "../dough-execute-plan/execution-increment-managed-delivery-test-fixtures.mjs";
import { lsRemoteSha } from "../dough-execute-plan/publication-test-fixtures.mjs";

// The session record commits `origin` holds on any ref: each adds a record.
export function sessionRecordCommits(origin) {
  const records = `:(glob)**/${sessionRecordDirectory}/*.json`;
  const log = execFileSync(
    "git",
    ["log", "--all", "--format=%H", "--diff-filter=A", "--", records],
    { cwd: origin, encoding: "utf8" },
  );
  return new Set(log.split("\n").filter(Boolean));
}

// Counts, as `countPushes` does, the pushes the bare remote receives from now
// on, apart from the session record commits it accepts meanwhile.
export async function countClosurePushes(fixture) {
  const pushes = await countPushes(fixture);
  const before = sessionRecordCommits(fixture.origin).size;
  return () => pushes() - (sessionRecordCommits(fixture.origin).size - before);
}

// The trunk tip after finish published the session record: one record commit
// directly on the accepted `closure` that adds only that session's record.
// Returns the record commit and the record it carries.
export async function recordTipOver(
  fixture,
  closure,
  targetRef = "refs/heads/main",
) {
  const tip = await lsRemoteSha(fixture.origin, targetRef);
  const show = (...args) => git(fixture.origin, ...args);
  assert.equal((await show("rev-parse", `${tip}^`)).stdout.trim(), closure);
  const added = (
    await show("diff-tree", "--no-commit-id", "--name-status", "-r", tip)
  ).stdout
    .trim()
    .split("\n");
  assert.equal(added.length, 1);
  const [status, path] = added[0].split("\t");
  assert.equal(status, "A");
  return {
    sha: tip,
    path,
    record: JSON.parse((await show("show", `${tip}:${path}`)).stdout),
  };
}

// Whether the origin's target holds `sha`, as once finish published the final
// closure, whether or not its session record followed.
export async function targetHolds(fixture, sha, targetRef = "refs/heads/main") {
  const tip = await lsRemoteSha(fixture.origin, targetRef);
  if (!tip) return false;
  return git(fixture.origin, "merge-base", "--is-ancestor", sha, tip).then(
    () => true,
    () => false,
  );
}
