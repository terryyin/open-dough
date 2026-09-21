// Git mechanics (not guidance-following): bug remaining-work retention removes
// only disposable reproduction files, keeps the canonical backlog record and
// unrelated exploration content, then uses preparation's disposition. An
// explicit keep publishes from the owned workspace. A local draft stays
// unpublished and the result states the pending disposition. Session-created
// versus reused ownership is unchanged. Native agent evidence is not this file.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  assertCheckoutUnchanged,
  assertRemoteCandidate,
  captureCheckout,
  git,
  lsRemoteSha,
  plantHumanEdit,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  cloneFile,
  closeOrRetainWorkspace,
  createPreparationFixture,
  worktreeCount,
} from "../../dough-story-refinement/scripts/preparation-publication-test-fixtures.mjs";
import { retainBugTriageArtifacts } from "./retained-artifacts.mjs";

const durablePath = ".planning/PRODUCT-BACKLOG.md";
const durableBody =
  "# Product backlog\n\n## Backlog list\n\n- [ ] SEED-009#reported-mismatch\n";
const disposablePath = "repro/temporary-reproduction.test.mjs";
const unrelatedPath = "unrelated-exploration.md";
const unrelatedBody = "unrelated exploration content\n";

function plantInvestigation(workspace, { unrelated = false } = {}) {
  mkdirSync(join(workspace, ".planning"), { recursive: true });
  mkdirSync(join(workspace, "repro"), { recursive: true });
  writeFileSync(join(workspace, durablePath), durableBody);
  writeFileSync(join(workspace, disposablePath), "throw new Error('repro')\n");
  if (unrelated) writeFileSync(join(workspace, unrelatedPath), unrelatedBody);
}

async function addUnrelatedExploration(integration, fixture, trunkSha) {
  const path = join(fixture, "other-exploration");
  await git(
    integration,
    "worktree",
    "add",
    path,
    "-b",
    "explore/unrelated",
    trunkSha,
  );
  writeFileSync(join(path, "other-exploration.md"), "not this session\n");
  return path;
}

function retain(workspace, { keep = false } = {}) {
  return retainBugTriageArtifacts({
    workspace,
    disposablePaths: [disposablePath],
    durablePath,
    keep,
  });
}

test("remaining work leaves the backlog record, removes only the disposable reproduction, and keeps unrelated exploration content", async (t) => {
  const { preparation, cleanup } = await createPreparationFixture(
    "bug-retained-artifacts-",
  );
  t.after(cleanup);

  plantInvestigation(preparation, { unrelated: true });
  await retain(preparation);

  assert.equal(
    readFileSync(join(preparation, durablePath), "utf8"),
    durableBody,
  );
  assert.equal(existsSync(join(preparation, disposablePath)), false);
  assert.equal(
    readFileSync(join(preparation, unrelatedPath), "utf8"),
    unrelatedBody,
  );
  const status = (await git(preparation, "status", "--porcelain")).stdout;
  assert.match(status, /\.planning\//);
  assert.match(status, /unrelated-exploration\.md/);
  assert.doesNotMatch(status, /temporary-reproduction/);
});

test("an explicit keep publishes the retained backlog record from the owned workspace while a human edit and an unrelated exploration workspace stay", async (t) => {
  const {
    origin,
    integration,
    preparation,
    preparationBranch,
    trunkSha,
    fixture,
    cleanup,
  } = await createPreparationFixture("bug-retained-artifacts-");
  t.after(cleanup);

  plantInvestigation(preparation);
  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);
  const worktreesBefore = await worktreeCount(integration);
  const unrelated = await addUnrelatedExploration(
    integration,
    fixture,
    trunkSha,
  );

  const retained = await retain(preparation, { keep: true });
  assert.equal(retained.disposition, "retained");
  assert.equal(retained.published, true);
  assert.equal(existsSync(join(preparation, disposablePath)), false);
  assert.equal(
    (
      await git(
        preparation,
        "diff-tree",
        "--no-commit-id",
        "--name-only",
        "-r",
        retained.sha,
      )
    ).stdout.trim(),
    durablePath,
  );
  assert.equal((await git(preparation, "status", "--porcelain")).stdout, "");

  await assertRemoteCandidate(origin, retained.sha);
  assert.equal(await cloneFile(origin, durablePath), durableBody);
  const remoteTree = (
    await git(origin, "ls-tree", "-r", "--name-only", "refs/heads/main")
  ).stdout;
  assert.match(remoteTree, /\.planning\/PRODUCT-BACKLOG\.md/);
  assert.equal(remoteTree.includes(disposablePath), false);
  assert.equal(remoteTree.includes("human-staged.txt"), false);
  assert.equal(remoteTree.includes("other-exploration.md"), false);
  assert.equal(await revParse(integration, "HEAD"), trunkSha);
  assert.equal(await revParse(preparation, preparationBranch), retained.sha);
  assertCheckoutUnchanged(before, await captureCheckout(integration));

  const resources = await closeOrRetainWorkspace({
    integration,
    preparation,
    preparationBranch,
    confirmedDisposition: true,
    sessionCreated: true,
  });
  assert.equal(resources.removed, true);
  assert.equal(existsSync(preparation), false);
  assert.equal(existsSync(unrelated), true);
  assert.equal(
    readFileSync(join(unrelated, "other-exploration.md"), "utf8"),
    "not this session\n",
  );
  assert.equal(await revParse(unrelated, "HEAD"), trunkSha);
  const listed = (await git(integration, "worktree", "list", "--porcelain"))
    .stdout;
  assert.match(listed, /other-exploration/);
  assert.equal(listed.includes(preparation), false);
  assert.equal(await worktreeCount(integration), worktreesBefore);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
  await assertRemoteCandidate(origin, retained.sha);
});

