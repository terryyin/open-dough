// The agent names, their rotation, and their identity on disk and in Git.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agentIdentity,
  agentNames,
  agentRotationFor,
  nerdAgentNames,
  profileAgentName,
  selectAgentName,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

test("rotation holds 29 distinct names starting at Yui and ending at Rina", () => {
  assert.equal(agentNames.length, 29);
  assert.equal(new Set(agentNames).size, 29);
  assert.equal(agentNames[1], "Akiho");
  assert.equal(agentNames.at(-1), "Rina");
});

test("rotation follows the most recently added name and skips held names", () => {
  assert.equal(selectAgentName(undefined, []), "Yui");
  assert.equal(selectAgentName("Yui", []), "Akiho");
  assert.equal(selectAgentName("Yui", ["Yui", "Akiho"]), "Yuma");
  assert.equal(selectAgentName("Koharu", ["Rina"]), "Yui");
  assert.equal(selectAgentName("Rina", []), "Yui");
  assert.equal(selectAgentName("Rina", ["Yui", "Akiho"]), "Yuma");
  assert.equal(selectAgentName(undefined, ["Yui"]), "Akiho");
});

test("a released most recent name is not reused while others are free", () => {
  // Akiho was the latest profile added and has since been released.
  assert.equal(selectAgentName("Akiho", ["Yui"]), "Yuma");
  const allButAkiho = agentNames.filter((name) => name !== "Akiho");
  assert.equal(selectAgentName("Akiho", allButAkiho), "Akiho");
});

test("rotation offers no name when every name is held", () => {
  assert.equal(selectAgentName(undefined, [...agentNames]), undefined);
  assert.equal(selectAgentName("Maki", [...agentNames]), undefined);
});

test("only rotation profile files name an agent", () => {
  assert.equal(profileAgentName("akiho-chan.json"), "Akiho");
  assert.equal(profileAgentName("Akiho-chan.json"), undefined);
  assert.equal(profileAgentName("notes.md"), undefined);
});

test("agent identity spells name, email, and profile path", () => {
  assert.deepEqual(agentIdentity("Akiho"), {
    name: "Akiho",
    agent: "Akiho-chan",
    email: "akiho-chan@example.org",
    path: "agents/akiho-chan.json",
  });
  assert.throws(() => agentIdentity("Nobody"), /unknown agent name/);
});

test("every collection's names are recognized as agents", () => {
  assert.deepEqual(agentIdentity("stanly"), {
    name: "stanly",
    agent: "stanly-chan",
    email: "stanly-chan@example.org",
    path: "agents/stanly-chan.json",
  });
  assert.equal(agentIdentity("ziqing").path, "agents/ziqing-chan.json");
  assert.equal(profileAgentName("d.kanai-chan.json"), "d.kanai");
  assert.equal(nerdAgentNames.length, 30);
  const lower = [...agentNames, ...nerdAgentNames].map((n) => n.toLowerCase());
  assert.equal(new Set(lower).size, lower.length);
});

test("the nerds setting selects the nerds rotation, and only true does", () => {
  assert.equal(agentRotationFor(undefined).names, agentNames);
  assert.equal(agentRotationFor("{}").names, agentNames);
  assert.equal(agentRotationFor('{"nerds":true}').names, nerdAgentNames);
  for (const text of ['{"nerds":"yes"}', '{"nerds":false}', "{oops"]) {
    const read = agentRotationFor(text);
    assert.equal(read.ok, false, text);
    assert.match(read.error, /\.planning\/open-dough\.json/);
  }
  assert.match(agentRotationFor('{"nerds":"yes"}').error, /"nerds"/);
});

test("nerds rotation starts at terry, also after a current-rotation profile", () => {
  assert.equal(selectAgentName(undefined, [], nerdAgentNames), "terry");
  assert.equal(selectAgentName("Yui", ["Yui"], nerdAgentNames), "terry");
  assert.equal(selectAgentName("terry", ["terry"], nerdAgentNames), "stanly");
  assert.equal(
    selectAgentName("joey", [...nerdAgentNames], nerdAgentNames),
    undefined,
  );
});
