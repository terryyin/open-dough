// Resolved ordinary/assigned authorship contracts survive the guarded entry.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { git, revParse, remoteHeads } from "./publication-test-fixtures.mjs";
import { configureAgentAuthorship } from "./workspace-agent-authorship.mjs";
import {
  localFixture,
  planned,
} from "./execution-increment-fresh-test-fixtures.mjs";

test("resolved ordinary Git contract stays ordinary even when the checkout has configured agent authorship", async (t) => {
  const f = await localFixture(t);
  await configureAgentAuthorship(f.workspace, {
    agent: "Yui-chan",
    email: "yui-chan@example.org",
  });
  const committed = await f.fresh(f.preparation, { mode: "current-branch" });
  assert.equal(committed.code, 0);
  assert.equal(committed.result.commit.agent, undefined);
  const message = (await git(f.workspace, "log", "-1", "--format=%B")).stdout;
  assert.match(message, /Co-Authored-By: Model <model@example.test>/);
  assert.equal(message.match(/co-authored-by:/gi).length, 1);
  assert.equal(readFileSync(f.hookLog, "utf8"), "commit\n");
  assert.equal(await remoteHeads(f.origin), f.refs);
  assert.equal(existsSync(f.storage), false);
});

test("an agent commit without its assigned workspace refuses rather than falling back to ordinary Git", async (t) => {
  const f = await localFixture(t);
  f.preparation.commit = "agent";
  const refused = await f.fresh();
  assert.equal(refused.code, 1);
  assert.equal(refused.result.status, "no-workspace-agent");
  assert.equal(refused.result.operation, "commit");
  assert.equal(
    (await git(f.workspace, "show", ":work.txt")).stdout,
    "owned work\n",
  );
  await f.withheld();
});

test("successful planned preparation runs in order and delegates assigned-workspace authorship to agentCommit", async (t) => {
  const f = await localFixture(t);
  await git(f.workspace, "config", "user.name", "Dana Developer");
  await git(f.workspace, "config", "user.email", "dana@example.test");
  await configureAgentAuthorship(f.workspace, {
    agent: "Yui-chan",
    email: "yui-chan@example.org",
  });
  const p = await planned(f);
  p.commit = "agent";
  p.generation = f.logged(
    "generation",
    "fs.writeFileSync('generated.txt', 'generated\\n');",
  );
  p.formatting = f.logged("formatting");
  p.summary = f.logged(
    "summary",
    "fs.writeFileSync('summary.txt', 'summary\\n');",
  );
  p.staging.ownedPaths.push("generated.txt", "summary.txt");
  const { code, result } = await f.fresh(p);
  assert.equal(code, 0, JSON.stringify(result));
  assert.equal(result.commit.sha, await revParse(f.workspace, "HEAD"));
  assert.equal(result.commit.agent, "Yui-chan");
  assert.equal(
    readFileSync(f.operations, "utf8"),
    "generation\nformatting\nsummary\n",
  );
  assert.equal(readFileSync(f.hookLog, "utf8"), "commit\n");
  assert.equal(
    (
      await git(f.workspace, "log", "-1", "--format=%an <%ae>|%cn <%ce>")
    ).stdout.trim(),
    "Yui-chan <yui-chan@example.org>|Dana Developer <dana@example.test>",
  );
  const message = (await git(f.workspace, "log", "-1", "--format=%B")).stdout;
  assert.equal(
    message.match(/Co-authored-by: Dana Developer <dana@example.test>/gi)
      .length,
    1,
  );
  assert.match(message, /Co-Authored-By: Model <model@example.test>/);
  assert.match(
    (await git(f.workspace, "show", "HEAD:PLAN.md")).stdout,
    /accepted proof/,
  );
  assert.match(
    (await git(f.workspace, "show", "HEAD:PLAN.md")).stdout,
    /### 4\. Work 4\nType: Behavior\nStatus: done/,
  );
  assert.equal(
    (await git(f.workspace, "show", "HEAD:generated.txt")).stdout,
    "generated\n",
  );
  assert.equal(
    (await git(f.workspace, "show", "HEAD:summary.txt")).stdout,
    "summary\n",
  );
  assert.equal(existsSync(f.storage), false);
});
