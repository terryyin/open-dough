// One-shot refinement with `--auto-land` through the installed
// `preparation-assignment.mjs start` and `recheck` and the installed
// recorder, against a real bare origin, landed with the Dough Land Git model
// whose candidate check is the installed `recheck`. Only the seed and its
// recorded facts land: the story stays queued, never Taken or completed, and
// no profile or CI observer appears. A holder that appears after the start
// stops the landing with nothing pushed. In the default checkout, all of its
// content lands with the refinement and the checkout stays.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { publishExecutionIncrement } from "../../dough-execute-plan/scripts/execution-increment-publication.mjs";
import {
  commitAllAndAssertRetained,
  occupyDefaultCheckout,
  snapshot,
  worktreePaths,
} from "../../dough-execute-plan/scripts/default-checkout-test-fixtures.mjs";
import { landWorktree } from "./dough-land-test-fixtures.mjs";
import {
  oneShot,
  originRefs,
  recheck,
  recheckOnFetch,
  recordRefined,
  stateBlock,
  useInstalledPayload,
} from "./one-shot-refinement-test-fixtures.mjs";
import {
  backlogFile,
  createPreparationTrunk,
  git,
  identityC,
  lsRemoteSha,
  publishAssignment,
  refineStoryC,
  remoteChanges,
  remoteFile,
  remoteProfileNames,
  revParse,
  seedC,
} from "./preparation-assignment-test-fixtures.mjs";

useInstalledPayload();

const autoLand = ["--auto-land", "--push-authorized"];
const refinedFacts = {
  schemaVersion: 1,
  refinement: "refined",
  approach: "unselected",
};

// Starts story C's one-shot refinement with automatic landing in a new owned
// workspace and commits its recorded refinement there.
async function startAndRefine(trunk, name) {
  const workspace = join(trunk.fixture, `prep-${name}`);
  const branch = `prep/${name}`;
  const refs = await originRefs(trunk);
  const { code, receipt } = await oneShot(trunk, workspace, branch, autoLand);
  assert.equal(code, 0, JSON.stringify(receipt));
  assert.equal(receipt.landing, "auto-land");
  assert.equal(receipt.created, true);
  refineStoryC(workspace);
  await recordRefined(workspace);
  await git(workspace, "commit", "--quiet", "-am", "Refine story C");
  assert.equal(await originRefs(trunk), refs);
  return { workspace, branch, result: await revParse(workspace, "HEAD") };
}

test("an auto-landed one-shot refinement lands only its seed and facts after the ownership recheck, leaving the story queued, and retires its workspace", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const queue = await remoteFile(trunk, "main", backlogFile);
  const { workspace, branch, result } = await startAndRefine(trunk, "auto");

  const receipts = [];
  const landing = await landWorktree({
    worktree: workspace,
    branch,
    defaultCheckout: trunk.integration,
    identity: identityC,
    onFetchedTarget: recheckOnFetch(workspace, receipts),
  });
  assert.equal(landing.stopped, null, JSON.stringify(landing));
  assert.deepEqual(
    receipts.map(({ status }) => status),
    ["queued"],
  );
  const landed = await lsRemoteSha(trunk.origin, "refs/heads/main");
  assert.equal(landed, result);
  assert.deepEqual(await remoteChanges(trunk, landed), [`M\t${seedC}`]);
  assert.equal(await remoteFile(trunk, landed, backlogFile), queue);
  assert.deepEqual(await remoteProfileNames(trunk, landed), []);
  assert.deepEqual(await stateBlock(trunk.origin, landed), refinedFacts);
  assert.equal(landing.publication.observation, undefined);
  assert.equal(landing.refresh.result, "advanced");
  assert.equal(existsSync(workspace), false, JSON.stringify(landing.cleanup));
});

test("a preparation holder published after the auto-land start stops the landing with nothing pushed and the holder intact", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const { workspace, branch, result } = await startAndRefine(trunk, "held");
  await publishAssignment(trunk, "Yui", {
    identity: identityC,
    activity: "preparation",
  });
  const held = await lsRemoteSha(trunk.origin, "refs/heads/main");

  const checked = await recheck(workspace);
  assert.equal(checked.code, 1, JSON.stringify(checked.receipt));
  assert.equal(checked.receipt.status, "ownership-changed");
  assert.deepEqual(checked.receipt.ownership, {
    identity: identityC,
    agent: "Yui-chan",
    activity: "preparation",
  });

  const landing = await landWorktree({
    worktree: workspace,
    branch,
    defaultCheckout: trunk.integration,
    identity: identityC,
    onFetchedTarget: recheckOnFetch(workspace),
  });
  assert.equal(landing.stopped, "publish");
  assert.equal(landing.publication.status, "ownership-changed");
  assert.equal(landing.cleanup, "not-performed");
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), held);
  assert.deepEqual(await remoteProfileNames(trunk), [
    ".planning/agents/yui-chan.json",
  ]);
  assert.equal(await revParse(workspace, "HEAD"), result);
  assert.equal((await git(workspace, "status", "--porcelain")).stdout, "");
});

test("an auto-landed default-checkout refinement lands all checkout content with its facts and the checkout stays", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const checkout = trunk.integration;
  const queue = await remoteFile(trunk, "main", backlogFile);
  await occupyDefaultCheckout(checkout);
  const before = await snapshot(checkout, trunk.origin);

  const { code, receipt } = await oneShot(trunk, checkout, undefined, [
    "--default-main",
    ...autoLand,
  ]);
  assert.equal(code, 0, JSON.stringify(receipt));
  assert.equal(receipt.role, "default-checkout");
  assert.equal(receipt.landing, "auto-land");
  refineStoryC(checkout);
  await recordRefined(checkout);
  const result = await commitAllAndAssertRetained(
    checkout,
    trunk.origin,
    before,
    "Refine story C",
  );

  // Dough Land's publication from the default checkout, from the merge base
  // of its HEAD and fetched trunk, with the recheck as its candidate check.
  await git(checkout, "fetch", "--quiet", "origin");
  const base = (
    await git(checkout, "merge-base", "HEAD", "origin/main")
  ).stdout.trim();
  assert.equal(base, trunk.trunkSha);
  const receipts = [];
  const published = await publishExecutionIncrement({
    workspace: checkout,
    branch: "main",
    previouslyPublishedBase: base,
    targetRef: "refs/heads/main",
    validate: () => true,
    onFetchedTarget: recheckOnFetch(checkout, receipts),
  });
  assert.equal(published.ok, true, JSON.stringify(published));
  assert.equal(published.receipt.sha, result);
  assert.deepEqual(
    receipts.map(({ status }) => status),
    ["queued"],
  );
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), result);
  const show = async (path) =>
    (await git(trunk.origin, "show", `${result}:${path}`)).stdout;
  assert.equal(await show("staged.txt"), "staged edit\n");
  assert.equal(await show("edited.txt"), "unstaged edit\n");
  assert.equal(await show("untracked.txt"), "untracked\n");
  await assert.rejects(show("deleted.txt"));
  assert.deepEqual(await stateBlock(trunk.origin, result), refinedFacts);
  assert.equal(await remoteFile(trunk, result, backlogFile), queue);
  assert.deepEqual(await remoteProfileNames(trunk, result), []);
  assert.equal(await revParse(checkout, "HEAD"), result);
  assert.deepEqual(await worktreePaths(checkout), before.worktrees);
});