test("a local draft that is not explicitly retained stays in the workspace, stays off the remote, and states the pending disposition", async (t) => {
  const {
    origin,
    integration,
    preparation,
    preparationBranch,
    trunkSha,
    preparationSha,
    cleanup,
  } = await createPreparationFixture("bug-retained-artifacts-");
  t.after(cleanup);

  plantInvestigation(preparation, { unrelated: true });
  const result = await retain(preparation);

  assert.equal(result.disposition, "pending");
  assert.equal(result.published, false);
  assert.match(result.detail, /pending disposition/);
  assert.equal(
    readFileSync(join(preparation, durablePath), "utf8"),
    durableBody,
  );
  assert.equal(existsSync(join(preparation, disposablePath)), false);
  assert.equal(
    readFileSync(join(preparation, unrelatedPath), "utf8"),
    unrelatedBody,
  );
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), trunkSha);
  assert.equal(await revParse(preparation, preparationBranch), preparationSha);
  assert.equal(await revParse(integration, "HEAD"), trunkSha);
  const remoteTree = (
    await git(origin, "ls-tree", "-r", "--name-only", "refs/heads/main")
  ).stdout;
  assert.equal(remoteTree.includes(durablePath), false);

  const resources = await closeOrRetainWorkspace({
    integration,
    preparation,
    preparationBranch,
    confirmedDisposition: false,
    sessionCreated: true,
  });
  assert.equal(resources.removed, false);
  assert.match(resources.reason, /no confirmed disposition/);
  assert.equal(existsSync(preparation), true);
  assert.equal(
    readFileSync(join(preparation, durablePath), "utf8"),
    durableBody,
  );
});

test("a reused workspace is not removed and an unrelated exploration workspace is not this session's", async (t) => {
  const {
    origin,
    integration,
    preparation,
    preparationBranch,
    trunkSha,
    fixture,
    cleanup,
  } = await createPreparationFixture("bug-retained-artifacts-");
  t.after(cleanup);

  plantInvestigation(preparation);
  const unrelated = await addUnrelatedExploration(
    integration,
    fixture,
    trunkSha,
  );
  const retained = await retain(preparation, { keep: true });
  await assertRemoteCandidate(origin, retained.sha);

  const resources = await closeOrRetainWorkspace({
    integration,
    preparation,
    preparationBranch,
    confirmedDisposition: true,
    sessionCreated: false,
  });
  assert.equal(resources.removed, false);
  assert.match(resources.reason, /reused or host-owned/);
  assert.equal(existsSync(preparation), true);
  assert.equal(await revParse(preparation, preparationBranch), retained.sha);
  assert.equal(existsSync(unrelated), true);
  assert.equal(
    readFileSync(join(unrelated, "other-exploration.md"), "utf8"),
    "not this session\n",
  );
  assert.equal(await revParse(unrelated, "HEAD"), trunkSha);
  const listed = (await git(integration, "worktree", "list", "--porcelain"))
    .stdout;
  assert.match(listed, /other-exploration/);
  assert.match(listed, new RegExp(preparation));
});
