// Preparation announcement through the production `start` command: what
// remote trunk holds at the announcement SHA, default-checkout refresh,
// continuation by a second preparation skill, and shared rotation with
// execution, including a rival taking the selected name.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { renderAgentProfile } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { startCliResult } from "../../dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import {
  backlogFile,
  createPreparationTrunk,
  createWorkspace,
  identityC,
  lsRemoteSha,
  profileOf,
  publishAssignment,
  read,
  refineStoryC,
  remoteChanges,
  remoteFile,
  remoteProfileNames,
  revParse,
  seedC,
  startPreparation,
} from "./preparation-assignment-test-fixtures.mjs";
import {
  raceNextPush,
  snapshot,
} from "./preparation-assignment-recovery-fixtures.mjs";

test("the announcement publishes only the assignment before draft work, refreshes a clean default checkout, and a later preparation skill continues it", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const { workspace } = await createWorkspace(trunk, "c");
  const queue = await remoteFile(trunk, "main", backlogFile);

  const { code, receipt } = await startPreparation(
    trunk,
    workspace,
    identityC,
    ["--host", "claude", "--model", "claude-opus-5-5"],
  );
  assert.equal(code, 0, JSON.stringify(receipt));
  assert.equal(receipt.status, "announced");
  assert.equal(receipt.agent, "Yui-chan");
  const announced = receipt.publishedSha;
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), announced);
  assert.equal(receipt.allocation, announced);
  assert.equal(await revParse(trunk.origin, `${announced}^`), trunk.trunkSha);
  assert.deepEqual(await remoteChanges(trunk, announced), [
    "A\t.planning/agents/yui-chan.json",
  ]);
  assert.equal(await remoteFile(trunk, announced, backlogFile), queue);
  assert.deepEqual(
    JSON.parse(await remoteFile(trunk, announced, profileOf("Yui"))),
    {
      schemaVersion: 1,
      agent: "Yui-chan",
      email: "yui-chan@example.org",
      activity: "preparation",
      identity: identityC,
      host: "claude",
      model: "claude-opus-5-5",
    },
  );
  assert.equal(receipt.refresh.result, "advanced");
  assert.equal(await revParse(trunk.integration, "HEAD"), announced);

  // Refinement writes its draft; slice planning then starts in the same
  // workspace and keeps the assignment without publishing anything.
  refineStoryC(workspace);
  const draft = read(workspace, seedC);
  const again = await startPreparation(trunk, workspace, identityC, [
    "--host",
    "codex",
  ]);
  assert.equal(again.code, 0, JSON.stringify(again.receipt));
  assert.equal(again.receipt.status, "continued");
  assert.equal(again.receipt.agent, "Yui-chan");
  assert.equal(again.receipt.allocation, announced);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), announced);
  assert.equal(read(workspace, seedC), draft);
  assert.doesNotMatch(await remoteFile(trunk, "main", seedC), /C is useful/);
});

// The refresh taxonomy belongs to publication-checkout-maintenance.test.mjs;
// here one pending edit shows the announcement leaves it alone.
test("a dirty default checkout is preserved and its refresh deferred while the announcement stands", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const { workspace } = await createWorkspace(trunk, "c");
  writeFileSync(join(trunk.integration, "trunk.txt"), "human edit\n");
  const before = await snapshot(trunk.integration, ["trunk.txt"]);

  const { code, receipt } = await startPreparation(trunk, workspace, identityC);
  assert.equal(code, 0, JSON.stringify(receipt));
  assert.equal(receipt.status, "announced");
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    receipt.publishedSha,
  );
  assert.notEqual(receipt.refresh.result, "advanced");
  assert.equal(receipt.refresh.reason, "pending-edit");
  assert.deepEqual(await snapshot(trunk.integration, ["trunk.txt"]), before);
});

test("preparation takes the next free name after execution and preparation assignments, and execution startup then skips it", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  // Yui executes other work; Akiho, most recently assigned, prepares story B.
  await publishAssignment(trunk, "Yui", {
    identity: "SEED-X#x",
    mode: "trunk",
    branch: "origin/main",
  });
  await publishAssignment(trunk, "Akiho", {
    identity: "SEED-B#b",
    activity: "preparation",
  });
  const { workspace } = await createWorkspace(trunk, "c");
  const { receipt } = await startPreparation(trunk, workspace, identityC);
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.equal(receipt.agent, "Yuma-chan");

  const execution = await startCliResult(trunk, "trunk");
  assert.equal(execution.receipt.ok, true, JSON.stringify(execution.receipt));
  assert.equal(execution.receipt.agent, "Sola-chan");
  assert.deepEqual(await remoteProfileNames(trunk), [
    ".planning/agents/akiho-chan.json",
    ".planning/agents/sola-chan.json",
    ".planning/agents/yui-chan.json",
    ".planning/agents/yuma-chan.json",
  ]);
  assert.equal(
    JSON.parse(await remoteFile(trunk, "main", profileOf("Yuma"))).activity,
    "preparation",
  );
});

test("when a rival claims the selected name during the push, the announcement is rebuilt on the new trunk under the next free name", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const { workspace } = await createWorkspace(trunk, "c");
  // Before the first push leaves, another developer publishes Yui-chan.
  const rivalYui = renderAgentProfile({
    name: "Yui",
    identity: "SEED-B#b",
    activity: "preparation",
  });
  await raceNextPush(trunk, trunk.integration, {
    [profileOf("Yui")]: rivalYui,
  });

  const { receipt } = await startPreparation(trunk, workspace, identityC);
  assert.equal(receipt.status, "announced", JSON.stringify(receipt));
  assert.equal(receipt.agent, "Akiho-chan");
  const tip = await lsRemoteSha(trunk.origin, "refs/heads/main");
  assert.equal(receipt.publishedSha, tip);
  assert.deepEqual(await remoteChanges(trunk, tip), [
    "A\t.planning/agents/akiho-chan.json",
  ]);
  assert.equal(await remoteFile(trunk, "main", profileOf("Yui")), rivalYui);
  assert.equal(await revParse(workspace, "HEAD"), tip);
});
