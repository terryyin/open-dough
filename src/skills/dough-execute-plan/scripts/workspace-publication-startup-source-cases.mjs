// Published readiness, authority, and fetch refusals preserve queued work.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  captureCheckout,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
  remoteBacklog,
  startCliResult,
  storyA,
} from "./workspace-publication-fixtures.mjs";
import { startExecution } from "./execution-start.mjs";
import { takenIdentities } from "./workspace-publication-ownership.mjs";

// The local copy is either the pushed stale story or, restored to the assessed
// bytes in the default checkout's worktree and index, a ready-looking one.
for (const readyLocalCopy of [false, true]) {
  test(`stale published readiness stops without a Taken claim${readyLocalCopy ? " beside a ready-looking local copy" : ""}`, async (t) => {
    const trunk = await createQueuedTrunk();
    t.after(trunk.cleanup);
    const seed = join(trunk.integration, ".planning/seeds/A.md");
    const assessed = readFileSync(seed, "utf8");
    writeFileSync(
      seed,
      assessed.replace("Execute A.", "Changed after assessment."),
    );
    await git(trunk.integration, "add", ".planning/seeds/A.md");
    await git(trunk.integration, "commit", "-m", "stale assessment");
    await git(trunk.integration, "push", "origin", "main");
    const tip = await revParse(trunk.integration, "HEAD");
    if (readyLocalCopy) {
      writeFileSync(seed, assessed);
      await git(trunk.integration, "add", ".planning/seeds/A.md");
    }
    const local = {
      checkout: await captureCheckout(trunk.integration),
      seed: readFileSync(seed, "utf8"),
    };
    const { receipt, code, workspace } = await startCliResult(trunk, "trunk");
    assert.equal(code, 1);
    assert.equal(receipt.ok, false);
    assert.equal(receipt.status, "source-refused");
    assert.match(receipt.error, /needs-reassessment/);
    assert.equal("publishedSha" in receipt, false);
    assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
    assert.equal(existsSync(workspace), false);
    assert.deepEqual(
      {
        checkout: await captureCheckout(trunk.integration),
        seed: readFileSync(seed, "utf8"),
      },
      local,
    );
  });
}

test("a published sibling story added after readiness still takes the ready story", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const seed = join(trunk.integration, ".planning/seeds/A.md");
  writeFileSync(
    seed,
    `${readFileSync(seed, "utf8")}\n<a id="sibling"></a>\n\n### Sibling story\n\n**Identity:** SEED-A#sibling\n\nPrepared after A was assessed.\n`,
  );
  await git(trunk.integration, "add", ".planning/seeds/A.md");
  await git(trunk.integration, "commit", "-m", "add sibling story");
  await git(trunk.integration, "push", "origin", "main");
  const { receipt, workspace } = await startCliResult(trunk, "trunk");
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    receipt.publishedSha,
  );
  assert.equal(
    takenIdentities(await remoteBacklog(workspace)).includes(identityA),
    true,
  );
});

test("an unlisted identity is refused with a pointer to admission", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const backlog = join(trunk.integration, ".planning/PRODUCT-BACKLOG.md");
  writeFileSync(
    backlog,
    readFileSync(backlog, "utf8").replace(`${storyA}\n`, ""),
  );
  await git(trunk.integration, "commit", "-am", "unlist A");
  await git(trunk.integration, "push", "origin", "main");
  const tip = await revParse(trunk.integration, "HEAD");
  const { receipt, code, workspace } = await startCliResult(trunk, "trunk");
  assert.equal(code, 1);
  assert.equal(receipt.status, "source-refused", JSON.stringify(receipt));
  assert.match(receipt.error, /not queued on fetched trunk; .*--admit/);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
  assert.equal(existsSync(workspace), false);
});

test("a failed fetch creates no workspace or claim", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  await git(
    trunk.integration,
    "remote",
    "set-url",
    "origin",
    join(trunk.fixture, "unreachable.git"),
  );
  const unavailable = await startCliResult(trunk, "trunk");
  assert.equal(unavailable.receipt.status, "source-refused");
  assert.equal(existsSync(unavailable.workspace), false);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
});

test("missing publication authority refuses before fetch or workspace selection", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const workspace = join(trunk.fixture, "unauthorized");
  const receipt = await startExecution({
    integration: trunk.integration,
    workspace,
    branch: "exec/unauthorized",
    identity: identityA,
    publisherId: "unauthorized",
    mode: "trunk",
    remote: "origin",
    target: "main",
    workspaceAuthorized: true,
  });
  assert.equal(receipt.status, "authority-required");
  assert.equal(existsSync(workspace), false);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
});
