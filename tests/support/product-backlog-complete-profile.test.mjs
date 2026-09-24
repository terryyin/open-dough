// Runs the real backlog CLI to complete work whose agent profiles sit beside
// the backlog, observing which profile files remain afterwards.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  backlog,
  projectFile,
  run,
  scratchProject,
  takenEntry,
  takenStory,
  trunkQueue,
} from "./product-backlog-fixture.mjs";

// Supplies only the starting precondition: one profile file per agent, each
// holding the identity given.
function profiles(project, holders) {
  const written = {};
  for (const [name, identity] of Object.entries(holders)) {
    const { path } = agentIdentity(name);
    const text =
      identity === undefined
        ? "{ not a profile"
        : renderAgentProfile({
            name,
            identity,
            mode: "trunk",
            branch: "origin/main",
          });
    projectFile(project, path, text);
    written[path] = text;
  }
  return written;
}

const agentsOf = (project) =>
  readdirSync(join(project.directory, ".planning/agents")).sort();

test("complete on a Taken entry releases its agent's profile and leaves other agents' profiles", async (t) => {
  const project = scratchProject(t);
  const written = profiles(project, {
    Akiho: takenStory,
    Yui: trunkQueue,
    Yuma: undefined,
  });

  const result = await run(project, ["complete", "--identity", takenStory]);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(project.read(), backlog.replace(`${takenEntry}\n\n`, ""));
  assert.deepEqual(agentsOf(project), ["yui-chan.json", "yuma-chan.json"]);
  for (const path of ["agents/yui-chan.json", "agents/yuma-chan.json"]) {
    assert.equal(
      readFileSync(join(project.directory, ".planning", path), "utf8"),
      written[path],
      `${path} changed`,
    );
  }
  assert.match(
    result.stdout,
    /Released agent profile agents\/akiho-chan\.json/,
  );
});

test("complete without a matching profile succeeds and leaves every profile untouched", async (t) => {
  const project = scratchProject(t);
  profiles(project, { Yui: trunkQueue });

  const result = await run(project, ["complete", "--identity", takenStory]);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(project.read(), backlog.replace(`${takenEntry}\n\n`, ""));
  assert.deepEqual(agentsOf(project), ["yui-chan.json"]);
  assert.doesNotMatch(result.stdout, /Released agent profile/);
});

test("complete in a project without agent profiles succeeds without creating any", async (t) => {
  const project = scratchProject(t);

  const result = await run(project, ["complete", "--identity", takenStory]);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(project.read(), backlog.replace(`${takenEntry}\n\n`, ""));
  assert.equal(existsSync(join(project.directory, ".planning/agents")), false);
});
