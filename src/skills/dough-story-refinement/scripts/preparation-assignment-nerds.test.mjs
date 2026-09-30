// The project's `nerds` setting at trunk selects the rotation a preparation
// announcement draws its agent from; a profile of either collection stays held.
import assert from "node:assert/strict";
import { test } from "node:test";
import { nerdAgentNames } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { publishSettings } from "../../dough-execute-plan/scripts/workspace-publication-startup-test-fixtures.mjs";
import {
  createPreparationTrunk,
  createWorkspace,
  identityC,
  lsRemoteSha,
  profileOf,
  publishAssignment,
  remoteProfileNames,
  startPreparation,
} from "./preparation-assignment-test-fixtures.mjs";

async function announcedAgent(trunk) {
  const { workspace } = await createWorkspace(trunk, "c");
  const { receipt } = await startPreparation(trunk, workspace, identityC);
  assert.equal(receipt.status, "announced", JSON.stringify(receipt));
  return receipt.agent;
}

test("without the setting the current rotation continues", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  await publishAssignment(trunk, "Yui", {
    identity: "SEED-A#a",
    activity: "preparation",
  });
  assert.equal(await announcedAgent(trunk), "Akiho-chan");
});

test("nerds true at trunk gives terry first, then the next free nerds name", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  await publishSettings(trunk, '{"nerds":true}\n');
  assert.equal(await announcedAgent(trunk), "terry-chan");
});

test("a held current-rotation profile stays held when nerds is set, and the next agent is a nerd", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  await publishAssignment(trunk, "Yui", {
    identity: "SEED-A#a",
    activity: "preparation",
  });
  await publishSettings(trunk, '{"nerds":true}\n');
  assert.equal(await announcedAgent(trunk), "terry-chan");
  assert.deepEqual((await remoteProfileNames(trunk)).sort(), [
    profileOf("terry"),
    profileOf("Yui"),
  ]);
});

for (const [label, text] of [
  ["a non-true value", '{"nerds":"yes"}'],
  ["unparseable JSON", "{nope"],
]) {
  test(`${label} refuses the announcement, naming the file and key`, async (t) => {
    const trunk = await createPreparationTrunk();
    t.after(trunk.cleanup);
    await publishSettings(trunk, text);
    const tip = await lsRemoteSha(trunk.origin, "refs/heads/main");
    const { workspace } = await createWorkspace(trunk, "c");
    const { code, receipt } = await startPreparation(
      trunk,
      workspace,
      identityC,
    );
    assert.equal(code, 1);
    assert.equal(
      receipt.status,
      "agent-setting-invalid",
      JSON.stringify(receipt),
    );
    assert.match(receipt.error, /\.planning\/open-dough\.json/);
    assert.match(receipt.error, /"nerds"/);
    assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
  });
}

test("every nerds name held stops with the every-name-held refusal", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  for (const name of nerdAgentNames)
    await publishAssignment(trunk, name, {
      identity: "SEED-A#a",
      activity: "preparation",
    });
  await publishSettings(trunk, '{"nerds":true}\n');
  const { workspace } = await createWorkspace(trunk, "c");
  const { receipt } = await startPreparation(trunk, workspace, identityC);
  assert.equal(receipt.status, "agent-unavailable", JSON.stringify(receipt));
  assert.match(receipt.error, /every agent name is held on remote trunk/);
  assert.equal(receipt.occupied.length, nerdAgentNames.length);
});
