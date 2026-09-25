// Local default-checkout maintenance remains separate from accepted claims.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { exec } from "./publication-git.mjs";
import { reportedMaintenance } from "./execution-start-maintenance.mjs";
import {
  resumeArgs,
  startProcess,
} from "./workspace-publication-startup-test-fixtures.mjs";

test("the start reports an earlier distinct refresh issue only while refresh remains unresolved", () => {
  const lock = {
    result: "deferred",
    reason: "ongoing-operation",
    head: "a",
    status: null,
  };
  const diverged = {
    result: "stopped",
    reason: "diverged",
    head: "a",
    status: "",
  };
  const advanced = { result: "advanced", reason: null, head: "b", status: "" };
  assert.deepEqual(reportedMaintenance(lock, diverged), {
    maintenance: { result: "deferred", reason: "ongoing-operation" },
    earlierMaintenance: { result: "stopped", reason: "diverged" },
  });
  assert.deepEqual(reportedMaintenance(advanced, lock), {
    maintenance: { result: "advanced" },
  });
  assert.deepEqual(reportedMaintenance(lock, { ...lock }), {
    maintenance: { result: "deferred", reason: "ongoing-operation" },
  });
  const failed = {
    result: "deferred",
    reason: "refresh-failed",
    error: "fetch failed",
  };
  assert.deepEqual(reportedMaintenance(failed), { maintenance: failed });
});

test("clean main without ownership declarations refreshes after the remote claim succeeds", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const { receipt } = await startCliResult(trunk, "trunk");
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.deepEqual(receipt.maintenance, { result: "advanced" });
  assert.equal(await revParse(trunk.integration, "HEAD"), receipt.publishedSha);
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
  assert.deepEqual(receipt.maintenance, {
    result: "deferred",
    reason: "ongoing-operation",
  });
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
  assert.deepEqual(receipt.maintenance, {
    result: "stopped",
    reason: "diverged",
  });
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

test("accepted claim with deferred refresh resumes local maintenance only", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const first = await startProcess(trunk, "a", identityA, [
    "--declared-owner",
    "other",
    "--requester",
    "owner",
  ]).result;
  assert.equal(first.receipt.ok, true, JSON.stringify(first));
  assert.equal(first.receipt.maintenance.reason, "another-writer");
  assert.equal(await revParse(trunk.integration, "HEAD"), trunk.trunkSha);
  const resumed = await startProcess(trunk, "a", identityA, [
    ...resumeArgs(first.receipt),
    "--declared-owner",
    "owner",
    "--requester",
    "owner",
  ]).result;
  assert.equal(resumed.receipt.ok, true, JSON.stringify(resumed));
  assert.equal(resumed.receipt.status, "resumed");
  assert.equal(
    await revParse(trunk.integration, "HEAD"),
    first.receipt.publishedSha,
  );
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    first.receipt.publishedSha,
  );
});
