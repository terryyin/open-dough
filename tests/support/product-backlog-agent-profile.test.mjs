// Published profile text and file identity, without filesystem or Git access.
import { makeMe } from "./makeMe.mjs";
import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { importedModules } from "./pure-module-imports.mjs";
import "./product-backlog-agent-rotation-cases.mjs";

const modulePath = fileURLToPath(
  new URL(
    "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs",
    import.meta.url,
  ),
);
const {
  agentReportError,
  parseAgentProfile,
  parseAgentProfileFile,
  renderAgentProfile,
} = await import(pathToFileURL(modulePath).href);

test("the profile module imports no filesystem or Node-only module", () => {
  const { specifiers } = importedModules(modulePath);
  for (const specifier of specifiers)
    assert.equal(specifier.startsWith("node:"), false, specifier);
});

test("a rendered profile leaves unreported host and model unrecorded", () => {
  const render = (report) =>
    JSON.parse(
      renderAgentProfile(
        makeMe.anAgentProfile
          .executing({
            name: "Yui",
            identity: "SEED-A#a",
            mode: "story-branch",
            branch: "exec/a",
            ...report,
          })
          .please(),
      ),
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
  const profile = makeMe.anAgentProfile
    .executing({
      name: "Akiho",
      identity: "SEED-A#a",
      mode: "trunk",
      branch: "origin/main",
      model: "gpt-x",
    })
    .please();
  assert.deepEqual(parseAgentProfile(renderAgentProfile(profile)), {
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
  const text = renderAgentProfile(
    makeMe.anAgentProfile
      .preparing({
        name: "Yuma",
        identity: "SEED-A#a",
        host: "claude",
      })
      .please(),
  );
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
  const sola = renderAgentProfile(
    makeMe.anAgentProfile
      .preparing({
        name: "Sola",
        identity: "SEED-A#a",
      })
      .please(),
  );
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
    renderAgentProfile(
      makeMe.anAgentProfile
        .executing({
          name: "Yui",
          identity: "SEED-A#a",
          mode: "trunk",
          branch: "origin/main",
        })
        .please(),
    ),
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
