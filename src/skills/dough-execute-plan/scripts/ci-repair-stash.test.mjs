// CI repair pause mechanics through the installed CLI: two worktrees of one
// repository share a stash stack, and saving or restoring the execution's work
// touches only the entry that save created.
import assert from "node:assert/strict";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git } from "./publication-git.mjs";
import { indexLockPath } from "./publication-test-fixtures.mjs";
import {
  addDirtySubmodule,
  createSharedStashFixture,
  dirtyAllKinds,
} from "./ci-repair-stash-test-fixtures.mjs";

test("a failed save records no stash and leaves the foreign stash and dirty files as they were", async (t) => {
  const fixture = await createSharedStashFixture(t);
  const foreign = await fixture.foreignStash("foreign");
  await dirtyAllKinds(fixture);
  const dirty = await fixture.status();
  writeFileSync(await indexLockPath(fixture.execution), "");

  const saved = await fixture.save();
  assert.equal(saved.status, "failed");
  assert.equal(saved.exitCode, 1);
  assert.match(saved.error, /\S/); // Its wording varies with Git version.
  assert.equal(saved.oid, null);
  assert.equal(JSON.parse(readFileSync(saved.record, "utf8")).oid, null);

  const restored = await fixture.restore(saved.record);
  assert.equal(restored.applied, false);
  assert.deepEqual(await fixture.stack(), [foreign]);
  assert.equal(await fixture.status(), dirty);
  assert.equal(fixture.read("tracked.txt"), "unstaged owned\n");
});

test("a paused round trip restores staged, unstaged, and untracked work and drops only its own entry after selectors shift", async (t) => {
  const fixture = await createSharedStashFixture(t);
  const firstForeign = await fixture.foreignStash("first foreign");
  await dirtyAllKinds(fixture);
  const dirty = await fixture.status();

  const saved = await fixture.save();
  assert.equal(saved.status, "stashed");
  assert.equal(saved.previousTop, firstForeign);
  assert.notEqual(saved.oid, firstForeign);
  assert.deepEqual(saved.staged, ["staged.txt"]);
  assert.deepEqual(saved.unstaged, ["tracked.txt"]);
  assert.deepEqual(saved.untracked, ["new.txt"]);
  assert.equal(await fixture.status(), "");
  assert.equal(statSync(saved.record).mode & 0o777, 0o600);
  assert.ok(!saved.record.startsWith(fixture.execution));

  await fixture.commit("repair.txt", "repair\n");
  const secondForeign = await fixture.foreignStash("second foreign");
  assert.notEqual((await fixture.stack())[0], saved.oid);

  const restored = await fixture.restore(saved.record);
  assert.equal(restored.status, "resumed");
  assert.equal(restored.applied, true);
  assert.equal(restored.dropped, "stash@{1}");
  assert.equal(await fixture.status(), dirty);
  assert.equal(fixture.read("new.txt"), "untracked owned\n");
  assert.deepEqual(await fixture.stack(), [secondForeign, firstForeign]);
});

test("a clean checkout saves no stash and resumes without touching the foreign top entry", async (t) => {
  const fixture = await createSharedStashFixture(t);
  const foreign = await fixture.foreignStash("foreign");

  const saved = await fixture.save();
  assert.equal(saved.status, "clean");
  assert.equal(saved.oid, null);

  const restored = await fixture.restore(saved.record);
  assert.equal(restored.status, "resumed");
  assert.equal(restored.applied, false);
  assert.deepEqual(await fixture.stack(), [foreign]);
});

