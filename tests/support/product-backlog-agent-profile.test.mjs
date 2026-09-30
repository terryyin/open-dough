// Shared agent profile: rotation names, Git identity spelling, and published
// profile text, without filesystem or Git access.
import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { importedModules } from "./pure-module-imports.mjs";

const modulePath = fileURLToPath(
  new URL(
    "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs",
    import.meta.url,
  ),
);
const {
  agentIdentity,
  agentNames,
  agentReportError,
  agentRotationFor,
  nerdAgentNames,
  parseAgentProfile,
  parseAgentProfileFile,
  profileAgentName,
  renderAgentProfile,
  selectAgentName,
} = await import(pathToFileURL(modulePath).href);

test("the profile module imports no filesystem or Node-only module", () => {
  const { specifiers } = importedModules(modulePath);
  for (const specifier of specifiers)
    assert.equal(specifier.startsWith("node:"), false, specifier);
});

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

test("a rendered profile leaves unreported host and model unrecorded", () => {
  const render = (report) =>
    JSON.parse(
      renderAgentProfile({
        name: "Yui",
        identity: "SEED-A#a",
        mode: "story-branch",
        branch: "exec/a",
        ...report,
      }),
    );
  assert.deepEqual(render({ host: "codex", model: "gpt-x" }), {
    schemaVersion: 1,
    agent: "Yui-chan",
    email: "yui-chan@example.org",
    identity: "SEED-A#a",
    mode: "story-branch",
    branch: "exec/a",
    host: "codex",
    model: "gpt-x",
  });
  const partial = render({});
  assert.equal("host" in partial, false);
  assert.equal("model" in partial, false);
});

test("reported host and model must be recordable", () => {
  assert.equal(agentReportError({}), undefined);
  assert.match(agentReportError({ host: "vim" }), /host must be one of/);
  assert.match(agentReportError({ model: " " }), /model must be non-empty/);
  assert.throws(
    () =>
      renderAgentProfile({
        name: "Yui",
        identity: "SEED-A#a",
        mode: "trunk",
        branch: "origin/main",
        host: "vim",
      }),
    /host must be one of/,
  );
});

test("a published profile reads back into the facts it was rendered from", () => {
  const facts = {
    name: "Akiho",
    identity: "SEED-A#a",
    mode: "trunk",
    branch: "origin/main",
    model: "gpt-x",
  };
  assert.deepEqual(parseAgentProfile(renderAgentProfile(facts)), {
    ok: true,
    profile: { ...facts, activity: "execution" },
  });
});

test("an execution profile keeps its original spelling and reads as execution with or without an activity", () => {
  const facts = {
    name: "Yui",
    identity: "SEED-A#a",
    mode: "trunk",
    branch: "origin/main",
  };
  const legacy = renderAgentProfile(facts);
  assert.equal("activity" in JSON.parse(legacy), false);
  const spelled = JSON.stringify({
    ...JSON.parse(legacy),
    activity: "execution",
  });
  for (const text of [legacy, spelled])
    assert.deepEqual(parseAgentProfile(text), {
      ok: true,
      profile: { ...facts, activity: "execution" },
    });
});

test("a preparation profile records its activity and no execution mode or branch", () => {
  const text = renderAgentProfile({
    name: "Yuma",
    identity: "SEED-A#a",
    activity: "preparation",
    host: "claude",
  });
  assert.deepEqual(JSON.parse(text), {
    schemaVersion: 1,
    agent: "Yuma-chan",
    email: "yuma-chan@example.org",
    activity: "preparation",
    identity: "SEED-A#a",
    host: "claude",
  });
  assert.deepEqual(parseAgentProfile(text), {
    ok: true,
    profile: {
      name: "Yuma",
      identity: "SEED-A#a",
      activity: "preparation",
      host: "claude",
    },
  });
  assert.throws(
    () =>
      renderAgentProfile({
        name: "Yuma",
        identity: "SEED-A#a",
        activity: "preparation",
        mode: "trunk",
        branch: "origin/main",
      }),
    /preparation profile records no execution mode or branch/,
  );
  const withBranch = JSON.stringify({ ...JSON.parse(text), branch: "x" });
  assert.match(parseAgentProfile(withBranch).error, /no execution mode/);
});

test("a profile read at its file is unreadable when its text names another agent", () => {
  const sola = renderAgentProfile({
    name: "Sola",
    identity: "SEED-A#a",
    activity: "preparation",
  });
  assert.deepEqual(
    parseAgentProfileFile("sola-chan.json", sola),
    parseAgentProfile(sola),
  );
  for (const fileName of ["yui-chan.json", "notes.json"])
    assert.deepEqual(parseAgentProfileFile(fileName, sola), {
      ok: false,
      error: "profile names another agent",
    });
  assert.match(parseAgentProfileFile("yui-chan.json", "{").error, /not JSON/);
});

test("an unreadable profile says why instead of yielding facts", () => {
  const valid = JSON.parse(
    renderAgentProfile({
      name: "Yui",
      identity: "SEED-A#a",
      mode: "trunk",
      branch: "origin/main",
    }),
  );
  const read = (changes) =>
    parseAgentProfile(JSON.stringify({ ...valid, ...changes }));
  assert.match(parseAgentProfile("{").error, /not JSON/);
  assert.match(read({ schemaVersion: 2 }).error, /schemaVersion/);
  assert.match(read({ agent: "agent-Nobody" }).error, /unknown agent/);
  assert.match(read({ email: "x@example.org" }).error, /email/);
  assert.match(read({ identity: "" }).error, /identity/);
  assert.match(read({ mode: "solo" }).error, /execution mode/);
  assert.match(read({ activity: "idle" }).error, /assignment activity/);
  assert.match(read({ branch: "" }).error, /branch/);
  assert.match(read({ host: "vim" }).error, /host must be one of/);
});

test("every collection's names are recognized as agents", () => {
  assert.deepEqual(agentIdentity("stanly"), {
    name: "stanly",
    agent: "stanly-chan",
    email: "stanly-chan@example.org",
    path: "agents/stanly-chan.json",
  });
  assert.equal(agentIdentity("ZiQingLau").path, "agents/ziqinglau-chan.json");
  assert.equal(profileAgentName("d.kanai-chan.json"), "d.kanai");
  assert.equal(nerdAgentNames.length, 26);
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
