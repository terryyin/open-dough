// Wrap-up's Story Branch cleanup through Dough Land's installed `retire`
// command, run as a child process the way the agent runs it once the integrated
// SHA has a completion receipt with confirmed shutdown. The remote execution
// branch is deleted only after its tip and the integrated SHA are on remote
// trunk. Trunk Mode callers omit --remote-branch.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { notCreatedForWork } from "../../dough-land/scripts/worktree-retirement.mjs";
import { publishHistoryPreservingCandidate } from "../../dough-execute-plan/scripts/history-preserving-publication.mjs";
import {
  advanceOriginBacklog,
  backlogPath,
  itemA,
  itemB,
  itemC,
} from "../../dough-execute-plan/scripts/publication-racing-suffix-fixtures.mjs";
import { runRetirementCommand } from "../../dough-story-refinement/scripts/dough-land-test-fixtures.mjs";
import { backlogOf } from "../../../../tests/support/product-backlog-fixture.mjs";
import {
  ancestorOf,
  assertCheckoutUnchanged,
  captureCheckout,
  createCleanTrunkFixture,
  executionBranch,
  git,
  lsRemoteSha,
  plantHumanEdit,
  remoteCommitCount,
  revParse,
  trunkTarget,
} from "./closure-git-fixtures.mjs";

const ancestorBacklog = backlogOf([itemA, itemB], [itemC]);
const storyBacklog = backlogOf([itemB], [itemC]);
const siblingBacklog = backlogOf([itemA], [itemC]);

async function writeBacklog(workspace, body) {
  mkdirSync(join(workspace, ".planning"), { recursive: true });
  writeFileSync(join(workspace, backlogPath), body);
}

test("retire removes the worktree, local branch, and remote execution branch once trunk contains the integrated SHA", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;

  await writeBacklog(integration, ancestorBacklog);
  await git(integration, "add", backlogPath);
  await git(integration, "commit", "-m", "ancestor backlog");
  await git(integration, "push", "origin", "main");
  await git(execution, "rebase", "origin/main");
  await writeBacklog(execution, storyBacklog);
  writeFileSync(join(execution, "closure.txt"), "story closure\n");
  await git(execution, "add", backlogPath, "closure.txt");
  await git(execution, "commit", "-m", "story closure");
  const closureSha = await revParse(execution, "HEAD");
  await git(execution, "push", "origin", `HEAD:refs/heads/${executionBranch}`);

  await advanceOriginBacklog(origin, siblingBacklog, "sibling backlog");
  writeFileSync(join(integration, "unrelated.txt"), "unrelated checkout\n");
  await git(integration, "add", "unrelated.txt");
  await git(integration, "commit", "-m", "unrelated integration commit");
  await plantHumanEdit(integration);
  const integrationBefore = await captureCheckout(integration);

  const published = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip: closureSha,
    branch: executionBranch,
    register: () => {},
  });
  assert.equal(published.classification, "published");
  assert.equal(published.mergeCount, 1);
  assert.equal(published.pushCount, 1);
  assert.notEqual(published.receipt.sha, closureSha);
  assert.equal(published.receipt.sha, await lsRemoteSha(origin, trunkTarget));
  assert.equal(await ancestorOf(execution, closureSha, "origin/main"), true);
  assert.equal(
    await lsRemoteSha(origin, `refs/heads/${executionBranch}`),
    closureSha,
  );
  const commitsAfter = await remoteCommitCount(origin);
  assertCheckoutUnchanged(
    integrationBefore,
    await captureCheckout(integration),
  );

  const retire = (ownership = { createdForWork: true }) =>
    runRetirementCommand({
      repository: integration,
      worktree: execution,
      branch: executionBranch,
      remoteBranch: executionBranch,
      contained: [published.receipt.sha],
      ...ownership,
    });
  const other = join(fixture.fixture, "other");
  await git(integration, "worktree", "add", "-b", "other/task", other, "HEAD");
  writeFileSync(join(other, "other.txt"), "other workspace\n");
  const unrecorded = await retire({});
  assert.equal(unrecorded.code, 1);
  assert.equal(unrecorded.result.reason, notCreatedForWork);
  assert.equal(unrecorded.result.remoteBranch, "preserved");
  assert.equal(existsSync(execution), true);
  assert.equal(
    await lsRemoteSha(origin, `refs/heads/${executionBranch}`),
    closureSha,
  );

  const removed = await retire();
  assert.equal(removed.code, 0, JSON.stringify(removed.result));
  assert.equal(removed.result.ok, true);
  assert.equal(removed.result.worktree, "removed");
  assert.equal(removed.result.branch, "removed");
  assert.equal(removed.result.remoteBranch, "removed");
  assert.equal(existsSync(execution), false);
  await assert.rejects(
    git(integration, "show-ref", "--verify", `refs/heads/${executionBranch}`),
  );
  assert.equal(await lsRemoteSha(origin, `refs/heads/${executionBranch}`), "");
  assert.equal(await remoteCommitCount(origin), commitsAfter);
  assert.equal(await lsRemoteSha(origin, trunkTarget), published.receipt.sha);
  assert.equal(
    readFileSync(join(other, "other.txt"), "utf8"),
    "other workspace\n",
  );
  assert.equal(
    (await git(other, "branch", "--show-current")).stdout.trim(),
    "other/task",
  );
  assertCheckoutUnchanged(
    integrationBefore,
    await captureCheckout(integration),
  );

  const rerun = await retire({});
  assert.equal(rerun.code, 0, JSON.stringify(rerun.result));
  assert.equal(rerun.result.worktree, "already-absent");
  assert.equal(rerun.result.branch, "already-absent");
  assert.equal(rerun.result.remoteBranch, "already-absent");
  assert.equal(await remoteCommitCount(origin), commitsAfter);
});

test("a remote execution tip trunk does not contain keeps the worktree, local branch, and remote branch", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;
  const storyTip = await revParse(execution, "HEAD");
  await git(execution, "push", "origin", `HEAD:refs/heads/${executionBranch}`);
  const trunkTip = await lsRemoteSha(origin, trunkTarget);
  const kept = await runRetirementCommand({
    repository: integration,
    worktree: execution,
    branch: executionBranch,
    createdForWork: true,
    remoteBranch: executionBranch,
    contained: [trunkTip],
  });
  assert.equal(kept.code, 1);
  assert.equal(kept.result.ok, false);
  assert.equal(kept.result.reason, "remote execution tip is not integrated");
  assert.equal(kept.result.remoteBranch, "preserved");
  assert.equal(existsSync(execution), true);
  assert.equal(await revParse(execution, "HEAD"), storyTip);
  assert.equal(await revParse(integration, executionBranch), storyTip);
  assert.equal(
    await lsRemoteSha(origin, `refs/heads/${executionBranch}`),
    storyTip,
  );
  assert.equal(await ancestorOf(execution, storyTip, "origin/main"), false);
  assert.equal((await git(execution, "status", "--porcelain")).stdout, "");
});

test("the target branch itself is never deleted as the remote branch", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;
  await git(execution, "push", "-q", "origin", `${executionBranch}:main`);
  const trunkTip = await lsRemoteSha(origin, trunkTarget);
  const refused = await runRetirementCommand({
    repository: integration,
    worktree: execution,
    branch: executionBranch,
    createdForWork: true,
    remoteBranch: "main",
  });
  assert.equal(refused.code, 1);
  assert.equal(refused.result.reason, "remote branch is the target");
  assert.equal(existsSync(execution), true);
  assert.equal(await lsRemoteSha(origin, trunkTarget), trunkTip);
});