test("a restore that conflicts with the repair names the path and OID, reports a partial apply with the staging it lost, and keeps the entry", async (t) => {
  const fixture = await createSharedStashFixture(t);
  await dirtyAllKinds(fixture);
  // Staged content differs from the worktree, so losing the index shows.
  writeFileSync(join(fixture.execution, "staged.txt"), "later edit\n");
  const saved = await fixture.save();
  assert.equal(saved.status, "stashed");

  await fixture.commit("tracked.txt", "repair line\n");

  const restored = await fixture.restore(saved.record);
  assert.equal(restored.status, "conflict");
  assert.equal(restored.exitCode, 1);
  assert.equal(restored.oid, saved.oid);
  assert.deepEqual(restored.paths, ["tracked.txt"]);
  assert.equal(restored.applied, "partial");
  assert.deepEqual(restored.stagedNotRestored, ["staged.txt"]);
  assert.match(fixture.read("tracked.txt"), /^<<<<<<< /m);
  assert.equal(fixture.read("new.txt"), "untracked owned\n");
  assert.equal(fixture.read("staged.txt"), "later edit\n");
  assert.equal(await fixture.staged("staged.txt"), "later edit\n");
  assert.deepEqual(await fixture.stack(), [saved.oid]);
});

test("a restore whose repair added the paused work's untracked path applies the tracked work, reports partial, and keeps the entry", async (t) => {
  const fixture = await createSharedStashFixture(t);
  await dirtyAllKinds(fixture);
  const saved = await fixture.save();
  assert.equal(saved.status, "stashed");

  await fixture.commit("new.txt", "repair content\n");

  const restored = await fixture.restore(saved.record);
  assert.equal(restored.status, "conflict");
  assert.deepEqual(restored.paths, ["new.txt"]);
  assert.equal(restored.applied, "partial");
  assert.deepEqual(restored.stagedNotRestored, []);
  assert.equal(await fixture.status(), "M  staged.txt\n M tracked.txt\n");
  assert.equal(await fixture.staged("staged.txt"), "staged owned\n");
  assert.equal(fixture.read("tracked.txt"), "unstaged owned\n");
  assert.equal(fixture.read("new.txt"), "repair content\n");
  assert.deepEqual(await fixture.stack(), [saved.oid]);
});

test("a restore whose entry was dropped elsewhere reports its OID, applies nothing, and leaves the stack", async (t) => {
  const fixture = await createSharedStashFixture(t);
  await dirtyAllKinds(fixture);
  const saved = await fixture.save();
  assert.equal(saved.status, "stashed");
  await git(fixture.other, "stash", "drop", "-q", "stash@{0}");
  const foreign = await fixture.foreignStash("foreign");

  const restored = await fixture.restore(saved.record);
  assert.equal(restored.status, "missing");
  assert.equal(restored.oid, saved.oid);
  assert.equal(restored.applied, false);
  assert.equal(await fixture.status(), "");
  assert.deepEqual(await fixture.stack(), [foreign]);
});

test("a save that leaves submodule dirt behind reports unclean with its entry recorded and the foreign entry kept", async (t) => {
  const fixture = await createSharedStashFixture(t);
  await addDirtySubmodule(fixture);
  const foreign = await fixture.foreignStash("foreign");
  writeFileSync(join(fixture.execution, "tracked.txt"), "unstaged owned\n");

  const saved = await fixture.save();
  assert.equal(saved.status, "unclean");
  assert.equal(saved.exitCode, 1);
  assert.notEqual(saved.oid, null);
  assert.deepEqual(saved.remaining.unstaged, ["sub"]);
  assert.deepEqual(await fixture.stack(), [saved.oid, foreign]);
  assert.equal(fixture.read("sub/lib.txt"), "submodule dirt\n");
});

test("a successful push that creates no entry of its own reports ambiguous, not failed, and restore does not resume", async (t) => {
  const fixture = await createSharedStashFixture(t);
  await addDirtySubmodule(fixture);
  const foreign = await fixture.foreignStash("foreign");

  const saved = await fixture.save();
  assert.equal(saved.status, "ambiguous");
  assert.equal(saved.exitCode, 1);
  assert.equal(saved.oid, null);
  assert.deepEqual(saved.candidates, []);
  assert.deepEqual(saved.remaining.unstaged, ["sub"]);

  const restored = await fixture.restore(saved.record);
  assert.equal(restored.status, "ambiguous");
  assert.equal(restored.applied, false);
  assert.deepEqual(await fixture.stack(), [foreign]);
});
