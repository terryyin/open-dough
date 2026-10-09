// One-shot work: the startup command prepares an owned workspace at fetched
// trunk with workspace authority alone and publishes nothing; the verified
// result waits there for review, an explicit later landing publishes only that
// result to remote trunk through ordinary managed delivery, and a lost push
// response resumes without a duplicate commit.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  createdForRecords,
  git,
  lsRemoteSha,
  messageCount,
  remoteHeads,
  revParse,
} from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { lostPushResponse } from "./workspace-publication-startup-test-fixtures.mjs";
import { installManagedDelivery } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { deliverThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import { refreshDefaultCheckout } from "./maintain-default-checkout.mjs";

const trunkTarget = "refs/heads/main";
const repo = "owner/project";

// An unlisted one-shot start in Story Branch Mode, the default.
function startOneShot(trunk, extra = [], options = {}) {
  return startCliResult(trunk, "story-branch", ["--one-shot", ...extra], {
    identity: null,
    ...options,
  });
}

async function commitResult(workspace, message = "one-shot result") {
  writeFileSync(join(workspace, "feature.txt"), "one-shot result\n");
  await git(workspace, "add", "feature.txt");
  await git(workspace, "commit", "-m", message);
  return revParse(workspace, "HEAD");
}

// Paths each commit in `range` changed, one list per commit.
async function changedPaths(cwd, range) {
  const { stdout } = await git(
    cwd,
    "log",
    "--format=%x00",
    "--name-only",
    range,
  );
  return stdout
    .split("\0")
    .slice(1)
    .map((block) => block.trim().split("\n").filter(Boolean));
}

function assertPrepared(started, trunkSha) {
  assert.equal(started.code, 0, started.stdout);
  assert.equal(started.receipt.ok, true, started.stdout);
  assert.equal(started.receipt.status, "prepared");
  assert.equal(started.receipt.startingRevision, trunkSha);
  assert.equal(started.receipt.created, true);
  assert.equal(started.receipt.publishedSha, undefined);
  assert.equal(started.receipt.agent, undefined);
}

test("an unlisted one-shot result waits for review without publication authority, then an explicit landing publishes it as its only commit", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const headsBefore = await remoteHeads(trunk.origin);

  const started = await startOneShot(trunk, [], { pushAuthorized: false });
  assertPrepared(started, trunk.trunkSha);
  assert.equal(await remoteHeads(trunk.origin), headsBefore);
  const { workspace, branch } = started;
  assert.equal(await revParse(workspace, "HEAD"), trunk.trunkSha);
  // Work without an identity is created as before, with no creation record.
  assert.deepEqual(await createdForRecords(workspace), []);
  assert.equal(
    (await git(workspace, "branch", "--show-current")).stdout.trim(),
    branch,
  );

  const result = await commitResult(workspace);
  // Verified, then stopped for review: nothing reached the remote, the
  // default checkout stays at trunk, and the result is recoverable from the
  // retained workspace and its branch.
  assert.equal(
    readFileSync(join(workspace, "feature.txt"), "utf8"),
    "one-shot result\n",
  );
  assert.equal(await remoteHeads(trunk.origin), headsBefore);
  assert.equal(await revParse(trunk.integration, "HEAD"), trunk.trunkSha);
  assert.equal(await revParse(trunk.integration, branch), result);

  // The developer later asks to land it: delivery uses only the retained
  // workspace, branch, and starting revision.
  const delivery = await installManagedDelivery(
    trunk,
    trunk.fixture,
    workspace,
  );
  const delivered = await delivery.deliverManagedExecutionIncrement({
    ...delivery.requestBase,
    mode: "story-branch",
    tracking: "one-shot",
    workspace,
    branch,
    previouslyPublishedBase: started.receipt.startingRevision,
    targetRef: trunkTarget,
    repo,
    defaultCheckout: trunk.integration,
  });

  assert.equal(delivered.ok, true, JSON.stringify(delivered));
  assert.equal(delivered.receipt.sha, result);
  assert.equal(await lsRemoteSha(trunk.origin, trunkTarget), result);
  assert.deepEqual(
    await changedPaths(trunk.origin, `${trunk.trunkSha}..main`),
    [["feature.txt"]],
  );
  // No execution branch, claim, or profile was published anywhere.
  assert.equal(
    await remoteHeads(trunk.origin),
    headsBefore.replace(trunk.trunkSha, result),
  );

  const refreshed = await refreshDefaultCheckout({
    checkout: trunk.integration,
  });
  assert.equal(refreshed.result, "advanced", JSON.stringify(refreshed));
  assert.equal(await revParse(trunk.integration, "HEAD"), result);
});

test("a one-shot start with no change publishes nothing and retires cleanly", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const headsBefore = await remoteHeads(trunk.origin);

  const started = await startOneShot(trunk);
  assertPrepared(started, trunk.trunkSha);

  await git(trunk.integration, "worktree", "remove", started.workspace);
  await git(trunk.integration, "branch", "-d", started.branch);
  assert.equal(existsSync(started.workspace), false);
  assert.equal(
    (await git(trunk.integration, "branch", "--list", started.branch)).stdout,
    "",
  );
  assert.equal(await remoteHeads(trunk.origin), headsBefore);
});

test("a lost push response resumes the one-shot result without a duplicate commit", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  // The CLI delivery fixture delivers the exec/story branch.
  const started = await startOneShot(trunk, [], { name: "story" });
  assertPrepared(started, trunk.trunkSha);
  const { workspace } = started;
  const result = await commitResult(workspace, "lost-response result");
  const delivery = await installManagedDelivery(
    trunk,
    trunk.fixture,
    workspace,
  );
  const fixture = { ...delivery, execution: workspace };

  const lost = await deliverThroughCli(fixture, {
    base: started.receipt.startingRevision,
    host: "cursor",
    mode: "story-branch",
    tracking: "one-shot",
    env: { ...delivery.env, PATH: lostPushResponse(trunk).PATH },
  });
  assert.notEqual(lost.code, 0, lost.stdout);
  assert.match(lost.stderr, /connection closed after acceptance/);
  // The push itself reached remote trunk.
  assert.equal(await lsRemoteSha(trunk.origin, trunkTarget), result);

  const resumed = await delivery.resumeManagedExecutionIncrement({
    ...delivery.requestBase,
    workspace,
    candidateSha: result,
    suffixBase: started.receipt.startingRevision,
    targetRef: trunkTarget,
    repo,
    publishedRevisions: [],
    defaultCheckout: trunk.integration,
  });
  assert.equal(resumed.ok, true, JSON.stringify(resumed));
  assert.equal(resumed.pushCount, 0);
  assert.equal(resumed.receipt.sha, result);
  assert.equal(resumed.suffixBase, started.receipt.startingRevision);
  assert.deepEqual(
    (
      await git(
        workspace,
        "diff",
        "--name-only",
        resumed.suffixBase,
        resumed.receipt.sha,
      )
    ).stdout
      .trim()
      .split("\n"),
    ["feature.txt"],
  );
  assert.equal(
    await messageCount(trunk.origin, "main", "lost-response result"),
    1,
  );
  assert.deepEqual(
    await changedPaths(trunk.origin, `${trunk.trunkSha}..main`),
    [["feature.txt"]],
  );
});
