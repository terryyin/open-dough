// One-shot work: the startup command prepares an owned workspace at fetched
// trunk and publishes nothing; ordinary managed delivery publishes only the
// result to remote trunk, and a lost push response resumes without a
// duplicate commit.
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
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
  identityA,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { lostPushResponse } from "./workspace-publication-startup-test-fixtures.mjs";
import { installManagedDelivery } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { deliverThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import { startExecution } from "./execution-start.mjs";
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

test("an unlisted one-shot result reaches remote trunk as its only commit", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const headsBefore = await remoteHeads(trunk.origin);

  const started = await startOneShot(trunk);
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
  const delivery = await installManagedDelivery(
    trunk,
    trunk.fixture,
    workspace,
  );
  const delivered = await delivery.deliverManagedExecutionIncrement({
    ...delivery.requestBase,
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

test("one-shot refuses admission, missing authority, and Taken work without creating a workspace", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const taken = await startCliResult(trunk, "trunk");
  assert.equal(taken.receipt.ok, true, taken.stdout);
  const headsBefore = await remoteHeads(trunk.origin);

  const refusals = [
    [
      "admission",
      startOneShot(
        trunk,
        ["--admit", "--link", "seeds/C.md#c", "--title", "C"],
        {
          name: "admit",
        },
      ),
      "invalid-request",
      /--one-shot or --admit/,
    ],
    [
      "Taken identity",
      startOneShot(trunk, [], { name: "taken", identity: identityA }),
      "source-refused",
      /already Taken on fetched trunk/,
    ],
  ];
  for (const [label, pending, status, error] of refusals) {
    const refused = await pending;
    assert.equal(refused.code, 1, label);
    assert.equal(refused.receipt.status, status, label);
    assert.match(refused.receipt.error, error, label);
    assert.equal(existsSync(refused.workspace), false, label);
  }

  const workspace = join(trunk.fixture, "start-unauthorized");
  const unauthorized = await startExecution({
    integration: trunk.integration,
    workspace,
    branch: "exec/unauthorized",
    mode: "story-branch",
    target: "main",
    oneShot: true,
    workspaceAuthorized: true,
  });
  assert.equal(unauthorized.status, "authority-required");
  assert.equal(existsSync(workspace), false);
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
    targetRef: trunkTarget,
    repo,
    publishedRevisions: [],
    defaultCheckout: trunk.integration,
  });
  assert.equal(resumed.ok, true, JSON.stringify(resumed));
  assert.equal(resumed.pushCount, 0);
  assert.equal(resumed.receipt.sha, result);
  assert.equal(
    await messageCount(trunk.origin, "main", "lost-response result"),
    1,
  );
  assert.deepEqual(
    await changedPaths(trunk.origin, `${trunk.trunkSha}..main`),
    [["feature.txt"]],
  );
});
