// CI repair pause mechanics through the installed CLI: two worktrees of one
// repository share a stash stack, and saving or restoring the execution's work
// touches only the entry that save created.
import assert from "node:assert/strict";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { exec, git, indexLockPath } from "./publication-git.mjs";

const script = fileURLToPath(new URL("./ci-repair-stash.mjs", import.meta.url));

async function stashTool(...args) {
  try {
    const { stdout } = await exec("node", [script, ...args]);
    return { exitCode: 0, ...JSON.parse(stdout) };
  } catch (error) {
    if (error.code !== 1) throw error;
    return { exitCode: 1, ...JSON.parse(error.stdout) };
  }
}

async function createSharedStashFixture(t) {
  const root = mkdtempSync(join(tmpdir(), "ci-repair-stash-"));
  const records = [];
  t.after(() => {
    for (const path of [root, ...records.map((record) => dirname(record))])
      rmSync(path, { recursive: true, force: true });
  });
  const execution = join(root, "execution");
  const other = join(root, "other");
  await git(root, "init", "-q", "-b", "main", execution);
  await git(execution, "config", "user.email", "fixture@example.com");
  await git(execution, "config", "user.name", "Fixture");
  for (const name of ["tracked.txt", "staged.txt", "shared.txt"])
    writeFileSync(join(execution, name), `${name} base\n`);
  await git(execution, "add", ".");
  await git(execution, "commit", "-q", "-m", "base");
  await git(execution, "worktree", "add", "-q", "-b", "other", other);
  return {
    root,
    execution,
    other,
    async save(label = "dough-execute-plan CI repair 1/1") {
      const receipt = await stashTool(
        "save",
        "--checkout",
        execution,
        "--label",
        label,
      );
      records.push(receipt.record);
      return receipt;
    },
    restore: (record) => stashTool("restore", "--record", record),
    async foreignStash(name) {
      writeFileSync(join(other, "shared.txt"), `${name}\n`);
      await git(other, "stash", "push", "-q", "-m", name);
      return (await git(other, "rev-parse", "refs/stash")).stdout.trim();
    },
    async stack() {
      return (await git(execution, "stash", "list", "--format=%H")).stdout
        .split("\n")
        .filter(Boolean);
    },
    status: async () =>
      (
        await git(
          execution,
          "status",
          "--porcelain=v1",
          "--untracked-files=all",
        )
      ).stdout,
    read: (name) => readFileSync(join(execution, name), "utf8"),
  };
}

// Submodule content changes show as dirt that `git stash` cannot save.
async function addDirtySubmodule({ root, execution }) {
  const library = join(root, "library");
  await git(root, "init", "-q", "-b", "main", library);
  writeFileSync(join(library, "lib.txt"), "library base\n");
  await git(library, "add", ".");
  await git(
    library,
    "-c",
    "user.email=fixture@example.com",
    "-c",
    "user.name=Fixture",
    "commit",
    "-q",
    "-m",
    "library",
  );
  await git(
    execution,
    "-c",
    "protocol.file.allow=always",
    "submodule",
    "add",
    "-q",
    library,
    "sub",
  );
  await git(execution, "commit", "-q", "-m", "submodule");
  writeFileSync(join(execution, "sub", "lib.txt"), "submodule dirt\n");
}

async function dirtyAllKinds({ execution }) {
  writeFileSync(join(execution, "staged.txt"), "staged owned\n");
  await git(execution, "add", "staged.txt");
  writeFileSync(join(execution, "tracked.txt"), "unstaged owned\n");
  writeFileSync(join(execution, "new.txt"), "untracked owned\n");
}

test("a failed save records no stash and leaves the foreign stash and dirty files as they were", async (t) => {
  const fixture = await createSharedStashFixture(t);
  const foreign = await fixture.foreignStash("foreign");
  await dirtyAllKinds(fixture);
  const dirty = await fixture.status();
  writeFileSync(await indexLockPath(fixture.execution), "");

  const saved = await fixture.save();
  assert.equal(saved.status, "failed");
  assert.equal(saved.exitCode, 1);
  assert.match(saved.error, /could not write index|index\.lock/);
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

  writeFileSync(join(fixture.execution, "repair.txt"), "repair\n");
  await git(fixture.execution, "add", "repair.txt");
  await git(fixture.execution, "commit", "-q", "-m", "repair");
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

test("a restore that conflicts with the repair names the path and OID and keeps the entry", async (t) => {
  const fixture = await createSharedStashFixture(t);
  writeFileSync(join(fixture.execution, "tracked.txt"), "owned line\n");
  const saved = await fixture.save();
  assert.equal(saved.status, "stashed");

  writeFileSync(join(fixture.execution, "tracked.txt"), "repair line\n");
  await git(fixture.execution, "commit", "-q", "-am", "repair");

  const restored = await fixture.restore(saved.record);
  assert.equal(restored.status, "conflict");
  assert.equal(restored.exitCode, 1);
  assert.equal(restored.oid, saved.oid);
  assert.deepEqual(restored.paths, ["tracked.txt"]);
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
