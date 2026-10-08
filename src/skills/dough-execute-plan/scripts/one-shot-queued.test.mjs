// Queued one-shot work: the start prepares an owned workspace and publishes
// nothing unless another owner holds the story or its recorded preparation is
// not-ready; the result, its backlog completion and its spent story and plan
// wait there for review, and an explicit landing delivers them to remote trunk
// as one commit under the delivery's ownership guard, with no Taken
// transition and unfinished siblings intact.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import {
  backlog,
  backlogFile,
  commitQueuedResult,
  createSiblingTrunk,
  deliverQueued,
  identityB,
  identityB2,
  planB,
  queuedDelivery,
  remoteCommitsSince,
  remoteLists,
  remoteText,
  rivalPreparation,
  seedB,
  startQueuedOneShot,
  trunkTarget,
} from "./one-shot-queued-test-fixtures.mjs";
import {
  createdFor,
  createdForRecords,
  git,
  lsRemoteSha,
  remoteHeads,
  revParse,
} from "./publication-test-fixtures.mjs";

const changedPaths = async (origin, sha) =>
  (await git(origin, "show", "--name-only", "--format=", sha)).stdout
    .trim()
    .split("\n")
    .sort();
// The done record B's backlog completion writes beside the backlog, and the
// done catalog that completion rebuilds beside it.
const doneRecordB = ".planning/done/SEED-B_b.json";
const doneCatalog = ".planning/done/.catalog.json";

