import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { git } from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { agentIdentity } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "./makeMe.mjs";
import { materializeRepository } from "./repository-fixture.mjs";

test("several workspaces materialize as the execution worktree and linked .worktrees under the integration checkout", async (t) => {
  const { agent, email } = agentIdentity("Yui");
  const { integration, execution, candidateSha, revisions, cleanup } =
    await materializeRepository(
      makeMe.aRepository
        .withRevision("trunk", { files: { "trunk.txt": "trunk\n" } })
        .withWorkspace("exec/story", { from: "trunk", agent })
        .withUnpublishedRevision("story slice", {
          files: { "slice.txt": "slice\n" },
        })
        .withWorkspace("exec/other", { from: "trunk", agent })
        .please(),
    );
  t.after(cleanup);
  const other = join(integration, ".worktrees", "other");
  const read = async (checkout, ...args) =>
    (await git(checkout, ...args)).stdout.trim();

  assert.equal(revisions["story slice"], candidateSha);
  assert.equal(await read(execution, "rev-parse", "HEAD"), candidateSha);
  assert.equal(await read(execution, "branch", "--show-current"), "exec/story");
  assert.equal(
    await read(execution, "config", "--worktree", "--get", "author.name"),
    agent,
  );
  assert.equal(
    await read(execution, "config", "--worktree", "--get", "author.email"),
    email,
  );
  assert.equal(await read(other, "rev-parse", "HEAD"), revisions.trunk);
  assert.equal(await read(other, "branch", "--show-current"), "exec/other");
  assert.equal(
    await read(other, "config", "--worktree", "--get", "author.name"),
    agent,
  );
});
