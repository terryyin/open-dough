// Git mechanics (not guidance-following): select an owned workspace, publish
// its Taken claim, and run command readiness before implementation. A later
// preparation failure keeps the published claim. Native sequencing is not
// this file.
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import { acquireWorkspaceClaim } from "./workspace-publication.mjs";
import {
  createQueuedTrunk,
  failingContributing,
  identityA,
  readyContributing,
} from "./workspace-publication-fixtures.mjs";
import { takenIdentities } from "./workspace-publication-ownership.mjs";

async function remoteBacklog(workspace) {
  return (
    await git(workspace, "show", `origin/main:.planning/PRODUCT-BACKLOG.md`)
  ).stdout;
}

test("a queued claim is published from the owned workspace before implementation, after command readiness", async (t) => {
  const trunk = await createQueuedTrunk({ contributing: readyContributing });
  t.after(trunk.cleanup);
  const workspace = join(trunk.fixture, "exec-a");
  let sawRemoteBeforeImplementation = false;

  const result = await acquireWorkspaceClaim({
    integration: trunk.integration,
    origin: trunk.origin,
    workspace,
    branch: "exec/a",
    identity: identityA,
    publisherId: "exec-a",
    prepareCommands: true,
    async onImplement(state) {
      const tip = await lsRemoteSha(trunk.origin, "refs/heads/main");
      assert.equal(tip, state.publishedSha);
      assert.equal(
        existsSync(join(workspace, "implementation-started")),
        false,
      );
      sawRemoteBeforeImplementation = true;
      writeFileSync(join(workspace, "implementation-started"), "started\n");
    },
  });

  assert.equal(result.ok, true, JSON.stringify(result.recovery));
  assert.equal(result.created, true);
  assert.equal(result.implemented, true);
  assert.equal(sawRemoteBeforeImplementation, true);
  assert.deepEqual(result.trace, [
    "selected",
    "committed",
    "prepared",
    "implementation",
  ]);
  assert.equal(existsSync(join(workspace, ".setup-ran")), true);
  assert.equal(existsSync(join(workspace, ".command-ran")), true);
  assert.equal(existsSync(join(trunk.integration, ".setup-ran")), false);
  assert.equal(await revParse(trunk.integration, "HEAD"), trunk.trunkSha);
  assert.equal(
    (await git(trunk.integration, "status", "--porcelain")).stdout,
    "",
  );
  const published = await remoteBacklog(workspace);
  assert.equal(takenIdentities(published).includes(identityA), true);
  assert.match(
    (await git(workspace, "log", "-1", "--format=%B", result.publishedSha))
      .stdout,
    /Claim-Publisher: exec-a/,
  );
});

test("a readiness failure after a published claim keeps that claim and does not start implementation", async (t) => {
  const trunk = await createQueuedTrunk({ contributing: failingContributing });
  t.after(trunk.cleanup);
  const workspace = join(trunk.fixture, "exec-a");
  let implemented = false;

  const result = await acquireWorkspaceClaim({
    integration: trunk.integration,
    origin: trunk.origin,
    workspace,
    branch: "exec/a",
    identity: identityA,
    publisherId: "exec-a",
    prepareCommands: true,
    onImplement() {
      implemented = true;
    },
  });

  assert.equal(result.status, "preparation-failed");
  assert.equal(result.implemented, false);
  assert.equal(implemented, false);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    result.publishedSha,
  );
  assert.equal(result.recovery.workspace, workspace);
  assert.equal(result.recovery.publishedSha, result.publishedSha);
  assert.match(result.recovery.report, /exec-a/);
  assert.equal(existsSync(workspace), true);
  const published = await remoteBacklog(workspace);
  assert.equal(takenIdentities(published).includes(identityA), true);
});

test("workspace setup failure preserves recovery context and leaves trunk unpublished", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const workspace = join(trunk.fixture, "blocked");
  writeFileSync(workspace, "not a directory\n");
  let implemented = false;

  const result = await acquireWorkspaceClaim({
    integration: trunk.integration,
    origin: trunk.origin,
    workspace,
    branch: "exec/blocked",
    identity: identityA,
    publisherId: "exec-blocked",
    onImplement() {
      implemented = true;
    },
  });

  assert.equal(result.status, "setup-failed");
  assert.equal(result.implemented, false);
  assert.equal(implemented, false);
  assert.equal(result.recovery.workspace, workspace);
  assert.match(result.recovery.error, /blocked|exists|Not a directory/i);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
});

test("a matching retained execution resumes its own published claim", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const workspace = join(trunk.fixture, "exec-a");
  const first = await acquireWorkspaceClaim({
    integration: trunk.integration,
    origin: trunk.origin,
    workspace,
    branch: "exec/a",
    identity: identityA,
    publisherId: "exec-a",
  });
  assert.equal(first.status, "published");

  const second = await acquireWorkspaceClaim({
    integration: trunk.integration,
    origin: trunk.origin,
    workspace,
    branch: "exec/a",
    identity: identityA,
    publisherId: "exec-a",
    retained: {
      workspace,
      branch: "exec/a",
      startingRevision: first.startingRevision,
      candidateSha: first.publishedSha,
    },
  });

  assert.equal(second.status, "resumed");
  assert.equal(second.created, false);
  assert.equal(second.publishedSha, first.publishedSha);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    first.publishedSha,
  );
  assert.deepEqual(second.trace, ["selected", "resumed", "implementation"]);
  const subjects = (await git(workspace, "log", "--format=%s")).stdout
    .trim()
    .split("\n");
  assert.equal(
    subjects.filter((line) => line.startsWith("Take queued work")).length,
    1,
  );
});