test("a queued story's result and spent records reach remote trunk as one commit, siblings intact", async (t) => {
  const trunk = await createSiblingTrunk();
  t.after(trunk.cleanup);
  const headsBefore = await remoteHeads(trunk.origin);

  const started = await startQueuedOneShot(trunk);
  assert.equal(started.receipt.ok, true, started.stdout);
  assert.equal(started.receipt.status, "prepared");
  assert.equal(started.receipt.startingRevision, trunk.trunkSha);
  assert.equal(await remoteHeads(trunk.origin), headsBefore);
  assert.deepEqual(
    await createdForRecords(started.workspace),
    createdFor(identityB, trunk.trunkSha),
  );

  const result = await commitQueuedResult(started.workspace);
  const fixture = await queuedDelivery(trunk, started.workspace);
  const { delivered, stderr } = await deliverQueued(
    fixture,
    started.receipt.startingRevision,
  );
  assert.equal(delivered?.ok, true, stderr);
  assert.equal(delivered.receipt.sha, result);

  // Exactly one commit: result and cleanup together, no Take before it.
  assert.deepEqual(await remoteCommitsSince(trunk.origin, trunk.trunkSha), [
    result,
  ]);
  assert.deepEqual(
    await changedPaths(trunk.origin, result),
    [backlogFile, doneCatalog, doneRecordB, seedB, planB, "feature.txt"].sort(),
  );
  assert.deepEqual(await remoteLists(trunk), {
    taken: [],
    queued: ["SEED-A#a", identityB2],
  });
  const seed = await remoteText(trunk, "main", seedB);
  assert.match(seed, /### Story B2\n\n\*\*Identity:\*\* SEED-B#b2/);
  assert.doesNotMatch(seed, /### Story B\n/);
  assert.equal(
    (
      await git(trunk.origin, "ls-tree", "-r", "--name-only", "main", "--")
    ).stdout.includes(".planning/agents/"),
    false,
  );
});

test("an unrelated remote queue change survives reconciliation of the guarded result", async (t) => {
  const trunk = await createSiblingTrunk();
  t.after(trunk.cleanup);
  const started = await startQueuedOneShot(trunk);
  assert.equal(started.receipt.ok, true, started.stdout);
  const result = await commitQueuedResult(started.workspace);

  // Another developer moves B2 ahead of A on remote trunk.
  await backlog(
    trunk.integration,
    "place",
    "--identity",
    identityB2,
    "--position",
    "first",
  );
  await git(trunk.integration, "commit", "-qam", "prioritize B2");
  await git(trunk.integration, "push", "-q", "origin", "main");
  const reordered = await lsRemoteSha(trunk.origin, trunkTarget);

  const fixture = await queuedDelivery(trunk, started.workspace);
  const reconciled = await deliverQueued(
    fixture,
    started.receipt.startingRevision,
  );
  assert.equal(
    reconciled.delivered?.status,
    "needs-validation",
    reconciled.stderr,
  );
  // The rebased candidate is validated, then delivered as held proof.
  const delivered = await deliverQueued(fixture, reordered, [
    "--validated-candidate",
    reconciled.delivered.candidate,
  ]);
  assert.equal(delivered.delivered?.ok, true, delivered.stderr);
  const accepted = delivered.delivered.receipt.sha;
  assert.notEqual(accepted, result);
  assert.deepEqual(await remoteCommitsSince(trunk.origin, reordered), [
    accepted,
  ]);
  assert.deepEqual(await remoteLists(trunk), {
    taken: [],
    queued: [identityB2, "SEED-A#a"],
  });
});

test("a queued no-change conclusion retains its closure for review until an explicit landing publishes it under the guard", async (t) => {
  const trunk = await createSiblingTrunk();
  t.after(trunk.cleanup);
  const headsBefore = await remoteHeads(trunk.origin);
  const started = await startQueuedOneShot(trunk, { pushAuthorized: false });
  assert.equal(started.receipt.ok, true, started.stdout);

  const cleanup = await commitQueuedResult(started.workspace, {
    result: false,
  });
  // Stopped for review: remote trunk still lists B queued and untaken while
  // its closure waits in the retained workspace.
  assert.equal(await remoteHeads(trunk.origin), headsBefore);
  assert.deepEqual(await remoteLists(trunk), {
    taken: [],
    queued: ["SEED-A#a", identityB, identityB2],
  });
  assert.equal(await revParse(started.workspace, "HEAD"), cleanup);

  const fixture = await queuedDelivery(trunk, started.workspace);
  const { delivered, stderr } = await deliverQueued(
    fixture,
    started.receipt.startingRevision,
  );
  assert.equal(delivered?.ok, true, stderr);
  assert.deepEqual(await remoteCommitsSince(trunk.origin, trunk.trunkSha), [
    cleanup,
  ]);
  assert.deepEqual(
    await changedPaths(trunk.origin, cleanup),
    [backlogFile, doneCatalog, doneRecordB, seedB, planB].sort(),
  );
  assert.deepEqual((await remoteLists(trunk)).queued, ["SEED-A#a", identityB2]);
});

test("a queued start refuses a preparing holder or a recorded not-ready reason without creating a workspace", async (t) => {
  const trunk = await createSiblingTrunk();
  t.after(trunk.cleanup);

  await rivalPreparation(trunk);
  const preparing = await startQueuedOneShot(trunk, { name: "preparing" });
  assert.equal(preparing.code, 1, preparing.stdout);
  assert.equal(preparing.receipt.status, "source-refused");
  assert.match(
    preparing.receipt.error,
    /held on fetched trunk by .* for preparation/,
  );
  assert.equal(existsSync(preparing.workspace), false);

  // A recorded not-ready assessment of sibling B2 refuses it too.
  const { integration } = trunk;
  await git(integration, "pull", "-q", "--ff-only", "origin", "main");
  const link = "seeds/B.md#b2";
  const record = (...args) =>
    backlog(
      integration,
      "record-state",
      "--identity",
      identityB2,
      "--link",
      link,
      "--refinement",
      "refined",
      "--approach",
      "planless",
      ...args,
    );
  await record();
  const { basis } = JSON.parse(
    (await backlog(integration, "read-state", "--link", link)).stdout,
  );
  await record(
    "--assessment",
    "not-ready",
    "--expect-document",
    basis.document,
    "--reason",
    "needs a product decision",
  );
  await git(integration, "commit", "-qam", "assess B2 not-ready");
  await git(integration, "push", "-q", "origin", "main");
  const headsBefore = await remoteHeads(trunk.origin);
  const notReady = await startQueuedOneShot(trunk, {
    name: "not-ready",
    identity: identityB2,
  });
  assert.equal(notReady.code, 1, notReady.stdout);
  assert.equal(notReady.receipt.status, "source-refused");
  assert.match(
    notReady.receipt.error,
    /recorded preparation is not-ready: needs a product decision/,
  );
  assert.equal(existsSync(notReady.workspace), false);
  assert.equal(await remoteHeads(trunk.origin), headsBefore);
});
