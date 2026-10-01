// One-shot refinement through the installed `preparation-assignment.mjs
// start --one-shot` and the installed preparation recorder, against a real
// bare origin: the workspace is established at fetched trunk with nothing
// published, the refined result and its recorded facts wait committed in the
// workspace for review, a not-ready record can be repaired, a competing
// holder refuses the start, and an established assigned preparation still
// continues under its assignment.
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  backlogFile,
  createPreparationTrunk,
  createWorkspace,
  git,
  identityC,
  lsRemoteSha,
  publishAssignment,
  read,
  refineStoryC,
  remoteFile,
  remoteProfileNames,
  revParse,
  seedC,
} from "./preparation-assignment-test-fixtures.mjs";
import {
  oneShot,
  originRefs,
  publishNotReady,
  recordNotReady,
  recordRefined,
  start,
  stateBlock,
  useInstalledPayload,
} from "./one-shot-refinement-test-fixtures.mjs";
import {
  parseBacklog,
  queueHeading,
} from "../../dough-product-backlog/scripts/product-backlog-document.mjs";
import { configureDeveloper } from "../../dough-execute-plan/scripts/workspace-publication-startup-test-fixtures.mjs";

useInstalledPayload();

test("one-shot refinement of an unrefined queued story establishes its workspace without publishing, and its refined facts wait committed for review", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const refs = await originRefs(trunk);
  const queue = await remoteFile(trunk, "main", backlogFile);
  assert.equal(await stateBlock(trunk.integration, "HEAD"), null);
  const workspace = join(trunk.fixture, "prep-one-shot");

  const { code, receipt } = await oneShot(trunk, workspace, "prep/one-shot");
  assert.equal(code, 0, JSON.stringify(receipt));
  assert.deepEqual(
    { ...receipt, refresh: receipt.refresh.result },
    {
      ok: true,
      status: "prepared",
      tracking: "one-shot",
      identity: identityC,
      workspace,
      branch: "prep/one-shot",
      startingRevision: trunk.trunkSha,
      created: true,
      refresh: "already current",
    },
  );
  assert.equal(await revParse(workspace, "HEAD"), trunk.trunkSha);
  assert.equal(await originRefs(trunk), refs);

  // Refinement writes its seed, the installed recorder records its facts, and
  // the result is committed with plain `git commit` in the workspace.
  refineStoryC(workspace);
  await recordRefined(workspace);
  await git(workspace, "commit", "--quiet", "-am", "Refine story C");
  const result = await revParse(workspace, "HEAD");

  assert.equal(await revParse(workspace, `${result}^`), trunk.trunkSha);
  assert.deepEqual(
    (
      await git(workspace, "show", "--name-only", "--format=", result)
    ).stdout.trim(),
    seedC,
  );
  assert.deepEqual(await stateBlock(workspace, result), {
    schemaVersion: 1,
    refinement: "refined",
    approach: "unselected",
  });
  assert.match(read(workspace, seedC), /C is useful/);
  // The queue is the same in the result and on the remote: story C stays in
  // the Backlog list, neither Taken nor completed.
  assert.equal(
    (await git(workspace, "show", `${result}:${backlogFile}`)).stdout,
    queue,
  );
  assert.equal(
    parseBacklog(queue).entries.find(({ identity }) => identity === identityC)
      .list,
    queueHeading,
  );
  // Nothing was published: no push, assignment profile, or Preparing story.
  assert.equal(await originRefs(trunk), refs);
  assert.equal(await remoteFile(trunk, "main", backlogFile), queue);
  assert.doesNotMatch(await remoteFile(trunk, "main", seedC), /C is useful/);
  assert.deepEqual(await remoteProfileNames(trunk), []);
  assert.deepEqual(
    (
      await git(
        workspace,
        "ls-tree",
        "--name-only",
        result,
        ".planning/agents/",
      )
    ).stdout,
    "",
  );
});

test("one-shot refinement accepts recorded not-ready preparation and repairs it without inventing readiness", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const notReady = await publishNotReady(trunk, "key examples are unresolved");
  assert.equal(
    (await stateBlock(trunk.integration, notReady)).assessment,
    "not-ready",
  );
  const refs = await originRefs(trunk);
  const queue = await remoteFile(trunk, "main", backlogFile);
  const workspace = join(trunk.fixture, "prep-repair");

  const { code, receipt } = await oneShot(trunk, workspace, "prep/repair");
  assert.equal(code, 0, JSON.stringify(receipt));
  assert.equal(receipt.status, "prepared");
  assert.equal(receipt.startingRevision, notReady);

  // The repair resolves the examples; readiness is reassessed truthfully: an
  // unselected approach still blocks it.
  writeFileSync(
    join(workspace, seedC),
    read(workspace, seedC).replace(
      "1. It works.\n",
      "1. It works.\n2. It fails clearly.\n",
    ),
  );
  const basis = await recordNotReady(workspace, "approach is unselected");
  await git(workspace, "commit", "--quiet", "-am", "Repair story C");

  const block = await stateBlock(workspace, "HEAD");
  assert.equal(block.refinement, "refined");
  assert.equal(block.approach, "unselected");
  assert.equal(block.assessment, "not-ready");
  assert.deepEqual(block.reasons, ["approach is unselected"]);
  assert.equal(block.basis.document, basis.document);
  assert.equal(
    (await git(workspace, "show", `HEAD:${backlogFile}`)).stdout,
    queue,
  );
  assert.equal(await originRefs(trunk), refs);
  assert.deepEqual((await stateBlock(trunk.origin, "main")).reasons, [
    "key examples are unresolved",
  ]);
  assert.deepEqual(await remoteProfileNames(trunk), []);
});

test("a competing holder or automatic landing without publication authority refuses one-shot refinement before any workspace exists", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const workspace = join(trunk.fixture, "prep-refused");

  const refused = await oneShot(trunk, workspace, "prep/refused", [
    "--auto-land",
  ]);
  assert.equal(refused.code, 1, JSON.stringify(refused.receipt));
  assert.equal(refused.receipt.status, "authority-required");
  assert.match(refused.receipt.error, /trunk publication authority/);

  await publishAssignment(trunk, "Yui", {
    identity: identityC,
    activity: "preparation",
  });
  const refs = await originRefs(trunk);
  const { code, receipt } = await oneShot(trunk, workspace, "prep/refused");
  assert.equal(code, 1, JSON.stringify(receipt));
  assert.equal(receipt.status, "source-refused");
  assert.match(
    receipt.error,
    /held on fetched trunk by Yui-chan for preparation/,
  );
  assert.equal(existsSync(workspace), false);
  assert.equal(
    (await git(trunk.integration, "branch", "--list", "prep/refused")).stdout,
    "",
  );
  assert.equal(await originRefs(trunk), refs);
});

test("an established assigned preparation keeps its assignment: one-shot is refused in its workspace and the assigned start continues", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const { workspace } = await createWorkspace(trunk, "c");
  await configureDeveloper(trunk.integration);
  const announced = await start(trunk, workspace, ["--push-authorized"]);
  assert.equal(announced.receipt.status, "announced");
  const tip = announced.receipt.publishedSha;

  const { code, receipt } = await oneShot(trunk, workspace);
  assert.equal(code, 1, JSON.stringify(receipt));
  assert.equal(receipt.status, "workspace-assigned");
  assert.equal(receipt.allocation, tip);
  assert.match(receipt.error, /continue it with start without --one-shot/);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);

  const again = await start(trunk, workspace, ["--push-authorized"]);
  assert.equal(again.receipt.status, "continued");
  assert.equal(again.receipt.allocation, tip);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
});
