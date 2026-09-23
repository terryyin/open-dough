// Local default-checkout maintenance remains separate from accepted claims.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { exec } from "./publication-git.mjs";

test("clean main with unknown access defers refresh while the remote claim succeeds", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const { receipt } = await startCliResult(trunk, "trunk");
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.equal(receipt.beforeMaintenance.reason, "unclear-ownership");
  assert.equal(receipt.afterMaintenance.reason, "unclear-ownership");
  assert.equal(await revParse(trunk.integration, "HEAD"), trunk.trunkSha);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    receipt.publishedSha,
  );
});

test("an ongoing local index operation defers refresh without erasing accepted remote Take", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const lock = resolve(
    trunk.integration,
    (
      await git(trunk.integration, "rev-parse", "--git-path", "index.lock")
    ).stdout.trim(),
  );
  writeFileSync(lock, "other writer\n");
  const { receipt } = await startCliResult(trunk, "trunk", [
    "--declared-owner",
    "owner",
    "--requester",
    "owner",
  ]);
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.equal(receipt.beforeMaintenance.reason, "ongoing-operation");
  assert.equal(receipt.afterMaintenance.reason, "ongoing-operation");
  assert.equal(readFileSync(lock, "utf8"), "other writer\n");
  assert.equal(await revParse(trunk.integration, "HEAD"), trunk.trunkSha);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    receipt.publishedSha,
  );
});

test("divergent local main is preserved while the remote claim is accepted", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  writeFileSync(join(trunk.integration, "local.txt"), "local commit\n");
  await git(trunk.integration, "add", "local.txt");
  await git(trunk.integration, "commit", "-m", "unrelated local commit");
  const local = await revParse(trunk.integration, "HEAD");
  const other = join(trunk.fixture, "other");
  await exec("git", ["clone", trunk.origin, other]);
  await git(other, "config", "user.name", "Other Writer");
  await git(other, "config", "user.email", "other@example.test");
  writeFileSync(join(other, "remote.txt"), "remote commit\n");
  await git(other, "add", "remote.txt");
  await git(other, "commit", "-m", "unrelated remote commit");
  await git(other, "push", "origin", "main");
  const { receipt } = await startCliResult(trunk, "trunk", [
    "--declared-owner",
    "owner",
    "--requester",
    "owner",
  ]);
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.equal(receipt.beforeMaintenance.reason, "diverged");
  assert.equal(receipt.afterMaintenance.reason, "diverged");
  assert.equal(await revParse(trunk.integration, "HEAD"), local);
  assert.equal(
    readFileSync(join(trunk.integration, "local.txt"), "utf8"),
    "local commit\n",
  );
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    receipt.publishedSha,
  );
});
