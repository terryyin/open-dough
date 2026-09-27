// `product-backlog-git-merge.mjs` in an agent's owned workspace: the merge
// commit it makes is authored by the agent and credits the configured
// developer once, and an unusable developer leaves the accepted merge
// uncommitted until `continue` runs with a usable one. Real Git in a scratch
// repository's linked worktree, asserted on the resulting commit.
import assert from "node:assert/strict";
import { test } from "node:test";
import { configureAgentAuthorship } from "../../src/skills/dough-execute-plan/scripts/workspace-agent-authorship.mjs";
import { agentIdentity } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  commitBranch,
  headSha,
  isMidMerge,
  linkedWorktree,
  parentCount,
  run,
  scratchRepo,
} from "./product-backlog-git-fixture.mjs";

const itemA = "- [Item A](seeds/A.md#a)";
const itemB = "- [Item B](seeds/B.md#b)";
const itemC = "- [Item C](seeds/C.md#c)";

// An agent's owned workspace (a linked worktree whose own config names the
// agent as author) about to merge compatible sibling closures, with the
// developer configured as the Git user.
async function agentWorkspaceMerge(t) {
  const repo = scratchRepo(t, backlogOf([itemA, itemB], [itemC]));
  commitBranch(repo, "close-a", backlogOf([itemB], [itemC]));
  commitBranch(repo, "close-b", backlogOf([itemA], [itemC]));
  repo.git(["config", "user.name", "Dana Developer"]);
  repo.git(["config", "user.email", "dana@example.test"]);
  const worktree = linkedWorktree(t, repo, "close-a");
  await configureAgentAuthorship(worktree.directory, agentIdentity("Yui"));
  return worktree;
}

const developer = "Dana Developer <dana@example.test>";
const people = (repo) =>
  repo.git(["log", "-1", "--format=%an <%ae>|%cn <%ce>"]).trim();
const coAuthors = (repo) =>
  repo
    .git(["log", "-1", "--format=%(trailers:key=Co-authored-by,valueonly)"])
    .trim();

test("merge in an agent's owned workspace commits as the agent and credits the developer once", async (t) => {
  const worktree = await agentWorkspaceMerge(t);

  const merged = await run(worktree, ["merge", "--ref", "close-b"]);

  assert.equal(merged.code, 0, merged.stdout + merged.stderr);
  assert.match(merged.stdout, /accepted/);
  assert.equal(parentCount(worktree), 2, "a real merge commit was made");
  assert.equal(
    people(worktree),
    `Yui-chan <yui-chan@example.org>|${developer}`,
  );
  assert.equal(coAuthors(worktree), developer);
});

test("merge in an agent's owned workspace stays uncommitted when the developer is the agent itself, and continue credits the fixed developer once", async (t) => {
  const worktree = await agentWorkspaceMerge(t);
  worktree.git(["config", "--worktree", "user.email", "yui-chan@example.org"]);
  const before = headSha(worktree);

  const refused = await run(worktree, ["merge", "--ref", "close-b"]);

  assert.equal(refused.code, 1);
  assert.match(refused.stdout + refused.stderr, /agent's own/);
  assert.equal(headSha(worktree), before, "nothing was committed");
  assert.equal(isMidMerge(worktree), true, "the merge stays uncommitted");

  worktree.git(["config", "--worktree", "--unset", "user.email"]);
  const continued = await run(worktree, ["continue"]);

  assert.equal(continued.code, 0, continued.stdout + continued.stderr);
  assert.equal(isMidMerge(worktree), false, "the merge was committed");
  assert.equal(
    people(worktree),
    `Yui-chan <yui-chan@example.org>|${developer}`,
  );
  assert.equal(coAuthors(worktree), developer);
});
