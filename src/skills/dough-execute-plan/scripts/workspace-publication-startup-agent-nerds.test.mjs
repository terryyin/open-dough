// The project's `nerds` setting at trunk selects the rotation a real startup
// Take draws its agent from. Rotation rules are owned by
// tests/support/product-backlog-agent-profile.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../../tests/support/queued-repository.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import { git, lsRemoteSha } from "./publication-test-fixtures.mjs";
import {
  identityA,
  identityB,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { nerdAgentNames } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

const settingsPath = ".planning/open-dough.json";

function holdsYui() {
  return makeMe.anAgentProfile
    .executing({ name: "Yui", identity: identityB })
    .please();
}

async function takenAgent(trunk, name, identity = identityA) {
  const { receipt } = await startCliResult(trunk, "trunk", [], {
    name,
    identity,
  });
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  return receipt.agent;
}

test("without the setting the current rotation continues", async (t) => {
  const trunk = await materializeRepository(
    queuedReadyRepository()
      .withRevision("hold Yui", { agentProfiles: [holdsYui()] })
      .please(),
  );
  t.after(trunk.cleanup);
  assert.equal(await takenAgent(trunk, "a"), "Akiho-chan");
});

test("nerds true at trunk gives terry first, then the next free nerds name", async (t) => {
  const trunk = await materializeRepository(
    queuedReadyRepository()
      .withRevision("enable nerds", {
        files: { [settingsPath]: '{"nerds":true}\n' },
      })
      .please(),
  );
  t.after(trunk.cleanup);
  assert.equal(await takenAgent(trunk, "a"), "terry-chan");
  assert.equal(await takenAgent(trunk, "b", identityB), "stanly-chan");
});

test("a current-rotation profile stays held when nerds is set, and the next agent is a nerd", async (t) => {
  const trunk = await materializeRepository(
    queuedReadyRepository()
      .withRevision("hold Yui", { agentProfiles: [holdsYui()] })
      .withRevision("enable nerds", {
        files: { [settingsPath]: '{"nerds":true}\n' },
      })
      .please(),
  );
  t.after(trunk.cleanup);
  assert.equal(await takenAgent(trunk, "a"), "terry-chan");
  const held = (
    await git(
      trunk.origin,
      "ls-tree",
      "--name-only",
      "main",
      ".planning/agents/",
    )
  ).stdout;
  assert.match(held, /yui-chan\.json/);
});

for (const [label, text] of [
  ["a non-true value", '{"nerds":"yes"}'],
  ["unparseable JSON", "{nope"],
]) {
  test(`${label} refuses the Take, naming the file and key, and publishes nothing`, async (t) => {
    const trunk = await materializeRepository(
      queuedReadyRepository()
        .withRevision("invalid setting", {
          files: { [settingsPath]: text },
        })
        .please(),
    );
    t.after(trunk.cleanup);
    const before = await lsRemoteSha(trunk.origin, "refs/heads/main");
    const { receipt } = await startCliResult(trunk, "trunk");
    assert.equal(receipt.ok, false, JSON.stringify(receipt));
    assert.equal(receipt.status, "agent-setting-invalid");
    assert.match(receipt.error, /\.planning\/open-dough\.json/);
    assert.match(receipt.error, /"nerds"/);
    assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), before);
  });
}

test("every nerds name held stops with the every-name-held refusal", async (t) => {
  const trunk = await materializeRepository(
    queuedReadyRepository()
      .withRevision("enable nerds", {
        files: { [settingsPath]: '{"nerds":true}\n' },
      })
      .withRevision("all nerds held", {
        agentProfiles: nerdAgentNames.map((name) =>
          makeMe.anAgentProfile
            .executing({ name, identity: identityB })
            .please(),
        ),
      })
      .please(),
  );
  t.after(trunk.cleanup);
  const { receipt } = await startCliResult(trunk, "trunk");
  assert.equal(receipt.status, "agent-unavailable", JSON.stringify(receipt));
  assert.match(receipt.error, /every agent name is held on remote trunk/);
  assert.equal(receipt.occupied.length, nerdAgentNames.length);
});
