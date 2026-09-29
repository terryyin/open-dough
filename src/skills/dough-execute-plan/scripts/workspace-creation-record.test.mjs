// The creation record: a workspace created for named work keeps one
// per-worktree ref naming that work at its starting revision. Work without an
// identity, or with one Git rejects as a ref name, is created with no record,
// and a reused workspace gains none.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { createdFor, createdForRecords } from "./publication-test-fixtures.mjs";
import { selectOwnedWorkspace } from "./workspace-publication-select.mjs";
import {
  createQueuedTrunk,
  identityA,
  identityB,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";

// Selects the workspace `name` in `trunk`, expecting success.
async function select(trunk, name, identity) {
  const workspace = join(trunk.fixture, name);
  const selected = await selectOwnedWorkspace({
    repository: trunk.integration,
    origin: trunk.origin,
    workspace,
    branch: `exec/${name}`,
    ...(identity === undefined ? {} : { identity }),
  });
  assert.equal(selected.ok, true, selected.recovery?.error);
  return selected;
}

test("a workspace created for an identity records that identity at its starting revision", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const selected = await select(trunk, "exec-a", identityA);
  assert.equal(selected.created, true);
  assert.deepEqual(
    await createdForRecords(selected.workspace),
    createdFor(identityA, selected.startingRevision),
  );
  // The record belongs to the created worktree alone.
  assert.deepEqual(await createdForRecords(trunk.integration), []);
});

test("a workspace created without an identity has no creation record", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const selected = await select(trunk, "exec-none");
  assert.equal(selected.created, true);
  assert.deepEqual(await createdForRecords(selected.workspace), []);
});

test("a workspace created for an identity Git rejects as a ref name is created with no record", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const selected = await select(trunk, "exec-invalid", "SEED-B#b..not-a-ref");
  assert.equal(selected.created, true);
  assert.deepEqual(await createdForRecords(selected.workspace), []);
});

test("a reused workspace keeps its creation record and records no new work", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const created = await select(trunk, "exec-reused", identityA);
  const reused = await select(trunk, "exec-reused", identityB);
  assert.equal(reused.created, false);
  assert.deepEqual(
    await createdForRecords(reused.workspace),
    createdFor(identityA, created.startingRevision),
  );
});

test("a queued Take's created workspace records the taken identity", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const { receipt, workspace } = await startCliResult(trunk, "trunk");
  assert.equal(receipt.status, "published", JSON.stringify(receipt));
  assert.equal(receipt.created, true);
  assert.deepEqual(
    await createdForRecords(workspace),
    createdFor(identityA, trunk.trunkSha),
  );
  assert.deepEqual(await createdForRecords(trunk.integration), []);
});
