// A conflicted Story Branch integration, kept with the integration entry: the
// merge is preserved as Git left it, and the commit that resolves it is the
// candidate the next run publishes.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { publishHistoryPreservingCandidate } from "../../dough-execute-plan/scripts/history-preserving-publication.mjs";
import {
  advanceOriginBacklog,
  backlogPath,
} from "../../dough-execute-plan/scripts/publication-racing-suffix-fixtures.mjs";
import { backlogOf } from "../../../../tests/support/product-backlog-fixture.mjs";
import {
  advanceOriginFromAnotherWriter,
  commitFile,
  createCleanTrunkFixture,
  executionBranch,
  git,
  lsRemoteSha,
  publishStoryConflictingWithTrunk,
  revParse,
  stageSharedResolution,
  trunkTarget,
} from "./closure-git-fixtures.mjs";

const cli = fileURLToPath(
  new URL(
    "../../dough-execute-plan/scripts/history-preserving-publication.mjs",
    import.meta.url,
  ),
);

const mergeAdapter = fileURLToPath(
  new URL(
    "../../dough-product-backlog/scripts/product-backlog-git-merge.mjs",
    import.meta.url,
  ),
);
const titled = (title) => backlogOf([], [`- [${title}](seeds/C.md#c)`]);

// A script's exit code and what it printed.
const run = (script, ...args) =>
  new Promise((resolve) => {
    execFile(process.execPath, [script, ...args], (error, stdout, stderr) => {
      resolve({ code: error?.code ?? 0, stdout, stderr });
    });
  });

// The installed integration command.
function integrateCommand(workspace, publishedTip) {
  const args = ["integrate", "--workspace", workspace];
  args.push("--published-tip", publishedTip, "--branch", executionBranch);
  return run(cli, ...args);
}

const status = async (workspace) =>
  (await git(workspace, "status", "--porcelain")).stdout;

test("a conflicted integration is preserved as Git left it, and its resolved merge commit is published as the candidate", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, execution } = fixture;
  const { closureSha, trunkSha } = await publishStoryConflictingWithTrunk(
    origin,
    execution,
  );
  const prepared = [];
  const registered = [];
  const publish = () =>
    publishHistoryPreservingCandidate({
      ownedWorkspace: execution,
      publishedTip: closureSha,
      branch: executionBranch,
      beforePush: (comparison) => prepared.push(comparison),
      register: (receipt) => registered.push(receipt),
    });
  // The merge stopped on `base`, unresolved, with nothing pushed.
  const assertConflictLeftOn = async (base) => {
    assert.equal(await revParse(execution, "HEAD"), base);
    assert.equal(await revParse(execution, "MERGE_HEAD"), closureSha);
    assert.equal(await status(execution), "A  increment.txt\nAA shared.txt\n");
    assert.equal((await git(execution, "branch", "--show-current")).stdout, "");
    assert.equal(await lsRemoteSha(origin, trunkTarget), base);
    assert.deepEqual(prepared, []);
  };
  const resolve = async (body) => {
    await stageSharedResolution(execution, body);
    await git(execution, "commit", "--no-edit");
    return revParse(execution, "HEAD");
  };

  const stopped = await integrateCommand(execution, closureSha);
  assert.equal(stopped.code, 1, stopped.stderr);
  assert.deepEqual(JSON.parse(stopped.stdout), {
    classification: "preserved",
    reason: "conflict",
    conflictedPaths: ["shared.txt"],
    mergeCount: 1,
    pushCount: 0,
    rejectedPushCount: 0,
    supersededSha: null,
    adapterStatuses: [],
    receipt: null,
  });
  await assertConflictLeftOn(trunkSha);

  // Run again before it is resolved, the same conflict is reported in place.
  const unresolved = await publish();
  assert.equal(unresolved.classification, "preserved");
  assert.deepEqual(unresolved.conflictedPaths, ["shared.txt"]);
  await assertConflictLeftOn(trunkSha);

  // Trunk moves after the resolution: that merge no longer joins the fetched
  // tip, so the merge is computed again and stops on the same conflict.
  const outdated = await resolve("outdated resolution\n");
  const movedSha = await advanceOriginFromAnotherWriter(origin);
  const recomputed = await publish();
  assert.equal(recomputed.classification, "preserved");
  assert.equal(recomputed.reason, "conflict");
  assert.deepEqual(recomputed.conflictedPaths, ["shared.txt"]);
  await assertConflictLeftOn(movedSha);

  const resolved = await resolve("story and trunk\n");
  const published = await publish();
  assert.equal(published.classification, "published");
  assert.equal(published.mergeCount, 0);
  assert.equal(published.pushCount, 1);
  assert.equal(published.rejectedPushCount, 0);
  assert.deepEqual(published.receipt, { sha: resolved, target: trunkTarget });
  assert.equal(published.acceptedSha, resolved);
  assert.deepEqual(prepared, [
    { attempt: 0, candidate: resolved, suffixBase: movedSha },
  ]);
  assert.deepEqual(registered, [published.receipt]);
  assert.equal(await lsRemoteSha(origin, trunkTarget), resolved);
  assert.notEqual(resolved, outdated);
  assert.equal(
    (await git(execution, "rev-parse", `${resolved}^@`)).stdout,
    `${movedSha}\n${closureSha}\n`,
  );
  assert.equal(
    (await git(origin, "show", `${trunkTarget}:shared.txt`)).stdout,
    "story and trunk\n",
  );
  assert.equal(
    (await git(execution, "branch", "--show-current")).stdout.trim(),
    executionBranch,
  );
  assert.equal(await status(execution), "");
});

