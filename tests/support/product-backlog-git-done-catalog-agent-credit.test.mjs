// The catalog-only commit a rebase through the backlog adapter adds in an
// agent's owned workspace: authored by the agent and crediting the
// configured developer once, and left staged rather than committed when that
// developer is unusable. Real Git in a scratch repository's linked worktree.
import assert from "node:assert/strict";
import { test } from "node:test";
import { configureAgentAuthorship } from "../../src/skills/dough-execute-plan/scripts/workspace-agent-authorship.mjs";
import { agentIdentity } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  assertCommittedCatalogCurrent,
  catalog,
  completeAndCommit,
  completingBranch,
  fileNames,
  items,
} from "./product-backlog-git-done-catalog-fixture.mjs";
import {
  linkedWorktree,
  refSha,
  runRebase,
  scratchRepo,
} from "./product-backlog-git-fixture.mjs";

const developer = "Dana Developer <dana@example.test>";

// An agent's owned workspace on `feature`, which completed B, about to
// rebase onto `main`, which completed A and published no catalog.
async function agentWorkspaceReplay(t) {
  const repo = scratchRepo(t, backlogOf([], items("A", "B")));
  await completingBranch(repo, "feature", ["B"], "2026-10-05T10:00:00.000Z");
  await completeAndCommit(repo, "A", "2026-10-04T10:00:00.000Z");
  repo.git(["rm", "-q", catalog]);
  repo.git(["commit", "-q", "-m", "publish without a catalog"]);
  repo.git(["config", "user.name", "Dana Developer"]);
  repo.git(["config", "user.email", "dana@example.test"]);
  const worktree = linkedWorktree(t, repo, "feature");
  await configureAgentAuthorship(worktree.directory, agentIdentity("Yui"));
  return worktree;
}

const tip = (repo, format) =>
  repo.git(["log", "-1", `--format=${format}`]).trim();

test("a rebase in an agent's owned workspace adds the catalog commit as the agent, crediting the developer once", async (t) => {
  const worktree = await agentWorkspaceReplay(t);

  const rebased = await runRebase(worktree, ["rebase", "--ref", "main"]);

  assert.equal(rebased.code, 0, rebased.stdout + rebased.stderr);
  assert.equal(
    tip(worktree, "%s"),
    "Rebuild the done catalog from its record files",
  );
  assert.equal(
    tip(worktree, "%an <%ae>|%cn <%ce>"),
    `Yui-chan <yui-chan@example.org>|${developer}`,
  );
  assert.equal(
    tip(worktree, "%(trailers:key=Co-authored-by,valueonly)"),
    developer,
  );
  const committed = assertCommittedCatalogCurrent(worktree.git, "HEAD");
  assert.deepEqual(fileNames(committed), ["A_A.json", "B_B.json"]);
});

test("a rebase in an agent's owned workspace whose developer is the agent itself leaves the rebuilt catalog staged and uncommitted", async (t) => {
  const worktree = await agentWorkspaceReplay(t);
  worktree.git(["config", "--worktree", "user.email", "yui-chan@example.org"]);

  const refused = await runRebase(worktree, ["rebase", "--ref", "main"]);

  assert.equal(refused.code, 1);
  assert.match(refused.stdout, /staged but not committed/);
  assert.match(refused.stdout, /developer credit is refused/);
  assert.match(refused.stdout + refused.stderr, /agent's own/);
  assert.equal(tip(worktree, "%s"), "complete B");
  assert.equal(refSha(worktree, "HEAD^"), refSha(worktree, "main"));
  assert.equal(
    worktree.git(["diff", "--cached", "--name-only"]).trim(),
    catalog,
  );
});
