// The project's `nerds` setting at trunk selects the rotation a preparation
// announcement draws its agent from; a profile of either collection stays held.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  queuedRepositoryWithRoughStory,
  roughStoryC,
} from "../../../../tests/support/queued-repository.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import { nerdAgentNames } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  createWorkspace,
  identityC,
  lsRemoteSha,
  profileOf,
  remoteProfileNames,
  startPreparation,
} from "./preparation-assignment-test-fixtures.mjs";
import { makeMe } from "../../../../tests/support/makeMe.mjs";

async function announcedAgent(trunk) {
  const { workspace } = await createWorkspace(trunk, "c");
  const { receipt } = await startPreparation(trunk, workspace, identityC);
  assert.equal(receipt.status, "announced", JSON.stringify(receipt));
  return receipt.agent;
}

test("without the setting the current rotation continues", async (t) => {
  const trunk = await materializeRepository(
    queuedRepositoryWithRoughStory(roughStoryC)
      .withRevision("assign-yui", {
        message: "assign Yui",
        agentProfiles: [
          makeMe.anAgentProfile
            .preparing({ name: "Yui", identity: "SEED-A#a" })
            .please(),
        ],
      })
      .please(),
  );
  t.after(trunk.cleanup);
  assert.equal(await announcedAgent(trunk), "Akiho-chan");
});

test("nerds true at trunk gives terry first, then the next free nerds name", async (t) => {
  const trunk = await materializeRepository(
    queuedRepositoryWithRoughStory(roughStoryC)
      .withRevision("settings", {
        files: { ".planning/open-dough.json": '{"nerds":true}\n' },
      })
      .please(),
  );
  t.after(trunk.cleanup);
  assert.equal(await announcedAgent(trunk), "terry-chan");
});

test("a held current-rotation profile stays held when nerds is set, and the next agent is a nerd", async (t) => {
  const trunk = await materializeRepository(
    queuedRepositoryWithRoughStory(roughStoryC)
      .withRevision("assign-yui", {
        message: "assign Yui",
        agentProfiles: [
          makeMe.anAgentProfile
            .preparing({ name: "Yui", identity: "SEED-A#a" })
            .please(),
        ],
      })
      .withRevision("settings", {
        files: { ".planning/open-dough.json": '{"nerds":true}\n' },
      })
      .please(),
  );
  t.after(trunk.cleanup);
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
    const trunk = await materializeRepository(
      queuedRepositoryWithRoughStory(roughStoryC)
        .withRevision("settings", {
          files: { ".planning/open-dough.json": text },
        })
        .please(),
    );
    t.after(trunk.cleanup);
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
  let repository = queuedRepositoryWithRoughStory(roughStoryC);
  for (const name of nerdAgentNames)
    repository = repository.withRevision(`assign-${name}`, {
      message: `assign ${name}`,
      agentProfiles: [
        makeMe.anAgentProfile
          .preparing({ name, identity: "SEED-A#a" })
          .please(),
      ],
    });
  const trunk = await materializeRepository(
    repository
      .withRevision("settings", {
        files: { ".planning/open-dough.json": '{"nerds":true}\n' },
      })
      .please(),
  );
  t.after(trunk.cleanup);
  const { workspace } = await createWorkspace(trunk, "c");
  const { receipt } = await startPreparation(trunk, workspace, identityC);
  assert.equal(receipt.status, "agent-unavailable", JSON.stringify(receipt));
  assert.match(receipt.error, /every agent name is held on remote trunk/);
  assert.equal(receipt.occupied.length, nerdAgentNames.length);
});