test("a backlog conflict the merge adapter stops on is published once its `continue` commits the resolution", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, execution } = fixture;
  await advanceOriginBacklog(origin, titled("Item C"), "ancestor backlog");
  await git(execution, "fetch", "origin");
  await git(execution, "rebase", "origin/main");
  const closureSha = await commitFile(
    execution,
    backlogPath,
    titled("Item C, story"),
    "story closure",
  );
  await git(execution, "push", "origin", `HEAD:refs/heads/${executionBranch}`);
  const trunkSha = await advanceOriginBacklog(
    origin,
    titled("Item C, trunk"),
    "sibling backlog",
  );
  const prepared = [];
  const publish = () =>
    publishHistoryPreservingCandidate({
      ownedWorkspace: execution,
      publishedTip: closureSha,
      branch: executionBranch,
      beforePush: (comparison) => prepared.push(comparison),
    });

  const stopped = await publish();
  assert.equal(stopped.classification, "preserved");
  assert.equal(stopped.reason, "conflict");
  assert.deepEqual(stopped.conflictedPaths, [backlogPath]);
  assert.equal(stopped.adapterStatuses.length, 1);
  assert.match(stopped.adapterStatuses[0], /is left unresolved after merging/);
  assert.match(stopped.adapterStatuses[0], /give it different titles/);
  assert.equal(stopped.pushCount, 0);
  assert.equal(await revParse(execution, "HEAD"), trunkSha);
  assert.equal(await revParse(execution, "MERGE_HEAD"), closureSha);
  assert.equal(await lsRemoteSha(origin, trunkTarget), trunkSha);

  const decided = titled("Item C, resolved by hand");
  writeFileSync(join(execution, backlogPath), decided);
  await git(execution, "add", backlogPath);
  const continued = await run(mergeAdapter, "continue", "--cwd", execution);
  assert.equal(continued.code, 0, continued.stdout + continued.stderr);
  const resolved = await revParse(execution, "HEAD");
  assert.deepEqual(prepared, []);

  const published = await publish();
  assert.equal(published.classification, "published");
  assert.deepEqual(published.adapterStatuses, []);
  assert.deepEqual(published.receipt, { sha: resolved, target: trunkTarget });
  assert.deepEqual(prepared, [
    { attempt: 0, candidate: resolved, suffixBase: trunkSha },
  ]);
  assert.equal(await lsRemoteSha(origin, trunkTarget), resolved);
  assert.equal(
    (await git(execution, "rev-parse", `${resolved}^@`)).stdout,
    `${trunkSha}\n${closureSha}\n`,
  );
  assert.equal(
    (await git(origin, "show", `${trunkTarget}:${backlogPath}`)).stdout,
    decided,
  );
  assert.equal(
    (await git(execution, "branch", "--show-current")).stdout.trim(),
    executionBranch,
  );
});
