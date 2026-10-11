// An integration merge in progress with nothing unmerged, kept with the
// integration entry: the command answers `preserved` and leaves the merge as
// it found it, and the commit the agent then makes is the candidate the next
// run publishes.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agentStoryBehindTrunk,
  createCleanTrunkFixture,
  currentBranch,
  executionBranch,
  git,
  integrateCommand,
  lsRemoteSha,
  porcelainStatus,
  publishStoryConflictingWithTrunk,
  revParse,
  stageSharedResolution,
  trunkTarget,
} from "./closure-git-fixtures.mjs";

// What a run must leave alone: the merge in progress, its index, and `HEAD`.
const mergeState = async (workspace) => ({
  head: await revParse(workspace, "HEAD"),
  mergeHead: await revParse(workspace, "MERGE_HEAD"),
  index: (await git(workspace, "write-tree")).stdout,
  status: await porcelainStatus(workspace),
  branch: await currentBranch(workspace),
});

// The run answers the uncommitted merge and changes nothing; once that merge
// is committed, the next run publishes the commit onto `trunkSha`.
async function assertPreservedThenPublished(
  { origin, execution },
  { closureSha, trunkSha },
) {
  const before = await mergeState(execution);
  assert.equal(before.mergeHead, closureSha);

  const preserved = await integrateCommand(execution, closureSha);
  assert.equal(preserved.code, 1, preserved.stderr);
  const result = JSON.parse(preserved.stdout);
  assert.equal(result.classification, "preserved");
  assert.equal(result.reason, "uncommitted-merge");
  assert.equal("conflictedPaths" in result, false);
  assert.equal(result.mergeCount, 0);
  assert.equal(result.pushCount, 0);
  assert.equal(result.receipt, null);
  assert.deepEqual(await mergeState(execution), before);
  assert.equal(await lsRemoteSha(origin, trunkTarget), trunkSha);

  await git(execution, "commit", "--no-edit");
  const committed = await revParse(execution, "HEAD");
  const published = await integrateCommand(execution, closureSha);
  assert.equal(published.code, 0, published.stderr);
  const accepted = JSON.parse(published.stdout);
  assert.equal(accepted.classification, "published");
  assert.deepEqual(accepted.receipt, { sha: committed, target: trunkTarget });
  assert.equal(await lsRemoteSha(origin, trunkTarget), committed);
  assert.equal(
    (await git(execution, "rev-parse", `${committed}^@`)).stdout,
    `${trunkSha}\n${closureSha}\n`,
  );
  assert.equal(await currentBranch(execution), executionBranch);
  assert.equal(await porcelainStatus(execution), "");
}

test("a conflicted integration resolved and staged but not committed is preserved untouched, and its commit is published by the next run", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, execution } = fixture;
  const story = await publishStoryConflictingWithTrunk(origin, execution);
  const stopped = await integrateCommand(execution, story.closureSha);
  assert.equal(JSON.parse(stopped.stdout).reason, "conflict");
  await stageSharedResolution(execution, "story and trunk\n");
  assert.equal(
    await porcelainStatus(execution),
    "A  increment.txt\nM  shared.txt\n",
  );

  await assertPreservedThenPublished(fixture, story);
  assert.equal(
    (await git(origin, "show", `${trunkTarget}:shared.txt`)).stdout,
    "story and trunk\n",
  );
});

test("a merge an identity refusal left in progress is preserved untouched, and its commit is published by the next run", async (t) => {
  const fixture = await agentStoryBehindTrunk(t);
  const { execution, closureSha, trunkBefore } = fixture;
  const developerEmail = (
    await git(execution, "config", "user.email")
  ).stdout.trim();
  const setEmail = (email) =>
    git(execution, "config", "--worktree", "user.email", email);
  await setEmail("yui-chan@example.org");
  const refused = await integrateCommand(execution, closureSha);
  assert.equal(refused.code, 1, refused.stderr);
  assert.equal(JSON.parse(refused.stdout).reason, "developer-identity-refused");
  await setEmail(developerEmail);

  await assertPreservedThenPublished(fixture, {
    closureSha,
    trunkSha: trunkBefore,
  });
});
