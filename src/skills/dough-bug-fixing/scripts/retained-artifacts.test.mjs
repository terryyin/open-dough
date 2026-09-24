// Git mechanics (not guidance-following): bug remaining-work retention removes
// only disposable reproduction files, keeps the canonical backlog record and
// unrelated exploration content, then uses preparation's disposition. An
// explicit keep lands the owned workspace through Dough Land. A local draft
// stays unpublished and the result states the pending disposition. Native
// agent evidence is not this file.
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
  closeOrRetainWorkspace,
  landWorktree,
} from "../../dough-story-refinement/scripts/dough-land-test-fixtures.mjs";
import {
  cloneFile,
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

function retain(workspace) {
  return retainBugTriageArtifacts({
    workspace,
    disposablePaths: [disposablePath],
    durablePath,
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

test("an explicit keep lands the retained backlog record from the owned workspace while a human edit and an unrelated exploration workspace stay", async (t) => {
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

  await retain(preparation);
  const landed = await landWorktree({
    worktree: preparation,
    branch: preparationBranch,
    defaultCheckout: integration,
    message: "Retain the bug-triage record",
  });

  assert.equal(landed.stopped, null);
  await assertRemoteCandidate(origin, landed.publication.receipt.sha);
  assert.equal(await cloneFile(origin, durablePath), durableBody);
  const remoteTree = (
    await git(origin, "ls-tree", "-r", "--name-only", "refs/heads/main")
  ).stdout;
  assert.equal(remoteTree.includes(disposablePath), false);
  assert.equal(remoteTree.includes("human-staged.txt"), false);
  assert.equal(remoteTree.includes("other-exploration.md"), false);
  assert.equal(landed.refresh.result, "deferred");
  assertCheckoutUnchanged(before, await captureCheckout(integration));

  assert.equal(landed.cleanup.removed, true);
  assert.equal(existsSync(preparation), false);
  assert.equal(
    readFileSync(join(unrelated, "other-exploration.md"), "utf8"),
    "not this session\n",
  );
  assert.equal(await revParse(unrelated, "HEAD"), trunkSha);
  assert.equal(await worktreeCount(integration), worktreesBefore);
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
