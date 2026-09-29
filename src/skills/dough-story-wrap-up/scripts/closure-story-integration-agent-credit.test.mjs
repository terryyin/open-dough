// Git mechanics (not guidance-following), not proof an agent follows guidance.
// An agent's owned workspace integrates its published Story Branch tip through
// a history-preserving merge commit that the agent authors and that credits
// the configured developer once, or refuses before commit and push when that
// developer is unusable.
import assert from "node:assert/strict";
import { test } from "node:test";
import { publishHistoryPreservingCandidate } from "../../dough-execute-plan/scripts/history-preserving-publication.mjs";
import { configureAgentAuthorship } from "../../dough-execute-plan/scripts/workspace-agent-authorship.mjs";
import { agentIdentity } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  advanceOriginFromAnotherWriter,
  createCleanTrunkFixture,
  executionBranch,
  git,
  lsRemoteSha,
  remoteCommitCount,
  revParse,
  trunkTarget,
} from "./closure-git-fixtures.mjs";

// An owned workspace whose agent authors its commits and whose configured Git
// user is the developer, with a published Story Branch tip that trunk has
// moved past, so integrating it needs a merge commit.
async function agentStoryBehindTrunk(t) {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, execution } = fixture;
  await configureAgentAuthorship(execution, agentIdentity("Yui"));
  const closureSha = await revParse(execution, "HEAD");
  await git(execution, "push", "origin", `HEAD:refs/heads/${executionBranch}`);
  const trunkBefore = await advanceOriginFromAnotherWriter(origin);
  return { ...fixture, closureSha, trunkBefore };
}

const developer = "Execution Worktree <execution@example.test>";

test("an agent's history-preserving integration merge is authored by the agent and credits the developer once", async (t) => {
  const { origin, execution, closureSha } = await agentStoryBehindTrunk(t);

  const published = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip: closureSha,
    branch: executionBranch,
  });

  assert.equal(published.classification, "published");
  assert.deepEqual(published.adapterStatuses, []);
  const merge = published.receipt.sha;
  assert.equal(await lsRemoteSha(origin, trunkTarget), merge);
  assert.equal(
    (await git(execution, "rev-parse", `${merge}^2`)).stdout.trim(),
    closureSha,
  );
  assert.equal(
    (
      await git(execution, "log", "-1", "--format=%an <%ae>|%cn <%ce>", merge)
    ).stdout.trim(),
    `Yui-chan <yui-chan@example.org>|${developer}`,
  );
  assert.equal(
    (
      await git(
        execution,
        "log",
        "-1",
        "--format=%(trailers:key=Co-authored-by,valueonly)",
        merge,
      )
    ).stdout.trim(),
    developer,
  );
});

test("an agent's integration merge is refused before commit and push when the developer is the agent itself", async (t) => {
  const { origin, execution, closureSha, trunkBefore } =
    await agentStoryBehindTrunk(t);
  await git(
    execution,
    "config",
    "--worktree",
    "user.email",
    "yui-chan@example.org",
  );
  const commitsBefore = await remoteCommitCount(origin);

  const refused = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip: closureSha,
    branch: executionBranch,
  });

  assert.equal(refused.classification, "preserved");
  assert.equal(refused.reason, "developer-identity-refused");
  assert.match(refused.error, /agent's own/);
  assert.equal(refused.pushCount, 0);
  assert.equal(refused.receipt, null);
  assert.equal(await lsRemoteSha(origin, trunkTarget), trunkBefore);
  assert.equal(await remoteCommitCount(origin), commitsBefore);
  assert.equal(
    await revParse(execution, "HEAD"),
    await revParse(execution, "origin/main"),
    "no merge commit was made",
  );
});
